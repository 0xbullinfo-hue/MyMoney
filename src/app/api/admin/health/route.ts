import { NextResponse } from 'next/server';
import { mockAdminEndpoints, mockWebhookLogs } from '@/lib/mock-data/admin-metrics';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const totalEndpoints = mockAdminEndpoints.length;
  const operationalEndpoints = mockAdminEndpoints.filter((e) => e.status === 200).length;
  const degradedEndpoints = mockAdminEndpoints.filter((e) => e.status !== 200).length;
  const avgLatency = Math.round(
    mockAdminEndpoints.reduce((acc, e) => acc + e.latency, 0) / totalEndpoints
  );

  return NextResponse.json({
    status: degradedEndpoints === 0 ? 'healthy' : 'degraded',
    uptime: '99.98%',
    totalEndpoints,
    operationalEndpoints,
    degradedEndpoints,
    avgLatency,
    endpoints: mockAdminEndpoints,
    recentWebhookLogs: mockWebhookLogs.slice(0, 5),
    timestamp: new Date().toISOString(),
  });
}
