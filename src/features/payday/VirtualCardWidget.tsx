'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { 
  VirtualCard, 
  VirtualCardSecureDetails, 
  CardTransaction, 
  CardCurrency, 
  CardBrand, 
  CardDesignTheme 
} from '@/types/cards';
import { useStealth } from '@/hooks/use-stealth';

interface VirtualCardWidgetProps {
  cards: VirtualCard[];
  onRefresh?: () => void;
  onCardUpdated?: (updatedCard: VirtualCard) => void;
}

export function VirtualCardWidget({
  cards,
  onRefresh,
  onCardUpdated,
}: VirtualCardWidgetProps) {
  const { formatCurrency } = useStealth();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Security Reveal State
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealedDetails, setRevealedDetails] = useState<VirtualCardSecureDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Freeze & Top-up State
  const [isFreezing, setIsFreezing] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(25);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [topupMessage, setTopupMessage] = useState<string | null>(null);

  // Issue Card Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState<{
    nickname: string;
    currency: CardCurrency;
    brand: CardBrand;
    designTheme: CardDesignTheme;
  }>({
    nickname: 'Streaming & Cloud Services',
    currency: 'USD',
    brand: 'VISA',
    designTheme: 'earthy_forest',
  });
  const [isIssuing, setIsIssuing] = useState(false);

  // Transactions State
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const activeCard = cards[activeCardIndex] || cards[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleFreeze = async () => {
    if (!activeCard) return;
    setIsFreezing(true);
    try {
      const willFreeze = activeCard.status === 'ACTIVE';
      const res = await fetch(`/api/cards/${activeCard.id}/toggle-freeze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeze: willFreeze }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (onCardUpdated) onCardUpdated(json.data);
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error('Failed to toggle freeze:', e);
    } finally {
      setIsFreezing(false);
    }
  };

  const handleRevealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;
    setRevealError(null);

    try {
      const res = await fetch(`/api/cards/${activeCard.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Authentication failed');
      }
      setRevealedDetails(json.data);
      setShowRevealModal(false);
      setPinInput('');
    } catch (err: unknown) {
      setRevealError(err instanceof Error ? err.message : 'Invalid verification PIN');
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard || topupAmount <= 0) return;
    setIsTopupLoading(true);
    setTopupMessage(null);

    try {
      // If USD, topupAmount is in dollars -> convert to cents (x100)
      // If NGN, topupAmount is in Naira -> convert to Kobo (x100)
      const amountUnits = topupAmount * 100;
      const res = await fetch(`/api/cards/${activeCard.id}/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUnits,
          sourceSubVaultId: 'vault_sub',
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Top-up failed');
      }

      setTopupMessage(`Topped up ${activeCard.currency === 'USD' ? `$${topupAmount}` : formatCurrency(topupAmount)} successfully!`);
      setTimeout(() => {
        setTopupMessage(null);
        setShowTopupModal(false);
      }, 1800);

      if (onCardUpdated && json.data.card) {
        onCardUpdated(json.data.card);
      }
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      setTopupMessage(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleIssueCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to issue card');
      }

      setShowIssueModal(false);
      if (onRefresh) onRefresh();
      setActiveCardIndex(0); // View newly issued card
    } catch (err) {
      console.error('Failed to issue card:', err);
    } finally {
      setIsIssuing(false);
    }
  };

  const openTransactionsModal = async () => {
    if (!activeCard) return;
    setShowTransactionsModal(true);
    setLoadingTx(true);
    try {
      const res = await fetch(`/api/cards/${activeCard.id}/transactions`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load card txs:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  if (!activeCard) {
    return (
      <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant text-center space-y-3">
        <p className="text-sm text-on-surface-variant">No Bridgecard virtual cards found.</p>
        <button
          type="button"
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
        >
          Issue Virtual Card
        </button>
      </div>
    );
  }

  // Get background styles based on design theme
  const getThemeGradient = (theme: CardDesignTheme) => {
    switch (theme) {
      case 'terracotta_sand':
        return 'from-[#8C4329] via-[#A85336] to-[#C96F4F]';
      case 'obsidian_gold':
        return 'from-[#141715] via-[#202521] to-[#2F352E] border-amber-500/30';
      case 'earthy_forest':
      default:
        return 'from-[#1B251D] via-[#243328] to-[#2E3A2F] border-emerald-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">credit_card</span>
              Bridgecard Virtual Cards
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono font-semibold">
              USD / NGN Multi-Currency
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Auto-funded from your <strong>Subscriptions Vault</strong> on Payday so international media and SaaS subscriptions never decline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cards.length > 1 && (
            <div className="flex bg-surface-high p-1 rounded-xl gap-1">
              {cards.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCardIndex(idx);
                    setIsFlipped(false);
                    setRevealedDetails(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    idx === activeCardIndex
                      ? 'bg-surface-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {c.currency} ({c.last4})
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="px-3 py-1.5 rounded-xl bg-surface-high hover:bg-surface-highest text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Card
          </button>
        </div>
      </div>

      {/* Main Card Presentation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Flippable Card Visual (5 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            style={{ perspective: 1000 }}
            className="w-full max-w-[380px] h-[230px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full h-full"
            >
              {/* ═══ CARD FRONT ═══ */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className={`absolute inset-0 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between border bg-gradient-to-tr ${getThemeGradient(
                  activeCard.designTheme
                )} select-none overflow-hidden`}
              >
                {/* Subtle Foil Pattern Background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Frozen Overlay */}
                {activeCard.status === 'FROZEN' && (
                  <div className="absolute inset-0 z-20 bg-blue-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 border border-cyan-400/40 rounded-2xl">
                    <span className="material-symbols-outlined text-cyan-300 text-3xl animate-pulse">ac_unit</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                      Card Frozen
                    </span>
                    <span className="text-[10px] text-cyan-300/80">Declining all incoming debits</span>
                  </div>
                )}

                {/* Top Row: Chip + Contactless + Brand */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    {/* Metallic Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 flex items-center justify-center shadow-inner">
                      <div className="w-full h-[1px] bg-amber-800/40" />
                    </div>
                    <span className="material-symbols-outlined text-white/70 text-lg rotate-90">contactless</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md uppercase tracking-wider font-semibold">
                      {activeCard.currency} Virtual
                    </span>
                    <span className="font-extrabold tracking-wider text-base font-sans">
                      {activeCard.brand === 'VISA' ? (
                        <span className="italic tracking-tighter">VISA</span>
                      ) : (
                        <span className="flex items-center -space-x-2">
                          <span className="w-5 h-5 rounded-full bg-red-500/90 inline-block" />
                          <span className="w-5 h-5 rounded-full bg-amber-500/90 inline-block" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="z-10 tracking-widest font-mono text-base sm:text-lg font-medium drop-shadow-md">
                  {revealedDetails ? revealedDetails.fullPan : activeCard.maskedPan}
                </div>

                {/* Bottom Row: Cardholder & Expiry & Balance */}
                <div className="flex items-end justify-between z-10">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider opacity-70">Cardholder</div>
                    <div className="text-xs font-bold uppercase tracking-wider font-mono">
                      {activeCard.cardholderName}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wider opacity-70">Expires</div>
                    <div className="text-xs font-mono font-bold">
                      {revealedDetails ? revealedDetails.expiry : `${activeCard.expiryMonth}/${activeCard.expiryYear}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider opacity-70">Balance</div>
                    <div className="text-sm font-extrabold font-mono text-emerald-300">
                      {activeCard.currency === 'USD'
                        ? `$${(activeCard.balanceUnits / 100).toFixed(2)}`
                        : formatCurrency(activeCard.balanceUnits / 100)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ CARD BACK ═══ */}
              <div
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className={`absolute inset-0 rounded-2xl p-4 text-white shadow-xl flex flex-col justify-between border bg-gradient-to-tr ${getThemeGradient(
                  activeCard.designTheme
                )} select-none overflow-hidden`}
              >
                {/* Magnetic Stripe */}
                <div className="-mx-4 h-10 bg-neutral-900 mt-2 border-y border-neutral-800" />

                {/* Signature Strip + CVV */}
                <div className="px-2 space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-white/70">
                    <span>Authorized Signature</span>
                    <span>CVV2 Security Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-7 bg-white/90 rounded text-neutral-800 px-3 font-handwriting text-xs italic flex items-center">
                      Adekunle Olawale
                    </div>
                    <div className="w-14 h-7 bg-white rounded font-mono font-bold text-neutral-900 flex items-center justify-center text-xs tracking-wider shadow-inner">
                      {revealedDetails ? revealedDetails.cvv : '•••'}
                    </div>
                  </div>
                </div>

                {/* Back Disclaimers */}
                <div className="text-[8px] text-white/60 leading-tight space-y-1">
                  <p>
                    Issued by Bridgecard Technology in partnership with licensed CBN / BaaS Banking Partners. For international transactions, subscriptions, and verified online billing only.
                  </p>
                  <p className="font-mono text-white/80">
                    Provider Ref: {activeCard.providerCardId} • Linked to Subscriptions Vault
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-2 text-center text-[11px] text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">rotate_90_degrees_ccw</span>
            <span>Click card to flip (view CVV &amp; security strip)</span>
          </div>
        </div>

        {/* Card Controls & Details Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card Summary Badge */}
          <div className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Nickname &amp; Sub-Vault</div>
              <div className="text-sm font-bold text-primary">{activeCard.nickname}</div>
              <div className="text-[11px] text-secondary font-semibold">
                Auto-Topup: {activeCard.autoTopup ? 'Active on Payday' : 'Disabled'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-on-surface-variant font-medium">Monthly Limit</div>
              <div className="text-sm font-bold font-mono text-primary">
                {activeCard.currency === 'USD'
                  ? `$${(activeCard.spendLimitMonthly / 100).toFixed(2)}`
                  : formatCurrency(activeCard.spendLimitMonthly / 100)}
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Reveal / Mask Button */}
            <button
              type="button"
              onClick={() => {
                if (revealedDetails) {
                  setRevealedDetails(null);
                } else {
                  setShowRevealModal(true);
                }
              }}
              className="p-2.5 rounded-xl bg-surface-high hover:bg-surface-highest border border-outline-variant text-primary text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {revealedDetails ? 'visibility_off' : 'visibility'}
              </span>
              <span>{revealedDetails ? 'Hide Details' : 'Reveal Details'}</span>
            </button>

            {/* Freeze / Unfreeze */}
            <button
              type="button"
              onClick={handleToggleFreeze}
              disabled={isFreezing}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                activeCard.status === 'FROZEN'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-800 hover:bg-cyan-500/20'
                  : 'bg-surface-high hover:bg-surface-highest border-outline-variant text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {activeCard.status === 'FROZEN' ? 'lock_open' : 'ac_unit'}
              </span>
              <span>{activeCard.status === 'FROZEN' ? 'Unfreeze' : 'Freeze Card'}</span>
            </button>

            {/* Quick Top-Up */}
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add_card</span>
              <span>Top-Up</span>
            </button>

            {/* Transactions History */}
            <button
              type="button"
              onClick={openTransactionsModal}
              className="p-2.5 rounded-xl bg-surface-high hover:bg-surface-highest border border-outline-variant text-primary text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span>Activity</span>
            </button>
          </div>

          {/* Revealed Credentials Box */}
          {revealedDetails && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Decrypted Card Credentials
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">Verified Session</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase">Card Number</div>
                    <div className="font-mono font-bold text-primary">{revealedDetails.fullPan}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(revealedDetails.fullPan.replace(/\s+/g, ''), 'pan')}
                    className="text-primary hover:opacity-70 p-1"
                    title="Copy PAN"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedKey === 'pan' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase">Expiry</div>
                    <div className="font-mono font-bold text-primary">{revealedDetails.expiry}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(revealedDetails.expiry, 'exp')}
                    className="text-primary hover:opacity-70 p-1"
                    title="Copy Expiry"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedKey === 'exp' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase">CVV</div>
                    <div className="font-mono font-bold text-primary">{revealedDetails.cvv}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(revealedDetails.cvv, 'cvv')}
                    className="text-primary hover:opacity-70 p-1"
                    title="Copy CVV"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedKey === 'cvv' ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-emerald-800">
                Billing Address: {revealedDetails.billingAddress.street}, {revealedDetails.billingAddress.city}, Nigeria
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ MODAL: PIN REVEAL ═══ */}
      <AnimatePresence>
        {showRevealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <span className="material-symbols-outlined text-secondary">security</span>
                  <span>Security Authorization</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant">
                Enter your 6-digit transaction PIN to reveal full PAN and CVV.
                <br />
                <span className="font-mono text-secondary font-semibold">Demo Sandbox PIN: 849210</span>
              </p>

              {revealError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs font-semibold">
                  {revealError}
                </div>
              )}

              <form onSubmit={handleRevealSubmit} className="space-y-4">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••"
                  autoFocus
                  className="w-full text-center tracking-[1em] py-3 text-lg font-mono font-bold rounded-xl bg-surface-low border border-outline-variant focus:outline-none focus:border-primary"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevealModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90"
                  >
                    Verify &amp; Decrypt
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL: TOP-UP CARD ═══ */}
      <AnimatePresence>
        {showTopupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">add_card</span>
                  <h3 className="font-bold text-primary text-base">Top-Up Virtual Card</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="text-xs text-on-surface-variant">
                Debits your <strong>Subscriptions Vault (Anchor BaaS)</strong> and instantly funds this Bridgecard.
              </div>

              {topupMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold">
                  {topupMessage}
                </div>
              )}

              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Amount ({activeCard.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                      {activeCard.currency === 'USD' ? '$' : '₦'}
                    </span>
                    <input
                      type="number"
                      min={activeCard.currency === 'USD' ? 5 : 2000}
                      step={activeCard.currency === 'USD' ? 5 : 1000}
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono text-base font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    {(activeCard.currency === 'USD' ? [15, 25, 50, 100] : [5000, 15000, 30000, 50000]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopupAmount(amt)}
                        className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium border ${
                          topupAmount === amt
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-high hover:bg-surface-highest border-outline-variant text-primary'
                        }`}
                      >
                        {activeCard.currency === 'USD' ? `$${amt}` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    disabled={isTopupLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTopupLoading || topupAmount <= 0}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                  >
                    {isTopupLoading ? 'Funding...' : 'Confirm Top-Up'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL: ISSUE NEW CARD ═══ */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">add_circle</span>
                  <h3 className="font-bold text-primary text-base">Issue Virtual Card</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleIssueCardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Card Purpose / Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.nickname}
                    onChange={(e) => setIssueForm({ ...issueForm, nickname: e.target.value })}
                    placeholder="e.g. OpenAI &amp; AWS Hosting"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Currency
                    </label>
                    <select
                      value={issueForm.currency}
                      onChange={(e) => setIssueForm({ ...issueForm, currency: e.target.value as CardCurrency })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary text-xs font-medium focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Card Brand
                    </label>
                    <select
                      value={issueForm.brand}
                      onChange={(e) => setIssueForm({ ...issueForm, brand: e.target.value as CardBrand })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary text-xs font-medium focus:outline-none"
                    >
                      <option value="VISA">Visa</option>
                      <option value="MASTERCARD">Mastercard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Visual Design Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'earthy_forest', name: 'Forest', color: '#2E3A2F' },
                      { id: 'terracotta_sand', name: 'Terracotta', color: '#C96F4F' },
                      { id: 'obsidian_gold', name: 'Obsidian', color: '#1B1E1C' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setIssueForm({ ...issueForm, designTheme: th.id as CardDesignTheme })}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                          issueForm.designTheme === th.id
                            ? 'border-primary ring-2 ring-primary/20 bg-surface-high'
                            : 'border-outline-variant hover:bg-surface-low'
                        }`}
                      >
                        <div
                          className="w-full h-3 rounded-md mb-1.5"
                          style={{ backgroundColor: th.color }}
                        />
                        {th.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isIssuing}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                  >
                    {isIssuing ? 'Issuing...' : 'Create Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL: CARD TRANSACTIONS ═══ */}
      <AnimatePresence>
        {showTransactionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">receipt_long</span>
                  <h3 className="font-bold text-primary text-base">
                    Card Activity ({activeCard.nickname})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTransactionsModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {loadingTx ? (
                <div className="py-8 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  No cleared transactions recorded on this card yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-primary">{tx.merchantName}</div>
                        <div className="text-[10px] text-on-surface-variant">
                          {tx.merchantCategory} • {new Date(tx.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold font-mono text-primary">
                          -{tx.currency === 'USD' ? `$${tx.amount.toFixed(2)}` : formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-700">
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowTransactionsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
