import { NextResponse } from 'next/server';
import { VTPassService } from '@/services/bills/vtpass.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, customerId, amount, phone, sourceVaultId } = body;

    if (!serviceId || !customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid utility purchase parameters' },
        { status: 400 }
      );
    }

    const receipt = await VTPassService.purchaseUtility({
      serviceId,
      customerId,
      amount,
      phone,
      sourceVaultId: sourceVaultId || 'vault_util',
    });

    return NextResponse.json({ success: true, data: receipt }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Utility recharge failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
