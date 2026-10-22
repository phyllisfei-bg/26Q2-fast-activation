import React, { useState, useRef } from 'react';
import { Topbar } from '../components/Topbar';
import { Snackbar } from '../components/Snackbar';
import type { SnackbarHandle } from '../components/Snackbar';
import { SearchField } from '../components/SearchField';
import { Badge, Menu, TrashIcon } from '../components/membersRoles/shared';
import type { BadgeTone } from '../components/membersRoles/shared';
import { PoliciesPage } from './PoliciesPage';
import { DestinationsPage, DESTINATION_SUMMARY } from './DestinationsPage';
import { MembersTable } from '../components/membersRoles/MembersTable';
import { MemberDrawer } from '../components/membersRoles/MemberDrawer';
import { FilterChips } from '../components/FilterChips';
import { VISIBLE_POLICIES } from '../components/policies/policyData';
import type { SentencePolicy } from '../components/policies/policyData';
import type { MembersRolesApi } from '../hooks/useMembersRoles';
import type { Member } from '../types';

/* ── Vision concept: Security Center ─────────────────────────────────
   One home for protections (policies), login settings, trusted resources,
   activity and insights. Built from the same table / badge / drawer / modal
   chrome as the rest of the app. */

type Tab = 'overview' | 'policies' | 'destinations' | 'baseline' | 'users' | 'activity' | 'insights';
const TABS: [Tab, string][] = [
  ['overview', 'Overview'], ['policies', 'Policies'], ['destinations', 'Whitelist Destinations'], ['baseline', 'Enterprise Settings'],
  ['users', 'Users'], ['activity', 'Activity'], ['insights', 'Insights'],
];

const TH = 'px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]';
const TD = 'px-4 py-[14px] align-middle text-[14px] text-[var(--color-text-secondary)]';
const TDP = 'px-4 py-[14px] align-middle text-[16px] font-normal text-[var(--color-text)]';
const CARD = 'rounded-xl border border-solid border-[color:var(--color-border-strong)] bg-[var(--color-level1)] p-5';
const PILL = 'inline-flex items-center gap-2 h-8 px-3.5 rounded-full border-none text-[13px] font-semibold cursor-pointer transition-colors bg-[var(--color-level2)] text-[var(--color-text)] hover:bg-[var(--color-level3)] disabled:opacity-45 disabled:cursor-default';
const PRIMARY = 'inline-flex items-center gap-2 h-8 px-3.5 rounded-full border-none text-[13px] font-semibold cursor-pointer transition-colors bg-[var(--brand-500)] text-white hover:bg-[var(--brand-700)] disabled:opacity-45 disabled:cursor-default';
const MUTED = 'text-[var(--color-text-secondary)]';

/* ── Data ── */
const USERS: [string, string, number][] = [['Priya N.', 'Admin', 12], ['Marcus T.', 'Approver', 64], ['Dana K.', 'Admin', 131], ['d.kim', 'Approver', 203], ['j.alvarez', 'Viewer', 94], ['a.osei', 'Viewer', 27], ['m.rossi', 'Viewer', 340]];
const ageTxt = (d: number) => d >= 365 ? '1 year' : d >= 60 ? `${Math.round(d / 30)} months` : `${d} days`;

type Event = { time: string; title: string; meta: string };
const INITIAL_ACTIVITY: Event[] = [
  { time: 'Oct 20, 2:41 PM', title: 'Password reset requested for j.alvarez', meta: 'Priya N. · pending 2nd admin' },
  { time: 'Oct 20, 1:58 PM', title: 'Policy edited: Withdrawals over $250k', meta: 'Priya N.' },
  { time: 'Oct 20, 1:12 PM', title: 'Required 2FA changed: Any method → By role', meta: 'Marcus T.' },
  { time: 'Oct 20, 11:30 AM', title: 'API token created: Reconciliation service', meta: 'Marcus T. · expires in 90 days' },
  { time: 'Oct 20, 10:02 AM', title: 'Login from new device', meta: 'd.kim · San Jose, US' },
  { time: 'Oct 19, 4:15 PM', title: 'Trusted IP added: Treasury VPN (log-only)', meta: 'Priya N.' },
  { time: 'Oct 19, 11:08 AM', title: 'Role changed: Approver → Admin', meta: 'Dana K.' },
];

const IPS = [['Office, SF', '203.0.113.0/28', 'UI login', 'Priya N.', 'Never', 'Active'], ['CI runner', '198.51.100.24', 'API tokens', 'Marcus T.', 'Jan 31, 2027', 'Active'], ['Treasury VPN', '192.0.2.0/27', 'Withdrawals', 'Priya N.', 'Never', 'Log-only']];

