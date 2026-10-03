import { NextResponse } from 'next/server';
import { InflowMatcherService } from '@/services/allocator/inflow-matcher.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, narration } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const result = await InflowMatcherService.executeManualInflowSplit(
      'usr_adekunle_01',
      amount,
      narration || 'FREELANCE RETAINER / MANUAL SPLIT TRIGGER'
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Manual split failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
