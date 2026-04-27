import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from '../components/Sidebar';
import type { WalletInfo } from '../types';

interface Props {
  open: boolean;
  wallet: WalletInfo | null;
  calloutReady?: boolean;
  onBack: () => void;
}

type CalloutStep = 'none' | 'deposit' | 'invite' | 'policies';

interface CalloutPos { top: number; left: number }

const TABS = ['Transactions', 'Receive', 'Send', 'Settings'] as const;

// Generates a fake wallet ID for display
const FAKE_ID = '69e18c26…d90029cb';

export const WalletDetailPage: React.FC<Props> = ({ open, wallet, calloutReady = false, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('Transactions');
  const [callout, setCallout] = useState<CalloutStep>('none');
  const [depositPos, setDepositPos] = useState<CalloutPos | null>(null);
  const [invitePos,  setInvitePos]  = useState<CalloutPos | null>(null);
  const [policiesPos, setPoliciesPos] = useState<CalloutPos | null>(null);

  const depositBtnRef  = useRef<HTMLButtonElement>(null);
  const avatarRef      = useRef<HTMLDivElement>(null);
  const walletNameRef  = useRef<HTMLDivElement>(null);

  // Reset tabs when wallet opens/closes
  useEffect(() => {
    if (!open) { setCallout('none'); return; }
    setCallout('none');
    setActiveTab('Transactions');
  }, [open]);

  // Start callout sequence only after snackbar dismisses
  useEffect(() => {
    if (!calloutReady || !open) return;
    const t = setTimeout(() => setCallout('deposit'), 300);
    return () => clearTimeout(t);
  }, [calloutReady, open]);

  // Position callout when step changes
  useLayoutEffect(() => {
    if (callout === 'deposit' && depositBtnRef.current) {
      const r = depositBtnRef.current.getBoundingClientRect();
      setDepositPos({ top: r.top + r.height / 2 - 52, left: r.right + 12 });
    }
    if (callout === 'invite' && avatarRef.current) {
      const r = avatarRef.current.getBoundingClientRect();
      setInvitePos({ top: r.bottom + 10, left: r.left - 228 });
    }
    if (callout === 'policies' && walletNameRef.current) {
      const r = walletNameRef.current.getBoundingClientRect();
      setPoliciesPos({ top: r.bottom + 12, left: r.left });
    }
  }, [callout]);

  const dismissDeposit = () => {
    setCallout('none');
    setTimeout(() => setCallout('invite'), 300);
  };
  const dismissInvite = () => {
    setCallout('none');
    setTimeout(() => setCallout('policies'), 300);
  };
  const dismissPolicies = () => setCallout('none');

  if (!open || !wallet) return null;

  const coinSymbol = wallet.asset === 'BTC' ? '₿' : wallet.asset === 'ETH' ? 'Ξ' : wallet.asset[0];
  const coinBg     = wallet.asset === 'BTC' ? '#F7931A' : wallet.asset === 'ETH' ? '#627EEA' : '#9945FF';

  return (
    <div className="wallet-detail-page open">
      <Sidebar activeItem="home" onNavigate={onBack} />

      <div className="wallet-detail-workspace">
        {/* ── Topbar ── */}
        <div className="wallet-detail-topbar">
          <div className="wallet-detail-breadcrumb">
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Wallets</span>
            <span className="wallet-detail-breadcrumb-sep">›</span>
            <span className="wallet-detail-breadcrumb-current">{wallet.name}</span>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        {/* ── Body ── */}
        <div className="wallet-detail-body">

          {/* Header */}
          <div className="wallet-detail-header">
            <div className="wallet-detail-title-group">
              {/* Wallet icon + coin badge */}
              <div className="wallet-detail-icon-wrap">
                <div className="wallet-detail-icon-bg">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div className="wallet-detail-coin-badge" style={{ background: coinBg }}>{coinSymbol}</div>
              </div>

              {/* Name, ID, role badges */}
              <div>
                <div className="wallet-detail-name" ref={walletNameRef}>{wallet.name}</div>
                <div className="wallet-detail-id-row">
                  Wallet ID: <span>{FAKE_ID}</span>
                  <button className="wallet-detail-id-copy" title="Copy ID">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
                <div className="wallet-detail-meta">
                  <div className="wallet-detail-badge">Admin</div>
                  <div className="wallet-detail-badge">Spender</div>
                  <div className="wallet-detail-badge">Viewer</div>
                </div>
              </div>
            </div>

            {/* Avatar + menu */}
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
              <div className="wallet-detail-stat-val">$0.00</div>
              <div className="wallet-detail-stat-label">Balance (USD)</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">0.000000 {wallet.asset}</div>
              <div className="wallet-detail-stat-label">Balance (Asset)</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">0</div>
              <div className="wallet-detail-stat-label">Transactions</div>
            </div>
            <div className="wallet-detail-stat">
              <div className="wallet-detail-stat-val">3/5</div>
              <div className="wallet-detail-stat-label">Approvals required</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="wallet-detail-tabs">
            {TABS.map(t => (
              <div
                key={t}
                className={`wallet-detail-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
              >{t}</div>
            ))}
          </div>

          {/* Empty state */}
          <div className="wallet-detail-empty">
            <div className="wallet-detail-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B4FD4" strokeWidth="1.6" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div className="wallet-detail-empty-title">No Transactions Yet</div>
            <div className="wallet-detail-empty-sub">Deposit funds to start using this wallet.</div>
            <button
              ref={depositBtnRef}
              className="wallet-detail-action-btn primary"
              style={{ marginTop: 14 }}
            >+ Deposit Funds</button>
          </div>

        </div>
      </div>

      {/* ── Callouts (portal) ── */}
      {callout === 'deposit' && depositPos && createPortal(
        <div className="wd-callout" style={{ top: depositPos.top, left: depositPos.left }}>
          <div className="wd-callout-caret-left" />
          <button className="wd-callout-dismiss" onClick={dismissDeposit}>×</button>
          <div className="wd-callout-title">Fund your wallet</div>
          <div className="wd-callout-body">Deposit crypto or fiat to start sending, receiving, and trading from this wallet.</div>
          <button className="wd-callout-cta" onClick={dismissDeposit}>Learn more about wallets</button>
        </div>,
        document.body
      )}

      {callout === 'invite' && invitePos && createPortal(
        <div className="wd-callout" style={{ top: invitePos.top, left: invitePos.left }}>
          <div className="wd-callout-caret-up" style={{ right: 22, left: 'auto' }} />
          <button className="wd-callout-dismiss" onClick={dismissInvite}>×</button>
          <div className="wd-callout-title">Invite your team</div>
          <div className="wd-callout-body">Add colleagues to manage approvals, policies, and reporting together.</div>
          <button className="wd-callout-cta" onClick={dismissInvite}>Invite Members</button>
        </div>,
        document.body
      )}

      {callout === 'policies' && policiesPos && createPortal(
        <div className="wd-callout" style={{ top: policiesPos.top, left: policiesPos.left }}>
          <div className="wd-callout-caret-up" style={{ left: 20 }} />
          <button className="wd-callout-dismiss" onClick={dismissPolicies}>×</button>
          <div className="wd-callout-title">Secured by 2 default policies</div>
          <div className="wd-callout-body">Your wallet is protected by BitGo's default transaction approval and spend limit policies.</div>
          <div className="wd-callout-actions">
            <button className="wd-callout-btn-primary" onClick={dismissPolicies}>View</button>
            <button className="wd-callout-btn-ghost" onClick={dismissPolicies}>Learn More</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
