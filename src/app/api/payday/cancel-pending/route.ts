import { NextRequest, NextResponse } from 'next/server';
import { cancelPendingPayday, getActiveJobForUser, getAllActiveJobs } from '@/services/payday';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobId } = body as { jobId?: string };

    let targetJobId = jobId;

    // If no specific jobId provided, attempt to cancel any active safety window job
    if (!targetJobId) {
      const activeJobs = getAllActiveJobs();
      if (activeJobs.length > 0) {
        targetJobId = activeJobs[0].id;
      }
    }

    if (!targetJobId) {
      return NextResponse.json(
        { success: false, error: 'No active pending payday execution in safety window.' },
        { status: 404 }
      );
    }

    const cancelled = cancelPendingPayday(targetJobId, 'Emergency Kill Switch triggered by operator.');

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Execution job could not be aborted. It may have already dispatched or expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          abortedJobId: targetJobId,
          message: 'Emergency kill switch triggered successfully. Pending vendor disbursements halted.',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/payday/cancel-pending Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to abort pending execution.' },
      { status: 500 }
    );
  }
}
