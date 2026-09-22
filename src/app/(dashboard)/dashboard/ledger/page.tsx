'use client';

import React, { useState, useMemo } from 'react';
import { useStealth } from '@/hooks/use-stealth';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { formatRelativeTime } from '@/lib/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '@/types';

const categories: Transaction['category'][] = ['Growth', 'Operations', 'Subscriptions', 'Lifestyle', 'Transfers'];

const categoryMeta: Record<Transaction['category'], { color: string; bg: string; text: string; icon: string; desc: string }> = {
  Growth: { color: '#2E3A2F', bg: 'bg-[#2E3A2F]/10 border-[#2E3A2F]/30', text: 'text-[#2E3A2F]', icon: 'trending_up', desc: 'Investments, treasury sweeps, & compound interest' },
  Operations: { color: '#8EA27E', bg: 'bg-[#8EA27E]/15 border-[#8EA27E]/40', text: 'text-[#586C4B]', icon: 'bolt', desc: 'Electricity, rent sinking fund, & essential levies' },
  Subscriptions: { color: '#C96F4F', bg: 'bg-[#C96F4F]/15 border-[#C96F4F]/40', text: 'text-[#C96F4F]', icon: 'radar', desc: 'Netflix, DStv, Starlink, & recurring software' },
  Lifestyle: { color: '#6B7F5B', bg: 'bg-[#6B7F5B]/15 border-[#6B7F5B]/40', text: 'text-[#6B7F5B]', icon: 'shopping_bag', desc: 'Groceries, dining out, & personal allowances' },
  Transfers: { color: '#B5987A', bg: 'bg-[#B5987A]/15 border-[#B5987A]/40', text: 'text-[#8A6A4B]', icon: 'sync_alt', desc: 'Inter-bank rebalancing & family support' },
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

  // Category breakdown calculation for Pie Chart
  const categoryBreakdown = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {
      Growth: { total: 0, count: 0 },
      Operations: { total: 0, count: 0 },
      Subscriptions: { total: 0, count: 0 },
      Lifestyle: { total: 0, count: 0 },
      Transfers: { total: 0, count: 0 },
    };

    mockTransactions.forEach((t) => {
      const cat = t.category;
      if (sums[cat]) {
        sums[cat].total += Math.abs(t.amount);
        sums[cat].count += 1;
      }
    });

    const totalCashFlow = Object.values(sums).reduce((acc, curr) => acc + curr.total, 0);

    const chartData = categories.map((cat) => ({
      name: cat,
      value: sums[cat].total,
      count: sums[cat].count,
      percent: totalCashFlow > 0 ? Math.round((sums[cat].total / totalCashFlow) * 100) : 0,
      color: categoryMeta[cat].color,
    }));

    return { sums, chartData, totalCashFlow };
  }, []);

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
    const rows = filtered
      .map((t) => `${t.timestamp},${t.description},${t.merchantName},${t.amount},${t.type},${t.category},${t.institutionName}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mymoney_transactions_ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: 'timestamp' | 'amount') => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">Transactions &amp; Cash Flow Ledger</h1>
          <p className="text-sm text-on-surface-variant">Categorized financial records across all your linked Nigerian bank accounts.</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-surface-low border border-outline-variant/40 text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center gap-2 self-start shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
        </button>
      </div>

      {/* ═══ PIE CHART CASH FLOW BREAKDOWN (Growth, Operations, Subscriptions, Lifestyle, Transfers) ═══ */}
      <div className="p-5 sm:p-7 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-headline font-bold text-lg text-primary">Cash Flow by Category</h2>
            <p className="text-xs text-on-surface-variant">Breakdown across Growth, Operations, Subscriptions, Lifestyle, and Transfers.</p>
          </div>
          <div className="text-xs font-mono font-bold text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-xl self-start sm:self-auto">
            Total Flow: {formatCurrency(categoryBreakdown.totalCashFlow)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie Chart */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="w-52 h-52 sm:w-56 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown.chartData}
                    innerRadius="58%"
                    outerRadius="92%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryBreakdown.chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                    contentStyle={{ background: '#2E3A2F', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-on-surface-variant text-center mt-1">
              Click any category card below to filter records
            </div>
          </div>

          {/* Interactive Category Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryBreakdown.chartData.map((item) => {
              const meta = categoryMeta[item.name as Transaction['category']];
              const isSelected = filterCategory === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setFilterCategory(isSelected ? '' : item.name);
                    setPage(1);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 shadow-xs ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-surface-high'
                      : 'border-outline-variant bg-surface-low hover:bg-surface-lowest'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                        <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                      </div>
                      <span className="font-bold text-xs text-primary">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: item.color }}>
                      {item.percent}%
                    </span>
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-bold font-mono text-primary">{formatCurrency(item.value)}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 truncate">{item.count} transactions</div>
                  </div>
                </button>
              );
            })}

            {/* Clear Filter Card if active */}
            {filterCategory && (
              <button
                type="button"
                onClick={() => {
                  setFilterCategory('');
                  setPage(1);
                }}
                className="p-3.5 rounded-2xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-all text-accent text-xs font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                <span>Reset Category Filter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Filters Bar ═══ */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
          <input
            type="text"
            placeholder="Search description, merchant, bank..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs text-primary focus:outline-none focus:border-primary transition-all shadow-xs"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs text-on-surface focus:outline-none focus:border-primary shadow-xs"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-xs text-on-surface focus:outline-none focus:border-primary shadow-xs"
        >
          <option value="">All Types (Credit &amp; Debit)</option>
          <option value="credit">Credits (Inflows)</option>
          <option value="debit">Debits (Outflows)</option>
        </select>
      </div>

      {/* ═══ Transaction Table ═══ */}
      <div className="overflow-x-auto rounded-3xl border border-outline-variant bg-surface-lowest shadow-sm">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/40 bg-surface-low text-xs text-on-surface-variant font-mono">
              <th className="py-3.5 px-4 font-semibold cursor-pointer hover:text-primary" onClick={() => toggleSort('timestamp')}>
                Date {sortBy === 'timestamp' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3.5 px-4 font-semibold">Description</th>
              <th className="py-3.5 px-4 font-semibold">Category</th>
              <th className="py-3.5 px-4 font-semibold">Bank / Source</th>
              <th className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-primary" onClick={() => toggleSort('amount')}>
                Amount {sortBy === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant text-sm">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              paged.map((tx) => {
                const meta = categoryMeta[tx.category];
                return (
                  <tr key={tx.id} className="hover:bg-surface-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant whitespace-nowrap">
                      {formatRelativeTime(tx.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary">{tx.description}</div>
                      <div className="text-[11px] text-on-surface-variant">{tx.merchantName}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.bg} ${meta.text}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                      {tx.institutionName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={tx.type === 'credit' ? 'text-emerald-700' : 'text-primary'}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ═══ Pagination ═══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
          <div>
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest disabled:opacity-40 hover:bg-surface-high transition-all"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-semibold">
              {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-lowest disabled:opacity-40 hover:bg-surface-high transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
