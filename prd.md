# Product Requirements Document (PRD) — MyMoney

**Product Name:** MyMoney (Sovereign Personal Finance)  
**Version:** 1.0.0-PROD  
**Status:** Active Production / Continuously Maintained  
**Target Markets:** Nigeria, Pan-Africa & Global High-Net-Worth Sovereign Operators  
**Design Theme:** 05 Earthy Minimal  

---

## 1. Executive Summary & Vision

MyMoney is a sovereign personal financial platform engineered for multi-bank account holders, tech executives, founders, and high-earning operators. Unlike conventional consumer budgeting apps that rely on generic categorizations and passive tracking, MyMoney treats personal finance as an active financial control center:
- **Multi-Bank Telemetry & Node Orchestration:** Real-time visibility into all commercial, investment, and digital MFB accounts.
- **Autonomous Payday Routing Engine:** Automated rule-based distribution of incoming funds to utilities, telecoms, rent, investments, and statutory deductions (EMTL, VAT).
- **Active Subscription Defense:** Zombie subscription detection algorithms with 1-click cryptographic kill switches.
- **Sovereign Privacy Enclave:** Instant client-side Stealth Obfuscation Mode (`₦ •••,•••,•••.••`) and Global Emergency Card Freeze.
- **Institutional Telemetry & Audit:** Built-in system health diagnostics, CBN gateway latency tracking, and immutable webhook audit logs.

---

## 2. Target Personas & Use Cases

### Persona A: The Multi-Bank Professional (Chidi, 32, Tech Lead in Lagos)
- **Problem:** Holds accounts across GTBank, Stanbic IBTC, Zenith Bank, and Kuda. Faces manual reconciliation friction, surprise subscription debits, and unpredictable bank network downtime.
- **Solution:** Connects all accounts into MyMoney. Monitors real-time bank node latency, tracks aggregated net worth, and executes automated payday waterfall allocation upon salary receipt.

### Persona B: The Sovereign Founder / Executive (Amina, 41, Managing Director)
- **Problem:** Requires privacy when viewing financial numbers in public or open offices. Needs real-time cash runway calculations and instant freeze switches for debit cards.
- **Solution:** Utilizes Stealth Mode keyboard shortcut (`Ctrl+Shift+S`) or UI toggle to mask balances. Evaluates 12-month cash runway simulations with debt avalanche injection scenarios.

### Persona C: The System Operator / Compliance Auditor (Tunde, Head of Risk)
- **Problem:** Must ensure open banking connections comply with Central Bank of Nigeria (CBN) regulatory standards, prevent replay attacks, and monitor webhook delivery reliability.
- **Solution:** Accesses the Operator Infrastructure Console (`/admin/health` & `/admin/audit`) with HMAC-SHA256 signature verification audit logs and latency histograms.

---

## 3. Core Feature Modules & Functional Requirements

### 3.1 Public Marketing & Onboarding Portal (`/`)
- **Live Infrastructure Telemetry Bar:** Displays real-time ping latency and connectivity status for major Nigerian banking institutions (GTBank, Stanbic IBTC, Kuda MFB).
- **Interactive Cash Runway Engine:** Dual-slider model calculating runway months based on liquid cash reserves (₦0 – ₦100,000,000) and monthly burn rate (₦100,000 – ₦10,000,000). Includes annual subscription savings projections.
- **Sovereign Tier Matrix:** 
  - *Sovereign Free:* 2 Connected bank nodes, manual sync, standard budgeting, 100% on-device data.
  - *Sovereign Executive:* Unlimited nodes, autonomous payday routing, zombie subscription kill switch, stealth mode.
  - *Sovereign Enclave:* Hardware security key support, dedicated webhook ingress, custom CBN compliance feeds, zero-knowledge sync.
  - Annual billing toggle with real-time 20% discount recalculation.
- **3-Step Enclave Onboarding Wizard:**
  - Step 1: Identity & Credentials (email, password).
  - Step 2: Sovereign Tier Selection.
  - Step 3: Multi-Bank Node Authorization & Instant Provisioning.
- **Auth Guard Notice Banners:** Contextual alerts when unauthorized users are redirected from protected dashboard or admin routes.

### 3.2 Sovereign Executive Dashboard (`/dashboard`)
- **Executive Net Worth Module:**
  - Aggregated net worth across all active banking and investment nodes.
  - Real-time Recharts interactive donut visualization categorizing funds into Liquid Cash, Fixed Savings, Digital Credit, and Offshore/Investments.
- **Multi-Bank Node Grid:**
  - Node card per institution displaying category, masked account number, live balance, currency (NGN/USD), and sub-second latency badge.
  - Single-node and multi-node "Sync All Nodes" re-indexing triggers with visual loading telemetry.
- **Zombie Subscription Quick Radar:**
  - Identifies recurring debits with >30 days of user inactivity.
  - 1-click **Block/Kill Switch** triggering optimistic state updates and backend API suspension.
- **Debt Avalanche Summary Card:**
  - Visual indicator of current high-APR debt exposure and instant payoff projection.

### 3.3 Autonomous Payday Inflow Orchestrator (`/dashboard/payday`)
- **Waterfall Inflow Rules Engine:**
  - Configurable minimum inflow threshold (default ₦250,000) and narration keyword filters (`SALARY`, `DIVIDEND`, `CONSULTING`).
  - Execution mode switch: **Autonomous Execution** vs. **Manual Review & Approval**.
