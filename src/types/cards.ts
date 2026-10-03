export type CardCurrency = 'USD' | 'NGN';
export type CardBrand = 'VISA' | 'MASTERCARD';
export type CardStatus = 'ACTIVE' | 'FROZEN' | 'TERMINATED';
export type CardDesignTheme = 'earthy_forest' | 'obsidian_gold' | 'terracotta_sand';

export interface VirtualCard {
  id: string;
  userId: string;
  cardholderName: string;
  nickname: string;
  currency: CardCurrency;
  brand: CardBrand;
  cardType: 'VIRTUAL';
  maskedPan: string; // e.g. "5399 •••• •••• 4921"
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  balanceUnits: number; // In cents for USD, Kobo for NGN
  spendLimitMonthly: number;
  status: CardStatus;
  designTheme: CardDesignTheme;
  linkedSubVaultId: string; // Links to Subscription_Vault in Anchor BaaS
  autoTopup: boolean;
  provider: 'BRIDGECARD';
  providerCardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualCardSecureDetails {
  cardId: string;
  fullPan: string;
  cvv: string;
  expiry: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface CardTransaction {
  id: string;
  cardId: string;
  merchantName: string;
  merchantCategory: string;
  amount: number;
  currency: CardCurrency;
  status: 'CLEARED' | 'PENDING' | 'DECLINED';
  reference: string;
  createdAt: string;
}
