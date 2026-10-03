import { NextResponse } from 'next/server';
import { AnchorWalletService } from '@/services/wallet/anchor.service';

export async function GET() {
  try {
    const wallet = await AnchorWalletService.getCentralWallet('usr_adekunle_01');
    const ledger = await AnchorWalletService.getLedgerHistory(wallet.id);

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        ledger,
      },
    });
  } catch (error) {
    console.error('[API /api/wallet GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve wallet information' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vaultId, amountKobo, action, narration } = body;

    if (!vaultId || !amountKobo || amountKobo <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid vaultId or amountKobo' },
        { status: 400 }
      );
    }

    if (action === 'DEPOSIT') {
      const tx = await AnchorWalletService.creditSubVault(
        vaultId,
        amountKobo,
        narration || 'Manual ad-hoc deposit to vault',
        'ANCHOR_BAAS'
      );
      const updatedWallet = await AnchorWalletService.getCentralWallet('usr_adekunle_01');
      return NextResponse.json({ success: true, data: { tx, wallet: updatedWallet } });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported action' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Wallet transaction failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
