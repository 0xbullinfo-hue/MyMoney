import type { SubscriptionItem } from '@/types';

export const mockSubscriptions: SubscriptionItem[] = [
  { id: 'sub-1', nodeId: 'node-1', merchantName: 'Netflix Premium NG', amount: 5500, billingCycle: 'monthly', lastBilledDate: '2026-09-01', nextBillingDate: '2026-10-01', daysInactive: 0, status: 'active' },
  { id: 'sub-2', nodeId: 'node-1', merchantName: 'Spotify Premium Individual', amount: 1800, billingCycle: 'monthly', lastBilledDate: '2026-08-15', nextBillingDate: '2026-09-15', daysInactive: 45, status: 'flagged_zombie' },
  { id: 'sub-3', nodeId: 'node-2', merchantName: 'AWS Cloud Infrastructure', amount: 150000, billingCycle: 'monthly', lastBilledDate: '2026-09-05', nextBillingDate: '2026-10-05', daysInactive: 0, status: 'active' },
  { id: 'sub-4', nodeId: 'node-1', merchantName: 'DStv Compact Plus Bouquet', amount: 14500, billingCycle: 'monthly', lastBilledDate: '2026-07-20', nextBillingDate: '2026-08-20', daysInactive: 62, status: 'flagged_zombie' },
  { id: 'sub-5', nodeId: 'node-2', merchantName: 'Apple iCloud 2TB Family', amount: 6900, billingCycle: 'monthly', lastBilledDate: '2026-09-10', nextBillingDate: '2026-10-10', daysInactive: 0, status: 'active' },
  { id: 'sub-6', nodeId: 'node-1', merchantName: 'Mixpanel Analytics SaaS', amount: 12400, billingCycle: 'monthly', lastBilledDate: '2026-09-08', nextBillingDate: '2026-10-08', daysInactive: 90, status: 'flagged_zombie' },
  { id: 'sub-7', nodeId: 'node-3', merchantName: 'Starlink High-Speed Residential', amount: 38000, billingCycle: 'monthly', lastBilledDate: '2026-09-12', nextBillingDate: '2026-10-12', daysInactive: 0, status: 'active' },
  { id: 'sub-8', nodeId: 'node-2', merchantName: 'GitHub Copilot Business', amount: 15000, billingCycle: 'monthly', lastBilledDate: '2026-09-02', nextBillingDate: '2026-10-02', daysInactive: 0, status: 'active' },
  { id: 'sub-9', nodeId: 'node-1', merchantName: 'YouTube Premium Family', amount: 2200, billingCycle: 'monthly', lastBilledDate: '2026-09-14', nextBillingDate: '2026-10-14', daysInactive: 0, status: 'active' },
  { id: 'sub-10', nodeId: 'node-3', merchantName: 'MTN 5G Home Broadband', amount: 20000, billingCycle: 'monthly', lastBilledDate: '2026-09-07', nextBillingDate: '2026-10-07', daysInactive: 0, status: 'active' },
  { id: 'sub-11', nodeId: 'node-2', merchantName: 'OpenAI ChatGPT Plus', amount: 32000, billingCycle: 'monthly', lastBilledDate: '2026-09-11', nextBillingDate: '2026-10-11', daysInactive: 0, status: 'active' },
  { id: 'sub-12', nodeId: 'node-1', merchantName: 'Chowdeck Premium Delivery Pass', amount: 3500, billingCycle: 'monthly', lastBilledDate: '2026-09-03', nextBillingDate: '2026-10-03', daysInactive: 38, status: 'flagged_zombie' },
];
