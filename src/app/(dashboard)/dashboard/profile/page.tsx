'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStealth } from '@/hooks/use-stealth';
import { initialUserCards, initialBillRoutes } from '@/lib/mock-data/payday-routes';
import { mockSubscriptions } from '@/lib/mock-data/subscriptions';
import { bankInstitutions } from '@/lib/mock-data/banks';

export default function UserProfilePage() {
  const { formatCurrency } = useStealth();
  const [cards, setCards] = useState(initialUserCards);
  const [bills, setBills] = useState(initialBillRoutes);
  const [disconnectingCard, setDisconnectingCard] = useState<string | null>(null);

  // User Profile details
  const [profile, setProfile] = useState({
    fullName: 'Alhaji Bello Tariq',
    email: 'bello.tariq@mymoney.ng',
    phone: '+234 803 991 2044',
    bvnStatus: 'Verified (Tier 3)',
    plan: 'MyMoney Plenty (₦3,000/mo)',
    memberSince: 'March 2025',
  });

  const handleLogout = () => {
    // High security logout: clear session and prevent browser password remembrance
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  const removeCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    setDisconnectingCard(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">My Profile &amp; Preferences</h1>
          <p className="text-sm text-on-surface-variant">View all your linked cards, active subscriptions, Payday bills, and security settings.</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all flex items-center gap-1.5 self-start shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Log Out Securely</span>
        </button>
      </div>

      {/* ═══ Section 1: User Identity & Account Info ═══ */}
      <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-bold text-2xl">
            AB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-xl text-primary">{profile.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold">
                {profile.bvnStatus}
              </span>
            </div>
            <div className="text-xs text-on-surface-variant font-mono mt-0.5">{profile.email} • {profile.phone}</div>
            <div className="text-xs text-secondary font-semibold mt-1">Current Plan: {profile.plan}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ Section 2: Linked Payment Cards ═══ */}
        <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-primary">Linked Debit Cards</h3>
              <p className="text-xs text-on-surface-variant">Authorized for Payday auto-bill settlements.</p>
            </div>
            <Link
              href="/dashboard/payday"
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all"
            >
              + Link Card
            </Link>
          </div>

          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="p-4 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {card.cardType.slice(0, 4)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-primary">{card.bankName} {card.cardType} (•••• {card.last4})</div>
                    <div className="text-xs text-on-surface-variant font-mono">Expires {card.expiry} • Cap: {formatCurrency(card.monthlySpendLimit)}/mo</div>
                  </div>
                </div>
                <button
                  onClick={() => setDisconnectingCard(card.id)}
                  className="px-3 py-1.5 rounded-xl border border-accent/40 text-accent text-xs font-semibold hover:bg-accent/10 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Section 3: Active Payday Bills Schedule ═══ */}
        <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-primary">Active Payday Bills</h3>
              <p className="text-xs text-on-surface-variant">Configured to clear automatically when salary drops.</p>
            </div>
            <Link
              href="/dashboard/payday"
              className="text-xs text-secondary font-semibold hover:underline"
            >
              Manage in Payday Hub →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {bills.filter((b) => b.isAutoEnabled).map((bill) => (
              <div key={bill.id} className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">{bill.icon}</span>
                  <div>
                    <div className="font-bold text-primary">{bill.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">{bill.billerIdentifier}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-primary">{formatCurrency(bill.targetAmount)}</div>
                  <div className="text-[10px] text-on-surface-variant">{bill.assignedPaymentSourceName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Section 4: Security & Password Policy ═══ */}
      <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary">Security &amp; Air-Gapped Session Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">enhanced_encryption</span>
              <span>Zero Password Remembrance</span>
            </div>
            <p>For your security, browser password auto-fill is disabled on logout to prevent unauthorized access on shared devices.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">lock_reset</span>
              <span>Session Disconnect</span>
            </div>
            <p>Leaving the dashboard clears session tokens and enforces re-authentication via Sign In.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">sms</span>
              <span>Payday 2-Factor OTP</span>
            </div>
            <p>All bulk bill dispatches are guarded with 6-digit SMS or email OTP verification.</p>
          </div>
        </div>
      </div>

      {/* Disconnect Card Modal */}
      {disconnectingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">credit_card_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-primary">Disconnect Card?</h3>
              <p className="text-xs text-on-surface-variant">
                Are you sure you want to disconnect this card? Any Payday bills assigned to this card will be paused.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDisconnectingCard(null)}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => removeCard(disconnectingCard)}
                className="w-1/2 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
