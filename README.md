# BitGo Fast Activation — 26Q2 Prototype

A React prototype exploring a streamlined onboarding and activation experience for new BitGo customers.

---

## Project Goal

Fast Activation (FA) is a Q2 2026 initiative to accelerate time-to-value for new BitGo customers. The goal is to get businesses and their users through compliance verification and into their first meaningful platform actions as quickly as possible — reducing drop-off, shortening onboarding time, and delivering a role-appropriate experience from day one.

---

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v3 (inline PostCSS config)
- CSS design tokens (`src/styles/tokens.css`) with dark/light mode support

---

## How to run

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
| `/` | Dashboard | Getting started tasks, For You recommendations, portfolio, balances |
| `/#kyb` | KYB Flow | Business / entity verification (multi-step) |
| `/#kyc` | KYC Flow | Individual user verification |
| `/#destinations` | Whitelist Destinations | Address allowlist with label consolidation flow |

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
| `src/pages/DestinationsPage.tsx` | Whitelist destinations with consolidation flow |
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

Built on the Kintsugi design system with full dark/light mode support. Theme toggle is available in the topbar.
