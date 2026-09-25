# UI/UX Direction & Design System — MyMoney OS

**Design System:** 05 Earthy Minimal  
**Aesthetic Persona:** Sovereign Financial Editorial & Tactical Enclave  
**Target Atmosphere:** Warm, Organic, Understated Elegance with Surgical Fintech Precision  
**Version:** 1.0.0-PROD  

---

## 1. Design Philosophy: "05 Earthy Minimal"

Traditional consumer fintech apps rely on cold corporate blues, neon purples, and aggressive high-friction gamification. **MyMoney OS rejects this entirely.**

Instead, MyMoney OS is built around **05 Earthy Minimal**:
- **Organic Sovereign Dignity:** Deep forest greens, warm desert sands, and terracotta clay inspired by geological resilience and sovereign stewardship.
- **Tactile Materiality:** Parchment-like alabaster canvases, crisp white elevated cards, and delicate warm-sand hairline borders that feel like premium physical stationery.
- **Surgical Precision:** Strict monospace typography for numbers, sub-second telemetry pings, and clear cryptographic status indicators.
- **Quiet Authority:** No loud gradient gimmicks; elegance is communicated through intentional typography hierarchy, generous white space, and subtle micro-animations.

---

## 2. Color Palette & Token System

### 2.1 Core Palette Swatches

| Token Name | Hex Code | HSL Equivalent | Semantic Role |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#2E3A2F` | `hsl(127, 11%, 21%)` | Deep Forest Green — Primary headings, primary action buttons, active navigation states |
| **`primary-container`** | `#3C4B3D` | `hsl(125, 11%, 27%)` | Deep Pine — Hover states for primary buttons, highlighted active segments |
| **`primary-dark`** | `#1B241C` | `hsl(128, 14%, 12%)` | Nocturnal Forest — Dark-forest admin cockpit backgrounds, ultra-dark text |
| **`secondary`** | `#6B7F5B` | `hsl(93, 17%, 43%)` | Muted Sage — Positive delta figures (+₦), success status badges, secondary accents |
| **`secondary-fixed`** | `#8EA27E` | `hsl(94, 18%, 56%)` | Sage Highlight — Telemetry pulse dots, active pipeline indicators |
| **`tertiary`** | `#D9C9B2` | `hsl(35, 34%, 78%)` | Warm Sand — Hairline borders, inactive toggle tracks, subtle dividers |
| **`tertiary-container`** | `#EFE6D8` | `hsl(36, 42%, 89%)` | Linen Beige — Pill tag backgrounds, segment switch containers, subtle chips |
| **`accent`** | `#C96F4F` | `hsl(16, 52%, 55%)` | Terracotta Clay — Emergency card freeze, zombie subscription kill switches, warnings |
| **`surface`** | `#F8F6EE` | `hsl(48, 43%, 95%)` | Warm Alabaster — App-wide page canvas, marketing section backgrounds |
| **`surface-lowest`** | `#FFFFFF` | `hsl(0, 0%, 100%)` | Pure White — Elevated card containers, modal dialogues, input fields |
| **`surface-low`** | `#F0EDE4` | `hsl(43, 27%, 92%)` | Pale Sand — Table alternate row stripes, disabled element fills |
| **`surface-high`** | `#E3DDD0` | `hsl(40, 24%, 85%)` | Warm Cream Stone — Hover states on secondary control surfaces |
| **`on-surface`** | `#2E3A2F` | `hsl(127, 11%, 21%)` | Primary Text — High-contrast readable typography on light surfaces |
| **`on-surface-variant`**| `#5E695B` | `hsl(107, 7%, 39%)` | Secondary Text — Supporting labels, metadata timestamps, descriptions |

---

## 3. Typography Hierarchy

### 3.1 Font Families
- **Editorial Headings & UI:** `Inter`, `Space Grotesk`, or `Outfit`
  - Clean geometric sans-serif delivering high legibility and contemporary confidence.
- **Financial & Telemetry Monospace:** `JetBrains Mono` or `Space Mono`
  - **MANDATORY** for all account balances, currency values (`₦`), percentages, transaction IDs, latency meters (`ms`), and timestamps.
  - Ensures tabular alignment without jitter when numbers recalculate dynamically.

### 3.2 Type Scale

