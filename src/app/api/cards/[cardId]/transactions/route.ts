import { NextResponse } from 'next/server';
import { BridgecardService } from '@/services/cards/bridgecard.service';

export async function GET(
  req: Request,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await context.params;
    const transactions = await BridgecardService.getCardTransactions(cardId);
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('[API /api/cards/[cardId]/transactions GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve card transactions' },
      { status: 500 }
    );
  }
}
