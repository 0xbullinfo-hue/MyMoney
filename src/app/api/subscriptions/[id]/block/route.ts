import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    status: 'success',
    action: 'subscription_blocked',
    subscriptionId: id,
    blockedAt: new Date().toISOString(),
    message: `Kill-switch activated: Auto-debit authorization revoked for ${id}.`,
  });
}
