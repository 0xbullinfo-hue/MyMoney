import type { 
  VirtualCard, 
  VirtualCardSecureDetails, 
  CardTransaction, 
  CardCurrency, 
  CardBrand, 
  CardDesignTheme 
} from '@/types/cards';
import { AnchorWalletService } from '@/services/wallet/anchor.service';

const DEMO_PIN = '849210';

let userCardsStore: VirtualCard[] = [
  {
    id: 'card_bc_usd_01',
    userId: 'usr_adekunle_01',
    cardholderName: 'ADEKUNLE OLAWALE',
    nickname: 'Global SaaS & Media (USD)',
    currency: 'USD',
    brand: 'VISA',
    cardType: 'VIRTUAL',
    maskedPan: '4000 •••• •••• 4921',
    last4: '4921',
    expiryMonth: '09',
    expiryYear: '29',
    balanceUnits: 12500, // $125.00
    spendLimitMonthly: 50000, // $500.00
    status: 'ACTIVE',
    designTheme: 'earthy_forest',
    linkedSubVaultId: 'vault_sub',
    autoTopup: true,
    provider: 'BRIDGECARD',
    providerCardId: 'bc_crd_usd_99182',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'card_bc_ngn_02',
    userId: 'usr_adekunle_01',
    cardholderName: 'ADEKUNLE OLAWALE',
    nickname: 'Local Entertainment & Cloud (NGN)',
    currency: 'NGN',
    brand: 'MASTERCARD',
    cardType: 'VIRTUAL',
    maskedPan: '5399 •••• •••• 8812',
    last4: '8812',
    expiryMonth: '11',
    expiryYear: '28',
    balanceUnits: 4500000, // ₦45,000.00
    spendLimitMonthly: 25000000, // ₦250,000.00
    status: 'ACTIVE',
    designTheme: 'terracotta_sand',
    linkedSubVaultId: 'vault_sub',
    autoTopup: true,
    provider: 'BRIDGECARD',
    providerCardId: 'bc_crd_ngn_77201',
    createdAt: '2026-06-15T14:30:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const secureDetailsStore: Record<string, VirtualCardSecureDetails> = {
  card_bc_usd_01: {
    cardId: 'card_bc_usd_01',
    fullPan: '4000 9210 8472 4921',
    cvv: '842',
    expiry: '09/29',
    billingAddress: {
      street: '15 Marina Street, Financial Enclave',
      city: 'Lagos Island',
      state: 'Lagos',
      postalCode: '101001',
      country: 'Nigeria',
    },
  },
  card_bc_ngn_02: {
    cardId: 'card_bc_ngn_02',
    fullPan: '5399 4810 2931 8812',
    cvv: '319',
    expiry: '11/28',
    billingAddress: {
      street: '15 Marina Street, Financial Enclave',
      city: 'Lagos Island',
      state: 'Lagos',
      postalCode: '101001',
      country: 'Nigeria',
    },
  },
};

const cardTransactionsStore: Record<string, CardTransaction[]> = {
  card_bc_usd_01: [
    {
      id: 'ctx_001',
      cardId: 'card_bc_usd_01',
      merchantName: 'Netflix Premium US',
      merchantCategory: 'Streaming Entertainment',
      amount: 22.99,
      currency: 'USD',
      status: 'CLEARED',
      reference: 'TX-NETFLIX-9921',
      createdAt: '2026-09-29T10:15:00Z',
    },
    {
      id: 'ctx_002',
      cardId: 'card_bc_usd_01',
      merchantName: 'OpenAI ChatGPT Plus',
      merchantCategory: 'AI / Software Productivity',
      amount: 20.00,
      currency: 'USD',
      status: 'CLEARED',
      reference: 'TX-OPENAI-4819',
      createdAt: '2026-09-29T11:02:00Z',
    },
    {
      id: 'ctx_003',
      cardId: 'card_bc_usd_01',
      merchantName: 'Apple iCloud+ & Music',
      merchantCategory: 'Cloud Storage & Media',
      amount: 14.99,
      currency: 'USD',
      status: 'CLEARED',
      reference: 'TX-APPLE-7712',
      createdAt: '2026-09-29T14:40:00Z',
    },
  ],
  card_bc_ngn_02: [
    {
      id: 'ctx_004',
      cardId: 'card_bc_ngn_02',
      merchantName: 'Showmax 1-Month Pro',
      merchantCategory: 'Local Streaming',
      amount: 4500,
      currency: 'NGN',
      status: 'CLEARED',
      reference: 'TX-SHWMAX-3810',
      createdAt: '2026-09-28T18:00:00Z',
    },
  ],
};

export class BridgecardService {
  /**
   * List all virtual cards belonging to the user
   */
  static async getUserCards(userId = 'usr_adekunle_01'): Promise<VirtualCard[]> {
    return userCardsStore.filter((c) => c.userId === userId);
  }

  /**
   * Programmatically issue a new virtual card
   */
  static async issueCard(
    userId = 'usr_adekunle_01',
    input: {
      nickname: string;
      currency: CardCurrency;
      brand: CardBrand;
      designTheme?: CardDesignTheme;
      spendLimitMonthly?: number;
    }
  ): Promise<VirtualCard> {
    const cardId = `card_bc_${Date.now()}`;
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const panPrefix = input.brand === 'VISA' ? '4000' : '5399';
    const maskedPan = `${panPrefix} •••• •••• ${last4}`;
    const fullPan = `${panPrefix} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${last4}`;
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const expiryMonth = '10';
    const expiryYear = '30';

    const newCard: VirtualCard = {
      id: cardId,
      userId,
      cardholderName: 'ADEKUNLE OLAWALE',
      nickname: input.nickname,
      currency: input.currency,
      brand: input.brand,
      cardType: 'VIRTUAL',
      maskedPan,
      last4,
      expiryMonth,
      expiryYear,
      balanceUnits: 0,
      spendLimitMonthly: input.spendLimitMonthly || (input.currency === 'USD' ? 50000 : 20000000),
      status: 'ACTIVE',
      designTheme: input.designTheme || (input.currency === 'USD' ? 'earthy_forest' : 'obsidian_gold'),
      linkedSubVaultId: 'vault_sub',
      autoTopup: true,
      provider: 'BRIDGECARD',
      providerCardId: `bc_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userCardsStore.unshift(newCard);

    secureDetailsStore[cardId] = {
      cardId,
      fullPan,
      cvv,
      expiry: `${expiryMonth}/${expiryYear}`,
      billingAddress: {
        street: '15 Marina Street, Financial Enclave',
        city: 'Lagos Island',
        state: 'Lagos',
        postalCode: '101001',
        country: 'Nigeria',
      },
    };

    cardTransactionsStore[cardId] = [];

    return newCard;
  }

  /**
   * Top-up virtual card from the Anchor Subscriptions Sub-Vault
   */
  static async topUpCard(
    cardId: string,
    amountUnits: number, // In cents ($) or Kobo (₦)
    sourceSubVaultId = 'vault_sub'
  ): Promise<{ success: boolean; card: VirtualCard; reference: string }> {
    const card = userCardsStore.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card ${cardId} not found`);
    }

    if (card.status !== 'ACTIVE') {
      throw new Error(`Card is currently ${card.status}. Unfreeze before topping up.`);
    }

    // Convert to NGN Kobo if debiting Anchor Sub-Vault
    // Demo rate: $1 USD = ₦1,500
    const debitAmountKobo = card.currency === 'USD' 
      ? Math.round((amountUnits / 100) * 1500 * 100) 
      : amountUnits;

    // Debit Sub-Vault in Anchor BaaS
    await AnchorWalletService.debitSubVault(
      sourceSubVaultId,
      debitAmountKobo,
      `Bridgecard Top-up -> ${card.nickname} (${card.maskedPan})`,
      'BRIDGECARD'
    );

    // Credit card balance
    card.balanceUnits += amountUnits;
    card.updatedAt = new Date().toISOString();

    const reference = `BC_TOPUP_${card.currency}_${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      card,
      reference,
    };
  }

  /**
   * Toggle Freeze / Unfreeze state of the virtual card
   */
  static async toggleFreezeCard(cardId: string, forceFreeze?: boolean): Promise<VirtualCard> {
    const card = userCardsStore.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card ${cardId} not found`);
    }

    const nextStatus = forceFreeze !== undefined 
      ? (forceFreeze ? 'FROZEN' : 'ACTIVE') 
      : (card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE');

    card.status = nextStatus;
    card.updatedAt = new Date().toISOString();
    return card;
  }

  /**
   * Reveal full PAN and CVV with PIN verification
   */
  static async revealCardDetails(cardId: string, pin: string): Promise<VirtualCardSecureDetails> {
    if (pin !== DEMO_PIN) {
      throw new Error('Invalid verification PIN. Enter demo PIN 849210');
    }

    const details = secureDetailsStore[cardId];
    if (!details) {
      throw new Error(`Secure card details not found for ${cardId}`);
    }

    return details;
  }

  /**
   * Fetch recent merchant transactions for a card
   */
  static async getCardTransactions(cardId: string): Promise<CardTransaction[]> {
    return cardTransactionsStore[cardId] || [];
  }
}
