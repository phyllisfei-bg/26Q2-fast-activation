import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

type SecuritySubPage = 'policies' | 'destinations' | 'activity-log' | 'roles';
type MoreMenu = 'liquidity' | 'security';

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

/* 18px flyout glyphs (stroke = currentColor so they theme + highlight correctly). */
const g = (path: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

interface FlyoutItem { id: string; label: string; icon: React.ReactNode; }

const SECURITY_ITEMS: FlyoutItem[] = [
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
  // Map pin with route tail — "whitelisted destination"
  { id: 'destinations', label: 'Whitelist Destinations', icon: g(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>) },
  // Building — organization roles & permissions
  { id: 'roles', label: 'Roles & Permissions', icon: g(<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></>) },
  // Clock — activity log
  { id: 'activity-log', label: 'Activity Log', icon: g(<><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></>) },
];

const LIQUIDITY_ITEMS: FlyoutItem[] = [
  // Globe — Go Network
  { id: 'go-network', label: 'Go Network', icon: g(<><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/></>) },
  // Banknote — Financing
  { id: 'financing', label: 'Financing', icon: g(<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/></>) },
  // Arrow in — Borrow
  { id: 'borrow', label: 'Borrow', icon: g(<><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>) },
  // Arrow out — Lend
  { id: 'lend', label: 'Lend', icon: g(<><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></>) },
  // Plus in circle — Mint
  { id: 'mint', label: 'Mint', icon: g(<><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>) },
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

  const [openMenu, setOpenMenu] = useState<MoreMenu | null>(null);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
  const liquidityRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !liquidityRef.current?.contains(t) &&
        !securityRef.current?.contains(t) &&
        !submenuRef.current?.contains(t)
      ) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleMenu = (menu: MoreMenu, ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setSubmenuPos({ top: r.top, left: r.right + 8 });
    }
    setOpenMenu(m => (m === menu ? null : menu));
  };

  const flyoutItems = openMenu === 'security' ? SECURITY_ITEMS : openMenu === 'liquidity' ? LIQUIDITY_ITEMS : [];

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
          label="Home" active={activeItem === 'home'} onClick={() => { setOpenMenu(null); onNavigate?.('home'); }}
        />
        {/* Portfolio — wallet */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>}
          label="Portfolio" active={activeItem === 'portfolio'}
        />
        {/* Earn — stacked coins */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></svg>}
          label="Earn" active={activeItem === 'earn'}
        />
        {/* Trade — candlesticks */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="3" x2="9" y2="6" /><rect x="7" y="6" width="4" height="7" rx="1" /><line x1="9" y1="13" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="10" /><rect x="13" y="10" width="4" height="6" rx="1" /><line x1="15" y1="16" x2="15" y2="21" /></svg>}
          label="Trade" active={activeItem === 'trade'}
          onClick={() => onNavigate?.('trade')}
        />

        <div className="nav-section-label">More</div>

        {/* Manage Grants — token management (database + check) */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3" /><path d="M3 12c0 1.66 4 3 9 3" /><path d="m16 18.5 2 2 4-4" /></svg>}
          label="Manage Grants"
        />

        {/* Liquidity — globe, with flyout */}
        <div className="nav-item-security-wrap" ref={liquidityRef}>
          <div
            className={`nav-item${openMenu === 'liquidity' ? ' active' : ''}`}
            onClick={() => toggleMenu('liquidity', liquidityRef)}
          >
            <span className="nav-item-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </span>
            <span className="nav-item-label">Liquidity</span>
            <svg className="nav-item-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Security — shield, with flyout */}
        <div className="nav-item-security-wrap" ref={securityRef}>
          <div
            className={`nav-item${activeItem === 'security' ? ' active' : ''}${openMenu === 'security' ? ' active' : ''}`}
            onClick={() => toggleMenu('security', securityRef)}
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

        {openMenu && ReactDOM.createPortal(
          <div
            ref={submenuRef}
            className="security-submenu"
            style={{ position: 'fixed', top: submenuPos.top, left: submenuPos.left }}
          >
            {flyoutItems.map(item => (
              <div
                key={item.id}
                className={`security-submenu-item${openMenu === 'security' && activeSecurity === item.id ? ' active' : ''}`}
                onClick={() => {
                  if (openMenu === 'security') onNavigateSecurity?.(item.id as SecuritySubPage);
                  setOpenMenu(null);
                }}
              >
                <span className="security-submenu-icon">{item.icon}</span>
                <span className="security-submenu-label">{item.label}</span>
              </div>
            ))}
          </div>,
          document.body
        )}

        {/* Reports — file */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
          label="Reports"
        />
      </nav>

      <div className="sidebar-footer">
        {/* Help — lifebuoy */}
        <NavItem
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" /><line x1="14.83" y1="9.17" x2="19.07" y2="4.93" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" /></svg>}
          label="Help"
        />
      </div>
    </aside>
  );
};
