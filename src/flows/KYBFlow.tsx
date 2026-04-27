import React, { useEffect, useRef, useState } from 'react';
import '../styles/kyb.css';
import { useTheme } from '../hooks/useTheme';

/* ── Types ──────────────────────────────────────────────────────────── */
type KYBStep = 5 | 6 | 7;

interface Person {
  id: string;
  name: string;
  email: string;
  status: 'verify' | 'resend';
}

interface PAAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  activeManage: boolean;
  idvMethod: number; // -1 = none, 0 = "I will help verify", 1 = "Person verifies on their own"
  required: boolean;
}

const PA_MIN = 3;
const PA_MAX = 5;

const STEP_META = [
  { n: 1, label: 'Business Details',              sub: 'Input entity information' },
  { n: 2, label: 'Business Documents',            sub: 'Review entity information' },
  { n: 3, label: 'Asset Questionnaire',           sub: 'Tell us about your digital assets' },
  { n: 4, label: 'Authorized Signer',             sub: 'Signer Details' },
  { n: 5, label: 'People of Interest Information',sub: 'People and contacts from your Business' },
  { n: 6, label: 'Platform Administrator',        sub: 'Designate platform managers' },
  { n: 7, label: 'Agreements',                    sub: 'Review and Sign Agreements' },
  { n: 8, label: 'Review & Submit',               sub: "Let's make sure everything looks good" },
];

const PROGRESS_MAP: Record<number, string> = { 5: '62%', 6: '75%', 7: '88%', 8: '100%' };

let _idCounter = 0;
function nextId() { return String(++_idCounter); }

function makeAdmin(required: boolean): PAAdmin {
  return { id: nextId(), firstName: '', lastName: '', email: '', activeManage: false, idvMethod: -1, required };
}

