import { NextResponse } from 'next/server';
import { VTPassService } from '@/services/bills/vtpass.service';

export async function GET() {
  try {
    const history = await VTPassService.getRechargeHistory();
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('[API /api/bills/history GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve recharge history' },
      { status: 500 }
    );
  }
}
