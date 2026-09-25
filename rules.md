# Engineering & Coding Rules — MyMoney OS

**Product:** MyMoney OS (Sovereign Personal Financial Operating System)  
**Applicability:** All contributors, automated agents, and pair programmers  
**Status:** Mandatory & Strictly Enforced  

---

## 1. The Cardinal Rule: Continuous Documentation Synchronization

> **MANDATE:** Each time the project is improved, refactored, extended, or patched, the **six core documentation files** MUST be updated in the same changeset before pushing to git:
> 1. `prd.md` — Product requirements, feature specs, and business requirements.
> 2. `architecture.md` — Technical architecture, system diagrams, data flow, and directory structure.
> 3. `rules.md` — Coding rules, conventions, and engineering constraints (this document).
> 4. `design.md` — UI/UX direction, color palette, design tokens, and typography.
> 5. `tasks.md` — Task progress, completed milestones, active work, and roadmap.
> 6. `memory.md` — Project context, key learnings, gotchas, and architectural memory.
>
> **Never commit code changes that alter application behavior without updating the corresponding documentation.**

---

## 2. TypeScript & Type Safety Standards

- **Zero `any` Policy:** Explicit typing is required everywhere. Use `unknown` with runtime type narrowing if the type is indeterminate.
- **Single Source of Truth for Types:**
  - Common domain entities (User, BankNode, Transaction, SubscriptionItem, EnvelopeBudget) reside in `src/types/index.ts`.
  - Feature-specific models (Payday, BillerCatalog, InflowExecutionLog) reside in `src/types/<feature>.ts`.
- **Strict Compiler Compliance:**
  - All code must pass `npx tsc --noEmit` with zero errors.
  - Do not use `@ts-ignore` or `@ts-nocheck`. If an external library lacks typings, write a declaration in `src/types/`.

---

## 3. Next.js 16 & React 19 Architectural Conventions

- **Server vs. Client Component Boundaries:**
  - Default to Server Components unless client state, event handlers (`onClick`, `onChange`), browser APIs (`window`, `localStorage`), or hooks are required.
  - When `'use client'` is needed, add the directive as the very first line of the file.
- **Async Route Parameters (Next.js 16 Convention):**
  - Next.js 16 treats `params` and `searchParams` in Page/Layout props as Promises. Always `await` them:
    ```typescript
    // Correct
    export default async function Page({ params }: { params: Promise<{ id: string }> }) {
      const { id } = await params;
      // ...
    }
    ```
- **Suspense Boundaries for Search Parameters:**
  - Any client component using `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary to prevent de-optimizing the entire page to client-side rendering during build time.
- **Form Actions & Transitions:**
  - Leverage React 19 hooks (`useActionState`, `useOptimistic`, `useTransition`) for stateful mutations and asynchronous submissions.

---

## 4. Cryptographic & Security Rules

- **Server-Only Isolation:**
  - Any file handling secret keys, HMAC verification, or token encryption (`src/lib/crypto.ts`, `src/lib/webhook-validator.ts`) MUST include `import 'server-only'` at the top. This triggers a build failure if accidentally imported by a client component.
- **Symmetric Encryption Standards:**
  - Always use `aes-256-gcm`.
  - Always use a 96-bit (12-byte) cryptographically secure random IV generated via `crypto.randomBytes(12)`.
  - Always verify a 128-bit (16-byte) authentication tag.
  - Always bind ciphertext to context using Additional Authenticated Data (`aad`) (e.g., `${userId}:${connectionId}`).
  - **Never** use ECB or CBC modes. **Never** reuse an IV.
- **Signature & Secret Verification:**
  - Always use `crypto.timingSafeEqual` for comparing HMAC signatures and hashes to prevent timing attacks.
  - Require strict Unix timestamp verification with a maximum 300-second window to prevent replay attacks.
  - Check both current and previous webhook secrets to enable zero-downtime secret rotation.
- **Random Number Generation:**
  - **NEVER** use `Math.random()` for tokens, keys, IDs, or security-sensitive values. Use `crypto.randomUUID()` or `crypto.randomBytes()`.

---

## 5. UI/UX & Design Token Rules

- **Strict Adherence to "05 Earthy Minimal":**
  - Use the established palette:
    - Primary: `#2E3A2F` (Forest Green)
    - Primary Container: `#3C4B3D`
    - Secondary: `#6B7F5B` (Sage Green)
    - Secondary Fixed: `#8EA27E` (Sage Highlight)
    - Tertiary: `#D9C9B2` / `#EFE6D8` (Sand / Linen)
    - Accent: `#C96F4F` (Terracotta Clay)
    - Surface: `#F8F6EE` (Warm Alabaster Canvas)
    - Surface Lowest: `#FFFFFF` (Card Container)
- **No Raw Un-themed Hex Colors:**
  - Avoid arbitrary ad-hoc colors. Use Tailwind semantic classes (`bg-primary`, `text-secondary`, `border-outline`, `bg-accent`) or import `tokens` from `src/lib/tailwind-tokens.ts`.
- **No `!important` in CSS Overrides:**
  - Never use `!important` in `src/app/globals.css` utilities. Overriding with `!important` destroys Tailwind variant modifiers (e.g. `hover:bg-primary-container`, `focus:border-primary`).
- **Monospace Financial Figures:**
  - All currency figures, account masks, transaction hashes, and telemetry metrics MUST use monospace font styling (`font-mono`) for precision alignment.
- **Stealth Mode Consistency:**
  - Any component rendering balances or monetary values must support Stealth Mode masking (`₦ •••,•••,•••.••`) via `useStealthStore()`.

---

## 6. API Route & Backend Engineering Standards

- **Standardized Response Envelope:**
  - All Next.js Route Handlers (`src/app/api/...`) must return consistent JSON structures:
    ```typescript
    // Success
    return NextResponse.json({ success: true, data: result }, { status: 200 });

    // Error
    return NextResponse.json({ success: false, error: 'Descriptive message' }, { status: 400 });
    ```
- **Idempotency & Replay Defense:**
  - Inbound webhook endpoints must check and record `eventId` with TTL in cache before executing financial state mutations.
- **HTTP Status Codes:**
  - Use semantic status codes: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `429` Rate Limited, `500` Internal Server Error.

---

## 7. Quality Assurance & Pre-Push Checklist

Before pushing any commit or branch to Git, execute this verification sequence:

```bash
# 1. Verify TypeScript compiles cleanly with zero errors
npx tsc --noEmit

# 2. Verify ESLint passes
npm run lint

# 3. Verify Next.js production build succeeds
npm run build

# 4. Confirm the 6 documentation files are updated:
#    - prd.md
#    - architecture.md
#    - rules.md
#    - design.md
#    - tasks.md
#    - memory.md

# 5. Commit with conventional commit format
git add .
git commit -m "feat/fix/docs: descriptive message"
git push origin <branch>
```
