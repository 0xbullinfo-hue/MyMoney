import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import type { SubscriptionTier } from '@/types';

/**
 * DEMO-GRADE. There is no user table in this project (see login/route.ts's comment), so
 * "registering" just issues a real signed session cookie for the submitted identity — it
 * does not persist the account, and the password is not stored or checked anywhere.
 * Replace with a real signup flow (hash + store the password, send a verification email,
 * etc.) before this handles real users.
 */
export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; phone?: string; tier?: SubscriptionTier };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const tier: SubscriptionTier = body.tier ?? 'free';

  const token = createSessionToken({
    userId: `new-${Date.now()}`,
    email,
    name,
    tier,
    isAdmin: false,
  });

  const res = NextResponse.json({ status: 'success', user: { email, name, tier } });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return res;
}
