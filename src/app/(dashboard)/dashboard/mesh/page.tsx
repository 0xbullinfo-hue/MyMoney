'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { bankInstitutions } from '@/lib/mock-data/banks';
import type { BankNode, NodeStatus, BankInstitution } from '@/types';

const statusColors: Record<NodeStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-700', label: 'Active' },
  syncing: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-700', label: 'Syncing' },
  degraded: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-700', label: 'Degraded' },
  rate_limited: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-700', label: 'Rate-Limited' },
  disconnected: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-700', label: 'Disconnected' },
};

const initialNodes: BankNode[] = [
  { id: 'n1', userId: 'u1', institutionId: 'gtb', institutionName: 'GTBank PLC', category: 'Commercial', accountNumberMasked: '****0491', balance: 14250000, currency: 'NGN', status: 'active', latencyMs: 12, lastWebhookSync: new Date().toISOString(), monthlyFee: 0 },
  { id: 'n2', userId: 'u1', institutionId: 'stanbic', institutionName: 'Stanbic IBTC', category: 'Investment', accountNumberMasked: '****5678', balance: 8400000, currency: 'NGN', status: 'active', latencyMs: 14, lastWebhookSync: new Date(Date.now() - 120000).toISOString(), monthlyFee: 0 },
  { id: 'n3', userId: 'u1', institutionId: 'kuda', institutionName: 'Kuda Bank MFB', category: 'Digital MFB', accountNumberMasked: '****9012', balance: 2200000, currency: 'NGN', status: 'active', latencyMs: 8, lastWebhookSync: new Date(Date.now() - 60000).toISOString(), monthlyFee: 0 },
  { id: 'n4', userId: 'u1', institutionId: 'zenith', institutionName: 'Zenith Bank PLC', category: 'Commercial', accountNumberMasked: '****3456', balance: 5600000, currency: 'NGN', status: 'active', latencyMs: 24, lastWebhookSync: new Date(Date.now() - 900000).toISOString(), monthlyFee: 0 },
  { id: 'n5', userId: 'u1', institutionId: 'access', institutionName: 'Access Bank PLC', category: 'Commercial', accountNumberMasked: '****7890', balance: 1150000, currency: 'NGN', status: 'active', latencyMs: 19, lastWebhookSync: new Date(Date.now() - 300000).toISOString(), monthlyFee: 0 },
];

