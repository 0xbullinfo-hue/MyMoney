'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { tokens } from '@/lib/tailwind-tokens';

const netWorthData = [
  { name: 'Liquid Assets', value: 22650420, color: tokens.secondary },
  { name: 'Investments', value: 4800000, color: tokens.secondaryFixed },
  { name: 'Liabilities', value: 2200000, color: tokens.accent },
];

export default function DashboardExecutivePage() {
  const { stealthModeEnabled, globalCardFreeze, toggleStealthMode, toggleGlobalCardFreeze, formatCurrency } = useStealth();
  const [extraPayment, setExtraPayment] = useState(50000);
  const [isSyncingNode, setIsSyncingNode] = useState<string | null>(null);

  const [nodes] = useState([
    { id: '1', name: 'GTBank PLC', cat: 'Commercial', bal: 14250000, ping: 12, status: 'active' },
    { id: '2', name: 'Stanbic IBTC', cat: 'Investment', bal: 8400000, ping: 14, status: 'active' },
    { id: '3', name: 'Kuda Bank MFB', cat: 'Digital MFB', bal: 2200000, ping: 8, status: 'active' },
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: '1', name: 'Cloud Infrastructure Node', amount: 48500, status: 'active' },
    { id: '2', name: 'Unused Analytics SaaS', amount: 12400, status: 'flagged_zombie' },
    { id: '3', name: 'Netflix Premium NG', amount: 5500, status: 'active' },
    { id: '4', name: 'DStv Compact Plus', amount: 4200, status: 'flagged_zombie' },
  ]);

  const triggerForceSync = (id: string) => {
    setIsSyncingNode(id);
    setTimeout(() => setIsSyncingNode(null), 1500);
  };

  const killSubscription = (id: string) => {
    setSubscriptions(subscriptions.map((s) => (s.id === id ? { ...s, status: 'blocked' } : s)));
  };

  const monthsSaved = Math.round(extraPayment / 15000) + 8;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Executive Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">ALL MY MONEY</h1>
          <p className="text-sm text-on-surface-variant">Real-time consolidated liquidity telemetry and bank node control.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleStealthMode}
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant text-xs font-semibold flex items-center gap-2 hover:bg-surface-high transition-all text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">{stealthModeEnabled ? 'visibility_off' : 'visibility'}</span>
            <span>{stealthModeEnabled ? 'Stealth Active' : 'Stealth Mode'}</span>
          </button>
          <button
            onClick={toggleGlobalCardFreeze}
            className={`px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              globalCardFreeze ? 'bg-accent text-white shadow-lg' : 'bg-tertiary-container text-tertiary hover:bg-accent hover:text-white'
            }`}
          >
            {globalCardFreeze ? '⚠️ Cards Frozen' : 'Emergency Freeze'}
          </button>
        </div>
      </div>

      {/* ═══ Net Worth Banner (Cards) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Net Worth Card */}
        <div className="sm:col-span-2 lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-primary text-white border border-outline-variant shadow-xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono text-secondary-fixed uppercase tracking-wider font-semibold">Total Consolidated Net Worth</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{formatCurrency(24850420)}</div>
              <div className="text-xs text-emerald-400 font-mono">▲ +14.2% Net Wealth Velocity</div>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={netWorthData} innerRadius="60%" outerRadius="95%" paddingAngle={3} dataKey="value" stroke="none">
                    {netWorthData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} contentStyle={{ background: '#0A192F', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Liquid Assets Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-2">
          <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Liquid Assets</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">{formatCurrency(22650420)}</div>
          <div className="text-xs text-on-surface-variant">Across {nodes.length} Linked Banking Nodes</div>
        </div>

        {/* Total Debt Liabilities Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-2">
          <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Total Debt Liabilities</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-tertiary">{formatCurrency(2200000)}</div>
          <div className="text-xs text-tertiary font-semibold">Avalanche Payoff Active</div>
        </div>
      </div>

      {/* ═══ Banking Mesh Grid (Cards) ═══ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-lg sm:text-xl text-primary">Connected Bank Nodes</h2>
          <a href="/dashboard/mesh" className="text-xs font-semibold text-secondary hover:text-secondary-fixed transition-colors">My Money →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-5 sm:p-6 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-primary text-sm sm:text-base">{node.name}</h3>
                  <span className="text-xs text-on-surface-variant">{node.cat}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />
                  {node.ping}ms
                </span>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant">Available Balance</div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-primary">{formatCurrency(node.bal)}</div>
              </div>
              <button
                onClick={() => triggerForceSync(node.id)}
                className="w-full py-2.5 rounded-xl bg-surface-low hover:bg-surface-high border border-outline-variant text-xs font-semibold text-primary transition-all flex justify-center items-center gap-2"
              >
                {isSyncingNode === node.id ? (
                  <><span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Syncing...</>
                ) : 'Force Re-Index Node'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Intelligence Modules (Cards) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Zombie Debit Hunter Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-base sm:text-lg text-primary">Zombie Debit Hunter</h3>
            <span className="px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-xs font-bold">Subscription Radar</span>
          </div>
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-3 sm:p-4 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`font-bold text-sm text-primary truncate ${sub.status === 'blocked' ? 'line-through opacity-50' : ''}`}>{sub.name}</div>
                  <div className="text-xs text-on-surface-variant font-mono">{formatCurrency(sub.amount)} / mo</div>
                </div>
                {sub.status === 'blocked' ? (
                  <span className="text-xs font-bold text-red-600 font-mono flex-shrink-0">BLOCKED</span>
                ) : (
                  <button
                    onClick={() => killSubscription(sub.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex-shrink-0 ${
                      sub.status === 'flagged_zombie' ? 'bg-accent text-white hover:bg-black' : 'bg-surface-high text-on-surface-variant hover:bg-accent hover:text-white'
                    }`}
                  >
                    {sub.status === 'flagged_zombie' ? '🧟 Kill Switch' : 'Block'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <a href="/dashboard/intelligence" className="text-xs font-semibold text-secondary hover:text-secondary-fixed transition-colors block text-center pt-2">
            Open Full Subscription Radar →
          </a>
        </div>

        {/* Debt Avalanche Simulator Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-base sm:text-lg text-primary">Debt Avalanche Simulator</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 text-on-surface">
                <span>Extra Monthly Principal Injection</span>
                <span className="font-mono text-primary font-bold">{formatCurrency(extraPayment)}</span>
              </div>
              <input
                type="range" min="10000" max="250000" step="10000" value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full h-2 bg-surface-high rounded-lg cursor-pointer"
              />
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-primary text-white space-y-3 shadow-md">
              <div className="text-xs text-white/70">Estimated Time Cut Off Loan Lifespan</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-secondary-fixed">{monthsSaved} Months Saved</div>
              <div className="text-xs text-white/70">
                Interest saved: <span className="text-secondary-fixed font-mono font-bold">{formatCurrency(extraPayment * monthsSaved * 0.4)}</span>
              </div>
            </div>
          </div>
          <a href="/dashboard/intelligence" className="text-xs font-semibold text-secondary hover:text-secondary-fixed transition-colors block text-center pt-2">
            Open Full Debt Simulator →
          </a>
        </div>
      </div>
    </div>
  );
}
