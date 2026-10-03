import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getMemoryConfig, updateMemoryConfig, validateSplitRules } from '@/services/payday';
import { PaydaySplitRule } from '@/types/payday';

export async function GET() {
  try {
    if (isDatabaseConfigured()) {
      const config = await prisma.paydayConfig.findFirst({
        include: { rules: { orderBy: { priority: 'asc' } } },
      });
      if (config) {
        return NextResponse.json({ success: true, data: config }, { status: 200 });
      }
    }

    const config = getMemoryConfig();
    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error) {
    console.error('[API /api/payday/rules GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payday rules.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { rules } = body as { rules: PaydaySplitRule[] };

    if (!Array.isArray(rules)) {
      return NextResponse.json(
        { success: false, error: 'Field "rules" must be an array of PaydaySplitRule.' },
        { status: 400 }
      );
    }

    // 1. Enforce 100% percentage allocation ceiling
    const validation = validateSplitRules(rules);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured()) {
      const config = await prisma.paydayConfig.findFirst();
      if (config) {
        // Atomic transaction: delete existing rules and recreate new ones
        await prisma.$transaction([
          prisma.paydaySplitRule.deleteMany({
            where: { paydayConfigId: config.id },
          }),
          prisma.paydaySplitRule.createMany({
            data: rules.map((r, idx) => ({
              paydayConfigId: config.id,
              name: r.name,
              targetVaultId: r.targetVaultId,
              targetVaultName: r.targetVaultName,
              type: r.type,
              value: r.value,
              priority: r.priority || idx + 1,
              autoCardTopup: r.autoCardTopup || false,
              autoBillPay: r.autoBillPay || false,
              isPaused: r.isPaused || false,
            })),
          }),
        ]);

        const updated = await prisma.paydayConfig.findUnique({
          where: { id: config.id },
          include: { rules: { orderBy: { priority: 'asc' } } },
        });

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }
    }

    // Memory fallback update
    const updated = updateMemoryConfig({ rules });
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('[API /api/payday/rules PUT Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payday rules.' },
      { status: 500 }
    );
  }
}
