import { NextResponse } from 'next/server';
import { VTPassService } from '@/services/bills/vtpass.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, customerId, customerType } = body;

    if (!serviceId || !customerId) {
      return NextResponse.json(
        { success: false, error: 'Missing serviceId or customerId' },
        { status: 400 }
      );
    }

    const verification = await VTPassService.verifyCustomer(
      serviceId,
      customerId,
      customerType || 'prepaid'
    );

    return NextResponse.json({ success: true, data: verification });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
