import type { PaydayExecutionLog, PaydayExecutionReceipt } from '@/types/payday';

/**
 * Formats a number as Nigerian Naira currency string (no DOM/browser API).
 */
function fmtNGN(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function receiptTypeLabel(rcpt: PaydayExecutionReceipt): string {
  if (rcpt.token) {
    // Identify token type by the pattern: electricity tokens are usually 4-group numeric
    const isElectric = /^\d{4}-\d{4}-\d{4}-\d{4}/.test(rcpt.token);
    if (isElectric) return '⚡ Electricity Top-up';
    if (rcpt.token.startsWith('BC_TOPUP')) return '💳 Virtual Card Top-up';
    return '📱 Data / Service Token';
  }
  if (rcpt.paymentSource?.toLowerCase().includes('vault') || rcpt.billerRef?.toLowerCase().includes('vault')) {
    return '🏦 Vault Transfer';
  }
  return '📋 Bill Payment';
}

/**
 * Generates a printable HTML invoice for a single PaydayExecutionLog.
 * Opens in a new tab and triggers window.print().
 */
export function downloadPaydayInvoice(log: PaydayExecutionLog, userName: string = 'MyMoney User'): void {
  const b = log.breakdown;
  const executedReceipts = b.receipts.filter((r) => r.status === 'success');
  const tokenReceipts = executedReceipts.filter((r) => !!r.token);
  const hasTokens = tokenReceipts.length > 0;

  const receiptRows = b.receipts
    .map((rcpt, idx) => {
      const label = receiptTypeLabel(rcpt);
      const statusColor = rcpt.status === 'success' ? '#2d6a4f' : rcpt.status === 'skipped_paused' ? '#b45309' : '#6b7280';
      const tokenBlock = rcpt.token
        ? `<div style="margin-top:6px;padding:8px 12px;background:#fff8f0;border:1px solid #e8c99a;border-radius:8px;border-left:3px solid #C96F4F;">
            <div style="font-size:10px;color:#92400e;font-weight:600;letter-spacing:0.05em;margin-bottom:3px;">DELIVERY TOKEN / REFERENCE CODE</div>
            <div style="font-family:monospace;font-size:15px;font-weight:800;color:#C96F4F;letter-spacing:0.1em;">${rcpt.token}</div>
            <div style="font-size:10px;color:#78716c;margin-top:2px;">Copy and use this code to activate your service</div>
           </div>`
        : '';
      return `
        <tr style="border-bottom:1px solid #f0ede7;">
          <td style="padding:10px 8px;vertical-align:top;">
            <div style="font-size:12px;font-weight:600;color:#2E3A2F;">${rcpt.billName}</div>
            <div style="font-size:11px;color:#78716c;margin-top:2px;">${label}</div>
            <div style="font-size:10px;color:#a8a29e;margin-top:1px;">Ref: ${rcpt.reference}</div>
            <div style="font-size:10px;color:#a8a29e;">Source: ${rcpt.paymentSource}</div>
            ${tokenBlock}
          </td>
          <td style="padding:10px 8px;text-align:right;vertical-align:top;">
            <div style="font-family:monospace;font-size:13px;font-weight:700;color:#2E3A2F;">${fmtNGN(rcpt.amount)}</div>
            <div style="font-size:10px;font-weight:600;color:${statusColor};margin-top:2px;text-transform:uppercase;">${rcpt.status.replace('_', ' ')}</div>
          </td>
        </tr>`;
    })
    .join('');

  const tokenSection = hasTokens
    ? `<div style="margin-top:24px;padding:20px;background:linear-gradient(135deg,#fff8f0,#fef3e2);border:2px solid #e8c99a;border-radius:16px;">
        <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:12px;">⚡ Service Delivery Tokens — Keep Safe</div>
        <div style="font-size:11px;color:#78716c;margin-bottom:14px;">The following tokens were generated and delivered by the payment processor. Use these to activate your utilities or services.</div>
        ${tokenReceipts.map((r) => `
          <div style="margin-bottom:12px;padding:12px;background:white;border-radius:10px;border:1px solid #f5deb3;">
            <div style="font-size:11px;color:#78716c;margin-bottom:4px;">${r.billName}</div>
            <div style="font-family:monospace;font-size:18px;font-weight:800;color:#C96F4F;letter-spacing:0.12em;">${r.token}</div>
            <div style="font-size:10px;color:#a8a29e;margin-top:3px;">Reference: ${r.reference} · Source: ${r.paymentSource}</div>
          </div>
        `).join('')}
       </div>`
    : '';

  const residualNote = b.residualSaved > 0
    ? `<tr><td style="padding:6px 8px;color:#6B7F5B;font-size:12px;">Residual Swept to Savings</td><td style="padding:6px 8px;text-align:right;font-family:monospace;font-size:12px;font-weight:600;color:#6B7F5B;">${fmtNGN(b.residualSaved)}</td></tr>`
    : '';

  const invoiceRef = `INV-${log.id.substring(0, 8).toUpperCase()}-${new Date(log.createdAt).getFullYear()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MyMoney Payday Invoice — ${invoiceRef}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f6ee; color: #2E3A2F; }
    .page { max-width: 720px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 40px rgba(0,0,0,0.08); }
    @media print {
      body { background: white; }
      .page { box-shadow: none; padding: 24px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #EFE6D8;">
      <div>
        <div style="font-size:22px;font-weight:800;color:#2E3A2F;letter-spacing:-0.02em;">MyMoney</div>
        <div style="font-size:11px;color:#8EA27E;font-weight:600;letter-spacing:0.08em;margin-top:2px;">SOVEREIGN PAYDAY RECEIPT</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#78716c;">Invoice Reference</div>
        <div style="font-family:monospace;font-size:13px;font-weight:700;color:#2E3A2F;">${invoiceRef}</div>
        <div style="font-size:10px;color:#a8a29e;margin-top:4px;">${fmtDate(log.createdAt)}</div>
      </div>
    </div>

    <!-- Billed To & Inflow Summary -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
      <div>
        <div style="font-size:10px;color:#a8a29e;font-weight:600;letter-spacing:0.08em;margin-bottom:6px;">ISSUED TO</div>
        <div style="font-size:14px;font-weight:700;color:#2E3A2F;">${userName}</div>
        <div style="font-size:11px;color:#78716c;margin-top:2px;">MyMoney Premium Account</div>
      </div>
      <div style="background:#f8f6ee;border-radius:12px;padding:14px;">
        <div style="font-size:10px;color:#a8a29e;font-weight:600;letter-spacing:0.08em;margin-bottom:6px;">INFLOW DETECTED</div>
        <div style="font-family:monospace;font-size:20px;font-weight:800;color:#2E3A2F;">${fmtNGN(log.inflowAmount)}</div>
        <div style="font-size:10px;color:#78716c;margin-top:4px;">${b.narration || 'Salary Credit'}</div>
        <div style="font-size:10px;color:#78716c;">${b.receivingBank || 'Primary Bank Node'}</div>
      </div>
    </div>

    <!-- Disbursement Table -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;color:#a8a29e;font-weight:600;letter-spacing:0.08em;margin-bottom:10px;">DISBURSEMENT BREAKDOWN</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f6ee;">
            <th style="padding:8px;text-align:left;font-size:10px;color:#78716c;font-weight:600;letter-spacing:0.06em;">DESTINATION / SERVICE</th>
            <th style="padding:8px;text-align:right;font-size:10px;color:#78716c;font-weight:600;letter-spacing:0.06em;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${receiptRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="background:#f8f6ee;border-radius:12px;padding:16px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          <tr><td style="padding:6px 8px;color:#78716c;font-size:12px;">Total Disbursed (Sub-Splits)</td><td style="padding:6px 8px;text-align:right;font-family:monospace;font-size:12px;font-weight:600;color:#2E3A2F;">${fmtNGN(b.totalAllocated)}</td></tr>
          ${residualNote}
          <tr><td style="padding:6px 8px;color:#78716c;font-size:12px;">Statutory VAT (7.5% of disbursed)</td><td style="padding:6px 8px;text-align:right;font-family:monospace;font-size:12px;color:#78716c;">${fmtNGN(b.vatLevy)}</td></tr>
          <tr><td style="padding:6px 8px;color:#78716c;font-size:12px;">EMTL Electronic Levy (₦50 × ${executedReceipts.length} tx)</td><td style="padding:6px 8px;text-align:right;font-family:monospace;font-size:12px;color:#78716c;">${fmtNGN(b.emtlFee)}</td></tr>
          <tr style="border-top:2px solid #D9C9B2;">
            <td style="padding:10px 8px;font-size:13px;font-weight:700;color:#2E3A2F;">Total Inflow Accounted</td>
            <td style="padding:10px 8px;text-align:right;font-family:monospace;font-size:15px;font-weight:800;color:#2E3A2F;">${fmtNGN(log.inflowAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Token Section -->
    ${tokenSection}

    <!-- Note -->
    ${b.note ? `<div style="margin-top:20px;padding:12px;background:#f0f7f0;border-radius:10px;border-left:3px solid #6B7F5B;font-size:11px;color:#4a5e3a;">ℹ️ ${b.note}</div>` : ''}

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #EFE6D8;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:10px;color:#a8a29e;">Powered by MyMoney Autonomous Engine</div>
        <div style="font-size:10px;color:#a8a29e;">VTPass · Bridgecard · Anchor BaaS · CBN Open Banking</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:10px;color:#a8a29e;">Log ID: ${log.id}</div>
        <div style="font-size:10px;color:#a8a29e;">Generated: ${new Date().toLocaleString()}</div>
      </div>
    </div>

    <!-- Print Button (hidden when printing) -->
    <div class="no-print" style="margin-top:24px;text-align:center;">
      <button onclick="window.print()" style="padding:12px 32px;background:#2E3A2F;color:white;border:none;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;margin-right:8px;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="padding:12px 20px;background:#f0ede7;color:#2E3A2F;border:none;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">
        Close
      </button>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    // Fallback: trigger download as .html file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyMoney-Invoice-${invoiceRef}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
}
