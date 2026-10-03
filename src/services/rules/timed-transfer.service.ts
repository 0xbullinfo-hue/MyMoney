import type { 
  TimedTransferRule, 
  TimedExecutionResult, 
  TimedRuleStatus 
} from '@/types/rules';
import { AnchorWalletService } from '@/services/wallet/anchor.service';

let timedRulesStore: TimedTransferRule[] = [
  {
    id: 'trule_rent_01',
    userId: 'usr_adekunle_01',
    name: 'Landlord Tenancy Settlement',
    sourceVaultId: 'vault_rent',
    sourceVaultName: 'Locked Rent Sinking Reserve',
    beneficiaryName: 'CHIEF E. A. OKONKWO (LANDLORD)',
    beneficiaryBankName: 'Guaranty Trust Bank',
    beneficiaryBankCode: '058',
    beneficiaryAccountNumber: '0192837465',
    amountKobo: 120000000, // ₦1,200,000.00
    condition: {
      minVaultBalanceKobo: 120000000,
      targetDate: '2026-12-28T00:00:00Z',
      recurringSchedule: 'ANNUAL',
    },
    narration: 'ANNUAL RESIDENTIAL LEASE RENEWAL 2027',
    status: 'SCHEDULED',
    lastExecutedAt: null,
    executionReference: null,
    failureReason: null,
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'trule_sch_02',
    userId: 'usr_adekunle_01',
    name: 'Q1 School Fees NIP Transfer',
    sourceVaultId: 'vault_sch',
    sourceVaultName: 'Children Tuition Reserve',
    beneficiaryName: 'CORONA SCHOOLS TRUST COUNCIL',
    beneficiaryBankName: 'Zenith Bank',
    beneficiaryBankCode: '057',
    beneficiaryAccountNumber: '1019283741',
    amountKobo: 35000000, // ₦350,000.00
    condition: {
      minVaultBalanceKobo: 35000000,
      targetDate: '2027-01-05T00:00:00Z',
      recurringSchedule: 'QUARTERLY',
    },
    narration: 'TERMLY TUITION & LEVY - OLAWALE CHILDREN',
    status: 'SCHEDULED',
    lastExecutedAt: null,
    executionReference: null,
    failureReason: null,
    createdAt: '2026-06-10T12:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export class TimedTransferService {
  /**
   * Retrieve all programmable timed transfer rules for user
   */
  static async getUserRules(userId = 'usr_adekunle_01'): Promise<TimedTransferRule[]> {
    return timedRulesStore.filter((r) => r.userId === userId);
  }

  /**
   * Create a new programmable timed transfer rule
   */
  static async createRule(
    userId = 'usr_adekunle_01',
    input: Omit<TimedTransferRule, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastExecutedAt' | 'executionReference' | 'failureReason'>
  ): Promise<TimedTransferRule> {
    const newRule: TimedTransferRule = {
      ...input,
      id: `trule_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastExecutedAt: null,
      executionReference: null,
      failureReason: null,
    };

    timedRulesStore.unshift(newRule);
    return newRule;
  }

  /**
   * Toggle rule status (e.g. Pause / Resume)
   */
  static async toggleRuleStatus(ruleId: string, status: TimedRuleStatus): Promise<TimedTransferRule> {
    const rule = timedRulesStore.find((r) => r.id === ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    rule.status = status;
    rule.updatedAt = new Date().toISOString();
    return rule;
  }

  /**
   * Evaluate conditions and execute any due timed transfers
   * Can also be triggered manually with forceExecuteRuleId to test execution immediately
   */
  static async evaluateAndExecuteDueRules(
    userId = 'usr_adekunle_01',
    forceExecuteRuleId?: string
  ): Promise<TimedExecutionResult[]> {
    const userRules = await this.getUserRules(userId);
    const results: TimedExecutionResult[] = [];
    const now = new Date();

    const wallet = await AnchorWalletService.getCentralWallet(userId);

    for (const rule of userRules) {
      if (rule.status === 'PAUSED' || rule.status === 'EXECUTED') {
        continue;
      }

      const isForced = forceExecuteRuleId === rule.id;
      const targetDate = new Date(rule.condition.targetDate);
      const isDateReached = now >= targetDate;

      // Vault balance check
      const vault = wallet.subVaults.find((v) => v.id === rule.sourceVaultId);
      const vaultBalance = vault ? vault.balanceKobo : 0;
      const isBalanceSufficient = vaultBalance >= rule.condition.minVaultBalanceKobo;

      if ((isDateReached && isBalanceSufficient) || (isForced && isBalanceSufficient)) {
        try {
          // Execute transfer: debit the sub-vault
          const ref = `NIP-ANC-${Date.now().toString().slice(-6)}`;
          await AnchorWalletService.debitSubVault(
            rule.sourceVaultId,
            rule.amountKobo,
            `Anchor NIP Payout: ${rule.name} -> ${rule.beneficiaryName} (${rule.beneficiaryBankName})`,
            'ANCHOR_BAAS'
          );

          rule.status = 'EXECUTED';
          rule.lastExecutedAt = new Date().toISOString();
          rule.executionReference = ref;
          rule.updatedAt = new Date().toISOString();

          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: true,
            status: 'EXECUTED',
            executedAmountKobo: rule.amountKobo,
            beneficiary: `${rule.beneficiaryName} (${rule.beneficiaryBankName} ${rule.beneficiaryAccountNumber})`,
            reference: ref,
          });
        } catch (err: unknown) {
          const reason = err instanceof Error ? err.message : 'Execution failed';
          rule.status = 'FAILED';
          rule.failureReason = reason;

          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            status: 'FAILED',
            executedAmountKobo: 0,
            beneficiary: rule.beneficiaryName,
            reason,
          });
        }
      } else if (!isBalanceSufficient && (isDateReached || isForced)) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          status: 'SCHEDULED',
          executedAmountKobo: 0,
          beneficiary: rule.beneficiaryName,
          reason: `Insufficient sub-vault balance: Has ₦${(vaultBalance / 100).toLocaleString()}, requires ₦${(rule.condition.minVaultBalanceKobo / 100).toLocaleString()}`,
        });
      }
    }

    return results;
  }
}
