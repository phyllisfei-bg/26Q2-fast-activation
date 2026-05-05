import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UserRole } from '../types';
import { USER_ROLES } from '../types';

export interface EnterpriseState {
  onboardingType: 'sales-led' | 'organic';
  entityType: 'business' | 'individual';
  bankAccountAdded: boolean;
  walletExists: boolean;
}

interface Props {
  roles: UserRole[];
  onChange: (roles: UserRole[]) => void;
  enterpriseState: EnterpriseState;
  onEnterpriseStateChange: (state: EnterpriseState) => void;
}

const GripIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <circle cx="2" cy="2" r="1.1"/><circle cx="5" cy="2" r="1.1"/><circle cx="8" cy="2" r="1.1"/>
    <circle cx="2" cy="5" r="1.1"/><circle cx="5" cy="5" r="1.1"/><circle cx="8" cy="5" r="1.1"/>
    <circle cx="2" cy="8" r="1.1"/><circle cx="5" cy="8" r="1.1"/><circle cx="8" cy="8" r="1.1"/>
  </svg>
);

const Toggle: React.FC<{ on: boolean; onClick: () => void }> = ({ on, onClick }) => (
  <div className={`rs-toggle-track${on ? ' on' : ''}`} onClick={onClick}>
    <div className="rs-toggle-thumb" />
  </div>
);

const SUPER = 'super_user' as const;

