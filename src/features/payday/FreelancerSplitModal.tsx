'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import type { PaydaySplitRule, PaydayExecutionLog } from '@/types/payday';

interface FreelancerSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PaydaySplitRule[];
  onSplitSuccess: (log?: PaydayExecutionLog) => void;
}

export function FreelancerSplitModal({
  isOpen,
  onClose,
  rules,
  onSplitSuccess,
}: FreelancerSplitModalProps) {
  const { formatCurrency } = useStealth();
  const [inflowAmount, setInflowAmount] = useState<number>(750000);
  const [narration, setNarration] = useState('CONTRACT MILESTONE PAYMENT / DESIGN RETAINER');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live breakdown
  let remaining = inflowAmount;
  let totalAllocated = 0;
  const breakdownPreview = rules.map((rule) => {
    let allocated = 0;
    if (!rule.isPaused) {
      if (rule.type === 'FIXED_AMOUNT') {
        allocated = Math.min(rule.value, remaining);
      } else {
        allocated = Math.round((rule.value / 100) * inflowAmount);
        allocated = Math.min(allocated, remaining);
      }
      remaining = Math.max(0, remaining - allocated);
      totalAllocated += allocated;
    }
    return {
      rule,
      allocated,
    };
  });

  const emtl = rules.filter((r) => !r.isPaused).length * 50;
  const vat = Math.round(totalAllocated * 0.075);
  const residualSavings = Math.max(0, remaining - emtl - vat);

  const handleExecuteSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inflowAmount <= 0) return;
    setIsExecuting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/allocator/manual-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: inflowAmount,
          narration,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || json.error || 'Execution failed');
      }

      setSuccessMessage(json.message || 'Split executed successfully');
      setTimeout(() => {
        setSuccessMessage(null);
        onSplitSuccess(json.log);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">alt_route</span>
                <div>
                  <h3 className="font-bold text-primary text-base">Manual Inflow Splitter</h3>
                  <p className="text-[11px] text-on-surface-variant">Freelancer &amp; Gig Economy Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold">
                ✓ {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-800 text-xs font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleExecuteSplit} className="space-y-4 text-xs">
              <div>
                <label className="block text-primary font-semibold mb-1">
                  Incoming Payment Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={50000}
                    step={50000}
                    required
                    value={inflowAmount}
                    onChange={(e) => setInflowAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono text-base font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  {[250000, 500000, 750000, 1500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInflowAmount(amt)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium border ${
                        inflowAmount === amt
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-high hover:bg-surface-highest border-outline-variant text-primary'
                      }`}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1">Payment Narration</label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-medium focus:outline-none"
                />
              </div>

              {/* Live Waterfall Preview */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-surface-low border border-outline-variant">
                <div className="flex justify-between font-bold text-primary pb-1 border-b border-outline-variant/60">
                  <span>Target Sub-Vault / Bill</span>
                  <span>Calculated Split</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {breakdownPreview.map(({ rule, allocated }) => (
                    <div key={rule.id} className="flex justify-between text-[11px]">
                      <span className="text-on-surface-variant truncate max-w-[200px]">{rule.name}</span>
                      <span className="font-mono font-semibold text-primary">{formatCurrency(allocated)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-outline-variant/60 flex justify-between font-bold text-secondary text-[11px]">
                  <span>Residual Swept to Stanbic MMF:</span>
                  <span className="font-mono">{formatCurrency(residualSavings)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExecuting || inflowAmount <= 0}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                >
                  {isExecuting ? 'Splitting Funds...' : 'Execute Waterfall Now'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
