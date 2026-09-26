import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { mockUsers } from '@/lib/mock-data/admin-metrics';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Emails that are granted isAdmin=true in the session token.
// Must be set via ADMIN_EMAILS env var (comma-separated). No hardcoded fallback
// — if the env var is missing, no email is granted admin access.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
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

  let authenticatedUser: {
    id: string;
    email: string;
    name: string;
    tier: 'free' | 'premium' | 'premium_plus';
    isAdmin: boolean;
  } | null = null;

  // 1. Try real Database Authentication with bcrypt
  if (isDatabaseConfigured()) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (dbUser && dbUser.passwordHash) {
        const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
        if (isMatch) {
          authenticatedUser = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            tier: (dbUser.tier as any) || 'free',
            isAdmin: dbUser.isAdmin || ADMIN_EMAILS.includes(email),
          };
        }
      }
    } catch (dbError) {
      console.warn('[auth/login] Database query failed, checking fallback:', dbError);
    }
  }

  // 2. Fallback to Demo Password if not authenticated via DB
  if (!authenticatedUser) {
    const demoPassword = process.env.DEMO_PASSWORD;
    if (demoPassword && password === demoPassword) {
      const existingMock = mockUsers.find((u) => u.email.toLowerCase() === email);
      authenticatedUser = {
        id: existingMock?.id ?? `user-${Date.now()}`,
        email,
        name: existingMock?.name ?? 'MyMoney User',
        tier: (existingMock?.tier as any) ?? 'premium',
        isAdmin: ADMIN_EMAILS.includes(email),
      };
    }
  }

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = createSessionToken({
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    name: authenticatedUser.name,
    tier: authenticatedUser.tier,
    isAdmin: authenticatedUser.isAdmin,
  });

  const res = NextResponse.json({
    status: 'success',
    user: {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      tier: authenticatedUser.tier,
      isAdmin: authenticatedUser.isAdmin,
    },
  });

  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return res;
}
