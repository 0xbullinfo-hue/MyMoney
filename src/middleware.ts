import { NextRequest, NextResponse } from 'next/server';

// Demo-grade guard. The login flow sets an `mm_session` cookie (see marketing
// page + dashboard layout). Replace this with a verified JWT/session check
// once real authentication is implemented.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('mm_session')?.value || req.cookies.get('auth_session')?.value;

  if (!session) {
    if (pathname.startsWith('/admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('admin_auth_required', '1');
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/dashboard')) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth_required', '1');
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*'],
};
