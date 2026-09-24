import 'server-only';
import crypto from 'crypto';

const TOLERANCE_IN_SECONDS = 300; // 5-minute clock-skew window

export interface WebhookValidationResult {
  isValid: boolean;
  /** For server logs only. Never return this to the caller; respond with a bare 401. */
  error?: string;
}

export interface VerifyOptions {
  /**
   * Whether the provider signs `${timestamp}.${body}` (true, default) or just the body (false).
   * This must be fixed per provider, never inferred from whether a header happens to be present.
   */
  requireTimestamp?: boolean;
}

// Current secret plus an optional previous one, so you can rotate without dropping events.
function getSecrets(): string[] {
  const current = process.env.OPENBANKING_WEBHOOK_SECRET;
  if (!current || current.length < 32) {
    throw new Error('OPENBANKING_WEBHOOK_SECRET must be configured with at least 32 characters.');
  }
  const previous = process.env.OPENBANKING_WEBHOOK_SECRET_PREVIOUS;
  return previous && previous.length >= 32 ? [current, previous] : [current];
}

/**
 * Verifies an HMAC-SHA256 webhook signature in constant time.
 *
 * IMPORTANT: this only proves the request is authentic and recent. A captured request can
 * still be replayed inside the tolerance window, so the caller must also de-duplicate on the
 * provider's event ID (store it with a TTL slightly above the window and reject repeats).
 *
 * @param rawBody - The exact bytes received. Use `await request.text()` or `arrayBuffer()`,
 *                  never `JSON.stringify(await request.json())`.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  timestampHeader: string | null = null,
  { requireTimestamp = true }: VerifyOptions = {}
): WebhookValidationResult {
  if (!signatureHeader) {
    return { isValid: false, error: 'Missing signature header' };
  }

  const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  let payload: Buffer = body;

  if (requireTimestamp) {
    // Strict: exactly 10 digits (Unix seconds). parseInt would accept "1712345678abc".
    if (!timestampHeader || !/^\d{10}$/.test(timestampHeader)) {
      return { isValid: false, error: 'Missing or malformed timestamp' };
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - Number(timestampHeader)) > TOLERANCE_IN_SECONDS) {
      return { isValid: false, error: 'Timestamp outside tolerance' };
    }
    payload = Buffer.concat([Buffer.from(`${timestampHeader}.`, 'utf8'), body]);
  }

  const signatureHex = signatureHeader.replace(/^sha256=/i, '');
  if (!/^[0-9a-fA-F]{64}$/.test(signatureHex)) {
    return { isValid: false, error: 'Malformed signature' };
  }
  const provided = Buffer.from(signatureHex, 'hex');

  // Check every configured secret without short-circuiting.
  let matched = false;
  for (const secret of getSecrets()) {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest();
    if (crypto.timingSafeEqual(provided, expected)) matched = true;
  }

  return matched ? { isValid: true } : { isValid: false, error: 'Signature mismatch' };
}
