# Get Started card — aggregation logic spec

**Feature:** Fast Activation · Dashboard · Get Started card  
**Author:** Phyllis Fei  
**Status:** Ready for engineering

---

## Overview

The Get Started card shows each user up to 3 prioritized tasks on their first dashboard visit. Tasks are computed at runtime from the user's role(s), the current org state, and which tasks they've already completed. The aggregation algorithm runs for non-super users only.

```
if onboardingType = sales-led AND user is super_user:
  → fixed set: fundGoAccount, firstTrade, createWallet

else if onboardingType = organic AND user is super_user:
  → fixed set from section 8
    based on user type (business entity or individual)

else:
  → run aggregation algorithm (steps 1–6)
    (organic non-super users: pending — TBD)
```

---

## 1. Data model

### 1.1 User roles

A user can hold one or more of the following roles simultaneously:

| Role ID | Label |
|---|---|
| `super_user` | Super User |
| `org_admin` | Org Admin |
| `ent_admin` | Enterprise Admin |
| `wallet_admin` | Wallet Admin |
| `wallet_spender` | Wallet Spender |
| `wallet_viewer` | Wallet Viewer |
| `wallet_trader` | Wallet Trader |
| `video_id_user` | Video ID User |
| `auditor` | Auditor |

### 1.2 Org state

Three attributes tracked at the org level (shared across all users in the org):

| Key | Type | Meaning |
|---|---|---|
| `onboardingType` | enum: `sales-led` \| `organic` | How the org entered the product. Set once at signup, never mutates. Determines the initial value of `goAccountActivated`. |
| `bankAccountAdded` | boolean | A bank account has been linked to the org |
| `goAccountActivated` | boolean | The org's Go Account is active and ready to trade. **Derived from `onboardingType`**: always `true` for `sales-led` orgs; starts as `false` for `organic` orgs and flips to `true` once verification is complete (KYB + KYC for business entities; KYC only for individuals). Do not use `goAccountActivated` as a routing condition — use `onboardingType` instead. |

These attributes are org-wide, not per-user. `walletExists` is no longer used by the aggregation algorithm — it is only relevant inside the deposit and wallet flows.

### 1.3 Per-user completion state

A set of task IDs the current user has individually completed. Tracked per user, not per org.

```ts
type UserCompletedTasks = Set<TaskId>
```

---

## 2. Task catalog

Each task definition has the following shape:

```ts
type Task = {
  id: TaskId
  title: string                                // static copy — never changes
  description: string                          // static copy — never changes
  isBusinessGoal?: boolean                     // floats to top of scoring
  substitution?: {
    whenOrgKey: keyof OrgState   // if this org flag is true...
    replaceWith: TaskId          // ...swap this task out for another
  }
}
```

### 2.1 Full task catalog

| Task ID | Default title | Business goal | Notes |
|---|---|---|---|
| `fundGoAccount` | "Fund Go Account" | Yes | Always active regardless of wallet or bank state; deposit flow handles bank account context internally (see 2.2) |
| `firstTrade` | "Make first trade" | Yes | Activation path variation — see section 8 |
| `createWallet` | "Create first wallet" | — | |
| `addBankAccount` | "Add bank account" | — | Substitution rule: swaps to `understandTasksApprovals` when `bankAccountAdded = true` |
| `explorePolicies` | "Explore policies" | — | Backfill eligible (role-restricted) |
| `explorePortfolio` | "Explore portfolio" | — | |
| `startFirstTrade` | "Start first trade" | — | |
| `viewReports` | "View reports" | — | |
| `viewTrades` | "View trades" | — | |
| `viewMembersRoles` | "View members & roles" | — | |
| `viewUMSTasks` | "View UMS tasks" | — | |
| `viewEnterprisesWallets` | "View enterprises & wallets" | — | |
| `understandTasksApprovals` | "Understand tasks & approvals" | — | Backfill eligible (role-restricted) |
| `completeKYB` | "Complete KYB" | — | Organic business entities only |
| `completeKYC` | "Complete KYC" | — | Organic users only (business entities and individuals) |
| `completeVideoID` | "Complete Video ID" | — | |
| `unlockPolicy` | "Unlock policy controls" | — | |
| `viewActivityLog` | "View activity log" | — | |

### 2.2 `fundGoAccount` — deposit flow behaviour

The task card title and description are static: always **"Fund Go Account"**. The deposit method available to the user varies by org state, but this is handled inside the deposit flow itself — not on the Get Started card.

