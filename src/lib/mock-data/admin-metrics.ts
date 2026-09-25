import type { User, WebhookLog, EnvelopeBudget, DebtItem, AdminEndpoint } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-1', email: 'adekunle@mymoney.ng', name: 'Adekunle Okonkwo', tier: 'premium', suspended: false, stealthModeEnabled: false, globalCardFreeze: false, createdAt: '2026-01-15T09:00:00Z' },
  { id: 'user-2', email: 'chioma@gmail.com', name: 'Chioma Adebayo', tier: 'free', suspended: true, stealthModeEnabled: true, globalCardFreeze: false, createdAt: '2026-04-22T14:30:00Z' },
  { id: 'user-3', email: 'emeka.corp@company.ng', name: 'Emeka Nwosu', tier: 'premium_plus', suspended: false, stealthModeEnabled: false, globalCardFreeze: false, createdAt: '2025-11-01T08:00:00Z' },
  { id: 'user-4', email: 'fatima@mymoney.ng', name: 'Fatima Abdullahi', tier: 'premium', suspended: false, stealthModeEnabled: false, globalCardFreeze: true, createdAt: '2026-06-10T11:15:00Z' },
  { id: 'user-5', email: 'bola.test@outlook.com', name: 'Bola Ogundimu', tier: 'free', suspended: false, stealthModeEnabled: false, globalCardFreeze: false, createdAt: '2026-08-03T16:45:00Z' },
];

export const mockWebhookLogs: WebhookLog[] = [
  { id: 'wh-1', institutionId: 'gtb', endpoint: '/api/webhooks/openbanking', statusCode: 200, latencyMs: 12, payloadSignature: 'a1b2c3d4e5f6', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'success' },
  { id: 'wh-2', institutionId: 'stanbic', endpoint: '/api/webhooks/openbanking', statusCode: 200, latencyMs: 14, payloadSignature: 'f6e5d4c3b2a1', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'success' },
  { id: 'wh-3', institutionId: 'zenith', endpoint: '/api/webhooks/openbanking', statusCode: 429, latencyMs: 340, payloadSignature: 'x9y8z7w6v5u4', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'retrying' },
  { id: 'wh-4', institutionId: 'kuda', endpoint: '/api/webhooks/openbanking', statusCode: 200, latencyMs: 8, payloadSignature: 'q1w2e3r4t5y6', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'success' },
  { id: 'wh-5', institutionId: 'zenith', endpoint: '/api/webhooks/openbanking', statusCode: 500, latencyMs: 5000, payloadSignature: 'm1n2b3v4c5x6', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'failed' },
  { id: 'wh-6', institutionId: 'carbon', endpoint: '/api/webhooks/openbanking', statusCode: 200, latencyMs: 22, payloadSignature: 'p9o8i7u6y5t4', timestamp: new Date(Date.now() - 2400000).toISOString(), status: 'success' },
];

export const mockEnvelopes: EnvelopeBudget[] = [
  { id: 'env-1', category: 'Operations', allocatedAmount: 500000, spentAmount: 367000, targetWarningThreshold: 0.85 },
  { id: 'env-2', category: 'Lifestyle', allocatedAmount: 200000, spentAmount: 58750, targetWarningThreshold: 0.85 },
  { id: 'env-3', category: 'Subscriptions', allocatedAmount: 100000, spentAmount: 92400, targetWarningThreshold: 0.80 },
  { id: 'env-4', category: 'Growth', allocatedAmount: 300000, spentAmount: 225000, targetWarningThreshold: 0.85 },
  { id: 'env-5', category: 'Transfers', allocatedAmount: 1000000, spentAmount: 450000, targetWarningThreshold: 0.90 },
];

export const mockDebts: DebtItem[] = [
  { id: 'debt-1', name: 'Vehicle Asset Finance', balance: 1200000, apr: 18.5, minPayment: 45000 },
  { id: 'debt-2', name: 'Business Credit Line', balance: 800000, apr: 22.0, minPayment: 32000 },
  { id: 'debt-3', name: 'Equipment Lease', balance: 200000, apr: 12.0, minPayment: 15000 },
];

export const mockAdminEndpoints: AdminEndpoint[] = [
  { name: 'CBN Open Banking Gateway', status: 200, latency: 18, queue: 0 },
  { name: 'GTBank Direct OAuth Node', status: 200, latency: 12, queue: 0 },
  { name: 'Zenith API Telemetry', status: 429, latency: 340, queue: 14 },
  { name: 'Kuda Microfinance Sync', status: 200, latency: 9, queue: 0 },
];
