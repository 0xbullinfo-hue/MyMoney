import 'server-only';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'mm_session';
const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  tier: 'free' | 'premium' | 'premium_plus';
  isAdmin: boolean;
  iat: number; // issued-at, unix seconds
  exp: number; // expiry, unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be configured with at least 32 characters.');
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

/**
 * Builds a `base64url(json).base64url(hmac)` token. This is a plain signed cookie, not
 * JWT — no external library, no alg-confusion surface, and it's trivial to swap for a
 * real session store (DB-backed sessions, or NextAuth) later without changing callers of
 * `verifySession` / `requireAuth` / `requireAdmin` below.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + SESSION_TTL_SECONDS };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
}

/** For use inside Route Handlers (NextRequest gives cookie access directly). */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Defense-in-depth for admin route handlers: middleware.ts already gates `/api/admin/*`,
 * but a route handler should not rely solely on middleware config staying correct forever
 * (a matcher typo or a future refactor could quietly remove the protection). Call this at
 * the top of every admin route handler and bail out on `null`.
 */
export function requireAdmin(req: NextRequest): SessionPayload | null {
  const session = getSessionFromRequest(req);
  return session?.isAdmin ? session : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
