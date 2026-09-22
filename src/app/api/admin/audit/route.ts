import { NextResponse } from 'next/server';
import { mockWebhookLogs } from '@/lib/mock-data/admin-metrics';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { calculateRiskScore } from '@/services/risk-engine.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const minRisk = parseInt(searchParams.get('minRisk') || '0');

  await new Promise((resolve) => setTimeout(resolve, 200));

  let webhookLogs = [...mockWebhookLogs];
  if (status) {
    webhookLogs = webhookLogs.filter((w) => w.status === status);
  }

  const flaggedTransactions = mockTransactions
    .map((tx) => ({
      ...tx,
      riskScore: calculateRiskScore(tx),
    }))
    .filter((tx) => tx.riskScore >= minRisk)
    .sort((a, b) => b.riskScore - a.riskScore);

  return NextResponse.json({
    webhookLogs,
    flaggedTransactions: flaggedTransactions.slice(0, 20),
    totalAuditEvents: webhookLogs.length + flaggedTransactions.length,
    timestamp: new Date().toISOString(),
  });
}
