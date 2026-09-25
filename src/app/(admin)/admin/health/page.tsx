'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { mockAdminEndpoints, mockWebhookLogs } from '@/lib/mock-data/admin-metrics';
import { tokens } from '@/lib/tailwind-tokens';
import type { AdminEndpoint, WebhookLog } from '@/types';

const latencyData = mockAdminEndpoints.map((ep) => ({
  name: ep.name.split(' ').slice(0, 2).join(' '),
  latency: ep.latency,
  fill: ep.status === 200 ? tokens.secondaryFixed : tokens.tertiary,
}));

// Deterministic seed generator to avoid SSR hydration mismatches
const seeded = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const webhookTimeline = Array.from({ length: 24 }, (_, i) => ({
  hour: `${23 - i}h`,
  success: Math.floor(seeded(i + 1) * 40 + 60),
  failed: Math.floor(seeded(i + 42) * 5),
})).reverse();

export default function AdminHealthPage() {
  const [endpoints, setEndpoints] = useState<AdminEndpoint[]>(mockAdminEndpoints);
  const [logs] = useState<WebhookLog[]>(mockWebhookLogs);

  useEffect(() => {
    const interval = setInterval(() => {
      setEndpoints((prev) =>
        prev.map((ep) => ({
          ...ep,
          latency: ep.status === 200
            ? Math.max(5, ep.latency + Math.floor(Math.random() * 10 - 5))
            : Math.max(100, ep.latency + Math.floor(Math.random() * 50 - 25)),
          queue: ep.status === 429
            ? Math.max(0, ep.queue + Math.floor(Math.random() * 6 - 3))
            : 0,
        }))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allHealthy = endpoints.every((ep) => ep.status === 200);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-secondary-fixed">System Operator Telemetry</h1>
          <p className="text-xs text-white/60 font-mono">Infrastructure Node Latency &amp; Risk Guardrails</p>
        </div>
        <span className={`px-3 py-1 rounded-full font-mono text-xs border ${
          allHealthy ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }`}>
          {allHealthy ? 'SYSTEM OPERATIONAL' : 'PARTIAL DEGRADATION'}
        </span>
      </div>

      {/* Endpoint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {endpoints.map((ep, i) => (
          <div key={i} className="admin-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm font-mono text-white">{ep.name}</h3>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                ep.status === 200 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-tertiary-container text-tertiary font-extrabold border border-tertiary'
              }`}>
                {ep.status} HTTP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-white/50 block">LATENCY</span>
                <span className={`text-xl font-bold font-mono ${ep.latency > 100 ? 'text-tertiary-container font-extrabold' : 'text-secondary-fixed'}`}>{ep.latency}ms</span>
              </div>
              <div>
                <span className="text-white/50 block">RETRY QUEUE</span>
                <span className={`text-xl font-bold font-mono ${ep.queue > 0 ? 'text-amber-400 font-extrabold' : 'text-white'}`}>{ep.queue} Jobs</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Bar Chart */}
        <div className="admin-card p-6 rounded-2xl">
          <h3 className="font-mono text-xs text-secondary-fixed uppercase tracking-wider mb-4 font-semibold">Endpoint Latency Comparison</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.7)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.7)' }} unit="ms" />
                <Tooltip contentStyle={{ background: '#0A192F', border: '1px solid rgba(79,216,235,0.3)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {latencyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Webhook Timeline */}
        <div className="admin-card p-6 rounded-2xl">
          <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider mb-4">24h Webhook Success / Failure</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={webhookTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
                <Tooltip contentStyle={{ background: '#0A192F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Area type="monotone" dataKey="success" fill={tokens.secondaryFixed} fillOpacity={0.2} stroke={tokens.secondaryFixed} strokeWidth={2} />
                <Area type="monotone" dataKey="failed" fill={tokens.danger} fillOpacity={0.3} stroke={tokens.danger} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Webhook Logs Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-mono text-xs text-secondary-fixed uppercase tracking-wider font-semibold">Recent Webhook Ingestion Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Endpoint</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">HTTP</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Latency</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Signature</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-white/40 uppercase">Result</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono">{log.institutionId.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-500/20 text-emerald-400' : log.statusCode === 429 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-mono font-bold ${log.latencyMs > 100 ? 'text-amber-400' : 'text-secondary-fixed'}`}>{log.latencyMs}ms</td>
                  <td className="px-4 py-3 text-xs font-mono text-white/40">{log.payloadSignature.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${
                      log.status === 'success' ? 'text-emerald-400' : log.status === 'retrying' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
