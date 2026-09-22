'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockWebhookLogs } from '@/lib/mock-data/admin-metrics';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { calculateRiskScore } from '@/services/risk-engine.service';
import { formatRelativeTime } from '@/lib/formatters';

export default function AdminAuditPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  const flaggedTransactions = mockTransactions
    .map((tx) => ({ ...tx, riskScore: calculateRiskScore(tx) }))
    .filter((tx) => tx.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore);

  const filteredLogs = filterSeverity
    ? mockWebhookLogs.filter((l) => l.status === filterSeverity)
    : mockWebhookLogs;

  const exportCSV = () => {
    const headers = 'ID,Institution,Status,Latency,Signature,Timestamp,Result\n';
    const rows = filteredLogs.map((l) => `${l.id},${l.institutionId},${l.statusCode},${l.latencyMs},${l.payloadSignature},${l.timestamp},${l.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-secondary-fixed">Compliance & Security Audit</h1>
          <p className="text-xs text-white/60 font-mono">Encrypted audit trail & risk flagged transactions</p>
        </div>
        <button onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">download</span> Export Audit CSV
        </button>
      </div>

      {/* Risk-Flagged Transactions */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs text-white/40 uppercase tracking-wider">Risk-Flagged Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flaggedTransactions.slice(0, 6).map((tx) => (
            <div key={tx.id}
              className="p-4 rounded-2xl admin-card flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm text-white">{tx.merchantName}</div>
                <div className="text-xs text-white/50 font-mono mt-0.5">{tx.description}</div>
                <div className="text-xs text-white/50 font-mono mt-1">{formatRelativeTime(tx.timestamp)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold font-mono ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </div>
                <div className={`mt-1 inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  tx.riskScore > 50 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : tx.riskScore > 25 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  Risk: {tx.riskScore}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Audit Logs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs text-secondary-fixed uppercase tracking-wider font-semibold">Webhook Audit Trail</h2>
          <div className="flex gap-2">
            {['', 'success', 'retrying', 'failed'].map((s) => (
              <button key={s} onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  filterSeverity === s ? 'bg-secondary-fixed text-primary font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl admin-card">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Institution</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">HTTP</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Latency</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">HMAC Signature</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold">{log.institutionId.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-500/20 text-emerald-400' : log.statusCode === 429 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>{log.statusCode}</span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-mono font-bold ${log.latencyMs > 100 ? 'text-amber-400' : 'text-secondary-fixed'}`}>{log.latencyMs}ms</td>
                  <td className="px-4 py-3 text-xs font-mono text-white/30">{log.payloadSignature}</td>
                  <td className="px-4 py-3 text-xs font-mono text-white/40">{formatRelativeTime(log.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${
                      log.status === 'success' ? 'text-emerald-400' : log.status === 'retrying' ? 'text-amber-400' : 'text-red-400'
                    }`}>{log.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
