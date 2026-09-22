'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NigerianNewsItem {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  category: 'Banking & CBN' | 'Economy & Inflation' | 'Tech & Payments' | 'Markets & Wealth';
  summary: string;
  badgeColor: string;
  readTime: string;
  sourceUrl?: string;
}

const nigerianNewsData: NigerianNewsItem[] = [
  {
    id: 'news_01',
    headline: 'CBN Maintains MPR at 26.75% to Anchor Inflation and Attract Foreign Diaspora Portfolio',
    source: 'BusinessDay Nigeria',
    timeAgo: '2 hours ago',
    category: 'Banking & CBN',
    summary: 'The Monetary Policy Committee of the Central Bank of Nigeria has kept benchmark interest rates high, driving high-yield returns for short-term Treasury Bills and sovereign Money Market Funds above 14% p.a.',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    readTime: '3 min read',
  },
  {
    id: 'news_02',
    headline: 'NIBSS Instant Payments (NIP) Record ₦600 Trillion Transaction Volume Milestone in 2026',
    source: 'TechCabal',
    timeAgo: '4 hours ago',
    category: 'Tech & Payments',
    summary: 'Electronic transactions across commercial and microfinance banks surged as Nigerian dual-income households and merchants adopt open banking protocols and automated payday bill routing.',
    badgeColor: 'bg-secondary/15 text-secondary border-secondary/30',
    readTime: '4 min read',
  },
  {
    id: 'news_03',
    headline: 'Electronic Money Transfer Levy (EMTL): FIRS Clarifies ₦50 Exemption on Self-Transfers',
    source: 'TheCable Financials',
    timeAgo: '7 hours ago',
    category: 'Banking & CBN',
    summary: 'Federal Inland Revenue Service re-affirms that intra-account transfers between accounts belonging to the same BVN are exempt from the ₦50 stamp duty levy under the updated fiscal regulation.',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    readTime: '2 min read',
  },
  {
    id: 'news_04',
    headline: 'DisCos Roll Out Band-A Electricity Tariff Updates Across Lagos, Abuja, and Port Harcourt',
    source: 'Punch Economy',
    timeAgo: '12 hours ago',
    category: 'Economy & Inflation',
    summary: 'Electricity distribution companies announce adjusted prepaid kWh units for residential meters. Smart automated budgeting and token generation help households curb power expenditure.',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    readTime: '5 min read',
  },
  {
    id: 'news_05',
    headline: 'Nigerian Diaspora Remittances Hit $21B: Open Banking Rails Simplify Direct Family Inflows',
    source: 'Nairametrics',
    timeAgo: '1 day ago',
    category: 'Markets & Wealth',
    summary: 'Cross-border remittances continue to support Nigerian family reserves, with automated rent sinking funds and education tuition accounts receiving direct sovereign infills.',
    badgeColor: 'bg-secondary/15 text-secondary border-secondary/30',
    readTime: '4 min read',
  },
];

export default function NigerianNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = nigerianNewsData.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Page Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">Nigerian Financial News</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time Nigerian market insights, Central Bank monetary policy rates, inflation updates, and banking sector developments.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant w-full md:w-80 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search CBN, rates, tariffs, inflation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-primary focus:outline-none w-full"
          />
        </div>
      </div>

      {/* ═══ Market Ticker Bar ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm text-center">
          <div className="text-[10px] text-on-surface-variant uppercase font-semibold">CBN Policy Rate (MPR)</div>
          <div className="text-lg font-bold font-mono text-primary">26.75%</div>
          <div className="text-[10px] text-secondary font-semibold">Holding steady</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm text-center">
          <div className="text-[10px] text-on-surface-variant uppercase font-semibold">364-Day T-Bills Yield</div>
          <div className="text-lg font-bold font-mono text-secondary">19.4% p.a.</div>
          <div className="text-[10px] text-secondary font-semibold">Stanbic/GTB Treasury</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm text-center">
          <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Nafem FX Closing</div>
          <div className="text-lg font-bold font-mono text-primary">₦1,495 / $</div>
          <div className="text-[10px] text-on-surface-variant font-mono">Official Window</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm text-center">
          <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Headline Inflation</div>
          <div className="text-lg font-bold font-mono text-accent">32.1%</div>
          <div className="text-[10px] text-accent font-semibold">NBS Consumer Index</div>
        </div>
      </div>

      {/* ═══ Category Tabs ═══ */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['all', 'Banking & CBN', 'Tech & Payments', 'Economy & Inflation', 'Markets & Wealth'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-surface-lowest border border-outline-variant text-on-surface-variant hover:text-primary'
            }`}
          >
            {cat === 'all' ? 'All Nigerian Stories' : cat}
          </button>
        ))}
      </div>

      {/* ═══ News Feed ═══ */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center bg-surface-lowest border border-outline-variant rounded-3xl text-sm text-on-surface-variant">
            No Nigerian news articles found matching your query.
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <span className="font-semibold text-primary">{item.source}</span>
                  <span className="text-on-surface-variant">• {item.timeAgo}</span>
                </div>
                <span className="text-on-surface-variant text-[11px]">{item.readTime}</span>
              </div>

              <h2 className="font-headline font-bold text-base sm:text-lg text-primary leading-snug hover:text-secondary cursor-pointer transition-colors">
                {item.headline}
              </h2>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {item.summary}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-outline-variant/40 text-xs">
                <span className="text-[11px] text-on-surface-variant">Curated for Nigerian Wealth Stewards</span>
                <button
                  onClick={() => alert(`Full article syndicated from ${item.source}`)}
                  className="font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
                >
                  <span>Read Full Coverage</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
