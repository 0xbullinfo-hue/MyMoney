export type UtilityServiceCategory = 
  | 'electricity' 
  | 'cable_tv' 
  | 'internet_data' 
  | 'airtime';

export interface CustomerVerification {
  serviceId: string;
  serviceName: string;
  customerId: string; // Meter number, Smartcard number, or Phone number
  customerName: string;
  customerAddress?: string;
  customerType?: 'prepaid' | 'postpaid';
  outstandingBalance?: number;
  isValid: boolean;
  message?: string;
}

export interface UtilityRechargeReceipt {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  amount: number;
  token?: string; // 16-20 digit prepaid token e.g. "8491-0294-8192-4819"
  units?: string; // e.g. "112.4 kWh"
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  reference: string;
  sourceVaultId: string;
  paymentChannel: 'VTPASS_AGGREGATOR';
  createdAt: string;
}

export interface BillerServiceOption {
  id: string;
  name: string;
  category: UtilityServiceCategory;
  providerCode: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  supportsVerification: boolean;
}
