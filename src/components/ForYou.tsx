import React, { useState } from 'react';

const CARDS = [
  {
    id: 'warm-wallet',
    title: 'Secondary Action 1',
    desc:  'This action is related to user role(s) or BitGo strategy, description length 2-line max.',
    link:  'Set up →',
  },
  {
    id: 'staking',
    title: 'Secondary Action 2',
    desc:  'This action is related to user role(s) or BitGo strategy, description length 2-line max.',
    link:  'Learn more →',
  },
  {
    id: 'prime',
    title: 'Secondary Action 3',
    desc:  'This action is related to user role(s) or BitGo strategy, description length 2-line max.',
    link:  'Learn more →',
  },
  {
    id: 'team',
    title: 'Secondary Action 4',
    desc:  'This action is related to user role(s) or BitGo strategy, description length 2-line max.',
    link:  'Invite →',
  },
];

interface ForYouProps {
  allDone: boolean;
}

export const ForYou: React.FC<ForYouProps> = ({ allDone }) => {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  if (!allDone) return null;
  const visible = CARDS.filter(c => !hiddenIds.has(c.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => setHiddenIds(prev => new Set([...prev, id]));

  return (
    <div className="for-you-section">
      <div className="for-you-header">
        <span className="for-you-label">For You</span>
      </div>
      <div className="for-you-cards">
        {visible.map(c => (
          <div key={c.id} className="for-you-card">
            <button
              className="for-you-card-dismiss"
              onClick={() => dismiss(c.id)}
              title="Dismiss"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
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
