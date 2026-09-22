import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.OPENBANKING_WEBHOOK_SECRET || 'fallback-secret-key-32-chars-min!!';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-openbanking-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-openbanking-signature header' }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid HMAC signature payload' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    return NextResponse.json({
      status: 'telemetry_ingested',
      nodeId: payload.node_id,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Internal telemetry processing failure' }, { status: 500 });
  }
}
