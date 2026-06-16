import { useState, useCallback } from 'react';
import type { Member, Role, EntityStatus } from '../types';
import { SAMPLE_MEMBERS, SAMPLE_ROLES } from '../types';

let _mid = 1000;
function nextMemberId() { return `m_${++_mid}`; }

const AVATAR_COLORS = ['av-blue', 'av-teal', 'av-purple', 'av-amber'];

export interface InviteInput {
  email: string;
  roleIds: string[];
}

export interface StatusRollup {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  invited: number;
}

function statusLabel(s: EntityStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "2 Active • 1 Pending" from a set of statuses */
export function rollupText(statuses: EntityStatus[]): string {
  const order: EntityStatus[] = ['active', 'pending', 'inactive', 'invited'];
  return order
    .map(s => ({ s, n: statuses.filter(x => x === s).length }))
    .filter(({ n }) => n > 0)
    .map(({ s, n }) => `${n} ${statusLabel(s)}`)
    .join(' • ');
}

export function useMembersRoles() {
  const [members, setMembers] = useState<Member[]>(SAMPLE_MEMBERS);
  // Roles are read-only this pass; Create Role flow (deferred) will introduce a setter.
  const [roles] = useState<Role[]>(SAMPLE_ROLES);

  const roleById = useCallback(
    (id: string) => roles.find(r => r.id === id),
    [roles],
  );

  /** Roles assigned to a member, with the member's per-role status applied. */
  const rolesForMember = useCallback(
    (memberId: string): { role: Role; status: EntityStatus }[] => {
      const m = members.find(x => x.id === memberId);
      if (!m) return [];
      return m.roleIds
        .map(rid => {
          const role = roles.find(r => r.id === rid);
          if (!role) return null;
          return { role, status: m.roleStatuses?.[rid] ?? 'active' as EntityStatus };
        })
        .filter(Boolean) as { role: Role; status: EntityStatus }[];
    },
    [members, roles],
  );

  /** Status rollup across a member's assigned roles. */
  const memberRoleRollup = useCallback(
    (memberId: string): StatusRollup => {
      const list = rolesForMember(memberId);
      const statuses = list.map(l => l.status);
      return {
        total: statuses.length,
        active: statuses.filter(s => s === 'active').length,
        pending: statuses.filter(s => s === 'pending').length,
        inactive: statuses.filter(s => s === 'inactive').length,
        invited: statuses.filter(s => s === 'invited').length,
      };
    },
    [rolesForMember],
  );

  /** Members who hold a given role. */
  const membersForRole = useCallback(
    (roleId: string): Member[] => members.filter(m => m.roleIds.includes(roleId)),
    [members],
  );

  // ── Mutators ───────────────────────────────────────────────────────
  const inviteMember = useCallback((input: InviteInput) => {
    const handle = input.email.split('@')[0] || 'member';
    const name = handle
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    setMembers(prev => {
      const m: Member = {
        id: nextMemberId(),
        name: name || input.email,
        email: input.email,
        status: 'invited',
        joinedAt: '—',
        userId: '—',
        roleIds: input.roleIds,
        avatarColor: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
      };
      return [m, ...prev];
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const assignRoles = useCallback((memberId: string, roleIds: string[]) => {
    setMembers(prev => prev.map(m => (m.id === memberId ? { ...m, roleIds } : m)));
  }, []);

  return {
    members,
    roles,
    roleById,
    rolesForMember,
    memberRoleRollup,
    membersForRole,
    rollupText,
    inviteMember,
    removeMember,
    assignRoles,
  };
}

export type MembersRolesApi = ReturnType<typeof useMembersRoles>;
