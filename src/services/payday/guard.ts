import { PaydayConfig, BypassReason, PaydayExecutionLog } from '@/types/payday';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { initialPaydayConfig } from '@/lib/mock-data/payday-routes';

export interface GuardEvaluationResult {
  allowed: boolean;
  bypassReason: BypassReason | null;
  config: PaydayConfig;
  inflowAmount: number;
  narration?: string;
  receivingBank?: string;
}

// In-memory fallback configuration state for offline/demo operation
let memoryConfig: PaydayConfig = { ...initialPaydayConfig };

export function getMemoryConfig(): PaydayConfig {
  return memoryConfig;
}

export function updateMemoryConfig(updater: Partial<PaydayConfig>): PaydayConfig {
  memoryConfig = {
    ...memoryConfig,
    ...updater,
    updatedAt: new Date().toISOString(),
  };
  return memoryConfig;
}

/**
 * PaydayGuard Middleware
 * Evaluates whether an incoming credit alert should proceed to split execution
 * or be safely bypassed according to user lifecycle state machine.
 */
export async function evaluatePaydayInflowGuard(
  userId: string,
  inflowAmount: number,
  narration: string = 'SALARY INFLOW',
  receivingBank: string = 'Primary Bank Node'
): Promise<GuardEvaluationResult> {
  let config: PaydayConfig;

  if (isDatabaseConfigured()) {
    const dbConfig = await prisma.paydayConfig.findUnique({
      where: { userId },
      include: { rules: { orderBy: { priority: 'asc' } } },
    });

    if (dbConfig) {
      config = {
        id: dbConfig.id,
        userId: dbConfig.userId,
        status: dbConfig.status as PaydayConfig['status'],
        skipNextInflow: dbConfig.skipNextInflow,
        pausedAt: dbConfig.pausedAt ? dbConfig.pausedAt.toISOString() : null,
        pauseReason: dbConfig.pauseReason,
        senderKeywords: dbConfig.senderKeywords.split(','),
        expectedAmount: dbConfig.expectedAmount,
        rules: dbConfig.rules.map((r) => ({
          id: r.id,
          paydayConfigId: r.paydayConfigId,
          name: r.name,
          targetVaultId: r.targetVaultId,
          targetVaultName: r.targetVaultName,
          type: r.type as 'PERCENTAGE' | 'FIXED_AMOUNT',
          value: r.value,
          priority: r.priority,
          autoCardTopup: r.autoCardTopup,
          autoBillPay: r.autoBillPay,
          isPaused: r.isPaused,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        createdAt: dbConfig.createdAt.toISOString(),
        updatedAt: dbConfig.updatedAt.toISOString(),
      };
    } else {
      config = memoryConfig;
    }
  } else {
    config = memoryConfig;
  }

  // 1. Inactive State Check
  if (config.status === 'INACTIVE') {
    await recordBypassLog(config.id, inflowAmount, 'CONFIG_INACTIVE', narration, receivingBank);
    return {
      allowed: false,
      bypassReason: 'CONFIG_INACTIVE',
      config,
      inflowAmount,
      narration,
      receivingBank,
    };
  }

  // 2. Paused State Check
  if (config.status === 'PAUSED') {
    await recordBypassLog(config.id, inflowAmount, 'USER_PAUSED', narration, receivingBank);
    return {
      allowed: false,
      bypassReason: 'USER_PAUSED',
      config,
      inflowAmount,
      narration,
      receivingBank,
    };
  }

  // 3. Skip Next Inflow Check (Single-Cycle Emergency Bypass)
  if (config.skipNextInflow) {
    // Atomically reset skipNextInflow to false so normal routing re-arms for the subsequent cycle
    if (isDatabaseConfigured()) {
      await prisma.paydayConfig.update({
        where: { id: config.id },
        data: { skipNextInflow: false },
      });
    }
    updateMemoryConfig({ skipNextInflow: false });
    config.skipNextInflow = false;

    await recordBypassLog(config.id, inflowAmount, 'USER_SKIPPED_NEXT', narration, receivingBank);
    return {
      allowed: false,
      bypassReason: 'USER_SKIPPED_NEXT',
      config,
      inflowAmount,
      narration,
      receivingBank,
    };
  }

  // 4. Threshold & Keyword Evaluation
  const keywords = config.senderKeywords.map((k) => k.trim().toUpperCase());
  const upperNarration = narration.toUpperCase();
  const matchesKeyword = keywords.some((kw) => upperNarration.includes(kw));

  // If narration is set but does not match any keyword and expected amount is configured
  if (config.expectedAmount && inflowAmount < config.expectedAmount * 0.4 && !matchesKeyword) {
    await recordBypassLog(config.id, inflowAmount, 'INSUFFICIENT_FUNDS', narration, receivingBank);
    return {
      allowed: false,
      bypassReason: 'INSUFFICIENT_FUNDS',
      config,
      inflowAmount,
      narration,
      receivingBank,
    };
  }

  return {
    allowed: true,
    bypassReason: null,
    config,
    inflowAmount,
    narration,
    receivingBank,
  };
}

async function recordBypassLog(
  configId: string,
  inflowAmount: number,
  reason: BypassReason,
  narration: string,
  receivingBank: string
): Promise<void> {
  const breakdown = {
    inflowAmount,
    receivingBank,
    narration,
    totalAllocated: 0,
    residualSaved: 0,
    vatLevy: 0,
    emtlFee: 0,
    receipts: [],
    note: `Automated split bypassed: ${reason}. Inflow preserved 100% in receiving node.`,
  };

  if (isDatabaseConfigured()) {
    try {
      await prisma.paydayExecutionLog.create({
        data: {
          paydayConfigId: configId,
          inflowAmount,
          status: 'BYPASSED',
          bypassReason: reason,
          breakdown: JSON.stringify(breakdown),
        },
      });
    } catch (e) {
      console.error('[PaydayGuard] Failed to record DB bypass log:', e);
    }
  }
}
