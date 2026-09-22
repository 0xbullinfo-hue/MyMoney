'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { formatRelativeTime } from '@/lib/formatters';
import type { Transaction } from '@/types';

const categories: Transaction['category'][] = ['Operations', 'Growth', 'Subscriptions', 'Lifestyle', 'Transfers'];
const categoryColors: Record<string, string> = {
  Operations: 'bg-blue-100 text-blue-800',
  Growth: 'bg-emerald-100 text-emerald-800',
  Subscriptions: 'bg-purple-100 text-purple-800',
  Lifestyle: 'bg-pink-100 text-pink-800',
  Transfers: 'bg-amber-100 text-amber-800',
};

export default function LedgerPage() {
  const { formatCurrency } = useStealth();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result = [...mockTransactions];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(term) || t.merchantName.toLowerCase().includes(term));
    }
    if (filterCategory) result = result.filter((t) => t.category === filterCategory);
    if (filterType) result = result.filter((t) => t.type === filterType);

    result.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'timestamp') return mul * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return mul * (a.amount - b.amount);
    });
    return result;
  }, [search, filterCategory, filterType, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = 'Date,Description,Merchant,Amount,Type,Category,Institution\n';
    const rows = filtered.map((t) => `${t.timestamp},${t.description},${t.merchantName},${t.amount},${t.type},${t.category},${t.institutionName}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mymoney_transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: 'timestamp' | 'amount') => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl text-primary">Transaction Telemetry Feed</h1>
          <p className="text-sm text-on-surface-variant">{filtered.length} transactions across all linked nodes</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 rounded-xl bg-surface-low border border-outline-variant/40 text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">search</span>
          <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-lowest text-sm focus:outline-none focus:border-primary transition-all" />
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-lowest text-sm text-on-surface focus:outline-none focus:border-primary">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-lowest text-sm text-on-surface focus:outline-none focus:border-primary">
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-lowest">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th onClick={() => toggleSort('timestamp')} className="px-4 py-3 text-left text-xs font-mono text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary">
                Date {sortBy === 'timestamp' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-on-surface-variant uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-on-surface-variant uppercase tracking-wider">Node</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-on-surface-variant uppercase tracking-wider">Category</th>
              <th onClick={() => toggleSort('amount')} className="px-4 py-3 text-right text-xs font-mono text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary">
                Amount {sortBy === 'amount' && (sortDir === 'desc' ? '↓' : '↑')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((tx, i) => (
              <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-outline-variant/20 hover:bg-surface-low/50 transition-colors">
                <td className="px-4 py-3.5 text-xs font-mono text-on-surface-variant whitespace-nowrap">{formatRelativeTime(tx.timestamp)}</td>
                <td className="px-4 py-3.5">
                  <div className="text-sm font-medium text-on-surface">{tx.merchantName}</div>
                  <div className="text-xs text-on-surface-variant truncate max-w-[200px]">{tx.description}</div>
                  <div className="flex gap-1.5 mt-1">
                    {tx.isSubscription && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">📌 SUB</span>}
                    {tx.isFlaggedZombie && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">🧟 ZOMBIE</span>}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-on-surface-variant">{tx.institutionName}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${categoryColors[tx.category] || 'bg-gray-100 text-gray-800'}`}>
                    {tx.category}
                  </span>
                </td>
                <td className={`px-4 py-3.5 text-right font-mono font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-semibold disabled:opacity-30 hover:bg-surface-low transition-all">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-semibold disabled:opacity-30 hover:bg-surface-low transition-all">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
