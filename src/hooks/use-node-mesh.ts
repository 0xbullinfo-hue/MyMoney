'use client';

import { create } from 'zustand';
import type { BankNode, NodeStatus } from '@/types';

interface NodeMeshState {
  nodes: BankNode[];
  isSyncingNode: string | null;
  setNodes: (nodes: BankNode[]) => void;
  syncNode: (nodeId: string) => void;
  addNode: (node: BankNode) => void;
  removeNode: (nodeId: string) => void;
  getNodesByStatus: (status: NodeStatus) => BankNode[];
  getTotalBalance: () => number;
}

export const useNodeMesh = create<NodeMeshState>()((set, get) => ({
  nodes: [],
  isSyncingNode: null,
  setNodes: (nodes) => set({ nodes }),
  syncNode: (nodeId) => {
    set({ isSyncingNode: nodeId });
    setTimeout(() => {
      set((state) => ({
        isSyncingNode: null,
        nodes: state.nodes.map((n) =>
          n.id === nodeId
            ? { ...n, lastWebhookSync: new Date().toISOString(), status: 'active' as NodeStatus }
            : n
        ),
      }));
    }, 1500);
  },
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (nodeId) => set((state) => ({ nodes: state.nodes.filter((n) => n.id !== nodeId) })),
  getNodesByStatus: (status) => get().nodes.filter((n) => n.status === status),
  getTotalBalance: () => get().nodes.reduce((sum, n) => sum + n.balance, 0),
}));
