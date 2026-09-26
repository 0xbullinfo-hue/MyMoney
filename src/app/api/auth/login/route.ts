import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { mockUsers } from '@/lib/mock-data/admin-metrics';

/**
 * DEMO-GRADE AUTH. This replaces the previous fake `[...nextauth]` route, which accepted
 * any request and always returned a hardcoded identity, and the marketing page's login
 * form, which wrote a fake session object straight into `sessionStorage` client-side —
 * meaning literally any input "logged in" and nothing server-side ever checked it, and
 * every protected page/API rendered regardless of whether any of this had even happened.
 *
 * This version at least requires a real (HttpOnly, signed, server-verified) session
 * cookie before `/dashboard/*` or `/admin/*` will render — see middleware.ts. It still
 * checks against a single shared DEMO_PASSWORD rather than per-user hashed passwords,
 * because there is no user database in this project yet. Before this touches real
 * accounts, replace this route with NextAuth (or your own Credentials flow) backed by a
 * real user table with bcrypt/argon2-hashed passwords.
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'adekunle@mymoney.ng')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    console.error('[auth/login] DEMO_PASSWORD is not configured.');
    return NextResponse.json({ error: 'Login is not configured on this server' }, { status: 500 });
  }

  if (password !== demoPassword) {
    // Deliberately generic — never confirm whether the email exists.
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const existingUser = mockUsers.find((u) => u.email.toLowerCase() === email);

  const token = createSessionToken({
    userId: existingUser?.id ?? `guest-${Date.now()}`,
    email,
    name: existingUser?.name ?? 'MyMoney User',
    tier: existingUser?.tier ?? 'premium',
    isAdmin: ADMIN_EMAILS.includes(email),
  });

  const res = NextResponse.json({
    status: 'success',
    user: {
      email,
      name: existingUser?.name ?? 'MyMoney User',
      tier: existingUser?.tier ?? 'premium',
    },
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return res;
}
