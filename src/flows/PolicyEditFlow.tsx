import React, { useState } from 'react';
import '../styles/kyc.css';
import { CloseIcon } from '../components/membersRoles/shared';
import { SentencePolicyUpdateModal } from '../components/policies/SentencePolicyUpdateModal';
import { isCustomPolicy } from '../components/policies/policyData';
import type { SentencePolicy, EditablePolicyField } from '../components/policies/policyData';

interface Props {
  policy: SentencePolicy;
  onClose: () => void;
  onSave: (policy: SentencePolicy) => void;
}

const LockGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/** Full-screen edit view. Default (seeded) policies only unlock the fields in `editableFields`;
 *  custom policies (made in the builder) unlock every field, including the name. */
export const PolicyEditFlow: React.FC<Props> = ({ policy, onClose, onSave }) => {
  const custom = isCustomPolicy(policy);
  const editable: EditablePolicyField[] = custom ? ['scope', 'trigger', 'condition', 'action'] : policy.editableFields;
  const [draft, setDraft] = useState<SentencePolicy>(policy);
  const [field, setField] = useState<EditablePolicyField | null>(null);
  const changed = JSON.stringify({ ...draft, lastModified: '' }) !== JSON.stringify({ ...policy, lastModified: '' });

  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  /** One clickable part of the sentence. Locked parts (default policies) stay plain text with a lock. */
  const Token: React.FC<{ f: EditablePolicyField; children: React.ReactNode }> = ({ f, children }) =>
    editable.includes(f) ? (
      <button
        type="button"
        onClick={() => setField(f)}
        title="Edit"
        style={{ font: 'inherit' }}
        className="inline-flex items-center rounded-lg px-2 py-0.5 border border-transparent bg-[var(--brand-a100)] text-[var(--brand-500)] hover:bg-[var(--brand-a200)] cursor-pointer transition-colors"
      >{children}</button>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-[var(--color-text)]" title="Locked — set by BitGo">{children}<span className="text-[var(--color-text-muted)]"><LockGlyph /></span></span>
    );

  return (
    <div className="fixed inset-0" style={{ zIndex: 800 }}>
      <div className="kyc-root mr-invite-root" style={{ background: 'var(--color-level1)' }}>
        <div className="kyc-page kyc-screen-flow active">
          <div className="kyc-flow-intro" style={{ background: 'var(--color-level1)', alignItems: 'stretch', padding: '28px 28px 0' }}>
            <div className="kyc-flow-intro-inner flex items-start justify-between gap-4" style={{ maxWidth: 'none' }}>
              <h2 className="kyc-step-title" style={{ fontWeight: 400, marginBottom: 0 }}>Edit Policy</h2>
              <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
            </div>
          </div>
          <div className="kyc-flow-body" style={{ background: 'var(--color-level1)', padding: '32px 28px 48px' }}>
            <div className="kyc-flow-inner" style={{ maxWidth: 840 }}>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-[var(--color-text)] mb-8" style={{ background: 'var(--brand-a100)', border: '1px solid var(--brand-a200)' }}>
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <div>{custom ? 'This is a custom policy, so every field can be edited.' : 'This is a default policy, so only some fields can be edited. Locked fields are set by BitGo.'}</div>
              </div>

              <div className="kyc-form-group">
                <label className="kyc-form-label">Name</label>
                <input
                  className="kyc-form-input"
                  maxLength={80}
                  value={draft.name}
                  disabled={!custom}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                />
                {!custom && <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">The name of a default policy can't be changed.</p>}
              </div>

              <div className="kyc-section-label" style={{ marginTop: 28 }}>Edit your policy</div>
              <div className="rounded-xl border border-solid border-[color:var(--color-border)] p-6">
                <p className="text-[22px] leading-[2] font-normal text-[var(--color-text-secondary)]">
                  <Token f="trigger">{cap(draft.trigger)}</Token>{draft.kind === 'administrative' ? ' on ' : ' from '}
                  <Token f="scope">{draft.scope}</Token>{' when '}
                  <Token f="condition">{draft.condition}{draft.conditionValue ? ` ${draft.conditionValue}` : ''}</Token>
                  {draft.description ? ', then ' : ', require '}
                  <Token f="action">{draft.policyAction}</Token>.
                </p>
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
                {custom ? 'Click any highlighted part to change it.' : 'Click a highlighted part to change it. Parts with a lock are set by BitGo.'}
              </p>

              <div className="mr-rm-footer" style={{ padding: 0, border: 'none', marginTop: 48 }}>
                <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="mr-rm-btn-save" disabled={!changed} onClick={() => onSave({ ...draft, lastModified: 'Just now' })}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {field && (
        <div style={{ position: 'relative', zIndex: 900 }}>
          <SentencePolicyUpdateModal policy={draft} field={field} onClose={() => setField(null)} onSave={u => { setDraft(u); setField(null); }} />
        </div>
      )}
    </div>
  );
};
