import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      email: session.email,
      name: session.name,
      tier: session.tier,
      isAdmin: session.isAdmin,
    },
    expires: new Date(session.exp * 1000).toISOString(),
  });
}
