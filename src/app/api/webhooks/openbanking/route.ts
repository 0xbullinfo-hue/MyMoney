import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook-validator';
import { isReplayedEvent } from '@/lib/webhook-dedupe';

// Bug fix: this was previously `requireTimestamp: !!timestamp`, which let a caller
// disable the replay window simply by omitting the timestamp header — exactly the
// bypass-by-omission the validator's own doc comment warns against. Whether this
// provider signs a timestamp is a fixed integration fact, not something inferred
// per-request. Set this once you confirm your aggregator's actual signing scheme.
const PROVIDER_SIGNS_TIMESTAMP = true;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-openbanking-signature');
    const timestamp = req.headers.get('x-openbanking-timestamp');

    const result = verifyWebhookSignature(rawBody, signature, timestamp, {
      requireTimestamp: PROVIDER_SIGNS_TIMESTAMP,
    });

    if (!result.isValid) {
      console.error(`[OpenBanking Webhook] Auth failure: ${result.error}`);
      return new NextResponse(null, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // A valid signature only proves authenticity + recency, not uniqueness — a captured
    // request can still be replayed for the whole tolerance window. De-dupe on the
    // provider's event ID. NOTE: this in-memory store is demo-grade only and resets on
    // restart / doesn't work across multiple server instances — replace with a Redis or
    // DB-backed store (TTL slightly above the validator's tolerance window) in production.
    const eventId = payload.event_id ?? payload.id;
    if (!eventId) {
      console.error('[OpenBanking Webhook] Payload missing event_id/id — cannot de-dupe.');
      return new NextResponse(null, { status: 400 });
    }
    if (isReplayedEvent(eventId)) {
      console.warn(`[OpenBanking Webhook] Rejected replayed event: ${eventId}`);
      return NextResponse.json({ status: 'duplicate_ignored', nodeId: payload.node_id }, { status: 200 });
    }

    return NextResponse.json({
      status: 'telemetry_ingested',
      nodeId: payload.node_id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[OpenBanking Webhook] Internal processing failure:', err);
    return new NextResponse(null, { status: 500 });
  }
}
