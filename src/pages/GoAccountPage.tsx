import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from '../components/Sidebar';
import type { UserRole } from '../types';
import { CALLOUT_CONFIGS } from '../types';

interface Props {
  open: boolean;
  depositedAmount?: number;
  role: UserRole;
  onBack: () => void;
  onCalloutInvite?: () => void;
  onCalloutPolicies?: () => void;
}

interface CalloutPos { top: number; left: number }

const TABS = ['Balances by Asset', 'Transactions', 'Orders'] as const;

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const GoAccountPage: React.FC<Props> = ({
  open, depositedAmount = 0, role: _role, onBack, onCalloutInvite, onCalloutPolicies,
}) => {
  const [activeTab, setActiveTab] = useState<string>('Balances by Asset');
  const [search, setSearch]       = useState('');
  const [calloutIdx, setCalloutIdx] = useState<number>(-1);
  const [positions, setPositions]   = useState<Record<string, CalloutPos>>({});

  const avatarRef = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLDivElement>(null);
  const iconRef   = useRef<HTMLDivElement>(null);

  const sequence = ['ga_whatsGoAccount', 'ga_policies', 'ga_invite'];
  const activeCalloutId = calloutIdx >= 0 && calloutIdx < sequence.length
    ? sequence[calloutIdx] : null;
  const activeCallout = activeCalloutId ? CALLOUT_CONFIGS[activeCalloutId] : null;

  useEffect(() => {
    if (!open) { setCalloutIdx(-1); setActiveTab('Balances by Asset'); return; }
    setCalloutIdx(-1);
    const t = setTimeout(() => setCalloutIdx(0), 600);
    return () => clearTimeout(t);
  }, [open]);

  useLayoutEffect(() => {
    if (!activeCallout) return;
    const refs: Record<string, React.RefObject<HTMLElement | null>> = {
      avatar:     avatarRef,
      walletName: titleRef,
      deposit:    titleRef,
      icon:       iconRef,
    };
    const ref = refs[activeCallout.anchor];
    if (!ref?.current) return;
    const r = ref.current.getBoundingClientRect();
    let pos: CalloutPos;
    if (activeCallout.caretDir === 'up-right') {
      pos = { top: r.bottom + 10, left: r.left - 228 };
    } else {
      pos = { top: r.bottom + 12, left: r.left };
    }
    setPositions(prev => ({ ...prev, [activeCallout.id]: pos }));
  }, [activeCallout]);

  const advance = () => {
    const next = calloutIdx + 1;
    setCalloutIdx(-1);
    setTimeout(() => setCalloutIdx(next < sequence.length ? next : -1), 300);
  };

  const handlePrimary = () => {
    if (!activeCallout) return;
    if (activeCallout.type === 'workflow') {
      if (activeCallout.id === 'invite'   || activeCallout.id === 'ga_invite')   onCalloutInvite?.();
      if (activeCallout.id === 'policies' || activeCallout.id === 'ga_policies') onCalloutPolicies?.();
    }
    advance();
  };

  if (!open) return null;

  const calloutPos = activeCallout ? positions[activeCallout.id] : null;
  const hasBalance = depositedAmount > 0;

  return (
    <div className="wallet-detail-page open">
      <Sidebar activeItem="portfolio" onNavigate={(item) => { if (item === 'trade') { window.location.hash = '#trade'; } else { onBack(); } }} />

      <div className="wallet-detail-workspace">
        {/* Topbar */}
        <div className="wallet-detail-topbar">
          <div className="wallet-detail-breadcrumb">
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Portfolio</span>
            <span className="wallet-detail-breadcrumb-sep">›</span>
            <span className="wallet-detail-breadcrumb-current">Go Account</span>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        {/* Body */}
        <div className="wallet-detail-body">

          {/* Header */}
          <div className="wallet-detail-header">
            <div className="wallet-detail-title-group">
              <div className="wallet-detail-icon-wrap" ref={iconRef}>
                <div className="wallet-detail-icon-bg">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2B4FD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="wallet-detail-name" ref={titleRef}>Go Account</div>
                <div className="wallet-detail-id-row">Off-exchange settlement &amp; trading</div>
                <div className="wallet-detail-meta">
                  <div className="wallet-detail-badge">Trader</div>
                  <div className="wallet-detail-badge">Spender</div>
                </div>
              </div>
            </div>

            <div className="wallet-detail-header-right">
              <div className="wd-avatar" ref={avatarRef}>GT</div>
              <button className="wd-menu-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="wallet-detail-stats">
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">{hasBalance ? `$${fmt(depositedAmount)}` : '$0.00'}</div>
              <div className="wallet-detail-stat-label">Balance (USD)</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">{hasBalance ? `$${fmt(depositedAmount)}` : '$0.00'}</div>
              <div className="wallet-detail-stat-label">Available to Trade</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">$0.00</div>
              <div className="wallet-detail-stat-label">Pending Settlement</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">0</div>
              <div className="wallet-detail-stat-label">Total Trades</div>
            </div>
          </div>

          {/* Tabs + search */}
          <div className="ga-tabs-row">
            <div className="wallet-detail-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
              {TABS.map(t => (
                <div
                  key={t}
                  className={`wallet-detail-tab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >{t}</div>
              ))}
            </div>
            <div className="ga-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ga-search-input"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="ga-tabs-divider" />

          {/* Balance table */}
          {activeTab === 'Balances by Asset' && (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)] w-[45%]">Asset</th>
                    <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]">Total Balance</th>
                    <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]">Withdrawable Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {hasBalance ? (
                    <tr>
                      <td className="px-4 py-3 border-b border-[var(--color-border)]">
                        <div className="ga-col-asset">
                          <div className="ga-asset-icon">$</div>
                          <div>
                            <div className="ga-asset-name">USD</div>
                            <div className="ga-asset-sub">US Dollar</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">${fmt(depositedAmount)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">${fmt(depositedAmount)}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center">
                        <div className="wallet-detail-empty-title">No balances yet</div>
                        <div className="wallet-detail-empty-sub">Deposit funds to start trading.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'Transactions' || activeTab === 'Orders') && (
            <div className="wallet-detail-empty">
              <div className="wallet-detail-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B4FD4" strokeWidth="1.6" strokeLinecap="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <div className="wallet-detail-empty-title">No {activeTab} Yet</div>
              <div className="wallet-detail-empty-sub">Place a trade to get started.</div>
            </div>
          )}

        </div>
      </div>

      {/* Callout portal */}
      {activeCallout && calloutPos && createPortal(
        <div className="wd-callout" style={{ top: calloutPos.top, left: calloutPos.left }}>
          {activeCallout.caretDir === 'left'     && <div className="wd-callout-caret-left" />}
          {activeCallout.caretDir === 'up-right' && <div className="wd-callout-caret-up" style={{ right: 22, left: 'auto' }} />}
          {activeCallout.caretDir === 'up-left'  && <div className="wd-callout-caret-up" style={{ left: 20 }} />}

          <button className="wd-callout-dismiss" onClick={advance}>×</button>
          <div className="wd-callout-title">{activeCallout.title}</div>
          <div className="wd-callout-body">{activeCallout.body}</div>

          {activeCallout.type === 'workflow' ? (
            <div className="wd-callout-actions">
              <button className="wd-callout-btn-primary" onClick={handlePrimary}>
                {activeCallout.primaryCta}
              </button>
              {activeCallout.secondaryCta && (
                <button className="wd-callout-btn-ghost" onClick={advance}>
                  {activeCallout.secondaryCta}
                </button>
              )}
            </div>
          ) : (
            <button className="wd-callout-cta" onClick={advance}>
              {activeCallout.primaryCta}
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
