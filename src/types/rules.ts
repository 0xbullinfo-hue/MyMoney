export type TimedRuleStatus = 'SCHEDULED' | 'EXECUTING' | 'EXECUTED' | 'PAUSED' | 'FAILED';

export type RecurringSchedule = 'NONE' | 'MONTHLY_END' | 'QUARTERLY' | 'ANNUAL';

export interface TransferCondition {
  minVaultBalanceKobo: number;
  targetDate: string; // ISO Date e.g. "2026-12-28T00:00:00Z"
  recurringSchedule?: RecurringSchedule;
}

export interface TimedTransferRule {
  id: string;
  userId: string;
  name: string;
  sourceVaultId: string;
  sourceVaultName: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  beneficiaryBankCode: string;
  beneficiaryAccountNumber: string;
  amountKobo: number;
  condition: TransferCondition;
  narration: string;
  status: TimedRuleStatus;
  lastExecutedAt?: string | null;
  executionReference?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimedExecutionResult {
  ruleId: string;
  ruleName: string;
  success: boolean;
  status: TimedRuleStatus;
  executedAmountKobo: number;
  beneficiary: string;
  reference?: string;
  reason?: string;
}
