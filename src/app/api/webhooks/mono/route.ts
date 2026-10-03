import { NextRequest, NextResponse } from 'next/server';
import { monoService } from '@/services/mono.service';
import { isReplayedEvent } from '@/lib/webhook-dedupe';
import { prisma, isDatabaseConfigured } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('mono-webhook-secret') || req.headers.get('x-mono-signature');

    // 1. Verify Mono signature
    if (!monoService.verifyWebhookSignature(signature, rawBody)) {
      console.warn('[Mono Webhook] Signature verification failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event; // e.g. "mono.events.account_connected", "mono.events.account_updated"
    const data = payload.data;
    const eventId = payload.id || `${event}_${data?.account?._id || data?.id}_${Date.now()}`;

    // 2. Replay deduplication
    if (isReplayedEvent(eventId)) {
      console.warn(`[Mono Webhook] Duplicate event rejected: ${eventId}`);
      return NextResponse.json({ status: 'duplicate_ignored' }, { status: 200 });
    }

    // 3. Process Event Types
    if (event === 'mono.events.account_updated' && data?.account) {
      const accountId = data.account._id;
      const newBalance = data.account.balance ? data.account.balance / 100 : undefined;

      if (isDatabaseConfigured() && accountId && newBalance !== undefined) {
        await prisma.bankNode.updateMany({
          where: { monoAccountId: accountId },
          data: {
            balance: newBalance,
            lastSyncedAt: new Date(),
          },
        });
      }
    } else if (event === 'mono.events.reauthorisation_required' && data?.account) {
      const accountId = data.account._id;
      if (isDatabaseConfigured() && accountId) {
        await prisma.bankNode.updateMany({
          where: { monoAccountId: accountId },
          data: { status: 'disconnected' },
        });
      }
    } else if (
      event === 'mono.events.account_credited' ||
      event === 'account.credit_alert' ||
      (event === 'mono.events.account_updated' && data?.amount && data?.type === 'credit')
    ) {
      const creditAmount = (data?.amount || 0) / 100;
      const narration = data?.narration || data?.description || 'MONO CREDIT INFLOW';
      const accountId = data?.account?._id || data?.account;

      // Find user from bank node
      let userId = 'usr_adekunle_01';
      if (isDatabaseConfigured() && accountId) {
        const node = await prisma.bankNode.findFirst({
          where: { monoAccountId: accountId },
          select: { userId: true },
        });
        if (node?.userId) userId = node.userId;
      }

      // Run PaydayGuard
      const { evaluatePaydayInflowGuard, enqueuePendingPayday } = await import('@/services/payday');
      const guardResult = await evaluatePaydayInflowGuard(userId, creditAmount, narration);

      if (guardResult.allowed) {
        // Enqueue into 30s safety window queue
        enqueuePendingPayday(userId, guardResult.config, creditAmount, narration);
      }
    }

    // 4. Log Webhook Event
    if (isDatabaseConfigured()) {
      await prisma.webhookEvent.create({
        data: {
          eventId,
          provider: 'mono',
          eventType: event,
          status: 'processed',
          payload: rawBody,
        },
      });
    }

    return NextResponse.json({ status: 'success', event });
  } catch (error) {
    console.error('[Mono Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
