'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { bankInstitutions } from '@/lib/mock-data/banks';
import type { SubscriptionTier } from '@/types';

const heroNodes = [
  { name: 'GTBank PLC', cat: 'Commercial', bal: 14250000 },
  { name: 'Stanbic IBTC', cat: 'Investment', bal: 8400000 },
  { name: 'Kuda Bank MFB', cat: 'Digital MFB', bal: 2200000 },
];

export default function MarketingLandingPage() {
  const { formatCurrency } = useStealth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Auth & Onboarding Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('premium');
  const [selectedNodes, setSelectedNodes] = useState<string[]>(['gtb', 'kuda']);
  const [bankSearch, setBankSearch] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // ═══════════ SAVINGS & INVESTMENT CALCULATOR STATE ═══════════
  const [monthlyIncome, setMonthlyIncome] = useState<number>(1000000);
  const [savingsRate, setSavingsRate] = useState<number>(20);
  const [annualYield, setAnnualYield] = useState<number>(14.0);

  // Check if user just logged out
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('logged_out') === '1') {
        setLogoutNotice(true);
        setTimeout(() => setLogoutNotice(false), 6000);
      }
    }
  }, []);

  // Calculate Savings & Compound Interest
  const monthlySavings = Math.round(monthlyIncome * (savingsRate / 100));
  const principalOneYear = monthlySavings * 12;
  const monthlyRate = annualYield / 100 / 12;
  // Future Value of monthly ordinary annuity with compound interest
  const futureValue =
    monthlyRate > 0
      ? monthlySavings * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate)
      : principalOneYear;
  const annualInterest = Math.round(Math.max(0, futureValue - principalOneYear));
  const totalStashOneYear = Math.round(futureValue);
  const subscriptionSavings = 78000; // Average annual savings from catching zombie subscriptions
  const netWealthGain = annualInterest + subscriptionSavings;

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
    setTimeout(() => setIsInitializing(false), 2200);
  };

  const openAuthModal = (mode: 'login' | 'register', tier: SubscriptionTier = 'premium') => {
    setAuthMode(mode);
    setSelectedTier(tier);
    setOnboardingStep(1);
    setIsModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'auth_user',
        JSON.stringify({
          email: formEmail || 'user@mymoney.ng',
          name: 'Adewale Okonkwo',
          plan: 'MyMoney Plenty',
        })
      );
      window.location.href = '/dashboard';
    }
  };

  const handleRegisterComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'auth_user',
        JSON.stringify({
          email: formEmail || 'user@mymoney.ng',
          name: fullName || 'New User',
          phone: formPhone,
          plan: selectedTier === 'free' ? 'MyMoney Free' : 'MyMoney Plenty',
        })
      );
      window.location.href = '/dashboard';
    }
  };

  const filteredBanks = bankInstitutions.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* ═══════════ LOGOUT SECURITY BANNER ═══════════ */}
      <AnimatePresence>
        {logoutNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary text-white text-xs px-4 py-3 text-center flex items-center justify-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
            <span>You have been securely logged out. Session tokens and saved passwords have been purged for your protection.</span>
            <button onClick={() => setLogoutNotice(false)} className="ml-2 hover:opacity-75">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ NAVIGATION ═══════════ */}
      <header className="sticky top-0 z-40 glass-surface border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MyMoney Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-sm border border-outline-variant/30 flex-shrink-0"
            />
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight">MyMoney</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#calculator" className="hover:text-primary transition-colors">Savings Calculator</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register', 'premium')}
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
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Savings Calculator</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Pricing</a>
              <div className="pt-2 border-t border-outline-variant flex gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                  className="flex-1 py-2 text-center text-sm font-semibold text-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal('register', 'premium'); }}
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
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary tracking-tight leading-[1.1]">
            All Your Money, Banks &amp; Bills in One Simple Place.
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
            Connect your commercial and digital banks, stop paying for forgotten subscriptions, and let MyMoney automatically pay your electricity, data, rent, and bills the minute your salary lands.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => openAuthModal('register', 'premium')}
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

      {/* ═══════════ SAVINGS & INVESTMENT INTEREST CALCULATOR ═══════════ */}
      <section id="calculator" className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">Savings &amp; Investment Interest Calculator</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Check how much interest and extra wealth your salary can build when you automate your savings and earn guaranteed returns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-surface-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant shadow-xl">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Input 1: Monthly Income */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-primary">
                  <label htmlFor="income-input">Your Monthly Income (₦)</label>
                  <span className="font-mono font-bold text-secondary text-base">{formatCurrency(monthlyIncome)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant font-mono">₦</span>
                  <input
                    id="income-input"
                    type="number"
                    step="50000"
                    min="100000"
                    max="50000000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                {/* Income Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[500000, 1000000, 2000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setMonthlyIncome(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                        monthlyIncome === amt
                          ? 'bg-primary text-white'
                          : 'bg-surface-high text-on-surface-variant hover:bg-outline-variant/30'
                      }`}
                    >
                      ₦{(amt / 1000000).toFixed(amt % 1000000 === 0 ? 0 : 1)}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 2: Savings Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-primary">
                  <span>Portion to Save / Invest Each Month</span>
                  <span className="font-mono font-bold text-primary">{savingsRate}% ({formatCurrency(monthlySavings)}/mo)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value))}
                  className="w-full h-2 bg-surface-high rounded-lg cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>5% (Modest)</span>
                  <span>20% (Recommended)</span>
                  <span>50% (Aggressive)</span>
                </div>
              </div>

              {/* Input 3: Interest / Yield Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-primary">
                  <span>Expected Annual Interest Rate (% p.a.)</span>
                  <span className="font-mono font-bold text-secondary">{annualYield}% p.a.</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Stanbic MMF', rate: 14.0 },
                    { label: 'Treasury Bills', rate: 16.5 },
                    { label: 'Fixed High-Yield', rate: 18.0 },
                  ].map((tier) => (
                    <button
                      key={tier.rate}
                      onClick={() => setAnnualYield(tier.rate)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        annualYield === tier.rate
                          ? 'border-secondary bg-secondary/15 text-secondary font-bold'
                          : 'border-outline-variant bg-surface-low text-on-surface-variant hover:bg-surface-high'
                      }`}
                    >
                      <div className="text-xs font-semibold">{tier.label}</div>
                      <div className="text-[11px] font-mono mt-0.5">{tier.rate}% p.a.</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display Box */}
            <div className="lg:col-span-5 bg-primary text-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between space-y-6 shadow-xl border border-outline-variant">
              <div>
                <span className="text-xs font-mono text-secondary-fixed uppercase tracking-wider font-semibold">1-Year Wealth Projection</span>
                <div className="mt-3 space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <div className="text-xs text-white/70">Your Direct Savings (₦{formatCurrency(monthlySavings)} x 12)</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">{formatCurrency(principalOneYear)}</div>
                  </div>

                  <div className="pb-3 border-b border-white/10">
                    <div className="text-xs text-white/70">Compound Interest Earned (@ {annualYield}% p.a.)</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-secondary-fixed mt-0.5">+{formatCurrency(annualInterest)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-white/70">Total 1-Year Investment Stash</div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-headline text-white mt-0.5">{formatCurrency(totalStashOneYear)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <div className="text-xs font-bold text-secondary-fixed flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Plus ₦{formatCurrency(subscriptionSavings)} Subscriptions Saved</span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  MyMoney automatically blocks forgotten subscriptions and sweeps your leftover salary into high-yield 14%+ accounts.
                </p>
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
                onClick={() => openAuthModal('register', 'free')}
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
                onClick={() => openAuthModal('register', 'premium')}
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
                onClick={() => openAuthModal('register', 'premium_plus')}
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
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="MyMoney" className="w-8 h-8 rounded-lg object-contain" />
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
                <li><a href="#features" className="hover:text-primary transition-colors">Payday Auto-Bills</a></li>
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

      {/* ═══════════ ONBOARDING & SIGN IN MODAL ═══════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Tab Selector: Sign In vs Create Account */}
              <div className="flex p-1 rounded-2xl bg-surface-low border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Sign In (Returning User)
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setOnboardingStep(1); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Create Account (New User)
                </button>
              </div>

              {/* ═══ AUTH MODE: SIGN IN ═══ */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <h3 className="font-headline font-bold text-xl text-primary">Welcome Back to MyMoney</h3>
                    <p className="text-xs text-on-surface-variant">Sign in to view your accounts, payday bills, and savings.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="e.g. adewale@gmail.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface font-mono"
                      />
                    </div>
                  </div>

                  {/* Security Note regarding password auto-fill / remembrance */}
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-2.5 text-[11px] text-secondary">
                    <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">lock</span>
                    <span>For your financial security, password auto-fill is disabled upon logout to prevent unauthorized access.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md active:scale-95"
                  >
                    Sign In to Dashboard →
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setOnboardingStep(1); }}
                      className="text-xs text-secondary font-semibold hover:underline"
                    >
                      Don&apos;t have an account yet? Create one for free
                    </button>
                  </div>
                </form>
              )}

              {/* ═══ AUTH MODE: CREATE ACCOUNT (REGISTRATION) ═══ */}
              {authMode === 'register' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-secondary uppercase font-semibold">Step {onboardingStep} of 3</span>
                      <span className="text-xs text-on-surface-variant font-medium">Plan: {selectedTier === 'free' ? 'Starter (Free)' : 'Plenty'}</span>
                    </div>
                    <h3 className="font-headline font-bold text-xl text-primary">
                      {onboardingStep === 1 && 'Create Your MyMoney Account'}
                      {onboardingStep === 2 && 'Select Your Nigerian Banks'}
                      {onboardingStep === 3 && 'Syncing Your Accounts'}
                    </h3>
                  </div>

                  {/* Step 1: User Registration Info */}
                  {onboardingStep === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Adewale Okonkwo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          autoComplete="off"
                          placeholder="adewale@gmail.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1">Phone Number (For OTP Verification)</label>
                        <input
                          type="tel"
                          required
                          placeholder="+234 803 123 4567"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1">Create Password</label>
                        <input
                          type="password"
                          required
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md mt-2"
                      >
                        Continue to Select Banks →
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className="text-xs text-on-surface-variant hover:text-primary"
                        >
                          Already have an account? <span className="text-secondary font-semibold">Sign In</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Select Banks (NDIC Insured) */}
                  {onboardingStep === 2 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-on-surface-variant font-medium">Select your banks ({selectedNodes.length} chosen):</span>
                        {selectedTier === 'free' && <span className="text-tertiary font-mono">Free Plan: Max 2 Banks</span>}
                      </div>

                      {/* Bank Search Input */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
                        <input
                          type="text"
                          placeholder="Search 33 NDIC banks (GTB, Kuda, Zenith...)"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          className="w-full bg-transparent text-xs text-primary focus:outline-none placeholder:text-on-surface-variant/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {filteredBanks.map((bank) => {
                          const isSel = selectedNodes.includes(bank.id);
                          return (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => toggleNodeSelection(bank.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSel
                                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                  : 'border-outline-variant bg-surface-low text-on-surface-variant hover:bg-surface-high'
                              }`}
                            >
                              <div className="text-xs font-semibold truncate">{bank.name}</div>
                              <div className="text-[10px] opacity-70">{bank.category}</div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setOnboardingStep(1)}
                          className="w-1/3 py-3 rounded-xl border border-outline-variant bg-surface-low text-on-surface text-xs font-bold"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => { setOnboardingStep(3); handleStep3Init(); }}
                          className="w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                        >
                          Connect Banks →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Initialization & Launch */}
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
                            <h4 className="font-bold text-lg text-primary">Welcome to MyMoney!</h4>
                            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                              Your accounts have been connected. You can now setup payday auto-bills, manage cards, and track interest.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRegisterComplete}
                            className="inline-block w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                          >
                            Enter MyMoney Dashboard →
                          </button>
                        </div>
                      )}
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
