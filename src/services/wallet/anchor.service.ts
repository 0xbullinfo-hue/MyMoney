import type { CentralWallet, SubVault, LedgerTransaction } from '@/types/wallet';

// Default user anchor wallet seed
const initialSubVaults: SubVault[] = [
  {
    id: 'vault_sub',
    walletId: 'wlt_anchor_01',
    name: 'Subscriptions Vault',
    type: 'SUBSCRIPTIONS',
    targetCategory: 'subscriptions',
    balanceKobo: 18750000, // ₦187,500.00
    targetAmountKobo: 25000000,
    isLocked: false,
    autoDisburse: true,
    status: 'ACTIVE',
    provider: 'BRIDGECARD',
    icon: 'credit_card',
    colorTheme: '#6B7F5B', // Earthy Moss Green
    description: 'Auto-funds Bridgecard Virtual Visa/Mastercard for Netflix, Spotify & Cloud SaaS',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault_util',
    walletId: 'wlt_anchor_01',
    name: 'Utility Settlement Vault',
    type: 'UTILITIES',
    targetCategory: 'utilities',
    balanceKobo: 12500000, // ₦125,000.00
    targetAmountKobo: 15000000,
    isLocked: false,
    autoDisburse: true,
    status: 'ACTIVE',
    provider: 'VTPASS',
    icon: 'bolt',
    colorTheme: '#C96F4F', // Terracotta Sand
    description: 'Powers instant auto-recharge for IKEDC/EKEDC meters, Starlink & Fiber bills',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault_rent',
    walletId: 'wlt_anchor_01',
    name: 'Locked Rent Sinking Reserve',
    type: 'LOCKED_SAVINGS',
    targetCategory: 'housing_rent',
    balanceKobo: 120000000, // ₦1,200,000.00
    targetAmountKobo: 240000000,
    lockedUntil: '2026-12-28T00:00:00Z',
    isLocked: true,
    autoDisburse: false,
    status: 'LOCKED',
    provider: 'ANCHOR',
    icon: 'lock',
    colorTheme: '#2E3A2F', // Deep Forest Pine
    description: 'Anchor BaaS Time-Locked Vault: Unlocks on Dec 28 for direct Landlord NIP transfer',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault_sch',
    walletId: 'wlt_anchor_01',
    name: 'Children Tuition Reserve',
    type: 'LOCKED_SAVINGS',
    targetCategory: 'education',
    balanceKobo: 35000000, // ₦350,000.00
    targetAmountKobo: 60000000,
    lockedUntil: '2027-01-05T00:00:00Z',
    isLocked: true,
    autoDisburse: false,
    status: 'LOCKED',
    provider: 'ANCHOR',
    icon: 'school',
    colorTheme: '#4A5B43',
    description: 'Termly school tuition sinking reserve with daily compound yield in Anchor MMF',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault_wealth',
    walletId: 'wlt_anchor_01',
    name: 'Anchor Sovereign Wealth Sweep',
    type: 'CUSTOM',
    targetCategory: 'wealth_investment',
    balanceKobo: 84000000, // ₦840,000.00
    targetAmountKobo: 100000000,
    isLocked: false,
    autoDisburse: true,
    status: 'ACTIVE',
    provider: 'ANCHOR',
    icon: 'trending_up',
    colorTheme: '#8B9A46',
    description: 'Residual liquidity swept into high-yield FGN Treasury Bills (17.5% per annum)',
    updatedAt: new Date().toISOString(),
  },
];

let centralWalletStore: CentralWallet = {
  id: 'wlt_anchor_01',
  userId: 'usr_adekunle_01',
  accountNumber: '9920194821',
  accountName: 'ADEKUNLE O. (MYMONEY CENTRAL POOL)',
  bankName: 'Anchor / Providus Bank',
  currency: 'NGN',
  availableBalanceKobo: 270250000, // ₦2,702,500.00 total across all sub-vaults
  ledgerBalanceKobo: 270250000,
  status: 'ACTIVE',
  subVaults: initialSubVaults,
  updatedAt: new Date().toISOString(),
};

