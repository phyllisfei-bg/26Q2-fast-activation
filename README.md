# BitGo Fast Activation — 26Q2 Prototype

A React prototype for the Q2 2026 Fast Activation initiative.

---

## Project Context

Fast Activation (FA) gets businesses and their users through compliance verification and into their first meaningful platform actions as quickly as possible. The prototype covers three sequential stages:

1. **KYB** — entity-level compliance (business verification)
2. **KYC** — individual user verification + goal setting
3. **Dashboard** — role-based getting-started experience with priority actions

---

## Project Goal

- **Bring more users in as early as possible** — reduce friction in the onboarding funnel so users reach the platform faster
- **Encourage first deposit as soon as we can** — surface deposit entry points early and prominently; every workflow should create a natural path to funding
- **Help users complete first-class actions more easily** — wallet creation, trading, and policy setup should feel guided and achievable, not intimidating
- **Educate users about our products** — use callouts, For You recommendations, and contextual nudges to help users discover features relevant to their goals

---

## Design Goals

- **Reduce time-to-value** — get users to their first meaningful action (wallet creation, trading, staking) as fast as possible after signup
- **Role-appropriate experience** — surface the right priorities per user type from day one; avoid overwhelming new users with everything at once
- **Progressive disclosure** — show complexity only when needed; walkthrough stepper and callouts reveal guidance in-context
- **Trust through clarity** — compliance flows (KYB/KYC) should feel structured and credible, not bureaucratic; every step has a clear purpose
- **Consistency with BitGo platform** — built on the Kintsugi design system with full dark/light mode support

---

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v3 (inline PostCSS config)
- CSS design tokens (`src/styles/tokens.css`) with dark/light mode support

---

## Live demo

| Page | URL |
|---|---|
| Flow Overview | [phyllisfei-bg.github.io/26Q2-fast-activation/#flow](https://phyllisfei-bg.github.io/26Q2-fast-activation/#flow) |
| KYB Flow | [phyllisfei-bg.github.io/26Q2-fast-activation/#kyb](https://phyllisfei-bg.github.io/26Q2-fast-activation/#kyb) |
| KYC Flow | [phyllisfei-bg.github.io/26Q2-fast-activation/#kyc](https://phyllisfei-bg.github.io/26Q2-fast-activation/#kyc) |
| Dashboard | [phyllisfei-bg.github.io/26Q2-fast-activation/](https://phyllisfei-bg.github.io/26Q2-fast-activation/) |

---

## How to run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Pages & Flows

### Pages

| Route | Page | Description |
|---|---|---|
| `/#flow` | Flow Overview | Flowchart linking all stages of the activation journey |
| `/#kyb` | KYB Flow | Business / entity verification (multi-step) |
| `/#kyc` | KYC Flow | Individual user verification |
| `/` | Dashboard | Getting started tasks, For You recommendations, portfolio, balances |

### Flows (launched from Dashboard)

| Flow | Trigger | Description |
|---|---|---|
| Wallet Creation | Get Started → Create Wallet | Multi-step wallet setup |
| Deposit | Deposit button | Cash or crypto deposit |
| Policy Builder | Get Started → Configure Policy | Policy creation flow |
| Walkthrough Stepper | In-context | Guided walkthrough overlay |

---

## File Map

| Path | Description |
|---|---|
| `src/pages/Dashboard.tsx` | Main dashboard |
| `src/pages/WalletDetailPage.tsx` | Wallet detail view |
| `src/flows/KYBFlow.tsx` | Business verification flow |
| `src/flows/KYCFlow.tsx` | Individual user verification flow |
| `src/flows/WalletCreationFlow.tsx` | Create wallet modal |
| `src/flows/DepositModal.tsx` | Deposit flow modal |
| `src/flows/PolicyModal.tsx` | Policy builder modal |
| `src/flows/WalkthroughStepper.tsx` | In-context walkthrough stepper |
| `src/components/` | Sidebar, Topbar, GetStarted, ForYou, Balances, Portfolio, TradeCard, Snackbar |
| `src/styles/tokens.css` | CSS custom properties (design tokens) |
| `src/styles/globals.css` | Global styles and animations |
| `archive/` | Original HTML prototypes — reference only |

---

## Design

Built with Kintsugi-inspired design tokens (colors, spacing, typography) with full dark/light mode support. Theme toggle is available in the topbar.

> **Note:** This prototype does not use Storybook components and does not directly reflect the Kintsugi design system. UI components are custom-built for prototyping speed and may deviate from production component specs.

---

## Out of scope — Whitelist Destinations

> This prototype is included in the same repo but is outside the Fast Activation project scope.

**What it is:** A security management feature for whitelisting withdrawal addresses — includes address allowlist, scope management, label consolidation flow, and approval workflows.

| Route | URL |
|---|---|
| `/#destinations` | [phyllisfei-bg.github.io/26Q2-fast-activation/#destinations](https://phyllisfei-bg.github.io/26Q2-fast-activation/#destinations) |

Source: `src/pages/DestinationsPage.tsx`
