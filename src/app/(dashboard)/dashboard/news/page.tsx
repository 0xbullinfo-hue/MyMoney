'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NigerianNewsItem {
  id: string;
  headline: string;
  source: string;
  author: string;
  timeAgo: string;
  date: string;
  category: 'Banking & CBN' | 'Economy & Inflation' | 'Tech & Payments' | 'Markets & Wealth';
  summary: string;
  badgeColor: string;
  readTime: string;
  keyTakeaways: string[];
  fullStory: string[];
}

const nigerianNewsData: NigerianNewsItem[] = [
  {
    id: 'news_01',
    headline: 'CBN Maintains MPR at 26.75% to Anchor Inflation and Attract Foreign Diaspora Portfolio',
    source: 'BusinessDay Nigeria',
    author: 'Oluwaseun Adeyemi, Chief Macro Analyst',
    timeAgo: '2 hours ago',
    date: 'September 22, 2026',
    category: 'Banking & CBN',
    summary: 'The Monetary Policy Committee of the Central Bank of Nigeria has kept benchmark interest rates high, driving high-yield returns for short-term Treasury Bills and sovereign Money Market Funds above 14% to 19% p.a.',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    readTime: '3 min read',
    keyTakeaways: [
      'High-yield Money Market Funds (MMFs) and Treasury Bills continue to offer attractive risk-free returns above 16-19% p.a.',
      'Keeping residual salary in standard savings accounts yielding 3-5% results in real purchasing power decay.',
      'Automated savings sweeps on MyMoney let you tap institutional money market yields the same hour salary drops.',
    ],
    fullStory: [
      'The Monetary Policy Committee (MPC) of the Central Bank of Nigeria (CBN) has resolved to retain the Monetary Policy Rate (MPR) at 26.75%, maintaining an aggressive stance aimed at curbing persistent headline inflation and stabilizing the foreign exchange market.',
      'CBN Governor Olayemi Cardoso noted during the post-MPC briefing that while food and energy inflation show preliminary signs of deceleration following coordinated agricultural supply policies, the committee judged that loosening rates prematurely could reverse recent stability achieved in the NAFEM foreign exchange window.',
      'For Nigerian households and salary earners, this sustained monetary policy environment keeps short-term fixed-income yields near multi-year highs. Commercial banks and registered asset managers like Stanbic IBTC, FBNQuest, and United Capital are currently offering Treasury Bill and Money Market Fund yields ranging between 14.5% and 19.4% per annum.',
      'Financial planners advise that rather than leaving emergency reserves and residual salary idle in low-interest commercial checking accounts, Nigerian professionals should utilize automated treasury sweep rules to lock in sovereign yields on a daily compounded basis.',
    ],
  },
  {
    id: 'news_02',
    headline: 'NIBSS Instant Payments (NIP) Record ₦600 Trillion Transaction Volume Milestone in 2026',
    source: 'TechCabal',
    author: 'Damilola Famakinwa, Fintech Editor',
    timeAgo: '4 hours ago',
    date: 'September 22, 2026',
    category: 'Tech & Payments',
    summary: 'Electronic transactions across commercial and microfinance banks surged as Nigerian dual-income households and merchants adopt open banking protocols and automated payday bill routing.',
    badgeColor: 'bg-secondary/15 text-secondary border-secondary/30',
    readTime: '4 min read',
    keyTakeaways: [
      'Over 92% of everyday household payments in urban Nigeria now clear electronically via NIBSS NIP rails.',
      'Open Banking standard v2.1 enables secure read-only consolidation of accounts across GTBank, Access, Kuda, and Zenith.',
      'Automation of payday commitments prevents missed utility deadlines and late fees across DisCos and telecom providers.',
    ],
    fullStory: [
      'The Nigeria Inter-Bank Settlement System (NIBSS) has revealed that electronic transactions processed via the NIBSS Instant Payments (NIP) platform crossed the historic ₦600 Trillion threshold in 2026, solidifying Nigeria’s standing as one of the world’s fastest-growing real-time payments hubs.',
      'The exponential surge in electronic volume is driven by widespread smartphone penetration, the rapid expansion of digital microfinance banks like Kuda, Moniepoint, and OPay, and the regulatory implementation of the Central Bank of Nigeria’s Open Banking framework.',
      'Nigerian consumers are increasingly moving away from fragmented, manual bank transfers on multiple mobile apps. Instead, unified personal finance platforms and automated payday billing engines allow families to route their electricity, internet, school fees, and rent sinking funds synchronously.',
      'Industry experts emphasize that as payment volumes scale, consumers must maintain strict security hygiene by ensuring two-factor OTP authentication is enforced for all automated debits and never sharing transaction PINs or credentials.',
    ],
  },
  {
    id: 'news_03',
    headline: 'Electronic Money Transfer Levy (EMTL): FIRS Clarifies ₦50 Exemption on Self-Transfers',
    source: 'TheCable Financials',
    author: 'Ibrahim Danjuma, Tax & Regulatory Correspondent',
    timeAgo: '7 hours ago',
    date: 'September 22, 2026',
    category: 'Banking & CBN',
    summary: 'Federal Inland Revenue Service re-affirms that intra-account transfers between accounts belonging to the same BVN are exempt from the ₦50 stamp duty levy under updated fiscal regulations.',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    readTime: '2 min read',
    keyTakeaways: [
      'Transfers between your own bank accounts linked to the same BVN are exempt from the ₦50 EMTL deduction.',
      'Third-party inward transfers of ₦10,000 and above still attract the statutory ₦50 levy.',
      'Reconciling multiple bank statements via MyMoney helps track and flag erroneous bank deductions for swift reversals.',
    ],
    fullStory: [
      'The Federal Inland Revenue Service (FIRS), in collaboration with commercial deposit money banks, has issued an updated advisory regarding the application of the Electronic Money Transfer Levy (EMTL) introduced under the Finance Act.',
      'The clarification directly addresses consumer complaints regarding recurring ₦50 deductions on transfers between accounts owned by the same individual across different banking institutions.',
      'According to the revenue agency, electronic transfers initiated between accounts that share the identical Bank Verification Number (BVN) are classified as self-transfers and are legally exempt from the statutory ₦50 levy.',
      'Customers who notice erroneous EMTL debits during intra-account money rebalancing are encouraged to generate transaction logs from their bank aggregator or contact their bank customer experience desks with the relevant NIP session IDs for automated refund credits.',
    ],
  },
  {
    id: 'news_04',
    headline: 'DisCos Roll Out Band-A Electricity Tariff Updates Across Lagos, Abuja, and Port Harcourt',
    source: 'Punch Economy',
    author: 'Chioma Nwachukwu, Energy & Infrastructure',
    timeAgo: '12 hours ago',
    date: 'September 22, 2026',
    category: 'Economy & Inflation',
    summary: 'Electricity distribution companies announce adjusted prepaid kWh units for residential meters. Smart automated budgeting and token generation help households curb power expenditure.',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    readTime: '5 min read',
    keyTakeaways: [
      'Band-A residential customers receive an average of 20+ hours of guaranteed electricity per day at approved NERC tariffs.',
      'Prepaid electricity represents one of the largest monthly operational expenses for Nigerian urban households.',
      'Automating power token purchases at salary arrival ensures uninterrupted light and guards against peak-hour recharge delays.',
    ],
    fullStory: [
      'Electricity Distribution Companies (DisCos)—including Ikeja Electric, Eko DisCo, Abuja Electricity Distribution Company (AEDC), and Port Harcourt DisCo—have released their operational performance telemetry for Band-A feeders across key residential corridors.',
      'Under the oversight of the Nigerian Electricity Regulatory Commission (NERC), the utility providers reported that feeder reliability on designated Band-A circuits maintained an average availability of 20.8 hours per day throughout the preceding quarter.',
      'With electricity tariffs reflecting cost-reflective generation and transmission parameters, urban households are increasingly budgeting for power as a non-discretionary baseline expense alongside data and groceries.',
      'Energy management consultants highlight that automated payday token generation prevents the inconvenience of nighttime blackouts while enabling families to track their kWh consumption rate across seasonal weather transitions.',
    ],
  },
  {
    id: 'news_05',
    headline: 'Nigerian Diaspora Remittances Hit $21B: Open Banking Rails Simplify Direct Family Inflows',
    source: 'Nairametrics',
    author: 'Emeka Eze, Global Markets Desk',
    timeAgo: '1 day ago',
    date: 'September 21, 2026',
    category: 'Markets & Wealth',
    summary: 'Cross-border remittances continue to support Nigerian family reserves, with automated rent sinking funds and education tuition accounts receiving direct sovereign infills.',
    badgeColor: 'bg-secondary/15 text-secondary border-secondary/30',
    readTime: '4 min read',
    keyTakeaways: [
      'Official diaspora inflows reached $21 Billion, buoyed by CBN reforms in Non-Resident Non-Deliverable Forwards and IMTO licenses.',
      'Families are shifting from unstructured cash requests to designated, automated purpose-built accounts for rent and school fees.',
      'Consolidated multi-bank monitoring enables diaspora senders and local beneficiaries to ensure funds reach target goals.',
    ],
    fullStory: [
      'Annual diaspora remittances into Nigeria expanded to $21 Billion over the past fiscal cycle, according to balance-of-payments statistics released by the Central Bank of Nigeria and international development partners.',
      'The growth is attributed to regulatory modernizations that expanded International Money Transfer Operator (IMTO) licensing, allowed direct naira and domiciliary payouts at official market rates, and integrated open banking rails.',
      'Rather than sending lump sums without tracking, Nigerian professionals working in the UK, United States, Canada, and the Gulf are utilizing structured account setups in Nigeria where funds are directly allocated to automated school fees, mortgage payoffs, and parent healthcare sinking funds.',
      'The Central Bank reaffirmed its commitment to supporting compliant diaspora financial products that deepen national foreign exchange liquidity while building generational wealth for Nigerian families.',
    ],
  },
];

