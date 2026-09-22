import type { BankInstitution } from '@/types';

// Complete list of 33 NDIC-Insured Commercial, Non-Interest & Digital Banks in Nigeria
export const bankInstitutions: BankInstitution[] = [
  // Tier 1 Commercial Banks
  { id: 'gtb', name: 'Guaranty Trust Bank (GTBank)', category: 'Commercial', color: '#E44D26', defaultBalance: 14250000, latencyMs: 12 },
  { id: 'access', name: 'Access Bank PLC', category: 'Commercial', color: '#003366', defaultBalance: 4945000, latencyMs: 15 },
  { id: 'zenith', name: 'Zenith Bank PLC', category: 'Commercial', color: '#E41E31', defaultBalance: 5600000, latencyMs: 18 },
  { id: 'firstbank', name: 'First Bank of Nigeria', category: 'Commercial', color: '#002D62', defaultBalance: 6800000, latencyMs: 16 },
  { id: 'uba', name: 'United Bank for Africa (UBA)', category: 'Commercial', color: '#D6001C', defaultBalance: 3950000, latencyMs: 14 },

  // Tier 2 Commercial & Investment Banks
  { id: 'stanbic', name: 'Stanbic IBTC Bank', category: 'Investment & Commercial', color: '#003DA5', defaultBalance: 8400000, latencyMs: 14 },
  { id: 'fcmb', name: 'First City Monument Bank (FCMB)', category: 'Commercial', color: '#5C068C', defaultBalance: 2400000, latencyMs: 16 },
  { id: 'fidelity', name: 'Fidelity Bank PLC', category: 'Commercial', color: '#00539F', defaultBalance: 3200000, latencyMs: 15 },
  { id: 'sterling', name: 'Sterling Bank PLC', category: 'Commercial', color: '#E31B23', defaultBalance: 1750000, latencyMs: 19 },
  { id: 'union', name: 'Union Bank of Nigeria', category: 'Commercial', color: '#0099FF', defaultBalance: 2100000, latencyMs: 20 },
  { id: 'wema', name: 'Wema Bank (ALAT)', category: 'Commercial', color: '#990033', defaultBalance: 1900000, latencyMs: 12 },
  { id: 'polaris', name: 'Polaris Bank', category: 'Commercial', color: '#4A154B', defaultBalance: 1400000, latencyMs: 22 },
  { id: 'ecobank', name: 'Ecobank Nigeria', category: 'Commercial', color: '#005B94', defaultBalance: 2850000, latencyMs: 18 },
  { id: 'standardchartered', name: 'Standard Chartered Bank', category: 'Commercial', color: '#007A3D', defaultBalance: 7500000, latencyMs: 24 },
  { id: 'citibank', name: 'Citibank Nigeria', category: 'Commercial', color: '#003B70', defaultBalance: 12000000, latencyMs: 25 },
  { id: 'unity', name: 'Unity Bank PLC', category: 'Commercial', color: '#FF6600', defaultBalance: 980000, latencyMs: 22 },
  { id: 'keystone', name: 'Keystone Bank', category: 'Commercial', color: '#005A9C', defaultBalance: 1350000, latencyMs: 21 },
  { id: 'providus', name: 'Providus Bank', category: 'Commercial', color: '#FAB915', defaultBalance: 4200000, latencyMs: 13 },
  { id: 'suntrust', name: 'SunTrust Bank', category: 'Commercial', color: '#0B2341', defaultBalance: 1100000, latencyMs: 20 },
  { id: 'parallex', name: 'Parallex Bank', category: 'Commercial', color: '#E31837', defaultBalance: 2300000, latencyMs: 14 },
  { id: 'premiumtrust', name: 'PremiumTrust Bank', category: 'Commercial', color: '#0B2E13', defaultBalance: 3400000, latencyMs: 15 },
  { id: 'signature', name: 'Signature Bank', category: 'Commercial', color: '#1A1A1A', defaultBalance: 1800000, latencyMs: 17 },
  { id: 'titantrust', name: 'Titan Trust Bank', category: 'Commercial', color: '#A30000', defaultBalance: 2900000, latencyMs: 18 },
  { id: 'optimus', name: 'Optimus Bank', category: 'Commercial', color: '#2B547E', defaultBalance: 1650000, latencyMs: 16 },

  // Non-Interest / Islamic Banks (NDIC Insured)
  { id: 'jaiz', name: 'Jaiz Bank PLC', category: 'Non-Interest', color: '#006837', defaultBalance: 2700000, latencyMs: 16 },
  { id: 'taj', name: 'TAJBank Ltd', category: 'Non-Interest', color: '#C8102E', defaultBalance: 3100000, latencyMs: 15 },
  { id: 'lotus', name: 'Lotus Bank', category: 'Non-Interest', color: '#2C5E1A', defaultBalance: 2250000, latencyMs: 14 },

  // Digital Mobile & Microfinance Banks (CBN / NDIC Regulated)
  { id: 'kuda', name: 'Kuda Microfinance Bank', category: 'Digital MFB', color: '#6C63FF', defaultBalance: 2200000, latencyMs: 8 },
  { id: 'moniepoint', name: 'Moniepoint MFB', category: 'Digital MFB', color: '#0066FF', defaultBalance: 3100000, latencyMs: 10 },
  { id: 'opay', name: 'OPay Digital Services', category: 'Digital MFB', color: '#13B156', defaultBalance: 1800000, latencyMs: 9 },
  { id: 'palmpay', name: 'PalmPay Limited', category: 'Digital MFB', color: '#6200EE', defaultBalance: 1450000, latencyMs: 11 },
  { id: 'carbon', name: 'Carbon Finance MFB', category: 'Digital Credit', color: '#2D2D2D', defaultBalance: 1850000, latencyMs: 12 },
  { id: 'rubies', name: 'Rubies Bank MFB', category: 'Digital MFB', color: '#E0115F', defaultBalance: 950000, latencyMs: 15 },
];

export const defaultNodes = bankInstitutions.slice(0, 4).map((bank, i) => ({
  id: `node-${i + 1}`,
  userId: 'user-1',
  institutionId: bank.id,
  institutionName: bank.name,
  category: bank.category,
  accountNumberMasked: `****${(1234 + i * 111).toString()}`,
  balance: bank.defaultBalance,
  currency: 'NGN' as const,
  status: 'active' as const,
  latencyMs: bank.latencyMs,
  lastWebhookSync: new Date(Date.now() - (i + 1) * 120000).toISOString(),
  monthlyFee: 0,
}));
