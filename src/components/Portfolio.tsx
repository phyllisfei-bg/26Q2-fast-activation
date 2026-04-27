import React, { useState } from 'react';

interface PortfolioProps {
  onOpenDeposit?: (tab: 'cash' | 'crypto') => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onOpenDeposit }) => {
  const [view, setView] = useState<'assets' | 'custody'>('assets');

  return (
    <>
      <div className="portfolio-header">
        <div className="portfolio-value-block">
          <div className="portfolio-label">Total Account Value</div>
          <div className="portfolio-amount">$0</div>
        </div>
        <div className="asset-custody-toggle">
          <button className={`toggle-btn${view === 'assets' ? ' active' : ''}`} onClick={() => setView('assets')}>Assets</button>
          <button className={`toggle-btn${view === 'custody' ? ' active' : ''}`} onClick={() => setView('custody')}>Custody</button>
        </div>
      </div>

      <div className="portfolio-body">
        <div className="donut-wrap">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle className="donut-ring-bg" cx="100" cy="100" r="70" fill="none" stroke="var(--color-level3)" strokeWidth="24" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-level4, #D1D5E8)" strokeWidth="24"
              strokeDasharray="9 431" strokeDashoffset="0" strokeLinecap="round" />
          </svg>
          <div className="donut-center-text">
            <span className="donut-center-label">Total</span>
            <span className="donut-center-value">$0</span>
          </div>
        </div>

        <div className="value-cards">
          <div className="value-card" onClick={() => onOpenDeposit?.('cash')} title="Deposit Cash">
            <div className="value-card-accent gold" />
            <div className="value-card-body">
              <div className="value-card-label">Cash</div>
              <div className="value-card-amount">$0.00</div>
            </div>
            <div className="value-card-deposit-hint">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/>
              </svg>
              Deposit
            </div>
          </div>
          <div className="value-card" onClick={() => onOpenDeposit?.('crypto')} title="Deposit Crypto">
            <div className="value-card-accent blue" />
            <div className="value-card-body">
              <div className="value-card-label">Crypto</div>
              <div className="value-card-amount">$0.00</div>
            </div>
            <div className="value-card-deposit-hint">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/>
              </svg>
              Deposit
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
