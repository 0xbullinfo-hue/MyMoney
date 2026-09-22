import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('/session')) {
    return NextResponse.json({
      user: {
        name: 'Adekunle Okonkwo',
        email: 'adekunle@mymoney.ng',
        image: null,
        tier: 'premium',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return NextResponse.json({
    status: 'authenticated',
    providers: ['credentials'],
  });
}

export async function POST() {
  return NextResponse.json({
    user: {
      id: 'user-1',
      name: 'Adekunle Okonkwo',
      email: 'adekunle@mymoney.ng',
      tier: 'premium',
    },
    status: 'success',
  });
}
