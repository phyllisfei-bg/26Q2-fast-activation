import React, { useState } from 'react';

interface Props {
  open: boolean;
  initialTab?: 'cash' | 'crypto';
  onClose: () => void;
  onDeposited: (msg: string) => void;
}

type DepTab = 'cash' | 'crypto';

const DEP_ADDRESSES: Record<string, string> = {
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  SOL: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKH',
};

const DEP_NETWORKS: Record<string, string[]> = {
  BTC:  ['Bitcoin Mainnet'],
  ETH:  ['Ethereum Mainnet', 'Base', 'Arbitrum'],
  USDC: ['Ethereum Mainnet', 'Base', 'Polygon'],
  SOL:  ['Solana Mainnet'],
};

export const DepositModal: React.FC<Props> = ({ open, initialTab = 'cash', onClose, onDeposited }) => {
  // userTab tracks explicit user tab-switches; null means "use initialTab"
  const [userTab, setUserTab] = useState<DepTab | null>(null);
  const tab: DepTab = userTab ?? initialTab ?? 'cash';

  // Reset user override whenever the modal closes
  React.useEffect(() => { if (!open) setUserTab(null); }, [open]);
  const [cashAmt, setCashAmt]     = useState('');
  const [cashSrc, setCashSrc]     = useState('');
  const [cryptoAsset, setCryptoAsset] = useState('BTC');
  const [copied, setCopied]       = useState(false);

  const addr = DEP_ADDRESSES[cryptoAsset] || '';
  const networks = DEP_NETWORKS[cryptoAsset] || [];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const submitCash = () => {
    const amt = parseFloat(cashAmt);
    if (!amt || amt <= 0) return;
    if (!cashSrc) return;
    const msg = `Cash deposit of $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} initiated`;
    setCashAmt('');
    setCashSrc('');
    onDeposited(msg);
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`wf-overlay${open ? ' open' : ''}`} onClick={handleOverlayClick}>
      <div className="wf-modal" style={{ maxWidth: 480 }}>
        <div className="wf-modal-header">
          <div className="wf-modal-title">Deposit Funds</div>
          <button className="wf-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wf-modal-body">
          <div className="dep-tabs">
            <button
              className={`dep-tab${tab === 'cash' ? ' active' : ''}`}
              onClick={() => setUserTab('cash')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Cash
            </button>
            <button
              className={`dep-tab${tab === 'crypto' ? ' active' : ''}`}
              onClick={() => setUserTab('crypto')}
            >
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
                <select className="wf-select" value={cashSrc} onChange={e => setCashSrc(e.target.value)}>
                  <option value="">Select an account…</option>
                  <option value="checking">Chase Checking ····4242</option>
                  <option value="savings">Chase Savings ····8819</option>
                  <option value="wire">Wire Transfer</option>
                </select>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                <button
                  className="wf-btn-primary"
                  onClick={submitCash}
                  disabled={!cashAmt || !cashSrc}
                >Deposit Cash</button>
              </div>
            </div>
          )}

          {tab === 'crypto' && (
            <div className="dep-panel active">
              <div className="wf-field">
                <label className="wf-label">Asset</label>
                <select
                  className="wf-select"
                  value={cryptoAsset}
                  onChange={e => setCryptoAsset(e.target.value)}
                >
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
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="wf-btn-primary" onClick={copyAddr}>
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
