import { evaluatePaydayInflowGuard } from '@/services/payday/guard';
import { executePaydaySplits } from '@/services/payday/engine';
import type { PaydayExecutionLog } from '@/types/payday';

export const DEFAULT_WHITELIST_KEYWORDS = [
  'SALARY',
  'PAYROLL',
  'ANDELA',
  'INTERSWITCH',
  'PAYSTACK',
  'FLUTTERWAVE',
  'MONIEPOINT',
  'RETAINER',
  'CONTRACT',
  'DIVIDEND',
  'INFLOW',
];

export class InflowMatcherService {
  /**
   * Check if a transaction credit alert originates from an authorized salary/income source
   */
  static isEligibleInflow(
    senderName: string,
    narration: string,
    amount: number,
    minThreshold = 250000,
    userKeywords: string[] = []
  ): { eligible: boolean; matchedKeyword?: string } {
    if (amount < minThreshold) {
      return { eligible: false };
    }

    const keywords = [...DEFAULT_WHITELIST_KEYWORDS, ...userKeywords].map((k) => k.toUpperCase());
    const combinedText = `${senderName} ${narration}`.toUpperCase();

    const matched = keywords.find((kw) => combinedText.includes(kw));
    if (matched) {
      return { eligible: true, matchedKeyword: matched };
    }

    return { eligible: false };
  }

  /**
   * Manual trigger for freelancers, gig workers, and contractors
   * Bypasses webhook requirement and executes an immediate waterfall split
   */
  static async executeManualInflowSplit(
    userId = 'usr_adekunle_01',
    amount: number,
    narration = 'MANUAL FREELANCE INFLOW / CONTRACT PROCEEDS'
  ): Promise<{ success: boolean; log?: PaydayExecutionLog; message: string }> {
    const guardResult = await evaluatePaydayInflowGuard(userId, amount, narration, 'Manual Central Pool Injection');

    if (!guardResult.allowed) {
      return {
        success: false,
        message: `Execution blocked by lifecycle state: ${guardResult.bypassReason}`,
      };
    }

    const log = await executePaydaySplits(guardResult.config, amount, narration, 'Manual Central Pool Injection');
    return {
      success: true,
      log,
      message: `Waterfall split executed successfully for ₦${amount.toLocaleString()}!`,
    };
  }
}
