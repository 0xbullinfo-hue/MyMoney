# MyMoney OS — Sovereign Personal Financial Operating System

An enterprise-ready personal finance and open banking web application built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, designed using the warm, sophisticated **05 Earthy Minimal** design token system.

---

## 🌿 Earthy Minimal Color Palette

- **Primary (`#2E3A2F`)**: Deep Forest Green for primary navigation, headings, buttons, and net worth overview.
- **Secondary (`#6B7F5B`)**: Sage Green for positive velocity figures, status indicators, and secondary badges.
- **Secondary Fixed (`#8EA27E`)**: Sage Highlight for pulse indicators and telemetry figures.
- **Tertiary (`#D9C9B2` / `#EFE6D8`)**: Warm Sand & Linen Beige for control backgrounds and segment pills.
- **Accent (`#C96F4F`)**: Terracotta Clay for Emergency Freeze buttons, zombie subscription kill switches, and alerts.
- **Background (`#F8F6EE`)**: Warm Off-White / Alabaster app-wide canvas.
- **Container Lowest (`#FFFFFF`)**: Elevated white cards with subtle elevation shadows and warm sand borders.

---

## 🏛️ Core Features

1. **Public Marketing Portal (`/`)**
   - Live telemetry node display with sub-second ping metrics (GTBank, Stanbic, Kuda).
   - Dynamic Cash Runway Engine with live dual-slider calculations.
   - Sovereign Tier Matrix (Free, Premium, Premium+) with 20% annual discount toggle.
   - 3-step enclave onboarding wizard.

2. **ALL MY MONEY — Sovereign Executive OS (`/dashboard`)**
   - Executive Net Worth breakdown with Recharts donut visualization.
   - **My Money** Multi-Bank Node Grid with latency indicators and re-index simulation.
   - Zombie Subscription Hunter with instant **Kill-Switch**.
   - Debt Avalanche Simulator with interactive principal injection slider.

3. **Financial Intelligence Suite (`/dashboard/intelligence`)**
   - **Subscription Radar**: View, add, and edit recurring subscriptions with live monthly burn recalculation.
   - **Envelope Budgeting**: View, add, and edit category allocations and actual spend with real-time bar chart re-renders.
   - **Debt Payoff Simulator**: Add and edit loans with Avalanche / Snowball strategies and live interest/time saved calculations.

4. **Transaction Telemetry Feed (`/dashboard/ledger`)**
   - Searchable and filterable transaction ledger with CSV export.

5. **System Operator Telemetry (`/admin/health`)**
   - Dark-forest themed infrastructure monitoring with real-time endpoint status (CBN Gateway, GTBank, Zenith HTTP 429, Kuda).
   - Latency comparison bar chart and live webhook audit logs.

6. **Cryptographic Security**
   - Server-side **AES-256-GCM** encryption and decryption for OAuth tokens (`lib/crypto.ts`).
   - Central Bank of Nigeria (CBN) compliant **HMAC SHA-256** webhook signature validation.
   - Client-side **Stealth Obfuscation Mode** (`₦ •••,•••,•••.••`) and Emergency Card Freeze.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or pnpm

### Installation

```bash
git clone https://github.com/0xbullinfo-hue/MyMoney.git
cd MyMoney
npm install
```

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm run start
```

---

## 📜 License
Private & Proprietary — MyMoney OS Technologies Ltd.