let ledgerHistoryStore: LedgerTransaction[] = [
  {
    id: 'ltx_001',
    walletId: 'wlt_anchor_01',
    subVaultId: 'vault_sub',
    subVaultName: 'Subscriptions Vault',
    type: 'ALLOCATION_SPLIT',
    amountKobo: 18750000,
    feeKobo: 0,
    narration: 'Payday automated split -> Subscriptions Vault (Bridgecard)',
    reference: 'ANC-SPLIT-99214',
    channel: 'ANCHOR_BAAS',
    status: 'SUCCESS',
    createdAt: '2026-09-28T09:14:23Z',
  },
  {
    id: 'ltx_002',
    walletId: 'wlt_anchor_01',
    subVaultId: 'vault_util',
    subVaultName: 'Utility Settlement Vault',
    type: 'ALLOCATION_SPLIT',
    amountKobo: 12500000,
    feeKobo: 0,
    narration: 'Payday automated split -> Utility Settlement Vault (VTPass)',
    reference: 'ANC-SPLIT-99215',
    channel: 'ANCHOR_BAAS',
    status: 'SUCCESS',
    createdAt: '2026-09-28T09:14:24Z',
  },
  {
    id: 'ltx_003',
    walletId: 'wlt_anchor_01',
    subVaultId: 'vault_rent',
    subVaultName: 'Locked Rent Sinking Reserve',
    type: 'VAULT_LOCK',
    amountKobo: 20000000,
    feeKobo: 0,
    narration: 'Anchor BaaS Time-Locked Allocation -> Rent Vault (Matures Dec 28)',
    reference: 'ANC-LOCK-58102',
    channel: 'ANCHOR_BAAS',
    status: 'SUCCESS',
    createdAt: '2026-09-28T09:14:25Z',
  },
];

export class AnchorWalletService {
  /**
   * Retrieve central financing wallet and sub-vault states
   */
  static async getCentralWallet(userId = 'usr_adekunle_01'): Promise<CentralWallet> {
    // If live API key is present, we could query Anchor REST endpoints.
    // For now, resilient sandbox store guarantees deterministic execution.
    return {
      ...centralWalletStore,
      userId,
      subVaults: [...centralWalletStore.subVaults],
    };
  }

  /**
   * Allocate incoming salary or manual trigger funds across sub-vaults
   */
  static async allocateInflow(
    userId: string,
    inflowKobo: number,
    splits: Array<{ vaultId: string; amountKobo: number; narration?: string }>
  ): Promise<{ success: boolean; ledgerEntries: LedgerTransaction[] }> {
    const newLedgerEntries: LedgerTransaction[] = [];
    const timestamp = new Date().toISOString();

    // 1. Credit central wallet inflow
    const inflowTx: LedgerTransaction = {
      id: `ltx_inflow_${Date.now()}`,
      walletId: centralWalletStore.id,
      type: 'INFLOW',
      amountKobo: inflowKobo,
      feeKobo: 0,
      narration: `Incoming salary credit captured from Mono webhook`,
      reference: `ANC-INFLOW-${Date.now().toString().slice(-6)}`,
      channel: 'MONO_WEBHOOK',
      status: 'SUCCESS',
      createdAt: timestamp,
    };
    newLedgerEntries.push(inflowTx);

    // 2. Perform journal splits to sub-vaults
    centralWalletStore.subVaults = centralWalletStore.subVaults.map((vault) => {
      const match = splits.find((s) => s.vaultId === vault.id);
      if (match && match.amountKobo > 0) {
        const splitTx: LedgerTransaction = {
          id: `ltx_split_${vault.id}_${Date.now()}`,
          walletId: centralWalletStore.id,
          subVaultId: vault.id,
          subVaultName: vault.name,
          type: vault.isLocked ? 'VAULT_LOCK' : 'ALLOCATION_SPLIT',
          amountKobo: match.amountKobo,
          feeKobo: 0,
          narration: match.narration || `Payday automated split -> ${vault.name}`,
          reference: `ANC-${vault.isLocked ? 'LOCK' : 'SPLIT'}-${Date.now().toString().slice(-6)}`,
          channel: 'ANCHOR_BAAS',
          status: 'SUCCESS',
          createdAt: timestamp,
        };
        newLedgerEntries.push(splitTx);

        return {
          ...vault,
          balanceKobo: vault.balanceKobo + match.amountKobo,
          updatedAt: timestamp,
        };
      }
      return vault;
    });

    // Update wallet aggregate balances
    const totalSubVaultBalance = centralWalletStore.subVaults.reduce(
      (acc, v) => acc + v.balanceKobo,
      0
    );
    centralWalletStore.availableBalanceKobo = totalSubVaultBalance;
    centralWalletStore.ledgerBalanceKobo = totalSubVaultBalance;
    centralWalletStore.updatedAt = timestamp;

    ledgerHistoryStore = [...newLedgerEntries, ...ledgerHistoryStore];

    return {
      success: true,
      ledgerEntries: newLedgerEntries,
    };
  }

