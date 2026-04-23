# 26Q2-fast-activation

BitGo fast-activation prototype — React + Vite app.

## Stack

- React 19, TypeScript, Vite
- Plain CSS with design tokens (`src/styles/tokens.css`)
- No Tailwind yet (to be added)

## File map

| Path | What it is |
|---|---|
| `src/pages/Dashboard.tsx` | Main dashboard page |
| `src/pages/WalletDetailPage.tsx` | Wallet detail view |
| `src/flows/WalletCreationFlow.tsx` | Create wallet modal flow |
| `src/flows/WalkthroughStepper.tsx` | In-context walkthrough stepper |
| `src/components/` | Shared UI: Sidebar, Topbar, GetStarted, ForYou, Balances, Portfolio, TradeCard, Snackbar |
| `src/hooks/useGetStarted.ts` | Get Started task state |
| `src/hooks/useTheme.ts` | Light/dark theme toggle |
| `src/types/index.ts` | Shared types, constants, trade pairs, walkthrough definitions |
| `src/styles/globals.css` | Global styles |
| `src/styles/tokens.css` | CSS custom properties (design tokens) |
| `archive/` | Original HTML prototypes — reference only, do not edit |

## How to run

```bash
npm install
npm run dev
```

## How to work on this with Claude Code

- **Change a component**: tell Claude which file + which screen/state
- **Add a new flow**: add a new file under `src/flows/` and wire it up in `App.tsx`
- **Add a new page**: add under `src/pages/` and add routing in `App.tsx`

## Flows still to migrate (KYB + KYC)

The `archive/` folder has the original HTML prototypes for reference:
- `archive/bitgo-KYB.html` — business/entity verification flow
- `archive/bitgo-kyc.html` — individual user verification flow
- `archive/bitgo-dashboard.html` — earlier HTML version of the dashboard (already migrated)

KYB and KYC need to be built as React components under `src/flows/`.

## GitHub repo

Private repo at: `https://github.com/phyllisfei-bg/26Q2-fast-activation`

After making changes: `git add -A && git commit -m "..." && git push`

## Design tokens (dark-mode aware)

CSS custom properties in `src/styles/tokens.css`:
- `--color-primary` `--color-level1/2` `--color-text` `--color-border`
- Theme toggle wired via `useTheme` hook, toggled from `Topbar`
