import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/kyc.css';
import { CloseIcon, Chip } from '../components/membersRoles/shared';
import { BUILDER_EVENTS, BUILDER_WALLETS, BUILDER_TEMPLATES } from '../components/policies/policyData';
import type { SentencePolicy, BuilderEvent, BuilderWallet, CondType, ActType, Cond, Act } from '../components/policies/policyData';

interface Props {
  /** 'page' = full page + nested modal; 'modal' = modal + nested screens. */
  mode: 'page' | 'modal';
  isLight: boolean;
  onThemeToggle: () => void;
  onClose: () => void;
  onSubmit: (policy: SentencePolicy) => void;
}

interface Scope { mode: BuilderWallet; wallets: string[]; types: string[]; tags: string[] }
interface Draft { event: BuilderEvent; scope: Scope; conds: Cond[]; acts: Act[] }
const ALL_SCOPE: Scope = { mode: 'all', wallets: [], types: [], tags: [] };
type Screen = 'main' | 'condition' | 'action' | 'scope';
type EditPart = 'condition' | 'action' | 'scope';

const USERS = ['Jack Brown', 'Jill Green', 'Joe White', 'Daniel Ruiz'];
const WALLETS = ['ETH Custody', 'Treasury Hot', 'BTC Cold', 'Operations Hot', 'Payroll Wallet'];
const TYPES = ['Custody', 'Self-custody hot', 'Self-custody cold'];
const TAGS = ['Treasury', 'Operations', 'Cold storage', 'High value', 'Payroll'];
const CURRENCIES = ['USD', 'TUSD', 'USDC'];
const ROLES = ['Investment Committee', 'Organization Admin', 'Wallet Admin'];

let uid = 0;
const newCond = (type: CondType = 'amount', fresh = false): Cond => ({ id: `c${++uid}`, type, limit: 'gt', amount: type === 'amount' ? '100,000' : '', currency: 'USD', fresh });
const newAct = (type: ActType = 'enterprise-admins', fresh = false): Act => ({ id: `a${++uid}`, type, approvals: 1, role: ROLES[0], person: USERS[3], users: [], selfApprove: false, fresh });

const COND_TYPES: { id: CondType; label: string; help: string }[] = [
  { id: 'amount', label: 'Spending limit', help: 'Policy triggers if a withdrawal meets the specified threshold' },
  { id: 'velocity', label: 'Total over time', help: 'Policy triggers when withdrawals add up past the threshold in 24 hours' },
  { id: 'destination', label: 'Destination', help: "Policy triggers when funds go to an address that isn't whitelisted" },
  { id: 'asset', label: 'Asset', help: 'Policy triggers for withdrawals in BTC or ETH' },
  { id: 'webhook', label: 'Your webhook', help: "Policy triggers when your webhook doesn't approve the withdrawal" },
];
const ACT_TYPES: { id: ActType; label: string; help: string }[] = [
  { id: 'enterprise-admins', label: 'Require approval from enterprise admins', help: 'Enterprise admins approve before it goes through' },
  { id: 'wallet-admins', label: 'Require approval from wallet admins', help: 'Admins of the wallet approve before it goes through' },
  { id: 'users', label: 'Require approval from a set of users', help: 'Choose the people who can approve' },
  { id: 'role', label: 'Require approval from a role', help: 'Anyone holding the role can approve' },
  { id: 'final', label: 'Require final approval from one person', help: 'One named person signs off last' },
  { id: 'reject', label: 'Reject automatically', help: 'Matching transactions are rejected with no exceptions' },
];

