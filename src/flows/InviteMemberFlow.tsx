import React, { useState, useEffect, useRef } from 'react';
import '../styles/kyc.css';
import { InviteRowItem, nextRowId, PlusIcon } from '../components/InviteRow';
import type { InviteRow } from '../components/InviteRow';

export interface InvitePayload { email: string; roleNames: string[]; }

interface Props {
  isLight: boolean;
  onThemeToggle: () => void;
  onSend: (invites: InvitePayload[]) => void;
  onClose: () => void;
}

export const InviteMemberFlow: React.FC<Props> = ({ isLight, onThemeToggle, onSend, onClose }) => {
  const [rows, setRows] = useState<InviteRow[]>([{ id: nextRowId(), email: '', roles: [], open: false }]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close any open role dropdown on outside click.
  useEffect(() => {
    function close() { setRows(r => r.map(x => ({ ...x, open: false }))); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  function addRow() { setRows(p => [...p, { id: nextRowId(), email: '', roles: [], open: false }]); }
  function removeRow(id: string) { setRows(p => p.filter(r => r.id !== id)); }
  function updateEmail(id: string, email: string) { setRows(p => p.map(r => r.id === id ? { ...r, email } : r)); }
  function toggleRole(id: string, role: string) {
    setRows(p => p.map(r => {
      if (r.id !== id) return r;
      const roles = r.roles.includes(role) ? r.roles.filter(x => x !== role) : [...r.roles, role];
      return { ...r, roles };
    }));
  }
  function toggleOpen(id: string) { setRows(p => p.map(r => ({ ...r, open: r.id === id ? !r.open : false }))); }

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2400);
  }

  function send() {
    const filled = rows.filter(r => r.email.trim());
    if (filled.length === 0) { onClose(); return; }
    onSend(filled.map(r => ({ email: r.email.trim(), roleNames: r.roles })));
    showToast(`Invitation${filled.length !== 1 ? 's' : ''} sent to ${filled.length} member${filled.length !== 1 ? 's' : ''}.`);
    setTimeout(onClose, 900);
  }

  return (
    <div className="kyc-root mr-invite-root">
      <button className="kyc-theme-toggle" onClick={onThemeToggle} title="Toggle theme">
        {isLight ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.2" y1="4.2" x2="5.6" y2="5.6" /><line x1="18.4" y1="18.4" x2="19.8" y2="19.8" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.2" y1="19.8" x2="5.6" y2="18.4" /><line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <div className="kyc-page kyc-screen-flow active">
        <div className="kyc-flow-intro">
          <div className="kyc-flow-intro-inner">
            <h2 className="kyc-step-title">Invite Your Team</h2>
            <p className="kyc-step-sub">Add colleagues by email and assign their roles. They'll receive an invitation to join your organization.</p>
          </div>
        </div>

        <div className="kyc-flow-body">
          <div className="kyc-flow-inner">
            <div className="kyc-invite-rows">
              {rows.map(r => (
                <InviteRowItem
                  key={r.id}
                  row={r}
                  onEmailChange={updateEmail}
                  onToggleRole={toggleRole}
                  onToggleOpen={toggleOpen}
                  onRemove={removeRow}
                />
              ))}
            </div>
            <button className="kyc-btn-add-row" onClick={addRow}>
              <PlusIcon /> Add
            </button>

            <div className="kyc-flow-footer">
              <button className="kyc-btn-back" onClick={onClose}>Cancel</button>
              <button className="kyc-btn-continue" onClick={send}>Send Invites</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`kyc-toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  );
};
