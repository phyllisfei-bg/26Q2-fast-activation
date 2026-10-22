/* Policies in plain language — shared types + seed data.
   Every policy is stored as structured fields and rendered as a sentence. */

export type EditablePolicyField = 'scope' | 'trigger' | 'condition' | 'action';

export type PolicyState = 'Locked' | 'Unlocked · 47h left' | 'Pending approval' | 'Planned' | 'Paused';

export interface SentencePolicy {
  id: string;
  kind: 'transactions' | 'administrative';
  name: string;
  summary: string;
  sentenceMode?: 'requires' | 'accepted';
  sentenceSuffix?: string;
  setBy: 'Your enterprise' | 'Your organization' | 'BitGo';
  policyState: PolicyState;
  lastUsed?: string;
  organizationNote?: string;
  actor: string;
  scope: string;
  trigger: string;
  condition: string;
  conditionValue?: string;
  policyAction: string;
  editableFields: EditablePolicyField[];
  /** Show the unlocked icon even when another state (e.g. pending approval) is the main status. */
  unlocked?: boolean;
  /** Full sentence override, for policies that don't read as "X requires Y". */
  description?: string;
  /** Plain-text words before the editable condition, e.g. "user IP is not from" + [the allowlist]. */
  conditionLead?: string;
  /** IP allowlist entries, for policies whose condition is "user IP is not from the allowlist". */
  allowlist?: { label: string; cidr: string }[];
  /** Shows an "Optional" badge next to the name. */
  optional?: boolean;
  status: 'Active' | 'Archived';
  lastModified: string;
}

export const SENTENCE_POLICIES: SentencePolicy[] = [
  { id: 'tx-video-id', kind: 'transactions', name: 'Video ID', summary: 'Withdrawals over {conditionValue} from custody wallets', setBy: 'BitGo', policyState: 'Locked', lastUsed: 'Sep 18, 2026', actor: 'wallet user', trigger: 'send funds', scope: 'custody wallets', condition: 'transfer amount exceeds', conditionValue: '$250,000', policyAction: 'video verification with BitGo Support', editableFields: ['condition', 'action'], status: 'Active', lastModified: 'Sep 18, 2026, 3:42 PM' },
  { id: 'tx-unverified', kind: 'transactions', name: 'Unverified address', summary: 'Withdrawals to unverified addresses', setBy: 'Your enterprise', policyState: 'Pending approval', unlocked: true, lastUsed: 'Sep 14, 2026', actor: 'wallet user', trigger: 'send funds', scope: 'unverified addresses', condition: 'destination is unverified', policyAction: '1 enterprise admin to approve', editableFields: ['action'], status: 'Active', lastModified: 'Sep 14, 2026, 9:16 AM' },
  { id: 'tx-fiat', kind: 'transactions', name: 'Fiat liveness check', summary: 'Fiat withdrawals over {conditionValue} from custody wallets', setBy: 'BitGo', policyState: 'Locked', lastUsed: 'Sep 9, 2026', actor: 'wallet user', trigger: 'withdraw fiat', scope: 'custody wallets', condition: 'withdrawal amount exceeds', conditionValue: '$100,000', policyAction: 'liveness verification', editableFields: ['condition'], status: 'Active', lastModified: 'Sep 9, 2026, 1:05 PM' },
  { id: 'tx-custodial-whitelist', kind: 'transactions', name: 'Custodial wallet whitelist', summary: 'Withdrawals from custody wallets and the Main Account', setBy: 'BitGo', policyState: 'Locked', lastUsed: 'Sep 5, 2026', actor: 'wallet user', trigger: 'send funds', scope: 'custody wallets and the Main Account', condition: 'destination is not whitelisted', policyAction: 'destinations to be whitelisted', editableFields: [], status: 'Active', lastModified: 'Sep 5, 2026, 10:12 AM' },
  { id: 'admin-unlock', kind: 'administrative', name: 'Policy unlocks', summary: 'Unlocking any policy in this enterprise', setBy: 'Your enterprise', policyState: 'Locked', lastUsed: 'Aug 24, 2026', actor: 'enterprise admin', trigger: 'unlock policies for editing', scope: 'any policy in this enterprise', condition: 'an unlock is requested', policyAction: 'video verification with BitGo Support', editableFields: ['action'], status: 'Active', lastModified: 'Aug 24, 2026, 10:33 AM' },
  { id: 'admin-update-policy', kind: 'administrative', name: 'Policy changes', summary: 'Creating or changing any policy in this enterprise', setBy: 'Your enterprise', policyState: 'Pending approval', unlocked: true, lastUsed: 'Aug 20, 2026', actor: 'enterprise admin', trigger: 'create or change a policy', scope: 'any policy in this enterprise', condition: 'a change is submitted', policyAction: '1 wallet admin and 1 enterprise admin to approve', editableFields: ['action'], status: 'Active', lastModified: 'Aug 20, 2026, 2:11 PM' },
  { id: 'admin-user-roles', kind: 'administrative', name: 'User and role changes', summary: 'Inviting someone or changing a role', setBy: 'Your organization', policyState: 'Locked', lastUsed: 'Sep 1, 2026', organizationNote: 'Shared by every enterprise in your organization. Changes are approved by organization admins.', actor: 'organization admin', trigger: 'invite someone or change a role', scope: 'your organization', condition: 'a change is submitted', policyAction: 'another organization admin to approve', editableFields: ['action'], status: 'Active', lastModified: 'Sep 1, 2026, 11:45 AM' },
  { id: 'admin-whitelist', kind: 'administrative', name: 'Whitelist changes', summary: 'Adding or removing a whitelisted address', setBy: 'Your enterprise', policyState: 'Locked', lastUsed: 'Sep 10, 2026', actor: 'wallet admin', trigger: 'add or remove an address', scope: 'wallet whitelist', condition: 'a change is submitted', policyAction: 'another wallet admin to approve', editableFields: ['action'], status: 'Active', lastModified: 'Sep 10, 2026, 3:22 PM' },
  { id: 'admin-approve-tx', kind: 'administrative', name: 'Approval IP allowlist', summary: 'Approvals are only accepted', sentenceMode: 'accepted', description: 'Approvals from users that are not from the IP allowlist (0 added now) are automatically blocked', optional: true, allowlist: [], setBy: 'Your enterprise', policyState: 'Planned', actor: 'wallet admin', trigger: 'Approvals', scope: 'all wallets', conditionLead: 'user IP is not from', condition: 'the IP allowlist', policyAction: 'automatically blocked', editableFields: ['condition'], status: 'Active', lastModified: 'Aug 15, 2026, 9:00 AM' },
];