| Org state | Deposit flow behaviour |
|---|---|
| `bankAccountAdded = true`, user has `super_user`, `wallet_admin`, `wallet_spender`, or `wallet_viewer` | User can choose cash or crypto deposit |
| `bankAccountAdded = false`, user has `ent_admin` or `super_user` | User can add a bank account from within the deposit flow |
| `bankAccountAdded = false`, user has `wallet_admin`, `wallet_spender`, or `wallet_viewer` | User lands on crypto deposit by default; a banner is shown on the cash deposit tab explaining that a bank account has not been set up yet |

**This task is never locked.** It is always active regardless of whether a wallet exists or a bank account has been added. Do not apply a block rule to `fundGoAccount`.

### 2.3 Substitution rule — `addBankAccount`

When `bankAccountAdded = true`, the task `addBankAccount` is replaced with `understandTasksApprovals` in the candidate pool before scoring. If `understandTasksApprovals` is already in the pool from another role, `addBankAccount` is simply removed (no duplicate).

---

## 3. Role task pools (top 3 per role)

Each role has a fixed ordered list of up to 3 candidate tasks. Order within the list signals default priority for that role.

| Role | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| `super_user` | `fundGoAccount` | `firstTrade` | `createWallet` |
| `org_admin` | `viewMembersRoles` | `viewUMSTasks` | `viewEnterprisesWallets` |
| `ent_admin` | `createWallet` | `addBankAccount` | `explorePolicies` |
| `wallet_admin` | `fundGoAccount` | `explorePortfolio` | `explorePolicies` |
| `wallet_spender` | `fundGoAccount` | `explorePortfolio` | `startFirstTrade` |
| `wallet_viewer` | `fundGoAccount` | `explorePortfolio` | `viewReports` |
| `wallet_trader` | `firstTrade` | `viewTrades` | *(only 2 tasks — no backfill)* |
| `video_id_user` | `completeVideoID` | `understandTasksApprovals` | `unlockPolicy` |
| `auditor` | `viewActivityLog` | *(only 1 task — no backfill)* | |

**Important:** `wallet_trader` and `auditor` intentionally show fewer than 3 tasks. Do not pad with backfill for these roles.

**Note:** `super_user` row is reference only — not processed by the aggregation algorithm. Super user task sets are handled via the decision tree in the overview.

---

## 4. Backfill catalog

When a user ends up with fewer than 3 tasks after scoring (because their role pool is thin or tasks are completed), backfill tasks are appended in order until 3 tasks are reached — subject to role eligibility.

| Backfill task | Eligible roles |
|---|---|
| `explorePolicies` | `ent_admin`, `wallet_admin` |
| `understandTasksApprovals` | `org_admin`, `ent_admin`, `wallet_admin`, `video_id_user` |

`wallet_trader` and `auditor` are **not eligible** for any backfill tasks.

**Page routing for `understandTasksApprovals`:**
- `org_admin` → lands on the UMS tasks page
- `ent_admin`, `wallet_admin`, `video_id_user` → land on the enterprise-level tasks page
- A user who holds both `org_admin` and `ent_admin` → can access both the UMS tasks page and the enterprise-level tasks page

---

## 5. Aggregation algorithm

**This algorithm applies to non-super user accounts only** — whether the user holds a single role or multiple roles. For `super_user` (sales-led and organic), tasks are fixed sets defined in the overview decision tree and section 8 — no aggregation or scoring is needed.

Run this function at render time for all non-super users. Input: `roles[]`, `orgState`, `userCompletedTasks`. Output: ordered array of up to 3 resolved task objects.

### Step 1 — Resolve effective roles

Collect all roles assigned to the user. Super user never reaches this step.

```
effectiveRoles = roles  // super_user is handled separately, not via this algorithm
```

### Step 2 — Build candidate pool

Union the task lists from all effective roles. Track which roles each task appears in and its best (lowest) slot position across those roles.

```
for each role in effectiveRoles:
  for each (taskId, slotIndex) in R3[role]:
    if taskId not in pool:
      pool.add({ id: taskId, roles: [role], bestSlot: slotIndex })
    else:
      pool[taskId].roles.push(role)
      pool[taskId].bestSlot = min(pool[taskId].bestSlot, slotIndex)
```

### Step 3 — Apply substitutions

For each task in the pool, check its substitution rule against current org state. Apply before filtering or scoring.