const sigOf = (d: Draft) => JSON.stringify({ e: d.event, s: d.scope, c: d.conds.map(({ id, fresh, ...r }) => r), a: d.acts.map(({ id, fresh, ...r }) => r) });
const orList0 = (names: string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
const scopeLabel = (sc: Scope) => {
  switch (sc.mode) {
    case 'all': return 'all wallets';
    case 'single': return sc.wallets[0] ?? 'a selected wallet';
    case 'multiple': return sc.wallets.length === 0 ? 'selected wallets' : sc.wallets.length <= 2 ? orList0(sc.wallets) : `${sc.wallets.length} wallets`;
    case 'type': return sc.types.length ? `all ${orList0(sc.types.map(t => t.toLowerCase()))} wallets` : 'wallets of selected types';
    case 'tag': return sc.tags.length ? `wallets tagged ${orList0(sc.tags)}` : 'wallets with selected tags';
  }
};
const scopeValid = (sc: Scope) => sc.mode === 'all' || (sc.mode === 'single' ? sc.wallets.length === 1 : sc.mode === 'multiple' ? sc.wallets.length > 0 : sc.mode === 'type' ? sc.types.length > 0 : sc.tags.length > 0);
/** Keep only the selection that belongs to the chosen mode. */
const cleanScope = (sc: Scope): Scope => ({ mode: sc.mode, wallets: sc.mode === 'single' || sc.mode === 'multiple' ? sc.wallets.slice(0, sc.mode === 'single' ? 1 : undefined) : [], types: sc.mode === 'type' ? sc.types : [], tags: sc.mode === 'tag' ? sc.tags : [] });
const money = (c: Cond) => c.currency === 'USD' ? `$${c.amount || 'amount'}` : `${c.amount || 'amount'} ${c.currency}`;
const condCopy = (c: Cond) => ({
  amount: `${c.limit === 'gte' ? 'at least' : 'over'} ${money(c)} per transfer`,
  velocity: `totaling ${c.limit === 'gte' ? 'at least' : 'over'} ${money(c)} in 24 hours`,
  destination: 'to addresses not on the whitelist',
  asset: 'in BTC or ETH',
  webhook: "that your webhook doesn't approve",
}[c.type]);
const orList = (names: string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
const actCopy = (a: Act) => {
  const n = a.approvals;
  const s = n === 1 ? '' : 's';
  return ({
    'enterprise-admins': n === 1 ? '1 approval from Enterprise Admins' : `${n} approvals from Enterprise Admins`,
    'wallet-admins': n === 1 ? '1 approval from a wallet admin' : `${n} approvals from wallet admins`,
    users: `${n} approval${s} from ${a.users.length ? orList(a.users.map(u => u.split(' ')[0])) : 'selected users'}`,
    role: `${n} approval${s} from the ${a.role} role`,
    final: `final approval from ${a.person}`,
    reject: 'rejected automatically',
  } as Record<ActType, string>)[a.type];
};
const condText = (conds: Cond[]) => conds.map(condCopy).join(' and ');
const actText = (acts: Act[]) => acts.map(actCopy).join(', then ');
const isReject = (acts: Act[]) => acts.some(a => a.type === 'reject');
const condValid = (c: Cond) => (c.type !== 'amount' && c.type !== 'velocity') || !!c.amount;
const actValid = (a: Act) =>
  a.type === 'reject' || a.type === 'final' ||
  (a.approvals >= 1 && (a.type !== 'users' || (a.users.length > 0 && a.users.length >= a.approvals)));

/* ── The sentence: highlighted parts are editable ── */
const SentenceBuilder: React.FC<{
  draft: Draft; compact?: boolean; highlight?: EditPart;
  onPick?: (p: Partial<Draft>) => void; onOpen?: (screen: EditPart, addNew?: boolean) => void;
}> = ({ draft, compact, highlight, onPick, onOpen }) => {
  const [sel, setSel] = useState<'event' | null>(null);
  const eventDef = BUILDER_EVENTS.find(e => e.id === draft.event)!;
  const walletText = scopeLabel(draft.scope);
  const hasCond = draft.conds.length > 0;
  const rejects = isReject(draft.acts);

  const tone = (filled: boolean, active: boolean) =>
    `inline-flex items-center rounded-lg px-2 py-0.5 border transition-colors ${
      active ? 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white'
      : filled ? 'bg-[var(--brand-a100)] border-transparent text-[var(--brand-500)] hover:bg-[var(--brand-a200)]'
      : 'bg-transparent border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[var(--brand-500)]'}`;
  const Token: React.FC<{ filled: boolean; active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ filled, active, onClick, children }) =>
    onClick
      ? <button type="button" onClick={onClick} className={`${tone(filled, !!active)} cursor-pointer`} style={{ font: 'inherit' }}>{children}</button>
      : <span className={highlight && active ? tone(true, true) : 'text-[var(--color-text)]'}>{children}</span>;
  const selectClass = 'rounded-lg px-2 py-0.5 border border-[var(--brand-500)] bg-[var(--brand-a100)] text-[var(--brand-500)] outline-none cursor-pointer';
  const link = 'text-[14px] font-medium text-[var(--brand-500)] bg-transparent border-none cursor-pointer p-0 hover:underline';
  const interactive = !!onOpen;

  return (
    <p className={`${compact ? 'text-[14px] leading-[2]' : 'text-[22px] leading-[2]'} font-normal text-[var(--color-text-secondary)]`}>
      {interactive && sel === 'event' ? (
        <select autoFocus className={selectClass} style={{ font: 'inherit' }} value={draft.event}
          onChange={e => { onPick?.({ event: e.target.value as BuilderEvent }); setSel(null); }} onBlur={() => setSel(null)}>
          {BUILDER_EVENTS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      ) : <Token filled onClick={interactive ? () => setSel('event') : undefined}>{hasCond ? eventDef.sentence : eventDef.noCondition}</Token>}{' from '}
      <Token filled={!!walletText} active={highlight === 'scope'} onClick={interactive ? () => onOpen!('scope') : undefined}>{walletText || 'choose wallets'}</Token>{' '}
      {hasCond ? (
        <>
          <Token filled active={highlight === 'condition'} onClick={interactive ? () => onOpen!('condition') : undefined}>{condText(draft.conds)}</Token>{' '}
          {interactive && <><button type="button" className={link} onClick={() => onOpen!('condition', true)}>+ Add condition</button>{' '}</>}
        </>
      ) : (
        interactive && <><button type="button" className={link} onClick={() => onOpen!('condition', true)}>+ Add a condition</button>{' '}</>
      )}
      {rejects ? 'are ' : 'require '}
      <Token filled={draft.acts.length > 0} active={highlight === 'action'} onClick={interactive ? () => onOpen!('action') : undefined}>{draft.acts.length ? actText(draft.acts) : 'choose what to require'}</Token>
      {interactive && draft.acts.length > 0 && !rejects && <>{' '}<button type="button" className={link} onClick={() => onOpen!('action', true)}>+ Add action</button></>}.
    </p>
  );
};

const GHOST = 'inline-flex items-center h-9 px-3 -ml-3 rounded-full border-none bg-transparent text-[14px] font-semibold text-[var(--brand-500)] cursor-pointer hover:bg-[var(--brand-a100)] transition-colors';

/** Dropdown whose options carry a title and a description (native <select> can't).
 *  The list is portal-rendered with fixed positioning so the modal body never clips it. */
const RichSelect: React.FC<{ value: string; options: { id: string; label: string; help: string }[]; onChange: (v: any) => void }> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 400 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const cur = options.find(o => o.id === value);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom - 16;
      const above = r.top - 16;
      const flip = below < 260 && above > below;
      const maxHeight = Math.min(400, flip ? above : below);
      setPos({ top: flip ? r.top - 8 - maxHeight : r.bottom + 8, left: r.left, width: r.width, maxHeight });
    };
    update();
    const close = (e: Event) => { if (!(e.target as HTMLElement)?.closest?.('.rich-select-list')) setOpen(false); };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', close, true); };
  }, [open]);

  const pick = (id: string) => { onChange(id); setOpen(false); };
  return (
    <>
      <button ref={btnRef} type="button" className="kyc-form-select text-left" onClick={() => setOpen(o => !o)}>{cur?.label}</button>
      {open && ReactDOM.createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div className="mr-rm-dropdown rich-select-list" style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, right: 'auto', maxHeight: pos.maxHeight, zIndex: 1000 }}>
            {options.map(o => (
              <div key={o.id} tabIndex={0} className={`mr-rm-role${o.id === value ? ' selected' : ''}`}
                onClick={() => pick(o.id)} onKeyDown={e => { if (e.key === 'Enter') pick(o.id); }}>
                <div className="mr-rm-role-main">
                  <div className="mr-rm-role-name" style={{ fontWeight: 400 }}>{o.label}</div>
                  <div className="mr-rm-role-meta">{o.help}</div>
                </div>
              </div>
            ))}
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

