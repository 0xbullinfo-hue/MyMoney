import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getMemoryConfig, updateMemoryConfig } from '@/services/payday';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { skip } = body as { skip: boolean };

    if (typeof skip !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Field "skip" must be a boolean.' },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured()) {
      const config = await prisma.paydayConfig.findFirst();
      if (config) {
        const updated = await prisma.paydayConfig.update({
          where: { id: config.id },
          data: { skipNextInflow: skip },
          include: { rules: true },
        });

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }
    }

    // Memory fallback update
    const updated = updateMemoryConfig({ skipNextInflow: skip });
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('[API /api/payday/skip-next Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle skip-next payday.' },
      { status: 500 }
    );
  }
}
