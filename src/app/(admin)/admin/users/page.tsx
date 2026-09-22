'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockUsers } from '@/lib/mock-data/admin-metrics';
import type { User, SubscriptionTier } from '@/types';

const tierBadge: Record<SubscriptionTier, { bg: string; text: string }> = {
  free: { bg: 'bg-white/10', text: 'text-white/60' },
  premium: { bg: 'bg-secondary-fixed/20', text: 'text-secondary-fixed' },
  premium_plus: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const changeTier = (userId: string, tier: SubscriptionTier) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, tier } : u)));
    if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, tier });
  };

  const toggleSuspend = (userId: string) => {
    setUsers(users.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, stealthModeEnabled: !u.stealthModeEnabled };
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-secondary-fixed">Account & Node Overrides</h1>
          <p className="text-xs text-white/60 font-mono">{users.length} registered sovereign enclaves</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined text-[18px] text-white/40 absolute left-3 top-1/2 -translate-y-1/2">search</span>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-secondary-fixed transition-all" />
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-2xl admin-card">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">Tier</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const badge = tierBadge[user.tier];
              return (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-white">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-white/60">{user.email}</td>
                  <td className="px-4 py-3.5">
                    <select value={user.tier} onChange={(e) => changeTier(user.id, e.target.value as SubscriptionTier)}
                      className={`px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text} text-[10px] font-bold uppercase bg-transparent border border-white/10 focus:outline-none cursor-pointer`}>
                      <option value="free" className="bg-primary-dark">Free</option>
                      <option value="premium" className="bg-primary-dark">Premium</option>
                      <option value="premium_plus" className="bg-primary-dark">Premium+</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-white/40">
                    {new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedUser(user)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 text-white/60 text-[10px] font-bold hover:bg-white/20 transition-all">
                        View
                      </button>
                      <button onClick={() => toggleSuspend(user.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition-all">
                        Re-Index
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-dark border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-secondary-fixed">{selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', value: selectedUser.email },
                { label: 'Tier', value: selectedUser.tier.replace('_', ' ').toUpperCase() },
                { label: 'Stealth Mode', value: selectedUser.stealthModeEnabled ? 'Enabled' : 'Disabled' },
                { label: 'Card Freeze', value: selectedUser.globalCardFreeze ? 'Active' : 'Inactive' },
                { label: 'Created', value: new Date(selectedUser.createdAt).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 font-mono text-xs uppercase">{item.label}</span>
                  <span className="font-mono font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
