import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

/**
 * Single source of truth for logout. Previously two different components each hand-rolled
 * their own logout (`sessionStorage.clear()` + removing one localStorage key in one place,
 * `sessionStorage.clear()` + `localStorage.clear()` in another) — neither actually touched
 * a real session because there wasn't one. Both now call this instead.
 */
export async function POST() {
  const res = NextResponse.json({ status: 'success' });
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
