import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { GsTask, UserRole } from '../types';
import { ROLE_TASKS, GS_TASK_META } from '../types';
import type { EnterpriseState } from '../components/RoleSwitcher';

// Substitution rules: when org key is true, swap task out for replacement
const SUBSTITUTIONS: Partial<Record<GsTask, { whenOrgKey: keyof EnterpriseState; replaceWith: GsTask }>> = {
  gsAddBankAccount: { whenOrgKey: 'bankAccountAdded', replaceWith: 'gsUnderstandTasksApprovals' },
};

// Backfill catalog (in priority order) with role eligibility
const BACKFILL: { id: GsTask; eligible: UserRole[] }[] = [
  { id: 'gsExplorePolicies',          eligible: ['ent_admin', 'wallet_admin'] },
  { id: 'gsUnderstandTasksApprovals', eligible: ['org_admin', 'ent_admin', 'wallet_admin', 'video_id_user'] },
];

// These roles never receive backfill tasks (per spec section 3)
const NO_BACKFILL_ROLES: UserRole[] = ['wallet_trader', 'auditor'];

function computeTasks(
  roles: UserRole[],
  enterpriseState: EnterpriseState,
  completedTasks: GsTask[],
): GsTask[] {
  const isSuperUser = roles.includes('super_user');

  // ── Super user: fixed sets, no aggregation ───────────────────────────
  if (isSuperUser) {
    if (enterpriseState.onboardingType === 'sales-led') {
      return ROLE_TASKS['super_user'];
    }
    // organic super user — tasks depend on entity type
    if (enterpriseState.entityType === 'business') {
      return ['gsCompleteKYB', 'gsCompleteKYC', 'gsGoAccountFund'];
    }
    return ['gsCompleteKYC', 'gsGoAccountFund', 'gsFirstTrade'];
  }

  // ── Non-super: run aggregation algorithm ─────────────────────────────

  // Step 1: effective roles
  const effectiveRoles = roles.filter(r => r !== 'super_user');

  // Step 2: build candidate pool — track all roles a task appears in + best slot
  const pool = new Map<GsTask, { roles: UserRole[]; bestSlot: number }>();
  for (const role of effectiveRoles) {
    const roleTasks = ROLE_TASKS[role] ?? [];
    roleTasks.forEach((taskId, slotIndex) => {
      const existing = pool.get(taskId);
      if (existing) {
        existing.roles.push(role);
        existing.bestSlot = Math.min(existing.bestSlot, slotIndex);
      } else {
        pool.set(taskId, { roles: [role], bestSlot: slotIndex });
      }
    });
  }

  // Step 3: apply substitutions
  for (const [taskId, sub] of Object.entries(SUBSTITUTIONS) as [GsTask, NonNullable<typeof SUBSTITUTIONS[GsTask]>][]) {
    if (!pool.has(taskId)) continue;
    const orgVal = enterpriseState[sub.whenOrgKey];
    if (orgVal === true) {
      const entry = pool.get(taskId)!;
      pool.delete(taskId);
      if (!pool.has(sub.replaceWith)) {
        pool.set(sub.replaceWith, entry);
      }
      // if replaceWith already exists, just drop the original (no duplicate)
    }
  }

  // Step 4: filter completed tasks
  const candidates = [...pool.entries()].filter(([tid]) => !completedTasks.includes(tid));

  // Step 5: score and sort
  // Priority: isBusinessGoal DESC → role overlap count DESC → bestSlot ASC
  candidates.sort(([aId, a], [bId, b]) => {
    const aGoal = GS_TASK_META[aId]?.isBusinessGoal ? 1 : 0;
    const bGoal = GS_TASK_META[bId]?.isBusinessGoal ? 1 : 0;
    if (bGoal !== aGoal) return bGoal - aGoal;
    if (b.roles.length !== a.roles.length) return b.roles.length - a.roles.length;
    return a.bestSlot - b.bestSlot;
  });

  // Step 6: take top 3, then backfill if eligible
  const top3 = candidates.slice(0, 3).map(([tid]) => tid);

  const backfillEligible = !effectiveRoles.every(r => NO_BACKFILL_ROLES.includes(r));
  if (top3.length < 3 && backfillEligible) {
    for (const bf of BACKFILL) {
      if (top3.length >= 3) break;
      if (top3.includes(bf.id)) continue;
      if (completedTasks.includes(bf.id)) continue;
      if (effectiveRoles.some(r => bf.eligible.includes(r))) {
        top3.push(bf.id);
      }
    }
  }

  return top3;
}

export function useGetStarted(roles: UserRole[], enterpriseState: EnterpriseState) {
  const [done, setDone] = useState<GsTask[]>([]);

  // Computed once per role/org-state combination; stable within a session
  const tasks = useMemo(
    () => computeTasks(roles, enterpriseState, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(roles), JSON.stringify(enterpriseState)],
  );

  // Reset completed tasks when the computed list changes (role/state switch)
  const prevTasksKey = useRef(JSON.stringify(tasks));
  useEffect(() => {
    const key = JSON.stringify(tasks);
    if (prevTasksKey.current !== key) {
      setDone([]);
      prevTasksKey.current = key;
    }
  }, [tasks]);

  const markDone = useCallback((task: GsTask) => {
    setDone(prev => prev.includes(task) ? prev : [...prev, task]);
  }, []);

  const allDone = tasks.length > 0 && tasks.every(t => done.includes(t));

  return { done, markDone, allDone, tasks };
}
