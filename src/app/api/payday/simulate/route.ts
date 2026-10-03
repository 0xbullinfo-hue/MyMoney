import { NextRequest, NextResponse } from 'next/server';
import { 
  evaluatePaydayInflowGuard, 
  enqueuePendingPayday, 
  getAllActiveJobs 
} from '@/services/payday';

export async function GET() {
  const activeJobs = getAllActiveJobs().map((j) => ({
    id: j.id,
    userId: j.userId,
    inflowAmount: j.inflowAmount,
    narration: j.narration,
    receivingBank: j.receivingBank,
    enqueuedAt: j.enqueuedAt,
    delayMs: j.delayMs,
    expiresAt: j.expiresAt,
    status: j.status,
    remainingSeconds: Math.max(0, Math.ceil((j.expiresAt - Date.now()) / 1000)),
  }));

  return NextResponse.json({ success: true, data: activeJobs }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      amount = 1250000, 
      narration = 'OCT 2026 SALARY / EXECUTIVE PAYROLL',
      receivingBank = 'GTBank (0123456789)' 
    } = body as { amount?: number; narration?: string; receivingBank?: string };

    const userId = 'usr_adekunle_01';

    // 1. Inflow Evaluation Middleware Guard
    const guardResult = await evaluatePaydayInflowGuard(userId, amount, narration, receivingBank);

    if (!guardResult.allowed) {
      return NextResponse.json(
        {
          success: true,
          data: {
            dispatched: false,
            bypassReason: guardResult.bypassReason,
            message: `Inflow bypassed by lifecycle guard (${guardResult.bypassReason}). Funds remain untouched in receiving account.`,
          },
        },
        { status: 200 }
      );
    }

    // 2. Enqueue into 30-second delay queue / safety window
    const job = enqueuePendingPayday(
      userId,
      guardResult.config,
      amount,
      narration,
      receivingBank,
      30000 // 30-second safety window
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          dispatched: true,
          jobId: job.id,
          expiresAt: job.expiresAt,
          delaySeconds: 30,
          message: 'Inflow accepted! Holding in 30-second safety window before vendor settlement dispatch.',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/payday/simulate Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to simulate payday inflow.' },
      { status: 500 }
    );
  }
}
