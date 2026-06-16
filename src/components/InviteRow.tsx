import { useRef, useState, useLayoutEffect } from 'react';
import type { Role } from '../types';
import { SAMPLE_ROLES } from '../types';
import { Badge, Chip } from './membersRoles/shared';

export interface InviteRow {
  id: string;
  email: string;
  roles: string[];   // selected role names
  open: boolean;
}

let _rid = 0;
export function nextRowId() { return `irow_${++_rid}`; }

export const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckSvg8 = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function roleMeta(r: Role): string {
  return r.kind === 'Custom'
    ? `${r.enterpriseAccess.enterprises} • ${r.enterpriseAccess.wallets}`
    : r.description;
}

interface InviteRowProps {
  row: InviteRow;
  onEmailChange: (id: string, v: string) => void;
  onToggleRole: (id: string, role: string) => void;
  onToggleOpen: (id: string) => void;
  onRemove: (id: string) => void;
}

export function InviteRowItem({ row, onEmailChange, onToggleRole, onToggleOpen, onRemove }: InviteRowProps) {
  const tagsRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = useState(row.roles.length);

  // Keep chips on a single row: show as many as fit, collapse the rest into a "+N" chip.
  useLayoutEffect(() => {
    function measure() {
      const tags = tagsRef.current, meas = measureRef.current;
      if (!tags || !meas) return;
      const budget = tags.clientWidth;
      const chipEls = Array.from(meas.children) as HTMLElement[];
      const gap = 6, plusReserve = 48;
      let used = 0, count = 0;
      for (let i = 0; i < chipEls.length; i++) {
        const w = chipEls[i].offsetWidth + (count > 0 ? gap : 0);
        const reserve = i < chipEls.length - 1 ? plusReserve : 0;   // room for "+N" if more follow
        if (used + w + reserve <= budget) { used += w; count++; }
        else break;
      }
      setVisibleCount(count);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [row.roles.join('|')]);

  const shown = row.roles.slice(0, visibleCount);
  const hidden = row.roles.length - shown.length;

  return (
    <div className="kyc-invite-row">
      <div className="kyc-invite-field-wrap email-wrap">
        <span className="kyc-invite-field-label">Email Address</span>
        <input
          type="email"
          className="kyc-invite-email-field"
          placeholder="name@company.com"
          value={row.email}
          onChange={e => onEmailChange(row.id, e.target.value)}
        />
      </div>
      <div className="kyc-invite-field-wrap role-wrap">
        <span className="kyc-invite-field-label">Role</span>
        <div className={`kyc-role-ms${row.open ? ' open' : ''}`}>
          <div
            className="kyc-role-ms-trigger inv-trigger"
            onClick={e => { e.stopPropagation(); onToggleOpen(row.id); }}
          >
            {row.roles.length === 0 ? (
              <span className="kyc-role-ms-placeholder">Select roles…</span>
            ) : (
              <span className="kyc-role-ms-tags" ref={tagsRef}>
                {shown.map(r => <Chip key={r} label={r} onDelete={() => onToggleRole(row.id, r)} />)}
                {hidden > 0 && <span className="mr-rm-chip inv-plus">+{hidden}</span>}
              </span>
            )}
            <svg className="kyc-role-ms-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* off-screen measurer: natural chip widths for the overflow calc */}
          <span ref={measureRef} className="inv-measure" aria-hidden="true">
            {row.roles.map(r => <Chip key={r} label={r} onDelete={() => undefined} />)}
          </span>

          <div className="kyc-role-ms-dropdown inv-role-dropdown">
            {SAMPLE_ROLES.map(role => {
              const checked = row.roles.includes(role.name);
              return (
                <div
                  key={role.id}
                  className={`inv-role-opt${checked ? ' checked' : ''}`}
                  onClick={e => { e.stopPropagation(); onToggleRole(row.id, role.name); }}
                >
                  <div className="inv-role-cb"><CheckSvg8 /></div>
                  <div className="inv-role-info">
                    <div className="inv-role-title">
                      <span className="inv-role-name">{role.name}</span>
                      <Badge tone="neutral">{role.kind}</Badge>
                    </div>
                    <div className="inv-role-desc">{roleMeta(role)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button type="button" className="kyc-btn-remove-row" onClick={() => onRemove(row.id)} title="Remove">
        <XIcon />
      </button>
    </div>
  );
}
