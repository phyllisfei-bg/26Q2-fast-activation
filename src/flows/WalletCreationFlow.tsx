import React, { useState } from 'react';
import type { WalletInfo } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (wallet: WalletInfo) => void;
}

const STEPS = [
  { title: 'Enter wallet details',         desc: 'Select the asset you would like your wallet to hold. Some assets have special requirements.' },
  { title: 'Select key custody options',   desc: 'Select who needs to be in control of wallet keys.' },
  { title: 'Review & confirm',             desc: 'Confirm your wallet settings before creation.' },
];

const ASSETS = [
  { value: 'BTC', label: 'Bitcoin (BTC)',   icon: '₿', color: '#F7931A' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ', color: '#627EEA' },
  { value: 'USDC',label: 'USD Coin (USDC)',icon: '$', color: '#2775CA' },
  { value: 'SOL', label: 'Solana (SOL)',   icon: 'S', color: '#9945FF' },
];

export const WalletCreationFlow: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [name, setName]   = useState('');
  const [asset, setAsset] = useState('BTC');

  if (!open) return null;

  const selectedAsset = ASSETS.find(a => a.value === asset) || ASSETS[0];

  const handleContinue = () => {
    const walletName = name.trim() || 'My Wallet';
    onCreated({ name: walletName, asset: selectedAsset.value, assetIcon: selectedAsset.icon, assetColor: selectedAsset.color });
  };

  return (
    <div className="wallet-flow-page open" style={{ position: 'fixed', inset: 0, zIndex: 800 }}>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <button className="wallet-flow-close" onClick={onClose}>✕</button>
        <div className="wallet-flow-inner">

          {/* Left stepper */}
          <div className="wallet-flow-sidebar">
            <div className="wallet-flow-logo">
              <div className="wallet-flow-logo-mark">
                <svg width="16" height="18" viewBox="0 0 32 36" fill="none">
                  <path d="M16 0L0 6v12c0 9.6 6.88 18.56 16 21 9.12-2.44 16-11.4 16-21V6L16 0Z" fill="white" />
                </svg>
              </div>
              <div className="wallet-flow-logo-text">BitGo</div>
            </div>
            <div className="wallet-flow-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`wallet-flow-step ${i === 0 ? 'active' : 'inactive'}`}>
                  <div className="wallet-flow-step-left">
                    <div className="wallet-flow-step-circle">{i + 1}</div>
                    <div className="wallet-flow-step-line" />
                  </div>
                  <div className="wallet-flow-step-content">
                    <div className="wallet-flow-step-title">{s.title}</div>
                    <div className="wallet-flow-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="wallet-flow-main">
            <div className="wallet-flow-body">
              <div className="wallet-flow-step-heading">Enter wallet details</div>

              <div className="wf-field">
                <label className="wallet-flow-field-label">Wallet name</label>
                <input
                  className="wallet-flow-input"
                  placeholder="e.g. BTC Cold Storage"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="wallet-flow-step-subheading">Select asset</div>

              <div className="wf-field">
                <label className="wallet-flow-field-label">Asset</label>
                <div className="wallet-flow-select-wrap">
                  <select
                    className="wallet-flow-select"
                    value={asset}
                    onChange={e => setAsset(e.target.value)}
                  >
                    {ASSETS.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="wallet-flow-footer">
              <button className="wallet-flow-btn-back" onClick={onClose}>
                ← Cancel
              </button>
              <button className="wallet-flow-btn-continue" onClick={handleContinue}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
