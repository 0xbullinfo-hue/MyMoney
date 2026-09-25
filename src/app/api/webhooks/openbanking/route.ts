import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook-validator';

// ═══ Replay protection ═══
// The HMAC check proves authenticity and freshness within the 5-minute window,
// but a captured request can still be replayed inside that window. Providers
// send a unique event id; we remember recently-seen ids and acknowledge
// repeats without reprocessing.
// NOTE: in-memory storage is per-instance. Use Redis / a DB table with TTL
// when running more than one server instance.
const seenEventIds = new Map<string, number>();
const REPLAY_WINDOW_MS = 6 * 60 * 1000; // slightly above the 5-min tolerance

function isReplay(eventId: unknown): boolean {
  if (typeof eventId !== 'string' || !eventId) return false; // cannot dedupe without an id
  const now = Date.now();
  for (const [id, expires] of seenEventIds) {
    if (expires < now) seenEventIds.delete(id);
  }
  if (seenEventIds.has(eventId)) return true;
  seenEventIds.set(eventId, now + REPLAY_WINDOW_MS);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-openbanking-signature');
    const timestamp = req.headers.get('x-openbanking-timestamp');

    // SECURITY: requireTimestamp is true because our provider always signs timestamp.body
    const result = verifyWebhookSignature(rawBody, signature, timestamp, {
      requireTimestamp: true,
    });

    if (!result.isValid) {
      console.error(`[OpenBanking Webhook] Auth failure: ${result.error}`);
      return new NextResponse(null, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Idempotent acknowledge: already processed inside the replay window
    if (isReplay(payload.event_id ?? payload.id)) {
      return new NextResponse(null, { status: 204 });
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
