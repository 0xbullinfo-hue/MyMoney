export type SubVaultType = 
  | 'SUBSCRIPTIONS' 
  | 'UTILITIES' 
  | 'LOCKED_SAVINGS' 
  | 'CUSTOM';

export type SubVaultStatus = 'ACTIVE' | 'LOCKED' | 'DEPLETED' | 'PAUSED';

export interface SubVault {
  id: string;
  walletId: string;
  name: string;
  type: SubVaultType;
  targetCategory: string;
  balanceKobo: number; // Stored in Kobo for precision
  targetAmountKobo?: number;
  lockedUntil?: string | null; // e.g. "2026-12-28T00:00:00Z"
  isLocked: boolean;
  autoDisburse: boolean;
  status: SubVaultStatus;
  provider: 'ANCHOR' | 'BRIDGECARD' | 'VTPASS';
  icon: string;
  colorTheme: string;
  description: string;
  updatedAt: string;
}

export interface CentralWallet {
  id: string;
  userId: string;
  accountNumber: string; // Anchor BaaS Virtual NUBAN
  accountName: string;
  bankName: string;
  currency: 'NGN';
  availableBalanceKobo: number;
  ledgerBalanceKobo: number;
  status: 'ACTIVE' | 'FROZEN';
  subVaults: SubVault[];
  updatedAt: string;
}

export type LedgerEntryType = 
  | 'INFLOW' 
  | 'ALLOCATION_SPLIT' 
  | 'CARD_TOPUP' 
  | 'BILL_SETTLEMENT' 
  | 'VAULT_LOCK' 
  | 'SWEEP';

export interface LedgerTransaction {
  id: string;
  walletId: string;
  subVaultId?: string;
  subVaultName?: string;
  type: LedgerEntryType;
  amountKobo: number;
  feeKobo: number;
  narration: string;
  reference: string;
  channel: 'ANCHOR_BAAS' | 'BRIDGECARD' | 'VTPASS' | 'MONO_WEBHOOK';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
}
