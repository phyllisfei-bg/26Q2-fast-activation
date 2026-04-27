import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

type SecuritySubPage = 'policies' | 'destinations' | 'activity-log' | 'roles';

interface SidebarProps {
  activeItem?: 'home' | 'portfolio' | 'earn' | 'trade' | 'security';
  activeSecurity?: SecuritySubPage;
  onNavigate?: (item: 'home') => void;
  onNavigateSecurity?: (sub: SecuritySubPage) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'home',
  activeSecurity,
  onNavigate,
  onNavigateSecurity,
}) => {
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
