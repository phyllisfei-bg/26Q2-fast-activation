import React, { useState, useRef } from 'react';
import { Topbar } from '../components/Topbar';
import { Snackbar } from '../components/Snackbar';
import type { SnackbarHandle } from '../components/Snackbar';
import { FilterChips } from '../components/FilterChips';
import { SearchField } from '../components/SearchField';
import { Menu, Badge } from '../components/membersRoles/shared';
import { PolicySentence } from '../components/policies/PolicySentence';
import { PolicyStatusBadge, PolicyLockIcon } from '../components/policies/PolicyStatusBadge';
import { SentencePolicyDrawer } from '../components/policies/SentencePolicyDrawer';
import { policyMenuItems } from '../components/policies/policyMenu';
import { VISIBLE_POLICIES } from '../components/policies/policyData';
import type { SentencePolicy } from '../components/policies/policyData';
import { PolicyEditFlow } from '../flows/PolicyEditFlow';
import { PolicyBuilderFlow } from '../flows/PolicyBuilderFlow';

type Tab = 'all' | 'transactions' | 'administrative';

// Matches DestinationsPage table chrome verbatim.
const STICKY = 'sticky top-14 z-10';
const TH = `px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)] ${STICKY}`;
const THBLANK = `px-4 py-3 bg-[#F5F6F7] border-b border-[var(--color-border)] ${STICKY}`;
const TD = 'px-4 py-[14px] align-middle';

interface Props {
  isLight: boolean;
  onThemeToggle: () => void;
  /** Render inside another page (Security Center): no topbar / page title, parent owns scrolling. */
  embedded?: boolean;
  /** Optional controlled list, so a parent can summarise the policies. */
  policies?: SentencePolicy[];
  onPoliciesChange?: React.Dispatch<React.SetStateAction<SentencePolicy[]>>;
  /** Called after a create / update / archive, for activity logs. */
  onEvent?: (title: string, meta: string) => void;
}