  /**
   * Debit a specific sub-vault (e.g. to top-up a virtual card or pay a utility bill)
   */
  static async debitSubVault(
    vaultId: string,
    amountKobo: number,
    narration: string,
    channel: 'ANCHOR_BAAS' | 'BRIDGECARD' | 'VTPASS' = 'ANCHOR_BAAS'
  ): Promise<LedgerTransaction> {
    const vault = centralWalletStore.subVaults.find((v) => v.id === vaultId);
    if (!vault) {
      throw new Error(`Sub-vault ${vaultId} not found`);
    }

    if (vault.balanceKobo < amountKobo) {
      throw new Error(`Insufficient balance in ${vault.name} (has ₦${(vault.balanceKobo / 100).toLocaleString()}, requested ₦${(amountKobo / 100).toLocaleString()})`);
    }

    const timestamp = new Date().toISOString();
    vault.balanceKobo -= amountKobo;
    vault.updatedAt = timestamp;

    const tx: LedgerTransaction = {
      id: `ltx_debit_${Date.now()}`,
      walletId: centralWalletStore.id,
      subVaultId: vault.id,
      subVaultName: vault.name,
      type: channel === 'BRIDGECARD' ? 'CARD_TOPUP' : 'BILL_SETTLEMENT',
      amountKobo,
      feeKobo: 0,
      narration,
      reference: `ANC-DEBIT-${Date.now().toString().slice(-6)}`,
      channel,
      status: 'SUCCESS',
      createdAt: timestamp,
    };

    ledgerHistoryStore.unshift(tx);

    // Update aggregate
    centralWalletStore.availableBalanceKobo = centralWalletStore.subVaults.reduce(
      (acc, v) => acc + v.balanceKobo,
      0
    );
    centralWalletStore.ledgerBalanceKobo = centralWalletStore.availableBalanceKobo;
    centralWalletStore.updatedAt = timestamp;

    return tx;
  }

  /**
   * Credit an individual sub-vault directly
   */
  static async creditSubVault(
    vaultId: string,
    amountKobo: number,
    narration: string,
    channel: 'ANCHOR_BAAS' | 'BRIDGECARD' | 'VTPASS' = 'ANCHOR_BAAS'
  ): Promise<LedgerTransaction> {
    const vault = centralWalletStore.subVaults.find((v) => v.id === vaultId);
    if (!vault) {
      throw new Error(`Sub-vault ${vaultId} not found`);
    }

    const timestamp = new Date().toISOString();
    vault.balanceKobo += amountKobo;
    vault.updatedAt = timestamp;

    const tx: LedgerTransaction = {
      id: `ltx_credit_${Date.now()}`,
      walletId: centralWalletStore.id,
      subVaultId: vault.id,
      subVaultName: vault.name,
      type: 'ALLOCATION_SPLIT',
      amountKobo,
      feeKobo: 0,
      narration,
      reference: `ANC-TOPUP-${Date.now().toString().slice(-6)}`,
      channel,
      status: 'SUCCESS',
      createdAt: timestamp,
    };

    ledgerHistoryStore.unshift(tx);

    centralWalletStore.availableBalanceKobo = centralWalletStore.subVaults.reduce(
      (acc, v) => acc + v.balanceKobo,
      0
    );
    centralWalletStore.ledgerBalanceKobo = centralWalletStore.availableBalanceKobo;
    centralWalletStore.updatedAt = timestamp;

    return tx;
  }

  /**
   * Fetch all ledger transactions
   */
  static async getLedgerHistory(walletId = 'wlt_anchor_01'): Promise<LedgerTransaction[]> {
    return ledgerHistoryStore.filter((t) => t.walletId === walletId);
  }
}
