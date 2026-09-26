import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { SubscriptionTier } from '@/types';

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; phone?: string; password?: string; tier?: SubscriptionTier };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password || process.env.DEMO_PASSWORD || 'MyMoney2026!';
  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const tier: SubscriptionTier = body.tier ?? 'free';
  let userId = `new-${Date.now()}`;

  // 1. Create user in database if configured
  if (isDatabaseConfigured()) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          phone: body.phone,
          passwordHash,
          tier,
          isAdmin: false,
          paydayRule: {
            create: {
              minInflowThreshold: 250000,
              narrationKeywords: 'SALARY,DIVIDEND,CONSULTING',
              executionMode: 'autonomous',
              residualStrategy: 'sweep_to_savings',
            },
          },
        },
      });
      userId = newUser.id;
    } catch (err: any) {
      console.warn('[auth/register] DB persistence error, proceeding with session:', err);
    }
  }

  const token = createSessionToken({
    userId,
    email,
    name,
    tier,
    isAdmin: false,
  });

  const res = NextResponse.json({
    status: 'success',
    user: { id: userId, email, name, tier },
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return res;
}
