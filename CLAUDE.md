# 26Q2-fast-activation

BitGo Fast Activation prototype — React + Vite app for the Q2 2026 initiative to accelerate time-to-value for new BitGo customers. Covers compliance verification (KYB/KYC), onboarding dashboard, and security management (whitelist destinations).

## Project context

Fast Activation (FA) gets businesses and their users through compliance verification and into their first meaningful platform actions as quickly as possible. Three sequential stages:
1. **KYB** — entity-level compliance (business verification)
2. **KYC** — individual user verification + goal setting
3. **Dashboard** — role-based getting-started experience with priority actions

The **Destinations** page is a standalone security feature for managing whitelisted addresses.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v3 (inline PostCSS via `vite.config.ts`)
- CSS design tokens (`src/styles/tokens.css`) — dark/light mode aware
- Hash-based routing (no React Router) via `window.location.hash`

## Routing

| Hash | Page |
|---|---|
| `#flow` | Flow overview — flowchart of all stages |
| *(none)* | Dashboard |
| `#kyb` | KYB — business verification flow |
| `#kyc` | KYC — individual user verification flow |
| `#destinations` | Whitelist Destinations |

## File map

| Path | What it is |
|---|---|
| `src/App.tsx` | Root — hash routing, global state, modal orchestration |
| `src/pages/FlowPage.tsx` | Flowchart overview linking all stages |
| `src/pages/Dashboard.tsx` | Main dashboard (Get Started, ForYou, Balances, Portfolio) |
| `src/pages/WalletDetailPage.tsx` | Wallet detail view (slide-in panel) |
| `src/pages/DestinationsPage.tsx` | Whitelist destinations with consolidation flow |
| `src/flows/KYBFlow.tsx` | Business / entity verification (multi-step) |
| `src/flows/KYCFlow.tsx` | Individual user verification |
| `src/flows/WalletCreationFlow.tsx` | Create wallet modal |
| `src/flows/DepositModal.tsx` | Deposit flow (cash + crypto tabs) |
| `src/flows/PolicyModal.tsx` | Policy builder modal |
| `src/flows/WalkthroughStepper.tsx` | In-context walkthrough stepper |
| `src/components/Sidebar.tsx` | Left nav with security submenu |
| `src/components/Topbar.tsx` | Top bar with theme toggle |
| `src/components/GetStarted.tsx` | Onboarding task list |
| `src/components/ForYou.tsx` | Horizontal-scroll recommendation cards |
| `src/components/Balances.tsx` | Balance summary |
| `src/components/Portfolio.tsx` | Portfolio chart |
| `src/components/TradeCard.tsx` | Trade / Go Account panel |
| `src/components/Snackbar.tsx` | Toast notification (imperative via ref) |
| `src/hooks/useGetStarted.ts` | Get Started task state |
| `src/hooks/useTheme.ts` | Light/dark theme toggle |
| `src/types/index.ts` | Shared types, constants, trade pairs, walkthrough definitions |
| `src/styles/globals.css` | Global styles + dest-row animations |
| `src/styles/tokens.css` | CSS custom properties (design tokens) |
| `archive/` | Original HTML prototypes — reference only, do not edit |

## How to run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## How to work on this with Claude Code

- **Change a component**: tell Claude which file + which screen/state
- **Add a new flow**: add a new file under `src/flows/` and wire it up in `App.tsx`
- **Add a new page**: add under `src/pages/`, add hash case to `getTopPage()` in `App.tsx`
- **Styling**: use Tailwind utility classes in JSX; use `var(--token)` for design tokens; avoid new CSS classes unless for animations

## GitHub + deployment

- Repo: `https://github.com/phyllisfei-bg/26Q2-fast-activation`
- Live: `https://phyllisfei-bg.github.io/26Q2-fast-activation/`
- Deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`
- After making changes: `git add -A && git commit -m "..." && git push`

## Design tokens (dark-mode aware)

CSS custom properties in `src/styles/tokens.css`:
- `--color-primary` `--color-level1/2/3/4` `--color-text` `--color-text-secondary` `--color-text-muted` `--color-border` `--color-border-strong`
- `--brand-500` `--brand-700` `--brand-a100` `--brand-a200`
- Theme toggle wired via `useTheme` hook, toggled from `Topbar`
