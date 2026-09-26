import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

/**
 * This file did not exist before. `/dashboard/*` and `/admin/*` (both pages AND their
 * API routes) previously rendered/executed for anyone, authenticated or not — there was
 * no server-side check anywhere in the request path. This is the fix for that.
 *
 * Uses the Node.js middleware runtime (not Edge) so it can share `src/lib/session.ts`
 * verbatim, since that file uses Node's `crypto` module for HMAC verification.
 *
 * Note: Next.js 16 emits a deprecation warning for the `middleware.ts` convention in
 * favor of a new `proxy.ts` convention (`npx @next/codemod@canary middleware-to-proxy .`
 * migrates it). Left as `middleware.ts` here since the codemod requires a clean git tree
 * to run safely — worth doing as a follow-up on a clean branch.
 */
// Routes that must stay reachable without a session: signing in/up/out, and the
// bank/aggregator webhook (which authenticates via HMAC signature, not a user cookie).
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/webhooks'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = getSessionFromRequest(req);

  const isApiRoute = pathname.startsWith('/api');
  const isPublicApiRoute = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (isAdminRoute) {
    if (!session || !session.isAdmin) {
      return pathname.startsWith('/api/admin')
        ? NextResponse.json({ error: 'Forbidden' }, { status: session ? 403 : 401 })
        : NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Every other /api/* route (transactions, subscriptions, node sync, ...) is app data
  // and requires a session too — previously these were reachable with no auth at all as
  // long as you knew the URL, regardless of whether the page in front of them was gated.
  if (isApiRoute && !isPublicApiRoute && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
};