export const PoliciesPage: React.FC<Props> = ({ isLight, onThemeToggle, embedded, policies: policiesProp, onPoliciesChange, onEvent }) => {
  const [tab, setTab] = useState<Tab>(embedded ? 'all' : 'transactions');
  const [localPolicies, setLocalPolicies] = useState<SentencePolicy[]>(VISIBLE_POLICIES);
  const policies = policiesProp ?? localPolicies;
  const setPolicies = onPoliciesChange ?? setLocalPolicies;
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<SentencePolicy | null>(null);
  const [editFull, setEditFull] = useState<SentencePolicy | null>(null);
  const [creating, setCreating] = useState(false);
  const snackRef = useRef<SnackbarHandle>(null);

  const active = policies.filter(p => p.status === 'Active');
  const q = search.trim().toLowerCase();
  const visible = active.filter(p =>
    (tab === 'all' || p.kind === tab) && (!q || p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.policyAction.toLowerCase().includes(q)));
  const count = (kind: 'transactions' | 'administrative') => active.filter(p => p.kind === kind).length;

  const savePolicy = (policy: SentencePolicy) => {
    setPolicies(cur => cur.map(p => p.id === policy.id ? policy : p));
    setViewing(v => (v && v.id === policy.id ? policy : v));
    setEditFull(null);
    snackRef.current?.show(`${policy.name} updated.`, false);
    onEvent?.(`Policy updated: ${policy.name}`, 'You');
  };

  const archivePolicy = (policy: SentencePolicy) => {
    setPolicies(cur => cur.map(p => p.id === policy.id ? { ...p, status: 'Archived' } : p));
    setViewing(null);
    snackRef.current?.show(`${policy.name} archived.`, false);
    onEvent?.(`Policy archived: ${policy.name}`, 'You');
  };

  const addPolicy = (policy: SentencePolicy) => {
    setPolicies(cur => [policy, ...cur]);
    if (tab !== 'all') setTab('transactions');
    setCreating(false);
    snackRef.current?.show('Policy submitted for approval.', false);
    onEvent?.(`Policy created: ${policy.name}`, 'You · pending approval');
  };

  const menuFor = (p: SentencePolicy) => policyMenuItems(p, {
    onEdit: () => { setViewing(null); setEditFull(p); },
    onCopy: () => snackRef.current?.show('Copy to other enterprise — coming soon.', false),
    onArchive: () => archivePolicy(p),
    onViewTask: () => snackRef.current?.show('Opening the approval task (prototype).', false),
  });

  const newPolicyBtn = (
            <button
          className={`flex items-center gap-2 ${embedded ? 'h-9' : 'h-10'} px-4 rounded-full bg-[var(--brand-500)] text-sm font-semibold text-white border-none cursor-pointer hover:bg-[var(--brand-700)] transition-colors shrink-0`}
          onClick={() => setCreating(true)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Policy
        </button>
  );

  return (
    <div className={embedded ? '' : 'flex flex-col h-full overflow-hidden bg-[var(--color-level1)]'}>
      {!embedded && <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />}

      <div className={embedded ? '' : 'flex-1 overflow-y-auto px-7 pb-7'}>
        {/* Page header */}
        {!embedded && <div className="flex items-start justify-between mb-6 pt-7 gap-4">
          {!embedded && (
          <div>
            <h1 className="text-[30px] font-normal text-[var(--color-text)]">Policies</h1>
            <p className="text-[16px] font-normal text-[var(--color-text-secondary)] mt-1">
              Everything that decides what it takes to move funds or change your setup. Policies lock after they're published so changes are always deliberate.
            </p>
          </div>
          )}
          {newPolicyBtn}
        </div>}

        {/* Tabs — in the Security Center these are flattened into the Type chip below */}
        {!embedded && (
        <div>
        <div className="mr-drawer-tabs !mx-0">
          {([['transactions', 'Transactions'], ['administrative', 'Administrative']] as ['transactions' | 'administrative', string][]).map(([id, label]) => (
            <div key={id} className={`mr-drawer-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
              {label} <span className="text-[12px] text-[var(--color-text-muted)] ml-1">{count(id)}</span>
            </div>
          ))}
        </div>
        </div>
        )}

        {/* Filter chips + search row — sticky while rows scroll */}
        <div className={`sticky top-0 z-20 bg-[var(--color-level1)] flex items-center ${embedded ? 'gap-3' : 'justify-between gap-4'} h-14`}>
          <FilterChips filters={[...(embedded ? [{ label: 'Type', options: ['All', 'Transactions', 'Administrative'], defaultValue: 'All', onSelect: (o: string) => setTab(o === 'All' ? 'all' : o === 'Transactions' ? 'transactions' : 'administrative') }] : []), { label: 'Set By', options: ['BitGo', 'Your enterprise', 'Your organization'] }, { label: 'Status', options: ['Locked', 'Unlocked', 'Pending approval', 'Planned'] }]} />
          <div className="w-[220px] shrink-0">
            <SearchField value={search} onChange={setSearch} placeholder="Search" />
          </div>
          {embedded && <><div className="flex-1" />{newPolicyBtn}</>}
        </div>

        {/* Table */}
        <div className={embedded ? '' : 'rounded-xl border border-[var(--color-border)]'}>
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${THBLANK} rounded-l-[11px]`} style={{ width: 48 }}><input type="checkbox" className="mr-check" /></th>
                <th className={TH}>Policy</th>
                <th className={TH} style={{ width: 180 }}>Last Triggered</th>
                <th className={`${THBLANK} rounded-r-[11px]`} style={{ width: 56 }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id} className="cursor-pointer tbl-row-hover" onClick={() => setViewing(p)}>
                  <td className={TD} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="mr-check" />
                  </td>
                  <td className={TD}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[16px] font-normal text-[var(--color-text)]">{p.name}</span>
                      <PolicyLockIcon policy={p} />
                      {p.optional && <Badge tone="neutral">Optional</Badge>}
                      <PolicyStatusBadge policy={p} />
                    </div>
                    <PolicySentence policy={p} />
                    {p.organizationNote && (
                      <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">{p.organizationNote}</p>
                    )}
                  </td>
                  <td className={`${TD} text-[14px] text-[var(--color-text-secondary)]`}>{p.lastUsed ?? '—'}</td>
                  <td className={`${TD} text-right`} onClick={e => e.stopPropagation()}>
                    <Menu variant="kebab" items={menuFor(p)} />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[14px] text-[var(--color-text-secondary)]">
                    {q ? 'No policies match your search.' : 'No policies yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SentencePolicyDrawer policy={viewing} onClose={() => setViewing(null)} menuItems={viewing ? menuFor(viewing) : []} />
      {editFull && <PolicyEditFlow policy={editFull} onClose={() => setEditFull(null)} onSave={savePolicy} />}
      {creating && (
        <PolicyBuilderFlow
          isLight={isLight}
          onThemeToggle={onThemeToggle}
          onClose={() => setCreating(false)}
          onSubmit={addPolicy}
        />
      )}

      <Snackbar ref={snackRef} />
    </div>
  );
};
