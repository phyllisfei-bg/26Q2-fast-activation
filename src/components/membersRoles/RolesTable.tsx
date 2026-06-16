import React from 'react';
import type { Role } from '../../types';
import { StatusBadge, PillRow, Menu, ManageRolesIcon, TrashIcon } from './shared';

// Matches DestinationsPage table chrome verbatim.
const TH = 'px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]';
const THBLANK = 'px-4 py-3 bg-[#F5F6F7] border-b border-[var(--color-border)]';
const TD = 'px-4 h-16 align-middle';

interface Props {
  roles: Role[];
  onRowClick: (r: Role) => void;
  onManageMembers: (r: Role) => void;
  onDelete: (r: Role) => void;
}

export const RolesTable: React.FC<Props> = ({ roles, onRowClick, onManageMembers, onDelete }) => (
  <div className="overflow-auto rounded-xl border border-[var(--color-border)]">
    <table className="mr-roles-cols w-full table-fixed border-separate border-spacing-0">
      <thead>
        <tr>
          <th className={`${THBLANK} rounded-l-[11px]`}><input type="checkbox" className="mr-check" /></th>
          <th className={TH}>Name</th>
          <th className={TH}>Permissions</th>
          <th className={TH}>Enterprise Access</th>
          <th className={TH}>Members</th>
          <th className={TH}>Status</th>
          <th className={`${THBLANK} rounded-r-[11px]`}></th>
        </tr>
      </thead>
      <tbody>
        {roles.map(r => (
          <tr key={r.id} className="cursor-pointer hover:bg-[#F9FAFB] transition-colors" onClick={() => onRowClick(r)}>
            <td className={TD} onClick={e => e.stopPropagation()}>
              <input type="checkbox" className="mr-check" />
            </td>
            <td className={TD}>
              <div className="text-[16px] font-medium text-[var(--color-text)] mb-0.5">{r.name}</div>
              <div className="text-[14px] text-[var(--color-text-secondary)]">{r.kind}</div>
            </td>
            <td className={TD}><PillRow items={r.categories} max={2} /></td>
            <td className={TD}>
              <div className="text-[14px] text-[var(--color-text)] mb-0.5">{r.enterpriseAccess.enterprises}</div>
              <div className="text-[14px] text-[var(--color-text-secondary)]">{r.enterpriseAccess.wallets}</div>
            </td>
            <td className={`${TD} text-[16px] font-medium text-[var(--color-text)]`}>{r.memberCount}</td>
            <td className={TD}><StatusBadge status={r.status} /></td>
            <td className={`${TD} text-right`} onClick={e => e.stopPropagation()}>
              <Menu
                variant="kebab"
                items={[
                  { label: 'Manage Members Assigned', icon: <ManageRolesIcon />, onClick: () => onManageMembers(r) },
                  { label: 'Delete Role', danger: true, icon: <TrashIcon />, onClick: () => onDelete(r) },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
