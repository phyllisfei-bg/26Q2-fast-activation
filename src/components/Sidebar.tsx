import React from 'react';

interface SidebarProps {
  activeItem?: 'home' | 'wallets' | 'portfolio';
  onNavigate?: (item: 'home') => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  hasChevron?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, badge, hasChevron, onClick }) => (
  <div className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
    <span className="nav-item-icon">{icon}</span>
    <span className="nav-item-label">{label}</span>
    {badge && <span className="nav-item-badge">{badge}</span>}
    {hasChevron && (
      <svg className="nav-item-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'home', onNavigate }) => (
  <aside className="sidebar">
    <div className="sidebar-top">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="16" height="18" viewBox="0 0 32 36" fill="none">
            <path d="M16 0L0 6v12c0 9.6 6.88 18.56 16 21 9.12-2.44 16-11.4 16-21V6L16 0Z" fill="white" />
          </svg>
        </div>
        <span className="sidebar-logo-text">BitGo</span>
      </div>
      <button className="sidebar-toggle" title="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>
    </div>

    <div className="sidebar-search">
      <svg className="sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className="sidebar-search-text">Search</span>
      <span className="sidebar-search-kbd">
        <span className="kbd">⌘</span>
        <span className="kbd">K</span>
      </span>
    </div>

    <nav className="sidebar-nav">
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
        label="Home" active={activeItem === 'home'} onClick={() => onNavigate?.('home')}
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>}
        label="Wallets" active={activeItem === 'wallets'} hasChevron
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
        label="Portfolio" active={activeItem === 'portfolio'}
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
        label="Trading"
      />

      <div className="nav-section-label">Manage</div>

      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        label="Users" badge="3"
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 1 0 21 12" /></svg>}
        label="Policies"
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
        label="Compliance"
      />

      <div className="nav-section-label">Settings</div>

      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 1 0 21 12" /></svg>}
        label="Settings"
      />
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
        label="Help"
      />
    </nav>

    <div className="sidebar-footer">
      <NavItem
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
        label="Phyllis Fei"
      />
    </div>
  </aside>
);