/** Chips for chosen items + a select that adds more. */
const MultiPick: React.FC<{ label: string; placeholder: string; allAdded: string; options: string[]; value: string[]; onChange: (v: string[]) => void }> = ({ label, placeholder, allAdded, options, value, onChange }) => {
  const left = options.filter(o => !value.includes(o));
  return (
    <>
      <label className="kyc-form-label" style={{ marginTop: 20 }}>{label}</label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">{value.map(v => <Chip key={v} label={v} onDelete={() => onChange(value.filter(x => x !== v))} />)}</div>
      )}
      <select className="kyc-form-select" value="" disabled={left.length === 0} onChange={e => e.target.value && onChange([...value, e.target.value])}>
        <option value="">{left.length ? placeholder : allAdded}</option>
        {left.map(o => <option key={o}>{o}</option>)}
      </select>
      {value.length === 0 && <Help>Select at least one.</Help>}
    </>
  );
};

const Note: React.FC<{ tone: 'info' | 'danger'; children: React.ReactNode }> = ({ tone, children }) => (
  <div
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] leading-relaxed text-[var(--color-text)]"
    style={{ background: tone === 'danger' ? 'rgba(248,113,113,.10)' : 'var(--brand-a100)', border: `1px solid ${tone === 'danger' ? 'var(--color-danger)' : 'var(--brand-a200)'}` }}
  >
    <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: tone === 'danger' ? 'var(--color-danger)' : 'var(--brand-500)' }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
    <div>{children}</div>
  </div>
);

