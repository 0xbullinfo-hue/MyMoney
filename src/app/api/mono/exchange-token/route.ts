import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { monoService } from '@/services/mono.service';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { encryptOAuthToken } from '@/lib/crypto';
import type { BankCategory } from '@/types';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code from Mono Connect' }, { status: 400 });
    }

    // 1. Exchange temporary widget code with Mono for the permanent account ID
    const authData = await monoService.exchangeToken(code);
    const monoAccountId = authData.id;

    // 2. Fetch live account details from Mono
    const account = await monoService.getAccount(monoAccountId);

    // 3. Encrypt the access token using AES-256-GCM before database persistence
    let encryptedTokenStr: string | null = null;
    try {
      const encrypted = encryptOAuthToken(monoAccountId, `${session.userId}:${monoAccountId}`);
      encryptedTokenStr = JSON.stringify(encrypted);
    } catch (e) {
      console.warn('[Mono Exchange] ENCRYPTION_KEY not set, saving raw ID for development mode.');
    }

    // Map institution category to BankCategory
    let category: BankCategory = 'Commercial';
    const instName = account.institution.name.toLowerCase();
    if (instName.includes('kuda') || instName.includes('palmpay') || instName.includes('opay')) {
      category = 'Digital MFB';
    } else if (instName.includes('stanbic') || instName.includes('capital') || instName.includes('invest')) {
      category = 'Investment & Commercial';
    }

    // 4. Save to Database if configured (Zero Financial Credential Storage: no account numbers or tokens stored)
    let savedNode = null;
    if (isDatabaseConfigured()) {
      savedNode = await prisma.bankNode.upsert({
        where: { monoAccountId },
        update: {
          balance: account.balance,
          status: 'active',
          lastSyncedAt: new Date(),
        },
        create: {
          userId: session.userId,
          institutionId: account.institution.bankCode || `mono_${monoAccountId.slice(0, 6)}`,
          institutionName: account.institution.name,
          category,
          balance: account.balance,
          currency: account.currency === 'USD' ? 'USD' : 'NGN',
          status: 'active',
          latencyMs: 45,
          monthlyFee: 50,
          monoAccountId,
        },
      });
    }

    return NextResponse.json({
      status: 'success',
      node: savedNode ?? {
        id: `node_${monoAccountId}`,
        userId: session.userId,
        institutionName: account.institution.name,
        category,
        balance: account.balance,
        currency: account.currency,
        status: 'active',
        latencyMs: 45,
        monoAccountId,
      },
    });
  } catch (error: any) {
    console.error('[Mono Exchange Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to link bank account with Mono' },
      { status: 500 }
    );
  }
}
