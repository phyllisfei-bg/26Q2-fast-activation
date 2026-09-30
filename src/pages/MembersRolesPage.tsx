import React, { useState, useRef } from 'react';
import { Topbar } from '../components/Topbar';
import { Snackbar } from '../components/Snackbar';
import type { SnackbarHandle } from '../components/Snackbar';
import type { Member, Role } from '../types';
import type { MembersRolesApi } from '../hooks/useMembersRoles';
import { MembersTable } from '../components/membersRoles/MembersTable';
import { RolesTable } from '../components/membersRoles/RolesTable';
import { MemberDrawer } from '../components/membersRoles/MemberDrawer';
import { RoleDrawer } from '../components/membersRoles/RoleDrawer';
import { ManageRolesModal } from '../components/membersRoles/ManageRolesModal';
import { ManageMembersModal } from '../components/membersRoles/ManageMembersModal';
import { SearchField } from '../components/SearchField';
import { FilterChips } from '../components/FilterChips';

type Tab = 'members' | 'roles';

interface Props {
  isLight: boolean;
  onThemeToggle: () => void;
  api: MembersRolesApi;
  onInviteMember: () => void;
  tab?: Tab;
}

export const MembersRolesPage: React.FC<Props> = ({ isLight, onThemeToggle, api, onInviteMember, tab: tabProp }) => {
  const [tabState] = useState<Tab>('members');
  const tab = tabProp ?? tabState;
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [manageMember, setManageMember] = useState<Member | null>(null);
  const [manageMembersRole, setManageMembersRole] = useState<Role | null>(null);
  const snackRef = useRef<SnackbarHandle>(null);

  const q = search.trim().toLowerCase();
  const members = api.members.filter(m =>
    !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  const roles = api.roles.filter(r =>
    !q || r.name.toLowerCase().includes(q) || r.categories.some(c => c.toLowerCase().includes(q)));

  const handleRemoveMember = (m: Member) => {
    api.removeMember(m.id);
    setSelectedMember(null);
    snackRef.current?.show(`${m.name} removed from organization.`, false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--color-level1)]">
      <Topbar isLight={isLight} onThemeToggle={onThemeToggle} admin />

      <div className="flex-1 overflow-y-auto px-7 py-7">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--color-text)]">{tab === 'members' ? 'Members' : 'Roles'}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {tab === 'members'
                ? 'Manage member access in your organization.'
                : 'Manage roles and their permissions.'} For detailed role permissions, visit{' '}
              <a className="text-[var(--brand-500)] hover:underline cursor-pointer">Resource Center</a>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {tab === 'members' ? (
              <button
                className="flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--brand-500)] text-sm font-semibold text-white border-none cursor-pointer hover:bg-[var(--brand-700)] transition-colors"
                onClick={onInviteMember}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Invite Member
              </button>
            ) : (
              <button
                className="flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--brand-500)] text-sm font-semibold text-white border-none cursor-pointer hover:bg-[var(--brand-700)] transition-colors"
                onClick={() => snackRef.current?.show('Create Role flow coming soon.', false)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Role
              </button>
            )}
          </div>
        </div>

        {/* Filter chips + search row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <FilterChips filters={tab === 'members' ? ['Roles', 'Status'] : ['Category', 'Members']} />
          <div className="w-[220px] shrink-0">
            <SearchField value={search} onChange={setSearch} placeholder="Search" />
          </div>
        </div>

        {/* Table */}
        {tab === 'members' ? (
          <MembersTable
            members={members}
            api={api}
            onRowClick={setSelectedMember}
            onManageRoles={(m) => setManageMember(m)}
            onRemove={handleRemoveMember}
          />
        ) : (
          <RolesTable
            roles={roles}
            onRowClick={setSelectedRole}
            onManageMembers={(r) => setManageMembersRole(r)}
            onDelete={(r) => snackRef.current?.show(`Delete "${r.name}" — coming soon.`, false)}
          />
        )}
      </div>

      <MemberDrawer
        member={selectedMember}
        api={api}
        onClose={() => setSelectedMember(null)}
        onManageRoles={(m) => setManageMember(m)}
        onRemove={handleRemoveMember}
      />
      <RoleDrawer
        role={selectedRole}
        api={api}
        onClose={() => setSelectedRole(null)}
        onManageMembers={(r) => setManageMembersRole(r)}
      />

      <ManageRolesModal
        member={manageMember}
        api={api}
        onClose={() => setManageMember(null)}
        onSaved={(msg) => snackRef.current?.show(msg, false)}
      />
      <ManageMembersModal
        role={manageMembersRole}
        api={api}
        onClose={() => setManageMembersRole(null)}
        onSaved={(msg) => snackRef.current?.show(msg, false)}
      />

      <Snackbar ref={snackRef} />
    </div>
  );
};
