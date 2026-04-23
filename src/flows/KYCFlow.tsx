import React, { useEffect, useRef, useState } from 'react';
import '../styles/kyc.css';
import { useTheme } from '../hooks/useTheme';

/* ── Types ── */
type KYCScreen = 1 | 3 | '3b' | 6 | 7 | 9 | 5;

const ROLES = [
  'Organization Admin', 'Enterprise Admin', 'Wallet Admin', 'Wallet Spender',
  'Wallet Viewer', 'Trader', 'Auditor', 'Video ID User',
];

let _rid = 0;
function nextRowId() { return `irow_${++_rid}`; }

interface InviteRow {
  id: string;
  email: string;
  roles: string[];
  open: boolean;
}

/* ── Shared SVGs ── */
const BitGoShield = ({ w = 20, h = 22 }: { w?: number; h?: number }) => (
  <svg width={w} height={h} viewBox="0 0 32 36" fill="none">
    <path d="M16 0L0 6v12c0 9.6 6.88 18.56 16 21 9.12-2.44 16-11.4 16-21V6L16 0Z" fill="#3D65F0" />
    <path d="M10 18l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckSvg9 = () => (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckSvg8 = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ── InviteRowItem ── */
interface InviteRowProps {
  row: InviteRow;
  onEmailChange: (id: string, v: string) => void;
  onToggleRole: (id: string, role: string) => void;
  onToggleOpen: (id: string) => void;
  onRemove: (id: string) => void;
}

function InviteRowItem({ row, onEmailChange, onToggleRole, onToggleOpen, onRemove }: InviteRowProps) {
  return (
    <div className="kyc-invite-row">
      <div className="kyc-invite-field-wrap email-wrap">
        <span className="kyc-invite-field-label">Email Address</span>
        <input
          type="email"
          className="kyc-invite-email-field"
          placeholder="name@company.com"
          value={row.email}
          onChange={e => onEmailChange(row.id, e.target.value)}
        />
      </div>
      <div className="kyc-invite-field-wrap role-wrap">
        <span className="kyc-invite-field-label">Role</span>
        <div className={`kyc-role-ms${row.open ? ' open' : ''}`}>
          <button
            type="button"
            className="kyc-role-ms-trigger"
            onClick={e => { e.stopPropagation(); onToggleOpen(row.id); }}
          >
            {row.roles.length === 0 ? (
              <span className="kyc-role-ms-placeholder">Select roles…</span>
            ) : (
              <span className="kyc-role-ms-tags">
                {row.roles.map(r => <span key={r} className="kyc-role-ms-tag">{r}</span>)}
              </span>
            )}
            <svg className="kyc-role-ms-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="kyc-role-ms-dropdown">
            {ROLES.map(r => (
              <div
                key={r}
                className={`kyc-role-ms-option${row.roles.includes(r) ? ' checked' : ''}`}
                onClick={e => { e.stopPropagation(); onToggleRole(row.id, r); }}
              >
                <div className="kyc-role-ms-cb"><CheckSvg8 /></div>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button type="button" className="kyc-btn-remove-row" onClick={() => onRemove(row.id)} title="Remove">
        <XIcon />
      </button>
    </div>
  );
}

/* ── KYCFlow ── */
export function KYCFlow() {
  const { isLight, toggle } = useTheme();
  const [screen, setScreen] = useState<KYCScreen>(1);

  /* Toast */
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 3000);
  }

  function goToStep(s: KYCScreen) {
    setScreen(s);
    window.scrollTo(0, 0);
  }

  /* Screen 1 */
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const pwHasAny = password.length > 0;

  function validateScreen1() {
    if (!password) { showToast('Please create a password'); return; }
    if (!termsChecked) { showToast('Please agree to the Terms of Service to continue'); return; }
    goToStep(3);
  }

  /* Screen 3 — Goals */
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const customGoalRef = useRef<HTMLDivElement>(null);

  function toggleGoal(val: string) {
    setSelectedGoals(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function toggleCustomGoalBadge(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedGoals(prev => {
      const next = new Set(prev);
      next.has('other-custom') ? next.delete('other-custom') : next.add('other-custom');
      return next;
    });
  }

  function handleCustomGoalBlur() {
    const text = customGoalRef.current?.textContent?.trim() ?? '';
    if (!text) {
      setSelectedGoals(prev => { const n = new Set(prev); n.delete('other-custom'); return n; });
    }
  }

  function focusCustomGoalLabel(e: React.MouseEvent) {
    e.preventDefault();
    const el = customGoalRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function validateGoals() {
    if (selectedGoals.size === 0) { showToast('Please select at least one goal'); return; }
    goToStep('3b');
  }

  /* Screen 3b — Priority */
  const [priority, setPriority] = useState<string | null>(null);

  function validatePriority() {
    if (!priority) { showToast('Please select an option'); return; }
    goToStep(6);
  }

  /* Screen 6 — Personal Info */
  const [sameCountry, setSameCountry] = useState(true);
  const [residenceCountry, setResidenceCountry] = useState('US');
  const [govCountry, setGovCountry] = useState('US');
  const [ssn, setSsn] = useState('');
  const [pep, setPep] = useState<'yes' | 'no'>('no');

  function handleResidenceChange(val: string) {
    setResidenceCountry(val);
    if (sameCountry) setGovCountry(val);
  }

  function toggleSameCountry() {
    const next = !sameCountry;
    setSameCountry(next);
    if (next) setGovCountry(residenceCountry);
  }

  function formatSSN(raw: string): string {
    let v = raw.replace(/\D/g, '');
    if (v.length > 9) v = v.slice(0, 9);
    if (v.length > 5) return `${v.slice(0, 3)} - ${v.slice(3, 5)} - ${v.slice(5)}`;
    if (v.length > 3) return `${v.slice(0, 3)} - ${v.slice(3)}`;
    return v;
  }

  /* Screen 7 — Upload */
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<string | null>(null);
  const [frontDrag, setFrontDrag] = useState(false);
  const [backDrag, setBackDrag] = useState(false);

  /* Screen 9 — Invite */
  const [scenario, setScenario] = useState(1);
  const [rows1, setRows1] = useState<InviteRow[]>([]);
  const [rows2, setRows2] = useState<InviteRow[]>([]);

  useEffect(() => {
    setRows1([{ id: nextRowId(), email: '', roles: [], open: false }]);
  }, []);

  useEffect(() => {
    function close() {
      setRows1(r => r.map(x => ({ ...x, open: false })));
      setRows2(r => r.map(x => ({ ...x, open: false })));
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  function addRow(which: 1 | 2) {
    const row: InviteRow = { id: nextRowId(), email: '', roles: [], open: false };
    which === 1 ? setRows1(p => [...p, row]) : setRows2(p => [...p, row]);
  }

  function removeRow(which: 1 | 2, id: string) {
    const fn = (p: InviteRow[]) => p.filter(r => r.id !== id);
    which === 1 ? setRows1(fn) : setRows2(fn);
  }

  function updateEmail(which: 1 | 2, id: string, email: string) {
    const fn = (p: InviteRow[]) => p.map(r => r.id === id ? { ...r, email } : r);
    which === 1 ? setRows1(fn) : setRows2(fn);
  }

  function toggleRole(which: 1 | 2, id: string, role: string) {
    const fn = (p: InviteRow[]) => p.map(r => {
      if (r.id !== id) return r;
      const roles = r.roles.includes(role) ? r.roles.filter(x => x !== role) : [...r.roles, role];
      return { ...r, roles };
    });
    which === 1 ? setRows1(fn) : setRows2(fn);
  }

  function toggleOpen(which: 1 | 2, id: string) {
    const fn = (p: InviteRow[]) => p.map(r => ({ ...r, open: r.id === id ? !r.open : false }));
    which === 1 ? setRows1(fn) : setRows2(fn);
  }

  function sendAndContinue() {
    const filled = rows1.filter(r => r.email.trim());
    if (filled.length > 0) {
      showToast(`Invitations sent to ${filled.length} member${filled.length !== 1 ? 's' : ''}!`);
      setTimeout(() => goToStep(5), 800);
    } else {
      goToStep(5);
    }
  }

  function sendAndContinue2() {
    const allFilled = rows2.every(r => r.email.trim());
    if (rows2.length > 0 && !allFilled) {
      showToast('Please enter an email for each added member');
      return;
    }
    const total = 4 + rows2.length;
    showToast(`Invitations sent to ${total} member${total > 1 ? 's' : ''}!`);
    setTimeout(() => goToStep(5), 800);
  }

  /* Draggable FAB */
  const fabRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, ox: 0, oy: 0, moved: false });

  useEffect(() => {
    const fab = fabRef.current;
    if (!fab) return;

    function onDown(e: MouseEvent) {
      const r = fab!.getBoundingClientRect();
      fab!.style.left = r.left + 'px';
      fab!.style.top = r.top + 'px';
      fab!.style.transform = 'none';
      drag.current = { on: true, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
      fab!.style.cursor = 'grabbing';
      e.preventDefault();
    }
    function onMove(e: MouseEvent) {
      if (!drag.current.on) return;
      drag.current.moved = true;
      const x = Math.min(Math.max(0, e.clientX - drag.current.ox), window.innerWidth - fab!.offsetWidth);
      const y = Math.min(Math.max(0, e.clientY - drag.current.oy), window.innerHeight - fab!.offsetHeight);
      fab!.style.left = x + 'px';
      fab!.style.top = y + 'px';
    }
    function onUp(e: MouseEvent) {
      if (!drag.current.on) return;
      drag.current.on = false;
      fab!.style.cursor = 'grab';
      if (drag.current.moved) e.stopImmediatePropagation();
    }

    fab.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp, true);
    return () => {
      fab.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp, true);
    };
  }, []);

  /* Screen 5 */
  function completeSetup() {
    showToast('Welcome to BitGo! Setting up your dashboard…');
    setTimeout(() => { window.location.hash = ''; }, 1000);
  }

  /* QR 7×7 decorative pattern */
  const QR = [
    [1,1,1,0,1,0,1],[1,0,1,0,0,1,1],[1,0,1,1,1,0,1],
    [0,1,0,1,0,1,0],[1,1,0,1,1,0,1],[1,0,1,0,0,1,1],[1,1,1,0,1,1,1],
  ];

  const flowLogo = (
    <div className="kyc-flow-header-logo">
      <BitGoShield w={20} h={22} /><span>BitGo</span>
    </div>
  );

  const COUNTRIES = [
    ['US','United States'],['CA','Canada'],['GB','United Kingdom'],
    ['AU','Australia'],['DE','Germany'],['SG','Singapore'],['other','Other'],
  ] as const;

  const goalCards = [
    { val: 'trade-earn', label: 'Trade & earn yield',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
    { val: 'payments', label: 'Move & settle funds',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { val: 'ops-compliance', label: 'Manage team & stay compliant',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { val: 'secure-assets', label: 'Secure & hold digital assets',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { val: 'tokenize', label: 'Tokenize real world assets',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  ];

  const priorityCards = [
    { val: 'speed', label: 'Speed & ease of use', desc: 'Fast approvals, streamlined workflows, and less operational overhead',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { val: 'security', label: 'Security of assets', desc: 'Maximum protection, strict controls, and institutional-grade safeguards',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { val: 'both', label: 'Both equally', desc: "I need a balance of speed and security without compromising either",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> },
  ];

  const docTypes = [
    ['dl','Driver License'],['state-id','State ID'],['prc','Permanent Resident Card'],
    ['travel','Non-Citizen Travel Document'],['passport','Passport'],['passport-card','Passport Card'],
  ];

  const preinvited = [
    { initials: 'AR', color: 'av-blue',   name: 'Alex Rivera',  email: 'alex.rivera@enterprise.com', role: 'Org Admin'     },
    { initials: 'JK', color: 'av-teal',   name: 'Jordan Kim',   email: 'j.kim@enterprise.com',        role: 'Wallet Admin'  },
    { initials: 'SP', color: 'av-purple', name: 'Sam Patel',    email: 's.patel@enterprise.com',      role: 'Auditor'       },
    { initials: 'ML', color: 'av-amber',  name: 'Morgan Lee',   email: 'm.lee@enterprise.com',        role: 'Wallet Viewer' },
  ];

  return (
    <div className="kyc-root">

      {/* Theme toggle */}
      <button className="kyc-theme-toggle" onClick={toggle} title="Toggle theme">
        {isLight ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )}
      </button>

      {/* ─────────── SCREEN 1: Create Account ─────────── */}
      <div className={`kyc-page kyc-screen-full${screen === 1 ? ' active' : ''}`}>
        <div className="kyc-auth-card">
          <div className="kyc-auth-logo">
            <BitGoShield w={30} h={34} /><span>BitGo</span>
          </div>
          <h1 className="kyc-auth-title">Create Your Account</h1>
          <p className="kyc-auth-sub">Enter your details to get started with BitGo</p>

          <div className="kyc-form-group">
            <label className="kyc-form-label">Email Address</label>
            <input type="email" className="kyc-form-input" value="phyllisfei804@bitgo.com" readOnly />
          </div>

          <div className="kyc-form-group">
            <label className="kyc-form-label">
              Create Password <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div className="kyc-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className="kyc-form-input"
                placeholder="Choose a strong password"
                style={{ paddingRight: 42 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="kyc-pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="kyc-strength-bar">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`kyc-strength-seg${pwHasAny ? ' active' : ''}`} />
              ))}
            </div>
            <div className="kyc-strength-checks">
              {[
                { label: 'At least 8 characters' },
                { label: 'Uppercase letter' },
                { label: 'Number or symbol' },
              ].map(({ label }) => (
                <div key={label} className={`kyc-strength-check${pwHasAny ? ' pass' : ''}`}>
                  <div className="kyc-strength-check-dot">
                    <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="kyc-agree-row" style={{ marginTop: 20 }}>
            <input
              type="checkbox"
              className="kyc-agree-checkbox"
              id="agreeTerms"
              checked={termsChecked}
              onChange={e => setTermsChecked(e.target.checked)}
            />
            <label className="kyc-agree-label" htmlFor="agreeTerms">
              I agree to BitGo's{' '}
              <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and{' '}
              <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>, and confirm I am authorized to create this account.
            </label>
          </div>

          <button className="kyc-btn-primary-full" style={{ marginTop: 16 }} onClick={validateScreen1}>
            Continue
          </button>
          <p className="kyc-signin-link">Already have an account? <a href="#">Sign In</a></p>
        </div>
      </div>

      {/* ─────────── SCREEN 3: Goals ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === 3 ? ' active' : ''}`}>
        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Step 1 of 6</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '17%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Your Goals</p>
            <h2 className="kyc-step-title">What do you hope to achieve with BitGo?</h2>
            <p className="kyc-step-sub">Select all that apply. This helps us tailor your experience.</p>

            <div className="kyc-sel-grid kyc-sel-grid-2">
              {goalCards.map(c => (
                <div key={c.val}>
                  <div
                    className={`kyc-sel-card${selectedGoals.has(c.val) ? ' selected' : ''}`}
                    onClick={() => toggleGoal(c.val)}
                  >
                    <div className="kyc-sel-card-icon">{c.icon}</div>
                    <div className="kyc-sel-card-text">
                      <div className="kyc-sel-card-label">{c.label}</div>
                    </div>
                    <div className="kyc-sel-card-badge"><CheckSvg9 /></div>
                  </div>
                </div>
              ))}

              {/* Custom goal card */}
              <div
                className={`kyc-sel-card kyc-custom-goal-card${selectedGoals.has('other-custom') ? ' selected' : ''}`}
                onClick={focusCustomGoalLabel}
              >
                <div className="kyc-sel-card-icon" style={{ background: 'transparent', color: 'var(--color-text-muted)', opacity: 0.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div className="kyc-sel-card-text">
                  <div
                    ref={customGoalRef}
                    className="kyc-sel-card-label kyc-custom-goal-label"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); (e.target as HTMLElement).blur(); }
                    }}
                    onBlur={handleCustomGoalBlur}
                  />
                </div>
                <div
                  className="kyc-sel-card-badge"
                  style={{ opacity: selectedGoals.has('other-custom') ? 1 : 0.35 }}
                  onClick={toggleCustomGoalBadge}
                >
                  <CheckSvg9 />
                </div>
              </div>
            </div>

            <div className="kyc-flow-footer">
              <button className="kyc-btn-back" onClick={() => goToStep(1)}>Back</button>
              <button className="kyc-btn-continue" onClick={validateGoals}>Continue</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── SCREEN 3b: Priority ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === '3b' ? ' active' : ''}`}>
        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Step 2 of 6</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '25%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Your Priorities</p>
            <h2 className="kyc-step-title">What do you value most?</h2>
            <p className="kyc-step-sub">Select one — we'll use this to shape your experience.</p>

            <div style={{ marginTop: 4 }}>
              {priorityCards.map(c => (
                <div
                  key={c.val}
                  className={`kyc-priority-card${priority === c.val ? ' selected' : ''}`}
                  onClick={() => setPriority(c.val)}
                >
                  <div className="kyc-sel-card-icon">{c.icon}</div>
                  <div className="kyc-sel-card-text">
                    <div className="kyc-sel-card-label">{c.label}</div>
                    <div className="kyc-sel-card-desc">{c.desc}</div>
                  </div>
                  <div className="kyc-sel-card-check"><CheckSvg8 /></div>
                </div>
              ))}
            </div>

            <div className="kyc-flow-footer" style={{ marginTop: 24 }}>
              <button className="kyc-btn-back" onClick={() => goToStep(3)}>Back</button>
              <button className="kyc-btn-continue" onClick={validatePriority}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── SCREEN 6: Personal Information ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === 6 ? ' active' : ''}`}>
        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Step 3 of 6</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '50%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Verify Identity · 1 of 2</p>
            <h2 className="kyc-step-title">Personal Information</h2>
            <p className="kyc-step-sub">Enter your legal name exactly as it appears on your government-issued ID.</p>

            <div className="kyc-form-row">
              <div className="kyc-form-group" style={{ marginBottom: 0 }}>
                <label className="kyc-form-label">First Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" className="kyc-form-input" placeholder="First name" />
              </div>
              <div className="kyc-form-group" style={{ marginBottom: 0 }}>
                <label className="kyc-form-label">Middle Name</label>
                <input type="text" className="kyc-form-input" placeholder="Optional" />
              </div>
            </div>

            <div className="kyc-form-group" style={{ marginTop: 16 }}>
              <label className="kyc-form-label">Last Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="text" className="kyc-form-input" placeholder="Last name" />
            </div>

            <div className="kyc-form-group">
              <label className="kyc-form-label">Date of Birth <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="text" className="kyc-form-input" placeholder="MM / DD / YYYY" />
            </div>

            <div className="kyc-form-divider" />
            <p className="kyc-section-label">Residency &amp; Identification</p>

            <div className="kyc-form-group">
              <label className="kyc-form-label">Country of Legal Residence <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className="kyc-form-select" value={residenceCountry} onChange={e => handleResidenceChange(e.target.value)}>
                <option value="">Select country…</option>
                {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div className="kyc-check-row">
              <div className={`kyc-custom-checkbox${sameCountry ? ' checked' : ''}`} onClick={toggleSameCountry}>
                {sameCountry && (
                  <svg viewBox="0 0 12 10" width="10" height="10" fill="none">
                    <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <label onClick={toggleSameCountry}>Same country for Government ID</label>
            </div>

            {sameCountry && (
              <div className="kyc-form-group">
                <label className="kyc-form-label">Government ID Country</label>
                <select className="kyc-form-select" value={govCountry} onChange={e => setGovCountry(e.target.value)}>
                  {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            )}

            <div className="kyc-form-group">
              <label className="kyc-form-label">Social Security Number (SSN) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input
                type="text"
                className="kyc-form-input"
                placeholder="XXX - XX - XXXX"
                maxLength={14}
                value={ssn}
                onChange={e => setSsn(formatSSN(e.target.value))}
              />
            </div>

            <div className="kyc-form-divider" />
            <p className="kyc-section-label">Physical Address</p>

            <div className="kyc-form-group">
              <label className="kyc-form-label">Street Address <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="text" className="kyc-form-input" placeholder="Start typing your address…" />
              <span className="kyc-manual-link" onClick={() => showToast('Manual address entry enabled')}>Or Enter Manually</span>
            </div>

            <div className="kyc-form-divider" />
            <p className="kyc-section-label">Political Exposure</p>

            <p className="kyc-pep-question">Are you, or have you ever been, a Politically Exposed Person (PEP)?</p>
            <div className="kyc-radio-group">
              {(['yes', 'no'] as const).map(val => (
                <div key={val} className={`kyc-radio-option${pep === val ? ' selected' : ''}`} onClick={() => setPep(val)}>
                  <div className="kyc-radio-dot"><div className="kyc-radio-dot-inner" /></div>
                  <span className="kyc-radio-label">{val === 'yes' ? 'Yes' : 'No'}</span>
                </div>
              ))}
            </div>

            <div className="kyc-flow-footer">
              <button className="kyc-btn-back" onClick={() => goToStep('3b')}>Back</button>
              <button className="kyc-btn-continue" onClick={() => goToStep(7)}>Continue</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── SCREEN 7: Upload Photo ID ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === 7 ? ' active' : ''}`}>
        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Step 4 of 6</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '67%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Verify Identity · 2 of 2</p>
            <h2 className="kyc-step-title">Upload Photo ID</h2>
            <p className="kyc-step-sub">We accept the following government-issued documents. Ensure all corners are visible and the image is clear.</p>

            <div className="kyc-doc-checklist">
              <p className="kyc-doc-checklist-title">Accepted Documents</p>
              <div className="kyc-doc-list">
                {['Driver License','State ID','Permanent Resident Card','Non-Citizen Travel Doc','Passport','Passport Card'].map(d => (
                  <div key={d} className="kyc-doc-item">
                    <div className="kyc-doc-check-icon">
                      <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3l2.5 2.5 5-5" stroke="#6080F7" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                    </div>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="kyc-form-group">
              <label className="kyc-form-label">Select Document Type <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className="kyc-form-select">
                <option value="">Choose document type…</option>
                {docTypes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Front upload */}
            <p className="kyc-upload-label">Front of Document <span style={{ color: 'var(--color-danger)' }}>*</span></p>
            <div
              className={`kyc-upload-zone${frontDrag ? ' drag-over' : ''}`}
              style={frontFile ? { borderColor: 'var(--color-success)', background: 'rgba(74,222,128,.05)' } : {}}
              onDragOver={e => { e.preventDefault(); setFrontDrag(true); }}
              onDragLeave={() => setFrontDrag(false)}
              onDrop={e => { e.preventDefault(); setFrontDrag(false); const f = e.dataTransfer.files[0]; if (f) setFrontFile(f.name); }}
            >
              <input type="file" accept="image/*,.pdf" onChange={e => { if (e.target.files?.[0]) setFrontFile(e.target.files[0].name); }} />
              <div className="kyc-upload-icon"><UploadArrow /></div>
              <p className="kyc-upload-main-text">Drag &amp; drop or <span style={{ color: 'var(--color-primary)' }}>browse</span></p>
              <p className="kyc-upload-sub-text" style={frontFile ? { color: 'var(--color-success)' } : {}}>
                {frontFile ? `✓ ${frontFile}` : 'JPG, PNG, or PDF · Max 10 MB'}
              </p>
            </div>

            {/* Back upload */}
            <p className="kyc-upload-label">Back of Document <span style={{ color: 'var(--color-danger)' }}>*</span></p>
            <div
              className={`kyc-upload-zone${backDrag ? ' drag-over' : ''}`}
              style={backFile ? { borderColor: 'var(--color-success)', background: 'rgba(74,222,128,.05)' } : {}}
              onDragOver={e => { e.preventDefault(); setBackDrag(true); }}
              onDragLeave={() => setBackDrag(false)}
              onDrop={e => { e.preventDefault(); setBackDrag(false); const f = e.dataTransfer.files[0]; if (f) setBackFile(f.name); }}
            >
              <input type="file" accept="image/*,.pdf" onChange={e => { if (e.target.files?.[0]) setBackFile(e.target.files[0].name); }} />
              <div className="kyc-upload-icon"><UploadArrow /></div>
              <p className="kyc-upload-main-text">Drag &amp; drop or <span style={{ color: 'var(--color-primary)' }}>browse</span></p>
              <p className="kyc-upload-sub-text" style={backFile ? { color: 'var(--color-success)' } : {}}>
                {backFile ? `✓ ${backFile}` : 'JPG, PNG, or PDF · Max 10 MB'}
              </p>
            </div>

            <div className="kyc-flow-footer">
              <button className="kyc-btn-back" onClick={() => goToStep(6)}>Back</button>
              <button className="kyc-btn-continue" onClick={() => goToStep(9)}>Continue</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── SCREEN 9: Invite Team ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === 9 ? ' active' : ''}`}>

        {/* Draggable scenario FAB */}
        <div className="kyc-invite-fab" ref={fabRef}>
          <button className={`kyc-ifab-btn${scenario === 1 ? ' active' : ''}`} onClick={() => setScenario(1)}>
            <span className="kyc-ifab-label">1st PA</span>
            <span className="kyc-ifab-sub">1st time exp</span>
          </button>
          <div className="kyc-ifab-divider" />
          <button className={`kyc-ifab-btn${scenario === 2 ? ' active' : ''}`} onClick={() => setScenario(2)}>
            <span className="kyc-ifab-label">Non-1st PA</span>
            <span className="kyc-ifab-sub">1st time exp</span>
            <span className="kyc-ifab-sub">includes PAs and invited org admins</span>
          </button>
        </div>

        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Step 5 of 5</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '100%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Almost Done</p>
            <h2 className="kyc-step-title">Invite Your Team</h2>
            <p className="kyc-step-sub">Add teammates to your organization. They'll receive an email invitation with setup instructions.</p>

            {/* Scenario 1 */}
            {scenario === 1 && (
              <div>
                <div className="kyc-invite-rows">
                  {rows1.map(r => (
                    <InviteRowItem key={r.id} row={r}
                      onEmailChange={(id, v) => updateEmail(1, id, v)}
                      onToggleRole={(id, role) => toggleRole(1, id, role)}
                      onToggleOpen={id => toggleOpen(1, id)}
                      onRemove={id => removeRow(1, id)}
                    />
                  ))}
                </div>
                <button className="kyc-btn-add-row" onClick={() => addRow(1)}>
                  <PlusIcon /> Add
                </button>
                <div className="kyc-flow-footer">
                  <button className="kyc-btn-back" onClick={() => goToStep(7)}>Back</button>
                  <button className="kyc-btn-continue" onClick={sendAndContinue}>Send Invites</button>
                </div>
              </div>
            )}

            {/* Scenario 2 */}
            {scenario === 2 && (
              <div>
                <div className="kyc-imc-section-header">
                  <span className="kyc-imc-section-title">Members Invited</span>
                  <span className="kyc-imc-count-badge">4</span>
                </div>
                <div>
                  {preinvited.map(m => (
                    <div key={m.initials} className="kyc-imc-row">
                      <div className={`kyc-imc-avatar ${m.color}`}>{m.initials}</div>
                      <div className="kyc-imc-info">
                        <div className="kyc-imc-name">{m.name}</div>
                        <div className="kyc-imc-email">{m.email}</div>
                      </div>
                      <span className="kyc-imc-badge">{m.role}</span>
                    </div>
                  ))}
                </div>

                <div className="kyc-invite-new-section">
                  <div className="kyc-invite-new-header">New Members</div>
                  <div className="kyc-invite-rows">
                    {rows2.map(r => (
                      <InviteRowItem key={r.id} row={r}
                        onEmailChange={(id, v) => updateEmail(2, id, v)}
                        onToggleRole={(id, role) => toggleRole(2, id, role)}
                        onToggleOpen={id => toggleOpen(2, id)}
                        onRemove={id => removeRow(2, id)}
                      />
                    ))}
                  </div>
                  <button className="kyc-btn-add-row" onClick={() => addRow(2)}>
                    <PlusIcon /> Add
                  </button>
                </div>

                <div className="kyc-flow-footer">
                  <button className="kyc-btn-back" onClick={() => goToStep(7)}>Back</button>
                  <div className="kyc-flow-footer-right">
                    <button className="kyc-btn-skip" onClick={() => goToStep(5)}>Skip</button>
                    <button className="kyc-btn-continue" onClick={sendAndContinue2}>Send Invites</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────── SCREEN 5: Download App ─────────── */}
      <div className={`kyc-page kyc-screen-flow${screen === 5 ? ' active' : ''}`}>
        <header className="kyc-flow-header">
          {flowLogo}
          <span className="kyc-flow-header-step">Optional</span>
        </header>
        <div className="kyc-flow-progress">
          <div className="kyc-progress-track"><div className="kyc-progress-fill" style={{ width: '100%' }} /></div>
        </div>
        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <p className="kyc-step-eyebrow">Optional</p>
            <h2 className="kyc-step-title">Get the BitGo Mobile App</h2>
            <p className="kyc-step-sub">Approve transactions, manage your wallet, and get real-time alerts on the go. You can always do this later.</p>

            <div className="kyc-app-download-card">
              <div className="kyc-app-phone-mock">
                <div className="kyc-app-phone-screen">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, width: 72 }}>
                    {QR.flat().map((on, i) => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: on ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="kyc-app-badges">
                <div className="kyc-app-badge" onClick={() => showToast('Opening App Store…')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="var(--dg-400)"/>
                    <path d="M15.5 8.5C15.5 6.57 13.93 5 12 5S8.5 6.57 8.5 8.5c0 .56.14 1.09.38 1.56L6 15h2.5l1-2h5l1 2H18l-2.88-4.94c.24-.47.38-1 .38-1.56z" fill="white"/>
                  </svg>
                  <div>
                    <div className="kyc-app-badge-sub">Download on the</div>
                    <div className="kyc-app-badge-name">App Store</div>
                  </div>
                </div>
                <div className="kyc-app-badge" onClick={() => showToast('Opening Google Play…')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 9-18 9V3z" fill="var(--dg-400)"/>
                    <path d="M3 3l7 9-7 9" stroke="var(--brand-400)" strokeWidth="1.2"/>
                    <path d="M21 12L3 3" stroke="var(--color-success)" strokeWidth="1.2"/>
                    <path d="M21 12L3 21" stroke="var(--color-danger)" strokeWidth="1.2"/>
                  </svg>
                  <div>
                    <div className="kyc-app-badge-sub">Get it on</div>
                    <div className="kyc-app-badge-name">Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kyc-flow-footer">
              <button className="kyc-btn-back" onClick={() => goToStep(9)}>Back</button>
              <div className="kyc-flow-footer-right">
                <button className="kyc-btn-skip" onClick={completeSetup}>Skip for Now</button>
                <button className="kyc-btn-continue" onClick={completeSetup}>I've Downloaded It</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`kyc-toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
}