| Role | Font Family | Size | Weight | Line Height | Usage Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | Sans | `2.5rem - 3.5rem` | 800 (Extrabold) | 1.1 | Landing page value proposition |
| **Page Title** | Sans | `1.75rem - 2.0rem` | 700 (Bold) | 1.2 | Dashboard / Suite header titles |
| **Card Header** | Sans | `1.125rem - 1.25rem`| 600 (Semibold) | 1.3 | Module headers (Multi-Bank Node Grid) |
| **Primary Metric** | Mono | `1.875rem - 2.5rem` | 700 (Bold) | 1.2 | Net Worth: `₦ 48,250,000.00` |
| **Body Text** | Sans | `0.875rem - 1.0rem` | 400 (Regular) | 1.5 | Explanatory descriptions, helper text |
| **Micro Monospace**| Mono | `0.75rem - 0.8125rem`| 500 (Medium) | 1.4 | Latency badge: `42ms`, OTP: `849210` |

---

## 4. Component Design Patterns

### 4.1 Sovereign Metric Cards
- **Container:** Pure white (`bg-surface-lowest`) with `border border-outline/30` and `rounded-2xl`.
- **Elevation:** Subtle diffuse shadow (`shadow-[0_4px_20px_-4px_rgba(46,58,47,0.06)]`).
- **Header:** Uppercase tracking label (`text-xs font-mono tracking-wider text-on-surface-variant`).
- **Amount Display:** Monospace primary color (`font-mono text-3xl font-bold text-primary`).

### 4.2 Multi-Bank Node Grid
- Each bank node displays:
  - Bank brand badge with custom institutional hue (GTBank Orange, Stanbic Blue, Kuda Purple, Zenith Red).
  - Masked account number: `•••• 4920`.
  - Latency indicator: Pulsing green dot for `< 100ms`, amber for `100–300ms`, terracotta for degraded.
  - Quick action: Inline sync button with rotate animation during fetch.

### 4.3 Client-Side Stealth Obfuscation Mode
- When enabled via `useStealthStore`:
  - Balances transform to: `₦ •••,•••,•••.••`
  - Account masks transform to: `•••• ••••`
  - Retains full layout width to avoid layout shift (CLS).
  - Instant transition with smooth fade.

### 4.4 Zombie Subscription Kill Switch
- Subscriptions flagged with >30 days inactivity display a dedicated warning chip.
- Action: Terracotta Clay pill button (`bg-accent text-white hover:bg-accent/90 transition-all font-mono text-xs px-3 py-1.5 rounded-lg`).
- Triggers instant strike-through styling, optimistic state persistence, and backend revocation.

### 4.5 Dual-Slider Runway Engine
- Styled slider tracks using `accent-primary` or custom CSS thumb styled like a sovereign seal.
- Dynamic numerical badge floating above thumbs showing computed months of survival.

### 4.6 Operator Cockpit Palette Inversion (`/admin/*`)
- The admin suite uses an inverted **Nocturnal Forest** palette:
  - Background: `#1B241C` (Primary Dark).
  - Card Container: `#243025` with `#3C4B3D` borders.
  - Accent Telemetry: Glowing sage `#8EA27E` and alert amber/terracotta `#C96F4F`.

---

## 5. Micro-Animations & Interactions

- **Hover States:** All interactive cards subtle lift on hover (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`).
- **Button Feedback:** Active scale down (`active:scale-[0.98] transition-transform`).
- **Modal Backdrops:** Frosted glass blur (`backdrop-blur-md bg-primary-dark/40`).
- **Chart Tooltips:** White pill container with warm sand border and monospace figure breakdown.

---

## 6. Accessibility & Legibility Standard

- **Contrast:** Every text-to-background pairing strictly satisfies **WCAG 2.1 AA** (minimum 4.5:1 for body text, 3:1 for large display text).
- **Focus Rings:** Custom accessible focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
- **Input Usability:** Numeric inputs for OTP and financial figures specify `inputMode="numeric"` and `autoComplete="one-time-code"` for effortless mobile interaction.

---

## 7. Continuous Maintenance Mandate

> **CRITICAL DESIGN RULE:** Any introduction of new UI components, modal flows, chart visualizations, or color adjustments must adhere to the 05 Earthy Minimal design system and be cataloged in `design.md`.
