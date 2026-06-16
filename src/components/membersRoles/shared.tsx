import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import type { EntityStatus } from '../../types';

/* ── Badge — the single badge component used everywhere ──────────
   Tones can be expanded over time; never create a separate badge. */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'invited' | 'neutral' | 'brand';

export const Badge: React.FC<{ tone: BadgeTone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`mr-badge ${tone}`}>{children}</span>
);

/* ── Chip — the single removable token used in inputs (search, selectors) ── */
const ChipX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Chip: React.FC<{ label: string; onDelete?: () => void }> = ({ label, onDelete }) => (
  <span className="mr-rm-chip">
    {label}
    {onDelete && (
      <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}><ChipX /></button>
    )}
  </span>
);

const STATUS_TONE: Record<EntityStatus, BadgeTone> = {
  active: 'success',
  pending: 'warning',
  inactive: 'danger',
  invited: 'invited',
};

export const StatusBadge: React.FC<{ status: EntityStatus }> = ({ status }) => (
  <Badge tone={STATUS_TONE[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

/* ── Pills (roles / permission categories) with +N overflow ────────
   Matches the DestinationsPage scope-chip style verbatim. */
const CHIP = 'mr-chip';
export const PillRow: React.FC<{ items: string[]; max?: number }> = ({ items, max = 2 }) => {
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {shown.map(p => <span key={p} className={CHIP}>{p}</span>)}
      {extra > 0 && <span className={CHIP}>+{extra}</span>}
    </div>
  );
};

/* ── Avatar ──────────────────────────────────────────────────────── */
export function initialsOf(name: string): string {
  const clean = name.replace(/\s*\(.*\)/, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<{ name: string; color?: string; size?: number }> = ({ name, color = 'av-blue', size = 32 }) => (
  <span
    className={`mr-avatar ${color}`}
    style={{ width: size, height: size, fontSize: size * 0.36 }}
  >
    {initialsOf(name)}
  </span>
);

/* ── Dropdown menu (kebab + actions) — portal-rendered, fixed pos ── */
export interface MenuItem {
  label: string;
  danger?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
  </svg>
);

export const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const Menu: React.FC<{ items: MenuItem[]; variant?: 'kebab' | 'actions' }> = ({ items, variant = 'kebab' }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, left: r.right - 232 });
    };
    update();
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('click', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('click', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className={variant === 'kebab' ? 'mr-kebab-btn' : 'mr-actions-btn'}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
      >
        {variant === 'kebab' ? <KebabIcon /> : <>Actions <ChevronDown /></>}
      </button>
      {open && ReactDOM.createPortal(
        <div className="mr-menu" style={{ position: 'fixed', top: pos.top, left: pos.left }} onClick={e => e.stopPropagation()}>
          {items.map(item => (
            <button
              key={item.label}
              className={`mr-menu-item${item.danger ? ' danger' : ''}`}
              onClick={() => { setOpen(false); item.onClick(); }}
            >
              {item.icon && <span className="mr-menu-item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};

/* ── Small icons reused across the surface ───────────────────────── */
export const ManageRolesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 11l-2 2-1-1" />
  </svg>
);

export const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const CheckMark = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
