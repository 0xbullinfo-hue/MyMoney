import { NextResponse } from 'next/server';
import { BridgecardService } from '@/services/cards/bridgecard.service';

export async function GET() {
  try {
    const cards = await BridgecardService.getUserCards('usr_adekunle_01');
    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error('[API /api/cards GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve virtual cards' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nickname, currency, brand, designTheme, spendLimitMonthly } = body;

    if (!nickname || !currency || !brand) {
      return NextResponse.json(
        { success: false, error: 'Missing required card issuance parameters' },
        { status: 400 }
      );
    }

    const newCard = await BridgecardService.issueCard('usr_adekunle_01', {
      nickname,
      currency,
      brand,
      designTheme,
      spendLimitMonthly,
    });

    return NextResponse.json({ success: true, data: newCard }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to issue card';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
