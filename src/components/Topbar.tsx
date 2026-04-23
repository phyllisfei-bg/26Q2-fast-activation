import React from 'react';

interface TopbarProps {
  isLight: boolean;
  onThemeToggle: () => void;
  onWalkthroughOpen?: (key: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ isLight, onThemeToggle }) => (
  <header className="topbar">
    <div className="topbar-enterprise">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
      <span>Acme Corp</span>
      <svg className="topbar-enterprise-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    <div className="topbar-spacer" />

    <button className="btn-move-funds">
      <span className="btn-move-funds-label">Move Funds</span>
      <span className="btn-move-funds-divider" />
      <span className="btn-move-funds-arrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <button className="topbar-icon-btn" title="Notifications">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>

    <button className="topbar-icon-btn" title="Activity">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    </button>

    <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme">
      {isLight ? (
        <svg className="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg className="icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  </header>
);
