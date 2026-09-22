'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { bankInstitutions } from '@/lib/mock-data/banks';
import type { BankNode, NodeStatus } from '@/types';

const statusColors: Record<NodeStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-secondary/15', text: 'text-secondary', label: 'Active' },
  syncing: { bg: 'bg-secondary-fixed/20', text: 'text-secondary-fixed', label: 'Syncing' },
  degraded: { bg: 'bg-tertiary-container', text: 'text-accent', label: 'Degraded' },
  disconnected: { bg: 'bg-accent/15', text: 'text-accent', label: 'Disconnected' },
  rate_limited: { bg: 'bg-tertiary-container', text: 'text-accent', label: 'Rate Limited' },
};

const initialNodes: BankNode[] = [
  { id: 'n1', userId: 'u1', institutionId: 'gtb', institutionName: 'GTBank PLC', category: 'Commercial', accountNumberMasked: '****1234', balance: 14250000, currency: 'NGN', status: 'active', latencyMs: 12, lastWebhookSync: new Date(Date.now() - 120000).toISOString(), monthlyFee: 0 },
  { id: 'n2', userId: 'u1', institutionId: 'stanbic', institutionName: 'Stanbic IBTC', category: 'Investment', accountNumberMasked: '****5678', balance: 8400000, currency: 'NGN', status: 'active', latencyMs: 14, lastWebhookSync: new Date(Date.now() - 240000).toISOString(), monthlyFee: 0 },
  { id: 'n3', userId: 'u1', institutionId: 'kuda', institutionName: 'Kuda Bank MFB', category: 'Digital MFB', accountNumberMasked: '****9012', balance: 2200000, currency: 'NGN', status: 'active', latencyMs: 8, lastWebhookSync: new Date(Date.now() - 60000).toISOString(), monthlyFee: 0 },
  { id: 'n4', userId: 'u1', institutionId: 'zenith', institutionName: 'Zenith Bank PLC', category: 'Commercial', accountNumberMasked: '****3456', balance: 5600000, currency: 'NGN', status: 'degraded', latencyMs: 340, lastWebhookSync: new Date(Date.now() - 900000).toISOString(), monthlyFee: 0 },
  { id: 'n5', userId: 'u1', institutionId: 'carbon', institutionName: 'Carbon Credit', category: 'Credit Line', accountNumberMasked: '****7890', balance: 1850000, currency: 'NGN', status: 'active', latencyMs: 22, lastWebhookSync: new Date(Date.now() - 300000).toISOString(), monthlyFee: 1500 },
];

export default function MeshPage() {
  const { formatCurrency } = useStealth();
  const [nodes, setNodes] = useState<BankNode[]>(initialNodes);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const syncNode = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => n.id === id ? { ...n, status: 'active' as NodeStatus, lastWebhookSync: new Date().toISOString(), latencyMs: Math.floor(Math.random() * 20 + 5) } : n)
      );
      setSyncingId(null);
    }, 1500);
  };

  const disconnectNode = (id: string) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, status: 'disconnected' as NodeStatus } : n));
  };

  const addNode = (instId: string) => {
    const inst = bankInstitutions.find((b) => b.id === instId);
    if (!inst || nodes.find((n) => n.institutionId === instId)) return;
    const newNode: BankNode = {
      id: `n${Date.now()}`, userId: 'u1', institutionId: inst.id, institutionName: inst.name,
      category: inst.category, accountNumberMasked: `****${Math.floor(1000 + Math.random() * 9000)}`,
      balance: inst.defaultBalance, currency: 'NGN', status: 'syncing', latencyMs: inst.latencyMs,
      lastWebhookSync: new Date().toISOString(), monthlyFee: 0,
    };
    setNodes((prev) => [...prev, newNode]);
    setShowAddModal(false);
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => n.id === newNode.id ? { ...n, status: 'active' as NodeStatus } : n));
    }, 2000);
  };

  const timeSince = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl text-primary">My Money</h1>
          <p className="text-sm text-on-surface-variant">Manage connected banking facilities and monitor real-time balance telemetry.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all shadow-md flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Bank
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Banks', value: nodes.length, color: 'text-primary' },
          { label: 'Active', value: nodes.filter((n) => n.status === 'active').length, color: 'text-secondary' },
          { label: 'Degraded', value: nodes.filter((n) => n.status === 'degraded' || n.status === 'rate_limited').length, color: 'text-accent' },
          { label: 'Total Balance', value: formatCurrency(nodes.reduce((s, n) => s + n.balance, 0)), color: 'text-primary font-bold' },
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
              className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm hover:shadow-enclave transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-primary">{node.institutionName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-on-surface-variant">{node.category}</span>
                    <span className="text-xs font-mono text-on-surface-variant">{node.accountNumberMasked}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} font-mono text-[10px] font-bold border border-outline-variant`}>
                  {sc.label}
                </span>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant">Available Balance</div>
                <div className="text-2xl font-extrabold font-mono text-primary">{formatCurrency(node.balance)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-on-surface-variant block">Latency</span>
                  <span className="font-semibold text-primary">{node.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Last Sync</span>
                  <span className="font-semibold text-primary">{timeSince(node.lastWebhookSync)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-outline-variant">
                <button
                  onClick={() => syncNode(node.id)}
                  disabled={syncingId === node.id}
                  className="flex-1 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-outline-variant text-xs font-semibold text-primary transition-all flex justify-center items-center gap-1.5 disabled:opacity-50"
                >
                  {syncingId === node.id ? <><span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Syncing</> : 'Re-Index'}
                </button>
                <button
                  onClick={() => disconnectNode(node.id)}
                  className="py-2 px-3 rounded-xl border border-accent/40 text-accent text-xs font-semibold hover:bg-accent/10 transition-all"
                  title="Disconnect Bank"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Bank Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-primary">Add Bank</h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bankInstitutions.filter((b) => !nodes.find((n) => n.institutionId === b.id)).map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => addNode(bank.id)}
                  className="p-4 rounded-xl border border-outline-variant bg-surface-low hover:border-secondary text-left transition-all"
                >
                  <div className="font-bold text-sm text-primary">{bank.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{bank.category}</div>
                </button>
              ))}
              {bankInstitutions.filter((b) => !nodes.find((n) => n.institutionId === b.id)).length === 0 && (
                <div className="col-span-2 text-center py-8 text-sm text-on-surface-variant">All available banks are connected.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
