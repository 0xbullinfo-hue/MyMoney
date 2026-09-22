import { NextResponse } from 'next/server';
import { mockSubscriptions } from '@/lib/mock-data/subscriptions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...mockSubscriptions];

  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((s) => s.merchantName.toLowerCase().includes(term));
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    zombieCount: filtered.filter((s) => s.status === 'flagged_zombie').length,
    totalMonthlyRecurring: filtered.reduce((acc, s) => acc + (s.billingCycle === 'monthly' ? s.amount : Math.round(s.amount / 12)), 0),
  });
}
