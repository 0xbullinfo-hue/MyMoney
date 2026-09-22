'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';

const navItems = [
  { icon: 'dashboard', label: 'Overview', href: '/dashboard' },
  { icon: 'account_balance_wallet', label: 'My Money', href: '/dashboard/mesh' },
  { icon: 'payments', label: 'Payday & Auto-Bills', href: '/dashboard/payday' },
  { icon: 'psychology', label: 'Intelligence', href: '/dashboard/intelligence' },
  { icon: 'receipt_long', label: 'Ledger', href: '/dashboard/ledger' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { stealthModeEnabled, toggleStealthMode, globalCardFreeze, toggleGlobalCardFreeze } = useStealth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-body flex">
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className={`hidden md:flex flex-col border-r border-outline-variant/30 bg-surface-lowest transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-outline-variant/30">
          <img src="/logo.png" alt="MyMoney" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg text-primary tracking-tight">MyMoney</span>
              <span className="text-[10px] text-on-surface-variant font-medium -mt-1">All MyMoney</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
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

        <div className="p-3 border-t border-outline-variant/30">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-low transition-all w-full"
          >
            <span className="material-symbols-outlined text-[20px]">{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-surface border-b border-outline-variant/30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
            <input
              type="text" placeholder="Search transactions, nodes..."
              className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-outline-variant/40 text-[10px] font-mono text-on-surface-variant">⌘K</kbd>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleStealthMode}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-surface-low border border-outline-variant/40 text-xs font-semibold flex items-center gap-2 hover:bg-surface-high transition-all">
              <span className="material-symbols-outlined text-[16px]">{stealthModeEnabled ? 'visibility_off' : 'visibility'}</span>
              <span className="hidden sm:inline">{stealthModeEnabled ? 'Stealth' : 'Reveal'}</span>
            </button>
            <button onClick={toggleGlobalCardFreeze}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                globalCardFreeze ? 'bg-accent text-white shadow-lg' : 'bg-tertiary-container text-tertiary hover:bg-accent hover:text-white'
              }`}>
              <span className="material-symbols-outlined text-[16px]">credit_card_off</span>
              <span className="hidden sm:inline">{globalCardFreeze ? 'Frozen' : 'Freeze'}</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              AO
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
          {children}
        </main>

        {/* ═══ Mobile Bottom Nav ═══ */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-lowest border-t border-outline-variant/30 px-2 py-1 flex justify-around z-30">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
