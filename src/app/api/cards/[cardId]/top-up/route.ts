import { NextResponse } from 'next/server';
import { BridgecardService } from '@/services/cards/bridgecard.service';

export async function POST(
  req: Request,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await context.params;
    const body = await req.json();
    const { amountUnits, sourceSubVaultId } = body;

    if (!amountUnits || amountUnits <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid top-up amount' },
        { status: 400 }
      );
    }

    const result = await BridgecardService.topUpCard(
      cardId,
      amountUnits,
      sourceSubVaultId || 'vault_sub'
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Card top-up failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
