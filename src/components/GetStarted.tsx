import React from 'react';
import type { GsTask } from '../types';

interface GetStartedProps {
  doneTasks: GsTask[];
  onLaunch: (type: GsTask) => void;
  allDone?: boolean;
  onDismiss?: () => void;
}

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const LearnIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const ACTIONS: {
  id: GsTask;
  cls: string;
  title: string;
  time: string;
  previewIcon: React.ReactNode;
}[] = [
  {
    id: 'gsWallet',
    cls: 'wallet',
    title: 'Create Your First Wallet',
    time: '2 min',
    previewIcon: (
      <svg className="gs-preview-img-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'gsGoAccount',
    cls: 'go-account',
    title: 'Trade on Go Account',
    time: '2 min',
    previewIcon: (
      <svg className="gs-preview-img-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    id: 'gsPolicy',
    cls: 'policy',
    title: 'Configure Your First Policy',
    time: '3 min',
    previewIcon: (
      <svg className="gs-preview-img-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
];

export const GetStarted: React.FC<GetStartedProps> = ({ doneTasks, onLaunch, allDone, onDismiss }) => (
  <div className={`gs-card${allDone ? ' gs-card-complete' : ''}`}>
    <div className="gs-card-header">
      <div className="gs-card-title-row">
        <div className="gs-card-title">
          {allDone ? 'Setup Complete' : 'Get Started'}
        </div>
        {allDone && (
          <button className="gs-card-close" onClick={onDismiss} title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <div className="gs-card-sub">
        {allDone
          ? 'All essentials are active — your enterprise is ready to go.'
          : 'Complete these steps to set up your account. Takes about 5 minutes.'}
      </div>
    </div>

    <div className="gs-actions">
      {ACTIONS.map(a => {
        const done = doneTasks.includes(a.id);
        return (
          <div key={a.id} className={`gs-action ${a.cls}${done ? ' done' : ''}`}>
            <div className="gs-action-title-row">
              <div className="gs-action-title">{a.title}</div>
              <div className="gs-action-pill">
                <span className="gs-action-pill-dot" />
                {a.time}
              </div>
            </div>

            {done ? (
              <div className="gs-action-complete-badge">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Complete
              </div>
            ) : (
              <button className="gs-action-start" onClick={() => onLaunch(a.id)}>
                Start <ArrowIcon />
              </button>
            )}

            <div className="gs-preview">
              {a.previewIcon}
              <span className="gs-preview-img-label">Image placeholder</span>
              <div className="gs-action-cta-row">
                <button className="gs-action-learn"><LearnIcon />Learn More</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
