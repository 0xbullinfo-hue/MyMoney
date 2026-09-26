import { NextResponse } from 'next/server';
import { mockTransactions } from '@/lib/mock-data/transactions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  // Clamp instead of trusting the client: page=0/negative/NaN previously produced a
  // negative Array.slice() start and silently returned an empty page; an unbounded
  // `limit` would let a caller request the entire table in one response.
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const rawLimit = parseInt(searchParams.get('limit') || '25', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 25;

  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockTransactions];

  if (category) {
    filtered = filtered.filter((t) => t.category === category);
  }
  if (type) {
    filtered = filtered.filter((t) => t.type === type);
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(term) ||
        t.merchantName.toLowerCase().includes(term)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return NextResponse.json({
    data: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
