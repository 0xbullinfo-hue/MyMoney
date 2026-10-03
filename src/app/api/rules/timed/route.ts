import { NextResponse } from 'next/server';
import { TimedTransferService } from '@/services/rules/timed-transfer.service';

export async function GET() {
  try {
    const rules = await TimedTransferService.getUserRules('usr_adekunle_01');
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('[API /api/rules/timed GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve timed transfer rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      sourceVaultId,
      sourceVaultName,
      beneficiaryName,
      beneficiaryBankName,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amountKobo,
      condition,
      narration,
    } = body;

    if (!name || !sourceVaultId || !beneficiaryAccountNumber || !amountKobo) {
      return NextResponse.json(
        { success: false, error: 'Missing required timed transfer parameters' },
        { status: 400 }
      );
    }

    const newRule = await TimedTransferService.createRule('usr_adekunle_01', {
      name,
      sourceVaultId,
      sourceVaultName: sourceVaultName || 'Custom Vault',
      beneficiaryName,
      beneficiaryBankName: beneficiaryBankName || 'Commercial Bank',
      beneficiaryBankCode: beneficiaryBankCode || '058',
      beneficiaryAccountNumber,
      amountKobo,
      condition: condition || {
        minVaultBalanceKobo: amountKobo,
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      narration: narration || `Timed Transfer: ${name}`,
      status: 'SCHEDULED',
    });

    return NextResponse.json({ success: true, data: newRule }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create timed rule';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
