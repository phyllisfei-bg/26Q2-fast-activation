import React from 'react';
import type { GsTask } from '../types';

interface GetStartedProps {
  doneTasks: GsTask[];
  onLaunch: (type: GsTask) => void;
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M16 12h2" />
  </svg>
);

const DepositIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  wallet:     <WalletIcon />,
  deposit:    <DepositIcon />,
  'go-account': <AccountIcon />,
};

const actions: { id: GsTask; type: string; tag: string; title: string; start: string }[] = [
  { id: 'gsWallet',    type: 'wallet',      tag: 'Step 1', title: 'Create a wallet',         start: 'Create wallet →'  },
  { id: 'gsDeposit',  type: 'deposit',     tag: 'Step 2', title: 'Make your first deposit', start: 'Deposit now →'    },
  { id: 'gsGoAccount',type: 'go-account',  tag: 'Step 3', title: 'Set up your Go Account',  start: 'Go to account →'  },
];

export const GetStarted: React.FC<GetStartedProps> = ({ doneTasks, onLaunch }) => (
  <div className="gs-card">
    <div className="gs-card-header">
      <div className="gs-card-title">Get started with BitGo</div>
      <div className="gs-card-sub">Complete these steps to set up your account. Takes about 5 minutes.</div>
    </div>
    <div className="gs-actions">
      {actions.map(a => {
        const done = doneTasks.includes(a.id);
        return (
          <div
            key={a.id}
            className={`gs-action ${a.type}${done ? ' done' : ''}`}
            onClick={() => !done && onLaunch(a.id)}
          >
            <div className="gs-action-icon">
              {done ? <CheckIcon /> : ICONS[a.type]}
            </div>
            <div className="gs-action-body">
              <div className="gs-action-pill">
                <span className="gs-action-pill-dot" />
                {a.tag}
              </div>
              <div className="gs-action-title">{a.title}</div>
            </div>
            <button className="gs-action-start" tabIndex={done ? -1 : 0}>
              {done ? 'Done ✓' : a.start}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);
