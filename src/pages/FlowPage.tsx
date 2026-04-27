import React from 'react';

interface Node {
  step: number;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  desc: string;
  hash: string;
}

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const NODES: Node[] = [
  {
    step: 1,
    badge: 'KYB',
    badgeIcon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    title: 'Business Verification',
    desc: 'Entity identity, ownership structure, and compliance checks for the legal person opening the account.',
    hash: '#kyb',
  },
  {
    step: 2,
    badge: 'KYC',
    badgeIcon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'User Verification',
    desc: 'Individual identity and goal setup for invited platform admins and default-role users.',
    hash: '#kyc',
  },
  {
    step: 3,
    badge: 'Dashboard',
    badgeIcon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: 'Getting Started',
    desc: 'Role-based priority actions, product recommendations, and a personalised For You section.',
    hash: '#',
  },
  {
    step: 4,
    badge: 'Security',
    badgeIcon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
      </svg>
    ),
    title: 'Whitelist Destinations',
    desc: 'Manage whitelisted addresses with label consolidation, scope management, and approval flows.',
    hash: '#destinations',
  },
];

export const FlowPage: React.FC = () => {
  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      background: '#F4F5F9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <p style={{
        fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 56,
      }}>
        BitGo — Fast Activation Flow
      </p>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, justifyContent: 'center' }}>
        {NODES.map((node, i) => (
          <React.Fragment key={node.hash}>
            <a
              href={node.hash}
              style={{
                display: 'flex', flexDirection: 'column', width: 220,
                background: '#fff', border: '1.5px solid #E5E7EB',
                borderRadius: 16, padding: '24px 22px 22px',
                textDecoration: 'none', color: 'inherit',
                boxShadow: '0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)',
                transition: 'box-shadow .18s, border-color .18s, transform .18s',
                cursor: 'pointer', position: 'relative',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 8px 28px rgba(0,0,0,.11), 0 2px 6px rgba(0,0,0,.06)';
                el.style.borderColor = '#3D65F0';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)';
                el.style.borderColor = '#E5E7EB';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Step number */}
              <span style={{
                position: 'absolute', top: -11, left: 22,
                width: 22, height: 22, borderRadius: '50%',
                background: '#3D65F0', color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 3px #F4F5F9',
              }}>{node.step}</span>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#3D65F0',
                background: '#EEF1FD', borderRadius: 20,
                padding: '3px 8px', marginBottom: 14, alignSelf: 'flex-start',
              }}>
                {node.badgeIcon}
                {node.badge}
              </div>

              <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0E1C', letterSpacing: '-.02em', lineHeight: 1.25, marginBottom: 10 }}>
                {node.title}
              </div>
              <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.55 }}>
                {node.desc}
              </div>
              <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#3D65F0' }}>
                Open flow <ArrowRight />
              </div>
            </a>

            {/* Connector */}
            {i < NODES.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', width: 72, flexShrink: 0 }}>
                <div style={{
                  flex: 1, height: 1.5, background: '#D1D5DB', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', right: -1, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0, height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '9px solid #D1D5DB',
                  }} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
