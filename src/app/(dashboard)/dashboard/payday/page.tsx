'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStealth } from '@/hooks/use-stealth';
import { initialBillRoutes, initialPaydayRules, initialUserCards, billerCatalog } from '@/lib/mock-data/payday-routes';
import type { BillRouteItem, PaydayInflowRule, InflowExecutionLog, UserCardItem, BillerCatalogItem, BillerPlanOption } from '@/types/payday';

export default function PaydayHubPage() {
  const { formatCurrency } = useStealth();
  const [rules, setRules] = useState<PaydayInflowRule>(initialPaydayRules);
  const [bills, setBills] = useState<BillRouteItem[]>(initialBillRoutes);
  const [cards, setCards] = useState<UserCardItem[]>(initialUserCards);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Approval and Payment Simulation Modal
  const [isApproving, setIsApproving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLog, setSimLog] = useState<InflowExecutionLog | null>(null);

  // New/Edit Bill Modal
  const [editingBill, setEditingBill] = useState<BillRouteItem | null>(null);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('cat_netflix');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('net_premium');
  const [customBillerId, setCustomBillerId] = useState('');
  const [customCardId, setCustomCardId] = useState('card_01');

  // Card Management Modal & Prompts
  const [showCardModal, setShowCardModal] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ bankName: 'GTBank', cardType: 'Mastercard' as const, last4: '9920', expiry: '12/28', limit: 200000 });
  const [cardDisconnectTarget, setCardDisconnectTarget] = useState<UserCardItem | null>(null);
  const [showDisconnectAllConfirm, setShowDisconnectAllConfirm] = useState(false);

  // OTP Verification for Pay All Approval
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpResendSeconds, setOtpResendSeconds] = useState(45);

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

  // Card disconnect actions
  const confirmDisconnectCard = () => {
    if (cardDisconnectTarget) {
      setCards(cards.filter((c) => c.id !== cardDisconnectTarget.id));
      setCardDisconnectTarget(null);
    }
  };

  const confirmDisconnectAllCards = () => {
    setCards([]);
    setShowDisconnectAllConfirm(false);
  };

  // Handle Pay All (Open approval modal)
  const handlePayAllTrigger = () => {
    setIsApproving(true);
  };

  // Step 1.5: Proceed to OTP Verification Modal
  const handleProceedToOtp = () => {
    setIsApproving(false);
    setIsOtpModalOpen(true);
    setOtpCode('');
    setOtpError('');
    setOtpResendSeconds(45);
  };

  // Step 2: Validate OTP and Execute Payments
  const handleVerifyOtpAndPay = () => {
    if (otpCode.trim() !== '849210' && otpCode.trim().length !== 6) {
      setOtpError('Invalid OTP code. Please enter the 6-digit verification code (Demo: 849210).');
      return;
    }
    setOtpError('');
    setIsOtpModalOpen(false);
    executeApprovedPayments();
  };

  // Execute Approved Payments
  const executeApprovedPayments = () => {
    setIsApproving(false);
    setIsPaying(true);
    setSimStep(1);

    setTimeout(() => {
      setSimStep(2);
    }, 1200);

    setTimeout(() => {
      setSimStep(3);
      const activeBills = bills.filter((b) => b.isAutoEnabled && !rules.globalFreezeActive);
      const totalBills = activeBills.reduce((s, b) => s + b.targetAmount, 0);
      const vat = Math.round(totalBills * 0.075);
      const emtl = activeBills.length * 50;
      const detectedInflow = 1850000;
      const residual = detectedInflow - (totalBills + vat + emtl);

      setSimLog({
        id: `INV-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        detectedAmount: detectedInflow,
        receivingBank: 'GTBank Checking (Acct • 0491)',
        totalBillsAllocated: totalBills,
        vatLevy: vat,
        emtlFee: emtl,
        residualSaved: residual,
        receipts: activeBills.map((b) => ({
          billName: b.name,
          billerRef: b.billerIdentifier,
          amount: b.targetAmount,
          reference: `NIP-${Math.floor(100000000 + Math.random() * 900000000)}`,
          paymentSource: b.assignedPaymentSourceName,
          token: b.category === 'utilities' ? `TOKEN: ${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}` : undefined,
          status: 'success',
        })),
      });
    }, 2600);
  };

  // Download PDF Invoice
  const handleDownloadInvoice = () => {
    window.print();
  };

  // Save selected bill from catalog
  const handleSaveCatalogBill = () => {
    const catalogItem = billerCatalog.find((c) => c.id === selectedCatalogId);
    if (!catalogItem) return;
    const plan = catalogItem.plans.find((p) => p.id === selectedPlanId) || catalogItem.plans[0];
    const card = cards.find((c) => c.id === customCardId) || cards[0];

    const newBill: BillRouteItem = {
      id: `bill_${Date.now()}`,
      name: `${catalogItem.name} (${plan.name})`,
      category: catalogItem.category,
      categoryLabel: catalogItem.categoryLabel,
      icon: catalogItem.icon,
      targetAmount: plan.amount,
      maxSpendingCap: Math.round(plan.amount * 1.2),
      billerIdentifier: customBillerId || 'Registered Account',
      assignedPaymentSourceId: card ? card.id : 'card_01',
      assignedPaymentSourceName: card ? `${card.bankName} (•••• ${card.last4})` : 'GTBank (•••• 0491)',
      selectedPlanId: plan.id,
      isAutoEnabled: true,
      status: 'active',
      description: plan.description,
    };

    setBills([newBill, ...bills]);
    setIsAddingBill(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6 print:p-0 print:space-y-2">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant print:hidden">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">Payday &amp; Auto-Bills</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Whenever salary lands in your bank, MyMoney automatically pays your bills, funds your rent savings, and protects your peace of mind.
          </p>
        </div>
      </div>

      {/* ═══ Top Summary KPI Bar ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Auto-Scheduled Bills</div>
          <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(totalAutoScheduled)}</div>
          <div className="text-[11px] text-secondary font-semibold">Across {bills.filter((b) => b.isAutoEnabled).length} active bill categories</div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Inflow Trigger Threshold</div>
          <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(rules.minInflowThreshold)}</div>
          <div className="text-[11px] text-on-surface-variant">Triggers when incoming fund &ge; threshold</div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Payment Authorization</div>
          <div className="text-lg font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
            <span>{rules.executionMode === 'manual_approval' ? '1-Tap Approval' : 'Fully Autonomous'}</span>
          </div>
          <button
            onClick={() => setRules({ ...rules, executionMode: rules.executionMode === 'autonomous' ? 'manual_approval' : 'autonomous' })}
            className="text-[11px] text-secondary font-semibold underline hover:opacity-80"
          >
            Switch to {rules.executionMode === 'autonomous' ? '1-Tap Approval' : 'Fully Autonomous'}
          </button>
        </div>

        {/* Card 4: Residual Fund Card */}
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant shadow-sm space-y-1">
          <div className="text-xs text-on-surface-variant font-medium">Residual Strategy</div>
          <div className="text-lg font-bold text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px]">savings</span>
            <span>14% p.a. Savings Sweep</span>
          </div>
          <div className="text-[11px] text-on-surface-variant">Remaining money swept into Stanbic MMF</div>
        </div>
      </div>

      {/* ═══ Action Buttons: Aligned Horizontally Below the Residual Card Row ═══ */}
      <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
        <button
          onClick={() => setShowCardModal(true)}
          className="px-4 py-2.5 rounded-xl bg-surface-lowest border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center gap-2 shadow-sm"
          title="Manage Authorized Cards"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">credit_card</span>
          <span>Cards ({cards.length})</span>
        </button>
        <button
          onClick={toggleGlobalFreeze}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
            rules.globalFreezeActive ? 'bg-secondary text-white' : 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent hover:text-white'
          }`}
          title={rules.globalFreezeActive ? 'Resume Auto-Bills' : 'Emergency Pause'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {rules.globalFreezeActive ? 'play_arrow' : 'pause'}
          </span>
          <span>{rules.globalFreezeActive ? 'Resume All Bills' : 'Pause All Bills'}</span>
        </button>
        <button
          onClick={handlePayAllTrigger}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center gap-2 shadow-md active:scale-95"
          title="Pay All Selected Bills"
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Pay All ({formatCurrency(totalAutoScheduled)})</span>
        </button>
      </div>

      {/* ═══ Filter & Search Bar ═══ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-lowest p-3 rounded-2xl border border-outline-variant print:hidden">
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
              setSelectedCatalogId('cat_netflix');
              setSelectedPlanId('net_premium');
              setCustomBillerId('');
              setIsAddingBill(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 ml-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Bill Option
          </button>
        </div>
      </div>

      {/* ═══ Bills Matrix List ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
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
                <span className="material-symbols-outlined text-[14px] text-secondary">credit_card</span>
                <span>{bill.assignedPaymentSourceName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-on-surface-variant">
              <span>Last paid: {bill.lastSettledDate || 'Pending next payday'}</span>
              <button
                onClick={() => {
                  setEditingBill(bill);
                }}
                className="text-primary font-semibold hover:underline"
              >
                Change Plan / Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ MODAL 1: PAY ALL APPROVAL MODAL ═══ */}
      <AnimatePresence>
        {isApproving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button onClick={() => setIsApproving(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Payday Pre-Payment Verification</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-primary">Approve All Payday Bills</h3>
                <p className="text-xs text-on-surface-variant">Review every bill and assigned card before confirming payments.</p>
              </div>

              {/* Itemized List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {bills.filter((b) => b.isAutoEnabled).map((bill) => (
                  <div key={bill.id} className="p-3 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-primary">{bill.name}</div>
                      <div className="text-[11px] text-on-surface-variant">Source: {bill.assignedPaymentSourceName}</div>
                    </div>
                    <div className="font-bold font-mono text-primary text-sm">{formatCurrency(bill.targetAmount)}</div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-3.5 rounded-xl bg-surface-high border border-outline-variant space-y-1.5 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total Bills to Clear:</span>
                  <span className="font-mono font-bold text-primary">{formatCurrency(totalAutoScheduled)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated VAT &amp; EMTL Surcharge:</span>
                  <span className="font-mono text-primary">{formatCurrency(Math.round(totalAutoScheduled * 0.075) + 300)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-outline-variant/60 font-bold text-primary text-sm">
                  <span>Total Debit Amount:</span>
                  <span className="font-mono text-secondary">{formatCurrency(totalAutoScheduled + Math.round(totalAutoScheduled * 0.075) + 300)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsApproving(false)}
                  className="w-1/3 py-3 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToOtp}
                  className="w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>Approve &amp; Pay ({formatCurrency(totalAutoScheduled)})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL 1.5: TWO-FACTOR VERIFICATION (OTP) ═══ */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">lock_clock</span>
                </div>
                <button onClick={() => setIsOtpModalOpen(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-headline font-bold text-xl text-primary">Two-Factor Authorization</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  To approve paying <strong className="text-primary font-mono">{formatCurrency(totalAutoScheduled)}</strong> across your active bills, enter the 6-digit verification code.
                </p>
              </div>

              {/* Delivery Channel Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOtpChannel('sms')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    otpChannel === 'sms'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-outline-variant bg-surface-low text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">sms</span>
                  <span>SMS (•••• 2044)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpChannel('email')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    otpChannel === 'email'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-outline-variant bg-surface-low text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>Email (a••••@gm...)</span>
                </button>
              </div>

              {/* OTP Code Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-primary">Enter 6-Digit Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="849210"
                    className="w-full text-center tracking-[0.4em] font-mono font-extrabold text-xl py-3 px-4 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {otpError && (
                  <div className="text-accent text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Helper pill to fill demo OTP */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-on-surface-variant">
                  <span>Demo code: <button type="button" onClick={() => setOtpCode('849210')} className="font-mono font-bold text-secondary underline hover:opacity-80">849210</button></span>
                  <span>Resend in {otpResendSeconds}s</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtpAndPay}
                  className="w-2/3 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Verify &amp; Dispatch</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL 2: PAYMENT EXECUTION & DETAILED PDF INVOICE ═══ */}
      <AnimatePresence>
        {isPaying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
            >
              <button onClick={() => setIsPaying(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-primary print:hidden">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {simStep === 1 && (
                <div className="space-y-4 text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto animate-bounce">
                    <span className="material-symbols-outlined text-[32px]">payments</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-primary">Dispatching Authorized NIP Payments...</div>
                    <div className="text-xs text-on-surface-variant font-mono">Contacting bank clearing gates and utility biller APIs...</div>
                  </div>
                </div>
              )}

              {simStep === 2 && (
                <div className="space-y-4 text-center py-8">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">Generating Meter Tokens &amp; Sweeping Savings...</div>
                    <div className="text-xs text-on-surface-variant font-mono">IKEDC prepaid handshake • Stanbic 14% vault credit confirmed</div>
                  </div>
                </div>
              )}

              {simStep === 3 && simLog && (
                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="MyMoney" className="w-9 h-9 rounded-xl object-contain" />
                      <div>
                        <h2 className="font-headline font-extrabold text-xl text-primary">MyMoney Payday Invoice</h2>
                        <div className="text-xs text-on-surface-variant font-mono">Invoice Ref: #{simLog.id} • {simLog.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 font-bold text-xs">
                        PAID &amp; SETTLED
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-low border border-outline-variant text-center">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Total Paid</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-primary">{formatCurrency(simLog.totalBillsAllocated)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">VAT &amp; Levies</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-on-surface-variant">{formatCurrency(simLog.vatLevy + simLog.emtlFee)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Residual Saved</div>
                      <div className="text-base sm:text-lg font-bold font-mono text-secondary">{formatCurrency(simLog.residualSaved)}</div>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-on-surface-variant">Cleared Payday Bills</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {simLog.receipts.map((rec, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-lowest border border-outline-variant text-xs space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-primary">{rec.billName}</div>
                              <div className="text-[11px] text-on-surface-variant">Ref: {rec.reference} • Paid via {rec.paymentSource}</div>
                            </div>
                            <div className="font-mono font-bold text-primary">{formatCurrency(rec.amount)}</div>
                          </div>
                          {rec.token && (
                            <div className="p-2 rounded bg-secondary/10 border border-secondary/20 font-mono text-xs text-secondary font-bold select-all">
                              Electricity Token: {rec.token}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modal Action Footer */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-outline-variant print:hidden">
                    <button
                      onClick={handleDownloadInvoice}
                      className="flex-1 py-3 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      <span>Download PDF Invoice</span>
                    </button>
                    <button
                      onClick={() => setIsPaying(false)}
                      className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL 3: CARD MANAGEMENT (ADD / DISCONNECT) ═══ */}
      <AnimatePresence>
        {showCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl border border-outline-variant max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button onClick={() => setShowCardModal(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-secondary">Tokenized Card Vault</span>
                <h3 className="font-headline font-bold text-xl text-primary">Authorized Payment Cards</h3>
                <p className="text-xs text-on-surface-variant">Cards are tokenized securely with your bank. You can disconnect anytime.</p>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <div className="p-8 text-center bg-surface-low rounded-2xl border border-outline-variant text-xs text-on-surface-variant">
                    No active cards. Add a card below to assign to bills.
                  </div>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className="p-4 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {card.cardType.slice(0, 4)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-primary">{card.bankName} {card.cardType} (•••• {card.last4})</div>
                          <div className="text-[11px] text-on-surface-variant">Expires: {card.expiry} • Limit: {formatCurrency(card.monthlySpendLimit)}/mo</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setCardDisconnectTarget(card)}
                        className="p-2 rounded-xl text-accent hover:bg-accent/10 border border-accent/30 text-xs font-semibold"
                        title="Disconnect Card"
                      >
                        Disconnect
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-1/2 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_card</span>
                  <span>Add New Card</span>
                </button>
                <button
                  onClick={() => setShowDisconnectAllConfirm(true)}
                  disabled={cards.length === 0}
                  className="w-1/2 py-2.5 rounded-xl border border-accent/40 text-accent font-bold text-xs hover:bg-accent/10 transition-all disabled:opacity-40"
                >
                  Disconnect All Cards
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ PROMPT: DISCONNECT SINGLE CARD CONFIRMATION ═══ */}
      {cardDisconnectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">credit_card_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-primary">Disconnect Card •••• {cardDisconnectTarget.last4}?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Are you sure you want to disconnect this card? Any recurring bills assigned to this card will be paused until you link another card.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCardDisconnectTarget(null)}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnectCard}
                className="w-1/2 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROMPT: DISCONNECT ALL CARDS CONFIRMATION ═══ */}
      {showDisconnectAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-primary">Disconnect All Payment Cards?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This will unbind all {cards.length} cards from MyMoney and pause all active Payday bill automations.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDisconnectAllConfirm(false)}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                No, Keep Cards
              </button>
              <button
                onClick={confirmDisconnectAllCards}
                className="w-1/2 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all"
              >
                Yes, Disconnect All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: ADD CARD FORM ═══ */}
      {isAddingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-headline font-bold text-lg text-primary">Link New Payment Card</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Issuing Bank</label>
                <select
                  value={newCardForm.bankName}
                  onChange={(e) => setNewCardForm({ ...newCardForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary focus:outline-none"
                >
                  <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                  <option value="Access Bank">Access Bank PLC</option>
                  <option value="Zenith Bank">Zenith Bank PLC</option>
                  <option value="Stanbic IBTC">Stanbic IBTC Bank</option>
                  <option value="Kuda MFB">Kuda Microfinance Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="UBA">United Bank for Africa (UBA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Card Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newCardForm.last4}
                    onChange={(e) => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={newCardForm.expiry}
                    onChange={(e) => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Monthly Spending Ceiling (₦)</label>
                <input
                  type="number"
                  value={newCardForm.limit}
                  onChange={(e) => setNewCardForm({ ...newCardForm, limit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsAddingCard(false)}
                className="w-1/3 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const card: UserCardItem = {
                    id: `card_${Date.now()}`,
                    bankName: newCardForm.bankName,
                    cardType: newCardForm.cardType,
                    last4: newCardForm.last4 || '1234',
                    expiry: newCardForm.expiry || '12/28',
                    hardwareToken: `enc_hsm_${Math.floor(100000 + Math.random() * 900000)}`,
                    monthlySpendLimit: newCardForm.limit,
                    status: 'active',
                  };
                  setCards([...cards, card]);
                  setIsAddingCard(false);
                }}
                className="w-2/3 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all"
              >
                Authorize &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL 4: SELECT BILL FROM CATALOG / CHANGE OPTION ═══ */}
      <AnimatePresence>
        {isAddingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest border border-outline-variant max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-xl text-primary">Choose Bill Option</h3>
                <button onClick={() => setIsAddingBill(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Step 1: Select Biller Catalog */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Select Bill Provider</label>
                  <select
                    value={selectedCatalogId}
                    onChange={(e) => {
                      setSelectedCatalogId(e.target.value);
                      const cat = billerCatalog.find((c) => c.id === e.target.value);
                      if (cat && cat.plans.length > 0) {
                        setSelectedPlanId(cat.plans[0].id);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary text-sm font-semibold"
                  >
                    {billerCatalog.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Package / Plan Option */}
                {(() => {
                  const cat = billerCatalog.find((c) => c.id === selectedCatalogId);
                  if (!cat) return null;
                  return (
                    <div>
                      <label className="block text-on-surface-variant mb-1 font-semibold">Select Subscription Package / Tier</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {cat.plans.map((p) => (
                          <label
                            key={p.id}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              selectedPlanId === p.id ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-low'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="planSelect"
                                checked={selectedPlanId === p.id}
                                onChange={() => setSelectedPlanId(p.id)}
                                className="accent-primary"
                              />
                              <div>
                                <div className="font-bold text-primary text-xs">{p.name}</div>
                                <div className="text-[10px] text-on-surface-variant">{p.description}</div>
                              </div>
                            </div>
                            <div className="font-mono font-bold text-primary text-xs">{formatCurrency(p.amount)}</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Account Identifier */}
                {(() => {
                  const cat = billerCatalog.find((c) => c.id === selectedCatalogId);
                  return (
                    <div>
                      <label className="block text-on-surface-variant mb-1 font-semibold">{cat ? cat.identifierLabel : 'Account ID'}</label>
                      <input
                        type="text"
                        placeholder={cat ? cat.identifierPlaceholder : ''}
                        value={customBillerId}
                        onChange={(e) => setCustomBillerId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary text-sm"
                      />
                    </div>
                  );
                })()}

                {/* Step 4: Assign Card */}
                <div>
                  <label className="block text-on-surface-variant mb-1 font-semibold">Assign Payment Card</label>
                  <select
                    value={customCardId}
                    onChange={(e) => setCustomCardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-primary text-sm"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>{c.bankName} {c.cardType} (•••• {c.last4})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsAddingBill(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCatalogBill}
                  className="w-2/3 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all shadow-md"
                >
                  Set as Payday Bill
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