export default function NigerianNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NigerianNewsItem | null>(null);

  const filteredNews = nigerianNewsData.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ FULL ARTICLE VIEW ═══ */}
      <AnimatePresence>
        {selectedArticle ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-primary font-semibold text-xs hover:bg-surface-high transition-all flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to News Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="w-9 h-9 rounded-xl bg-surface-lowest border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
                title="Close Article"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Article Content Container */}
            <article className="p-6 sm:p-10 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-6 max-w-4xl mx-auto">
              {/* Meta Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${selectedArticle.badgeColor}`}>
                    {selectedArticle.category}
                  </span>
                  <span className="font-bold text-primary">{selectedArticle.source}</span>
                  <span className="text-on-surface-variant">• {selectedArticle.date}</span>
                  <span className="text-on-surface-variant font-mono">• {selectedArticle.readTime}</span>
                </div>

                <h1 className="font-headline font-extrabold text-2xl sm:text-3xl md:text-4xl text-primary leading-tight">
                  {selectedArticle.headline}
                </h1>

                <div className="text-xs text-on-surface-variant font-medium pt-1">
                  By <strong className="text-primary">{selectedArticle.author}</strong> • Published {selectedArticle.timeAgo}
                </div>
              </div>

              {/* Key Takeaways Callout Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-low border border-secondary/30 space-y-3">
                <div className="flex items-center gap-2 font-headline font-bold text-sm text-primary">
                  <span className="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
                  <span>Why This Matters For Your Money in Nigeria</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                  {selectedArticle.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-secondary font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-sm sm:text-base text-on-surface leading-relaxed pt-2">
                {selectedArticle.fullStory.map((para, idx) => (
                  <p key={idx} className="leading-relaxed text-on-surface/90">
                    {para}
                  </p>
                ))}
              </div>

              {/* Action Footer */}
              <div className="pt-6 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-on-surface-variant">
                  Syndicated via authorized Nigerian financial press wires for MyMoney users.
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md self-start sm:self-auto"
                >
                  ← Return to All Stories
                </button>
              </div>
            </article>
          </motion.div>
        ) : (
          /* ═══ NEWS FEED LIST VIEW ═══ */
          <div className="space-y-6">
            {/* Page Header */}
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
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Financial Indicators Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm text-center">
                <div className="text-[10px] text-on-surface-variant uppercase font-semibold">CBN Monetary Rate</div>
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

            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {['all', 'Banking & CBN', 'Tech & Payments', 'Economy & Inflation', 'Markets & Wealth'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-lowest border border-outline-variant text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {cat === 'all' ? 'All Nigerian Stories' : cat}
                </button>
              ))}
            </div>

            {/* News Feed Cards */}
            <div className="space-y-4">
              {filteredNews.length === 0 ? (
                <div className="p-12 text-center bg-surface-lowest border border-outline-variant rounded-3xl text-sm text-on-surface-variant">
                  No Nigerian news articles found matching your query.
                </div>
              ) : (
                filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all space-y-3 cursor-pointer group"
                    onClick={() => setSelectedArticle(item)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.category}
                        </span>
                        <span className="font-semibold text-primary">{item.source}</span>
                        <span className="text-on-surface-variant">• {item.timeAgo}</span>
                      </div>
                      <span className="text-on-surface-variant text-[11px] font-mono">{item.readTime}</span>
                    </div>

                    <h2 className="font-headline font-bold text-base sm:text-lg text-primary leading-snug group-hover:text-secondary transition-colors">
                      {item.headline}
                    </h2>

                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-outline-variant/40 text-xs">
                      <span className="text-[11px] text-on-surface-variant font-medium">By {item.author.split(',')[0]}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(item);
                        }}
                        className="font-bold text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <span>Read Full Coverage</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
