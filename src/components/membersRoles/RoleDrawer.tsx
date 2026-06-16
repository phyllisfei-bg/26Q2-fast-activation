import React, { useState, useEffect } from 'react';
import type { Role } from '../../types';
import { PERMISSION_CATALOG, ENTERPRISE_WALLETS } from '../../types';
import type { MembersRolesApi } from '../../hooks/useMembersRoles';
import {
  StatusBadge, Avatar, Menu, ChevronRight, ChevronDown, CloseIcon, CheckMark, ManageRolesIcon,
} from './shared';
import { SearchField } from '../SearchField';

type Tab = 'Overview' | 'Members' | 'Permissions' | 'Enterprises & Wallets';

interface Props {
  role: Role | null;
  api: MembersRolesApi;
  onClose: () => void;
  onManageMembers: (r: Role) => void;
}

function membersRollupText(role: Role, fallbackActive: number): string {
  if (role.memberRollup) {
    const { active, pending, inactive } = role.memberRollup;
    return [active && `${active} Active`, pending && `${pending} Pending`, inactive && `${inactive} Inactive`]
      .filter(Boolean).join(' • ');
  }
  return `${fallbackActive} Active`;
}

export const RoleDrawer: React.FC<Props> = ({ role, api, onClose, onManageMembers }) => {
  const [tab, setTab] = useState<Tab>('Overview');
  const [openEnt, setOpenEnt] = useState<string | null>(ENTERPRISE_WALLETS[0]?.enterprise ?? null);
  const [walletSearch, setWalletSearch] = useState('');

  useEffect(() => { if (role) { setTab('Overview'); setWalletSearch(''); } }, [role?.id]);

  const open = !!role;
  const members = role ? api.membersForRole(role.id) : [];
  const perms = role ? PERMISSION_CATALOG.filter(p => role.permissionIds.includes(p.id)) : [];

  return (
    <div className={`dep-drawer-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className="dep-drawer mr-drawer" onClick={e => e.stopPropagation()}>
        {role && (
          <>
            <div className="mr-drawer-top">
              <span className="mr-drawer-eyebrow">Role Details</span>
              <button className="dep-drawer-close" onClick={onClose}><CloseIcon /></button>
            </div>
            <div className="mr-drawer-identity">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-normal text-[var(--color-text)] truncate">{role.name}</span>
                  <StatusBadge status={role.status} />
                </div>
                <div className="text-[14px] text-[var(--color-text-muted)] mt-0.5">{role.kind}</div>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-2 max-w-[420px]">{role.description}</p>
              </div>
              <Menu
                variant="actions"
                items={[{ label: 'Manage Members Assigned', icon: <ManageRolesIcon />, onClick: () => onManageMembers(role) }]}
              />
            </div>

            <div className="mr-drawer-tabs">
              {(['Overview', 'Members', 'Permissions', 'Enterprises & Wallets'] as Tab[]).map(t => (
                <div key={t} className={`mr-drawer-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</div>
              ))}
            </div>

            <div className="dep-drawer-body">
              {tab === 'Overview' && (
                <div className="mr-summary">
                  <div className="mr-summary-row">
                    <span className="mr-summary-label">Creation Date</span>
                    <div className="mr-summary-col2"><span className="mr-summary-value">Mar 11, 2024, 11:34 AM</span></div>
                  </div>
                  <div className="mr-summary-row mr-summary-clickable" onClick={() => setTab('Members')}>
                    <span className="mr-summary-label">Members Assigned</span>
                    <div className="mr-summary-col2">
                      <span className="mr-summary-value">
                        <span className="block">{role.memberCount}</span>
                        <span className="block text-[12px] text-[var(--color-text-secondary)]">{membersRollupText(role, members.length)}</span>
                      </span>
                      <span className="mr-summary-chevron"><ChevronRight /></span>
                    </div>
                  </div>
                  <div className="mr-summary-row mr-summary-clickable" onClick={() => setTab('Permissions')}>
                    <span className="mr-summary-label">Permissions</span>
                    <div className="mr-summary-col2">
                      <span className="mr-summary-value truncate">{perms.map(p => p.label).join(', ')}</span>
                      <span className="mr-summary-chevron"><ChevronRight /></span>
                    </div>
                  </div>
                  <div className="mr-summary-row mr-summary-clickable" onClick={() => setTab('Enterprises & Wallets')}>
                    <span className="mr-summary-label">Enterprises & Wallets</span>
                    <div className="mr-summary-col2">
                      <span className="mr-summary-value">{role.enterpriseAccess.enterprises} • {role.enterpriseAccess.wallets}</span>
                      <span className="mr-summary-chevron"><ChevronRight /></span>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'Members' && (
                <div>
                  <div className="mr-list-heading">{role.memberCount} Members Assigned</div>
                  <div className="mr-member-list">
                    {members.length === 0 && <div className="text-[13px] text-[var(--color-text-muted)] py-4">No members currently assigned.</div>}
                    {members.map(m => (
                      <div key={m.id} className="mr-member-row">
                        <Avatar name={m.name} color={m.avatarColor} size={30} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-medium text-[var(--color-text)] truncate">{m.name}</div>
                          <div className="text-[12px] text-[var(--color-text-secondary)] truncate">{m.email}</div>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'Permissions' && (
                <div className="mr-perm-list">
                  {perms.map(p => (
                    <div key={p.id} className="mr-perm-item">
                      <span className="mr-perm-check"><CheckMark /></span>
                      <div>
                        <div className="text-[14px] font-medium text-[var(--color-text)]">{p.label}</div>
                        <div className="text-[12.5px] text-[var(--color-text-secondary)] mt-0.5">{p.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'Enterprises & Wallets' && (
                <div>
                  {role.kind === 'Default' && (
                    <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
                      Default roles are automatically granted to all new enterprises and wallets at the time of creation.
                    </p>
                  )}
                  <div className="mb-3.5">
                    <SearchField
                      value={walletSearch}
                      onChange={setWalletSearch}
                      placeholder="Search wallets or enterprises"
                    />
                  </div>
                  <div className="mr-ent-accordion">
                    {ENTERPRISE_WALLETS.map(ent => {
                      const isOpen = openEnt === ent.enterprise;
                      const wallets = ent.wallets.filter(w =>
                        !walletSearch ||
                        ent.enterprise.toLowerCase().includes(walletSearch.toLowerCase()) ||
                        w.name.toLowerCase().includes(walletSearch.toLowerCase()),
                      );
                      if (walletSearch && wallets.length === 0 && !ent.enterprise.toLowerCase().includes(walletSearch.toLowerCase())) return null;
                      return (
                        <div key={ent.enterprise} className="mr-ent-group">
                          <button className="mr-ent-head" onClick={() => setOpenEnt(isOpen ? null : ent.enterprise)}>
                            <span className="font-medium text-[var(--color-text)]">{ent.enterprise} <span className="text-[var(--color-text-muted)] font-normal">({ent.wallets.length} Wallets)</span></span>
                            <span className={`mr-ent-chevron${isOpen ? ' open' : ''}`}><ChevronDown /></span>
                          </button>
                          {isOpen && (
                            <div className="mr-ent-wallets">
                              {wallets.map((w, i) => (
                                <div key={i} className="mr-wallet-row">
                                  <div className="min-w-0">
                                    <div className="text-[13.5px] font-medium text-[var(--color-text)]">{w.name}</div>
                                    <div className="text-[12px] text-[var(--color-text-muted)] font-mono">ID: {w.id}</div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-[12.5px] text-[var(--color-text-secondary)]">{w.custody}</div>
                                    <div className="text-[12px] text-[var(--color-text-muted)]">{w.balance ?? `Asset: ${w.asset}`}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
