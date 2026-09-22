import type { BankInstitution } from '@/types';

export const bankInstitutions: BankInstitution[] = [
  { id: 'gtb', name: 'GTBank PLC', category: 'Commercial', color: '#E44D26', defaultBalance: 14250000, latencyMs: 12 },
  { id: 'stanbic', name: 'Stanbic IBTC', category: 'Investment', color: '#003DA5', defaultBalance: 8400000, latencyMs: 14 },
  { id: 'kuda', name: 'Kuda Bank MFB', category: 'Digital MFB', color: '#6C63FF', defaultBalance: 2200000, latencyMs: 8 },
  { id: 'carbon', name: 'Carbon Credit', category: 'Credit Line', color: '#2D2D2D', defaultBalance: 1850000, latencyMs: 22 },
  { id: 'zenith', name: 'Zenith Bank PLC', category: 'Commercial', color: '#E41E31', defaultBalance: 5600000, latencyMs: 18 },
  { id: 'moniepoint', name: 'Moniepoint MFB', category: 'Business', color: '#0066FF', defaultBalance: 3100000, latencyMs: 10 },
];

export const defaultNodes = bankInstitutions.slice(0, 3).map((bank, i) => ({
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
