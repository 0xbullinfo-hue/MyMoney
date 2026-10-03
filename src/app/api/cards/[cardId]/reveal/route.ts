import { NextResponse } from 'next/server';
import { BridgecardService } from '@/services/cards/bridgecard.service';

export async function POST(
  req: Request,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await context.params;
    const body = await req.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'Verification PIN is required' },
        { status: 400 }
      );
    }

    const details = await BridgecardService.revealCardDetails(cardId, pin);
    return NextResponse.json({ success: true, data: details });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