/* ── Builder vocabulary ── */
export type BuilderEvent = 'withdrawal' | 'stake' | 'unstake' | 'rewards' | 'validator' | 'settlement-start' | 'settlement-approve' | 'recovery';
export type BuilderWallet = 'all' | 'single' | 'multiple' | 'type' | 'tag';
export type CondType = 'amount' | 'velocity' | 'destination' | 'asset' | 'webhook';
export type ActType = 'enterprise-admins' | 'wallet-admins' | 'users' | 'role' | 'final' | 'verification' | 'reject';

/** One condition step ("Spending limit", "Destination"…). */
export interface Cond { id: string; type: CondType; limit: 'gt' | 'gte'; amount: string; currency: string; join: 'and' | 'or'; fresh?: boolean }
/** One action step ("Require approval from a set of users"…). */
export interface Act { id: string; type: ActType; approvals: number; role: string; person: string; users: string[]; selfApprove: boolean; method: 'video' | 'liveness'; join: 'and' | 'or'; fresh?: boolean }

export const BUILDER_EVENTS: { id: BuilderEvent; label: string; sentence: string; noCondition: string; help: string }[] = [
  { id: 'withdrawal', label: 'Withdrawals', sentence: 'Withdrawals', noCondition: 'All withdrawals', help: 'Any send out of the wallet' },
  { id: 'stake', label: 'Stakes', sentence: 'Stakes', noCondition: 'All stakes', help: 'Stake assets from a supported wallet' },
  { id: 'unstake', label: 'Unstakes', sentence: 'Unstakes', noCondition: 'All unstakes', help: 'Unstake assets from a supported wallet' },
  { id: 'rewards', label: 'Rewards claims', sentence: 'Rewards claims', noCondition: 'All rewards claims', help: 'Claim staking rewards' },
  { id: 'validator', label: 'Validator switches', sentence: 'Validator switches', noCondition: 'All validator switches', help: 'Move stake to another validator' },
  { id: 'settlement-start', label: 'Settlements you start', sentence: 'Settlements you start', noCondition: 'All settlements you start', help: 'Go Network settlements initiated by your team' },
  { id: 'settlement-approve', label: 'Settlement requests', sentence: 'Settlement requests from counterparties', noCondition: 'All settlement requests from counterparties', help: 'Settlements another party asks you to approve' },
  { id: 'recovery', label: 'Cross-chain recoveries', sentence: 'Cross-chain recoveries', noCondition: 'All cross-chain recoveries', help: 'Recover assets sent on the wrong network' },
];

export const BUILDER_WALLETS: { id: BuilderWallet; label: string; help: string }[] = [
  { id: 'all', label: 'All wallets in my enterprise', help: 'Applies to All Wallets' },
  { id: 'single', label: 'Single Wallet', help: 'Allows creating a Condition based on the Wallet Id' },
  { id: 'multiple', label: 'Multiple Wallets', help: 'Allows creating a Condition for multiple Wallets' },
  { id: 'type', label: 'Wallet Type', help: 'Allows creating a Condition based on the Wallet Type' },
  { id: 'tag', label: 'Wallet Tag', help: 'Select wallets that have specific tags applied' },
];


/* ── Hidden for now ───────────────────────────────────────────────────
   NOTE (come back to this): the "User and role changes" policy is hidden from every
   policy list for now. The data stays in SENTENCE_POLICIES; remove its id from
   HIDDEN_POLICY_IDS to bring it back. */
export const HIDDEN_POLICY_IDS = ['admin-user-roles'];
export const VISIBLE_POLICIES = SENTENCE_POLICIES.filter(p => !HIDDEN_POLICY_IDS.includes(p.id));

/** Seeded (BitGo / system) policies are "default": only some fields can be edited.
 *  Policies created in the builder are "custom": every field is editable. */
export const isCustomPolicy = (p: SentencePolicy) => p.id.startsWith('custom-');

/** Edit views read scope before condition: "Withdrawals over {v} from custody wallets"
 *  becomes "Withdrawals from custody wallets when over {v}". Policy rows keep their original copy. */
export const scopeFirst = (summary: string) =>
  summary.replace(/^(.*?)\s+(over \{conditionValue\})\s+(from .+)$/, '$1 $3 when $2');