const nowStr = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/* ── Small shared pieces ── */
const Seg: React.FC<{ value: string; options: [string, string][]; onChange: (v: string) => void }> = ({ value, options, onChange }) => (
  <div className="rs-segment-control" style={{ margin: 0, flexWrap: 'wrap' }}>
    {options.map(([v, l]) => <button key={v} className={`rs-segment-btn${value === v ? ' active' : ''}`} style={{ flex: 'none', padding: '6px 12px', fontSize: 13 }} onClick={() => onChange(v)}>{l}</button>)}
  </div>
);
const Toggle: React.FC<{ on: boolean; onClick: () => void; label: string }> = ({ on, onClick, label }) => (
  <div role="switch" aria-checked={on} aria-label={label} tabIndex={0} className={`rs-toggle-track${on ? ' on' : ''}`} style={{ width: 40, height: 22 }} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>
    <div className="rs-toggle-thumb" style={{ width: 17, height: 17, top: 2.5, left: on ? 20.5 : 2.5 }} />
  </div>
);
const Callout: React.FC<{ tone: 'info' | 'warn' | 'bad'; children: React.ReactNode }> = ({ tone, children }) => (
  <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-[14px] leading-relaxed text-[var(--color-text)]"
    style={{ background: tone === 'bad' ? 'rgba(248,113,113,.10)' : tone === 'warn' ? 'rgba(235,197,94,.12)' : 'var(--brand-a100)', border: `1px solid ${tone === 'bad' ? 'var(--color-danger)' : tone === 'warn' ? 'rgba(235,197,94,.5)' : 'var(--brand-a200)'}` }}>
    <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ color: tone === 'bad' ? 'var(--color-danger)' : tone === 'warn' ? '#ff9c11' : 'var(--brand-500)' }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
const Plain: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className={`text-[14px] ${MUTED}`}>{children}</p>;
const Divider = () => <div className="my-4" style={{ borderTop: '1px solid var(--color-border)' }} />;
const Card: React.FC<{ title?: string; hint?: string; children: React.ReactNode; className?: string }> = ({ title, hint, children, className }) => (
  <div className={`${CARD} ${className ?? ''}`}>
    {title && <h2 className="text-[18px] font-normal text-[var(--color-text)]">{title}</h2>}
    {hint && <p className={`text-[14px] ${MUTED} mt-0.5 mb-3`}>{hint}</p>}
    {children}
  </div>
);
/** Un-carded group: heading + hint, content below. Dividers live between settings inside the group only. */
const Section: React.FC<{ title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, hint, action, children }) => (
  <section>
    <div className={`flex items-start justify-between gap-4 ${hint ? 'mb-4' : 'mb-4'}`}>
      <div>
        <h2 className="text-[20px] font-normal text-[var(--color-text)]">{title}</h2>
        {hint && <p className={`text-[14px] ${MUTED} mt-0.5`}>{hint}</p>}
      </div>
      {action}
    </div>
    <div>{children}</div>
  </section>
);
const Row: React.FC<{ title: string; desc?: string; right?: React.ReactNode; first?: boolean }> = ({ title, desc, right }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex-1 min-w-0"><div className="text-[15px] text-[var(--color-text)]">{title}</div>{desc && <div className={`text-[13px] ${MUTED}`}>{desc}</div>}</div>
    {right}
  </div>
);

