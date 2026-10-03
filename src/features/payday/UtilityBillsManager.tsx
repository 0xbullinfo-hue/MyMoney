'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { 
  CustomerVerification, 
  UtilityRechargeReceipt 
} from '@/types/bills';
import { SUPPORTED_UTILITIES } from '@/services/bills/vtpass.service';
import { useStealth } from '@/hooks/use-stealth';

interface UtilityBillsManagerProps {
  onRechargeComplete?: () => void;
}

export function UtilityBillsManager({ onRechargeComplete }: UtilityBillsManagerProps) {
  const { formatCurrency } = useStealth();
  
  // Verification State
  const [selectedServiceId, setSelectedServiceId] = useState('ikeja-electric');
  const [customerIdInput, setCustomerIdInput] = useState('04291840192');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CustomerVerification | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Recharge State
  const [rechargeAmount, setRechargeAmount] = useState<number>(20000);
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<UtilityRechargeReceipt | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<UtilityRechargeReceipt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const selectedService = SUPPORTED_UTILITIES.find((s) => s.id === selectedServiceId) || SUPPORTED_UTILITIES[0];

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customerIdInput.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/bills/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          customerId: customerIdInput,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Verification failed');
      }
      setVerificationResult(json.data);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Failed to verify account');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    if (!customerIdInput || rechargeAmount <= 0) return;
    setIsRecharging(true);
    setRechargeError(null);
    setRechargeSuccess(null);

    try {
      const res = await fetch('/api/bills/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          customerId: customerIdInput,
          amount: rechargeAmount,
          sourceVaultId: 'vault_util',
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Recharge failed');
      }
      setRechargeSuccess(json.data);
      if (onRechargeComplete) {
        onRechargeComplete();
      }
    } catch (err: unknown) {
      setRechargeError(err instanceof Error ? err.message : 'Recharge execution failed');
    } finally {
      setIsRecharging(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const openHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/bills/history');
      const json = await res.json();
      if (json.success) {
        setHistoryList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">bolt</span>
              VTPass Utility Auto-Settlement
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono font-semibold">
              Pre-validation &amp; Auto-Recharge
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pre-validates meters &amp; smartcards, then automatically settles power and broadband from your <strong>Utility Vault</strong> on Payday.
          </p>
        </div>

        <button
          type="button"
          onClick={openHistory}
          className="px-3.5 py-1.5 rounded-xl bg-surface-high hover:bg-surface-highest text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          Recharge History
        </button>
      </div>

      {/* Verification & Instant Purchase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Account Verification (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5 p-4 rounded-2xl bg-surface-low border border-outline-variant">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              Meter / Account Validation
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">Biller API Handshake</span>
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-primary mb-1">
                  Service Provider
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setVerificationResult(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-primary text-xs font-semibold focus:outline-none"
                >
                  {SUPPORTED_UTILITIES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-primary mb-1">
                  {selectedService.identifierLabel}
                </label>
                <input
                  type="text"
                  value={customerIdInput}
                  onChange={(e) => {
                    setCustomerIdInput(e.target.value);
                    setVerificationResult(null);
                  }}
                  placeholder={selectedService.identifierPlaceholder}
                  className="w-full px-3 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-primary font-mono text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !customerIdInput.trim()}
              className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                  Verifying Account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">fact_check</span>
                  Verify Account Details
                </>
              )}
            </button>
          </form>

          {/* Validation Feedback */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                verificationResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                  : 'bg-red-500/10 border-red-500/30 text-red-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    {verificationResult.isValid ? 'check_circle' : 'error'}
                  </span>
                  {verificationResult.isValid ? 'Account Verified' : 'Validation Failed'}
                </span>
                <span className="text-[10px] font-mono">{verificationResult.customerId}</span>
              </div>
              {verificationResult.customerName && (
                <div className="font-semibold text-primary">
                  Customer: {verificationResult.customerName}
                </div>
              )}
              {verificationResult.customerAddress && (
                <div className="text-[10px] text-on-surface-variant">
                  Address: {verificationResult.customerAddress}
                </div>
              )}
            </motion.div>
          )}

          {verifyError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs font-semibold">
              {verifyError}
            </div>
          )}
        </div>

        {/* Right: Instant Utility Recharge (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5 p-4 rounded-2xl bg-surface-low border border-outline-variant flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">flash_on</span>
              Instant Auto-Recharge
            </span>
            <span className="text-[10px] text-secondary font-semibold">Debits Utility Vault</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-primary mb-1">
                Recharge Amount (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">
                  ₦
                </span>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-primary font-mono text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 mt-1.5">
                {[10000, 20000, 35000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-medium border ${
                      rechargeAmount === amt
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-lowest hover:bg-surface-high border-outline-variant text-primary'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={isRecharging || rechargeAmount <= 0}
              className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-fixed text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {isRecharging ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Executing Recharge...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">electric_bolt</span>
                  Recharge Now ({formatCurrency(rechargeAmount)})
                </>
              )}
            </button>
          </div>

          {/* Success Result with Token Box */}
          {rechargeSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 mt-2"
            >
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Recharge Success • Ref: {rechargeSuccess.reference}
                </span>
                <span className="font-mono text-emerald-700">{rechargeSuccess.units || 'Paid'}</span>
              </div>

              {rechargeSuccess.token && (
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
                      Electricity Token (20-Digit Prepaid)
                    </div>
                    <div className="font-mono font-extrabold text-sm text-primary tracking-wider">
                      {rechargeSuccess.token}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(rechargeSuccess.token!)}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                    title="Copy Token"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedToken === rechargeSuccess.token ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {rechargeError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs font-semibold">
              {rechargeError}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
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
                  <h3 className="font-bold text-primary text-base">Utility Recharge History</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-8 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Loading utility logs...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  No recharge history recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-surface-low border border-outline-variant text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-primary">{item.serviceName}</div>
                          <div className="text-[10px] text-on-surface-variant">
                            Account: {item.customerId} • {new Date(item.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-primary">{formatCurrency(item.amount)}</div>
                          <div className="text-[10px] font-semibold text-emerald-700">{item.status}</div>
                        </div>
                      </div>

                      {item.token && (
                        <div className="p-2 rounded-xl bg-surface-lowest border border-outline-variant font-mono text-[11px] font-bold text-secondary flex items-center justify-between select-all">
                          <span>Token: {item.token}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.token!)}
                            className="text-primary hover:opacity-70 p-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedToken === item.token ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
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
