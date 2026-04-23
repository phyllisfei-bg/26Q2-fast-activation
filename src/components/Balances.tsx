import React from 'react';

interface BalancesProps {
  onDeposit?: () => void;
}

export const Balances: React.FC<BalancesProps> = ({ onDeposit }) => (
  <div className="balances-section">
    <div className="balances-title">
      Balances
      <span className="tooltip-badge">
        <span className="tooltip-dot" />
        New
      </span>
    </div>
    <div className="balances-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.4">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
      <div className="balances-empty-title">No balances yet</div>
      <div className="balances-empty-desc">Create a wallet and make your first deposit to get started.</div>
      <button className="btn-deposit-cta" onClick={onDeposit}>Deposit</button>
    </div>
  </div>
);
