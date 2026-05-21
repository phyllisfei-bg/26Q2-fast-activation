import React, { useState } from 'react';

type FlowKey = 'kyb' | 'kyc' | 'dashboard';

interface Node {
  step: number;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  desc: string;
  hash: string;
  flowKey: FlowKey;
  figmaUrl: string;
  figmaLabel?: string;
}

interface FlowStep {
  label: string;
  note?: string;
  isNew?: boolean;
}

const CARD_W = 280;
const CONN_W = 80;
const ROW_W = CARD_W * 3 + CONN_W * 2; // 1000px

// X-center of each card within the 804px row
const STEM_X: Record<FlowKey, number> = {
  kyb: CARD_W / 2,
  kyc: CARD_W + CONN_W + CARD_W / 2,
  dashboard: CARD_W * 2 + CONN_W * 2 + CARD_W / 2,
};

const FLOW_STEPS: Record<FlowKey, { title: string; steps: FlowStep[] }> = {
  kyb: {
    title: 'KYB — Business Verification',
    steps: [
      { label: 'Fill in business details', note: 'Including primary business type & description of business activities' },
      { label: 'Upload business docs' },
      { label: 'Answer asset questionnaire' },
      { label: 'Add authorized signer' },
      { label: 'Add people of interest', note: 'Platform Admin is added here', isNew: true },
      { label: 'Sign agreements' },
      { label: 'Review & submit' },
    ],
  },
  kyc: {
    title: 'KYC — User Verification',
    steps: [
      { label: 'Sign up via link in email', note: 'Account creation' },
      { label: 'Answer "goal to achieve"', note: 'With bundled feature preview', isNew: true },
      { label: 'Fill in personal info' },
      { label: 'Upload ID' },
      { label: 'Review info' },
      { label: 'Invite members', note: 'If permission allows, e.g. Platform Admin or Org Admin', isNew: true },
    ],
  },
  dashboard: {
    title: 'Dashboard — Getting Started',
    steps: [
      { label: 'Get Started action 1' },
      { label: 'Trigger associated callout / feature flow' },
      { label: 'Action 1 complete' },
      { label: 'Continue with actions 2 & 3' },
    ],
  },
};

const ArrowRight = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ExternalLink = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const ChevronDown = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
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
    flowKey: 'kyb',
    figmaUrl: 'https://www.figma.com/design/k0vZ1dbnAxGZwlOF4qckoB/Onboarding-2026?node-id=5497-23225&t=xuKOmkrRKML72QO4-4',
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
    flowKey: 'kyc',
    figmaUrl: 'https://www.figma.com/design/k0vZ1dbnAxGZwlOF4qckoB/Onboarding-2026?node-id=5497-22391&t=xuKOmkrRKML72QO4-4',
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
    desc: 'Role-based priority actions, product recommendations, and a personalized For You section.',
    hash: '#',
    flowKey: 'dashboard',
    figmaUrl: 'https://www.figma.com/design/fmcUJ0h2jBIdUZuQn29GWI/Fast-Activation?node-id=190-577',
    figmaLabel: 'View Figma File (WIP)',
  },
];

export const FlowPage: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState<FlowKey | null>(null);

  const toggleFlow = (key: FlowKey) => {
    setActiveFlow(prev => prev === key ? null : key);
  };

  const activeDetail = activeFlow ? FLOW_STEPS[activeFlow] : null;
  const stemX = activeFlow ? STEM_X[activeFlow] : null;

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      background: '#F4F5F9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 24px 80px',
    }}>
      <p style={{
        fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 56,
      }}>
        BitGo — Fast Activation Flow
      </p>

      {/* Outer wrapper: fixed width matching the cards row */}
      <div style={{ width: ROW_W, maxWidth: '100%', position: 'relative' }}>

        {/* High-level flowchart row */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {NODES.map((node, i) => {
            const isActive = activeFlow === node.flowKey;
            return (
              <React.Fragment key={node.hash}>
                <div
                  style={{
                    display: 'flex', flexDirection: 'column', width: CARD_W, flexShrink: 0,
                    background: '#fff',
                    border: isActive ? '1.5px solid #3D65F0' : '1.5px solid #E5E7EB',
                    borderRadius: 16, padding: '24px 22px 22px',
                    color: 'inherit',
                    boxShadow: isActive
                      ? '0 8px 28px rgba(61,101,240,.13), 0 2px 6px rgba(61,101,240,.08)'
                      : '0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)',
                    transition: 'box-shadow .18s, border-color .18s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (isActive) return;
                    const el = e.currentTarget;
                    el.style.boxShadow = '0 8px 28px rgba(0,0,0,.11), 0 2px 6px rgba(0,0,0,.06)';
                    el.style.borderColor = '#3D65F0';
                  }}
                  onMouseLeave={e => {
                    if (isActive) return;
                    const el = e.currentTarget;
                    el.style.boxShadow = '0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)';
                    el.style.borderColor = '#E5E7EB';
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

                  {/* CTAs */}
                  <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <a
                      href={node.hash}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#3D65F0',
                        textDecoration: 'none',
                      }}
                    >
                      View Prototype <ArrowRight color="#3D65F0" />
                    </a>

                    <a
                      href={node.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#9CA3AF',
                        textDecoration: 'none',
                      }}
                    >
                      {node.figmaLabel ?? 'View Figma File'} <ExternalLink color="#9CA3AF" />
                    </a>

                    <button
                      onClick={() => toggleFlow(node.flowKey)}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 600, color: '#9CA3AF',
                        textAlign: 'left',
                      }}
                    >
                      {isActive ? 'Hide User Flow' : 'View User Flow'}
                      <ChevronDown color="#9CA3AF" />
                    </button>
                  </div>
                </div>

                {/* Horizontal connector between cards */}
                {i < NODES.length - 1 && (
                  <div style={{ width: CONN_W, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 1.5, background: '#D1D5DB', position: 'relative' }}>
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
            );
          })}
        </div>

        {/* Dotted stem + detail panel */}
        {activeFlow && activeDetail && stemX !== null && (
          <>
            {/* Dotted vertical stem */}
            <div style={{ position: 'relative', height: 36 }}>
              <div style={{
                position: 'absolute',
                left: stemX,
                top: 0,
                width: 0,
                height: '100%',
                borderLeft: '2px dashed #93A8F8',
                transform: 'translateX(-50%)',
              }} />
            </div>

          </>
        )}
      </div>

      {/* Step cards — unconstrained width, rendered outside the ROW_W wrapper */}
      {activeFlow && activeDetail && (
        <div style={{
          width: '100%', maxWidth: 1400,
          background: '#ECEEF8',
          border: '1px solid #D8DCEF',
          borderRadius: 14,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
        }}>
          {activeDetail.steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                flex: 1,
                background: step.isNew ? '#EEF1FD' : '#F8F9FF',
                border: step.isNew ? '1.5px solid #3D65F0' : '1px solid #E0E5FB',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#93A8F8',
                  letterSpacing: '0.04em',
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#0D0E1C',
                  lineHeight: 1.4,
                }}>
                  {step.label}
                </span>
                {step.note && (
                  <span style={{
                    fontSize: 10.5, color: '#9CA3AF',
                    lineHeight: 1.4, fontStyle: 'italic',
                  }}>
                    {step.note}
                  </span>
                )}
              </div>

              {i < activeDetail.steps.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  flexShrink: 0, width: 16,
                }}>
                  <div style={{ flex: 1, height: 1.5, background: '#C7D2FB', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', right: -1, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0, height: 0,
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderLeft: '6px solid #C7D2FB',
                    }} />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};
