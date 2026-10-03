'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaydayConfig, PaydayStatus } from '@/types/payday';
import { useStealth } from '@/hooks/use-stealth';

interface PaydayControlBarProps {
  config: PaydayConfig;
  onStatusChange: (status: PaydayStatus, reason?: string) => Promise<void>;
  onSkipNextToggle: (skip: boolean) => Promise<void>;
  onOpenRuleEditor: () => void;
  onSimulateInflow: () => Promise<void>;
}

export function PaydayControlBar({
  config,
  onStatusChange,
  onSkipNextToggle,
  onOpenRuleEditor,
  onSimulateInflow,
}: PaydayControlBarProps) {
  const { formatCurrency } = useStealth();
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Active Safety Window State (30-second delay buffer)
  const [activeJob, setActiveJob] = useState<{
    id: string;
    inflowAmount: number;
    remainingSeconds: number;
    narration: string;
  } | null>(null);
  const [isAborting, setIsAborting] = useState(false);
  const [abortSuccessNotice, setAbortSuccessNotice] = useState<string | null>(null);

  // Poll for safety window status or simulated inflow countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkActiveJobs = async () => {
      try {
        const res = await fetch('/api/payday/simulate');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            const current = json.data[0];
            setActiveJob({
              id: current.id,
              inflowAmount: current.inflowAmount,
              remainingSeconds: current.remainingSeconds,
              narration: current.narration,
            });
          } else {
            setActiveJob(null);
          }
        }
      } catch (e) {
        // silent polling catch
      }
    };

    checkActiveJobs();
    interval = setInterval(checkActiveJobs, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Emergency Kill Switch
  const handleKillSwitch = async () => {
    if (!activeJob) return;
    setIsAborting(true);
    try {
      const res = await fetch('/api/payday/cancel-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: activeJob.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(null);
        setAbortSuccessNotice('Emergency Kill Switch activated: Queued vendor payouts permanently cancelled.');
        setTimeout(() => setAbortSuccessNotice(null), 6000);
      }
    } catch (e) {
      console.error('Failed to abort job:', e);
    } finally {
      setIsAborting(false);
    }
  };

  const handlePauseConfirm = async () => {
    setIsUpdating(true);
    try {
      await onStatusChange('PAUSED', 'Paused by user via Master Control Bar');
      setShowPauseConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResume = async () => {
    setIsUpdating(true);
    try {
      await onStatusChange('ACTIVE');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsUpdating(true);
    try {
      await onStatusChange('INACTIVE', 'Deactivated automation by user');
      setShowDeactivateConfirm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (config.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6B7F5B]/15 text-[#2E3A2F] border border-[#6B7F5B]/30">
            <span className="w-2 h-2 rounded-full bg-[#6B7F5B] animate-pulse" />
            AUTOMATION ACTIVE
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D9C9B2]/40 text-[#8B6420] border border-[#D9C9B2]">
            <span className="w-2 h-2 rounded-full bg-[#C96F4F]" />
            ENGINE PAUSED
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C96F4F]/15 text-[#C96F4F] border border-[#C96F4F]/30">
            <span className="w-2 h-2 rounded-full bg-[#C96F4F]" />
            AUTOMATION STOPPED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 30-Second Emergency Safety Window Alert Banner */}
      <AnimatePresence>
        {activeJob && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-lg animate-pulse">
                ⏳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 text-sm">
                    Inflow Detected: {formatCurrency(activeJob.inflowAmount)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500 text-white font-bold animate-pulse">
                    SAFETY WINDOW: {activeJob.remainingSeconds}s
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Holding vendor payout dispatch. Click Kill Switch to abort disbursements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleKillSwitch}
                disabled={isAborting}
                className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🛑</span>
                {isAborting ? 'Aborting...' : 'KILL SWITCH (ABORT DISBURSEMENTS)'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abort Success Alert */}
      <AnimatePresence>
        {abortSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-medium flex items-center gap-2"
          >
            <span>✓</span>
            {abortSuccessNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Control Card */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left: Status & Indicators */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            {getStatusBadge()}
            
            {/* Skip Next Status Indicator */}
            {config.skipNextInflow && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C96F4F]/15 text-[#C96F4F] border border-[#C96F4F]/30 animate-pulse">
                <span>⏭</span>
                SKIP NEXT CYCLE ACTIVE
              </span>
            )}

            <span className="text-xs text-stone-500 font-mono">
              Expected: {formatCurrency(config.expectedAmount || 1250000)}
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            {config.status === 'ACTIVE' &&
              'Autonomous waterfall active. Inflows trigger split allocations across your configured sub-vaults.'}
            {config.status === 'PAUSED' &&
              `Automation paused on ${config.pausedAt ? new Date(config.pausedAt).toLocaleDateString() : 'recent date'}. Funds will remain untouched in your primary bank.`}
            {config.status === 'INACTIVE' &&
              'Automations permanently deactivated. Vaults remain accessible for manual disbursements.'}
          </p>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          {/* Master Pause / Resume Switch */}
          {config.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => setShowPauseConfirm(true)}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-amber-500/40 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⏸</span>
              Pause Automation
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResume}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#2E3A2F] text-white hover:bg-[#3C4B3D] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>▶</span>
              Resume Automation
            </button>
          )}

          {/* Skip Next Payday Button */}
          <button
            type="button"
            onClick={() => onSkipNextToggle(!config.skipNextInflow)}
            disabled={isUpdating || config.status !== 'ACTIVE'}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
              config.skipNextInflow
                ? 'bg-[#C96F4F] text-white border-[#C96F4F] shadow-sm'
                : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Bypass only the next incoming payroll event without modifying rules"
          >
            <span>⏭</span>
            {config.skipNextInflow ? 'Cancel Skip Next' : 'Skip Next Payday'}
          </button>

          {/* Rule Editor Trigger */}
          <button
            type="button"
            onClick={onOpenRuleEditor}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚙️</span>
            Edit Rules
          </button>

          {/* Simulate Inflow Test Trigger */}
          <button
            type="button"
            onClick={onSimulateInflow}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-[#6B7F5B]/15 text-[#2E3A2F] dark:text-stone-200 border border-[#6B7F5B]/30 hover:bg-[#6B7F5B]/25 transition flex items-center gap-1 cursor-pointer"
            title="Dispatch a test salary credit to test the Guard and 30s Safety Window"
          >
            <span>🧪</span>
            Test Inflow
          </button>

          {/* Emergency Stop / Deactivate */}
          {config.status !== 'INACTIVE' && (
            <button
              type="button"
              onClick={() => setShowDeactivateConfirm(true)}
              className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
              title="Deactivate automation permanently"
            >
              <span>✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Master Pause */}
      <AnimatePresence>
        {showPauseConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center text-2xl font-bold">
                ⏸
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Pause Automated Payday Splits?
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  Incoming salary or credit webhooks will be logged in the audit vault as{' '}
                  <span className="font-mono text-amber-700">BYPASSED_PAUSED</span>. Funds will remain 100% intact
                  in your primary bank account. You can resume at any time.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPauseConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePauseConfirm}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition shadow-sm"
                >
                  Confirm Pause
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal: Deactivate / Stop */}
      <AnimatePresence>
        {showDeactivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-700 flex items-center justify-center text-2xl font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Permanently Halt Automations?
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                  This sets status to <span className="font-mono text-red-600">INACTIVE</span> and halts all scheduled
                  splits and background triggers. Your vaults and bills will revert to manual execution.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
                >
                  Deactivate Automation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
