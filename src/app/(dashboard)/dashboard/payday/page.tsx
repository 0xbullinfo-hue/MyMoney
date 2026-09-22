'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { initialBillRoutes, initialPaydayRules } from '@/lib/mock-data/payday-routes';
import type { BillRouteItem, PaydayInflowRule, InflowExecutionLog } from '@/types/payday';

export default function PaydayHubPage() {
  const { formatCurrency } = useStealth();
  const [rules, setRules] = useState<PaydayInflowRule>(initialPaydayRules);
  const [bills, setBills] = useState<BillRouteItem[]>(initialBillRoutes);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulation modal state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLog, setSimLog] = useState<InflowExecutionLog | null>(null);

  // New/Edit Bill Modal
  const [editingBill, setEditingBill] = useState<BillRouteItem | null>(null);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [billForm, setBillForm] = useState<Partial<BillRouteItem>>({
    name: '',
    category: 'utilities',
    targetAmount: 20000,
    maxSpendingCap: 25000,
    billerIdentifier: '',
    assignedPaymentSourceName: 'GTBank Checking • 0491',
    isAutoEnabled: true,
  });

  // Security Tokenization Drawer Modal
  const [showSecurityDrawer, setShowSecurityDrawer] = useState(false);

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.billerIdentifier.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalAutoScheduled = bills
    .filter((b) => b.isAutoEnabled && !rules.globalFreezeActive)
    .reduce((sum, b) => sum + b.targetAmount, 0);

  // Toggle individual bill auto state
  const toggleBillAuto = (id: string) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, isAutoEnabled: !b.isAutoEnabled } : b)));
  };

  // Toggle global freeze
  const toggleGlobalFreeze = () => {
    setRules({ ...rules, globalFreezeActive: !rules.globalFreezeActive });
  };

  // Trigger salary simulation
  const runSalarySimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => {
      setSimStep(2);
    }, 1200);

    setTimeout(() => {
      setSimStep(3);
      const activeBills = bills.filter((b) => b.isAutoEnabled);
      const totalBills = activeBills.reduce((s, b) => s + b.targetAmount, 0);
      const residual = 1850000 - totalBills;

      setSimLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        detectedAmount: 1850000,
        receivingBank: 'GTBank Checking (Acct • 0491)',
        totalBillsAllocated: totalBills,
        residualSaved: residual,
        receipts: activeBills.map((b) => ({
          billName: b.name,
          amount: b.targetAmount,
          reference: `NIP-TX-${Math.floor(100000 + Math.random() * 900000)}`,
          token: b.category === 'utilities' ? `TOKEN: ${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}` : undefined,
          status: 'success',
        })),
      });
    }, 2800);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Header & Control Center ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">Payday &amp; Auto-Bills</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              rules.globalFreezeActive ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-secondary/15 text-secondary border border-secondary/30'
            }`}>
              {rules.globalFreezeActive ? 'PAUSED (Frozen)' : 'ACTIVE: Monitoring Inflows'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Whenever bulk money lands in your bank, MyMoney automatically pays your bills, funds your rent savings, and protects your peace of mind.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSecurityDrawer(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-lowest border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>Security &amp; Cards</span>
          </button>
          <button
            onClick={toggleGlobalFreeze}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
              rules.globalFreezeActive ? 'bg-secondary text-white' : 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {rules.globalFreezeActive ? 'play_arrow' : 'pause_circle'}
            </span>
            <span>{rules.globalFreezeActive ? 'Resume Auto-Bills' : 'Emergency Pause All'}</span>
          </button>
          <button
            onClick={runSalarySimulation}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Test Salary Inflow (₦1.85M)</span>
          </button>
        </div>
      </div>

      {/* ═══ Top Summary KPI Bar ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Auto-Scheduled Bills</div>
          <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(totalAutoScheduled)}</div>
          <div className="text-[11px] text-secondary font-semibold">Across {bills.filter((b) => b.isAutoEnabled).length} active bill categories</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Inflow Trigger Threshold</div>
          <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(rules.minInflowThreshold)}</div>
          <div className="text-[11px] text-on-surface-variant">Triggers when incoming fund &ge; threshold</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Execution Strategy</div>
          <div className="text-lg font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">smart_toy</span>
            <span>{rules.executionMode === 'autonomous' ? 'Fully Autonomous' : '1-Tap Approval'}</span>
          </div>
          <button
            onClick={() => setRules({ ...rules, executionMode: rules.executionMode === 'autonomous' ? 'manual_approval' : 'autonomous' })}
            className="text-[11px] text-secondary font-semibold underline hover:opacity-80"
          >
            Switch to {rules.executionMode === 'autonomous' ? '1-Tap Approval' : 'Fully Autonomous'}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Residual Fund Strategy</div>
          <div className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px]">savings</span>
            <span>14% p.a. Savings Sweep</span>
          </div>
          <div className="text-[11px] text-on-surface-variant">Remaining money swept into Stanbic MMF</div>
        </div>
      </div>

      {/* ═══ Filter & Search Bar ═══ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-lowest p-3 rounded-2xl border border-outline-variant">
        <div className="flex items-center gap-2 w-full sm:w-80 px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search bills, meter number, smartcard..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-transparent text-xs text-primary placeholder:text-on-surface-variant/60 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'utilities', label: 'Electricity' },
            { id: 'telecom_data', label: 'Internet' },
            { id: 'subscriptions', label: 'TV & Netflix' },
            { id: 'housing_rent', label: 'Rent' },
            { id: 'education', label: 'School' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => {
              setBillForm({
                name: '',
                category: 'utilities',
                targetAmount: 25000,
                maxSpendingCap: 30000,
                billerIdentifier: '',
                assignedPaymentSourceName: 'GTBank Checking • 0491',
                isAutoEnabled: true,
              });
              setIsAddingBill(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 ml-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Bill
          </button>
        </div>
      </div>

      {/* ═══ Bills Matrix List ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBills.map((bill) => (
          <div
            key={bill.id}
            className={`p-5 rounded-2xl bg-surface-lowest border transition-all space-y-4 shadow-sm ${
              bill.isAutoEnabled && !rules.globalFreezeActive ? 'border-outline-variant hover:border-secondary/50' : 'border-outline-variant/60 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{bill.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary text-sm sm:text-base leading-tight">{bill.name}</h3>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">{bill.billerIdentifier}</div>
                </div>
              </div>

              {/* Toggle Auto Switch */}
              <button
                onClick={() => toggleBillAuto(bill.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  bill.isAutoEnabled && !rules.globalFreezeActive ? 'bg-secondary' : 'bg-outline-variant'
                }`}
                title="Toggle Auto Payment"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    bill.isAutoEnabled && !rules.globalFreezeActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {bill.description}
            </p>

            <div className="pt-2 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-on-surface-variant">Scheduled Pay: </span>
                <span className="font-bold font-mono text-primary text-sm">{formatCurrency(bill.targetAmount)}</span>
                <span className="text-[10px] text-on-surface-variant font-mono ml-1.5">(Cap: {formatCurrency(bill.maxSpendingCap)})</span>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px] text-secondary">account_balance</span>
                <span>{bill.assignedPaymentSourceName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-on-surface-variant">
              <span>Last paid: {bill.lastSettledDate || 'Pending first inflow'}</span>
              <button
                onClick={() => {
                  setEditingBill(bill);
                  setBillForm(bill);
                }}
                className="text-primary font-semibold hover:underline"
              >
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SIMULATION MODAL ═══ */}
      <AnimatePresence>
        {isSimulating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsSimulating(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span>Salary Drop Simulation</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-primary">
                  {simStep === 1 && 'Detecting Incoming Bulk Fund...'}
                  {simStep === 2 && 'Executing Automated Bill Allocations...'}
                  {simStep === 3 && 'All Bills Paid & Saved!'}
                </h3>
              </div>

              {simStep === 1 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto animate-bounce">
                    <span className="material-symbols-outlined text-[32px]">payments</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold font-mono text-primary">₦ 1,850,000.00</div>
                    <div className="text-xs text-on-surface-variant">Incoming NIP Credit detected in GTBank Checking (Narration: "MAY SALARY/PAYROLL")</div>
                  </div>
                </div>
              )}

              {simStep === 2 && (
                <div className="space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-2 text-center">
                    <div className="font-bold text-sm text-primary">Slicing &amp; Dispatching to 8 Billers...</div>
                    <div className="text-xs text-on-surface-variant font-mono">
                      Generating meter tokens • Sinking rent vault • Discarding leaks
                    </div>
                  </div>
                </div>
              )}

              {simStep === 3 && simLog && (
                <div className="space-y-4 py-2">
                  <div className="p-3.5 rounded-xl bg-secondary/15 border border-secondary/30 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-on-surface-variant block">Total Bills Settled:</span>
                      <strong className="text-sm font-mono text-primary">{formatCurrency(simLog.totalBillsAllocated)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-on-surface-variant block">Residual Swept to Savings:</span>
                      <strong className="text-sm font-mono text-secondary">{formatCurrency(simLog.residualSaved)}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {simLog.receipts.map((rec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-surface-low border border-outline-variant text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary">{rec.billName}</span>
                          <span className="font-bold font-mono text-primary">{formatCurrency(rec.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
                          <span>Ref: {rec.reference}</span>
                          <span className="text-emerald-600 font-bold">✓ Settled</span>
                        </div>
                        {rec.token && (
                          <div className="p-1.5 rounded bg-surface-lowest text-[11px] font-mono text-secondary font-bold select-all">
                            {rec.token}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsSimulating(false)}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all"
                  >
                    Done &amp; Close Summary
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ SECURITY DRAWER MODAL ═══ */}
      <AnimatePresence>
        {showSecurityDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowSecurityDrawer(false)}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="space-y-1">
                <span className="font-mono text-xs text-secondary uppercase font-semibold">Anti-Scam Architecture</span>
                <h3 className="font-headline font-bold text-xl text-primary">Secured Bank &amp; Card Authorizations</h3>
                <p className="text-xs text-on-surface-variant">
                  MyMoney never stores your card CVV or bank passwords. All payments use PCI-DSS tokenized mandates that can only pay whitelisted utilities.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[24px]">credit_card</span>
                    <div>
                      <div className="font-bold text-sm text-primary">Access Bank Visa (•••• 4242)</div>
                      <div className="text-[11px] text-on-surface-variant">Hardware Token: enc_card_tok_902418</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/15 text-secondary">Token Active</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[24px]">account_balance</span>
                    <div>
                      <div className="font-bold text-sm text-primary">GTBank Direct Mandate (•••• 0491)</div>
                      <div className="text-[11px] text-on-surface-variant">CBN Open Banking Consent #CBN-MND-4410</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/15 text-secondary">Verified</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-low text-xs space-y-1.5 text-on-surface-variant">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">shield</span>
                  <span>Safety Guardrails Enforced</span>
                </div>
                <div>• Strict per-bill spending caps prevent billers from charging more than your limit.</div>
                <div>• Beneficiaries are restricted exclusively to official utilities and your personal vaults.</div>
              </div>

              <button
                onClick={() => setShowSecurityDrawer(false)}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all"
              >
                Close Security Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ ADD / EDIT BILL MODAL ═══ */}
      <AnimatePresence>
        {(isAddingBill || editingBill) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => { setIsAddingBill(false); setEditingBill(null); }}
                className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <h3 className="font-headline font-bold text-xl text-primary">
                {editingBill ? 'Edit Bill Details' : 'Add New Recurring Bill'}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Bill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Estate Security Levy, Gym, Cooking Gas"
                    value={billForm.name}
                    onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Biller Account / Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. Meter No, Phone, Smartcard, or Vault Name"
                    value={billForm.billerIdentifier}
                    onChange={(e) => setBillForm({ ...billForm, billerIdentifier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-on-surface-variant mb-1 font-semibold">Target Pay (₦)</label>
                    <input
                      type="number"
                      value={billForm.targetAmount}
                      onChange={(e) => setBillForm({ ...billForm, targetAmount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant mb-1 font-semibold">Max Safety Cap (₦)</label>
                    <input
                      type="number"
                      value={billForm.maxSpendingCap}
                      onChange={(e) => setBillForm({ ...billForm, maxSpendingCap: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Pay Using Bank / Card</label>
                  <select
                    value={billForm.assignedPaymentSourceName}
                    onChange={(e) => setBillForm({ ...billForm, assignedPaymentSourceName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="GTBank Checking • 0491">GTBank Checking • 0491</option>
                    <option value="Stanbic IBTC • 8820">Stanbic IBTC (14% Yield) • 8820</option>
                    <option value="Kuda Virtual Card • 1104">Kuda Virtual Card • 1104</option>
                    <option value="Access Bank • 9912">Access Bank • 9912</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsAddingBill(false); setEditingBill(null); }}
                  className="w-1/3 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!billForm.name) return;
                    if (editingBill) {
                      setBills(bills.map((b) => (b.id === editingBill.id ? { ...b, ...billForm } as BillRouteItem : b)));
                      setEditingBill(null);
                    } else {
                      const newBill: BillRouteItem = {
                        id: `bill_${Date.now()}`,
                        name: billForm.name || 'New Bill',
                        category: (billForm.category || 'utilities') as any,
                        categoryLabel: 'Custom Bill',
                        icon: 'receipt',
                        targetAmount: billForm.targetAmount || 20000,
                        maxSpendingCap: billForm.maxSpendingCap || 25000,
                        billerIdentifier: billForm.billerIdentifier || 'Account ID',
                        assignedPaymentSourceId: 'node_gtb_01',
                        assignedPaymentSourceName: billForm.assignedPaymentSourceName || 'GTBank Checking',
                        isAutoEnabled: true,
                        status: 'active',
                        description: 'Custom recurring bill payment rule.',
                      };
                      setBills([newBill, ...bills]);
                      setIsAddingBill(false);
                    }
                  }}
                  className="w-2/3 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md"
                >
                  Save Bill Setting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
