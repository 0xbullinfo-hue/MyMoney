import type { SubscriptionItem } from '@/types';

export const mockSubscriptions: SubscriptionItem[] = [
  { id: 'sub-1', nodeId: 'node-1', merchantName: 'Netflix Premium NG', amount: 5500, billingCycle: 'monthly', lastBilledDate: '2026-09-01', nextBillingDate: '2026-10-01', daysInactive: 0, status: 'active' },
  { id: 'sub-2', nodeId: 'node-1', merchantName: 'Spotify Premium', amount: 1800, billingCycle: 'monthly', lastBilledDate: '2026-08-15', nextBillingDate: '2026-09-15', daysInactive: 45, status: 'flagged_zombie' },
  { id: 'sub-3', nodeId: 'node-2', merchantName: 'AWS Cloud Infrastructure', amount: 150000, billingCycle: 'monthly', lastBilledDate: '2026-09-05', nextBillingDate: '2026-10-05', daysInactive: 0, status: 'active' },
  { id: 'sub-4', nodeId: 'node-1', merchantName: 'DStv Compact Plus', amount: 4200, billingCycle: 'monthly', lastBilledDate: '2026-07-20', nextBillingDate: '2026-08-20', daysInactive: 62, status: 'flagged_zombie' },
  { id: 'sub-5', nodeId: 'node-2', merchantName: 'Udemy Pro Annual', amount: 75000, billingCycle: 'annual', lastBilledDate: '2026-03-10', nextBillingDate: '2027-03-10', daysInactive: 0, status: 'active' },
  { id: 'sub-6', nodeId: 'node-1', merchantName: 'Mixpanel Analytics SaaS', amount: 12400, billingCycle: 'monthly', lastBilledDate: '2026-09-08', nextBillingDate: '2026-10-08', daysInactive: 90, status: 'flagged_zombie' },
  { id: 'sub-7', nodeId: 'node-3', merchantName: 'Spectranet Internet', amount: 45000, billingCycle: 'monthly', lastBilledDate: '2026-09-12', nextBillingDate: '2026-10-12', daysInactive: 0, status: 'active' },
  { id: 'sub-8', nodeId: 'node-2', merchantName: 'Cloud Infrastructure Node', amount: 48500, billingCycle: 'monthly', lastBilledDate: '2026-09-10', nextBillingDate: '2026-10-10', daysInactive: 0, status: 'active' },
];
