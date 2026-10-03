import { NextResponse } from 'next/server';
import { BridgecardService } from '@/services/cards/bridgecard.service';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { freeze } = body;

    const card = await BridgecardService.toggleFreezeCard(cardId, freeze);
    return NextResponse.json({ success: true, data: card });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update card freeze state';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