const TrashBtn: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => (
  <button type="button" className="mr-rm-icon-btn always" title="Remove" disabled={disabled} onClick={onClick} style={disabled ? { opacity: 0.35, cursor: 'default' } : undefined}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  </button>
);

const Help: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">{children}</p>
);

/* ── Condition card ── */
const CondCard: React.FC<{ cond: Cond; index: number; onChange: (c: Cond) => void; onDelete: () => void }> = ({ cond, index, onChange, onDelete }) => {
  const def = COND_TYPES.find(t => t.id === cond.type)!;
  const numeric = cond.type === 'amount' || cond.type === 'velocity';
  return (
    <div className="pb-5 mb-5 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <label className="kyc-form-label" style={{ margin: 0 }}>{cond.fresh ? 'New Condition' : `Condition ${index + 1}`} <span className="text-[var(--color-danger)]">*</span></label>
        <TrashBtn onClick={onDelete} />
      </div>
      <select className="kyc-form-select" value={cond.type} onChange={e => onChange({ ...cond, type: e.target.value as CondType, amount: e.target.value === 'amount' && !cond.amount ? '100,000' : cond.amount })}>
        {COND_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <Help>{def.help}</Help>
      {numeric && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 16 }}>Limit</label>
          <select className="kyc-form-select" value={cond.limit} onChange={e => onChange({ ...cond, limit: e.target.value as 'gt' | 'gte' })}>
            <option value="gt">Greater than</option><option value="gte">Greater than or equal to</option>
          </select>
          <div className="kyc-form-row" style={{ marginTop: 16, marginBottom: 0 }}>
            <div>
              <label className="kyc-form-label">{cond.type === 'velocity' ? 'Total in 24 hours' : 'Amount'}</label>
              <input className="kyc-form-input" inputMode="numeric" placeholder="Enter amount" value={cond.amount} onChange={e => onChange({ ...cond, amount: e.target.value.replace(/[^\d,]/g, '') })} />
            </div>
            <div>
              <label className="kyc-form-label">Currency</label>
              <select className="kyc-form-select" value={cond.currency} onChange={e => onChange({ ...cond, currency: e.target.value })}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Action card ── */
const ActCard: React.FC<{ act: Act; index: number; canDelete: boolean; onChange: (a: Act) => void; onDelete: () => void }> = ({ act, index, canDelete, onChange, onDelete }) => {
  const def = ACT_TYPES.find(t => t.id === act.type)!;
  const counted = act.type !== 'reject' && act.type !== 'final';
  const available = USERS.filter(u => !act.users.includes(u));
  return (
    <div className="pb-5 mb-5 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <label className="kyc-form-label" style={{ margin: 0 }}>{act.fresh ? 'New Action' : `Action ${index + 1}`} <span className="text-[var(--color-danger)]">*</span></label>
        <TrashBtn onClick={onDelete} disabled={!canDelete} />
      </div>
      <select className="kyc-form-select" value={act.type} onChange={e => onChange({ ...act, type: e.target.value as ActType })}>
        {ACT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <Help>{def.help}</Help>
      {counted && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 16 }}>Approvals Required</label>
          <input className="kyc-form-input" type="number" min="1" placeholder="Minimum required number of approvers" value={act.approvals} onChange={e => onChange({ ...act, approvals: Math.max(1, Number(e.target.value)) })} />
          {act.type === 'users' && <Help>{USERS.length} users available</Help>}
        </>
      )}
      {act.type === 'users' && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 16 }}>Users</label>
          {act.users.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">{act.users.map(u => <Chip key={u} label={u} onDelete={() => onChange({ ...act, users: act.users.filter(x => x !== u) })} />)}</div>
          )}
          <select className="kyc-form-select" value="" onChange={e => e.target.value && onChange({ ...act, users: [...act.users, e.target.value] })} disabled={available.length === 0}>
            <option value="">{available.length ? 'List of enterprise users for approval' : 'All users added'}</option>
            {available.map(u => <option key={u}>{u}</option>)}
          </select>
          {act.users.length < act.approvals && <Help>Select at least {act.approvals} user{act.approvals === 1 ? '' : 's'}.</Help>}
          <label className="flex items-center gap-2.5 mt-4 text-[14px] text-[var(--color-text)] cursor-pointer">
            <input type="checkbox" className="mr-check" checked={act.selfApprove} onChange={e => onChange({ ...act, selfApprove: e.target.checked })} />
            Initiators can approve their own request
          </label>
        </>
      )}
      {act.type === 'role' && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 16 }}>Role</label>
          <select className="kyc-form-select" value={act.role} onChange={e => onChange({ ...act, role: e.target.value })}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
        </>
      )}
      {act.type === 'final' && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 16 }}>Final approver</label>
          <select className="kyc-form-select" value={act.person} onChange={e => onChange({ ...act, person: e.target.value })}>{USERS.map(u => <option key={u}>{u}</option>)}</select>
        </>
      )}
    </div>
  );
};

