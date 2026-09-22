export type BillCategory = 
  | 'utilities'
  | 'telecom_data'
  | 'subscriptions'
  | 'housing_rent'
  | 'education'
  | 'living_groceries'
  | 'wealth_investment';

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

export interface InflowExecutionLog {
  id: string;
  timestamp: string;
  detectedAmount: number;
  receivingBank: string;
  totalBillsAllocated: number;
  residualSaved: number;
  receipts: {
    billName: string;
    amount: number;
    reference: string;
    token?: string; // e.g. electricity recharge token
    status: 'success' | 'queued' | 'held_for_review';
  }[];
}