const Setting: React.FC<{ title: string; desc: string; counts?: boolean; control: React.ReactNode; panel?: React.ReactNode }> = ({ title, desc, counts, control, panel }) => (
  <div className="py-8 border-solid [border-width:1px_0_0_0] border-[color:var(--color-border)] first:[border-width:0] first:pt-0">
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-[16px] font-medium text-[var(--color-text)]">{title} {counts && <span className="text-[12px] font-medium text-[var(--brand-500)] ml-1">Counts toward score</span>}</div>
        <div className={`text-[14px] ${MUTED} max-w-[62ch]`}>{desc}</div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
    {panel && <div className="mt-4 flex flex-col gap-3">{panel}</div>}
  </div>
);
const TableWrap: React.FC<{ head: string[]; widths?: string[]; sticky?: boolean; children: React.ReactNode }> = ({ head, widths, sticky, children }) => (
  <div>
    <table className="w-full table-fixed border-separate border-spacing-0">
      {widths && <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>}
      <thead>
        <tr>{head.map((h, i) => <th key={h + i} className={`${TH}${sticky ? ' sticky top-14 z-10' : ''} ${i === 0 ? 'rounded-l-[11px]' : ''} ${i === head.length - 1 ? 'rounded-r-[11px]' : ''}`}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/** First column of every table: primary label with a secondary line beneath, like the Whitelist Destinations table. */
const TwoLine: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <>
    <div className="text-[16px] font-normal text-[var(--color-text)] mb-0.5">{title}</div>
    {sub && <div className="text-[14px] text-[var(--color-text-secondary)]">{sub}</div>}
  </>
);

/* Modal — every modal ends in Cancel + Confirm */
const Dialog: React.FC<{ title: string; onClose: () => void; onConfirm: () => void; confirmLabel?: string; danger?: boolean; disabled?: boolean; children: React.ReactNode }> = ({ title, onClose, onConfirm, confirmLabel = 'Confirm', danger, disabled, children }) => (
  <div className="wf-overlay open" style={{ zIndex: 900 }} onClick={onClose}>
    <div className="mr-rm-modal" style={{ height: 'auto', width: 560 }} onClick={e => e.stopPropagation()}>
      <div className="mr-rm-header">
        <span className="mr-rm-title">{title}</span>
        <button className="mr-rm-close" onClick={onClose}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
      </div>
      <div className="px-7 pt-5 flex flex-col gap-4 text-left overflow-y-auto">{children}</div>
      <div className="mr-rm-footer" style={{ marginTop: 24 }}>
        <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="mr-rm-btn-save" disabled={disabled} style={danger ? { background: 'var(--color-danger)' } : undefined} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

type ModalState = { kind: 'tfa' } | { kind: 'force'; user: [string, string, number] } | { kind: 'ip' } | null;

interface Props { isLight: boolean; onThemeToggle: () => void; membersApi: MembersRolesApi }

export const SecurityCenterPage: React.FC<Props> = ({ isLight, onThemeToggle, membersApi }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<ModalState>(null);
  const [policies, setPolicies] = useState<SentencePolicy[]>(VISIBLE_POLICIES);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activity, setActivity] = useState<Event[]>(INITIAL_ACTIVITY);
  const [ips, setIps] = useState(IPS);
  const [search, setSearch] = useState('');
  const snack = useRef<SnackbarHandle>(null);
  const toast = (m: string) => snack.current?.show(m, false);

  // Login settings
  const [tfa, setTfa] = useState('role');
  const [tfaGrace, setTfaGrace] = useState('7');
  const [secondAdmin, setSecondAdmin] = useState(true);
  const [pwAge, setPwAge] = useState('never');
  const [pwWarn, setPwWarn] = useState('7');
  const [forced, setForced] = useState<Record<string, boolean>>({});
  const [toggles, setToggles] = useState({ sso: true, hw: false, notif: true });
  const [timeout_, setTimeout_] = useState('30');
  const [expiry, setExpiry] = useState('90');
  const [domains, setDomains] = useState('bitgo.com');
  const flip = (k: keyof typeof toggles) => setToggles(t => ({ ...t, [k]: !t[k] }));

  // Modal form fields
  const [reason, setReason] = useState('');
  const [verified, setVerified] = useState(false);
  const [ipForm, setIpForm] = useState({ label: '', cidr: '' });
  const openModal = (m: ModalState) => { setReason(''); setVerified(false); setModal(m); };
  const log = (title: string, meta: string) => setActivity(a => [{ time: nowStr(), title, meta }, ...a]);
  const close = () => setModal(null);

  const pwStatus = (u: [string, string, number]): [string, BadgeTone] => {
    const lim = pwAge === 'never' ? null : +pwAge;
    if (forced[u[0]]) return ['Reset required', 'warning'];
    if (!lim) return ['No expiry', 'neutral'];
    if (u[2] >= lim) return ['Expired', 'danger'];
    if (lim - u[2] <= +pwWarn) return [`Due in ${lim - u[2]} days`, 'warning'];
    return ['Current', 'success'];
  };

  /* ── Tabs ── */
  const activeN = policies.filter(p => p.status === 'Active' && p.policyState !== 'Pending approval').length;
  const pendingN = policies.filter(p => p.status === 'Active' && p.policyState === 'Pending approval').length;
  const archivedN = policies.filter(p => p.status === 'Archived').length;
  const Stat: React.FC<{ n: number | string; label: string }> = ({ n, label }) => (
    <div><div className="text-[28px] leading-none text-[var(--color-text)]">{n}</div><div className={`text-[13px] ${MUTED} mt-1.5`}>{label}</div></div>
  );
  const overview = (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
      {/* AI summary — across the whole Security Center */}
      <div className="rounded-xl p-5 border border-dashed border-[color:var(--brand-500)] bg-[var(--color-level1)]" style={{ gridColumn: 'span 6' }}>
        <div className="flex items-center gap-6">
          <div className="shrink-0 text-center">
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="46" fill="none" stroke="var(--color-border)" strokeWidth="10" />
              <circle cx="56" cy="56" r="46" fill="none" stroke="var(--brand-500)" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * 0.18} transform="rotate(-90 56 56)" />
              <text x="56" y="63" textAnchor="middle" fontSize="28" fontWeight="500" fill="var(--color-text)">82</text>
            </svg>
            <div className={`text-[12px] ${MUTED} -mt-1`}>Security score</div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2"><Badge tone="brand">AI summary</Badge><span className={`text-[13px] ${MUTED}`}>Across your whole Security Center · 6 of 8 recommended protections in place</span></div>
            <p className="text-[15px] leading-relaxed text-[var(--color-text)] max-w-[90ch] mb-3">
              Your security score is <b>82</b>. Policies blocked <b>18</b> withdrawals in the last 7 days, and <b>{activeN}</b> policies are active{pendingN > 0 ? <> with <b>{pendingN}</b> waiting on approval</> : null}. The biggest gaps are <b>3 wallets with no policy</b> and <b>phishing-resistant 2FA not required for approvers</b>. You have <b>{DESTINATION_SUMMARY.pending}</b> whitelist destinations pending approval, and <b>2 withdrawals</b> are waiting for you to review.
            </p>
            <div className="flex gap-2"><button className={PRIMARY} onClick={() => setTab('policies')}>Close policy gaps</button><button className={PILL} onClick={() => setTab('baseline')}>Review enterprise settings</button></div>
          </div>
        </div>
      </div>

      {/* Row 1 */}
      <Card className="col-span-3" title="Policy overview" hint="Where your policies stand today">
        <div className="grid grid-cols-3 gap-4 mb-4"><Stat n={activeN} label="Active" /><Stat n={pendingN} label="Pending" /><Stat n={archivedN} label="Archived" /></div>
        <Divider />
        <div className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${MUTED}`}>Frequently triggered · 30 days</div>
        {[['Video ID', 'Transfers over $250,000 from custody wallets', '14'], ['Unverified address', 'Transfers to unverified addresses', '9']].map(r => (
          <Row key={r[0]} title={r[0]} desc={r[1]} right={<span className={`text-[13px] ${MUTED} whitespace-nowrap`}>{r[2]} triggers</span>} />
        ))}
        <button className={`${PILL} mt-2`} onClick={() => setTab('policies')}>View policies</button>
      </Card>
      <Card className="col-span-3" title="Blocked by policy" hint="Impact on withdrawals · last 7 days">
        <div className="grid grid-cols-3 gap-4 mb-4"><Stat n={18} label="Blocked" /><Stat n="$2.4M" label="Value stopped" /><Stat n={3} label="Wallets affected" /></div>
        <Divider />
        <div className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${MUTED}`}>Most blocked wallets · 7 days</div>
        {[['Treasury Hot', 'Mostly non-whitelisted destinations', '11 blocked'], ['Ops Hot Wallet', 'Mostly fiat limits exceeded', '5 blocked'], ['Staking Ops', 'Mostly unverified addresses', '2 blocked']].map(r => (
          <Row key={r[0]} title={r[0]} desc={r[1]} right={<span className={`text-[13px] ${MUTED} whitespace-nowrap`}>{r[2]}</span>} />
        ))}
      </Card>
      <Card className="col-span-3" title="Whitelist destinations" hint="Addresses and wallets funds can be sent to">
        <div className="grid grid-cols-3 gap-4 mb-4"><Stat n={DESTINATION_SUMMARY.total} label="Destinations" /><Stat n={DESTINATION_SUMMARY.pending} label="Pending" /><Stat n={DESTINATION_SUMMARY.multiLabel} label="Multi-label" /></div>
        <Divider />
        <div className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${MUTED}`}>Frequently used · 30 days</div>
        {[['Cold Storage Main', 'bc1qxy2kgd…hx0wlh · BTC', '42'], ['ETH Operating Wallet', '0x71C7656E…d8976F · ETH', '31']].map(r => (
          <Row key={r[0]} title={r[0]} desc={r[1]} right={<span className={`text-[13px] ${MUTED} whitespace-nowrap`}>{r[2]} sends</span>} />
        ))}
        <button className={`${PILL} mt-2`} onClick={() => setTab('destinations')}>View destinations</button>
      </Card>
      <Card className="col-span-3" title="User changes" hint="People added, changed or removed">
        <div className="grid grid-cols-3 gap-4 mb-4"><Stat n={3} label="Invited" /><Stat n={2} label="Role changes" /><Stat n={1} label="Removed" /></div>
        <Divider />
        <div className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${MUTED}`}>Recent changes · 30 days</div>
        {[['Role changed: Approver → Admin', 'Dana K.', 'Oct 19'], ['Invited m.rossi', 'Priya N.', 'Oct 12']].map(r => (
          <Row key={r[0]} title={r[0]} desc={r[1]} right={<span className={`text-[13px] ${MUTED} whitespace-nowrap`}>{r[2]}</span>} />
        ))}
        <button className={`${PILL} mt-2`} onClick={() => setTab('users')}>View users</button>
      </Card>


      <Card className="col-span-3" title="Needs attention" hint="What needs you to act, and gaps in your setup">
        {([['2 withdrawals waiting for approval', 'Treasury Hot · oldest 41 min', 'Review', 'warning', 'policies'], ['KYT alert: deposit from flagged address', '0.42 BTC · Treasury Cold', 'High', 'danger', 'activity'], ['Gap: phishing-resistant 2FA not required for approvers', 'Enterprise Settings · Authentication', 'Enable', 'danger', 'baseline'], ['Gap: 3 wallets have no policy', 'Staking Ops, Test Wallet 2, Legacy BTC', 'Add policy', 'warning', 'policies'], ['Gap: no trusted IPs for API tokens', 'Enterprise Settings · Trusted IPs', 'Review', 'warning', 'baseline'], ['API token expires in 6 days', 'Reconciliation service', 'Rotate', 'warning', 'baseline'], ['Dormant user: 94 days', 'j.alvarez@acme.example', 'Review', 'neutral', 'users']] as [string, string, string, BadgeTone, Tab][]).map((r, i) => (
          <Row key={r[0]} first={i === 0} title={r[0]} desc={r[1]} right={<button className={PILL} onClick={() => setTab(r[4])}>{r[2]}</button>} />
        ))}
      </Card>
      <Card className="col-span-3" title="Recent activity" hint="Last 5 events">
        {activity.slice(0, 5).map((a, i) => <Row key={i} first={i === 0} title={a.title} desc={a.meta} right={<span className={`text-[13px] ${MUTED}`}>{a.time}</span>} />)}
        <button className={`${PILL} mt-2`} onClick={() => setTab('activity')}>View all</button>
      </Card>
    </div>
  );

  const q = search.trim().toLowerCase();
  const policiesTab = (
    <PoliciesPage
      embedded isLight={isLight} onThemeToggle={onThemeToggle}
      policies={policies} onPoliciesChange={setPolicies} onEvent={log}
    />
  );

  const destinationsTab = <DestinationsPage embedded isLight={isLight} onThemeToggle={onThemeToggle} />;

  const strict = tfa === 'strong' || tfa === 'phish';
  const baseline = (
    <div className="flex flex-col gap-14">
      <Section title="Authentication">
        <Setting title="Required 2FA methods" counts desc="Control which second factors people can enrol. Applies to every login."
          control={<Seg value={tfa} onChange={setTfa} options={[['any', 'Any method'], ['strong', 'No weak methods'], ['phish', 'Phishing-resistant only'], ['role', 'By role']]} />}
          panel={<>
            {tfa === 'role' && <div className="grid grid-cols-3 gap-3">{[['All users', ['No weak methods', 'Any method']], ['Admins', ['Phishing-resistant only', 'No weak methods']], ['Approvers', ['Phishing-resistant only', 'No weak methods']]].map(([l, o]) => (
              <label key={l as string} className="text-[13px]"><span className={MUTED}>{l as string}</span><select className="kyc-form-select mt-1">{(o as string[]).map(x => <option key={x}>{x}</option>)}</select></label>))}</div>}
            <div className="flex flex-wrap gap-x-6 gap-y-2">{[['Authenticator app', 1], ['Passkey', 1], ['Hardware key', 1], ['SMS', 0], ['Email OTP', 0]].map(([m, ok]) => (
              <label key={m as string} className="flex items-center gap-2 text-[14px] text-[var(--color-text)]"><input type="checkbox" className="mr-check" defaultChecked={!!ok || !strict} disabled={!ok && strict} />{m}{!ok && <Badge tone="warning">Weaker</Badge>}</label>))}</div>
            <div><div className={`text-[13px] ${MUTED} mb-1.5`}>Grace period for people who must re-enrol</div><Seg value={tfaGrace} onChange={setTfaGrace} options={[['0', 'Immediate'], ['7', '7 days'], ['14', '14 days']]} /></div>
            <div><button className={PRIMARY} onClick={() => openModal({ kind: 'tfa' })}>Review impact and save</button></div>
          </>} />
        <Setting title="Require a second admin to approve resets for admins and approvers"
          desc="Users won't see “Forgot password.” They'll be directed to an administrator, and admins never see or set the password. Needs at least two active admins. This enterprise has 3."
          control={<Toggle on={secondAdmin} onClick={() => setSecondAdmin(v => !v)} label="Require a second admin to approve resets" />} />
        <Setting title="Password expiration" counts desc="Require everyone to change their password on a schedule. This is separate from a reset, because they use their current password to do it."
          control={<Seg value={pwAge} onChange={setPwAge} options={[['never', 'Never'], ['30', '30 days'], ['60', '60 days'], ['90', '90 days'], ['180', '180 days']]} />}
          panel={pwAge === 'never' ? <Plain>No expiration is set. You can still force a reset for any user on demand in Password age below.</Plain> : <>
            <Plain>{USERS.filter(u => u[2] >= +pwAge).length} of {USERS.length} users already exceed {pwAge} days and will be asked to change their password at next login.</Plain>
            <div><div className={`text-[13px] ${MUTED} mb-1.5`}>Remind people before it expires</div><Seg value={pwWarn} onChange={setPwWarn} options={[['3', '3 days'], ['7', '7 days'], ['14', '14 days']]} /></div>
            <div><button className={PRIMARY} onClick={() => { log(`Password expiration changed: Never → ${pwAge} days`, 'You'); toast('Password expiration saved and logged'); }}>Save expiration</button></div>
          </>} />
        <Setting title="SSO enforcement" counts desc="Require sign-in through your identity provider." control={<Toggle on={toggles.sso} onClick={() => flip('sso')} label="SSO enforcement" />} />
        <Setting title="Hardware key for approvers" desc="Approvers must confirm withdrawals with a hardware key." control={<Toggle on={toggles.hw} onClick={() => flip('hw')} label="Hardware key for approvers" />} />
      </Section>
      <Section title="Password age" hint={pwAge === 'never' ? 'No expiration is set, so force a reset here when you need one.' : `Expiration is set to ${pwAge} days. You can still force a reset ahead of schedule.`}>
        <TableWrap head={['User', 'Password age', 'Status', '']} widths={['40%', '25%', '25%', '10%']}>
          {USERS.slice().sort((a, b) => b[2] - a[2]).map(u => { const st = pwStatus(u); return (
            <tr key={u[0]} className="tbl-row-hover">
              <td className="px-4 py-[14px] align-middle"><TwoLine title={u[0]} sub={u[1]} /></td>
              <td className={TD}>{ageTxt(u[2])}</td>
              <td className="px-4 py-[14px] align-middle"><Badge tone={st[1]}>{st[0]}</Badge></td>
              <td className="px-4 py-[14px] align-middle text-right">
                <Menu variant="kebab" items={[{ label: forced[u[0]] ? 'Reset link sent' : 'Force reset', onClick: () => { if (!forced[u[0]]) openModal({ kind: 'force', user: u }); } }]} />
              </td>
            </tr>); })}
        </TableWrap>
      </Section>
      <Section title="Sessions, tokens and users">
        <Setting title="Session timeout" desc="Sign people out after inactivity." control={<Seg value={timeout_} onChange={setTimeout_} options={[['15', '15 min'], ['30', '30 min'], ['60', '1 hour']]} />} />
        <Setting title="Default API token expiry" desc="Applies to newly created tokens." control={<Seg value={expiry} onChange={setExpiry} options={[['30', '30 days'], ['90', '90 days'], ['180', '180 days']]} />} />
        <Setting title="Allowed email domains for invites" desc="Only these domains can be invited." control={<input className="kyc-form-input" style={{ width: 240 }} value={domains} onChange={e => setDomains(e.target.value)} aria-label="Allowed domains" />} />
        <Setting title="Security alert routing" desc="Send security events to email and your webhook." control={<Toggle on={toggles.notif} onClick={() => flip('notif')} label="Security alert routing" />} />
      </Section>
      <Section title="Trusted IP addresses" hint="Policies and settings can use these lists as conditions."
        action={<button className={PRIMARY} onClick={() => { setIpForm({ label: '', cidr: '' }); openModal({ kind: 'ip' }); }}>Add IP</button>}>
        <div className="mb-4"><Plain>Your current IP, 203.0.113.77, is not on the list. Enforcing now could lock you out. Keep a second admin and the break-glass path ready.</Plain></div>
        <TableWrap head={['Label', 'Scope', 'Added by', 'Expiry', 'Status', '']} widths={['30%', '18%', '14%', '14%', '14%', '10%']}>
          {ips.map(r => (
            <tr key={r[0] + r[1]} className="tbl-row-hover">
              <td className="px-4 py-[14px] align-middle"><TwoLine title={r[0]} sub={r[1]} /></td>
              <td className="px-4 py-[14px] align-middle"><span className="mr-badge neutral">{r[2]}</span></td>
              <td className={TD}>{r[3]}</td>
              <td className={TD}>{r[4]}</td>
              <td className="px-4 py-[14px] align-middle"><Badge tone={r[5] === 'Active' ? 'success' : 'warning'}>{r[5]}</Badge></td>
              <td className="px-4 py-[14px] align-middle text-right">
                <Menu variant="kebab" items={[{ label: 'Edit Scope', onClick: () => toast('Edit scope (prototype)') }, { label: 'Remove', danger: true, icon: <TrashIcon />, onClick: () => { setIps(l => l.filter(x => x !== r)); toast('Trusted IP removed'); } }]} />
              </td>
            </tr>
          ))}
        </TableWrap>
      </Section>
    </div>
  );

  const [usersSearch, setUsersSearch] = useState('');
  const uq = usersSearch.trim().toLowerCase();
  const shownMembers = membersApi.members.filter(m => !uq || m.name.toLowerCase().includes(uq) || m.email.toLowerCase().includes(uq));
  const usersTab = (
    <>
      <div className="sticky top-0 z-20 bg-[var(--color-level1)] flex items-center gap-3 h-14">
        <FilterChips filters={['Status']} />
        <div className="w-[220px] shrink-0"><SearchField value={usersSearch} onChange={setUsersSearch} placeholder="Search" /></div>
      </div>
      <MembersTable members={shownMembers} api={membersApi} onRowClick={setSelectedMember} readOnly />
    </>
  );

  const activityTab = (
    <>
      <div className="sticky top-0 z-20 bg-[var(--color-level1)] flex items-center gap-3 h-14">
        <FilterChips filters={[{ label: 'Event Type', options: ['All event types', 'Policy changes', 'Settings', 'Logins'] }, { label: 'Date', options: ['Last 7 days', 'Last 30 days'] }]} />
        <div className="w-[220px] shrink-0"><SearchField value={search} onChange={setSearch} placeholder="Search events" /></div>
        <div className="flex-1" />
        <button className={PILL} onClick={() => toast('Export started (prototype)')}>Export CSV</button>
      </div>
      <TableWrap sticky head={['Event', 'Type', 'Date']} widths={['50%', '20%', '30%']}>
        {activity.filter(a => !q || a.title.toLowerCase().includes(q)).map((a, i) => {
          const type = a.title.startsWith('Policy') ? 'Policy' : /Login/.test(a.title) ? 'Login' : /Role|Invited/.test(a.title) ? 'Users' : 'Settings';
          return (
            <tr key={i} className="tbl-row-hover">
              <td className="px-4 py-[14px] align-middle"><TwoLine title={a.title} sub={a.meta} /></td>
              <td className="px-4 py-[14px] align-middle"><span className="mr-badge neutral">{type}</span></td>
              <td className={TD}>{a.time}</td>
            </tr>
          );
        })}
      </TableWrap>
    </>
  );

  const insights = (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-5 border border-dashed border-[color:var(--brand-500)]">
        <div className="flex items-center gap-2 mb-2"><Badge tone="brand">AI summary</Badge><span className={`text-[13px] ${MUTED}`}>Based on 1,284 withdrawals, Oct 2025 to Oct 2026. Numbers below are computed, not generated.</span></div>
        <p className="text-[15px] text-[var(--color-text)] max-w-[72ch] mb-3">Two of your six policies account for 91% of holds. “After-hours withdrawals” never triggered in log-only mode, and 14 withdrawals matched no policy, all from Staking Ops. Raising the $250k threshold to $400k would have released 22 holds and added no unreviewed withdrawals above $1M.</p>
        <div className="flex gap-2"><button className={PRIMARY} onClick={() => toast('Saved as a draft policy for review')}>Apply suggestion as draft</button><button className={PILL}>Edit</button><button className={PILL}>Discard</button></div>
      </div>
      <div className="grid grid-cols-3 gap-4">{[['1,284', 'Withdrawals replayed'], ['6m 12s', 'Median added approval time'], ['14', 'Matched no policy']].map(s => <div key={s[1]} className={CARD}><div className="text-[28px] text-[var(--color-text)]">{s[0]}</div><div className={`text-[14px] ${MUTED}`}>{s[1]}</div></div>)}</div>
      <Card title="Per policy, last 12 months" hint="“Always approved” means every hold ended in approval, so the rule may be noise.">
        <TableWrap head={['Policy', 'Fired', 'Approved', 'Rejected', 'Added time', 'Signal']}>
          {([['Withdrawals over $250k need 2 approvers', 212, 210, 2, '9m 40s', 'Useful', 'success'], ['New address cooling-off, 24h', 64, 61, 3, '24h', 'Useful', 'success'], ['Block non-whitelisted (Treasury Hot)', 31, 0, 31, 'n/a', 'Useful', 'success'], ['Stablecoin velocity, $1M / 24h', 48, 48, 0, '4m 05s', 'Always approved', 'warning'], ['After-hours withdrawals', 0, 0, 0, 'n/a', 'Never fired', 'neutral']] as [string, number, number, number, string, string, BadgeTone][]).map(r => (
            <tr key={r[0]}><td className={`${TDP}`}>{r[0]}</td><td className={TD}>{r[1]}</td><td className={TD}>{r[2]}</td><td className={TD}>{r[3]}</td><td className={TD}>{r[4]}</td><td className={TD}><Badge tone={r[6]}>{r[5]}</Badge></td></tr>))}
        </TableWrap>
      </Card>
    </div>
  );

  const body = { overview, policies: policiesTab, destinations: destinationsTab, baseline, users: usersTab, activity: activityTab, insights }[tab];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--color-level1)]">
      <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />
      <div className="flex-1 overflow-y-auto px-7 pb-7">
        <div className="pt-7 mb-4">
          <div>
          <h1 className="text-[30px] font-normal text-[var(--color-text)]">Security Center</h1>
          <p className="text-[16px] font-normal text-[var(--color-text-secondary)] mt-1 max-w-[80ch]">Your protections, the decisions they make, and who changed what. Policies decide what happens to an action. Enterprise settings define how every account signs in.</p>
          </div>
        </div>
        <div className="mr-drawer-tabs !mx-0 mb-5 overflow-x-auto">
          {TABS.map(([id, label]) => <div key={id} className={`mr-drawer-tab${tab === id ? ' active' : ''}`} onClick={() => { setTab(id); setSearch(''); }}>{label}</div>)}
        </div>
        <div className={tab === 'overview' || tab === 'baseline' || tab === 'insights' ? 'mt-[11px]' : ''}>{body}</div>
      </div>

      {modal?.kind === 'tfa' && (
        <Dialog title="Review impact" onClose={close} confirmLabel="Save setting" onConfirm={() => { log('Required 2FA changed', 'You'); close(); toast('2FA requirement saved and logged'); }}>
          <p className="text-[14px] text-[var(--color-text)]"><b>14 of 40 users</b> must re-enrol with a new method. {tfaGrace === '0' ? 'Enforced immediately.' : `They have ${tfaGrace} days; reminders go out in-app and by email.`}</p>
          <TableWrap head={['User', 'Role', 'Current method']}>{[['Priya N.', 'Admin', 'SMS'], ['Marcus T.', 'Approver', 'Authenticator app'], ['Dana K.', 'Admin', 'Email OTP'], ['+ 11 more', '', '']].map(r => <tr key={r[0]}><td className={TD}>{r[0]}</td><td className={TD}>{r[1]}</td><td className={TD}>{r[2]}</td></tr>)}</TableWrap>
          <Callout tone="warn">1 admin, Dana K., has no phishing-resistant method yet. Saving is allowed because 2 other admins are compliant.</Callout>
        </Dialog>
      )}
      {modal?.kind === 'force' && (() => { const u = modal.user; const priv = u[1] !== 'Viewer'; return (
        <Dialog title={`Force password reset for ${u[0]}?`} onClose={close} confirmLabel={priv ? 'Request approval' : 'Send reset link'} disabled={!reason.trim() || !verified}
          onConfirm={() => { setForced(f => ({ ...f, [u[0]]: true })); log(`Forced password reset for ${u[0]}`, 'You · reset link sent'); close(); toast('Reset link sent. Active sessions revoked.'); }}>
          <p className="text-[14px] text-[var(--color-text)]">Their password is <b>{ageTxt(u[2])}</b> old. They'll get a time-limited link, and their active sessions and API tokens are revoked. 2FA still applies after the reset.</p>
          {priv && <Callout tone="warn">{u[1]} accounts need approval from a second admin before the link is sent.</Callout>}
          <div><label className="kyc-form-label">Reason (required)</label><input className="kyc-form-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Password age exceeds policy" /></div>
          <label className="flex items-center gap-2 text-[14px] text-[var(--color-text)]"><input type="checkbox" className="mr-check" checked={verified} onChange={e => setVerified(e.target.checked)} />I verified this request outside the app</label>
        </Dialog>); })()}
      {modal?.kind === 'ip' && (
        <Dialog title="Add trusted IP" onClose={close} confirmLabel="Add IP" disabled={!ipForm.label.trim() || !ipForm.cidr.trim()}
          onConfirm={() => { setIps(l => [...l, [ipForm.label, ipForm.cidr, 'UI login', 'You', 'Never', 'Log-only']]); log(`Trusted IP added: ${ipForm.label} (log-only)`, 'You'); close(); toast('IP added in log-only mode'); }}>
          <div><label className="kyc-form-label">Label</label><input className="kyc-form-input" value={ipForm.label} onChange={e => setIpForm(f => ({ ...f, label: e.target.value }))} placeholder="Chicago office" /></div>
          <div><label className="kyc-form-label">IP or CIDR</label><input className="kyc-form-input" value={ipForm.cidr} onChange={e => setIpForm(f => ({ ...f, cidr: e.target.value }))} placeholder="203.0.113.0/28" /></div>
          <div><div className={`text-[13px] ${MUTED} mb-1.5`}>Applies to</div><div className="flex gap-5 text-[14px] text-[var(--color-text)]">{[['UI login', true], ['API tokens', false], ['Withdrawals', false]].map(([l, c]) => <label key={l as string} className="flex items-center gap-2"><input type="checkbox" className="mr-check" defaultChecked={c as boolean} />{l as string}</label>)}</div></div>
          <label className="flex items-center gap-2 text-[14px] text-[var(--color-text)]"><input type="checkbox" className="mr-check" defaultChecked />Log only for 7 days before enforcing</label>
        </Dialog>
      )}
      <MemberDrawer member={selectedMember} api={membersApi} onClose={() => setSelectedMember(null)} readOnly />
      <Snackbar ref={snack} />
    </div>
  );
};
