export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export type NodeStatus = 'active' | 'syncing' | 'degraded' | 'disconnected' | 'rate_limited';

export type BankCategory = 'Commercial' | 'Investment' | 'Digital MFB' | 'Credit Line' | 'Business';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  stealthModeEnabled: boolean;
  globalCardFreeze: boolean;
  createdAt: string;
}

export interface BankNode {
  id: string;
  userId: string;
  institutionId: string;
  institutionName: string;
  category: BankCategory;
  accountNumberMasked: string;
  balance: number;
  currency: 'NGN' | 'USD';
  status: NodeStatus;
  latencyMs: number;
  lastWebhookSync: string;
  monthlyFee: number;
}

export interface Transaction {
  id: string;
  nodeId: string;
  institutionName: string;
  amount: number;
  type: 'debit' | 'credit';
  category: 'Operations' | 'Growth' | 'Subscriptions' | 'Lifestyle' | 'Transfers';
  description: string;
  merchantName: string;
  timestamp: string;
  isSubscription: boolean;
  isFlaggedZombie: boolean;
}

export interface SubscriptionItem {
  id: string;
  nodeId: string;
  merchantName: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  lastBilledDate: string;
  nextBillingDate: string;
  daysInactive: number;
  status: 'active' | 'flagged_zombie' | 'blocked';
}

export interface EnvelopeBudget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  targetWarningThreshold: number;
}

export interface WebhookLog {
  id: string;
  institutionId: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  payloadSignature: string;
  timestamp: string;
  status: 'success' | 'failed' | 'retrying';
}

export interface AdminEndpoint {
  name: string;
  status: number;
  latency: number;
  queue: number;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface OnboardingData {
  email: string;
  password: string;
  selectedTier: SubscriptionTier;
  selectedNodes: string[];
}

export interface BankInstitution {
  id: string;
  name: string;
  category: BankCategory;
  color: string;
  defaultBalance: number;
  latencyMs: number;
}
