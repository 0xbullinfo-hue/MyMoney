import type { BankNode, Transaction, SubscriptionItem, NodeStatus } from '@/types';
import { bankInstitutions } from '@/lib/mock-data/banks';

export function simulateWebhookIngestion(nodeId: string): { status: string; nodeId: string; timestamp: string } {
  return {
    status: 'telemetry_ingested',
    nodeId,
    timestamp: new Date().toISOString(),
  };
}

export function generateMockTransactions(nodeId: string, count: number): Transaction[] {
  const categories: Transaction['category'][] = ['Operations', 'Growth', 'Subscriptions', 'Lifestyle', 'Transfers'];
  const merchants = ['Bolt Technology', 'Netflix NG', 'MTN Nigeria', 'Shoprite NG', 'AWS', 'Paystack', 'Flutterwave'];
  const bank = bankInstitutions.find((b) => b.id === nodeId) || bankInstitutions[0];

  return Array.from({ length: count }, (_, i) => ({
    id: `gen-tx-${Date.now()}-${i}`,
    nodeId,
    institutionName: bank.name,
    amount: Math.round(Math.random() * 500000 + 1000),
    type: (Math.random() > 0.3 ? 'debit' : 'credit') as 'debit' | 'credit',
    category: categories[Math.floor(Math.random() * categories.length)],
    description: `Auto-generated transaction ${i + 1}`,
    merchantName: merchants[Math.floor(Math.random() * merchants.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    isSubscription: Math.random() > 0.8,
    isFlaggedZombie: Math.random() > 0.9,
  }));
}

export function simulateOAuthFlow(institutionId: string): { token: string; expiresIn: number } {
  return {
    token: `mock_oauth_${institutionId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    expiresIn: 3600,
  };
}

export function getNodeHealthStatus(node: BankNode): NodeStatus {
  if (node.latencyMs > 200) return 'degraded';
  if (node.latencyMs > 500) return 'rate_limited';
  if (node.status === 'disconnected') return 'disconnected';
  return 'active';
}

export function calculateWebhookLatency(): number {
  return Math.floor(Math.random() * 30 + 5);
}

export function detectZombieSubscriptions(subscriptions: SubscriptionItem[]): SubscriptionItem[] {
  return subscriptions.filter((s) => s.daysInactive > 30 && s.status !== 'blocked');
}