- **Comprehensive Biller Catalog:**
  - Pre-integrated categories: Electricity/DISCOs (IKEDC, EKEDC, AEDC), Telecom Data (MTN, Airtel, Glo), Housing & Rent, Living/Groceries, Wealth & Investment sweeps.
  - Direct bill addition with account identifier (Meter number, Smartcard ID, Phone number), target spending cap, and assigned funding debit card.
  - Inline bill editing modal with validation and instant route synchronization.
- **Statutory Nigerian Banking Deductions:**
  - Automated Electronic Money Transfer Levy (EMTL - ₦50 on transfers > ₦10,000).
  - Value Added Tax (VAT - 7.5% on bill processing fees).
- **Cryptographic OTP Two-Factor Authentication:**
  - Hardware-grade 6-digit OTP verification modal (`inputMode="numeric"`, `autoComplete="one-time-code"`).
  - 30-second cooldown timer on OTP resend requests to prevent SMS/push flooding.
- **Inflow Execution Logs & Recharge Token Vault:**
  - Historical settlement log with downloadable transaction receipts and meter recharge token display.

### 3.4 Financial Intelligence Suite (`/dashboard/intelligence`)
- **Subscription Radar:**
  - Recurring expense tracking with monthly burn recalculation.
  - Status indicators: `Active`, `Flagged Zombie`, `Blocked`.
  - Add and edit subscription modal with dynamic billing cycle toggles.
- **Envelope Zero-Based Budgeting:**
  - Category-based budget allocations (Operations, Growth, Subscriptions, Lifestyle, Transfers).
  - Dynamic spending progress bars with color-coded threshold warnings (>80% amber, >100% terracotta danger).
  - Inline category allocation modifier with instant total spend rebalancing.
- **Debt Payoff Simulator:**
  - Side-by-side strategy comparison: **Debt Avalanche** (Highest APR first) vs. **Debt Snowball** (Lowest Balance first).
  - Interactive monthly surplus cash injection slider (₦0 – ₦1,000,000/mo).
  - Real-time recalculation of total interest saved and debt-free date acceleration.

### 3.5 Transaction Telemetry Feed (`/dashboard/ledger`)
- **High-Throughput Ledger View:**
  - Comprehensive searchable ledger with instant substring filtering on merchant name, description, and institution.
  - Multi-category pill filters (Operations, Growth, Subscriptions, Lifestyle, Transfers).
  - Transaction type toggle (All, Debits only, Credits only).
- **Pagination & Export Capabilities:**
  - Clean client-side pagination with configurable page sizes.
  - Instant CSV Export formatting all filtered records with timestamps and currency codes.
- **Suspense Architecture:**
  - Wrapped with Next.js `<Suspense>` fallback boundary to guarantee smooth URL query parameter hydration without client-side bailout.

### 3.6 Bank Node Mesh Topology (`/dashboard/mesh`)
- Visual interactive node graph representing interconnected bank pipelines, API latency, health status, and live synchronization triggers.

### 3.7 Financial Wire / Intelligence (`/dashboard/news`)
- Curated CBN policy alerts, Monetary Policy Committee (MPC) rate announcements, treasury bill yield curves, and macroeconomic FX telemetry.

### 3.8 Profile & Security Enclave (`/dashboard/profile`)
- User tier identification and privilege elevation.
- Sovereign privacy toggles (Stealth Mode default state, Global Card Freeze).
- Cryptographic key metadata and session audit history.

### 3.9 Operator Infrastructure Monitoring (`/admin/health`, `/admin/users`, `/admin/audit`)
- **Health Dashboard (`/admin/health`):**
  - Dark-forest themed operator console.
  - Real-time status for Central Bank of Nigeria (CBN) Settlement Gateway, GTBank Core, Zenith API (HTTP 429 rate limit telemetry), and Kuda MFB Ingress.
  - Endpoint latency bar chart and queue depth counters.
- **User Governance (`/admin/users`):**
  - Account state inspection (tier, creation date, stealth status, card freeze).
  - 1-click **Suspend Account** / **Reactivate Account** controls with persistent API sync.
- **Webhook Audit Vault (`/admin/audit`):**
  - Full cryptographic audit log of inbound open banking webhooks.
  - HMAC signature verification status, latency breakdown, and payload inspection.

---

## 4. Non-Functional Requirements (NFRs)

| Category | Requirement | Specification |
| :--- | :--- | :--- |
| **Performance** | Page Load Time | Initial page render < 1.2s; subsequent client transitions < 150ms |
| **Performance** | Calculation Speed | Debt avalanche, runway, and budget recalculations < 16ms (60 FPS) |
| **Security** | At-Rest Encryption | Sensitive bank tokens encrypted with AES-256-GCM using 96-bit IV and context-bound AAD |
| **Security** | In-Transit Security | Constant-time HMAC-SHA256 signature verification with 300s timestamp tolerance |
| **Security** | Defense-in-Depth | Server-only module enforcement; HTTP security headers (`X-Frame-Options: DENY`, `nosniff`, CSP) |
| **Reliability** | Webhook Idempotency | In-memory + distributed cache replay attack deduplication window |
| **Usability** | Design Standard | 100% adherence to 05 Earthy Minimal design token system; zero generic browser styles |
| **Accessibility** | Visual Legibility | High contrast ratios meeting WCAG AA standards across all earthy color tokens |

---

## 5. Continuous Maintenance Mandate

> **CRITICAL RULE:** Whenever any feature, page, hook, utility, or architectural pattern in the MyMoney codebase is added, refactored, or improved, the six core documentation files (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`) must be systematically reviewed and updated to preserve single-source-of-truth alignment.
