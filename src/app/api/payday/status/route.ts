import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getMemoryConfig, updateMemoryConfig } from '@/services/payday';
import { PaydayStatus } from '@/types/payday';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, pauseReason } = body as { status: PaydayStatus; pauseReason?: string };

    if (!['ACTIVE', 'PAUSED', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be ACTIVE, PAUSED, or INACTIVE.' },
        { status: 400 }
      );
    }

    const pausedAt = status === 'PAUSED' ? new Date().toISOString() : null;

    if (isDatabaseConfigured()) {
      const config = await prisma.paydayConfig.findFirst();
      if (config) {
        const updated = await prisma.paydayConfig.update({
          where: { id: config.id },
          data: {
            status,
            pausedAt: pausedAt ? new Date(pausedAt) : null,
            pauseReason: status === 'PAUSED' ? (pauseReason || 'User paused automation') : null,
          },
          include: { rules: true },
        });

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }
    }

    // Memory fallback update
    const updated = updateMemoryConfig({
      status,
      pausedAt,
      pauseReason: status === 'PAUSED' ? (pauseReason || 'User paused automation') : null,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('[API /api/payday/status Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payday status.' },
      { status: 500 }
    );
  }
}
