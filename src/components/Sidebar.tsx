import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

type SecuritySubPage = 'policies' | 'destinations' | 'activity-log' | 'roles';

/* Official BitGo shield logo (public/bitgo-logo.svg), inlined for crisp rendering. */
const BitGoLogo: React.FC<{ h?: number }> = ({ h = 24 }) => (
  <svg width={Math.round((h * 160) / 180)} height={h} viewBox="0 0 160 180" fill="none" style={{ flexShrink: 0 }}>
    <path d="M80 0L0 30v60c0 48 34.4 92.8 80 105 45.6-12.2 80-57 80-105V30L80 0Z" fill="#1652F0" />
    <g fill="#FFFFFF">
      <rect x="66" y="36" width="9" height="16" rx="1.5" />
      <rect x="85" y="36" width="9" height="16" rx="1.5" />
      <rect x="66" y="118" width="9" height="16" rx="1.5" />
      <rect x="85" y="118" width="9" height="16" rx="1.5" />
      <path d="M52 46h36c12 0 21 9 21 20.5 0 6.6-3 12.3-7.8 15.8C108.6 85.4 113 92 113 100c0 12-9.4 21.5-22 21.5H52V46zm15 13v16h19c4.7 0 8-3.4 8-8s-3.3-8-8-8H67zm0 28v18h22c5.2 0 9-3.9 9-9s-3.8-9-9-9H67z" />
    </g>
  </svg>
);

interface SidebarProps {
  variant?: 'default' | 'admin';
  activeItem?: 'home' | 'portfolio' | 'earn' | 'trade' | 'security';
  activeSecurity?: SecuritySubPage;
  activeAdmin?: 'members' | 'tasks' | 'settings';
  onNavigate?: (item: 'home' | 'trade') => void;
  onNavigateSecurity?: (sub: SecuritySubPage) => void;
  onSearchOpen?: () => void;
  onReturnToEnterprise?: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasChevron?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, hasChevron, onClick }) => (
  <div className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
    <span className="nav-item-icon">{icon}</span>
    <span className="nav-item-label">{label}</span>
    {hasChevron && (
      <svg className="nav-item-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )}
  </div>
);

const SECURITY_ITEMS: { id: SecuritySubPage; label: string; icon: React.ReactNode }[] = [
  {
    id: 'policies',
    label: 'Policies',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
        <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none" opacity="0.15"/>
        <polyline points="14 16 15.5 17.5 18 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'destinations',
    label: 'Destinations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'activity-log',
    label: 'Activity Log',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
];

const SearchNavItem: React.FC<{ onSearchOpen?: () => void }> = ({ onSearchOpen }) => (
  <div className="nav-item" onClick={() => onSearchOpen?.()}>
    <span className="nav-item-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </span>
    <span className="nav-item-label">Search</span>
    <span className="sidebar-search-kbd"><span className="kbd">⌘</span><span className="kbd">K</span></span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  variant = 'default',
  activeItem = 'home',
  activeSecurity,
  activeAdmin = 'members',
  onNavigate,
  onNavigateSecurity,
  onSearchOpen,
  onReturnToEnterprise,
}) => {
  if (variant === 'admin') {
    return (
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <BitGoLogo h={28} />
            <span className="sidebar-logo-text sidebar-logo-text--admin">Admin Console</span>
          </div>
          <button className="sidebar-toggle" title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <SearchNavItem onSearchOpen={onSearchOpen} />
          <div className="sidebar-nav-divider" />

          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>}
            label="Return"
            onClick={() => onReturnToEnterprise?.()}
          />
          <div className="sidebar-nav-divider" />

          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
            label="Members & Roles" active={activeAdmin === 'members'}
          />
          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>}
            label="Tasks" active={activeAdmin === 'tasks'}
          />
          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
            label="Settings" active={activeAdmin === 'settings'}
          />
        </nav>

        <div className="sidebar-footer">
          <NavItem
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            label="Help"
          />
        </div>
      </aside>
    );
  }

  const [securityOpen, setSecurityOpen] = useState(false);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
  const securityRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = securityRef.current?.contains(target);
      const inMenu = submenuRef.current?.contains(target);
      if (!inTrigger && !inMenu) setSecurityOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openSubmenu = () => {
    if (securityRef.current) {
      const r = securityRef.current.getBoundingClientRect();
      setSubmenuPos({ top: r.top, left: r.right + 8 });
    }
    setSecurityOpen(v => !v);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <BitGoLogo h={28} />
          <span className="sidebar-logo-text">BitGo</span>
        </div>
        <button className="sidebar-toggle" title="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <SearchNavItem onSearchOpen={onSearchOpen} />
        <div className="sidebar-nav-divider" />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
          label="Home" active={activeItem === 'home'} onClick={() => { setSecurityOpen(false); onNavigate?.('home'); }}
        />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
          label="Portfolio" active={activeItem === 'portfolio'}
        />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          label="Earn" active={activeItem === 'earn'}
        />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
          label="Trade" active={activeItem === 'trade'}
          onClick={() => onNavigate?.('trade')}
        />

        <div className="nav-section-label">More</div>

        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
          label="Prime" hasChevron
        />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>}
          label="Mint"
        />

        {/* Security with submenu */}
        <div className="nav-item-security-wrap" ref={securityRef}>
          <div
            className={`nav-item${activeItem === 'security' ? ' active' : ''}${securityOpen ? ' active' : ''}`}
            onClick={openSubmenu}
          >
            <span className="nav-item-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </span>
            <span className="nav-item-label">Security</span>
            <svg className="nav-item-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {securityOpen && ReactDOM.createPortal(
          <div
            ref={submenuRef}
            className="security-submenu"
            style={{ position: 'fixed', top: submenuPos.top, left: submenuPos.left }}
          >
            {SECURITY_ITEMS.map(item => (
              <div
                key={item.id}
                className={`security-submenu-item${activeSecurity === item.id ? ' active' : ''}`}
                onClick={() => { onNavigateSecurity?.(item.id); setSecurityOpen(false); }}
              >
                <span className="security-submenu-icon">{item.icon}</span>
                <span className="security-submenu-label">{item.label}</span>
              </div>
            ))}
          </div>,
          document.body
        )}

        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
          label="Reporting" hasChevron
        />
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}
          label="Developers"
        />
      </nav>

      <div className="sidebar-footer">
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
          label="Help"
        />
      </div>
    </aside>
  );
};
