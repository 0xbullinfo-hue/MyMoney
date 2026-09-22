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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed shadow-glow animate-pulse-glow" />
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight">MyMoney OS</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[11px] font-mono font-semibold">
              CBN Open Banking v2.1
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#calculator" className="hover:text-primary transition-colors">Runway Calculator</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Tiers</a>
            <a href="/dashboard/mesh" className="text-secondary hover:text-secondary-fixed transition-colors font-semibold">My Money</a>
            <a href="/dashboard" className="text-primary hover:text-secondary transition-colors font-bold">ALL MY MONEY →</a>
            <a href="/admin/health" className="text-on-surface-variant/70 hover:text-primary transition-colors text-xs font-mono">Admin Portal</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleStealthMode}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-surface-low border border-outline-variant text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-high transition-all text-on-surface"
              title="Toggle Stealth Balance Obfuscation"
            >
              <span className="material-symbols-outlined text-[16px]">{stealthModeEnabled ? 'visibility_off' : 'visibility'}</span>
              <span className="hidden sm:inline">{stealthModeEnabled ? 'Stealth Active' : 'Stealth Mode'}</span>
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
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Features</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Runway Calculator</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-on-surface">Tiers</a>
              <a href="/dashboard/mesh" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-secondary">My Money</a>
              <a href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-primary">ALL MY MONEY</a>
              <a href="/admin/health" className="block py-2 text-xs font-mono text-on-surface-variant">Admin Telemetry</a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary font-mono text-xs uppercase tracking-wider font-bold">
            CBN Open Banking Telemetry Core
          </span>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary tracking-tight leading-[1.1]">
            Sovereign Liquidity &amp; Multi-Node Financial Enclave
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl">
            Unify commercial banks, microfinance facilities, and credit nodes into a sub-second telemetry mesh with automated zombie-debit eradication and payday routing architecture.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => openOnboarding('premium')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]"
            >
              Deploy Sovereign Enclave
            </button>
            <a
              href="#calculator"
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-surface-low border border-outline-variant hover:bg-surface-high text-primary font-bold text-sm sm:text-base transition-all"
            >
              Simulate Net Velocity Lift
            </a>
          </div>
        </div>

        {/* Live Telemetry Node Display Card */}
        <div className="lg:col-span-5 bg-primary-dark text-white p-5 sm:p-6 rounded-3xl border border-outline-variant shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-mono text-xs text-secondary-fixed uppercase tracking-wider font-semibold">Mesh Ingestion Feed</span>
              <span className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 12ms Ping
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
                    <div className="text-[10px] font-mono text-emerald-400">🟢 {node.ping}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 text-center">
              <span className="text-[11px] font-mono text-white/50">Continuous SHA-256 HMAC Verified Ingestion</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION (CARDS) ═══════════ */}
      <section id="features" className="py-16 sm:py-20 bg-surface-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary mb-3">Financial Intelligence Suite</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Enterprise-grade modules for total financial sovereignty.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'account_balance', title: 'Multi-Node Banking Mesh', desc: 'Aggregate balances across commercial banks, MFBs, and credit lines with sub-second webhook telemetry.' },
              { icon: 'radar', title: 'Zombie Subscription Radar', desc: 'AI-powered detection of dormant recurring debits bleeding liquidity from your financial enclave.' },
              { icon: 'trending_down', title: 'Debt Avalanche Simulator', desc: 'Model extra principal injections against loan lifespan to calculate months and interest saved.' },
              { icon: 'pie_chart', title: 'Envelope Budgeting Engine', desc: 'Category-based spend caps with threshold warnings and real-time overspend alerts.' },
              { icon: 'visibility_off', title: 'Stealth Obfuscation Mode', desc: 'One-click balance masking across all surfaces for privacy in shared or public environments.' },
              { icon: 'shield', title: 'AES-256-GCM Security', desc: 'Military-grade encryption for all OAuth tokens with HMAC-verified webhook ingestion.' },
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

      {/* ═══════════ PRICING MATRIX (CARDS) ═══════════ */}
      <section id="pricing" className="py-16 sm:py-20 bg-surface-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-4">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-primary">Sovereign Tier Architecture</h2>
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
                Annual Billing (-20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Free Tier Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-col justify-between space-y-6 shadow-sm hover:shadow-enclave transition-all">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Sovereign Free</h3>
                <div className="text-3xl font-extrabold font-mono text-primary">₦0 <span className="text-xs font-normal text-on-surface-variant">/ mo</span></div>
                <ul className="space-y-2.5 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Max 2 Bank/MFB Nodes</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Consolidated Net Worth Dashboard</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Standard Daily Transaction Feed</li>
                  <li className="line-through text-outline flex items-center gap-2">✕ Open Banking Webhook Telemetry</li>
                  <li className="line-through text-outline flex items-center gap-2">✕ Subscription Radar</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('free')}
                className="w-full py-3 rounded-xl bg-surface-high hover:bg-outline/20 text-primary font-bold text-sm transition-all"
              >
                Deploy Free Bank
              </button>
            </div>

            {/* Premium Tier Card (Recommended) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-primary text-white border-2 border-secondary flex flex-col justify-between space-y-6 shadow-2xl relative">
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary-fixed text-primary font-mono text-[10px] font-bold uppercase">
                Recommended
              </span>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Sovereign Premium</h3>
                <div className="text-3xl font-extrabold font-mono text-secondary-fixed">
                  {billingCycle === 'annual' ? '₦3,600' : '₦4,500'}
                  <span className="text-xs font-normal text-white/70"> / mo</span>
                </div>
                <ul className="space-y-2.5 text-sm text-white/90">
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Unlimited Bank &amp; MFB Nodes</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Sub-second Open Banking Webhooks</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Subscription Radar &amp; Zombie Hunter</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Debt Avalanche Simulator</li>
                  <li className="flex items-center gap-2"><span className="text-secondary-fixed font-bold">✓</span> Priority Support Channel</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('premium')}
                className="w-full py-3.5 rounded-xl bg-secondary-fixed hover:bg-white text-primary font-bold text-sm transition-all shadow-md"
              >
                Launch Premium Trial
              </button>
            </div>

            {/* Premium+ Tier Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border border-outline-variant flex flex-col justify-between space-y-6 shadow-sm hover:shadow-enclave transition-all">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Sovereign Premium+</h3>
                <div className="text-3xl font-extrabold font-mono text-primary">
                  {billingCycle === 'annual' ? '₦7,200' : '₦9,000'}
                  <span className="text-xs font-normal text-on-surface-variant"> / mo</span>
                </div>
                <ul className="space-y-2.5 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Everything in Sovereign Premium</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Dynamic Envelope Budgeting Suite</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Payday Auto-Routing Architecture</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Partner &amp; Shared Household Nodes</li>
                  <li className="flex items-center gap-2"><span className="text-secondary font-bold">✓</span> Dedicated Account Manager</li>
                </ul>
              </div>
              <button
                onClick={() => openOnboarding('premium_plus')}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-container font-bold text-sm transition-all shadow-md"
              >
                Deploy Full OS Suite
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
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#calculator" className="hover:text-primary transition-colors">ROI Calculator</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Client OS</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><span className="text-xs font-mono">AES-256-GCM Vault</span></li>
                <li><span className="text-xs font-mono">HMAC-SHA256 Gateway</span></li>
                <li><span className="text-xs font-mono">CBN Compliance</span></li>
                <li><span className="text-xs font-mono">Zero-Knowledge Vault</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Portals</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><a href="/dashboard" className="hover:text-primary transition-colors font-semibold">Executive Dashboard</a></li>
                <li><a href="/dashboard/mesh" className="hover:text-primary transition-colors">Node Mesh</a></li>
                <li><a href="/dashboard/intelligence" className="hover:text-primary transition-colors">Intelligence Suite</a></li>
                <li><a href="/admin/health" className="hover:text-secondary-fixed text-secondary font-mono text-xs">Admin Telemetry</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Privacy Enclave Policy</li>
                <li>Terms of Service</li>
                <li>CBN Regulatory Disclosures</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant/70 gap-4">
            <div>&copy; 2026 MyMoney OS Technologies Ltd. Central Bank of Nigeria Open Banking Framework compliant.</div>
            <div className="font-mono text-[11px] text-secondary">OS Version: 4.8.2-enclave-prod</div>
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
                  {onboardingStep === 1 && 'Enclave Provisioning'}
                  {onboardingStep === 2 && 'OAuth Mesh Binding'}
                  {onboardingStep === 3 && 'Telemetry Synchronization'}
                </h3>
              </div>

              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-on-surface-variant">Enter credentials to configure your client-side encrypted vault.</p>
                  <input
                    type="email" placeholder="Enclave Admin Email" value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                  />
                  <input
                    type="password" placeholder="Zero-Knowledge Master Password" value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-low text-sm focus:outline-none focus:border-primary text-on-surface"
                  />
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-md"
                  >
                    Proceed to Node Binding →
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Select banking nodes ({selectedNodes.length} selected):</span>
                    {selectedTier === 'free' && <span className="text-tertiary font-mono">Free Tier Max: 2 Nodes</span>}
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
                      Connect &amp; Bind →
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-6 text-center py-4">
                  {isInitializing ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-secondary-fixed rounded-full animate-spin mx-auto" />
                      <div className="font-mono text-xs text-on-surface-variant">Establishing SHA-256 HMAC Telemetry Handshake...</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                        ✓
                      </div>
                      <h4 className="font-bold text-primary">Enclave Initialized Successfully</h4>
                      <p className="text-xs text-on-surface-variant">3 banks linked. Real-time balance telemetry active.</p>
                      <a
                        href="/dashboard"
                        className="inline-block w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all shadow-lg"
                      >
                        Enter ALL MY MONEY
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