```
for each task in pool:
  if task.substitution exists AND orgState[task.substitution.whenOrgKey] === true:
    replacementId = task.substitution.replaceWith
    if replacementId already in pool:
      remove task from pool  // avoid duplicate
    else:
      replace task with { id: replacementId, roles: task.roles, bestSlot: task.bestSlot }
```

### Step 4 — Filter completed tasks

Remove any task the current user has already completed.

```
pool = pool.filter(task => !userCompletedTasks.has(task.id))
```

### Step 5 — Score and sort

Sort the pool using this priority order (highest to lowest):

1. **Business goal flag** — tasks marked `isBusinessGoal = true` sort first
2. **Role overlap count** — tasks appearing in more of the user's roles sort higher
3. **Best slot position** — lower slot number sorts higher (tiebreaker)

```
pool.sort by:
  1. isBusinessGoal DESC
  2. roles.length DESC
  3. bestSlot ASC
```

### Step 6 — Take top 3, then backfill

Take the first 3 from the sorted pool. If fewer than 3 remain, iterate through the backfill catalog and append eligible tasks (checking role eligibility and that the task isn't already in the top 3 or completed) until 3 tasks are reached or backfill is exhausted.

```
top3 = pool.slice(0, 3)

if top3.length < 3:
  for each backfillTask in BACKFILL_CATALOG:
    if top3.length >= 3: break
    if backfillTask.id in top3: continue
    if userCompletedTasks.has(backfillTask.id): continue
    if user is eligible for backfillTask (per backfill catalog):
      top3.push(backfillTask)
```

Skip backfill entirely for `wallet_trader` and `auditor`.

Return the resolved task list. Each item includes: `id`, `title`, `description`. All returned tasks are active — no block states apply.

---

## 6. Special cases summary

| Scenario | Behaviour |
|---|---|
| User is `super_user` | Tasks are fixed sets per the overview decision tree. Aggregation algorithm does not run. No tasks are ever locked for super user. |
| User has multiple roles | Tasks appearing in more roles float higher via overlap score |
| `bankAccountAdded` flips to true | `addBankAccount` is substituted with `understandTasksApprovals` in pool, for ent admins |
| `fundGoAccount`, no bank account, user without `ent_admin` or `super_user` | Task is always active; inside the deposit flow, cash tab shows a banner; crypto deposit is the default |
| `fundGoAccount`, no bank account, user has `ent_admin` or `super_user` | Task is always active; inside the deposit flow, user can add a bank account from within the cash tab |
| `wallet_trader` or `auditor` | No backfill applied; card shows 2 or 1 task respectively |
| All tasks completed | All actions are marked as complete; Get Started card becomes dismissable; For You section unlocks |

---

## 7. Rendering rules

- **Active** tasks: fully interactive, CTA button shown
- **Completed** tasks: the "Start" button is replaced by a "Complete" badge with a checkmark; the task card remains visible in place until the user's next session or until dismissed. When all tasks are done, the card title changes to "Setup Complete", a subtitle reads "All essentials are active — your enterprise is ready to go.", and a dismiss (×) button appears in the header.
- Card shows a maximum of 3 actions — computed once at load and does not change during the session
- For You section renders only when all tasks in the user's pool (including backfill) are completed (`allDone = true`)

---

## 8. Sales-led vs. organic signup activation path (super user)

Institutions onboarded via sales can only land on the dashboard when they've completed KYB and KYC. Their Go Account is already activated. Users who sign up with BitGo themselves (organic) have not yet gone through compliance verification, so their Go Account is not yet activated when they land on the dashboard.

This means the Getting Started card should surface a different set of actions for organic users compared to institutions that were onboarded via sales, where verification is already complete and the Go Account is active from day one.

For organic users, the card prioritizes guiding them through the verification steps needed to unlock trading before surfacing `firstTrade`. The specific verification required depends on whether the user is signing up as a business entity or an individual.

| User type | `onboardingType` | `goAccountActivated` | KYB | KYC | Action shown in card |
|---|---|---|---|---|---|
| Institutional | `sales-led` | `true` | Required, complete | Required, complete | `fundGoAccount`, `firstTrade`, `createWallet` |
| Institutional | `organic` | `false` | Required, incomplete | Required, incomplete | `completeKYB`, `completeKYC`, `fundGoAccount` |
| Individual | `organic` | `false` | Not required | Required, incomplete | `completeKYC`, `fundGoAccount`, `firstTrade` |
