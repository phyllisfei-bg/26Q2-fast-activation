# 26Q2-fast-activation

BitGo Fast Activation prototype — React + Vite app for the Q2 2026 initiative to accelerate time-to-value for new BitGo customers.

## Project context

Fast Activation (FA) gets businesses and their users through compliance verification and into their first meaningful platform actions as quickly as possible. Three sequential stages:
1. **KYB** — entity-level compliance (business verification)
2. **KYC** — individual user verification + goal setting
3. **Dashboard** — role-based getting-started experience with priority actions

## Project goal

- **Bring more users in as early as possible** — reduce friction in the onboarding funnel so users reach the platform faster
- **Encourage first deposit as soon as we can** — surface deposit entry points early and prominently; every workflow should create a natural path to funding
- **Help users complete first-class actions more easily** — wallet creation, trading, and policy setup should feel guided and achievable, not intimidating
- **Educate users about our products** — use callouts, For You recommendations, and contextual nudges to help users discover features relevant to their goals

## Design goals

- **Reduce time-to-value** — get users to their first meaningful action (wallet creation, trading, staking) as fast as possible after signup
- **Role-appropriate experience** — surface the right priorities per user type from day one; avoid overwhelming new users with everything at once
- **Progressive disclosure** — show complexity only when needed (e.g. walkthrough stepper reveals steps in-context)
- **Trust through clarity** — compliance flows (KYB/KYC) should feel structured and credible, not bureaucratic; every step has clear purpose
- **Consistency with BitGo platform** — uses Kintsugi design system tokens; dark/light mode parity throughout

## UX considerations

### General
- All flows support light and dark mode via CSS tokens — never hardcode colors, always use `var(--token)`
- Destructive or irreversible actions use confirmation patterns or animations that signal finality
- Empty states, loading states, and error states should always be handled — no raw spinners or blank panels

### Dashboard — Getting Started → Callouts → For You progression

The dashboard has a linear progression: action completion unlocks callouts, and completing all actions unlocks the full set of For You cards.

**Get Started actions** (`src/hooks/useGetStarted.ts`, `src/types/index.ts`):

Actions are role-based — the action set is computed from the user's assigned role(s) and enterprise state. See [`get-started-aggregation-spec.md`](./get-started-aggregation-spec.md) for the full aggregation algorithm.

The sample below reflects the **sales-led super user (Platform Admin)** scenario — the fixed 3-action set used in the prototype:

| Action ID | Action | Completes when |
|---|---|---|
| `fundGoAccount` | Fund Go Account | Deposit confirmed → `markDone('fundGoAccount')` |
| `firstTrade` | Make First Trade | User completes a trade in `TradeCard` → `markDone('firstTrade')` |
| `createWallet` | Create First Wallet | `WalletCreationFlow` completes → `markDone('createWallet')` |

**Get Started completed state:**
- Each completed action: "Start" button replaced by a "Complete" badge with a checkmark; card remains visible in place
- When `allDone === true`: card title changes to "Setup Complete", subtitle reads "All essentials are active — your enterprise is ready to go.", and a dismiss (×) button appears in the header

**Callout triggers — two scenarios:**

1. **Initiated from Get Started** — user clicks an action CTA, completes the workflow, and lands on a new surface (e.g. wallet detail page). Callouts fire contextually to educate them about what they can do next on that surface.
   - Example: `createWallet` → `WalletCreationFlow` completes → wallet detail panel opens + snackbar "Wallet created." → user dismisses snackbar → `walletCalloutReady = true` → 3-step callout tour starts on the wallet detail page (Deposit → Invite → Policies)

2. **First visit to a new page** — when a user lands on a feature page for the first time, callouts appear to explain the key functions available, even outside of a Get Started flow.

**Callout behaviour:**
- Anchored to specific UI elements (portal-rendered, float over the UI)
- Each callout is dismissed individually
- Sequence is linear — next callout appears after the current one is dismissed
- Never block the underlying UI; user can always interact around them

**For You section** (`src/pages/Dashboard.tsx`):
- `<ForYou />` is always visible — it does not wait for Get Started to be complete
- Before completion, shows a maximum of 3 cards; once `allDone === true`, the full set is shown
- Card content and ordering are calculated based on the user's role(s) and BitGo product interest — detailed logic spec coming soon
- Cards are horizontally scrollable, dismissible individually, and limited to 3 visible + 1 peeking
- Once all actions are done, Get Started collapses and For You expands to its full set

**Snackbar** is used throughout for non-blocking confirmations — wallet created, order placed, deposit confirmed, policies published. Never blocking modals.

### KYB / KYC flows
- Multi-step flows show progress and allow back-navigation; users should never feel stuck
- Form fields validate inline where possible; submission errors appear inline, not as page-level alerts
- Verification steps that require async processing show optimistic UI first

### Routing
- Hash-based routing keeps the app self-contained without a server; all routes are deep-linkable and bookmarkable
- Navigating away from a flow resets its local state; no stale data persists across visits

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

## File map

| Path | What it is |
|---|---|
| `src/App.tsx` | Root — hash routing, global state, modal orchestration |
| `src/pages/FlowPage.tsx` | Flowchart overview linking all stages |
| `src/pages/Dashboard.tsx` | Main dashboard (Get Started, ForYou, Balances, Portfolio) |
| `src/pages/WalletDetailPage.tsx` | Wallet detail view (slide-in panel) |
| `src/flows/KYBFlow.tsx` | Business / entity verification (multi-step) |
| `src/flows/KYCFlow.tsx` | Individual user verification |
| `src/flows/WalletCreationFlow.tsx` | Create wallet modal |
| `src/flows/DepositModal.tsx` | Deposit flow (cash + crypto tabs) |
| `src/flows/PolicyModal.tsx` | Policy builder modal |
| `src/flows/WalkthroughStepper.tsx` | In-context walkthrough stepper |
| `src/components/Sidebar.tsx` | Left nav with security submenu |
| `src/components/Topbar.tsx` | Top bar with theme toggle |
| `src/components/GetStarted.tsx` | Onboarding action list |
| `src/components/ForYou.tsx` | Horizontal-scroll recommendation cards |
| `src/components/Balances.tsx` | Balance summary |
| `src/components/Portfolio.tsx` | Portfolio chart |
| `src/components/TradeCard.tsx` | Trade / Go Account panel |
| `src/components/Snackbar.tsx` | Toast notification (imperative via ref) |
| `get-started-aggregation-spec.md` | Get Started role-based aggregation logic — canonical spec for task selection algorithm |
| `src/hooks/useGetStarted.ts` | Get Started action state |
| `src/hooks/useTheme.ts` | Light/dark theme toggle |
| `src/types/index.ts` | Shared types, constants, trade pairs, walkthrough definitions |
| `src/styles/globals.css` | Global styles + animations |
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

---

## Out of scope — Whitelist Destinations

> This section documents a separate prototype built in the same repo but outside the FA project scope.

**What it is:** A security management feature for whitelisting withdrawal addresses. Includes address allowlist, scope management (per-wallet permissions), approval workflows, and a label consolidation flow.

**Route:** `#destinations` → `src/pages/DestinationsPage.tsx`

### UX notes
- Consolidation flow is in-context (modal anchored to the active row group) — no full-page takeover
- Label animation (delete → type) communicates the transformation, not just the result
- Scope badges appear after duplicate rows collapse — causality is clear: merge first, result appears after
- Copy icon appears on row hover only — reduces visual noise in the default state
- Trash/delete action uses secondary ghost style in the action column
- Snackbar confirms when all groups are fully consolidated