/* ── Component ──────────────────────────────────────────────────────── */
export function KYBFlow() {
  const { isLight, toggle } = useTheme();

  /* ── State ── */
  const [currentStep, setCurrentStep] = useState<KYBStep>(5);
  const [noBeneficiary, setNoBeneficiary] = useState(false);
  const [beneficialPersons, setBeneficialPersons] = useState<Person[]>([
    { id: nextId(), name: 'Jon Doe', email: 'jondoe@mtfinancial.com', status: 'verify' },
    { id: nextId(), name: 'Jon Doe', email: 'jondoe@mtfinancial.com', status: 'resend' },
  ]);
  const [controlPersons] = useState<Person[]>([
    { id: nextId(), name: 'Jon Doe', email: 'jondoe@mtfinancial.com', status: 'verify' },
  ]);
  const [paAdmins, setPAAdmins] = useState<PAAdmin[]>([
    makeAdmin(true), makeAdmin(true), makeAdmin(true),
  ]);
  const [genericModalOpen, setGenericModalOpen] = useState(false);
  const [genericModalTitle, setGenericModalTitle] = useState('Add Beneficial Owner');
  const [addForm, setAddForm] = useState({ first: '', last: '', email: '', ownership: '' });
  const [successVisible, setSuccessVisible] = useState(false);
  const [toast, setToast] = useState({ msg: '', visible: false });

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);

  /* ── Toast ── */
  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  /* ── Navigation ── */
  function goToStep(n: number) {
    const valid: KYBStep[] = [5, 6, 7];
    if (!valid.includes(n as KYBStep)) { showToast('Coming soon!'); return; }
    setCurrentStep(n as KYBStep);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function sidebarClick(n: number) {
    if (n < 5) { showToast('Step ' + n + ' is already completed.'); return; }
    if (n > currentStep + 1) { showToast('Please complete the current step first.'); return; }
    goToStep(n);
  }

  /* ── Keyboard ── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setGenericModalOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ── Focus modal first field when opens ── */
  useEffect(() => {
    if (genericModalOpen) {
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    }
  }, [genericModalOpen]);

  /* ── Remove person (beneficial) ── */
  function removeBeneficialPerson(id: string) {
    setBeneficialPersons(prev => prev.filter(p => p.id !== id));
    showToast('Person removed.');
  }

  /* ── Submit generic person ── */
  function submitGenericPerson() {
    const { first, last, email } = addForm;
    if (!first.trim() || !last.trim() || !email.trim()) {
      showToast('Please fill in all required fields.'); return;
    }
    const name = first.trim() + ' ' + last.trim();
    setBeneficialPersons(prev => [
      ...prev,
      { id: nextId(), name, email: email.trim(), status: 'verify' },
    ]);
    if (noBeneficiary) setNoBeneficiary(false);
    setGenericModalOpen(false);
    setAddForm({ first: '', last: '', email: '', ownership: '' });
    showToast(name + ' added successfully.');
  }

  /* ── PA admin field update ── */
  function updateAdmin(id: string, field: keyof PAAdmin, value: string | boolean | number) {
    setPAAdmins(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  /* ── Add admin row ── */
  function addAdminRow() {
    if (paAdmins.length >= PA_MAX) return;
    setPAAdmins(prev => [...prev, makeAdmin(false)]);
  }

  /* ── Remove admin row ── */
  function removeAdminRow(id: string) {
    if (paAdmins.length <= PA_MIN) { showToast('A minimum of 3 administrators is required.'); return; }
    setPAAdmins(prev => prev.filter(a => a.id !== id));
  }

  /* ── Validate PA and continue ── */
  function paValidateAndContinue() {
    if (paAdmins.length < PA_MIN) { showToast('Please add at least 3 administrators.'); return; }
    const allFilled = paAdmins.every(a => a.firstName.trim() && a.lastName.trim() && a.email.trim());
    if (!allFilled) { showToast('Please fill in all name and email fields.'); return; }
    const allIdv = paAdmins.every(a => a.idvMethod !== -1);
    if (!allIdv) { showToast('Please select an Identity Verification method for each administrator.'); return; }
    goToStep(7);
  }

  /* ── Render sidebar step icon ── */
  function stepState(n: number): 'done' | 'active' | 'pending' {
    if (n < currentStep) return 'done';
    if (n === currentStep) return 'active';
    return 'pending';
  }

  /* ── Render ── */
  return (
    <div className="kyb-root">
      {/* Header */}
      <header className="kyb-header">
        <span className="kyb-header-title">BitGo Trust Application</span>
        <button className="kyb-btn-logout" onClick={() => showToast('You have been logged out.')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log Out
        </button>
      </header>

      <div className="kyb-layout">
        {/* Sidebar */}
        <aside className="kyb-sidebar">
          <p className="kyb-sidebar-hint">Complete the following steps to submit your application</p>
          {STEP_META.map(({ n, label, sub }) => {
            const state = stepState(n);
            return (
              <div
                key={n}
                className={`kyb-step ${state === 'done' ? 'done-step' : ''} ${state === 'active' ? 'active' : ''} ${state === 'pending' ? 'pending' : ''}`}
                onClick={() => sidebarClick(n)}
              >
                <div className={`kyb-step-icon ${state}`}>
                  {state === 'done' ? (
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <span>{n}</span>
                  )}
                </div>
                <div>
                  <div className="kyb-step-label">{label}</div>
                  <div className="kyb-step-sub">{sub}</div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main column */}
        <div className="kyb-main-col">
          {/* Sticky top: progress + page header/desc */}
          <div className="kyb-sticky-top">
            <div className="kyb-progress-wrap">
              <div className="kyb-progress-track">
                <div className="kyb-progress-fill" style={{ width: PROGRESS_MAP[currentStep] ?? '62%' }} />
              </div>
            </div>
            <div className="kyb-page-intro">
              {currentStep === 5 && (
                <div className="kyb-page-header" style={{ marginBottom: 0 }}>
                  <h2 className="kyb-page-title">Associated People</h2>
                  <button className="kyb-btn-help" onClick={() => showToast('Help center coming soon.')}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    Need Help?
                  </button>
                </div>
              )}
              {currentStep === 6 && (
                <>
                  <div className="kyb-page-header" style={{ marginBottom: 8, alignItems: 'flex-start' }}>
                    <h2 className="kyb-pa-page-title">Platform Administrator</h2>
                    <button className="kyb-btn-help" style={{ marginTop: 8 }} onClick={() => showToast('Help center coming soon.')}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      Need Help?
                    </button>
                  </div>
                  <p className="kyb-pa-page-desc" style={{ marginBottom: 0 }}>
                    Designate individuals to oversee administrative functions on the BitGo platform:
                    adding users, creating wallet policies, and initiating deposits/withdrawals.
                    A minimum of 3 and a maximum of 5 administrators are required.
                  </p>
                </>
              )}
              {currentStep === 7 && (
                <div className="kyb-page-header" style={{ marginBottom: 0 }}>
                  <h2 className="kyb-page-title">Agreements</h2>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <main className="kyb-main" ref={mainScrollRef as React.RefObject<HTMLElement>}>
          <div className="kyb-content">
            {/* ── Page 5: Associated People ── */}
            <div className={`kyb-page ${currentStep === 5 ? 'active' : ''}`}>
              {/* Beneficial Owner */}
              <div className="kyb-section-card">
                <div className="kyb-card-head">
                  <div>
                    <div className="kyb-card-title">Beneficial Owner</div>
                    <div className="kyb-card-desc">Any individual who directly or indirectly owns 25% or more of the equity interests of the legal entity. There can be multiple beneficial owners.</div>
                  </div>
                  <button className="kyb-btn-add" onClick={() => { setGenericModalTitle('Beneficial Owner'); setGenericModalOpen(true); }}>Add New</button>
                </div>
                <label className="kyb-checkbox-row" onClick={e => { e.preventDefault(); setNoBeneficiary(v => !v); }}>
                  <div className={`kyb-custom-cb ${noBeneficiary ? 'checked' : ''}`}>
                    <svg fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 12 12"><polyline points="1.5,6 4.5,9 10.5,3"/></svg>
                  </div>
                  <span>There are no Beneficiary Owners to Declare</span>
                </label>
                {!noBeneficiary && (
                  <div>
                    {beneficialPersons.map(p => (
                      <PersonRow
                        key={p.id}
                        person={p}
                        onAction={() => showToast(p.status === 'verify' ? 'Verification email sent!' : 'Verification link resent!')}
                        onRemove={() => removeBeneficialPerson(p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Control Person */}
              <div className="kyb-section-card">
                <div className="kyb-card-head">
                  <div>
                    <div className="kyb-card-title">Control Person</div>
                    <div className="kyb-card-desc">An individual with significant responsibility for the legal entity (e.g. CEO, CFO, COO, Managing Member, President, etc.)</div>
                  </div>
                </div>
                <div>
                  {controlPersons.map(p => (
                    <PersonRow
                      key={p.id}
                      person={p}
                      onAction={() => showToast('Verification email sent!')}
                      onRemove={() => showToast('Person removed.')}
                    />
                  ))}
                </div>
              </div>

              <div className="kyb-footer-btns">
                <button className="kyb-btn-ghost-pill" onClick={() => showToast('Going back…')}>Back</button>
                <button className="kyb-btn-primary" onClick={() => goToStep(6)}>Continue</button>
              </div>
            </div>

            {/* ── Page 6: Platform Administrator ── */}
            <div className={`kyb-page ${currentStep === 6 ? 'active' : ''}`}>
              <div className="kyb-pa-inline-list">
                {paAdmins.map((admin, idx) => (
                  <PAInlineRow
                    key={admin.id}
                    admin={admin}
                    label={`Admin ${idx + 1}`}
                    onChange={(field, val) => updateAdmin(admin.id, field, val)}
                    onRemove={() => removeAdminRow(admin.id)}
                  />
                ))}
              </div>

              {paAdmins.length < PA_MAX && (
                <button className="kyb-pa-add-link" onClick={addAdminRow}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                  Add administrator
                </button>
              )}

              <div className="kyb-footer-btns">
                <button className="kyb-btn-ghost-pill" onClick={() => goToStep(5)}>Back</button>
                <button className="kyb-btn-primary" onClick={paValidateAndContinue}>Continue</button>
              </div>
            </div>

            {/* ── Page 7: Agreements ── */}
            <div className={`kyb-page ${currentStep === 7 ? 'active' : ''}`}>
              <div className="kyb-section-card kyb-placeholder-card">
                <div style={{ fontSize: 40, marginBottom: 14 }}>📄</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Review &amp; Sign Agreements</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
                  Your agreements will appear here for review and digital signature before final submission.
                </div>
              </div>
              <div className="kyb-footer-btns">
                <button className="kyb-btn-ghost-pill" onClick={() => goToStep(6)}>Back</button>
                <button className="kyb-btn-primary" onClick={() => setSuccessVisible(true)}>Submit Application</button>
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>

      {/* Generic Add Person Modal */}
      <div
        className={`kyb-modal-overlay ${genericModalOpen ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setGenericModalOpen(false); }}
      >
        <div className="kyb-modal">
          <div className="kyb-modal-header">
            <span className="kyb-modal-title">Add {genericModalTitle}</span>
            <button className="kyb-modal-close" onClick={() => setGenericModalOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="kyb-modal-body">
            <div className="kyb-form-2col">
              <div>
                <label className="kyb-form-label">First Name</label>
                <input
                  ref={firstFieldRef}
                  className="kyb-form-input" type="text" placeholder="Enter first name"
                  value={addForm.first} onChange={e => setAddForm(f => ({ ...f, first: e.target.value }))}
                />
              </div>
              <div>
                <label className="kyb-form-label">Last Name</label>
                <input
                  className="kyb-form-input" type="text" placeholder="Enter last name"
                  value={addForm.last} onChange={e => setAddForm(f => ({ ...f, last: e.target.value }))}
                />
              </div>
            </div>
            <div className="kyb-form-row">
              <label className="kyb-form-label">Email Address</label>
              <input
                className="kyb-form-input" type="email" placeholder="Enter email address"
                value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="kyb-form-row">
              <label className="kyb-form-label">Ownership %</label>
              <input
                className="kyb-form-input" type="number" placeholder="e.g. 30" min={0} max={100}
                value={addForm.ownership} onChange={e => setAddForm(f => ({ ...f, ownership: e.target.value }))}
              />
            </div>
          </div>
          <div className="kyb-modal-footer">
            <button className="kyb-btn-modal-cancel" onClick={() => setGenericModalOpen(false)}>Cancel</button>
            <button className="kyb-btn-modal-submit" onClick={submitGenericPerson}>Add Person</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`kyb-toast ${toast.visible ? 'show' : ''}`}>{toast.msg}</div>

      {/* Success Screen */}
      <div className={`kyb-success-screen ${successVisible ? 'visible' : ''}`}>
        <header className="kyb-success-header">
          <span className="kyb-header-title">BitGo Trust Application</span>
          <button className="kyb-btn-logout" onClick={() => showToast('You have been logged out.')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Log Out
          </button>
        </header>
        <div className="kyb-success-body">
          <div className="kyb-success-placeholder" />
          <h2 className="kyb-success-title">We Will Contact You Soon</h2>
          <p className="kyb-success-sub">Your application has been completed. Our team will contact you soon with next steps.</p>
        </div>
      </div>

      {/* Theme Toggle */}
      <button className="kyb-theme-toggle" onClick={toggle} aria-label="Toggle light/dark mode">
        {isLight ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── PersonRow ───────────────────────────────────────────────────────── */
function PersonRow({ person, onAction, onRemove }: {
  person: Person;
  onAction: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="kyb-pa-row">
      <div>
        <div className="kyb-pa-row-name">{person.name}</div>
        <div className="kyb-pa-row-meta">{person.email}</div>
      </div>
      <div className="kyb-pa-row-actions">
        <button className="kyb-btn-resend-invite" onClick={onAction}>
          {person.status === 'verify' ? 'Verify' : 'Resend Link'}
        </button>
        <button className="kyb-btn-circle-menu" onClick={onRemove} title="Remove">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── PAInlineRow ─────────────────────────────────────────────────────── */
function PAInlineRow({ admin, label, onChange, onRemove }: {
  admin: PAAdmin;
  label: string;
  onChange: (field: keyof PAAdmin, value: string | boolean | number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="kyb-pa-inline-row">
      {/* Label + optional remove */}
      <div className="kyb-pa-inline-label">
        {label}
        {!admin.required && (
          <button className="kyb-pa-inline-remove" onClick={onRemove} title="Remove">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Member information */}
      <div className="kyb-pa-inline-section-title">Member Information</div>
      <div className="kyb-pa-inline-top">
        <div className="kyb-pa-inline-field">
          <span className="kyb-pa-inline-field-label">First Name</span>
          <input
            type="text" placeholder="First name"
            value={admin.firstName}
            onChange={e => onChange('firstName', e.target.value)}
          />
        </div>
        <div className="kyb-pa-inline-field">
          <span className="kyb-pa-inline-field-label">Last Name</span>
          <input
            type="text" placeholder="Last name"
            value={admin.lastName}
            onChange={e => onChange('lastName', e.target.value)}
          />
        </div>
        <div className="kyb-pa-inline-field email-wrap">
          <span className="kyb-pa-inline-field-label">Email Address</span>
          <input
            type="email" placeholder="Email address"
            value={admin.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
      </div>

      {/* Active management toggle */}
      <div className="kyb-pa-inline-toggle-row">
        <label className="kyb-toggle-switch">
          <input
            type="checkbox"
            checked={admin.activeManage}
            onChange={e => onChange('activeManage', e.target.checked)}
          />
          <div className="kyb-toggle-track" />
        </label>
        <span className="kyb-pa-inline-toggle-label">
          Person will actively manage the platform
          <span className="kyb-help-icon" title="Grants full admin access: manage wallets, users, and policies.">
            <svg fill="currentColor" viewBox="0 0 20 20" width="15" height="15">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </span>
        </span>
      </div>

      {/* Divider */}
      <div className="kyb-pa-inline-section-divider" />

      {/* Identity verification */}
      <div className="kyb-pa-inline-idv-title">
        Identity Verification
        <span className="kyb-help-icon" title="Choose how this administrator's identity will be confirmed before they gain access.">
          <svg fill="currentColor" viewBox="0 0 20 20" width="15" height="15">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        </span>
      </div>
      <div className="kyb-pa-inline-idv-row">
        {[
          'I will help verify',
          'Person verifies on their own',
        ].map((text, i) => (
          <div
            key={i}
            className={`kyb-pa-inline-radio ${admin.idvMethod === i ? 'selected' : ''}`}
            onClick={() => onChange('idvMethod', i)}
          >
            <div className="kyb-pa-inline-radio-circle" />
            <span className="kyb-pa-inline-radio-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
