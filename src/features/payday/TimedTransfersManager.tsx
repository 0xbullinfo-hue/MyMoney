'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimedTransferRule, TimedExecutionResult } from '@/types/rules';
import { useStealth } from '@/hooks/use-stealth';

interface TimedTransfersManagerProps {
  onTransfersExecuted?: () => void;
}

export function TimedTransfersManager({ onTransfersExecuted }: TimedTransfersManagerProps) {
  const { formatCurrency } = useStealth();
  const [rules, setRules] = useState<TimedTransferRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<TimedExecutionResult[] | null>(null);

  // New Rule Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({
    name: 'Landlord Tenancy Settlement',
    sourceVaultId: 'vault_rent',
    sourceVaultName: 'Locked Rent Sinking Reserve',
    beneficiaryName: '',
    beneficiaryBankName: 'Guaranty Trust Bank',
    beneficiaryAccountNumber: '',
    amountNaira: 500000,
    targetDate: '2026-12-28',
    narration: 'Annual Residential Tenancy Transfer',
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rules/timed');
      const json = await res.json();
      if (json.success && json.data) {
        setRules(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch timed rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleStatus = async (ruleId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PAUSED' ? 'SCHEDULED' : 'PAUSED';
    try {
      const res = await fetch(`/api/rules/timed/${ruleId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRules((prev) => prev.map((r) => (r.id === ruleId ? json.data : r)));
      }
    } catch (err) {
      console.error('Failed to toggle rule status:', err);
    }
  };

  const handleEvaluateTransfers = async (forceExecuteRuleId?: string) => {
    setIsEvaluating(true);
    setEvaluationResults(null);
    try {
      const res = await fetch('/api/rules/timed/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceExecuteRuleId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEvaluationResults(json.data);
        fetchRules();
        if (onTransfersExecuted) {
          onTransfersExecuted();
        }
      }
    } catch (err) {
      console.error('Failed to evaluate timed rules:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/rules/timed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleForm.name,
          sourceVaultId: newRuleForm.sourceVaultId,
          sourceVaultName: newRuleForm.sourceVaultName,
          beneficiaryName: newRuleForm.beneficiaryName,
          beneficiaryBankName: newRuleForm.beneficiaryBankName,
          beneficiaryAccountNumber: newRuleForm.beneficiaryAccountNumber,
          amountKobo: Math.round(newRuleForm.amountNaira * 100),
          condition: {
            minVaultBalanceKobo: Math.round(newRuleForm.amountNaira * 100),
            targetDate: `${newRuleForm.targetDate}T00:00:00Z`,
          },
          narration: newRuleForm.narration,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to create timed rule:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">schedule_send</span>
              Programmable Timed Transfers
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono font-semibold">
              Locked Envelopes &bull; NIP Payout Engine
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Automates conditional payouts when vault target balance and scheduled maturation dates are reached.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEvaluateTransfers()}
            disabled={isEvaluating}
            className="px-3.5 py-1.5 rounded-xl bg-surface-high hover:bg-surface-highest text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isEvaluating ? (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">sync</span>
            )}
            Evaluate Rules
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Rule
          </button>
        </div>
      </div>

      {/* Evaluation Results Banner */}
      {evaluationResults && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant text-xs space-y-2"
        >
          <div className="font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-secondary">insights</span>
            Evaluation Report ({evaluationResults.length} rules evaluated)
          </div>
          <div className="space-y-1.5">
            {evaluationResults.map((res, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  res.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                }`}
              >
                <div>
                  <div className="font-bold">{res.ruleName}</div>
                  <div className="text-[10px]">
                    Beneficiary: {res.beneficiary} {res.reason ? `• ${res.reason}` : ''}
                  </div>
                </div>
                <div className="text-right font-mono font-bold">
                  {res.success ? (
                    <span className="text-emerald-700">Dispatched ({res.reference})</span>
                  ) : (
                    <span className="text-amber-800">Pending Condition</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const targetDateObj = new Date(rule.condition.targetDate);
          const daysLeft = Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={rule.id}
              className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant hover:border-primary/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[19px]">account_balance</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm leading-tight">{rule.name}</h3>
                    <span className="text-[10px] text-secondary font-semibold font-mono">
                      Source: {rule.sourceVaultName}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono uppercase ${
                    rule.status === 'EXECUTED'
                      ? 'bg-emerald-500/15 text-emerald-800'
                      : rule.status === 'PAUSED'
                      ? 'bg-neutral-500/15 text-neutral-700'
                      : 'bg-amber-500/15 text-amber-800'
                  }`}
                >
                  {rule.status}
                </span>
              </div>

              {/* Beneficiary Details */}
              <div className="p-2.5 rounded-xl bg-surface-low border border-outline-variant/60 text-xs space-y-0.5">
                <div className="text-[10px] text-on-surface-variant font-medium">Beneficiary Payout Node</div>
                <div className="font-bold text-primary">{rule.beneficiaryName}</div>
                <div className="text-[11px] font-mono text-on-surface-variant">
                  {rule.beneficiaryBankName} • {rule.beneficiaryAccountNumber}
                </div>
              </div>

              {/* Conditions Row */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-on-surface-variant font-medium">Payout Amount:</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {formatCurrency(rule.amountKobo / 100)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="text-on-surface-variant">Execution Condition:</span>
                  <span className="font-semibold text-secondary">
                    {daysLeft > 0 ? `${daysLeft} days until date (${targetDateObj.toLocaleDateString('en-GB')})` : 'Date reached'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rule.id, rule.status)}
                  className="px-2.5 py-1 rounded-lg bg-surface-high hover:bg-surface-highest text-primary text-[11px] font-semibold transition-colors"
                >
                  {rule.status === 'PAUSED' ? 'Resume Rule' : 'Pause Rule'}
                </button>

                {rule.status !== 'EXECUTED' && (
                  <button
                    type="button"
                    onClick={() => handleEvaluateTransfers(rule.id)}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-colors flex items-center gap-1"
                    title="Force execute now for demonstration"
                  >
                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                    Test Dispatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Rule Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">post_add</span>
                  <h3 className="font-bold text-primary text-base">New Timed Transfer Rule</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-surface-high flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-primary font-semibold mb-1">Rule Purpose / Name</label>
                  <input
                    type="text"
                    required
                    value={newRuleForm.name}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1">Source Locked Sub-Vault</label>
                  <select
                    value={newRuleForm.sourceVaultId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name = id === 'vault_rent' ? 'Locked Rent Sinking Reserve' : 'Children Tuition Reserve';
                      setNewRuleForm({ ...newRuleForm, sourceVaultId: id, sourceVaultName: name });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-semibold focus:outline-none"
                  >
                    <option value="vault_rent">Locked Rent Sinking Reserve</option>
                    <option value="vault_sch">Children Tuition Reserve</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-primary font-semibold mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Landlord Name"
                      value={newRuleForm.beneficiaryName}
                      onChange={(e) => setNewRuleForm({ ...newRuleForm, beneficiaryName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={newRuleForm.beneficiaryBankName}
                      onChange={(e) => setNewRuleForm({ ...newRuleForm, beneficiaryBankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-primary font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="0123456789"
                      value={newRuleForm.beneficiaryAccountNumber}
                      onChange={(e) => setNewRuleForm({ ...newRuleForm, beneficiaryAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary font-semibold mb-1">Amount (NGN)</label>
                    <input
                      type="number"
                      min={10000}
                      step={50000}
                      required
                      value={newRuleForm.amountNaira}
                      onChange={(e) => setNewRuleForm({ ...newRuleForm, amountNaira: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-primary font-semibold mb-1">Condition Execution Date</label>
                  <input
                    type="date"
                    required
                    value={newRuleForm.targetDate}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-primary font-mono font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90"
                  >
                    {isCreating ? 'Scheduling...' : 'Save Timed Rule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
