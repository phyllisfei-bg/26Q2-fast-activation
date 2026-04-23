import React, { useState } from 'react';

export const Portfolio: React.FC = () => {
  const [view, setView] = useState<'assets' | 'custody'>('assets');

  return (
    <>
      <div className="portfolio-header">
        <div className="portfolio-value-block">
          <div className="portfolio-label">Total Account Value</div>
          <div className="portfolio-amount">$1,570.10</div>
        </div>
        <div className="asset-custody-toggle">
          <button className={`toggle-btn${view === 'assets' ? ' active' : ''}`} onClick={() => setView('assets')}>Assets</button>
          <button className={`toggle-btn${view === 'custody' ? ' active' : ''}`} onClick={() => setView('custody')}>Custody</button>
        </div>
      </div>

      <div className="portfolio-body">
        <div className="donut-wrap">
          <svg width="148" height="148" viewBox="0 0 148 148">
            <circle className="donut-ring-bg" cx="74" cy="74" r="58" fill="none" stroke="var(--color-level3)" strokeWidth="16" />
            <circle
              cx="74" cy="74" r="58" fill="none"
              stroke="var(--brand-500)" strokeWidth="16"
              strokeDasharray="364.4" strokeDashoffset="273.3"
              strokeLinecap="round"
              transform="rotate(-90 74 74)"
            />
            <circle
              cx="74" cy="74" r="58" fill="none"
              stroke="var(--color-gold)" strokeWidth="16"
              strokeDasharray="364.4" strokeDashoffset="91.1"
              strokeLinecap="round"
              transform="rotate(-90 74 74)"
              style={{ transform: 'rotate(0deg)', transformOrigin: '74px 74px' }}
            />
          </svg>
          <div className="donut-center-text">
            <span className="donut-center-label">Wallets</span>
            <span className="donut-center-value">3</span>
          </div>
        </div>

        <div className="value-cards">
          <div className="value-card">
            <div className="value-card-accent blue" />
            <div className="value-card-body">
              <div className="value-card-label">Self-managed</div>
              <div className="value-card-amount">$1,570.10</div>
            </div>
          </div>
          <div className="value-card">
            <div className="value-card-accent gold" />
            <div className="value-card-body">
              <div className="value-card-label">BitGo Custody</div>
              <div className="value-card-amount">$0.00</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
