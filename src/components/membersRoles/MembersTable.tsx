import React from 'react';
import type { Member } from '../../types';
import type { MembersRolesApi } from '../../hooks/useMembersRoles';
import { StatusBadge, PillRow, Avatar, Menu, ManageRolesIcon, TrashIcon } from './shared';

// Matches DestinationsPage table chrome verbatim.
const TH = 'px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]';
const THBLANK = 'px-4 py-3 bg-[#F5F6F7] border-b border-[var(--color-border)]';
const TD = 'px-4 h-16 align-middle';

interface Props {
  members: Member[];
  api: MembersRolesApi;
  onRowClick: (m: Member) => void;
  onManageRoles: (m: Member) => void;
  onRemove: (m: Member) => void;
}

export const MembersTable: React.FC<Props> = ({ members, api, onRowClick, onManageRoles, onRemove }) => (
  <div className="overflow-auto rounded-xl border border-[var(--color-border)]">
    <table className="mr-members-cols w-full table-fixed border-separate border-spacing-0">
      <thead>
        <tr>
          <th className={`${THBLANK} rounded-l-[11px]`}><input type="checkbox" className="mr-check" /></th>
          <th className={TH}>Name</th>
          <th className={TH}>Email</th>
          <th className={TH}>Roles Assigned</th>
          <th className={TH}>Status</th>
          <th className={`${THBLANK} rounded-r-[11px]`}></th>
        </tr>
      </thead>
      <tbody>
        {members.map(m => {
          const roleNames = api.rolesForMember(m.id).map(r => r.role.name);
          return (
            <tr key={m.id} className="cursor-pointer hover:bg-[#F9FAFB] transition-colors" onClick={() => onRowClick(m)}>
              <td className={TD} onClick={e => e.stopPropagation()}>
                <input type="checkbox" className="mr-check" />
              </td>
              <td className={TD}>
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} color={m.avatarColor} />
                  <span className="text-[16px] font-medium text-[var(--color-text)]">{m.name}</span>
                </div>
              </td>
              <td className={`${TD} text-[14px] text-[var(--color-text-secondary)]`}>{m.email}</td>
              <td className={TD}><PillRow items={roleNames} max={2} /></td>
              <td className={TD}><StatusBadge status={m.status} /></td>
              <td className={`${TD} text-right`} onClick={e => e.stopPropagation()}>
                <Menu
                  variant="kebab"
                  items={[
                    { label: 'Manage Roles Assigned', icon: <ManageRolesIcon />, onClick: () => onManageRoles(m) },
                    { label: 'Remove from Organization', danger: true, icon: <TrashIcon />, onClick: () => onRemove(m) },
                  ]}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
