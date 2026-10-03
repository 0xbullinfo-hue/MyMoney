import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getMemoryConfig, updateMemoryConfig } from '@/services/payday';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;
    const body = await req.json();
    const { isPaused } = body as { isPaused: boolean };

    if (typeof isPaused !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Field "isPaused" must be a boolean.' },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured()) {
      const updatedRule = await prisma.paydaySplitRule.update({
        where: { id: ruleId },
        data: { isPaused },
      });
      return NextResponse.json({ success: true, data: updatedRule }, { status: 200 });
    }

    // Memory fallback update
    const config = getMemoryConfig();
    const updatedRules = config.rules.map((r) =>
      r.id === ruleId ? { ...r, isPaused } : r
    );
    const updatedConfig = updateMemoryConfig({ rules: updatedRules });

    return NextResponse.json({ success: true, data: updatedConfig }, { status: 200 });
  } catch (error) {
    console.error('[API /api/payday/rules/:ruleId/toggle Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle rule pause state.' },
      { status: 500 }
    );
  }
}
