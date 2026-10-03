import { 
  PaydayConfig, 
  PaydaySplitRule, 
  PaydayExecutionBreakdown, 
  PaydayExecutionReceipt, 
  PaydayExecutionLog 
} from '@/types/payday';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { initialPaydayExecutionLogs } from '@/lib/mock-data/payday-routes';

// In-memory logs store for offline/demo operation
let memoryExecutionLogs: PaydayExecutionLog[] = [...initialPaydayExecutionLogs];

export function getMemoryExecutionLogs(): PaydayExecutionLog[] {
  return memoryExecutionLogs;
}

export function addMemoryExecutionLog(log: PaydayExecutionLog): void {
  memoryExecutionLogs = [log, ...memoryExecutionLogs];
}

/**
 * Validates that total percentage allocation does not exceed 100%
 */
export function validateSplitRules(rules: PaydaySplitRule[]): { valid: boolean; totalPercentage: number; error?: string } {
  const activePercentageRules = rules.filter((r) => r.type === 'PERCENTAGE' && !r.isPaused);
  const totalPercentage = activePercentageRules.reduce((sum, r) => sum + r.value, 0);

  if (totalPercentage > 100) {
    return {
      valid: false,
      totalPercentage,
      error: `Total percentage allocation (${totalPercentage}%) exceeds 100% ceiling.`,
    };
  }

  return {
    valid: true,
    totalPercentage,
  };
}

/**
 * Executes the Payday split calculations and dispatches vendor settlements
 */
export async function executePaydaySplits(
  config: PaydayConfig,
  inflowAmount: number,
  narration: string = 'SALARY INFLOW',
  receivingBank: string = 'Primary Bank Node'
): Promise<PaydayExecutionLog> {
  const receipts: PaydayExecutionReceipt[] = [];
  let remainingBalance = inflowAmount;
  let totalAllocated = 0;

  // Filter active (unpaused) rules sorted by priority
  const sortedRules = [...config.rules].sort((a, b) => a.priority - b.priority);

  // 1. Process Fixed Amount Rules First
  for (const rule of sortedRules) {
    if (rule.isPaused) {
      receipts.push({
        billName: rule.name,
        billerRef: rule.targetVaultId,
        amount: 0,
        reference: `SKIPPED-PAUSED-${rule.id}`,
        paymentSource: receivingBank,
        status: 'skipped_paused',
      });
      continue;
    }

    if (rule.type === 'FIXED_AMOUNT') {
      const allocAmount = Math.min(rule.value, remainingBalance);
      if (allocAmount > 0) {
        remainingBalance -= allocAmount;
        totalAllocated += allocAmount;

        receipts.push({
          billName: rule.name,
          billerRef: rule.targetVaultId,
          amount: allocAmount,
          reference: `TX-FIX-${Date.now()}-${rule.id.substring(0, 4)}`,
          paymentSource: receivingBank,
          token: rule.autoCardTopup ? `BC_TOPUP_${Math.round(allocAmount / 1500)}` : undefined,
          status: 'success',
        });
      }
    }
  }

  // 2. Process Percentage Rules on Base Inflow
  for (const rule of sortedRules) {
    if (rule.isPaused || rule.type !== 'PERCENTAGE') continue;

    const allocAmount = Math.round((rule.value / 100) * inflowAmount);
    const cappedAmount = Math.min(allocAmount, remainingBalance);

    if (cappedAmount > 0) {
      remainingBalance -= cappedAmount;
      totalAllocated += cappedAmount;

      receipts.push({
        billName: rule.name,
        billerRef: rule.targetVaultId,
        amount: cappedAmount,
        reference: `TX-PCT-${Date.now()}-${rule.id.substring(0, 4)}`,
        paymentSource: receivingBank,
        token: rule.autoBillPay ? `8491-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        status: 'success',
      });
    }
  }

  // 3. Calculate Statutory Banking Fees
  // EMTL: N50 per active vendor debit; VAT: 7.5% on transaction fees
  const activeDebitsCount = receipts.filter((r) => r.status === 'success').length;
  const emtlFee = activeDebitsCount * 50;
  const vatLevy = Math.round(totalAllocated * 0.075);
  const residualSaved = Math.max(0, remainingBalance - emtlFee - vatLevy);

  const breakdown: PaydayExecutionBreakdown = {
    inflowAmount,
    receivingBank,
    narration,
    totalAllocated,
    residualSaved,
    vatLevy,
    emtlFee,
    receipts,
    note: `Automated split waterfall completed. ₦${residualSaved.toLocaleString()} swept to liquid savings.`,
  };

  const executionLog: PaydayExecutionLog = {
    id: `exec_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    paydayConfigId: config.id,
    inflowAmount,
    status: 'SUCCESS',
    bypassReason: null,
    breakdown,
    createdAt: new Date().toISOString(),
  };

  // Persist to database if available
  if (isDatabaseConfigured()) {
    try {
      await prisma.paydayExecutionLog.create({
        data: {
          paydayConfigId: config.id,
          inflowAmount,
          status: 'SUCCESS',
          breakdown: JSON.stringify(breakdown),
        },
      });
    } catch (e) {
      console.error('[PaydayEngine] Failed to write DB log:', e);
    }
  }

  // Also add to memory log for instant client display
  addMemoryExecutionLog(executionLog);

  return executionLog;
}
