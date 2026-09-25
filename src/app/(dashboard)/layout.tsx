'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';

const desktopNavItems = [
  { icon: 'dashboard', label: 'Overview', href: '/dashboard' },
  { icon: 'account_balance_wallet', label: 'My Money', href: '/dashboard/mesh' },
  { icon: 'payments', label: 'Payday & Auto-Bills', href: '/dashboard/payday' },
  { icon: 'newspaper', label: 'Financial News', href: '/dashboard/news' },
  { icon: 'psychology', label: 'Intelligence', href: '/dashboard/intelligence' },
  { icon: 'receipt_long', label: 'Ledger', href: '/dashboard/ledger' },
  { icon: 'person', label: 'My Profile', href: '/dashboard/profile' },
];

const mobileNavItems = [
  { icon: 'dashboard', label: 'Home', href: '/dashboard' },
  { icon: 'account_balance_wallet', label: 'Banks', href: '/dashboard/mesh' },
  { icon: 'payments', label: 'Payday', href: '/dashboard/payday' },
  { icon: 'receipt_long', label: 'Ledger', href: '/dashboard/ledger' },
];

const moreDrawerItems = [
  { icon: 'newspaper', label: 'Financial News', desc: 'CBN rates, inflation & insights', href: '/dashboard/news' },
  { icon: 'psychology', label: 'Intelligence & Budgets', desc: 'Envelopes, radar & debt simulator', href: '/dashboard/intelligence' },
  { icon: 'person', label: 'My Profile & Security', desc: 'Cards, KYC verification & settings', href: '/dashboard/profile' },
  { icon: 'admin_panel_settings', label: 'Admin Enclave', desc: 'System health & audit logs', href: '/admin/health' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { stealthModeEnabled, toggleStealthMode, globalCardFreeze, toggleGlobalCardFreeze } = useStealth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/ledger?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('auth_user');
    document.cookie = 'mm_session=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/?logged_out=1';
  };

  const isMoreActive = pathname.startsWith('/dashboard/news') ||
    pathname.startsWith('/dashboard/intelligence') ||
    pathname.startsWith('/dashboard/profile') ||
    pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-surface font-body flex">
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className={`hidden md:flex flex-col border-r border-outline-variant/30 bg-surface-lowest transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-outline-variant/30">
          <img src="/logo.png" alt="MyMoney" className="w-10 h-10 rounded-xl object-contain shadow-sm border border-outline-variant/30 flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg text-primary tracking-tight">MyMoney</span>
              <span className="text-[10px] text-on-surface-variant font-medium -mt-1">All MyMoney</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {desktopNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  isActive ? 'bg-primary/8 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-low hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-secondary-fixed" />
                )}
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-3 border-t border-outline-variant/30 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent hover:bg-accent/10 transition-all w-full font-semibold"
            title="Log Out Securely"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-on-surface-variant hover:bg-surface-low transition-all w-full"
          >
            <span className="material-symbols-outlined text-[18px]">{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            {!sidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-surface border-b border-outline-variant/30 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Link href="/dashboard" className="md:hidden flex-shrink-0 flex items-center gap-1.5" title="MyMoney Overview">
              <img src="/logo.png" alt="MyMoney" className="w-8 h-8 rounded-lg object-contain shadow-xs border border-outline-variant/30" />
              <span className="font-headline font-bold text-base text-primary tracking-tight hidden xs:inline sm:inline">MyMoney</span>
            </Link>
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant/40 min-w-0 focus-within:border-secondary/60 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bills, banks, ledger..."
                  className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-w-0"
                />
              </div>
              <button
                type="submit"
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all items-center gap-1 shadow-xs flex-shrink-0 cursor-pointer"
                title="Search Ledger"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button
              onClick={toggleStealthMode}
              title={stealthModeEnabled ? 'Stealth Active: click to reveal' : 'Stealth Mode: click to mask balances'}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                stealthModeEnabled ? 'bg-secondary/15 text-secondary border border-secondary/30' : 'bg-surface-low border border-outline-variant/40 text-on-surface hover:bg-surface-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{stealthModeEnabled ? 'visibility_off' : 'visibility'}</span>
              <span className="hidden sm:inline">{stealthModeEnabled ? 'Stealth' : 'Reveal'}</span>
            </button>

            <button
              onClick={toggleGlobalCardFreeze}
              title={globalCardFreeze ? 'Card Freeze active (demo only — does not contact your bank)' : 'Freeze Cards (demo — cosmetic only)'}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                globalCardFreeze ? 'bg-accent text-white shadow-lg' : 'bg-tertiary-container text-tertiary hover:bg-accent hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">credit_card_off</span>
              <span className="hidden sm:inline">{globalCardFreeze ? 'Frozen (Demo)' : 'Freeze (Demo)'}</span>
            </button>

            <Link
              href="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-secondary transition-all flex-shrink-0"
              title="View Profile"
            >
              AO
            </Link>
          </div>
        </header>

        {/* Page Content: pb-24 ensures no mobile bottom bar collision */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>

        {/* ═══ Mobile Bottom Nav (Clean 5-Slot Thumb Navigation) ═══ */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-lowest/95 backdrop-blur-md border-t border-outline-variant/40 px-2 py-1 flex justify-around items-center z-30 shadow-lg">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
                  isActive ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* 5th Slot: More / Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
              isMoreActive || isMoreDrawerOpen ? 'text-secondary font-bold scale-105' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">more_horiz</span>
            <span className="text-[10px] leading-tight mt-0.5">More</span>
          </button>
        </nav>

        {/* ═══ Mobile "More" Slide-Up Drawer ═══ */}
        <AnimatePresence>
          {isMoreDrawerOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-primary-dark/70 backdrop-blur-sm">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="bg-surface-lowest rounded-t-3xl border-t border-outline-variant p-5 pb-8 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
              >
                {/* Pull indicator & Close */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="MyMoney" className="w-7 h-7 rounded-lg object-contain border border-outline-variant/30" />
                    <span className="font-headline font-bold text-base text-primary">More Features</span>
                  </div>
                  <button
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className="p-1 rounded-full text-on-surface-variant hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[22px]">close</span>
                  </button>
                </div>

                {/* More Drawer Nav Items */}
                <div className="space-y-2">
                  {moreDrawerItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMoreDrawerOpen(false)}
                        className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                            : 'bg-surface-low border-outline-variant/40 text-on-surface hover:bg-surface-high'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary shadow-xs">
                          <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-primary">{item.label}</div>
                          <div className="text-xs text-on-surface-variant truncate">{item.desc}</div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Controls inside Drawer */}
                <div className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant/40 space-y-3">
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Quick Safety Controls</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={toggleStealthMode}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        stealthModeEnabled
                          ? 'bg-secondary/15 text-secondary border-secondary/30'
                          : 'bg-surface-lowest text-on-surface border-outline-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{stealthModeEnabled ? 'visibility_off' : 'visibility'}</span>
                      <span>{stealthModeEnabled ? 'Stealth On' : 'Stealth Off'}</span>
                    </button>

                    <button
                      onClick={toggleGlobalCardFreeze}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        globalCardFreeze
                          ? 'bg-accent text-white border-accent'
                          : 'bg-surface-lowest text-accent border-accent/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">credit_card_off</span>
                      <span>{globalCardFreeze ? 'Frozen' : 'Freeze'}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Log Out Button */}
                <button
                  onClick={() => { setIsMoreDrawerOpen(false); handleLogout(); }}
                  className="w-full py-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Log Out Securely</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
