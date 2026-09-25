'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStealth } from '@/hooks/use-stealth';
import { initialUserCards, initialBillRoutes } from '@/lib/mock-data/payday-routes';

export default function UserProfilePage() {
  const { formatCurrency } = useStealth();
  const [cards, setCards] = useState(initialUserCards);
  const [bills, setBills] = useState(initialBillRoutes);
  const [disconnectingCard, setDisconnectingCard] = useState<string | null>(null);

  // ═══ User Verification & Tier State (Free Users Remain Unverified by Default) ═══
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<1 | 2 | 3>(1); // 1: Photo, 2: SMS OTP, 3: Success
  const [isCapturingSelfie, setIsCapturingSelfie] = useState<boolean>(false);
  const [selfieCaptured, setSelfieCaptured] = useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(45);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load verification status from localStorage (defaults to false for free unverified user)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mymoney_user_verified');
      if (saved === 'true') {
        setIsVerified(true);
      }
    }
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (showVerifyModal && verifyStep === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showVerifyModal, verifyStep, resendTimer]);

  const handleLogout = () => {
    // High security logout: clear session and prevent browser password remembrance
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  const removeCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    setDisconnectingCard(null);
  };

  // Trigger selfie capture simulation with flash
  const handleSnapSelfie = () => {
    setIsCapturingSelfie(true);
    setCameraFlash(true);
    setTimeout(() => {
      setCameraFlash(false);
      setIsCapturingSelfie(false);
      setSelfieCaptured(true);
    }, 700);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);
    setOtpError('');

    // Auto advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Paste handler for OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      setOtpError('');
    }
  };

  // Fill demo OTP code (592814)
  const handleAutoFillOtp = () => {
    setOtpDigits(['5', '9', '2', '8', '1', '4']);
    setOtpError('');
  };

  // Submit SMS OTP to verify
  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the SMS verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    setTimeout(() => {
      setIsVerifyingOtp(false);
      setVerifyStep(3); // Go to Success Screen
    }, 1200);
  };

  // Finalize verification and unlock premium
  const handleFinalizeVerification = () => {
    setIsVerified(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mymoney_user_verified', 'true');
    }
    setShowVerifyModal(false);
    setVerifyStep(1);
    setSelfieCaptured(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Toggle verification for demo / testing
  const toggleVerificationStatus = () => {
    const nextState = !isVerified;
    setIsVerified(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mymoney_user_verified', nextState ? 'true' : 'false');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">My Profile &amp; Preferences</h1>
          <p className="text-sm text-on-surface-variant">View all your linked cards, active subscriptions, Payday bills, and security settings.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Toggle */}
          <button
            onClick={toggleVerificationStatus}
            className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-low text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center gap-2 shadow-2xs"
            title="Toggle between Free Unverified and Verified Tier 2 for testing"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              {isVerified ? 'check_circle' : 'pending'}
            </span>
            <span>Demo: {isVerified ? 'Switch to Unverified' : 'Simulate Verified'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all flex items-center gap-1.5 self-start shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Log Out Securely</span>
          </button>
        </div>
      </div>

      {/* ═══ Section 1: User Identity & Verification Tier Status ═══ */}
      <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-bold text-2xl shadow-sm relative overflow-hidden">
              {isVerified ? (
                <Image
                  src="/images/biometric_selfie.jpg"
                  alt="Alhaji Bello Tariq"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                'AB'
              )}
              {isVerified && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-tl-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline font-bold text-xl text-primary">Alhaji Bello Tariq</h2>
                {isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Verified Tier 2 (Smile ID Certified)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    <span>Unverified Free User</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                bello.tariq@mymoney.ng • +234 803 991 2044
              </div>
              <div className="text-xs font-semibold mt-1 flex items-center gap-2">
                <span className="text-on-surface-variant">Active Plan:</span>
                <span className={`font-bold ${isVerified ? 'text-secondary' : 'text-primary'}`}>
                  {isVerified ? 'MyMoney Plenty (₦3,000/mo) — Premium Unlocked' : 'MyMoney Free — Basic Access'}
                </span>
              </div>
            </div>
          </div>

          {!isVerified && (
            <button
              onClick={() => {
                setVerifyStep(1);
                setSelfieCaptured(false);
                setOtpDigits(['', '', '', '', '', '']);
                setShowVerifyModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center gap-2 self-start sm:self-center shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Verify Identity via Smile ID</span>
            </button>
          )}
        </div>

        {/* ═══ Verification & Feature Access Banner ═══ */}
        {isVerified ? (
          /* VERIFIED STATE BANNER */
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary/10 border border-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-primary">Identity Verified with Smile ID</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/70 text-secondary border border-secondary/20">
                    ID: SML-NG-2026-9924
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Biometric facial selfie (99.7% liveness) and mobile text OTP confirmed. All premium features unlocked.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-secondary font-semibold">
                  <span className="flex items-center gap-1">✓ Payday Auto-Bills Enabled</span>
                  <span className="flex items-center gap-1">✓ Up to 5 Bank Nodes</span>
                  <span className="flex items-center gap-1">✓ 14% p.a. High-Yield Sweeps</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="text-[11px] font-mono text-secondary bg-surface-lowest px-3 py-1.5 rounded-lg border border-secondary/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Premium Tier
              </span>
            </div>
          </div>
        ) : (
          /* UNVERIFIED FREE BANNER */
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-primary">Free Account (Unverified)</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800">
                    Premium Features Locked
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Free users remain unverified. Complete verification with a quick photo selfie (Smile ID) and SMS text OTP to unlock Payday auto-bills and unlimited bank syncing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-amber-600 text-[14px]">lock</span>
                    <span>Payday Auto-Bills (Locked)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-amber-600 text-[14px]">lock</span>
                    <span>Max 2 Bank Nodes (Locked)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-amber-600 text-[14px]">lock</span>
                    <span>Daily Yield Sweeps (Locked)</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setVerifyStep(1);
                setSelfieCaptured(false);
                setOtpDigits(['', '', '', '', '', '']);
                setShowVerifyModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 self-stretch md:self-center shadow-xs flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              <span>Start Smile ID Verification</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ Section 2: Linked Payment Cards ═══ */}
        <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-primary">Linked Debit Cards</h3>
              <p className="text-xs text-on-surface-variant">Authorized for Payday auto-bill settlements.</p>
            </div>
            <Link
              href="/dashboard/payday"
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-all"
            >
              + Link Card
            </Link>
          </div>

          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="p-4 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {card.cardType.slice(0, 4)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-primary">{card.bankName} {card.cardType} (•••• {card.last4})</div>
                    <div className="text-xs text-on-surface-variant font-mono">Expires {card.expiry} • Cap: {formatCurrency(card.monthlySpendLimit)}/mo</div>
                  </div>
                </div>
                <button
                  onClick={() => setDisconnectingCard(card.id)}
                  className="px-3 py-1.5 rounded-xl border border-accent/40 text-accent text-xs font-semibold hover:bg-accent/10 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Section 3: Active Payday Bills Schedule ═══ */}
        <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-primary">Active Payday Bills</h3>
              <p className="text-xs text-on-surface-variant">Configured to clear automatically when salary drops.</p>
            </div>
            <Link
              href="/dashboard/payday"
              className="text-xs text-secondary font-semibold hover:underline"
            >
              Manage in Payday Hub →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {bills.filter((b) => b.isAutoEnabled).map((bill) => (
              <div key={bill.id} className="p-3.5 rounded-2xl bg-surface-low border border-outline-variant flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">{bill.icon}</span>
                  <div>
                    <div className="font-bold text-primary">{bill.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">{bill.billerIdentifier}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-primary">{formatCurrency(bill.targetAmount)}</div>
                  <div className="text-[10px] text-on-surface-variant">{bill.assignedPaymentSourceName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Section 4: Security & Password Policy ═══ */}
      <div className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-primary">Security &amp; Air-Gapped Session Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">enhanced_encryption</span>
              <span>Zero Password Remembrance</span>
            </div>
            <p>For your security, browser password auto-fill is disabled on logout to prevent unauthorized access on shared devices.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">lock_reset</span>
              <span>Session Disconnect</span>
            </div>
            <p>Leaving the dashboard clears session tokens and enforces re-authentication via Sign In.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant space-y-1">
            <div className="font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">sms</span>
              <span>Smile ID &amp; 2FA OTP</span>
            </div>
            <p>Biometric photo verification and 6-digit SMS OTP protect your accounts and unlock high-tier limits.</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SMILE ID IDENTITY VERIFICATION MODAL (Photo Selfie + SMS OTP)
      ════════════════════════════════════════════════════════════════════════ */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 relative overflow-hidden">
            {/* Camera Flash Overlay */}
            {cameraFlash && (
              <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-pulse" />
            )}

            {/* Modal Header with Smile ID Branding */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-base sm:text-lg text-primary">Identity Verification</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/30">
                      Smile ID
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Powered by Smile ID — Africa&apos;s #1 Biometric &amp; KYC Gateway
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-low transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between px-2 text-xs">
              <div className={`flex items-center gap-1.5 font-bold ${verifyStep >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${verifyStep >= 1 ? 'bg-primary text-white' : 'bg-surface-low border'}`}>
                  1
                </span>
                <span>Photo Selfie</span>
              </div>
              <div className={`w-8 h-0.5 ${verifyStep >= 2 ? 'bg-primary' : 'bg-outline-variant'}`} />
              <div className={`flex items-center gap-1.5 font-bold ${verifyStep >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${verifyStep >= 2 ? 'bg-primary text-white' : 'bg-surface-low border'}`}>
                  2
                </span>
                <span>SMS OTP</span>
              </div>
              <div className={`w-8 h-0.5 ${verifyStep === 3 ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
              <div className={`flex items-center gap-1.5 font-bold ${verifyStep === 3 ? 'text-emerald-600' : 'text-on-surface-variant'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${verifyStep === 3 ? 'bg-emerald-500 text-white' : 'bg-surface-low border'}`}>
                  ✓
                </span>
                <span>Verified</span>
              </div>
            </div>

            {/* ═══ STEP 1: PHOTO PICTURE (BIOMETRIC SELFIE VIA 3RD PARTY) ═══ */}
            {verifyStep === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="font-headline font-bold text-base text-primary">Biometric Facial Verification</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Smile ID requires a live photo selfie to verify your identity against the Central Bank (BVN) registry.
                  </p>
                </div>

                {/* Viewfinder / Capture Box */}
                <div className="relative w-full h-64 rounded-2xl bg-primary/95 text-white overflow-hidden flex flex-col items-center justify-center border-2 border-primary/20 shadow-inner">
                  {selfieCaptured ? (
                    // Captured Selfie View
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                      <Image
                        src="/images/biometric_selfie.jpg"
                        alt="Captured Biometric Selfie"
                        fill
                        className="object-cover opacity-90"
                      />
                      {/* Biometric Analysis Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-white font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            3D Liveness: 99.7%
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white">
                            NIMC Match: TRUE
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-black/60 backdrop-blur-xs border border-white/20 text-center space-y-0.5">
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>Photo Successfully Captured &amp; Validated</span>
                          </div>
                          <div className="text-[10px] text-white/80">Alhaji Bello Tariq • Smile ID Liveness Confirmed</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Live Viewfinder Mode
                    <div className="flex flex-col items-center justify-center space-y-3 p-4">
                      {/* Facial Oval Frame */}
                      <div className="relative w-36 h-44 rounded-[50%] border-2 border-dashed border-secondary/70 flex items-center justify-center">
                        <div className="w-32 h-40 rounded-[50%] border border-white/20 flex flex-col items-center justify-center text-center p-2">
                          <span className="material-symbols-outlined text-secondary text-[40px] animate-pulse">
                            face
                          </span>
                          <span className="text-[10px] text-white/80 font-mono mt-1">Center your face</span>
                        </div>
                        {/* Corner Target Markers */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary" />
                        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary" />
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary" />
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-secondary font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Smile ID Camera Sensor Active • Good Lighting</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  {selfieCaptured ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelfieCaptured(false)}
                        className="w-1/3 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-xs font-semibold text-primary hover:bg-surface-high transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        <span>Retake</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyStep(2)}
                        className="w-2/3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Continue to SMS OTP</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSnapSelfie}
                      disabled={isCapturingSelfie}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>{isCapturingSelfie ? 'Analyzing Biometrics...' : 'Take Verification Selfie'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══ STEP 2: SMS TEXT OTP VERIFICATION ═══ */}
            {verifyStep === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="font-headline font-bold text-base text-primary">Verify Text Message OTP</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    We dispatched a 6-digit one-time PIN via SMS to your registered phone{' '}
                    <span className="font-mono font-bold text-primary">+234 803 ••• 2044</span>.
                  </p>
                </div>

                {/* Demo Helper Banner */}
                <div className="p-3 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">sms</span>
                    <div>
                      <span className="text-on-surface-variant">Demo SMS Code: </span>
                      <span className="font-mono font-bold text-secondary text-sm">592814</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1 rounded-lg bg-surface-lowest text-secondary font-bold text-[11px] hover:bg-secondary hover:text-white transition-all border border-secondary/20 shadow-2xs"
                  >
                    Auto-fill 592814
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-1.5 sm:gap-3 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      autoFocus={idx === 0}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl sm:rounded-2xl border border-outline-variant bg-surface-low text-center font-mono font-extrabold text-lg sm:text-xl text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-xs"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-accent text-center font-medium">{otpError}</p>
                )}

                {/* Resend Timer */}
                <div className="text-center text-xs text-on-surface-variant">
                  {resendTimer > 0 ? (
                    <span>Resend SMS code in <strong className="font-mono text-primary">{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResendTimer(45)}
                      className="text-secondary font-bold hover:underline"
                    >
                      Resend SMS OTP Code Now
                    </button>
                  )}
                </div>

                {/* Submit OTP */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerifyStep(1)}
                    className="w-1/3 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-xs font-semibold text-primary hover:bg-surface-high transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="w-2/3 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Verifying with Smile ID...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Verify &amp; Activate Tier 2</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 3: SUCCESS CELEBRATION ═══ */}
            {verifyStep === 3 && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-headline font-extrabold text-xl text-primary">Identity Verified Successfully!</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Your Smile ID facial biometrics and mobile OTP were approved. Your account is now upgraded to{' '}
                    <strong className="text-primary">Verified Tier 2 (MyMoney Plenty)</strong>.
                  </p>
                </div>

                {/* Unlocked Capabilities Summary */}
                <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant text-left space-y-2 text-xs">
                  <div className="font-bold text-primary text-[13px] border-b border-outline-variant/60 pb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">lock_open</span>
                    <span>Premium Fintech Features Unlocked:</span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Payday Auto-Billing:</strong> Automatic settlement of selected bills on salary inflow.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Expanded Bank Nodes:</strong> Connect up to 5 commercial and digital bank accounts.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>14% High-Yield Sweeps:</strong> Idle cash swept into 14% p.a. (per annum) high-yield accounts.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeVerification}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Return to Profile &amp; Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disconnect Card Modal */}
      {disconnectingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-md">
          <div className="bg-surface-lowest border border-outline-variant w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">credit_card_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-primary">Disconnect Card?</h3>
              <p className="text-xs text-on-surface-variant">
                Are you sure you want to disconnect this card? Any Payday bills assigned to this card will be paused.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDisconnectingCard(null)}
                className="w-1/2 py-2.5 rounded-xl border border-outline-variant bg-surface-low text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => removeCard(disconnectingCard)}
                className="w-1/2 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90"
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
