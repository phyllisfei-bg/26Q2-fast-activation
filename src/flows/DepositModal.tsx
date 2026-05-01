import React, { useState } from 'react';

interface Props {
  open: boolean;
  initialTab?: 'cash' | 'crypto';
  onClose: () => void;
  onDeposited: (msg: string, amount?: number) => void;
}

type DepTab = 'cash' | 'crypto';
type SubView = null | 'add-bank';

const BANK_OPTIONS = [
  { section: 'ACH',  id: 'plaid', icon: 'plus', name: 'Add ACH',  sub: '', result: 'Plaid Checking ····0001'       },
  { section: 'WIRE', id: 'wire',  icon: 'plus', name: 'Add Wire', sub: '', result: 'Customers Bank · WIRE 5766400' },
  { section: 'CBIT', id: 'cbit',  icon: 'plus', name: 'Add CBIT', sub: '', result: 'Cubix · CBIT 1234'             },
];

const DEP_ADDRESSES: Record<string, string> = {
  BTC:  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH:  '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  SOL:  'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKH',
};

const DEP_NETWORKS: Record<string, string[]> = {
  BTC:  ['Bitcoin Mainnet'],
  ETH:  ['Ethereum Mainnet', 'Base', 'Arbitrum'],
  USDC: ['Ethereum Mainnet', 'Base', 'Polygon'],
  SOL:  ['Solana Mainnet'],
};

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const DepositModal: React.FC<Props> = ({ open, initialTab = 'cash', onClose, onDeposited }) => {
  const [userTab, setUserTab] = useState<DepTab | null>(null);
  const tab: DepTab = userTab ?? initialTab ?? 'cash';
  const [subView, setSubView] = useState<SubView>(null);
  const [bankAccount, setBankAccount] = useState<string | null>(null);
  const [cashAmt, setCashAmt] = useState('');
  const [cryptoAsset, setCryptoAsset] = useState('BTC');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!open) {
      setUserTab(null);
      setSubView(null);
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSelectBank = (result: string) => {
    setBankAccount(result);
    setSubView(null);
  };

  const submitCash = () => {
    const amt = parseFloat(cashAmt);
    if (!amt || amt <= 0 || !bankAccount) return;
    const msg = `Cash deposit of $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} initiated`;
    setCashAmt('');
    onDeposited(msg, amt);
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(DEP_ADDRESSES[cryptoAsset] || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addr = DEP_ADDRESSES[cryptoAsset] || '';
  const networks = DEP_NETWORKS[cryptoAsset] || [];

  // Group bank options by section, preserving order
  const sections: { label: string; opts: typeof BANK_OPTIONS }[] = [];
  for (const opt of BANK_OPTIONS) {
    const last = sections[sections.length - 1];
    if (last && last.label === opt.section) last.opts.push(opt);
    else sections.push({ label: opt.section, opts: [opt] });
  }

  return (
    <div className={`dep-drawer-overlay${open ? ' open' : ''}`} onClick={handleOverlayClick}>
      <div className="dep-drawer" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="dep-drawer-header">
          <div className="dep-drawer-breadcrumb">
            {subView ? (
              <>
                <button className="dep-breadcrumb-back" onClick={() => setSubView(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5m0 0l7-7m-7 7l7 7"/>
                  </svg>
                </button>
                <span className="dep-breadcrumb-current">Payment type</span>
              </>
            ) : (
              <span className="dep-breadcrumb-title">Deposit</span>
            )}
          </div>
          <button className="dep-drawer-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="dep-drawer-body">

          {subView === 'add-bank' ? (
            /* ── Payment type subview ── */
            <div className="dep-bank-list">
              {sections.map(({ label, opts }) => (
                <div key={label}>
                  <div className="dep-bank-section-label">{label}</div>
                  {opts.map(opt => (
                    <div
                      key={opt.id}
                      className="dep-bank-option"
                      onClick={() => handleSelectBank(opt.result)}
                    >
                      <div className="dep-bank-option-icon">
                        {opt.icon === 'plus' ? <PlusIcon /> : <GlobeIcon />}
                      </div>
                      <div className="dep-bank-option-body">
                        <div className="dep-bank-option-name">{opt.name}</div>
                        {opt.sub && <div className="dep-bank-option-sub">{opt.sub}</div>}
                      </div>
                      <svg className="dep-bank-option-chevron" width="7" height="13" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l6 6-6 6"/>
                      </svg>
                    </div>
                  ))}
                </div>
              ))}
            </div>

          ) : (
            /* ── Main deposit form ── */
            <>
              <div className="dep-tabs">
                <button className={`dep-tab${tab === 'cash' ? ' active' : ''}`} onClick={() => setUserTab('cash')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  Cash
                </button>
                <button className={`dep-tab${tab === 'crypto' ? ' active' : ''}`} onClick={() => setUserTab('crypto')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.5 9h4a1.5 1.5 0 0 1 0 3H9.5m4.5 0h-4.5m0 0v6"/>
                  </svg>
                  Crypto
                </button>
              </div>

              {tab === 'cash' && (
                <div className="dep-panel active">
                  <div className="wf-field">
                    <label className="wf-label">Amount</label>
                    <input
                      className="wf-input"
                      type="number"
                      placeholder="0.00"
                      value={cashAmt}
                      onChange={e => setCashAmt(e.target.value)}
                    />
                  </div>

                  <div className="wf-field">
                    <label className="wf-label">From bank account</label>
                    {bankAccount ? (
                      <div className="dep-bank-selected">
                        <span className="dep-bank-selected-name">{bankAccount}</span>
                        <button className="dep-bank-change-btn" onClick={() => setSubView('add-bank')}>Change</button>
                      </div>
                    ) : (
                      <button className="dep-bank-add-btn" onClick={() => setSubView('add-bank')}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add bank account
                      </button>
                    )}
                  </div>

                  <div className="wf-field">
                    <label className="wf-label">Currency</label>
                    <select className="wf-select">
                      <option>USD – US Dollar</option>
                      <option>EUR – Euro</option>
                      <option>GBP – British Pound</option>
                    </select>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Funds typically arrive within 1–3 business days via ACH.
                  </p>

                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                      className="wf-btn-primary"
                      onClick={submitCash}
                      disabled={!cashAmt || !bankAccount}
                    >Deposit Cash</button>
                  </div>
                </div>
              )}

              {tab === 'crypto' && (
                <div className="dep-panel active">
                  <div className="wf-field">
                    <label className="wf-label">Asset</label>
                    <select className="wf-select" value={cryptoAsset} onChange={e => setCryptoAsset(e.target.value)}>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDC">USD Coin (USDC)</option>
                      <option value="SOL">Solana (SOL)</option>
                    </select>
                  </div>
                  <div className="wf-field">
                    <label className="wf-label">Network</label>
                    <select className="wf-select">
                      {networks.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="wf-field">
                    <label className="wf-label">Deposit address</label>
                    <div className="dep-address-box">
                      <span>{addr}</span>
                      <button className="dep-copy-btn" onClick={copyAddr} title="Copy address">
                        {copied ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-500)" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Only send <strong>{cryptoAsset}</strong> to this address. Sending other assets may result in permanent loss.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="wf-btn-primary" onClick={copyAddr}>
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
