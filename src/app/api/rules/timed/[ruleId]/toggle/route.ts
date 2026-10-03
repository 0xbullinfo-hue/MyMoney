import { NextResponse } from 'next/server';
import { TimedTransferService } from '@/services/rules/timed-transfer.service';
import type { TimedRuleStatus } from '@/types/rules';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await context.params;
    const body = await req.json();
    const { status } = body as { status: TimedRuleStatus };

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = await TimedTransferService.toggleRuleStatus(ruleId, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update rule status';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