export const PolicyBuilderFlow: React.FC<Props> = ({ mode, onClose, onSubmit }) => {
  const [draft, setDraft] = useState<Draft>({ event: 'withdrawal', scope: ALL_SCOPE, conds: [newCond()], acts: [newAct()] });
  const patch = (p: Partial<Draft>) => setDraft(d => ({ ...d, ...p }));
  const [template, setTemplate] = useState('scratch');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [tpl, setTpl] = useState<{ name: string; sig: string } | null>(null);
  const [reviewing, setReviewing] = useState(false);

  // Nested-screen state: edits happen on copies and are committed with Confirm.
  const [screen, setScreen] = useState<Screen>('main');
  const [editConds, setEditConds] = useState<Cond[]>([]);
  const [editActs, setEditActs] = useState<Act[]>([]);

  const { event, scope, conds, acts } = draft;
  const [editScope, setEditScope] = useState<Scope>(ALL_SCOPE);
  const eventDef = BUILDER_EVENTS.find(e => e.id === event)!;
  const walletText = scopeLabel(scope);
  const hasCond = conds.length > 0;
  const first = conds[0];
  const suggestedName = `${isReject(acts) ? 'Reject ' + eventDef.sentence.toLowerCase() : eventDef.sentence}${first?.type === 'amount' ? ` over ${money(first)}` : first?.type === 'destination' ? ' to non-whitelisted addresses' : ''} from ${walletText}`;
  // A template's name only holds while the policy still matches the template; once edited, fall back to the generated name.
  const templateActive = !!tpl && sigOf(draft) === tpl.sig;
  const policyName = nameTouched ? name : templateActive ? tpl!.name : suggestedName;
  const valid = scopeValid(scope) && acts.length > 0 && acts.every(actValid) && conds.every(condValid) && !!policyName.trim();
  const blockingAdminCount = (scope.mode === 'single' || scope.mode === 'multiple') && scope.wallets.includes('ETH Custody') && acts.some(a => a.type === 'wallet-admins' && a.approvals >= 2);
  const canSubmit = valid && !blockingAdminCount;

  const applyTemplate = (id: string) => {
    setTemplate(id);
    const next: Draft = id === 'approve-all'
      ? { event: 'withdrawal', scope: ALL_SCOPE, conds: [], acts: [{ ...newAct('users'), users: ['Jack Brown', 'Jill Green', 'Joe White'] }] }
      : { event: 'withdrawal', scope: ALL_SCOPE, conds: [newCond('amount')], acts: [newAct('reject')] };
    setDraft(next);
    setTpl({ name: id === 'approve-all' ? 'Approval on all withdrawals' : 'Reject on withdrawals over $100k', sig: sigOf(next) });
    setNameTouched(false);
  };
  const startFromScratch = () => {
    setTemplate('scratch');
    patch({ event: 'withdrawal', scope: ALL_SCOPE, conds: [newCond()], acts: [newAct()] });
    setTpl(null);
    setNameTouched(false);
  };

  const open = (s: EditPart, addNew?: boolean) => {
    if (s === 'scope') setEditScope(scope);
    else if (s === 'condition') setEditConds([...conds, ...(addNew || conds.length === 0 ? [newCond('amount', true)] : [])]);
    else setEditActs([...acts, ...(addNew || acts.length === 0 ? [newAct('enterprise-admins', true)] : [])]);
    setScreen(s);
  };
  const strip = <T extends { fresh?: boolean }>(l: T[]) => l.map(i => ({ ...i, fresh: undefined }));
  const back = () => setScreen('main');
  const confirmScreen = () => {
    if (screen === 'scope') patch({ scope: cleanScope(editScope) });
    else if (screen === 'condition') patch({ conds: strip(editConds) as Cond[] });
    else patch({ acts: strip(editActs) as Act[] });
    setNameTouched(nameTouched);
    setScreen('main');
  };
  const screenValid = screen === 'scope' ? scopeValid(editScope) : screen === 'condition' ? editConds.every(condValid) : editActs.length > 0 && editActs.every(actValid);

  const submit = () => {
    const rejects = isReject(acts);
    onSubmit({
      id: `custom-${Date.now()}`, kind: 'transactions', name: policyName,
      summary: `${hasCond ? eventDef.sentence : eventDef.noCondition} from ${walletText}${hasCond ? ` ${condText(conds)}` : ''}${rejects ? ' are' : ''}`,
      sentenceMode: rejects ? 'accepted' : undefined,
      setBy: 'Your enterprise', policyState: 'Pending approval', actor: 'wallet user',
      trigger: eventDef.sentence.toLowerCase(), scope: walletText, condition: hasCond ? condText(conds) : 'always',
      policyAction: actText(acts), editableFields: ['scope', 'trigger', 'condition', 'action'],
      status: 'Active', lastModified: 'Just now',
    });
  };

  /* Draft as it would look with the in-progress edits — drives the pinned sentence on nested screens. */
  const liveDraft: Draft = screen === 'scope' ? { ...draft, scope: cleanScope(editScope) } : screen === 'condition' ? { ...draft, conds: editConds } : screen === 'action' ? { ...draft, acts: editActs } : draft;

  const notes = (
      <div className="flex flex-col gap-2.5">
        {acts.length === 0 && <Note tone="danger"><strong>Choose what to require.</strong></Note>}
        {blockingAdminCount && <Note tone="danger"><strong>ETH Custody has 2 wallet admins.</strong> This policy needs 3: 2 to approve, plus the person who starts the withdrawal.</Note>}
        <Note tone="info">New policy will be published and stay unlocked for 48 hours once approved by admins</Note>
      </div>
  );

  const main = (
    <>
      {mode === 'page' && <div className="mb-8">{notes}</div>}
      <div className="kyc-section-label">Start from a common policy</div>
      <div className="flex flex-wrap gap-2 mb-6">
        {BUILDER_TEMPLATES.map(([id, label]) => (
          <button key={id} className={`filter-chip${template === id ? ' active' : ''}`} onClick={() => applyTemplate(id)}>{label}</button>
        ))}
        <button className={`filter-chip${template === 'scratch' ? ' active' : ''}`} onClick={startFromScratch}>Start from scratch</button>
      </div>

      <div className="kyc-section-label">Build your policy</div>
      <div className="rounded-xl border border-[var(--color-border)] p-6">
        <SentenceBuilder draft={draft} onPick={patch} onOpen={open} />
      </div>

      <div className="kyc-form-group" style={{ marginTop: 24 }}>
        <label className="kyc-form-label">Name</label>
        <input className="kyc-form-input" maxLength={80} value={policyName} onChange={e => { setName(e.target.value); setNameTouched(true); }} />
        <Help>Suggested from the policy. You can rename it.</Help>
      </div>

      {mode === 'modal' && (
        <>
          <div className="kyc-section-label" style={{ marginTop: 28 }}>Before you publish</div>
          {notes}
        </>
      )}

    </>
  );

  const conditionScreen = (
    <>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-5">Select an event that can trigger this policy. Every condition must be met. <span className="text-[var(--color-text-muted)]">Optional.</span></p>
      {editConds.map((c, i) => (
        <CondCard key={c.id} cond={c} index={i}
          onChange={n => setEditConds(l => l.map(x => x.id === c.id ? n : x))}
          onDelete={() => setEditConds(l => l.filter(x => x.id !== c.id))} />
      ))}
      <button className={GHOST} onClick={() => setEditConds(l => [...l, newCond('amount', true)])}>+ Add condition</button>
    </>
  );

  const setScope = (p: Partial<Scope>) => setEditScope(sc => ({ ...sc, ...p }));
  const scopeScreen = (
    <>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-5">Choose which wallets this policy covers.</p>
      <label className="kyc-form-label">Scope <span className="text-[var(--color-danger)]">*</span></label>
      <RichSelect value={editScope.mode} options={BUILDER_WALLETS} onChange={mode => setScope({ mode })} />
      {editScope.mode === 'single' && (
        <>
          <label className="kyc-form-label" style={{ marginTop: 20 }}>Wallet</label>
          <select className="kyc-form-select" value={editScope.wallets[0] ?? ''} onChange={e => setScope({ wallets: e.target.value ? [e.target.value] : [] })}>
            <option value="">Select a wallet</option>
            {WALLETS.map(w => <option key={w}>{w}</option>)}
          </select>
        </>
      )}
      {editScope.mode === 'multiple' && (
        <MultiPick label="Wallets" placeholder="Select wallets" allAdded="All wallets added" options={WALLETS} value={editScope.wallets} onChange={wallets => setScope({ wallets })} />
      )}
      {editScope.mode === 'type' && (
        <MultiPick label="Wallet types" placeholder="Select wallet types" allAdded="All types added" options={TYPES} value={editScope.types} onChange={types => setScope({ types })} />
      )}
      {editScope.mode === 'tag' && (
        <MultiPick label="Tags" placeholder="Select tags" allAdded="All tags added" options={TAGS} value={editScope.tags} onChange={tags => setScope({ tags })} />
      )}
    </>
  );

  const actionScreen = (
    <>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-5">Identify the action that aligns with the policy resolution. Steps run in order.</p>
      {editActs.map((a, i) => (
        <ActCard key={a.id} act={a} index={i} canDelete={editActs.length > 1}
          onChange={n => setEditActs(l => n.type === 'reject' ? [n] : l.map(x => x.id === a.id ? n : x))}
          onDelete={() => setEditActs(l => l.filter(x => x.id !== a.id))} />
      ))}
      {!isReject(editActs) && (
        <button className={GHOST} onClick={() => setEditActs(l => [...l, newAct('wallet-admins', true)])}>+ Add action</button>
      )}
    </>
  );

  const nested = screen !== 'main';
  const modalSize = { width: 900, height: 'calc(100vh - 96px)' };

  /* Nested edit panel — identical content in both layouts (header, pinned sentence, body, footer). */
  const nestedHeader = (
    <>
      <div className="mr-rm-header">
        <div className="dep-drawer-breadcrumb">
          {mode === 'modal' && (
            <button className="dep-breadcrumb-back" onClick={back} title="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <span className="dep-breadcrumb-current" style={{ fontWeight: 400, fontSize: 24 }}>{screen === 'condition' ? 'Edit Condition' : screen === 'action' ? 'Edit Action' : 'Edit Scope'}</span>
        </div>
        <button className="mr-rm-close" onClick={back}><CloseIcon /></button>
      </div>
      <div className="px-7 pt-5">
        <div className="rounded-xl bg-[var(--color-level2)] px-4 py-2">
          <SentenceBuilder draft={liveDraft} compact highlight={screen === 'main' ? undefined : screen} />
        </div>
      </div>
    </>
  );
  const nestedBody = (
    <div className="flex-1 overflow-y-auto px-7 py-6 text-left">
      {screen === 'scope' ? scopeScreen : screen === 'condition' ? conditionScreen : actionScreen}
    </div>
  );
  // Cancel = abandon: closes the nested modal (page layout) or the whole flow (modal layout). Back (header) returns to the builder.
  const nestedFooter = (
    <div className="mr-rm-footer" style={{ marginTop: 0 }}>
      <button className="mr-rm-btn-cancel" onClick={mode === 'page' ? back : onClose}>Cancel</button>
      <button className="mr-rm-btn-save" disabled={!screenValid} onClick={confirmScreen}>Confirm</button>
    </div>
  );

  const layout = mode === 'page' ? (
    <>
      {/* Option 1 — full page for the main builder; nested edits open as a modal on top */}
      <div className="fixed inset-0" style={{ zIndex: 800 }}>
        <div className="kyc-root mr-invite-root" style={{ background: 'var(--color-level1)' }}>
          <div className="kyc-page kyc-screen-flow active">
            <div className="kyc-flow-intro" style={{ background: 'var(--color-level1)', alignItems: 'stretch', padding: '28px 28px 0' }}>
              <div className="kyc-flow-intro-inner flex items-start justify-between gap-4" style={{ maxWidth: 'none' }}>
                <h2 className="kyc-step-title" style={{ fontWeight: 400, marginBottom: 0 }}>New Policy</h2>
                <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
              </div>
            </div>
            <div className="kyc-flow-body" style={{ background: 'var(--color-level1)', padding: '32px 28px 48px' }}>
              <div className="kyc-flow-inner" style={{ maxWidth: 840 }}>
                {main}
                <div className="mr-rm-footer" style={{ padding: '0', border: 'none', marginTop: 48 }}>
                  <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
                  <button className="mr-rm-btn-save" disabled={!canSubmit} onClick={() => setReviewing(true)}>Review and Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {nested && (
        <div className="wf-overlay open" style={{ zIndex: 850 }}>
          <div className="mr-rm-modal" style={{ width: 640, height: 'auto', maxHeight: 'calc(100vh - 96px)' }} onClick={e => e.stopPropagation()}>
            {nestedHeader}{nestedBody}{nestedFooter}
          </div>
        </div>
      )}
    </>
  ) : (
    /* Option 2 — one modal; nested edits replace its content with a Back button */
    <div className="wf-overlay open" style={{ zIndex: 800 }} onClick={nested ? undefined : onClose}>
      <div className="mr-rm-modal" style={modalSize} onClick={e => e.stopPropagation()}>
        {nested ? (
          <>{nestedHeader}{nestedBody}{nestedFooter}</>
        ) : (
          <>
            <div className="mr-rm-header">
              <div>
                <span className="mr-rm-title">New Policy</span>
                <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Build your policy as a sentence. Click any highlighted part to change it.</p>
              </div>
              <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
            </div>
                  <div className="flex-1 overflow-y-auto px-7 py-6 text-left">{main}</div>
            <div className="mr-rm-footer" style={{ marginTop: 0 }}>
              <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="mr-rm-btn-save" disabled={!canSubmit} onClick={() => setReviewing(true)}>Confirm</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {layout}

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
              <button className="mr-rm-btn-cancel" onClick={() => setReviewing(false)}>Cancel</button>
              <button className="mr-rm-btn-save" onClick={submit}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
