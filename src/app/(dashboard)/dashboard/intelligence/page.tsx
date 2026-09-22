'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { mockSubscriptions } from '@/lib/mock-data/subscriptions';
import { mockEnvelopes, mockDebts } from '@/lib/mock-data/admin-metrics';
import { calculateDebtPayoff, getSubscriptionHealth } from '@/services/risk-engine.service';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { tokens } from '@/lib/tailwind-tokens';
import type { SubscriptionItem, EnvelopeBudget, DebtItem } from '@/types';

const tabs = ['Subscription Radar', 'Envelope Budgets', 'Debt Simulator'];

export default function IntelligencePage() {
  const { formatCurrency } = useStealth();
  const [activeTab, setActiveTab] = useState(0);

  // ═══════════ STATE FOR EDITABLE MODULES ═══════════
  const [subs, setSubs] = useState<SubscriptionItem[]>(mockSubscriptions);
  const [envelopes, setEnvelopes] = useState<EnvelopeBudget[]>(mockEnvelopes);
  const [debts, setDebts] = useState<DebtItem[]>(mockDebts);
  const [extraPayment, setExtraPayment] = useState(50000);
  const [debtStrategy, setDebtStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // Modals / Edit Dialogs
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subForm, setSubForm] = useState({ merchantName: '', amount: 5000, billingCycle: 'monthly' as 'monthly' | 'annual' });

  const [editingEnv, setEditingEnv] = useState<EnvelopeBudget | null>(null);
  const [isAddingEnv, setIsAddingEnv] = useState(false);
  const [envForm, setEnvForm] = useState({ category: '', allocatedAmount: 200000, spentAmount: 50000 });

  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [debtForm, setDebtForm] = useState({ name: '', balance: 500000, apr: 15.0, minPayment: 25000 });

  // ═══════════ SUBSCRIPTION ACTIONS ═══════════
  const killSub = (id: string) => {
    setSubs(subs.map((s) => (s.id === id ? { ...s, status: 'blocked' as const } : s)));
  };

  const deleteSub = (id: string) => {
    setSubs(subs.filter((s) => s.id !== id));
  };

  const saveSub = () => {
    if (!subForm.merchantName) return;
    if (editingSub) {
      setSubs(subs.map((s) => s.id === editingSub.id ? { ...s, merchantName: subForm.merchantName, amount: Number(subForm.amount), billingCycle: subForm.billingCycle } : s));
      setEditingSub(null);
    } else {
      const newSub: SubscriptionItem = {
        id: `sub-${Date.now()}`,
        nodeId: 'node-1',
        merchantName: subForm.merchantName,
        amount: Number(subForm.amount),
        billingCycle: subForm.billingCycle,
        lastBilledDate: new Date().toISOString().slice(0, 10),
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        daysInactive: 0,
        status: 'active',
      };
      setSubs([newSub, ...subs]);
      setIsAddingSub(false);
    }
  };

  // ═══════════ ENVELOPE ACTIONS ═══════════
  const saveEnvelope = () => {
    if (!envForm.category) return;
    if (editingEnv) {
      setEnvelopes(envelopes.map((e) => e.id === editingEnv.id ? { ...e, category: envForm.category, allocatedAmount: Number(envForm.allocatedAmount), spentAmount: Number(envForm.spentAmount) } : e));
      setEditingEnv(null);
    } else {
      const newEnv: EnvelopeBudget = {
        id: `env-${Date.now()}`,
        category: envForm.category,
        allocatedAmount: Number(envForm.allocatedAmount),
        spentAmount: Number(envForm.spentAmount),
        targetWarningThreshold: 0.85,
      };
      setEnvelopes([...envelopes, newEnv]);
      setIsAddingEnv(false);
    }
  };

  const deleteEnvelope = (id: string) => {
    setEnvelopes(envelopes.filter((e) => e.id !== id));
  };

  // ═══════════ DEBT ACTIONS ═══════════
  const saveDebt = () => {
    if (!debtForm.name) return;
    if (editingDebt) {
      setDebts(debts.map((d) => d.id === editingDebt.id ? { ...d, name: debtForm.name, balance: Number(debtForm.balance), apr: Number(debtForm.apr), minPayment: Number(debtForm.minPayment) } : d));
      setEditingDebt(null);
    } else {
      const newDebt: DebtItem = {
        id: `debt-${Date.now()}`,
        name: debtForm.name,
        balance: Number(debtForm.balance),
        apr: Number(debtForm.apr),
        minPayment: Number(debtForm.minPayment),
      };
      setDebts([...debts, newDebt]);
      setIsAddingDebt(false);
    }
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  // Computations
  const subHealth = getSubscriptionHealth(subs);

  const subsByCategory = subs.filter((s) => s.status !== 'blocked').reduce((acc, s) => {
    const key = s.merchantName.includes('Netflix') || s.merchantName.includes('Spotify') || s.merchantName.includes('DStv') ? 'Entertainment' :
      s.merchantName.includes('AWS') || s.merchantName.includes('Cloud') || s.merchantName.includes('Mixpanel') ? 'SaaS' : 'Utilities';
    acc[key] = (acc[key] || 0) + s.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(subsByCategory).map(([name, value]) => ({ name, value }));
  const pieColors = [tokens.primary, tokens.secondary, tokens.accent, tokens.secondaryFixed];

  const sortedDebts = [...debts].sort((a, b) =>
    debtStrategy === 'avalanche' ? b.apr - a.apr : a.balance - b.balance
  );

  const debtResults = sortedDebts.map((d) => {
    const result = calculateDebtPayoff(d.balance, d.apr, d.minPayment, extraPayment);
    return { ...d, ...result };
  });

  const totalMonthsSaved = debtResults.reduce((s, d) => s + (d.monthsWithout - d.monthsWith), 0);
  const totalInterestSaved = debtResults.reduce((s, d) => s + d.interestSaved, 0);

  const envelopeChartData = envelopes.map((e) => ({
    name: e.category.slice(0, 8),
    budget: e.allocatedAmount,
    spent: e.spentAmount,
  }));

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubs = subs.filter((s) =>
    s.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEnvelopes = envelopes.filter((e) =>
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDebts = debts.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl text-primary">Money Intelligence &amp; Budgets</h1>
          <p className="text-sm text-on-surface-variant">Track your subscriptions, manage spending envelopes, and plan out your debts.</p>
        </div>

        {/* Global Intelligence Search Input */}
        <div className="flex items-center gap-2 bg-surface-lowest border border-outline-variant rounded-xl px-3.5 py-2 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions, budgets, loans..."
            className="w-full bg-transparent text-sm text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-high border border-outline-variant overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`relative px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === i ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: SUBSCRIPTION RADAR ═══ */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline font-bold text-lg text-primary">Subscriptions &amp; Recurring Bills</h2>
              <p className="text-xs text-on-surface-variant">Review monthly charges and cancel unused services.</p>
            </div>
            <button
              onClick={() => {
                setSubForm({ merchantName: '', amount: 5000, billingCycle: 'monthly' });
                setIsAddingSub(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Subscription
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant text-center shadow-sm">
              <div className="text-xs font-mono text-on-surface-variant uppercase font-semibold">Total Monthly Cost</div>
              <div className="text-lg font-bold font-mono text-primary">{formatCurrency(subHealth.totalMonthlyBurn)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant text-center shadow-sm">
              <div className="text-xs font-mono text-on-surface-variant uppercase font-semibold">Active Services</div>
              <div className="text-lg font-bold font-mono text-secondary">{subHealth.active}</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant text-center shadow-sm">
              <div className="text-xs font-mono text-on-surface-variant uppercase font-semibold">Unused Subscriptions</div>
              <div className="text-lg font-bold font-mono text-accent">{subHealth.zombie}</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant text-center shadow-sm">
              <div className="text-xs font-mono text-on-surface-variant uppercase font-semibold">Money Leaking</div>
              <div className="text-lg font-bold font-mono text-accent">{formatCurrency(subHealth.zombieBurn)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredSubs.length === 0 ? (
                <div className="p-8 text-center bg-surface-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
                  No subscriptions match your search.
                </div>
              ) : (
                filteredSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm text-primary ${sub.status === 'blocked' ? 'line-through opacity-50' : ''}`}>
                        {sub.merchantName}
                      </span>
                      {sub.status === 'flagged_zombie' && (
                        <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold border border-accent/30">
                          🧟 ZOMBIE
                        </span>
                      )}
                      {sub.status === 'blocked' && (
                        <span className="text-[10px] font-bold text-accent font-mono">BLOCKED</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-on-surface-variant font-mono">
                      <span className="font-bold text-primary">{formatCurrency(sub.amount)} / {sub.billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                      <span>·</span>
                      <span>Next: {sub.nextBillingDate}</span>
                      {sub.daysInactive > 0 && <span className="text-accent font-semibold">· {sub.daysInactive}d dormant</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingSub(sub);
                        setSubForm({ merchantName: sub.merchantName, amount: sub.amount, billingCycle: sub.billingCycle });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-low hover:bg-surface-high text-xs font-semibold text-primary transition-all"
                    >
                      Edit
                    </button>

                    {/* Kill switch / status */}
                    {sub.status !== 'blocked' ? (
                      <button
                        onClick={() => killSub(sub.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          sub.status === 'flagged_zombie' ? 'bg-accent text-white hover:bg-black' : 'bg-surface-high text-on-surface-variant hover:bg-accent hover:text-white'
                        }`}
                      >
                        {sub.status === 'flagged_zombie' ? '🧟 Kill Switch' : 'Block'}
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteSub(sub.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-accent hover:bg-accent/10 transition-all"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )))}
            </div>

            {/* Pie Chart */}
            <div className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm">
              <h4 className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-4 font-semibold">By Category</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius="55%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((_, i) => (<Cell key={i} fill={pieColors[i % pieColors.length]} />))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} contentStyle={{ background: '#2E3A2F', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      <span className="text-on-surface-variant">{d.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-primary">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: ENVELOPE BUDGETS (EDITABLE) ═══ */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline font-bold text-lg text-primary">Monthly Spending Budgets</h2>
              <p className="text-xs text-on-surface-variant">Set spending limits for each area of your life to avoid overspending.</p>
            </div>
            <button
              onClick={() => {
                setEnvForm({ category: '', allocatedAmount: 250000, spentAmount: 0 });
                setIsAddingEnv(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Add Budget
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredEnvelopes.length === 0 ? (
                <div className="p-8 text-center bg-surface-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
                  No budgets match your search.
                </div>
              ) : (
                filteredEnvelopes.map((env) => {
                const pct = env.spentAmount / (env.allocatedAmount || 1);
                const barColor = pct >= 1 ? 'bg-accent' : pct >= env.targetWarningThreshold ? 'bg-tertiary text-primary' : 'bg-secondary';
                return (
                  <div key={env.id} className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-primary">{env.category}</h4>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          pct >= 1 ? 'bg-accent/15 text-accent border border-accent/30' : pct >= env.targetWarningThreshold ? 'bg-tertiary-container text-tertiary' : 'bg-secondary/15 text-secondary'
                        }`}>
                          {(pct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEnv(env);
                            setEnvForm({ category: env.category, allocatedAmount: env.allocatedAmount, spentAmount: env.spentAmount });
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg border border-outline-variant bg-surface-low hover:bg-surface-high font-semibold text-primary transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEnvelope(env.id)}
                          className="text-accent hover:opacity-75 p-1"
                          title="Delete Envelope"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-surface-high overflow-hidden">
                      <div
                        style={{ width: `${Math.min(pct * 100, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                      <span>Spent: <strong className="text-primary">{formatCurrency(env.spentAmount)}</strong></span>
                      <span>Budget: <strong className="text-primary">{formatCurrency(env.allocatedAmount)}</strong></span>
                      <span>Remaining: <strong className="text-secondary">{formatCurrency(Math.max(env.allocatedAmount - env.spentAmount, 0))}</strong></span>
                    </div>
                  </div>
                );
              }))}
            </div>

            <div className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm">
              <h4 className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-4 font-semibold">Budget vs Actual Spend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={envelopeChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,201,178,0.3)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5E695B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#5E695B' }} tickFormatter={(v) => `₦${(v / 1000)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} contentStyle={{ background: '#2E3A2F', border: 'none', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="budget" fill={tokens.primary} radius={[4, 4, 0, 0]} name="Budget" />
                    <Bar dataKey="spent" fill={tokens.secondary} radius={[4, 4, 0, 0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 3: DEBT SIMULATOR (EDITABLE) ═══ */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-on-surface">
                <span>Extra Monthly Principal Injection: <strong className="font-mono text-primary text-sm">{formatCurrency(extraPayment)}</strong></span>
              </div>
              <input
                type="range" min="10000" max="300000" step="10000" value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full sm:w-80 h-2 bg-surface-high rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 p-1 rounded-xl bg-surface-high border border-outline-variant">
                {(['avalanche', 'snowball'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setDebtStrategy(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                      debtStrategy === s ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setDebtForm({ name: '', balance: 1000000, apr: 18.0, minPayment: 35000 });
                  setIsAddingDebt(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Debt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-primary text-white space-y-1 shadow-md border border-outline-variant">
              <div className="text-xs text-white/70">Total Accelerated Time Saved</div>
              <div className="text-3xl font-bold font-mono text-secondary-fixed">{totalMonthsSaved} Months Saved</div>
            </div>
            <div className="p-5 rounded-2xl bg-primary text-white space-y-1 shadow-md border border-outline-variant">
              <div className="text-xs text-white/70">Total Interest Saved Across Loans</div>
              <div className="text-3xl font-bold font-mono text-secondary-fixed">{formatCurrency(totalInterestSaved)}</div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredDebts.length === 0 ? (
              <div className="p-8 text-center bg-surface-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
                No debts or loans match your search.
              </div>
            ) : (
              debtResults
                .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((debt) => (
              <div key={debt.id} className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-primary text-base">{debt.name}</h4>
                    <span className="text-xs text-on-surface-variant font-mono">
                      APR: <strong className="text-primary">{debt.apr}%</strong> · Min Payment: <strong className="text-primary">{formatCurrency(debt.minPayment)}/mo</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-on-surface-variant">Outstanding</div>
                      <div className="text-lg font-bold font-mono text-primary">{formatCurrency(debt.balance)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingDebt(debt);
                        setDebtForm({ name: debt.name, balance: debt.balance, apr: debt.apr, minPayment: debt.minPayment });
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-outline-variant bg-surface-low hover:bg-surface-high font-semibold text-primary transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="text-accent hover:opacity-75 p-1"
                      title="Delete Loan"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
                  <div className="p-3 rounded-xl bg-surface-low text-center border border-outline-variant">
                    <div className="text-on-surface-variant">Standard Payoff</div>
                    <div className="font-bold text-primary text-sm">{debt.monthsWithout} mo</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/10 text-center border border-secondary/30">
                    <div className="text-secondary font-semibold">With Accelerated Plan</div>
                    <div className="font-bold text-secondary text-sm">{debt.monthsWith} mo</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/10 text-center border border-accent/30">
                    <div className="text-accent font-semibold">Interest Savings</div>
                    <div className="font-bold text-accent text-sm">{formatCurrency(debt.interestSaved)}</div>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ═══════════ EDIT / ADD SUBSCRIPTION MODAL ═══════════ */}
      {(isAddingSub || editingSub) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-primary">{editingSub ? 'Edit Subscription' : 'Add Subscription'}</h3>
              <button onClick={() => { setIsAddingSub(false); setEditingSub(null); }} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Merchant Name</label>
                <input
                  type="text" value={subForm.merchantName}
                  onChange={(e) => setSubForm({ ...subForm, merchantName: e.target.value })}
                  placeholder="e.g. Spotify Premium, AWS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Amount (₦)</label>
                <input
                  type="number" value={subForm.amount}
                  onChange={(e) => setSubForm({ ...subForm, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Billing Cycle</label>
                <select
                  value={subForm.billingCycle}
                  onChange={(e) => setSubForm({ ...subForm, billingCycle: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary focus:outline-none focus:border-primary"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setIsAddingSub(false); setEditingSub(null); }}
                className="w-1/3 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveSub}
                className="w-2/3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md"
              >
                Save Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT / ADD ENVELOPE MODAL ═══════════ */}
      {(isAddingEnv || editingEnv) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-primary">{editingEnv ? 'Edit Envelope Budget' : 'Add Envelope Budget'}</h3>
              <button onClick={() => { setIsAddingEnv(false); setEditingEnv(null); }} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Category Name</label>
                <input
                  type="text" value={envForm.category}
                  onChange={(e) => setEnvForm({ ...envForm, category: e.target.value })}
                  placeholder="e.g. Operations, Marketing, Lifestyle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Allocated Budget (₦)</label>
                <input
                  type="number" value={envForm.allocatedAmount}
                  onChange={(e) => setEnvForm({ ...envForm, allocatedAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Current Spend (₦)</label>
                <input
                  type="number" value={envForm.spentAmount}
                  onChange={(e) => setEnvForm({ ...envForm, spentAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setIsAddingEnv(false); setEditingEnv(null); }}
                className="w-1/3 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveEnvelope}
                className="w-2/3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT / ADD DEBT MODAL ═══════════ */}
      {(isAddingDebt || editingDebt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-primary">{editingDebt ? 'Edit Debt / Loan' : 'Add Debt / Loan'}</h3>
              <button onClick={() => { setIsAddingDebt(false); setEditingDebt(null); }} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Loan / Facility Name</label>
                <input
                  type="text" value={debtForm.name}
                  onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                  placeholder="e.g. Asset Finance, Credit Facility"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Principal Balance (₦)</label>
                <input
                  type="number" value={debtForm.balance}
                  onChange={(e) => setDebtForm({ ...debtForm, balance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">APR (%)</label>
                  <input
                    type="number" step="0.5" value={debtForm.apr}
                    onChange={(e) => setDebtForm({ ...debtForm, apr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Min Payment (₦)</label>
                  <input
                    type="number" value={debtForm.minPayment}
                    onChange={(e) => setDebtForm({ ...debtForm, minPayment: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm text-primary font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setIsAddingDebt(false); setEditingDebt(null); }}
                className="w-1/3 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveDebt}
                className="w-2/3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md"
              >
                Save Facility
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
