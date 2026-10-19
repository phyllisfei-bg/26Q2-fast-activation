import React, { useState } from 'react';
import '../styles/kyc.css';
import { CloseIcon } from '../components/membersRoles/shared';
import { BUILDER_EVENTS, BUILDER_WALLETS, BUILDER_TEMPLATES } from '../components/policies/policyData';
import type {
  SentencePolicy, BuilderEvent, BuilderWallet, BuilderCondition, BuilderRequirement, BuilderPart,
} from '../components/policies/policyData';

interface Props {
  isLight: boolean;
  onThemeToggle: () => void;
  onClose: () => void;
  onSubmit: (policy: SentencePolicy) => void;
}

interface Draft {
  event: BuilderEvent; wallet: BuilderWallet;
  condition: BuilderCondition; extraCondition: BuilderCondition; amount: string;
  requirement: BuilderRequirement; extraRequirement: BuilderRequirement;
  approvals: number; role: string; person: string;
}

const conditionCopy = (d: Draft, item: BuilderCondition) => ({
  none: '',
  amount: `over $${d.amount || 'amount'} per transfer`,
  velocity: `totaling over $${d.amount || 'amount'} in 24 hours`,
  destination: 'to addresses not on the whitelist',
  asset: 'in BTC or ETH',
  webhook: "that your webhook doesn't approve",
}[item]);

const requirementCopy = (d: Draft, item: BuilderRequirement) => {
  const n = d.approvals;
  return ({
    '': '',
    'enterprise-admins': n === 1 ? '1 approval from Enterprise Admins' : `${n} approvals from Enterprise Admins`,
    'wallet-admins': n === 1 ? '1 approval from a wallet admin' : `${n} approvals from wallet admins`,
    people: `${n} approval${n === 1 ? '' : 's'} from Leo, Chris or Arnold`,
    role: `${n} approval${n === 1 ? '' : 's'} from the ${d.role} role`,
    final: `final approval from ${d.person}`,
    reject: 'rejected automatically',
  } as Record<BuilderRequirement, string>)[item];
};

const joinAnd = (a: string, b: string) => [a, b].filter(Boolean).join(' and ');