export const RoleSwitcher: React.FC<Props> = ({
  roles, onChange, enterpriseState, onEnterpriseStateChange,
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const primary = USER_ROLES.find(r => r.id === roles[0])!;
  const superUser = USER_ROLES.find(r => r.id === SUPER)!;
  const otherRoles = USER_ROLES.filter(r => r.id !== SUPER);

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

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const initX = rect.left;
    const initY = rect.top;
    const originX = pos?.x ?? initX;
    const originY = pos?.y ?? initY;
    const startX = e.clientX;
    const startY = e.clientY;
    let dragged = false;

    if (!pos) setPos({ x: initX, y: initY });

    const onMove = (ev: MouseEvent) => {
      ev.preventDefault(); // only prevent default (text selection) during actual move
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!dragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragged = true;
        isDragging.current = true;
        document.body.style.userSelect = 'none';
      }
      if (!dragged) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - rect.width, originX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - rect.height, originY + dy)),
      });
    };

    const onUp = () => {
      document.body.style.userSelect = '';
      setTimeout(() => { isDragging.current = false; }, 0);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pos]);

  const handleToggleRole = (id: UserRole) => {
    if (id === SUPER) {
      onChange([SUPER]);
    } else if (roles.includes(SUPER)) {
      onChange([id]);
    } else {
      if (roles.includes(id)) {
        const next = roles.filter(r => r !== id);
        if (next.length > 0) onChange(next);
      } else {
        onChange([...roles, id]);
      }
    }
  };

  const setEnt = <K extends keyof EnterpriseState>(key: K, val: EnterpriseState[K]) =>
    onEnterpriseStateChange({ ...enterpriseState, [key]: val });

  const isOrganic = enterpriseState.onboardingType === 'organic';
  const isSalesLed = enterpriseState.onboardingType === 'sales-led';

  // Force super_user when switching to organic
  useEffect(() => {
    if (isOrganic && !roles.every(r => r === SUPER)) onChange([SUPER]);
  }, [isOrganic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset entityType to business when switching to sales-led
  useEffect(() => {
    if (isSalesLed && enterpriseState.entityType === 'individual') {
      onEnterpriseStateChange({ ...enterpriseState, entityType: 'business' });
    }
  }, [isSalesLed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevents click handlers from firing at drag-end
  const guard = (fn: () => void) => () => { if (!isDragging.current) fn(); };

  const posStyle: React.CSSProperties = pos
    ? { top: pos.y, left: pos.x, bottom: 'auto', right: 'auto' }
    : {};

  const triggerLabel = roles.length === 1
    ? primary.label
    : `${primary.label} +${roles.length - 1}`;

  return (
    <div className="role-switcher" ref={containerRef} style={posStyle} onMouseDown={handleDragStart}>
      <div className="role-switcher-pill">
        <div className="role-switcher-grip">
          <GripIcon />
        </div>
        <button
          className="role-switcher-trigger"
          onClick={() => { if (!isDragging.current) setOpen(o => !o); }}
          title="Switch preview role"
        >
          <span className="role-switcher-org-state">
            <span>{enterpriseState.onboardingType === 'sales-led' ? 'Sales-led' : 'Organic'}</span>
            <span className="role-switcher-org-mid">·</span>
            <span>{enterpriseState.entityType === 'business' ? 'Business' : 'Individual'}</span>
            {enterpriseState.bankAccountAdded && <span className="role-switcher-ent-tag">Bank ✓</span>}
            {enterpriseState.walletExists && <span className="role-switcher-ent-tag">Wallet ✓</span>}
          </span>
          <span className="role-switcher-pill-sep" />
          <span className="role-switcher-label">
            <span className="role-switcher-prefix">Viewing as</span>
            {triggerLabel}
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

      {open && (
        <div className="role-switcher-menu">
          <div className="role-switcher-cols">
            {/* Left: onboarding type + entity type + enterprise state */}
            <div className="role-switcher-col">
              <div className="role-switcher-menu-header">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
                </svg>
                Onboarding type
              </div>
              <div className="rs-segment-control">
                {(['sales-led', 'organic'] as const).map(opt => (
                  <button
                    key={opt}
                    className={`rs-segment-btn${enterpriseState.onboardingType === opt ? ' active' : ''}`}
                    onClick={guard(() => setEnt('onboardingType', opt))}
                  >
                    {opt === 'sales-led' ? 'Sales-led' : 'Organic'}
                  </button>
                ))}
              </div>

              <div className="role-switcher-menu-header" style={{ marginTop: 10 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Entity type
              </div>
              <div className="rs-segment-control">
                {(['business', 'individual'] as const).map(opt => {
                  const disabled = opt === 'individual' && isSalesLed;
                  return (
                    <button
                      key={opt}
                      className={`rs-segment-btn${enterpriseState.entityType === opt ? ' active' : ''}${disabled ? ' disabled' : ''}`}
                      onClick={disabled ? undefined : guard(() => setEnt('entityType', opt))}
                      disabled={disabled}
                    >
                      {opt === 'business' ? 'Business' : 'Individual'}
                    </button>
                  );
                })}
              </div>

              <div className="role-switcher-divider" style={{ margin: '6px 0' }} />

              <div className="role-switcher-menu-header">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                Enterprise state
              </div>
              <div className="rs-toggle-row">
                <span className="rs-toggle-label">Bank account added</span>
                <Toggle on={enterpriseState.bankAccountAdded} onClick={guard(() => setEnt('bankAccountAdded', !enterpriseState.bankAccountAdded))} />
              </div>
              <div className="rs-toggle-row">
                <span className="rs-toggle-label">Wallet exists</span>
                <Toggle on={enterpriseState.walletExists} onClick={guard(() => setEnt('walletExists', !enterpriseState.walletExists))} />
              </div>
            </div>

            {/* Vertical divider */}
            <div className="role-switcher-col-divider" />

            {/* Right: roles */}
            <div className="role-switcher-col">
              <div className="role-switcher-menu-header">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Preview as role
              </div>

              <button
                className={`role-switcher-item${roles.includes(SUPER) ? ' active' : ''}`}
                onClick={guard(() => handleToggleRole(SUPER))}
              >
                <div className="role-switcher-item-body">
                  <div className="role-switcher-item-name">
                    {superUser.label}
                    <span className="role-switcher-solo-tag">solo</span>
                  </div>
                  <div className="role-switcher-item-desc">{superUser.description}</div>
                </div>
                <div className={`role-switcher-radio${roles.includes(SUPER) ? ' checked' : ''}`} />
              </button>

              <div className="role-switcher-divider" />

              {otherRoles.map(r => {
                const isActive = roles.includes(r.id);
                const disabled = isOrganic;
                return (
                  <button
                    key={r.id}
                    className={`role-switcher-item${isActive ? ' active' : ''}${disabled ? ' disabled' : ''}`}
                    onClick={disabled ? undefined : guard(() => handleToggleRole(r.id))}
                    disabled={disabled}
                  >
                    <div className="role-switcher-item-body">
                      <div className="role-switcher-item-name">{r.label}</div>
                      <div className="role-switcher-item-desc">{r.description}</div>
                    </div>
                    <div className={`role-switcher-cb${isActive ? ' checked' : ''}`}>
                      {isActive && (
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2 6 5 9 10 3"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
