import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/admin-metrics';

let usersState = [...mockUsers];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get('tier');
  const search = searchParams.get('search');

  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...usersState];

  if (tier) {
    filtered = filtered.filter((u) => u.tier === tier);
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    tierBreakdown: {
      free: usersState.filter((u) => u.tier === 'free').length,
      premium: usersState.filter((u) => u.tier === 'premium').length,
      premium_plus: usersState.filter((u) => u.tier === 'premium_plus').length,
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, tier } = body;

    const userIndex = usersState.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (tier) {
      usersState[userIndex] = {
        ...usersState[userIndex],
        tier,
      };
    }

    return NextResponse.json({
      status: 'success',
      data: usersState[userIndex],
    });
  } catch {
    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  }
}
