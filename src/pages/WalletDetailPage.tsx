import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import type { WalletInfo } from '../types';

interface Props {
  open: boolean;
  wallet: WalletInfo | null;
  onBack: () => void;
}

const TABS = ['Transactions', 'Addresses', 'Policies', 'Settings'] as const;

export const WalletDetailPage: React.FC<Props> = ({ open, wallet, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('Transactions');

  if (!open || !wallet) return null;

  return (
    <div className="wallet-detail-page open">
      {/* Reuse shared sidebar with Wallets active */}
      <Sidebar activeItem="wallets" onNavigate={() => onBack()} />

      <div className="wallet-detail-workspace">
        {/* Topbar */}
        <div className="wallet-detail-topbar">
          <div className="wallet-detail-breadcrumb">
            <span
              style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              onClick={onBack}
            >Wallets</span>
            <span className="wallet-detail-breadcrumb-sep">›</span>
            <span className="wallet-detail-breadcrumb-current">{wallet.name}</span>
          </div>
          <div style={{ flex: 1 }} />
          <div className="wallet-detail-action-row">
            <button className="wallet-detail-action-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Address
            </button>
            <button className="wallet-detail-action-btn primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="wallet-detail-body">
          {/* Header */}
          <div className="wallet-detail-header">
            <div>
              <div className="wallet-detail-name">{wallet.name}</div>
              <div className="wallet-detail-meta">
                <span className="wallet-detail-badge">
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2B4FD4', display: 'inline-block' }} />
                  {wallet.asset}
                </span>
                <span className="wallet-detail-type-badge">Self-Managed · Hot</span>
              </div>
            </div>
          </div>

          {/* Action banner */}
          <div className="wd-banner">
            <a className="wd-banner-card deposit">
              <div className="wd-banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="wd-banner-text">
                <div className="wd-banner-title">Make your first deposit</div>
                <div className="wd-banner-sub">Add {wallet.asset} to start using this wallet.</div>
              </div>
              <svg className="wd-banner-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a className="wd-banner-card invite">
              <div className="wd-banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B4FD4" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <line x1="23" y1="11" x2="17" y2="11" /><line x1="20" y1="8" x2="20" y2="14" />
                </svg>
              </div>
              <div className="wd-banner-text">
                <div className="wd-banner-title">Invite members</div>
                <div className="wd-banner-sub">Add team members to manage this wallet.</div>
              </div>
              <svg className="wd-banner-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="wallet-detail-stats">
            {[
              { val: '$0.00',   label: 'Total Balance'   },
              { val: '$0.00',   label: 'Available'       },
              { val: '0',       label: 'Transactions'    },
              { val: '0',       label: 'Addresses'       },
            ].map(s => (
              <div key={s.label} className="wallet-detail-stat">
                <div className="wallet-detail-stat-val">{s.val}</div>
                <div className="wallet-detail-stat-label">{s.label}</div>
              </div>
            ))}
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2B4FD4" strokeWidth="1.6">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="wallet-detail-empty-title">No {activeTab.toLowerCase()} yet</div>
            <div className="wallet-detail-empty-sub">
              {activeTab === 'Transactions'
                ? 'Transactions will appear here once you deposit or send funds.'
                : `${activeTab} will appear here once created.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