/* ── The sentence: each highlighted part is clickable to edit ── */
const SentenceBuilder: React.FC<{
  draft: Draft; activePart?: BuilderPart; compact?: boolean;
  onPart?: (p: BuilderPart) => void; onAddCondition?: () => void; onAddRequirement?: () => void;
  onPick?: (patch: Partial<Draft>) => void;
}> = ({ draft, activePart, compact, onPart, onAddCondition, onAddRequirement, onPick }) => {
  const eventDef = BUILDER_EVENTS.find(e => e.id === draft.event)!;
  const walletText = BUILDER_WALLETS.find(w => w.id === draft.wallet)?.label;
  const hasCondition = draft.condition !== 'none' || draft.extraCondition !== 'none';
  const eventText = hasCondition ? eventDef.sentence : eventDef.noCondition;
  const conditionText = joinAnd(conditionCopy(draft, draft.condition), conditionCopy(draft, draft.extraCondition));
  const requirementText = joinAnd(requirementCopy(draft, draft.requirement), requirementCopy(draft, draft.extraRequirement));
  const rejects = draft.requirement === 'reject' || draft.extraRequirement === 'reject';

  const partClass = (part: BuilderPart, filled: boolean) =>
    `inline-flex items-center rounded-lg px-2 py-0.5 border transition-colors cursor-pointer ${
      activePart === part
        ? 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white'
        : filled
          ? 'bg-[var(--brand-a100)] border-transparent text-[var(--brand-500)] hover:bg-[var(--brand-a200)]'
          : 'bg-transparent border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[var(--brand-500)]'}`;
  const Part: React.FC<{ part: BuilderPart; filled: boolean; children: React.ReactNode }> = ({ part, filled, children }) =>
    onPart
      ? <button type="button" onClick={() => onPart(part)} className={partClass(part, filled)} style={{ font: 'inherit' }}>{children}</button>
      : <span className="text-[var(--color-text)]">{children}</span>;
  const selectClass = 'rounded-lg px-2 py-0.5 border border-[var(--brand-500)] bg-[var(--brand-a100)] text-[var(--brand-500)] outline-none cursor-pointer';
  const linkBtn = 'text-[14px] font-medium text-[var(--brand-500)] bg-transparent border-none cursor-pointer p-0 hover:underline';

  return (
    <p className={`${compact ? 'text-[14px] leading-relaxed' : 'text-[22px] leading-[2]'} font-normal text-[var(--color-text-secondary)]`}>
      {onPick && activePart === 'event' ? (
        <select
          autoFocus
          className={selectClass}
          style={{ font: 'inherit' }}
          value={draft.event}
          onChange={e => { onPick({ event: e.target.value as BuilderEvent }); onPart?.(null); }}
          onBlur={() => onPart?.(null)}
        >
          {BUILDER_EVENTS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      ) : <Part part="event" filled>{eventText}</Part>}{' from '}
      {onPick && activePart === 'wallets' ? (
        <select
          autoFocus
          className={selectClass}
          style={{ font: 'inherit' }}
          value={draft.wallet}
          onChange={e => { onPick({ wallet: e.target.value as BuilderWallet }); onPart?.(null); }}
          onBlur={() => onPart?.(null)}
        >
          {BUILDER_WALLETS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      ) : <Part part="wallets" filled={!!walletText}>{walletText || 'choose wallets'}</Part>}{' '}
      {hasCondition ? (
        <>
          <Part part="condition" filled>{conditionText}</Part>{' '}
          {onPart && <><button type="button" className={linkBtn} onClick={onAddCondition}>+ Add condition</button>{' '}</>}
        </>
      ) : (
        onPart && <><button type="button" className={linkBtn} onClick={() => onPart('condition')}>+ Add a condition</button>{' '}</>
      )}
      {rejects ? 'are ' : 'require '}
      <Part part="requirement" filled={!!requirementText}>{requirementText || 'choose what to require'}</Part>
      {onPart && draft.requirement && <>{' '}<button type="button" className={linkBtn} onClick={onAddRequirement}>+ Add requirement</button></>}.
    </p>
  );
};

const Note: React.FC<{ tone: 'info' | 'danger'; children: React.ReactNode }> = ({ tone, children }) => (
  <div
    className="rounded-xl px-4 py-3 text-[14px] leading-relaxed text-[var(--color-text)]"
    style={{
      background: tone === 'danger' ? 'rgba(248,113,113,.10)' : 'var(--brand-a100)',
      border: `1px solid ${tone === 'danger' ? 'var(--color-danger)' : 'var(--brand-a200)'}`,
    }}
  >{children}</div>
);

export const PolicyBuilderFlow: React.FC<Props> = ({ isLight, onThemeToggle, onClose, onSubmit }) => {
  const [draft, setDraft] = useState<Draft>({
    event: 'withdrawal', wallet: 'all', condition: 'amount', extraCondition: 'none', amount: '100,000',
    requirement: 'enterprise-admins', extraRequirement: '', approvals: 1, role: 'Investment Committee', person: 'Daniel Ruiz',
  });
  const patch = (p: Partial<Draft>) => setDraft(d => ({ ...d, ...p }));
  const [activePart, setActivePart] = useState<BuilderPart>(null);
  const [template, setTemplate] = useState('scratch');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showOtherConditions, setShowOtherConditions] = useState(false);
  const [showOtherRequirements, setShowOtherRequirements] = useState(false);
  const [addingCondition, setAddingCondition] = useState(false);
  const [addingRequirement, setAddingRequirement] = useState(false);

  const { event, wallet, condition, extraCondition, requirement, extraRequirement, amount, approvals, role, person } = draft;
  const eventDef = BUILDER_EVENTS.find(e => e.id === event)!;
  const walletText = BUILDER_WALLETS.find(w => w.id === wallet)?.label ?? 'wallets';
  const hasCondition = condition !== 'none' || extraCondition !== 'none';
  const conditionText = joinAnd(conditionCopy(draft, condition), conditionCopy(draft, extraCondition));
  const requirementText = joinAnd(requirementCopy(draft, requirement), requirementCopy(draft, extraRequirement));
  const suggestedName = `${eventDef.sentence}${condition === 'amount' ? ` over $${amount}` : condition === 'destination' ? ' to non-whitelisted addresses' : ''} from ${walletText}`;
  const policyName = nameTouched ? name : suggestedName;
  const valid = !!wallet && !!requirement && !!policyName.trim() && !(condition === 'amount' && !amount);
  const blockingAdminCount = wallet === 'eth-custody' && requirement === 'wallet-admins' && approvals >= 2;
  const canSubmit = valid && !blockingAdminCount;

  const applyTemplate = (id: string) => {
    setTemplate(id);
    patch({
      event: id === 'staking' ? 'stake' : 'withdrawal',
      condition: id === 'large' ? 'amount' : id === 'daily' ? 'velocity' : id === 'block' || id === 'destination' ? 'destination' : id === 'webhook' ? 'webhook' : 'none',
      requirement: id === 'block' || id === 'webhook' ? 'reject' : id === 'named' ? 'people' : id === 'final' ? 'final' : 'wallet-admins',
      extraCondition: 'none', extraRequirement: '', approvals: id === 'large' ? 2 : 1,
    });
    setNameTouched(false);
    setActivePart('wallets');
  };

  const startFromScratch = () => {
    setTemplate('scratch');
    patch({ event: 'withdrawal', wallet: 'all', condition: 'amount', extraCondition: 'none', amount: '100,000', requirement: 'enterprise-admins', extraRequirement: '', approvals: 1 });
    setNameTouched(false);
    setActivePart(null);
  };

  const submit = () => {
    const rejects = requirement === 'reject' || extraRequirement === 'reject';
    const summaryEvent = hasCondition ? eventDef.sentence : eventDef.noCondition;
    onSubmit({
      id: `custom-${Date.now()}`, kind: 'transactions', name: policyName,
      summary: `${summaryEvent} from ${walletText}${conditionText ? ` ${conditionText}` : ''}${rejects ? ' are' : ''}`,
      sentenceMode: rejects ? 'accepted' : undefined,
      setBy: 'Your enterprise', policyState: 'Pending approval', actor: 'wallet user',
      trigger: eventDef.sentence.toLowerCase(), scope: walletText, condition: conditionText || 'always',
      policyAction: requirementText, editableFields: ['scope', 'trigger', 'condition', 'action'],
      status: 'Active', lastModified: 'Just now',
    });
  };

  const openPart = (part: BuilderPart) => {
    setActivePart(part); setAddingCondition(false); setAddingRequirement(false);
    if (part === 'condition') setShowOtherConditions(false);
    if (part === 'requirement') setShowOtherRequirements(false);
  };
  const activeCondition = addingCondition ? extraCondition : condition;
  const activeRequirement = addingRequirement ? extraRequirement : requirement;

  const modalShell = (eyebrow: string, title: string, body: React.ReactNode, onDone: () => void) => (
    <div className="wf-overlay open" style={{ zIndex: 900 }} onClick={onDone}>
      <div className="mr-rm-modal" style={{ height: 'auto', width: 560 }} onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') onDone(); }}>
        <div className="mr-rm-header">
          <div>
            <div className="mr-list-heading" style={{ marginBottom: 4 }}>{eyebrow}</div>
            <span className="mr-rm-title">{title}</span>
          </div>
          <button className="mr-rm-close" onClick={onDone}><CloseIcon /></button>
        </div>
        <div className="px-7 pt-6">{body}</div>
        <div className="mr-rm-footer" style={{ marginTop: 24 }}>
          <button className="mr-rm-btn-save" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );

  const optionBtn = (selected: boolean) =>
    `rounded-xl p-3 text-left text-[14px] cursor-pointer transition-colors border ${selected ? 'border-[var(--brand-500)] bg-[var(--brand-a100)] text-[var(--brand-500)]' : 'border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-level2)]'}`;

  const conditionModal = activePart === 'condition' && modalShell('Condition', 'Only apply this policy when…', (
    !showOtherConditions ? (
      <div>
        <label className="kyc-form-label">{activeCondition === 'velocity' ? 'Total in 24 hours' : 'Amount per transfer'}</label>
        <div className="relative">
          <span className="absolute left-3.5 top-[11px] text-[14px] leading-[22px] text-[var(--color-text-muted)]">$</span>
          <input autoFocus className="kyc-form-input" style={{ paddingLeft: 28 }} value={amount} onChange={e => patch({ amount: e.target.value.replace(/[^\d,]/g, '') })} />
        </div>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">This policy applies when a transfer is over this amount.</p>
        <button className="mt-5 text-[14px] font-semibold text-[var(--brand-500)] bg-transparent border-none cursor-pointer p-0 hover:underline" onClick={() => setShowOtherConditions(true)}>View other conditions</button>
      </div>
    ) : (
      <div>
        <p className="kyc-form-label">Choose another condition</p>
        <div className="grid grid-cols-2 gap-2">
          {([['amount', 'Amount per transfer'], ['velocity', 'Total over time'], ['destination', 'Destination'], ['asset', 'Asset'], ['webhook', 'Your webhook']] as [BuilderCondition, string][]).map(([id, label]) => (
            <button key={id} className={optionBtn(activeCondition === id)} onClick={() => {
              if (addingCondition) patch({ extraCondition: id }); else patch({ condition: id });
              setShowOtherConditions(id !== 'amount' && id !== 'velocity');
            }}>{label}</button>
          ))}
        </div>
      </div>
    )
  ), () => setActivePart(null));

  const requirementLabel = activeRequirement === 'wallet-admins' ? 'Approvals from wallet admins'
    : activeRequirement === 'people' ? 'Approvals from specific people'
    : activeRequirement === 'role' ? 'Approvals from a role'
    : activeRequirement === 'final' ? 'Final approver'
    : activeRequirement === 'reject' ? 'Reject automatically' : 'Approvals from enterprise admins';

  const requirementModal = activePart === 'requirement' && modalShell('Requirement', 'What has to happen before it goes through?', (
    !showOtherRequirements ? (
      <div>
        <label className="kyc-form-label">{requirementLabel}</label>
        {activeRequirement === 'final' ? (
          <select className="kyc-form-select" value={person} onChange={e => patch({ person: e.target.value })}>
            <option>Daniel Ruiz</option><option>Leo Martins</option><option>Chris Wang</option>
          </select>
        ) : activeRequirement === 'reject' ? (
          <p className="text-[14px] text-[var(--color-text-secondary)]">Matching transactions will be rejected with no exceptions.</p>
        ) : (
          <div className="flex gap-3">
            <input autoFocus className="kyc-form-input" style={{ width: 112 }} type="number" min="1" value={approvals} onChange={e => patch({ approvals: Math.max(1, Number(e.target.value)) })} />
            {activeRequirement === 'role' && (
              <select className="kyc-form-select" style={{ flex: 1 }} value={role} onChange={e => patch({ role: e.target.value })}>
                <option>Investment Committee</option><option>Organization Admin</option><option>Wallet Admin</option>
              </select>
            )}
          </div>
        )}
        <button className="mt-5 text-[14px] font-semibold text-[var(--brand-500)] bg-transparent border-none cursor-pointer p-0 hover:underline" onClick={() => setShowOtherRequirements(true)}>View other requirements</button>
      </div>
    ) : (
      <div>
        <p className="kyc-form-label">Choose another requirement</p>
        <div className="flex flex-col gap-2">
          {([['enterprise-admins', 'Approvals from enterprise admins'], ['wallet-admins', 'Approvals from wallet admins'], ['people', 'Approvals from specific people'], ['role', 'Approvals from a role'], ['final', 'Final approval'], ['reject', 'Reject automatically']] as [BuilderRequirement, string][]).map(([id, label]) => (
            <button key={id} className={optionBtn(activeRequirement === id)} onClick={() => {
              if (id === 'reject') { patch({ requirement: 'reject', extraRequirement: '' }); setAddingRequirement(false); }
              else if (addingRequirement) patch({ extraRequirement: id });
              else patch({ requirement: id });
              setShowOtherRequirements(false);
            }}>{label}</button>
          ))}
        </div>
      </div>
    )
  ), () => setActivePart(null));

  return (
    <div className="fixed inset-0" style={{ zIndex: 800 }}>
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
              <h2 className="kyc-step-title">New Policy</h2>
              <p className="kyc-step-sub">Build your policy as a sentence. Click any highlighted part to change it.</p>
            </div>
          </div>

          <div className="kyc-flow-body">
            <div className="kyc-flow-inner">
              <div className="kyc-section-label">Start from a common policy</div>
              <div className="flex flex-wrap gap-2 mb-6">
                <button className={`filter-chip${template === 'scratch' ? ' active' : ''}`} onClick={startFromScratch}>Start from scratch</button>
                {BUILDER_TEMPLATES.map(([id, label]) => (
                  <button key={id} className={`filter-chip${template === id ? ' active' : ''}`} onClick={() => applyTemplate(id)}>{label}</button>
                ))}
              </div>

              <div className="kyc-section-label">Build your policy</div>
              <div className="rounded-xl border border-[var(--color-border)] p-6">
                <SentenceBuilder
                  draft={draft}
                  activePart={activePart}
                  onPick={patch}
                  onPart={p => (p === null ? setActivePart(null) : openPart(p))}
                  onAddCondition={() => { setAddingCondition(true); setShowOtherConditions(true); setActivePart('condition'); }}
                  onAddRequirement={() => { setAddingRequirement(true); setShowOtherRequirements(true); setActivePart('requirement'); }}
                />
              </div>

              <div className="kyc-form-group" style={{ marginTop: 24 }}>
                <label className="kyc-form-label">Name</label>
                <input
                  className="kyc-form-input"
                  maxLength={80}
                  value={policyName}
                  onChange={e => { setName(e.target.value); setNameTouched(true); }}
                />
                <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">Suggested from the policy. You can rename it.</p>
              </div>

              <div className="kyc-section-label" style={{ marginTop: 28 }}>Before you publish</div>
              <div className="flex flex-col gap-2.5">
                {!wallet && <Note tone="danger"><strong>Choose which wallets this covers.</strong></Note>}
                {!requirement && <Note tone="danger"><strong>Choose what to require.</strong></Note>}
                {blockingAdminCount && (
                  <Note tone="danger"><strong>ETH Custody has 2 wallet admins.</strong> This policy needs 3: 2 to approve, plus the person who starts the withdrawal.</Note>
                )}
                <Note tone="info">Policies lock 48 hours after they're published. Changing one after that means unlocking it first.</Note>
                <Note tone="info">Creating or changing any policy in this enterprise requires <strong>1 wallet admin and 1 enterprise admin to approve</strong>.</Note>
              </div>

              <div className="kyc-flow-footer">
                <button className="kyc-btn-back" onClick={onClose}>Cancel</button>
                <button
                  className="kyc-btn-continue"
                  style={canSubmit ? undefined : { opacity: 0.45, cursor: 'default' }}
                  disabled={!canSubmit}
                  onClick={() => setReviewing(true)}
                >Review and Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {conditionModal}
      {requirementModal}

      {reviewing && (
        <div className="wf-overlay open" style={{ zIndex: 900 }} onClick={() => setReviewing(false)}>
          <div className="mr-rm-modal" style={{ height: 'auto', width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="mr-rm-header">
              <span className="mr-rm-title">Review New Policy</span>
              <button className="mr-rm-close" onClick={() => setReviewing(false)}><CloseIcon /></button>
            </div>
            <div className="px-7 pt-6 flex flex-col gap-5">
              <div>
                <div className="mr-list-heading">Policy name</div>
                <div className="text-[16px] text-[var(--color-text)]">{policyName}</div>
              </div>
              <div className="rounded-xl bg-[var(--color-level2)] p-4"><SentenceBuilder draft={draft} compact /></div>
              <div>
                <div className="mr-list-heading">Who has to approve this</div>
                <p className="text-[14px] text-[var(--color-text-secondary)]">Creating or changing any policy in this enterprise requires <span className="text-[var(--color-text)]">1 wallet admin and 1 enterprise admin to approve</span>.</p>
              </div>
              <p className="text-[14px] text-[var(--color-text-secondary)]">It locks 48 hours after it's published.</p>
            </div>
            <div className="mr-rm-footer" style={{ marginTop: 24 }}>
              <button className="mr-rm-btn-cancel" onClick={() => setReviewing(false)}>Keep Editing</button>
              <button className="mr-rm-btn-save" onClick={submit}>Submit for Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
