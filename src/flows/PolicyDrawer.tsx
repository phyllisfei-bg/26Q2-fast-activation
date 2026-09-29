import React, { useEffect, useState } from 'react';
import type { PolicyDraft } from '../types';

interface Props {
  open: boolean;
  policy: PolicyDraft | null;
  entry?: 'preview' | 'edit';   // 'edit' opens with the Actions menu already open
  onClose: () => void;
}

const policyIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" />
    <circle cx="15.5" cy="15.5" r="3.2" fill="currentColor" stroke="none" opacity="0.18" />
    <polyline points="14 15.5 15.2 16.7 17 14.8" strokeWidth="1.4" />
  </svg>
);

/**
 * Policy Detail side drawer — mirrors the real product policy drawer
 * (Figma Policies 4633:68347): slides in from the right with an Overview /
 * Activity Log tabbed detail view. Opened from the AI chat's policy-card
 * Edit / Preview actions. Copy is populated from the recommended policy.
 */
export const PolicyDrawer: React.FC<Props> = ({ open, policy, entry = 'preview', onClose }) => {
  const [tab, setTab] = useState<'overview' | 'activity'>('overview');
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    if (open) { setTab('overview'); setActionsOpen(entry === 'edit'); }
  }, [open, entry]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !policy) return null;

  const get = (k: string) => policy.detail.find(d => new RegExp(k, 'i').test(d.label))?.value;
  const trigger = get('trigger');
  const condition = get('condition');
  const scope = get('scope');
  const action = get('action');

  return (
    <div className="policy-drawer-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="policy-drawer" role="dialog" aria-label="Policy detail" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="policy-drawer-header">
          <div className="policy-drawer-title">Policy Detail</div>
          <button className="policy-drawer-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sub-header: icon + name + status + Actions */}
        <div className="policy-drawer-subhead">
          <span className="policy-drawer-badge-icon">{policyIcon}</span>
          <div className="policy-drawer-name-group">
            <div className="policy-drawer-name">{policy.name}</div>
            <div className="policy-drawer-metaline">
              Recommendation
              <span className="policy-drawer-dot">•</span>
              <span className="policy-drawer-status">Not applied</span>
            </div>
          </div>
          <div className="policy-drawer-actions-wrap">
            <button className="policy-drawer-actions-btn" onClick={() => setActionsOpen(o => !o)}>
              Actions
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                style={{ transform: actionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {actionsOpen && (
              <div className="policy-drawer-actions-menu">
                <button className="policy-drawer-actions-item" onClick={() => setActionsOpen(false)}>Edit policy</button>
                <button className="policy-drawer-actions-item" onClick={() => setActionsOpen(false)}>Duplicate</button>
                <button className="policy-drawer-actions-item" onClick={() => setActionsOpen(false)}>Disable</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="policy-drawer-tabs">
          <button className={`policy-drawer-tab${tab === 'overview' ? ' active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`policy-drawer-tab${tab === 'activity' ? ' active' : ''}`} onClick={() => setTab('activity')}>Activity Log</button>
        </div>

        {/* Body */}
        <div className="policy-drawer-body">
          {tab === 'overview' ? (
            <div className="policy-drawer-rows">
              <div className="policy-drawer-row">
                <div className="policy-drawer-row-label">Policy Lock</div>
                <div className="policy-drawer-row-value">
                  <span className="policy-drawer-lock">Editable</span>
                  <div className="policy-drawer-sub">Not yet applied — apply to activate and lock this policy.</div>
                </div>
              </div>
              {trigger && (
                <div className="policy-drawer-row">
                  <div className="policy-drawer-row-label">Trigger</div>
                  <div className="policy-drawer-row-value">{trigger}</div>
                </div>
              )}
              {condition && (
                <div className="policy-drawer-row">
                  <div className="policy-drawer-row-label">Condition</div>
                  <div className="policy-drawer-row-value">{condition}</div>
                </div>
              )}
              {scope && (
                <div className="policy-drawer-row">
                  <div className="policy-drawer-row-label">Scope</div>
                  <div className="policy-drawer-row-value">{scope}</div>
                </div>
              )}
              {action && (
                <div className="policy-drawer-row">
                  <div className="policy-drawer-row-label">Action</div>
                  <div className="policy-drawer-row-value">{action}</div>
                </div>
              )}
              <div className="policy-drawer-row">
                <div className="policy-drawer-row-label">Last Triggered</div>
                <div className="policy-drawer-row-value policy-drawer-muted">Not yet applied</div>
              </div>
              <div className="policy-drawer-row">
                <div className="policy-drawer-row-label">ID</div>
                <div className="policy-drawer-row-value policy-drawer-muted">—</div>
              </div>
            </div>
          ) : (
            <div className="policy-drawer-empty">No activity yet — this policy has not been applied.</div>
          )}
        </div>
      </aside>
    </div>
  );
};
