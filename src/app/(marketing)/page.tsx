'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { useCalculator } from '@/hooks/use-calculator';
import { bankInstitutions } from '@/lib/mock-data/banks';
import type { SubscriptionTier } from '@/types';

const heroNodes = [
  { name: 'GTBank PLC', cat: 'Commercial', bal: 14250000, ping: '11ms' },
  { name: 'Stanbic IBTC', cat: 'Investment', bal: 8400000, ping: '14ms' },
  { name: 'Kuda Bank MFB', cat: 'Digital MFB', bal: 2200000, ping: '8ms' },
];

export default function MarketingLandingPage() {
  const { stealthModeEnabled, toggleStealthMode, formatCurrency } = useStealth();
  const { income, setIncome, bankNodes, setBankNodes, zombieClawback, debtSavings, velocityLift } = useCalculator();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState<string[]>(['gtb', 'kuda']);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('premium');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const toggleNodeSelection = (id: string) => {
    const limit = selectedTier === 'free' ? 2 : Infinity;
    if (selectedNodes.includes(id)) {
      setSelectedNodes(selectedNodes.filter((item) => item !== id));
    } else if (selectedNodes.length < limit) {
      setSelectedNodes([...selectedNodes, id]);
    }
  };

  const handleStep3Init = () => {
    setIsInitializing(true);
    setTimeout(() => setIsInitializing(false), 2500);
  };

  const openOnboarding = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setOnboardingStep(1);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* ═══════════ NAVIGATION ═══════════ */}
      <header className="sticky top-0 z-40 glass-surface border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MyMoney" className="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-sm" />
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight">MyMoney</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#payday-preview" className="hover:text-primary transition-colors">Auto-Bills</a>
            <a href="#calculator" className="hover:text-primary transition-colors">Savings Calculator</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openOnboarding('free')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openOnboarding('premium')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-container transition-all shadow-md active:scale-95"
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-low"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-outline-variant bg-surface px-4 py-4 space-y-3"
            >
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">How It Works</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Features</a>
              <a href="#payday-preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Auto-Bills</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Savings Calculator</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Pricing</a>
              <div className="pt-2 border-t border-outline-variant flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); openOnboarding('free'); }}
                  className="flex-1 py-2 text-center text-sm font-semibold text-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); openOnboarding('premium'); }}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-center text-sm font-bold"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Smart Personal Finance &amp; Bill Automation</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary tracking-tight leading-[1.1]">
            All Your Money, Banks &amp; Bills in One Simple Place.
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
            Connect your commercial and digital banks, stop paying for forgotten subscriptions, and let MyMoney automatically pay your electricity, data, rent, and bills the minute your salary lands.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => openOnboarding('premium')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]"
            >
              Get Started for Free
            </button>
            <a
              href="#calculator"
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-surface-low border border-outline-variant hover:bg-surface-high text-primary font-bold text-sm sm:text-base transition-all"
            >
              Calculate Your Savings
            </a>
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
              <span>Secure Automated Bank &amp; Card Payments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
              <span>We never store your passwords</span>
            </div>
          </div>
        </div>

        {/* Live Bank Feed Display Card */}
        <div className="lg:col-span-5 bg-primary-dark text-white p-5 sm:p-6 rounded-3xl border border-outline-variant shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-mono text-xs text-secondary-fixed uppercase tracking-wider font-semibold">All MyMoney Live Balance</span>
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
              </span>
            </div>
            <div className="space-y-3">
              {heroNodes.map((node, i) => (
                <div
                  key={i}
                  className="p-3.5 sm:p-4 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between hover:bg-white/15 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm text-white">{node.name}</div>
                    <div className="text-xs text-white/60">{node.cat}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-secondary-fixed text-sm">{formatCurrency(node.bal)}</div>
                    <div className="text-[10px] font-mono text-emerald-400">Connected</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 text-center">
              <span className="text-[11px] text-white/60">Protected with Bank-Grade 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS SECTION ═══════════ */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-outline-variant bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary">3 Simple Steps</span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">How MyMoney Automates Your Life</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Zero spreadsheets. Zero manual bank transfers every month.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-bold text-lg">
                1
              </div>
              <h3 className="font-headline font-bold text-lg text-primary">Connect Your Banks &amp; Cards</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Link any of the 33 NDIC-insured banks in Nigeria (GTBank, Access, Kuda, Zenith, Stanbic) in seconds with encrypted read-only tokens.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-headline font-bold text-lg">
                2
              </div>
              <h3 className="font-headline font-bold text-lg text-primary">Pick Your Payday Bills</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Choose your electricity meter, MTN/Starlink internet, Netflix plan, DSTV bouquet, and rent savings. Assign which card or bank pays each bill.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-primary flex items-center justify-center font-headline font-bold text-lg">
                3
              </div>
              <h3 className="font-headline font-bold text-lg text-primary">Relax &amp; Download Receipts</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                The moment your salary lands, MyMoney automatically pays all selected bills, sends prepaid power tokens to your phone, and generates a printable PDF invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section id="features" className="py-16 sm:py-20 bg-surface-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary mb-3">Everything You Need to Master Your Money</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Simple, automated tools to see your total balance, pay bills, and grow savings.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'account_balance', title: 'All Your Banks in One View', desc: 'See your real-time total net worth across GTBank, Access, Stanbic, Kuda, Zenith, and more in one screen.' },
              { icon: 'payments', title: 'Payday Auto-Bill Routing', desc: 'Never miss rent or electricity bills again. The moment salary arrives, your essential bills are paid automatically.' },
              { icon: 'radar', title: 'Unused Subscription Hunter', desc: 'Spot sneaky subscriptions and apps charging your cards that you no longer use, and cancel them in 1 tap.' },
              { icon: 'pie_chart', title: 'Smart Spending Budgets', desc: 'Set calm monthly allowances for food, transport, and family, with helpful alerts before you overspend.' },
              { icon: 'trending_down', title: 'Debt Payoff Planner', desc: 'See exactly how putting an extra ₦25,000/month towards loans can shave months off your debt and save big interest.' },
              { icon: 'lock', title: 'Bank-Grade Security', desc: 'We only use read-only connections. Your funds cannot be moved or withdrawn without your explicit biometric authorization.' },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[28px] text-secondary">{f.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROI CALCULATOR (CARDS) ═══════════ */}
      <section id="calculator" className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">Dynamic Cash Runway Engine</h2>
            <p className="text-on-surface-variant">Model subscription clawback and automated payoff acceleration across linked nodes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-surface-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant shadow-xl">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between font-semibold mb-3 text-sm text-on-surface">
                  <span>Monthly Liquidity Flow</span>
                  <span className="text-primary font-mono font-bold">{formatCurrency(income)}</span>
                </div>
                <input
                  type="range" min="500000" max="20000000" step="250000" value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-2 bg-surface-high rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between font-semibold mb-3 text-sm text-on-surface">
                  <span>Active Open Banking Nodes</span>
                  <span className="text-primary font-mono font-bold">{bankNodes} Nodes</span>
                </div>
                <input
                  type="range" min="1" max="10" value={bankNodes}
                  onChange={(e) => setBankNodes(Number(e.target.value))}
                  className="w-full h-2 bg-surface-high rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-primary text-white p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg border border-outline-variant">
              <span className="text-xs font-mono text-secondary-fixed uppercase tracking-wider font-semibold">Simulated Annual Yield</span>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/70">Zombie Debit Clawback</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-secondary-fixed">{formatCurrency(zombieClawback)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/70">Debt Avalanche Payoff Savings</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{formatCurrency(debtSavings)}</div>
                </div>
                <div>
                  <div className="text-xs text-white/70">Net Wealth Velocity Lift</div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-headline text-white">+{velocityLift}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING MATRIX ═══════════ */}
      <section id="pricing" className="py-16 sm:py-20 bg-surface-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-4">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">Simple, Transparent Plans</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Start for free or upgrade to automatically route your salary and bills.</p>
            <div className="inline-flex p-1 rounded-xl bg-surface-high border border-outline-variant">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'annual' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Yearly Billing (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free Tier Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-col justify-between space-y-6 shadow-sm hover:shadow-enclave transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-on-surface-variant">Starter</span>
                <h3 className="text-xl font-bold text-primary">MyMoney Free</h3>
                <div className="text-3xl font-extrabold font-mono text-primary">₦0 <span className="text-xs font-normal text-on-surface-variant">/ month forever</span></div>
                <ul className="space-y-2.5 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Up to 2 Connected Banks</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Consolidated Net Worth View</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Weekly Spending Summary</li>
                  <li className="line-through text-outline flex items-center gap-2">✕ Payday Auto-Bill Routing</li>
                  <li className="line-through text-outline flex items-center gap-2">✕ Subscription Hunter &amp; Auto-Freeze</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('free')}
                className="w-full py-3 rounded-xl bg-surface-high hover:bg-outline/20 text-primary font-bold text-sm transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* MyMoney Plenty (Recommended) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-primary text-white border-2 border-secondary flex flex-col justify-between space-y-6 shadow-2xl relative">
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary-fixed text-primary font-mono text-[10px] font-bold uppercase">
                Most Popular
              </span>
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-secondary-fixed">Smart Automation</span>
                <h3 className="text-xl font-bold text-white">MyMoney Plenty</h3>
                <div className="text-3xl font-extrabold font-mono text-secondary-fixed">
                  {billingCycle === 'annual' ? '₦2,400' : '₦3,000'}
                  <span className="text-xs font-normal text-white/70"> / month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs text-secondary-fixed font-mono -mt-2">Billed ₦28,800/yr (Saved ₦7,200)</p>
                )}
                <ul className="space-y-2.5 text-sm text-white/90">
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Unlimited Connected Banks &amp; Cards</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Payday Auto-Bill Routing (Light, Data, Subscriptions)</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Unused Subscription Hunter &amp; 1-Tap Freeze</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Smart Envelope Budgets &amp; Overspend Alerts</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Debt Payoff Planner &amp; Savings Forecaster</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('premium')}
                className="w-full py-3.5 rounded-xl bg-secondary-fixed hover:bg-white text-primary font-bold text-sm transition-all shadow-md"
              >
                Choose Plenty
              </button>
            </div>

            {/* MyMoney Large */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-col justify-between space-y-6 shadow-sm hover:shadow-enclave transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-secondary">Family &amp; Wealth</span>
                <h3 className="text-xl font-bold text-primary">MyMoney Large</h3>
                <div className="text-3xl font-extrabold font-mono text-primary">
                  {billingCycle === 'annual' ? '₦4,000' : '₦5,000'}
                  <span className="text-xs font-normal text-on-surface-variant"> / month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs text-secondary font-mono -mt-2">Billed ₦48,000/yr (Saved ₦12,000)</p>
                )}
                <ul className="space-y-2.5 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Everything in MyMoney Plenty</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Shared Family &amp; Partner Accounts</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Automated Rent &amp; School Fees Sinking Funds</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Automatic 14% p.a. High-Yield Treasury Sweeps</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Priority Concierge Support</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('premium_plus')}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-container font-bold text-sm transition-all shadow-md"
              >
                Choose Large
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 sm:py-16 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="MyMoney" className="w-6 h-6 rounded object-contain" />
                <span className="font-headline font-bold text-base text-primary">MyMoney</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                The smart money app for Nigerian dual-income households and professionals.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><a href="#features" className="hover:text-primary transition-colors">Bank Balances</a></li>
                <li><a href="#payday-preview" className="hover:text-primary transition-colors">Payday Auto-Bills</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Subscription Hunter</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Plans &amp; Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Security &amp; Trust</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Read-Only Bank Sync</li>
                <li>256-bit Encryption</li>
                <li>Biometric 2FA Protected</li>
                <li>NDPR Privacy Compliant</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>About MyMoney</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant/70 gap-4">
            <div>&copy; 2026 MyMoney Technologies Ltd. All rights reserved.</div>
            <div className="text-xs text-secondary font-medium">Simple, Smart Personal Finances</div>
          </div>
        </div>
      </footer>

      {/* ═══════════ ONBOARDING MODAL ═══════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="space-y-1">
                <span className="font-mono text-xs text-secondary uppercase font-semibold">Step {onboardingStep} of 3</span>
                <h3 className="font-headline font-bold text-xl text-primary">
                  {onboardingStep === 1 && 'Create Your MyMoney Account'}
                  {onboardingStep === 2 && 'Choose Your Plan'}
                  {onboardingStep === 3 && 'Connect Your Banks'}
                </h3>
              </div>

              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-on-surface-variant">Enter your email and create a password to set up your private financial account.</p>
                  <input
                    type="email" placeholder="Your Email Address" value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                  />
                  <input
                    type="password" placeholder="Create a Strong Password" value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                  />
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                  >
                    Continue to Bank Selection →
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Select the banks you use ({selectedNodes.length} selected):</span>
                    {selectedTier === 'free' && <span className="text-tertiary font-mono">Free Plan: Up to 2 Banks</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                    {bankInstitutions.map((bank) => {
                      const isSel = selectedNodes.includes(bank.id);
                      return (
                        <button
                          key={bank.id}
                          onClick={() => toggleNodeSelection(bank.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSel ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-outline-variant bg-surface-low text-on-surface-variant hover:bg-surface-high'
                          }`}
                        >
                          <div className="text-xs font-semibold">{bank.name}</div>
                          <div className="text-[10px] opacity-70">{bank.category}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="w-1/3 py-3 rounded-xl border border-outline-variant bg-surface-low text-on-surface text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => { setOnboardingStep(3); handleStep3Init(); }}
                      className="w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                    >
                      Connect Banks →
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-6 text-center py-4">
                  {isInitializing ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                      <div className="space-y-1">
                        <div className="font-bold text-primary">Setting Up Your Private Money View...</div>
                        <div className="text-xs text-on-surface-variant">Connecting {selectedNodes.length} bank feeds securely...</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-[28px]">check_circle</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-primary">Your Account is Ready!</h4>
                        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                          Your bank connections have been synchronized. You can now track your spending and configure auto-bills.
                        </p>
                      </div>
                      <a
                        href="/dashboard"
                        className="inline-block w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                      >
                        Enter MyMoney Dashboard →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
