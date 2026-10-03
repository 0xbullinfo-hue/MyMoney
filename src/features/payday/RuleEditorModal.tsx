'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaydaySplitRule, PaydayRuleType } from '@/types/payday';
import { useStealth } from '@/hooks/use-stealth';

interface RuleEditorModalProps {
  isOpen: boolean;
  initialRules: PaydaySplitRule[];
  onClose: () => void;
  onSave: (rules: PaydaySplitRule[]) => Promise<void>;
  onToggleRulePause: (ruleId: string, isPaused: boolean) => Promise<void>;
}

const VAULT_OPTIONS = [
  { id: 'vault_emergency', name: 'Emergency Reserve MMF (14% Yield)' },
  { id: 'vault_rent', name: 'Stanbic Rent Vault MMF' },
  { id: 'card_usd_virtual', name: 'Bridgecard Virtual Visa (USD)' },
  { id: 'bill_utilities', name: 'VTPass Ikeja Electric & 5G Data' },
  { id: 'vault_tuition', name: 'Tuition High-Yield Vault' },
  { id: 'vault_wealth', name: 'Anchor BaaS FGN Treasury Note' },
  { id: 'vault_groceries', name: 'Household Living & Provisions' },
];

export function RuleEditorModal({
  isOpen,
  initialRules,
  onClose,
  onSave,
  onToggleRulePause,
}: RuleEditorModalProps) {
  const { formatCurrency } = useStealth();
  const [rules, setRules] = useState<PaydaySplitRule[]>(initialRules);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    setRules(initialRules);
    setErrorMessage(null);
  }, [initialRules, isOpen]);

  // Compute total percentage of active rules
  const activePercentageRules = rules.filter((r) => r.type === 'PERCENTAGE' && !r.isPaused);
  const totalPercentage = activePercentageRules.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  const isOverAllocated = totalPercentage > 100;

  const handleRuleChange = (index: number, updates: Partial<PaydaySplitRule>) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...updates };
    setRules(updated);
    setErrorMessage(null);
  };

  const handleAddRule = () => {
    const newRule: PaydaySplitRule = {
      id: `rule_custom_${Date.now()}`,
      name: 'New Sub-Vault Split',
      targetVaultId: 'vault_emergency',
      targetVaultName: 'Emergency Reserve MMF (14% Yield)',
      type: 'PERCENTAGE',
      value: 10,
      priority: rules.length + 1,
      autoCardTopup: false,
      autoBillPay: false,
      isPaused: false,
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (isOverAllocated) {
      setErrorMessage(`Total percentage allocation (${totalPercentage}%) exceeds 100% ceiling. Please adjust rules before saving.`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(rules);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save rules');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-3xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Payday Split Rules & Allocations
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Configure destination vaults, virtual card top-ups, and utility debits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Allocation Ceiling Meter */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Active Percentage Allocation
            </span>
            <span
              className={`font-mono font-bold ${
                isOverAllocated ? 'text-red-600' : totalPercentage === 100 ? 'text-[#6B7F5B]' : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {totalPercentage}% / 100% {totalPercentage < 100 && `(${100 - totalPercentage}% residual sweep)`}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverAllocated ? 'bg-red-500' : 'bg-[#6B7F5B]'
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>

          {isOverAllocated && (
            <p className="text-xs text-red-600 font-medium">
              ⚠️ Warning: Total percentage exceeds 100%. Please reduce percentage values to allow saving.
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {rules.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className={`p-4 rounded-2xl border transition ${
                rule.isPaused
                  ? 'bg-stone-50/50 dark:bg-stone-900/50 border-dashed border-stone-300 dark:border-stone-800 opacity-60'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-xs'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Left: Name and Target Vault */}
                <div className="space-y-1 w-full md:w-5/12">
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => handleRuleChange(idx, { name: e.target.value })}
                    className="w-full text-sm font-semibold text-stone-900 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#2E3A2F] outline-hidden px-1 py-0.5"
                    placeholder="Rule Name"
                  />
                  <select
                    value={rule.targetVaultId}
                    onChange={(e) => {
                      const selected = VAULT_OPTIONS.find((v) => v.id === e.target.value);
                      handleRuleChange(idx, {
                        targetVaultId: e.target.value,
                        targetVaultName: selected?.name || rule.targetVaultName,
                      });
                    }}
                    className="w-full text-xs text-stone-500 dark:text-stone-400 bg-transparent border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 outline-hidden"
                  >
                    {VAULT_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id} className="dark:bg-stone-900">
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Center: Split Type & Value */}
                <div className="flex items-center gap-2 w-full md:w-4/12">
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      handleRuleChange(idx, {
                        type: e.target.value as PaydayRuleType,
                        value: e.target.value === 'PERCENTAGE' ? 10 : 50000,
                      })
                    }
                    className="text-xs border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 bg-stone-50 dark:bg-stone-700 outline-hidden font-medium"
                  >
                    <option value="PERCENTAGE">% Inflow</option>
                    <option value="FIXED_AMOUNT">Fixed ₦</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={rule.type === 'PERCENTAGE' ? 100 : 10000000}
                      value={rule.value}
                      onChange={(e) => handleRuleChange(idx, { value: Number(e.target.value) || 0 })}
                      className="w-full text-sm font-mono font-bold border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-hidden focus:border-[#2E3A2F]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono">
                      {rule.type === 'PERCENTAGE' ? '%' : '₦'}
                    </span>
                  </div>
                </div>

                {/* Right: Granular Pause Toggle & Delete */}
                <div className="flex items-center justify-end gap-2 w-full md:w-3/12">
                  <button
                    type="button"
                    onClick={() => {
                      const newPaused = !rule.isPaused;
                      handleRuleChange(idx, { isPaused: newPaused });
                      if (rule.id && !rule.id.startsWith('rule_custom_')) {
                        onToggleRulePause(rule.id, newPaused);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      rule.isPaused
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 border border-amber-300'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                    title={rule.isPaused ? 'Resume this rule' : 'Pause only this rule'}
                  >
                    {rule.isPaused ? 'Paused' : 'Active'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(idx)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                    title="Delete rule"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Feature Tags (Bridgecard / VTPass) */}
              <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700/50 flex items-center gap-4 text-[11px] text-stone-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.autoCardTopup}
                    onChange={(e) => handleRuleChange(idx, { autoCardTopup: e.target.checked })}
                    className="rounded text-[#2E3A2F] focus:ring-0"
                  />
                  <span>Bridgecard Auto Top-up</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.autoBillPay}
                    onChange={(e) => handleRuleChange(idx, { autoBillPay: e.target.checked })}
                    className="rounded text-[#2E3A2F] focus:ring-0"
                  />
                  <span>VTPass Utility Debit</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add Rule Button */}
        <button
          type="button"
          onClick={handleAddRule}
          className="w-full py-2.5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:border-[#6B7F5B] hover:text-[#2E3A2F] dark:hover:text-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          Add New Sub-Vault Split
        </button>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isOverAllocated}
            className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm cursor-pointer ${
              isOverAllocated
                ? 'bg-stone-400 cursor-not-allowed'
                : 'bg-[#2E3A2F] hover:bg-[#3C4B3D] active:scale-95'
            }`}
          >
            {isSaving ? 'Saving Changes...' : 'Save & Arm Engine'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
