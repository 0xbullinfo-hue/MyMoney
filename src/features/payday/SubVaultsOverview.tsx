'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CentralWallet, SubVault } from '@/types/wallet';
import { useStealth } from '@/hooks/use-stealth';

interface SubVaultsOverviewProps {
  wallet: CentralWallet;
  onRefresh?: () => void;
  onDepositSuccess?: (vault: SubVault, amountKobo: number) => void;
}

export function SubVaultsOverview({
  wallet,
  onRefresh,
  onDepositSuccess,
}: SubVaultsOverviewProps) {
  const { formatCurrency } = useStealth();
  const [selectedVault, setSelectedVault] = useState<SubVault | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!selectedVault || depositAmount <= 0) return;
    setIsDepositing(true);
    setDepositError(null);

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId: selectedVault.id,
          amountKobo: depositAmount * 100,
          action: 'DEPOSIT',
          narration: `Manual deposit to ${selectedVault.name}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Deposit failed');
      }

      setDepositSuccessMsg(`Successfully credited ${formatCurrency(depositAmount)} to ${selectedVault.name}!`);
      setTimeout(() => {
        setDepositSuccessMsg(null);
        setSelectedVault(null);
      }, 2000);

      if (onDepositSuccess) {
        onDepositSuccess(selectedVault, depositAmount * 100);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: unknown) {
      setDepositError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Central Pool Master Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface-lowest via-surface-lowest to-surface-low border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Central Financing Pool
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                Anchor BaaS
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-primary">
              {wallet.accountName}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>{wallet.bankName}</span>
              <span>•</span>
              <span className="font-mono font-medium">{wallet.accountNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-baseline md:items-end flex-col border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/60">
          <div className="text-xs text-on-surface-variant font-medium">Consolidated Pool Balance</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">
            {formatCurrency(wallet.availableBalanceKobo / 100)}
          </div>
          <div className="text-[11px] text-secondary font-semibold">
            Synchronized across {wallet.subVaults.length} sub-ledgers
          </div>
        </div>
      </div>

      {/* Sub-Vaults Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallet.subVaults.map((vault) => {
          const balanceNaira = vault.balanceKobo / 100;
          const targetNaira = vault.targetAmountKobo ? vault.targetAmountKobo / 100 : null;
          const percentProgress = targetNaira ? Math.min(100, Math.round((balanceNaira / targetNaira) * 100)) : 100;

          return (
            <div
              key={vault.id}
              className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
            >
              {/* Vault Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: vault.colorTheme || '#2E3A2F' }}
                  >
                    <span className="material-symbols-outlined text-[19px]">{vault.icon || 'savings'}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary leading-tight">{vault.name}</h3>
                    <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
                      {vault.provider} Engine
                    </span>
                  </div>
                </div>

                {vault.isLocked ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    Locked
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                    Active
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-on-surface-variant line-clamp-2">
                {vault.description}
              </p>

              {/* Balance & Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-on-surface-variant font-medium">Sub-Vault Balance</span>
                  <span className="text-lg font-bold font-mono text-primary">
                    {formatCurrency(balanceNaira)}
                  </span>
                </div>

                {targetNaira && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-surface-high rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentProgress}%`,
                          backgroundColor: vault.colorTheme || '#2E3A2F',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>{percentProgress}% target</span>
                      <span>Target: {formatCurrency(targetNaira)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer info & Deposit Action */}
              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                {vault.lockedUntil ? (
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Unlocks: {new Date(vault.lockedUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">autorenew</span>
                    Auto-disburses
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedVault(vault)}
                  className="px-2.5 py-1 rounded-lg bg-surface-high hover:bg-surface-highest text-primary text-[11px] font-semibold transition-colors"
                >
                  Deposit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ad-hoc Deposit Modal */}
      <AnimatePresence>
        {selectedVault && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-5 sm:p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedVault.colorTheme || '#2E3A2F' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{selectedVault.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-base">Deposit to Sub-Vault</h3>
                    <p className="text-xs text-on-surface-variant">{selectedVault.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVault(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface-high flex items-center justify-center text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {depositSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span>✓</span> {depositSuccessMsg}
                </div>
              )}

              {depositError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span> {depositError}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-primary">
                  Deposit Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    min={1000}
                    step={5000}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono text-base font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-2">
                  {[20000, 50000, 100000, 250000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-medium border transition-colors ${
                        depositAmount === amt
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-high hover:bg-surface-highest border-outline-variant text-primary'
                      }`}
                    >
                      +{amt / 1000}k
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-on-surface-variant">
                  Funds will be journaled into <strong className="text-primary">{selectedVault.name}</strong> from your Central Financing Pool ledger.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setSelectedVault(null)}
                  disabled={isDepositing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isDepositing || depositAmount <= 0}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  {isDepositing ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Processing...
                    </>
                  ) : (
                    <>Confirm Deposit</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
