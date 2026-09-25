# Project Context & Agent Memory — MyMoney OS

**Product:** MyMoney OS (Sovereign Personal Financial Operating System)  
**Primary Repository:** `d:\DATA\MyMoney APP\MyMoney Webapp\mymoney`  
**Git Remote:** `https://github.com0xbullinfo-hue/MyMoney.git`  
**Default Branch:** `main`  
**Design Palette:** 05 Earthy Minimal  
**Last Updated:** 2026-09-25  

---

## 1. Project Identity & Core Mission

MyMoney OS is a sovereign financial operating system built specifically for multi-bank account holders, founders, and high-net-worth operators in Nigeria, Pan-Africa, and globally. It bridges open banking aggregation, autonomous payday cashflow distribution, cryptographic privacy, and system operator telemetry.

---

## 2. Key Environment & Configuration Memory

### 2.1 Essential Environment Variables (`.env.local`)
- `ENCRYPTION_KEY`: 64-character hexadecimal string representing a 256-bit (32-byte) key used by `src/lib/crypto.ts` for authenticated AES-256-GCM token encryption. Fails closed if missing or invalid.
- `OPENBANKING_WEBHOOK_SECRET`: Secret string (min. 32 characters) used by `src/lib/webhook-validator.ts` for constant-time HMAC-SHA256 signature verification.
- `OPENBANKING_WEBHOOK_SECRET_PREVIOUS`: Optional previous secret enabling zero-downtime secret rotation without dropping pending webhooks.
- `NEXTAUTH_SECRET`: Secret used for session generation.
- `NEXTAUTH_URL`: Canonical origin URL (e.g., `http://localhost:3000`).

### 2.2 Framework & Dependency Versions
- **Next.js:** `16.3.5` (App Router architecture)
- **React:** `19.2.8` (Concurrent rendering, actions, modern hooks)
- **Tailwind CSS:** `^4.0` (Configured via `@theme` tokens in `src/app/globals.css`)
- **Zustand:** `^5.0.15` (Client stores)
- **Recharts:** `^3.10.1` (Interactive visualizations)
- **Framer Motion:** `^13.4.0` (Animations)

---

## 3. Critical Architectural Decisions & Gotchas

### 3.1 Next.js 16 Async Route Parameters
- In Next.js 16, route parameters (`params` and `searchParams`) passed to page components are asynchronous promises. Always define them as `Promise<{ ... }>` and `await` them before access:
  ```typescript
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // ...
  }
  ```

### 3.2 Suspense Boundaries for Search Parameters
- Any client component invoking `useSearchParams()` must be wrapped in a `<Suspense>` boundary. Failing to do so causes Next.js to de-opt the entire page into client-side rendering during static generation. (See `src/app/(dashboard)/dashboard/ledger/page.tsx`).

### 3.3 Server-Only Isolation for Cryptographic Modules
- `src/lib/crypto.ts` and `src/lib/webhook-validator.ts` start with `import 'server-only'`. They must never be imported directly or transitively into client components (`'use client'`).

### 3.4 Strict Constant-Time Cryptographic Comparison
- HMAC signature checks and token validations must always use `crypto.timingSafeEqual()`. Never use `===` or standard string comparisons for security-sensitive hashes.

### 3.5 Webhook Replay Window & Tolerance
- Inbound webhooks must be verified with a 300-second timestamp tolerance window.
- In-memory event ID caching prevents duplicate processing within the tolerance window.

### 3.6 Stealth Mode Synchronization
- `use-stealth.ts` is hardened to broadcast changes via both `localStorage` and a custom `mm-stealth-change` DOM event. This ensures instant synchronization across open browser tabs and components without hydration flash.

### 3.7 Avoid `!important` in CSS Utilities
- In `src/app/globals.css`, never use `!important` in utility classes. Specificity from `!important` blocks Tailwind's pseudo-class variants (such as `hover:`, `focus:`, `active:`) from functioning.

### 3.8 Currency Formatting Guard
- The standard currency formatter in `src/lib/formatters.ts` (`formatCurrency`) automatically appends the `₦` symbol. Never manually prefix `₦` before calling `formatCurrency(val)` to avoid double currency symbols (`₦₦`).

---

## 4. Key File Map & Roles

| File Path | Role |
| :--- | :--- |
| `src/middleware.ts` | Edge route guard intercepting unauthenticated routes and injecting HTTP security headers |
| `src/app/globals.css` | Core 05 Earthy Minimal `@theme` definitions and clean utility classes |
| `src/lib/tailwind-tokens.ts` | Programmatic color tokens and chart color palettes |
| `src/lib/crypto.ts` | Server-only AES-256-GCM token encryption/decryption with AAD |
| `src/lib/webhook-validator.ts` | Constant-time HMAC-SHA256 validator with replay protection |
| `src/hooks/use-stealth.ts` | Hardened Zustand store for sovereign balance obfuscation |
| `src/types/index.ts` | Core domain type definitions (User, BankNode, Transaction, WebhookLog) |
| `src/types/payday.ts` | Payday domain contracts (BillerCatalogItem, BillRouteItem, PaydayInflowRule) |
| `src/app/(dashboard)/dashboard/payday/page.tsx` | Autonomous waterfall inflow orchestrator with 2FA OTP |
| `src/app/(dashboard)/dashboard/ledger/page.tsx` | Searchable transaction telemetry feed with CSV export |
| `src/app/(dashboard)/dashboard/intelligence/page.tsx` | Subscriptions radar, envelope budgeting, and debt payoff simulator |
| `src/app/(admin)/admin/health/page.tsx` | Dark-forest system health console for CBN & bank API telemetry |
| `src/app/(admin)/admin/users/page.tsx` | User governance & suspension controls |
| `src/app/(admin)/admin/audit/page.tsx` | Cryptographic webhook audit log |

---

## 5. Continuous Maintenance Mandate

> **OPERATING DIRECTIVE:** Each time the MyMoney project is improved, extended, patched, or refactored:
> 1. `prd.md` must be updated if product features, scopes, or requirements change.
> 2. `architecture.md` must be updated if system architecture, data models, routes, or security patterns change.
> 3. `rules.md` must be updated if engineering standards, conventions, or constraints evolve.
> 4. `design.md` must be updated if tokens, components, typography, or styling rules change.
> 5. `tasks.md` must be updated to track completed, active, and upcoming work.
> 6. `memory.md` must be updated to capture new learnings, gotchas, environment vars, or architectural context.
>
> All six files must be staged, committed, and pushed to git with the associated code improvements.
