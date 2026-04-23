import React, { useState } from 'react';

const CARDS = [
  {
    title: 'Explore Prime Services',
    desc:  'Access institutional-grade OTC trading, staking, and lending through BitGo Prime.',
    link:  'Learn more →',
  },
  {
    title: 'Enable Go Network',
    desc:  'Settle instantly with counterparties off-chain. No fees, no settlement risk.',
    link:  'Set up →',
  },
  {
    title: 'Add team members',
    desc:  'Invite colleagues and assign roles to manage wallets and policies together.',
    link:  'Invite →',
  },
  {
    title: 'Configure spend policies',
    desc:  'Set daily limits, whitelist addresses, and require multi-sig approvals.',
    link:  'Configure →',
  },
];

export const ForYou: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="for-you-section">
      <div className="for-you-header">
        <span className="for-you-label">For You</span>
        <button className="btn-close-foryou" onClick={() => setHidden(true)}>Dismiss</button>
      </div>
      <div className="for-you-cards">
        {CARDS.map(c => (
          <div key={c.title} className="for-you-card">
            <div className="for-you-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="1.8">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="for-you-card-body">
              <div className="for-you-card-title">{c.title}</div>
              <div className="for-you-card-desc">{c.desc}</div>
              <a className="for-you-card-link">{c.link}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
