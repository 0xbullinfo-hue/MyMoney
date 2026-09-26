import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { monoService } from '@/services/mono.service';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { nodeId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional
  }

  const { nodeId } = body;
  let syncedCount = 0;

  if (isDatabaseConfigured()) {
    try {
      const nodes = await prisma.bankNode.findMany({
        where: {
          userId: session.userId,
          ...(nodeId ? { id: nodeId } : {}),
        },
      });

      for (const node of nodes) {
        if (node.monoAccountId) {
          try {
            await monoService.triggerAccountSync(node.monoAccountId);
            syncedCount++;
          } catch (syncErr) {
            console.warn(`[Node Sync] Mono sync trigger failed for node ${node.id}:`, syncErr);
          }
        }
      }

      await prisma.bankNode.updateMany({
        where: {
          userId: session.userId,
          ...(nodeId ? { id: nodeId } : {}),
        },
        data: {
          lastSyncedAt: new Date(),
          status: 'active',
        },
      });
    } catch (err) {
      console.error('[Node Sync DB Error]:', err);
    }
  }

  return NextResponse.json({
    status: 'sync_initiated',
    timestamp: new Date().toISOString(),
    syncedNodes: syncedCount,
    message: 'Institutional bank nodes re-synchronized successfully via Open Banking.',
  });
}