export default function MeshPage() {
  const { formatCurrency } = useStealth();
  const [nodes, setNodes] = useState<BankNode[]>(initialNodes);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Add Bank Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBankForDetails, setSelectedBankForDetails] = useState<BankInstitution | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [disconnectCandidate, setDisconnectCandidate] = useState<BankNode | null>(null);

  // Account details form
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('Adewale Bello Okonkwo');
  const [accountType, setAccountType] = useState('Savings Account');
  const [bvnMasked, setBvnMasked] = useState('2223 •••• 4910');
  const [syncFrequency, setSyncFrequency] = useState('Real-time Webhook (Instant)');
  const [initialDeposit, setInitialDeposit] = useState(1500000);
  const [formError, setFormError] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  const syncNode = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'active' as NodeStatus, lastWebhookSync: new Date().toISOString(), latencyMs: Math.floor(Math.random() * 20 + 5) } : n))
      );
      setSyncingId(null);
    }, 1400);
  };

  const confirmDisconnect = () => {
    if (disconnectCandidate) {
      setNodes((prev) => prev.map((n) => (n.id === disconnectCandidate.id ? { ...n, status: 'disconnected' as NodeStatus } : n)));
      setDisconnectCandidate(null);
    }
  };

  const timeSince = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  // Open Step 2: Account Details Prompt
  const handleSelectBank = (bank: BankInstitution) => {
    setSelectedBankForDetails(bank);
    setAccountNumber('');
    setFormError('');
  };

  // Finalize Account Submission
  const handleFinalizeAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankForDetails) return;
    if (accountNumber.replace(/\D/g, '').length !== 10) {
      setFormError('Please enter a valid 10-digit NUBAN account number.');
      return;
    }

    setIsVerifyingAccount(true);

    setTimeout(() => {
      const newNode: BankNode = {
        id: `n${Date.now()}`,
        userId: 'u1',
        institutionId: selectedBankForDetails.id,
        institutionName: selectedBankForDetails.name,
        category: selectedBankForDetails.category,
        accountNumberMasked: `****${accountNumber.slice(-4)}`,
        balance: initialDeposit || selectedBankForDetails.defaultBalance,
        currency: 'NGN',
        status: 'active',
        latencyMs: selectedBankForDetails.latencyMs,
        lastWebhookSync: new Date().toISOString(),
        monthlyFee: 0,
      };

      setNodes((prev) => [...prev, newNode]);
      setIsVerifyingAccount(false);
      setSelectedBankForDetails(null);
      setShowAddModal(false);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Page Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">My Money</h1>
          <p className="text-sm text-on-surface-variant">View all your linked bank accounts, cards, and live balances in one place.</p>
        </div>
        <button
          onClick={() => { setBankSearch(''); setSelectedBankForDetails(null); setShowAddModal(true); }}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all shadow-md flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Bank (33 Available)
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Banks', value: nodes.filter((n) => n.status !== 'disconnected').length, color: 'text-primary' },
          { label: 'Active', value: nodes.filter((n) => n.status === 'active').length, color: 'text-secondary' },
          { label: 'Degraded', value: nodes.filter((n) => n.status === 'degraded' || n.status === 'rate_limited').length, color: 'text-accent' },
          { label: 'Total Balance', value: formatCurrency(nodes.filter((n) => n.status !== 'disconnected').reduce((s, n) => s + n.balance, 0)), color: 'text-primary font-bold' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant text-center shadow-sm">
            <div className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`text-lg sm:text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Bank Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {nodes.map((node) => {
          const sc = statusColors[node.status];
          return (
            <div
              key={node.id}
              className="p-5 sm:p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {node.institutionName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm sm:text-base leading-tight">{node.institutionName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">{node.category}</span>
                      <span className="text-xs font-mono text-on-surface-variant font-semibold">{node.accountNumberMasked}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} font-mono text-[10px] font-bold border border-outline-variant`}>
                  {sc.label}
                </span>
              </div>

              <div>
                <div className="text-xs text-on-surface-variant font-medium">Available Balance</div>
                <div className="text-2xl font-extrabold font-mono text-primary mt-0.5">{formatCurrency(node.balance)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Latency</span>
                  <span className="font-semibold text-primary">{node.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Last Sync</span>
                  <span className="font-semibold text-primary">{timeSince(node.lastWebhookSync)}</span>
                </div>
              </div>

              {/* Action Buttons: Refresh MyMoney with sync symbol */}
              <div className="flex gap-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => syncNode(node.id)}
                  disabled={syncingId === node.id}
                  className="flex-1 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-outline-variant text-xs font-bold text-primary transition-all flex justify-center items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <span className={`material-symbols-outlined text-[16px] text-secondary ${syncingId === node.id ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{syncingId === node.id ? 'Refreshing...' : 'Refresh MyMoney'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisconnectCandidate(node)}
                  className="py-2 px-3 rounded-xl border border-accent/40 text-accent text-xs font-semibold hover:bg-accent/10 transition-all flex items-center justify-center"
                  title="Disconnect Bank"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Disconnect Warning Confirmation Modal ═══ */}
      {disconnectCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-primary">Disconnect {disconnectCandidate.institutionName}?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Are you sure you want to disconnect this account? Live balance tracking will stop and any Payday bills assigned to this bank will be paused.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisconnectCandidate(null)}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                No, Keep Connected
              </button>
              <button
                type="button"
                onClick={confirmDisconnect}
                className="w-1/2 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Add Bank Modal (2-Step Flow: Select Bank -> Prompt Account Details) ═══ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline font-bold text-xl text-primary">
                    {selectedBankForDetails ? 'Add Account Details' : 'Select Bank to Connect'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selectedBankForDetails
                      ? 'Enter your account information to enable read-only open banking data sync.'
                      : 'Choose from 33 NDIC-insured banks in Nigeria.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setSelectedBankForDetails(null); }}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* ═══ STEP 1: Select Bank from 33 NDIC List ═══ */}
              {!selectedBankForDetails ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-low border border-outline-variant">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
                    <input
                      type="text"
                      placeholder="Search GTBank, Zenith, Access, Kuda, Stanbic..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="bg-transparent text-xs text-primary focus:outline-none w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {bankInstitutions
                      .filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.category.toLowerCase().includes(bankSearch.toLowerCase()))
                      .map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => handleSelectBank(bank)}
                          className="p-3 rounded-xl border border-outline-variant bg-surface-low hover:border-primary hover:bg-surface-high text-left transition-all group"
                        >
                          <div className="font-bold text-xs text-primary group-hover:text-secondary transition-colors leading-tight">
                            {bank.name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant mt-1">{bank.category}</div>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                /* ═══ STEP 2: Prompt Detailed Account Information ═══ */
                <form onSubmit={handleFinalizeAddAccount} className="space-y-4">
                  {/* Selected Bank Banner */}
                  <div className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {selectedBankForDetails.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-primary">{selectedBankForDetails.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{selectedBankForDetails.category}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBankForDetails(null)}
                      className="text-xs text-secondary font-semibold hover:underline"
                    >
                      Change Bank
                    </button>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-primary font-semibold mb-1">Account Number (10-Digit NUBAN)</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="0123456789"
                        value={accountNumber}
                        onChange={(e) => {
                          setAccountNumber(e.target.value.replace(/\D/g, ''));
                          setFormError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-primary font-semibold mb-1">Account Holder Full Name</label>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-primary font-semibold mb-1">Account Type</label>
                        <select
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none"
                        >
                          <option value="Savings Account">Savings Account</option>
                          <option value="Current Account">Current Account</option>
                          <option value="Fixed Deposit">Fixed Deposit</option>
                          <option value="Corporate Account">Corporate Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-primary font-semibold mb-1">Linked BVN (Verification)</label>
                        <input
                          type="text"
                          readOnly
                          value={bvnMasked}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-high text-on-surface-variant font-mono text-xs cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-primary font-semibold mb-1">Initial Tracked Balance (₦)</label>
                      <input
                        type="number"
                        min="0"
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Architectural Permissions Consent */}
                    <div className="p-3 rounded-xl bg-surface-low border border-outline-variant space-y-1.5">
                      <div className="font-semibold text-primary text-[11px] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
                        <span>Read-Only Architecture Permissions</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-secondary font-bold">✓</span> Read available balance and ledger transactions
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-secondary font-bold">✓</span> Listen for salary inflow webhooks to trigger Payday routing
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-secondary font-bold">✓</span> Bank-grade read-only tokenization (Zero withdrawal permissions)
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="text-accent text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>{formError}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBankForDetails(null)}
                      className="w-1/3 py-3 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingAccount}
                      className="w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isVerifyingAccount ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting &amp; Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">link</span>
                          <span>Connect &amp; Synchronize</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
