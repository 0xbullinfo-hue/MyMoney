'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaydayExecutionLog, PaydayExecutionReceipt } from '@/types/payday';
import { useStealth } from '@/hooks/use-stealth';
import { downloadPaydayInvoice } from '@/lib/payday-invoice';

interface PaydayAuditLogProps {
  logs: PaydayExecutionLog[];
  userName?: string;
}

function CopyableToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Detect token type for better label
  const isElectric = /^\d{4}-\d{4}-\d{4}-\d{4}/.test(token);
  const isBridgecard = token.startsWith('BC_TOPUP');
  const label = isElectric ? '⚡ Electricity Token' : isBridgecard ? '💳 Card Top-up Ref' : '📱 Service Token';

  return (
    <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">
            {label}
          </div>
          <div className="font-mono text-sm font-bold text-[#C96F4F] tracking-wider">
            {token}
          </div>
          <div className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
            Copy and use this code to activate your service
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function ReceiptRow({ rcpt }: { rcpt: PaydayExecutionReceipt }) {
  const statusColors: Record<string, string> = {
    success: 'text-emerald-600',
    queued: 'text-amber-600',
    held_for_review: 'text-blue-600',
    skipped_paused: 'text-stone-400',
  };

  return (
    <div className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 flex-1">
          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            {rcpt.billName}
          </div>
          <div className="text-[10px] font-mono text-stone-400">
            Ref: {rcpt.reference}
          </div>
          <div className="text-[10px] text-stone-400">
            Source: {rcpt.paymentSource}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
            ₦{rcpt.amount.toLocaleString()}
          </div>
          <div className={`text-[10px] font-semibold uppercase mt-0.5 ${statusColors[rcpt.status] || 'text-stone-400'}`}>
            {rcpt.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Token display — prominently shown if present */}
      {rcpt.token && <CopyableToken token={rcpt.token} />}
    </div>
  );
}

export function PaydayAuditLog({ logs, userName = 'MyMoney User' }: PaydayAuditLogProps) {
  const { formatCurrency } = useStealth();
  const [filter, setFilter] = useState<'all' | 'executed' | 'bypassed' | 'aborted'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'executed') return log.status === 'SUCCESS' || log.status === 'PARTIAL_SUCCESS';
    if (filter === 'bypassed') return log.status === 'BYPASSED';
    if (filter === 'aborted') return log.status === 'ABORTED';
    return true;
  });

  const handleDownloadInvoice = (e: React.MouseEvent, log: PaydayExecutionLog) => {
    e.stopPropagation();
    setDownloadingId(log.id);
    try {
      downloadPaydayInvoice(log, userName);
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  const getStatusBadge = (log: PaydayExecutionLog) => {
    if (log.status === 'SUCCESS') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          EXECUTED
        </span>
      );
    }
    if (log.status === 'PARTIAL_SUCCESS') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
          PARTIAL SUCCESS
        </span>
      );
    }
    if (log.status === 'ABORTED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
          ABORTED (KILL SWITCH)
        </span>
      );
    }
    if (log.status === 'BYPASSED') {
      if (log.bypassReason === 'USER_PAUSED')
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            BYPASSED — PAUSED
          </span>
        );
      if (log.bypassReason === 'USER_SKIPPED_NEXT')
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
            BYPASSED — SKIPPED
          </span>
        );
      if (log.bypassReason === 'CONFIG_INACTIVE')
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-400/30">
            BYPASSED — INACTIVE
          </span>
        );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
        {log.status}
      </span>
    );
  };

  const isExecuted = (log: PaydayExecutionLog) =>
    log.status === 'SUCCESS' || log.status === 'PARTIAL_SUCCESS';

  const tokenCount = (log: PaydayExecutionLog) =>
    log.breakdown.receipts.filter((r) => !!r.token).length;

  return (
    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Payday Lifecycle Audit Vault
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Every inflow event, disbursement receipt, and utility token — downloadable as invoice.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs shrink-0">
          {(['all', 'executed', 'bypassed', 'aborted'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition cursor-pointer ${
                filter === f
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              {f === 'all' ? `All (${logs.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-stone-400">
            No payday events found in this category.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const executed = isExecuted(log);
            const tokensInLog = tokenCount(log);

            return (
              <div
                key={log.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition"
              >
                {/* Row Header */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 bg-stone-50/60 dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-stone-400">
                        {new Date(log.createdAt).toLocaleString('en-NG', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      {getStatusBadge(log)}
                      {/* Token count badge */}
                      {tokensInLog > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C96F4F]/15 text-[#C96F4F] border border-[#C96F4F]/30 flex items-center gap-1">
                          ⚡ {tokensInLog} Token{tokensInLog > 1 ? 's' : ''} Delivered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      {log.breakdown.narration || 'Salary Credit Alert'}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {log.breakdown.receivingBank || 'Primary Bank Node'} · Inflow:{' '}
                      <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                        {formatCurrency(log.inflowAmount)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Download Invoice Button — only for executed logs */}
                    {executed && (
                      <button
                        type="button"
                        onClick={(e) => handleDownloadInvoice(e, log)}
                        disabled={downloadingId === log.id}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#2E3A2F] text-white hover:bg-[#3C4B3D] active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Download full invoice with tokens and breakdown"
                      >
                        {downloadingId === log.id ? (
                          <>
                            <span className="animate-spin">⏳</span> Opening…
                          </>
                        ) : (
                          <>
                            <span>⬇</span> Invoice
                          </>
                        )}
                      </button>
                    )}

                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-stone-900 dark:text-stone-100">
                        {executed ? formatCurrency(log.breakdown.totalAllocated) : '—'}
                      </div>
                      <div className="text-[11px] font-mono text-[#6B7F5B]">
                        {executed && log.breakdown.residualSaved > 0
                          ? `+${formatCurrency(log.breakdown.residualSaved)} saved`
                          : executed ? 'Fully allocated' : 'No disbursement'}
                      </div>
                    </div>
                    <span className="text-stone-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900"
                    >
                      <div className="p-4 space-y-4">
                        {/* Engine Note */}
                        {log.breakdown.note && (
                          <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-400 font-mono">
                            ℹ️ {log.breakdown.note}
                          </div>
                        )}

                        {/* KPI Summary Grid */}
                        {executed && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {[
                              { label: 'Inflow Detected', value: formatCurrency(log.breakdown.inflowAmount), highlight: true },
                              { label: 'Total Disbursed', value: formatCurrency(log.breakdown.totalAllocated), highlight: false },
                              { label: 'VAT 7.5%', value: formatCurrency(log.breakdown.vatLevy), highlight: false },
                              { label: 'EMTL Levy', value: formatCurrency(log.breakdown.emtlFee), highlight: false },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800"
                              >
                                <span className="text-[10px] text-stone-400 block uppercase tracking-wide mb-1">
                                  {item.label}
                                </span>
                                <span className={`font-mono font-bold ${item.highlight ? 'text-[#2E3A2F] dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Receipts with Token Delivery */}
                        {log.breakdown.receipts && log.breakdown.receipts.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                                Disbursement Receipts ({log.breakdown.receipts.length})
                              </span>
                              {executed && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadInvoice(e, log)}
                                  className="text-[11px] text-[#2E3A2F] dark:text-stone-300 underline hover:no-underline cursor-pointer"
                                >
                                  Download Invoice with Tokens →
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {log.breakdown.receipts.map((rcpt, idx) => (
                                <ReceiptRow key={idx} rcpt={rcpt} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Residual */}
                        {executed && log.breakdown.residualSaved > 0 && (
                          <div className="p-3 rounded-xl bg-[#6B7F5B]/10 border border-[#6B7F5B]/20 flex items-center justify-between text-xs">
                            <span className="text-[#2E3A2F] dark:text-stone-200 font-medium">
                              🏦 Residual automatically swept to savings
                            </span>
                            <span className="font-mono font-bold text-[#6B7F5B]">
                              {formatCurrency(log.breakdown.residualSaved)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
