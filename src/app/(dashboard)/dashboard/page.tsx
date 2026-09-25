'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useStealth } from '@/hooks/use-stealth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardExecutivePage() {
  const { stealthModeEnabled, globalCardFreeze, toggleStealthMode, toggleGlobalCardFreeze, formatCurrency } = useStealth();
  const [extraPayment, setExtraPayment] = useState(50000);
  const [isSyncingNode, setIsSyncingNode] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 5 Connected Bank Nodes with Distinct High-Contrast Theme Color Tags
  const [nodes, setNodes] = useState([
    { id: '1', name: 'GTBank PLC', cat: 'Commercial', bal: 14250000, ping: 12, status: 'active', color: '#F59E0B', tagColor: '#B45309', tagLabel: 'Primary' },
    { id: '2', name: 'Stanbic IBTC', cat: 'Investment', bal: 8400000, ping: 14, status: 'active', color: '#8EA27E', tagColor: '#586C4B', tagLabel: 'Investment' },
    { id: '3', name: 'Kuda Bank MFB', cat: 'Digital MFB', bal: 2200000, ping: 8, status: 'active', color: '#0EA5E9', tagColor: '#0284C7', tagLabel: 'Digital' },
    { id: '4', name: 'Access Bank PLC', cat: 'Commercial', bal: 1150000, ping: 19, status: 'active', color: '#EA580C', tagColor: '#C2410C', tagLabel: 'Commercial' },
    { id: '5', name: 'Zenith Bank PLC', cat: 'Commercial', bal: 850000, ping: 24, status: 'active', color: '#A855F7', tagColor: '#7E22CE', tagLabel: 'Payroll' },
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: '1', name: 'Cloud Infrastructure Node', amount: 48500, status: 'active' },
    { id: '2', name: 'Unused Analytics SaaS', amount: 12400, status: 'flagged_zombie' },
    { id: '3', name: 'Netflix Premium NG', amount: 5500, status: 'active' },
    { id: '4', name: 'DStv Compact Plus', amount: 4200, status: 'flagged_zombie' },
  ]);

  const totalLiquidAssets = nodes.reduce((sum, n) => sum + n.bal, 0);
  const totalLiabilities = 2200000;
  const netWorthTotal = totalLiquidAssets - totalLiabilities;

  // Chart data matching each connected bank color tag
  const netWorthChartData = nodes.map((n) => ({
    name: n.name,
    value: n.bal,
    color: n.color,
  }));

  const triggerForceSync = (id: string) => {
    setIsSyncingNode(id);
    setTimeout(() => setIsSyncingNode(null), 1400);
  };

  const killSubscription = (id: string) => {
    setSubscriptions(subscriptions.map((s) => (s.id === id ? { ...s, status: 'blocked' } : s)));
  };

  const monthsSaved = Math.round(extraPayment / 15000) + 8;

  // Responsive carousel: scroll by exactly one card width, snap-aligned per breakpoint.
  // (The old transform math always stepped 33.33% of the container, misaligning
  // cards at sm/base breakpoints where cards are 50%/100% wide.)
  const scrollTrack = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-node-card]');
    const amount = card ? card.offsetWidth + 24 : track.clientWidth;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Executive Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">All MyMoney</h1>
          <p className="text-sm text-on-surface-variant">Live consolidated balance across all your linked banks and accounts.</p>
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
              globalCardFreeze ? 'bg-accent text-white shadow-lg' : 'bg-surface-low text-accent border border-accent/30 hover:bg-accent hover:text-white'
            }`}
          >
            {globalCardFreeze ? '⚠️ Cards Frozen' : 'Emergency Freeze'}
          </button>
        </div>
      </div>

      {/* ═══ Net Worth Banner (Cards with Correlated Bank Colors) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Net Worth Card with Correlated Bank Segments */}
        <div className="sm:col-span-2 lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-primary text-white border border-outline-variant shadow-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-secondary-fixed uppercase tracking-wider font-semibold">Total Consolidated Net Worth</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{formatCurrency(netWorthTotal)}</div>
              <div className="text-xs text-emerald-400 font-mono">▲ +14.2% Net Wealth Velocity</div>
            </div>
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={netWorthChartData} innerRadius="62%" outerRadius="95%" paddingAngle={3} dataKey="value" stroke="none">
                    {netWorthChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ background: '#2E3A2F', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Color Tag Legend Matching Connected Banks */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {nodes.map((node) => (
              <div key={node.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: node.color }} />
                <span className="text-white/80 text-[11px] truncate max-w-[100px]">{node.name.replace(' PLC', '')}</span>
                <span className="text-secondary-fixed font-mono text-[10px] font-bold">
                  {Math.round((node.bal / totalLiquidAssets) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Liquid Assets Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Liquid Bank Assets</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary mt-1">{formatCurrency(totalLiquidAssets)}</div>
            <div className="text-xs text-secondary font-medium mt-1">Spread across {nodes.length} connected banks</div>
          </div>
          <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/40">
            Available for Payday sweeps &amp; investments
          </div>
        </div>

        {/* Total Debt Liabilities Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Total Debt Liabilities</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-accent mt-1">{formatCurrency(totalLiabilities)}</div>
            <div className="text-xs text-accent font-semibold mt-1">Smart Payoff Plan Active</div>
          </div>
          <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/40">
            Low 14.5% weighted average APR
          </div>
        </div>
      </div>

      {/* ═══ Connected Bank Nodes with Slide/Carousel Feature ═══ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-headline font-bold text-lg sm:text-xl text-primary">Connected Bank Nodes</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold border border-secondary/30">
              {nodes.length} of 5 Connected
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-1.5 bg-surface-lowest border border-outline-variant rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => scrollTrack(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-surface-low transition-all"
                aria-label="Previous banks"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTrack(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-surface-low transition-all"
                aria-label="Next banks"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            <Link href="/dashboard/mesh" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              <span>Manage Banks</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Carousel / Sliding Cards Container (scroll-snap: correct at every breakpoint) */}
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              data-node-card
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-start p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all flex flex-col justify-between space-y-4 relative"
            >
              {/* Bank Header with Matching Color Tag Badge */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2.5">
                  {/* Colored dot matching the Net Worth chart */}
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs ring-2 ring-white"
                    style={{ backgroundColor: node.color }}
                    title={`Net Worth Chart Color for ${node.name}`}
                  />
                  <div>
                    <h3 className="font-bold text-primary text-sm sm:text-base leading-tight">{node.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">{node.cat}</span>
                      <span
                        className="px-2 py-0.2 text-[10px] font-bold rounded-md font-mono"
                        style={{ backgroundColor: `${node.color}15`, color: node.tagColor || node.color }}
                      >
                        {node.tagLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-mono text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  {node.ping}ms
                </span>
              </div>

              <div>
                <div className="text-xs text-on-surface-variant font-medium">Available Balance</div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-primary mt-0.5">{formatCurrency(node.bal)}</div>
              </div>

              {/* Button: Refresh MyMoney with spinning sync icon */}
              <button
                type="button"
                onClick={() => triggerForceSync(node.id)}
                disabled={isSyncingNode === node.id}
                className="w-full py-2.5 rounded-xl bg-surface-low hover:bg-surface-high border border-outline-variant text-xs font-semibold text-primary transition-all flex justify-center items-center gap-2 shadow-xs active:scale-[0.98]"
              >
                <span className={`material-symbols-outlined text-[16px] text-secondary ${isSyncingNode === node.id ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isSyncingNode === node.id ? 'Refreshing MyMoney...' : 'Refresh MyMoney'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Intelligence Modules (Friendly Copy & Direct Links) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Unused Subscription Radar Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-primary">Unused Subscription Radar</h3>
              <p className="text-xs text-on-surface-variant">Detect and pause recurring charges you no longer use.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold border border-secondary/30">
              Active Radar
            </span>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-3 sm:p-4 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`font-bold text-sm text-primary truncate ${sub.status === 'blocked' ? 'line-through opacity-50' : ''}`}>
                    {sub.name}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">{formatCurrency(sub.amount)} / mo</div>
                </div>
                {sub.status === 'blocked' ? (
                  <span className="text-xs font-bold text-accent font-mono flex-shrink-0">PAUSED</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => killSubscription(sub.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex-shrink-0 ${
                      sub.status === 'flagged_zombie' ? 'bg-accent text-white hover:bg-black' : 'bg-surface-high text-on-surface-variant hover:bg-accent hover:text-white'
                    }`}
                  >
                    {sub.status === 'flagged_zombie' ? 'Pause Unused' : 'Block'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/intelligence?tab=0"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1.5 pt-2"
          >
            <span>Open Full Subscription Radar</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Smart Debt Payoff Planner Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div>
            <h3 className="font-headline font-bold text-base sm:text-lg text-primary">Smart Debt Payoff Planner</h3>
            <p className="text-xs text-on-surface-variant">Accelerate your loan freedom and cut compound interest.</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 text-on-surface">
                <span>Extra Monthly Payoff Amount</span>
                <span className="font-mono text-primary font-bold">{formatCurrency(extraPayment)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="10000"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full h-2 bg-surface-high rounded-lg cursor-pointer accent-primary"
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

          <Link
            href="/dashboard/intelligence?tab=2"
            className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1.5 pt-2"
          >
            <span>Open Full Debt Simulator</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
