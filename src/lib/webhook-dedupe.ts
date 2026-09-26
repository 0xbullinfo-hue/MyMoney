import 'server-only';

/**
 * DEMO-GRADE ONLY. This is an in-memory Map, so it:
 *   - resets to empty on every server restart / redeploy
 *   - is NOT shared across multiple server instances (breaks under horizontal scaling)
 *
 * Before real traffic hits this: replace with a Redis (or DB) key set with a TTL a bit
 * longer than the webhook validator's replay tolerance window (see TOLERANCE_IN_SECONDS
 * in webhook-validator.ts), e.g. `SETNX event:<id> 1 EX 600`.
 */

const TTL_MS = 10 * 60 * 1000; // keep entries slightly longer than the 5-minute tolerance
const seenEvents = new Map<string, number>(); // eventId -> expiry timestamp (ms)

function sweepExpired(now: number) {
  for (const [id, expiresAt] of seenEvents) {
    if (expiresAt <= now) seenEvents.delete(id);
  }
}

/**
 * Returns true if this event ID has already been seen within the TTL window (i.e. this
 * request is a replay and should be rejected/ignored), and records it if it's new.
 */
export function isReplayedEvent(eventId: string): boolean {
  const now = Date.now();
  sweepExpired(now);

  if (seenEvents.has(eventId)) return true;

  seenEvents.set(eventId, now + TTL_MS);
  return false;
}
