import type { 
  CustomerVerification, 
  UtilityRechargeReceipt, 
  BillerServiceOption 
} from '@/types/bills';
import { AnchorWalletService } from '@/services/wallet/anchor.service';

export const SUPPORTED_UTILITIES: BillerServiceOption[] = [
  {
    id: 'ikeja-electric',
    name: 'Ikeja Electric (IKEDC)',
    category: 'electricity',
    providerCode: 'IKEDC',
    identifierLabel: 'Prepaid Meter Number',
    identifierPlaceholder: 'e.g. 04291840192',
    supportsVerification: true,
  },
  {
    id: 'eko-electric',
    name: 'Eko Electricity (EKEDC)',
    category: 'electricity',
    providerCode: 'EKEDC',
    identifierLabel: 'Prepaid Meter Number',
    identifierPlaceholder: 'e.g. 01011928412',
    supportsVerification: true,
  },
  {
    id: 'dstv',
    name: 'DStv MultiChoice',
    category: 'cable_tv',
    providerCode: 'DSTV',
    identifierLabel: 'SmartCard / IUC Number',
    identifierPlaceholder: 'e.g. 1029482012',
    supportsVerification: true,
  },
  {
    id: 'mtn-data',
    name: 'MTN 5G Broadband & Fiber',
    category: 'internet_data',
    providerCode: 'MTN',
    identifierLabel: 'Broadband Phone / Account ID',
    identifierPlaceholder: 'e.g. 08039912044',
    supportsVerification: true,
  },
];

let rechargeHistoryStore: UtilityRechargeReceipt[] = [
  {
    id: 'vtr_001',
    serviceId: 'ikeja-electric',
    serviceName: 'Ikeja Electric (IKEDC)',
    customerId: '04291840192',
    customerName: 'ADEKUNLE OLAWALE (Flat 4, VI Lagos)',
    amount: 50000,
    token: '8491-0294-8192-4819',
    units: '222.2 kWh',
    status: 'SUCCESS',
    reference: 'TX-VTP-48192',
    sourceVaultId: 'vault_util',
    paymentChannel: 'VTPASS_AGGREGATOR',
    createdAt: '2026-09-28T09:14:26Z',
  },
  {
    id: 'vtr_002',
    serviceId: 'dstv',
    serviceName: 'DStv MultiChoice',
    customerId: '1029482012',
    customerName: 'ADEKUNLE OLAWALE (DStv Premium HD)',
    amount: 37000,
    status: 'SUCCESS',
    reference: 'TX-VTP-77192',
    sourceVaultId: 'vault_util',
    paymentChannel: 'VTPASS_AGGREGATOR',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

export class VTPassService {
  /**
   * Verify customer meter, smartcard, or phone number before recharging
   */
  static async verifyCustomer(
    serviceId: string,
    customerId: string,
    customerType: 'prepaid' | 'postpaid' = 'prepaid'
  ): Promise<CustomerVerification> {
    const service = SUPPORTED_UTILITIES.find((s) => s.id === serviceId) || {
      id: serviceId,
      name: serviceId.toUpperCase(),
      category: 'electricity',
    };

    // If live VTPASS_API_KEY is present, can dispatch live POST to https://api-service.vtpass.com/api/merchant-verify
    // Deterministic simulation based on customerId:
    const cleanId = customerId.trim();
    if (cleanId.length < 6) {
      return {
        serviceId,
        serviceName: service.name,
        customerId: cleanId,
        customerName: '',
        isValid: false,
        message: 'Invalid identifier length. Please verify your meter or smartcard number.',
      };
    }

    let customerName = 'ADEKUNLE OLAWALE';
    let address = 'Flat 4, Victoria Island, Lagos';

    if (cleanId.startsWith('0101')) {
      customerName = 'BAMIDELE ADEWALE';
      address = 'Plot 12, Admiralty Way, Lekki Phase 1, Lagos';
    } else if (cleanId.startsWith('1029')) {
      customerName = 'ADEKUNLE OLAWALE';
      address = 'DStv Premium Bouquet Account';
    }

    return {
      serviceId,
      serviceName: service.name,
      customerId: cleanId,
      customerName,
      customerAddress: address,
      customerType,
      isValid: true,
      message: 'Customer account successfully verified.',
    };
  }

  /**
   * Execute an automated utility recharge and debit the Utility_Vault
   */
  static async purchaseUtility(input: {
    serviceId: string;
    customerId: string;
    amount: number; // in NGN
    phone?: string;
    sourceVaultId?: string;
  }): Promise<UtilityRechargeReceipt> {
    const vaultId = input.sourceVaultId || 'vault_util';
    const amountKobo = Math.round(input.amount * 100);

    // 1. Verify customer first
    const verification = await this.verifyCustomer(input.serviceId, input.customerId);
    if (!verification.isValid) {
      throw new Error(`Customer verification failed: ${verification.message}`);
    }

    // 2. Debit the Anchor BaaS Utility Sub-Vault
    await AnchorWalletService.debitSubVault(
      vaultId,
      amountKobo,
      `VTPass Auto-Recharge: ${verification.serviceName} (${verification.customerId})`,
      'VTPASS'
    );

    // 3. Generate token if electricity
    let token: string | undefined;
    let units: string | undefined;

    if (input.serviceId.includes('electric') || input.serviceId.includes('power')) {
      token = [
        Math.floor(1000 + Math.random() * 9000),
        Math.floor(1000 + Math.random() * 9000),
        Math.floor(1000 + Math.random() * 9000),
        Math.floor(1000 + Math.random() * 9000),
      ].join('-');
      // Standard commercial residential tariff ~225 NGN / kWh
      units = `${(input.amount / 225).toFixed(1)} kWh`;
    }

    const receipt: UtilityRechargeReceipt = {
      id: `vtr_${Date.now()}`,
      serviceId: input.serviceId,
      serviceName: verification.serviceName,
      customerId: input.customerId,
      customerName: verification.customerName,
      amount: input.amount,
      token,
      units,
      status: 'SUCCESS',
      reference: `TX-VTP-${Date.now().toString().slice(-6)}`,
      sourceVaultId: vaultId,
      paymentChannel: 'VTPASS_AGGREGATOR',
      createdAt: new Date().toISOString(),
    };

    rechargeHistoryStore.unshift(receipt);

    return receipt;
  }

  /**
   * Retrieve historical utility recharge receipts
   */
  static async getRechargeHistory(): Promise<UtilityRechargeReceipt[]> {
    return rechargeHistoryStore;
  }
}
