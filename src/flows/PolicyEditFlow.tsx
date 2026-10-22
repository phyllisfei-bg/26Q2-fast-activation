import React, { useState } from 'react';
import '../styles/kyc.css';
import { CloseIcon, Chip, Badge } from '../components/membersRoles/shared';
import { PolicySentence } from '../components/policies/PolicySentence';
import { SentencePolicyUpdateModal } from '../components/policies/SentencePolicyUpdateModal';
import { isCustomPolicy, scopeFirst } from '../components/policies/policyData';
import type { SentencePolicy, EditablePolicyField } from '../components/policies/policyData';

interface Props {
  policy: SentencePolicy;
  onClose: () => void;
  onSave: (policy: SentencePolicy) => void;
}

type IpEntry = { label: string; cidr: string };

/** Prompts for IP addresses to put on the allowlist. Cancel + Confirm, like every modal. */
const AllowlistModal: React.FC<{ policy: SentencePolicy; value: IpEntry[]; onClose: () => void; onConfirm: (v: IpEntry[]) => void }> = ({ policy, value, onClose, onConfirm }) => {
  const [list, setList] = useState<IpEntry[]>(value);
  const [label, setLabel] = useState('');
  const [cidr, setCidr] = useState('');
  const add = () => { if (!cidr.trim()) return; setList(l => [...l, { label: label.trim() || cidr.trim(), cidr: cidr.trim() }]); setLabel(''); setCidr(''); };
  const changed = JSON.stringify(list) !== JSON.stringify(value);
  const live = { ...policy, description: `Approvals from users that are not from the IP allowlist (${list.length === 0 ? '0 added now' : `${list.length} added`}) are automatically blocked` };
  return (
    <div className="wf-overlay open" style={{ zIndex: 900 }} onClick={onClose}>
      <div className="mr-rm-modal" style={{ width: 640, height: 'auto', maxHeight: 'calc(100vh - 96px)' }} onClick={e => e.stopPropagation()}>
        <div className="mr-rm-header">
          <div className="dep-drawer-breadcrumb">
            <span className="dep-breadcrumb-current" style={{ fontWeight: 400, fontSize: 24 }}>Edit Condition</span>
          </div>
          <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="px-7 pt-5">
          <div className="rounded-xl bg-[var(--color-level2)] px-4 py-3"><div className="mb-1.5"><Badge tone="neutral">Preview</Badge></div><PolicySentence policy={live} /></div>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6 text-left">
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-5">Approvals that don't come from one of these IP addresses are automatically blocked. Add your office or VPN addresses.</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
            <div><label className="kyc-form-label">Label</label><input className="kyc-form-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Office, SF" /></div>
            <div><label className="kyc-form-label">IP or CIDR</label><input className="kyc-form-input" value={cidr} onChange={e => setCidr(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} placeholder="203.0.113.0/28" /></div>
            <button className="mr-actions-btn" style={{ height: 40 }} disabled={!cidr.trim()} onClick={add}>Add</button>
          </div>
          <div className="mt-5">
            <div className="mr-list-heading">{list.length} added</div>
            {list.length === 0
              ? <p className="text-[14px] text-[var(--color-text-muted)]">No IP addresses added yet.</p>
              : <div className="flex flex-wrap gap-2">{list.map((e, i) => <Chip key={e.cidr + i} label={`${e.label} · ${e.cidr}`} onDelete={() => setList(l => l.filter((_, j) => j !== i))} />)}</div>}
          </div>
        </div>
        <div className="mr-rm-footer" style={{ marginTop: 0 }}>
          <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mr-rm-btn-save" disabled={!changed} onClick={() => onConfirm(list)}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

/** Full-screen edit view. Default (seeded) policies only unlock the fields in `editableFields`;
 *  custom policies (made in the builder) unlock every field, including the name. */
export const PolicyEditFlow: React.FC<Props> = ({ policy, onClose, onSave }) => {
  const custom = isCustomPolicy(policy);
  const editable: EditablePolicyField[] = custom ? ['scope', 'trigger', 'condition', 'action'] : policy.editableFields;
  const [draft, setDraft] = useState<SentencePolicy>(policy);
  const [field, setField] = useState<EditablePolicyField | null>(null);
  const [addingIps, setAddingIps] = useState(false);
  const hasAllowlist = !!draft.allowlist;
  const ipCount = draft.allowlist?.length ?? 0;
  const changed = JSON.stringify({ ...draft, lastModified: '' }) !== JSON.stringify({ ...policy, lastModified: '' });

  /** The sentence is exactly the text shown on the Policies page; the editable parts are located inside it. */
  const fullText = draft.description
    ? draft.description
    : `${scopeFirst(draft.summary).replace('{conditionValue}', draft.conditionValue ?? '')}${draft.sentenceMode === 'accepted' ? ' ' : ' requires '}${draft.policyAction}${draft.sentenceSuffix ?? ''}`;
  const conditionNeedle = draft.conditionValue || (hasAllowlist ? 'the IP allowlist' : draft.condition);
  const ranges: { field: EditablePolicyField; start: number; end: number }[] = [];
  const claim = (field: EditablePolicyField, needle: string, last = false) => {
    if (!needle) return;
    const hay = fullText.toLowerCase();
    const at = last ? hay.lastIndexOf(needle.toLowerCase()) : hay.indexOf(needle.toLowerCase());
    if (at < 0) return;
    const end = at + needle.length;
    if (ranges.some(r => at < r.end && end > r.start)) return;
    ranges.push({ field, start: at, end });
  };
  claim('action', draft.policyAction, true);
  claim('condition', conditionNeedle);
  claim('scope', draft.scope);
  claim('trigger', draft.trigger);
  ranges.sort((x, y) => x.start - y.start);

  /** One clickable part of the sentence. Locked parts (default policies) stay muted text. */
  const Token: React.FC<{ f: EditablePolicyField; children: React.ReactNode }> = ({ f, children }) =>
    editable.includes(f) ? (
      <button
        type="button"
        onClick={() => (f === 'condition' && hasAllowlist ? setAddingIps(true) : setField(f))}
        title="Edit"
        style={{ font: 'inherit' }}
        className="inline-flex items-center rounded-lg px-2 py-0.5 border border-transparent bg-[var(--brand-a100)] text-[var(--brand-500)] hover:bg-[var(--brand-a200)] cursor-pointer transition-colors"
      >{children}</button>
    ) : (
      <span className="text-[var(--color-text)]" title="Locked — set by BitGo">{children}</span>
    );

  /** Only the words "from" and "when" are secondary; everything else in the card is primary. */
  const soft = (text: string, key: string) => text.split(/(\bfrom\b|\bwhen\b)/).map((part, i) => /^(from|when)$/.test(part) ? <span key={`${key}-${i}`} className="text-[var(--color-text-secondary)]">{part}</span> : part);

  const sentence: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(r => {
    if (r.start > cursor) sentence.push(...soft(fullText.slice(cursor, r.start), `t${r.start}`));
    sentence.push(<Token key={r.field} f={r.field}>{fullText.slice(r.start, r.end)}</Token>);
    cursor = r.end;
  });
  if (cursor < fullText.length) sentence.push(...soft(fullText.slice(cursor), 'tail'));

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
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-[var(--color-text)]" style={{ marginBottom: hasAllowlist && ipCount === 0 ? 12 : 32, background: 'var(--brand-a100)', border: '1px solid var(--brand-a200)' }}>
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-500)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <div>{custom ? 'This is a custom policy, so every field can be edited.' : 'This is a default policy, so only some fields can be edited. Locked fields are set by BitGo.'}</div>
              </div>

              {hasAllowlist && ipCount === 0 && (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-[var(--color-text)] mb-8" style={{ background: 'rgba(235,197,94,.12)', border: '1px solid rgba(235,197,94,.5)' }}>
                  <div className="flex-1">No IP addresses added yet. Add at least one so this policy can take effect, otherwise it isn't enforced.</div>
                </div>
              )}

              <label className="kyc-form-label">Policy details</label>
              <div className="rounded-xl border border-solid border-[color:var(--color-border)] p-6">
                <p className="text-[22px] leading-[2] font-normal text-[var(--color-text)]">{sentence}</p>
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-2">
                {custom ? 'Click any highlighted part to change it.' : 'Click a highlighted part to change it. Parts with a lock are set by BitGo.'}
              </p>

              <div className="kyc-form-group" style={{ marginTop: 28 }}>
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

              <div className="mr-rm-footer" style={{ padding: 0, border: 'none', marginTop: 48 }}>
                <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="mr-rm-btn-save" disabled={!changed} onClick={() => onSave({ ...draft, lastModified: 'Just now', ...(draft.allowlist ? { description: `Approvals from users that are not from the IP allowlist (${ipCount === 0 ? '0 added now' : `${ipCount} added`}) are automatically blocked` } : {}) })}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addingIps && <AllowlistModal policy={draft} value={draft.allowlist ?? []} onClose={() => setAddingIps(false)} onConfirm={v => { setDraft(d => ({ ...d, allowlist: v, description: `Approvals from users that are not from the IP allowlist (${v.length === 0 ? '0 added now' : `${v.length} added`}) are automatically blocked` })); setAddingIps(false); }} />}

      {field && (
        <div style={{ position: 'relative', zIndex: 900 }}>
          <SentencePolicyUpdateModal policy={draft} field={field} onClose={() => setField(null)} onSave={u => { setDraft(u); setField(null); }} />
        </div>
      )}
    </div>
  );
};
