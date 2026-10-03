export type BillCategory = 
  | 'utilities'
  | 'telecom_data'
  | 'subscriptions'
  | 'housing_rent'
  | 'education'
  | 'living_groceries'
  | 'wealth_investment';

export interface BillerPlanOption {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export interface BillerCatalogItem {
  id: string;
  name: string;
  category: BillCategory;
  categoryLabel: string;
  icon: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  plans: BillerPlanOption[];
}

export interface DirectDebitMandateItem {
  id: string;
  bankName: string;
  mandateRef: string; // Tokenized CBN Open Banking Mandate identifier (e.g. MND-GTB-8240)
  institutionCategory: string;
  monthlySpendLimit: number;
  status: 'active' | 'frozen';
}

// UserCardItem alias for zero-storage direct debit mandates
export type UserCardItem = DirectDebitMandateItem;

export interface BillRouteItem {
  id: string;
  name: string;
  category: BillCategory;
  categoryLabel: string;
  icon: string;
  targetAmount: number;
  maxSpendingCap: number;
  billerIdentifier: string; // Meter number, smartcard, phone number, etc.
  assignedPaymentSourceId: string;
  assignedPaymentSourceName: string;
  selectedPlanId?: string;
  isAutoEnabled: boolean;
  status: 'active' | 'paused' | 'settled' | 'pending_inflow';
  lastSettledDate?: string;
  description: string;
}

export interface PaydayInflowRule {
  minInflowThreshold: number;
  narrationKeywords: string[];
  executionMode: 'autonomous' | 'manual_approval';
  primaryReceivingNodeId: string;
  residualStrategy: 'leave_in_account' | 'sweep_to_savings';
  globalFreezeActive: boolean;
}

// --- Lifecycle & Automation Engine Extensions ---

export type PaydayStatus = 'ACTIVE' | 'PAUSED' | 'INACTIVE';

export type PaydayRuleType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type PaydayExecutionStatus = 
  | 'SUCCESS' 
  | 'PARTIAL_SUCCESS' 
  | 'FAILED' 
  | 'BYPASSED' 
  | 'ABORTED';

export type BypassReason = 
  | 'USER_PAUSED' 
  | 'USER_SKIPPED_NEXT' 
  | 'CONFIG_INACTIVE' 
  | 'TIER_RESTRICTION' 
  | 'INSUFFICIENT_FUNDS' 
  | 'MANUAL_OVERRIDE'
  | 'ABORTED_IN_SAFETY_WINDOW';

export interface PaydaySplitRule {
  id: string;
  paydayConfigId?: string;
  name: string;
  targetVaultId: string;
  targetVaultName: string;
  type: PaydayRuleType;
  value: number; // Percentage (e.g., 25 for 25%) or Fixed NGN Amount
  priority: number;
  autoCardTopup: boolean;
  autoBillPay: boolean;
  isPaused: boolean; // Granular rule-level pause
  createdAt?: string;
  updatedAt?: string;
}

export interface PaydayConfig {
  id: string;
  userId: string;
  status: PaydayStatus;
  skipNextInflow: boolean;
  pausedAt?: string | null;
  pauseReason?: string | null;
  senderKeywords: string[];
  expectedAmount?: number | null;
  rules: PaydaySplitRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaydayExecutionReceipt {
  billName: string;
  billerRef: string;
  amount: number;
  reference: string;
  paymentSource: string;
  token?: string; // e.g. electricity token or vendor tx id
  status: 'success' | 'queued' | 'held_for_review' | 'skipped_paused';
}

export interface PaydayExecutionBreakdown {
  inflowAmount: number;
  receivingBank?: string;
  narration?: string;
  totalAllocated: number;
  residualSaved: number;
  vatLevy: number;
  emtlFee: number;
  receipts: PaydayExecutionReceipt[];
  note?: string;
}

export interface PaydayExecutionLog {
  id: string;
  paydayConfigId: string;
  inflowAmount: number;
  status: PaydayExecutionStatus;
  bypassReason?: BypassReason | null;
  breakdown: PaydayExecutionBreakdown;
  createdAt: string;
}

// Backward compatible alias
export interface InflowExecutionLog {
  id: string;
  timestamp: string;
  detectedAmount: number;
  receivingBank: string;
  totalBillsAllocated: number;
  residualSaved: number;
  vatLevy: number;
  emtlFee: number;
  receipts: PaydayExecutionReceipt[];
}
