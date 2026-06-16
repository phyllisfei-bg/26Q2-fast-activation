import React, { useState, useEffect } from 'react';
import type { Member } from '../../types';
import type { MembersRolesApi } from '../../hooks/useMembersRoles';
import {
  StatusBadge, Avatar, Menu, ChevronRight, CloseIcon, CopyIcon,
  ManageRolesIcon, TrashIcon,
} from './shared';

type Tab = 'Overview' | 'Roles';

interface Props {
  member: Member | null;
  api: MembersRolesApi;
  onClose: () => void;
  onManageRoles: (m: Member) => void;
  onRemove: (m: Member) => void;
}

export const MemberDrawer: React.FC<Props> = ({ member, api, onClose, onManageRoles, onRemove }) => {
  const [tab, setTab] = useState<Tab>('Overview');

  // Reset to Overview whenever a new member is opened.
  useEffect(() => { if (member) setTab('Overview'); }, [member?.id]);

  const open = !!member;
  const roles = member ? api.rolesForMember(member.id) : [];
  const rollup = member ? api.memberRoleRollup(member.id) : null;
  const rollupText = rollup
    ? api.rollupText(roles.map(r => r.status))
    : '';

  return (
    <div className={`dep-drawer-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className="dep-drawer mr-drawer" onClick={e => e.stopPropagation()}>
        {member && (
          <>
            <div className="mr-drawer-top">
              <span className="mr-drawer-eyebrow">Member Details</span>
              <button className="dep-drawer-close" onClick={onClose}><CloseIcon /></button>
            </div>
            <div className="mr-drawer-identity">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={member.name} color={member.avatarColor} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px] font-normal text-[var(--color-text)] truncate">{member.name}</span>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[14px] text-[var(--color-text-secondary)] truncate">{member.email}</span>
                    <button className="mr-copy-btn" title="Copy email" onClick={() => navigator.clipboard?.writeText(member.email)}><CopyIcon /></button>
                  </div>
                </div>
              </div>
              <Menu
                variant="actions"
                items={[
                  { label: 'Manage Roles Assigned', icon: <ManageRolesIcon />, onClick: () => onManageRoles(member) },
                  { label: 'Remove from Organization', danger: true, icon: <TrashIcon />, onClick: () => onRemove(member) },
                ]}
              />
            </div>

            <div className="mr-drawer-tabs">
              {(['Overview', 'Roles'] as Tab[]).map(t => (
                <div key={t} className={`mr-drawer-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</div>
              ))}
            </div>

            <div className="dep-drawer-body">
              {tab === 'Overview' && (
                <div className="mr-summary">
                  <div className="mr-summary-row">
                    <span className="mr-summary-label">Joined Date</span>
                    <div className="mr-summary-col2"><span className="mr-summary-value">{member.joinedAt}</span></div>
                  </div>
                  <div className="mr-summary-row mr-summary-clickable" onClick={() => setTab('Roles')}>
                    <span className="mr-summary-label">Roles Assigned</span>
                    <div className="mr-summary-col2">
                      <span className="mr-summary-value">
                        <span className="block">{rollup?.total}</span>
                        <span className="block text-[12px] text-[var(--color-text-secondary)]">{rollupText}</span>
                      </span>
                      <span className="mr-summary-chevron"><ChevronRight /></span>
                    </div>
                  </div>
                  <div className="mr-summary-row">
                    <span className="mr-summary-label">User ID</span>
                    <div className="mr-summary-col2"><span className="mr-summary-value font-mono">{member.userId}</span></div>
                  </div>
                </div>
              )}

              {tab === 'Roles' && (
                <div>
                  <div className="mr-list-heading">{roles.length} Roles Assigned</div>
                  <div className="mr-role-list">
                    {roles.map(({ role, status }) => (
                      <div key={role.id} className="mr-role-item">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-[var(--color-text)]">{role.name}</span>
                            <StatusBadge status={status} />
                          </div>
                          <div className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5">{role.kind}</div>
                        </div>
                        <button className="mr-view-detail" title="View Role Details">
                          <ChevronRight />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
