import { NextResponse } from 'next/server';

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    status: 'sync_initiated',
    timestamp: new Date().toISOString(),
    message: 'Node re-indexing pipeline triggered successfully.',
  });
}
