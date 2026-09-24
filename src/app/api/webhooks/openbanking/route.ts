import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook-validator';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-openbanking-signature');
    const timestamp = req.headers.get('x-openbanking-timestamp');

    const result = verifyWebhookSignature(rawBody, signature, timestamp, {
      requireTimestamp: !!timestamp,
    });

    if (!result.isValid) {
      console.error(`[OpenBanking Webhook] Auth failure: ${result.error}`);
      return new NextResponse(null, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

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
