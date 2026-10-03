import { NextResponse } from 'next/server';
import { TimedTransferService } from '@/services/rules/timed-transfer.service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { forceExecuteRuleId } = body;

    const results = await TimedTransferService.evaluateAndExecuteDueRules(
      'usr_adekunle_01',
      forceExecuteRuleId
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Evaluation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
