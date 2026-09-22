'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const adminNav = [
  { icon: 'monitor_heart', label: 'Health', href: '/admin/health' },
  { icon: 'group', label: 'Users', href: '/admin/users' },
  { icon: 'security', label: 'Audit', href: '/admin/audit' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-primary-dark text-white font-body flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-white/10 bg-primary-dark">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow animate-pulse" />
          <span className="font-headline font-bold text-lg tracking-tight">Admin OS</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  isActive ? 'bg-white/10 text-secondary-fixed font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}>
                {isActive && <motion.div layoutId="admin-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-secondary-fixed" />}
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-white/50 hover:text-secondary-fixed transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to ALL MY MONEY
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Nav */}
        <nav className="md:hidden flex justify-around border-b border-white/10 bg-primary-dark px-2 py-2">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium ${isActive ? 'text-secondary-fixed' : 'text-white/50'}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
