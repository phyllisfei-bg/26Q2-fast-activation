import React, { useState, useEffect, useRef } from 'react';
import type { UserRole } from '../types';
import { USER_ROLES } from '../types';

interface Props {
  role: UserRole;
  onChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<Props> = ({ role, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = USER_ROLES.find(r => r.id === role)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="role-switcher" ref={containerRef}>
      {open && (
        <div className="role-switcher-menu">
          <div className="role-switcher-menu-header">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Preview as role
          </div>
          {USER_ROLES.map(r => (
            <button
              key={r.id}
              className={`role-switcher-item${r.id === role ? ' active' : ''}`}
              onClick={() => { onChange(r.id); setOpen(false); }}
            >
              <div className="role-switcher-item-body">
                <div className="role-switcher-item-name">{r.label}</div>
                <div className="role-switcher-item-desc">{r.description}</div>
              </div>
              <svg className="role-switcher-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          ))}
        </div>
      )}

      <button
        className="role-switcher-trigger"
        onClick={() => setOpen(o => !o)}
        title="Switch preview role"
      >
        <span className="role-switcher-dot" />
        <span className="role-switcher-label">
          <span className="role-switcher-prefix">Viewing as</span>
          {current.label}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
  );
};
