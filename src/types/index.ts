export type Theme = 'light' | 'dark';
export type Page = 'dashboard' | 'wallet-detail';

export interface WalletInfo {
  name: string;
  asset: string;
  assetIcon: string;
  assetColor: string;
}

export interface TradePair {
  icon: string;
  name: string;
  sub: string;
  price: number;
  iconBg: string;
  change: string;
  pos: boolean;
}

export const TRADE_PAIRS: TradePair[] = [
  { icon: '₿', name: 'BTC / USD', sub: 'Bitcoin',  price: 103214, iconBg: '#F7931A', change: '+2.4%', pos: true  },
  { icon: 'Ξ', name: 'ETH / USD', sub: 'Ethereum', price: 3812,   iconBg: '#627EEA', change: '+1.1%', pos: true  },
  { icon: 'S', name: 'SOL / USD', sub: 'Solana',   price: 182,    iconBg: '#9945FF', change: '-0.8%', pos: false },
];

// ── Task catalog ─────────────────────────────────────────────────────

export const ALL_GS_TASKS = [
  // legacy (kept for wallet-creation flow compatibility)
  'createWallet', 'deposit', 'goAccount', 'transact',
  'firstPolicy', 'staking', 'invite',
  'gsCompliance', 'gsReporting', 'gsVerify', 'gsTrading',
  // super user
  'fundGoAccount', 'firstTrade', 'goAccountStaking',
  // org admin
  'viewMembersRoles', 'explorePortfolio',
  'viewUMSTasks', 'viewEnterprisesWallets',
  // ent admin
  'addBankAccount', 'explorePolicies',
  // wallet admin / spender shared
  'gsStartFirstTrade',
  // wallet viewer
  'viewReports',
  // wallet trader
  'viewTrades',
  // ent admin / wallet admin (shared, legacy)
  'gsUnderstandTasks', 'gsUnderstandPolicies',
  // wallet spender (legacy)
  'gsInitiateTransaction', 'gsUnderstandStaking',
  // wallet viewer (legacy)
  'gsLearnDeposit', 'gsTryReports',
  // video id user
  'completeVideoID', 'understandTasksApprovals', 'unlockPolicy',
  // auditor
  'viewActivityLog',
  // organic super user
  'completeKYB', 'completeKYC',
] as const;

export type TaskId = typeof ALL_GS_TASKS[number];
export type TaskType = 'action' | 'explore';

export interface TaskMeta {
  id: TaskId;
  type: TaskType;
  title: string;
  description: string;
  time: string;
  colorKey: string;
  isBusinessGoal?: boolean;
}

export const ACTION_CATALOG: Record<TaskId, TaskMeta> = {
  createWallet: {
    id: 'createWallet', type: 'action',
    title: 'Create Your First Wallet',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'wallet',
  },
  deposit: {
    id: 'deposit', type: 'action',
    title: 'Make Your First Deposit',
    description: 'This is a 12 word max description',
    time: '3 min', colorKey: 'deposit',
  },
  goAccount: {
    id: 'goAccount', type: 'action',
    title: 'Trade on Go Account',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'go-account',
  },
  transact: {
    id: 'transact', type: 'action',
    title: 'Send Your First Transaction',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'transact',
  },
  // Not in spec — legacy flow (PolicyModal). Kept in case this flow returns.
  firstPolicy: {
    id: 'firstPolicy', type: 'action',
    title: 'Configure Your First Policy',
    description: 'This is a 12 word max description',
    time: '3 min', colorKey: 'policy',
  },
  staking: {
    id: 'staking', type: 'explore',
    title: 'Explore Staking',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'staking',
  },
  invite: {
    id: 'invite', type: 'action',
    title: 'Invite Team Members',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'invite',
  },
  gsCompliance: {
    id: 'gsCompliance', type: 'explore',
    title: 'Review Compliance Status',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'compliance',
  },
  gsReporting: {
    id: 'gsReporting', type: 'explore',
    title: 'Explore Reporting & Audits',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'reporting',
  },
  gsVerify: {
    id: 'gsVerify', type: 'action',
    title: 'Complete Video Verification',
    description: 'This is a 12 word max description',
    time: '5 min', colorKey: 'verify',
  },
  gsTrading: {
    id: 'gsTrading', type: 'explore',
    title: 'Set Up Trading Workflow',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'trading',
  },
  // ── super user ───────────────────────────────────────────────────────
  fundGoAccount: {
    id: 'fundGoAccount', type: 'action',
    title: 'Fund Go Account',
    description: 'This is a 12 word max description',
    time: '3 min', colorKey: 'deposit', isBusinessGoal: true,
  },
  firstTrade: {
    id: 'firstTrade', type: 'action',
    title: 'Complete Your First Trade',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'go-account', isBusinessGoal: true,
  },
  goAccountStaking: {
    id: 'goAccountStaking', type: 'explore',
    title: 'Try Go Account Staking',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'staking',
  },
  // ── org admin ────────────────────────────────────────────────────────
  viewMembersRoles: {
    id: 'viewMembersRoles', type: 'explore',
    title: 'View Members & Roles',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'invite',
  },
  explorePortfolio: {
    id: 'explorePortfolio', type: 'explore',
    title: 'Explore Portfolio',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'wallet',
  },
  // ── ent admin / wallet admin ─────────────────────────────────────────
  gsUnderstandTasks: {
    id: 'gsUnderstandTasks', type: 'explore',
    title: 'Understand Tasks & Approval',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'policy',
  },
  gsUnderstandPolicies: {
    id: 'gsUnderstandPolicies', type: 'explore',
    title: 'Understand Policies',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'policy',
  },
  // ── wallet spender ───────────────────────────────────────────────────
  gsInitiateTransaction: {
    id: 'gsInitiateTransaction', type: 'action',
    title: 'Initiate a Transaction',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'transact',
  },
  gsUnderstandStaking: {
    id: 'gsUnderstandStaking', type: 'explore',
    title: 'Understand Staking',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'staking',
  },
  // ── wallet viewer ────────────────────────────────────────────────────
  gsLearnDeposit: {
    id: 'gsLearnDeposit', type: 'explore',
    title: 'Learn How to Deposit',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'deposit',
  },
  gsTryReports: {
    id: 'gsTryReports', type: 'explore',
    title: 'Try Generating Reports',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'reporting',
  },
  // ── spec-aligned tasks ───────────────────────────────────────────────
  viewUMSTasks: {
    id: 'viewUMSTasks', type: 'explore',
    title: 'View UMS Tasks',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'policy',
  },
  viewEnterprisesWallets: {
    id: 'viewEnterprisesWallets', type: 'explore',
    title: 'View Enterprises & Wallets',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'wallet',
  },
  addBankAccount: {
    id: 'addBankAccount', type: 'action',
    title: 'Add Bank Account',
    description: 'This is a 12 word max description',
    time: '3 min', colorKey: 'deposit',
  },
  explorePolicies: {
    id: 'explorePolicies', type: 'explore',
    title: 'Explore Policies',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'policy',
  },
  gsStartFirstTrade: {
    id: 'gsStartFirstTrade', type: 'action',
    title: 'Start First Trade',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'go-account',
  },
  viewReports: {
    id: 'viewReports', type: 'explore',
    title: 'View Reports',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'reporting',
  },
  viewTrades: {
    id: 'viewTrades', type: 'explore',
    title: 'View Trades',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'go-account',
  },
  completeVideoID: {
    id: 'completeVideoID', type: 'action',
    title: 'Complete Video ID',
    description: 'This is a 12 word max description',
    time: '5 min', colorKey: 'verify', isBusinessGoal: true,
  },
  understandTasksApprovals: {
    id: 'understandTasksApprovals', type: 'explore',
    title: 'Understand Tasks & Approvals',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'policy',
  },
  unlockPolicy: {
    id: 'unlockPolicy', type: 'explore',
    title: 'Unlock Policy Controls',
    description: 'This is a 12 word max description',
    time: '2 min', colorKey: 'policy',
  },
  viewActivityLog: {
    id: 'viewActivityLog', type: 'explore',
    title: 'View Activity Log',
    description: 'This is a 12 word max description',
    time: '1 min', colorKey: 'reporting',
  },
  completeKYB: {
    id: 'completeKYB', type: 'action',
    title: 'Complete KYB',
    description: 'This is a 12 word max description',
    time: '10 min', colorKey: 'compliance',
  },
  completeKYC: {
    id: 'completeKYC', type: 'action',
    title: 'Complete KYC',
    description: 'This is a 12 word max description',
    time: '5 min', colorKey: 'compliance',
  },
};

// ── Roles ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_user' | 'org_admin' | 'ent_admin' | 'wallet_admin'
  | 'wallet_spender' | 'wallet_viewer' | 'wallet_trader' | 'video_id_user' | 'auditor';

export const USER_ROLES: { id: UserRole; label: string; description: string }[] = [
  { id: 'super_user',     label: 'Super User',       description: 'Full access, all permissions' },
  { id: 'org_admin',      label: 'Org Admin',        description: 'Manage organization & users' },
  { id: 'ent_admin',      label: 'Enterprise Admin', description: 'Create wallets, manage ent-level bank accounts, wallets, & policies' },
  { id: 'wallet_admin',   label: 'Wallet Admin',     description: 'Manage wallets, wallet-level whitelist and policies' },
  { id: 'wallet_spender', label: 'Wallet Spender',   description: 'All kinds of transactions on assigned wallets' },
  { id: 'wallet_viewer',  label: 'Wallet Viewer',    description: 'Read-only wallet access' },
  { id: 'wallet_trader',  label: 'Wallet Trader',    description: 'Buy/sell with Go Account' },
  { id: 'video_id_user',  label: 'Video ID User',    description: 'Approve actions via Video ID calls' },
  { id: 'auditor',        label: 'Auditor',          description: 'Read-only reporting access' },
];

export const ROLE_POOLS: Record<UserRole, TaskId[]> = {
  super_user:     ['fundGoAccount', 'firstTrade', 'createWallet'],
  org_admin:      ['viewMembersRoles', 'understandTasksApprovals', 'viewEnterprisesWallets'],
  ent_admin:      ['createWallet', 'addBankAccount', 'explorePolicies'],
  wallet_admin:   ['fundGoAccount', 'explorePortfolio', 'explorePolicies'],
  wallet_spender: ['fundGoAccount', 'explorePortfolio', 'firstTrade'],
  wallet_viewer:  ['fundGoAccount', 'explorePortfolio', 'viewReports'],
  wallet_trader:  ['firstTrade', 'viewTrades'],
  video_id_user:  ['completeVideoID', 'understandTasksApprovals', 'unlockPolicy'],
  auditor:        ['viewActivityLog'],
};

export const ROLE_GS_SUBTITLE: Record<UserRole, string> = {
  super_user:     'Fund your Go Account and place your first trade.',
  org_admin:      'Get to know your team and how access is structured.',
  ent_admin:      'Understand how approvals and policies govern your enterprise.',
  wallet_admin:   'Explore your portfolio and the controls that protect it.',
  wallet_spender: 'See your holdings, move funds, and learn about staking.',
  wallet_viewer:  'Get familiar with what you can see and do.',
  wallet_trader:  'Hit the ground running with your first trades.',
  video_id_user:  'Complete verification to unlock full platform access.',
  auditor:        'Get familiar with what you can review and report on.',
};

// ── Members & Roles (admin console) ───────────────────────────────────

export type EntityStatus = 'active' | 'pending' | 'inactive' | 'invited';

export type PermissionCategory =
  | 'Administrative' | 'Enterprise' | 'Wallets' | 'Transactional'
  | 'View' | 'Audit' | 'Trade' | 'Verification';

export interface Permission {
  id: string;
  label: string;
  description: string;
  category: PermissionCategory;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  status: EntityStatus;
  joinedAt: string;
  userId: string;
  roleIds: string[];                              // → Role.id
  roleStatuses?: Record<string, EntityStatus>;    // per-role status override (default: 'active')
  avatarColor?: string;                           // av-blue | av-teal | av-purple | av-amber
}

export interface Role {
  id: string;
  name: string;
  kind: 'Default' | 'Custom';
  description: string;
  status: EntityStatus;
  categories: PermissionCategory[];               // pills shown in the table
  permissionIds: string[];                        // → PERMISSION_CATALOG
  enterpriseAccess: { enterprises: string; wallets: string };
  memberCount: number | 'All';
  memberRollup?: { active: number; pending: number; inactive: number };
}

export const PERMISSION_CATALOG: Permission[] = [
  { id: 'wallet_view',     label: 'Wallet View',                description: 'View all balances and transactions',                category: 'View' },
  { id: 'enterprise_view', label: 'Enterprise View',            description: 'View enterprises and their wallets',                category: 'View' },
  { id: 'wallet_manage',   label: 'Wallet Management',          description: 'Create, configure, and manage wallets',             category: 'Wallets' },
  { id: 'org_admin',       label: 'Organization Administration', description: 'Manage members, roles, and organization settings', category: 'Administrative' },
  { id: 'enterprise_admin',label: 'Enterprise Administration',  description: 'Manage enterprise settings and bank accounts',       category: 'Enterprise' },
  { id: 'transact',        label: 'Transactions',               description: 'Initiate and approve transactions',                 category: 'Transactional' },
  { id: 'trade',           label: 'Trading',                    description: 'Buy and sell through the Go Account',                category: 'Trade' },
  { id: 'audit',           label: 'Audit & Reporting',          description: 'Read-only reporting and audit log access',          category: 'Audit' },
  { id: 'video_id',        label: 'Video ID Verification',      description: 'Approve actions via Video ID calls',                category: 'Verification' },
];

export interface WalletRef {
  name: string;
  id: string;
  custody: string;        // e.g. "Self-Custody Hot"
  asset: string;          // e.g. "BTC"
  balance?: string;       // e.g. "$23,000.34"
}

export interface EnterpriseWallets {
  enterprise: string;
  wallets: WalletRef[];
}

function sampleWallets(n: number, withBalance = false): WalletRef[] {
  return Array.from({ length: n }, (_, i) => ({
    name: 'Wallet Name',
    id: '66d9cb…3e956b',
    custody: 'Self-Custody Hot',
    asset: 'BTC',
    balance: withBalance && i === 5 ? '$23,000.34' : undefined,
  }));
}

export const ENTERPRISE_WALLETS: EnterpriseWallets[] = [
  { enterprise: 'Acme Capital', wallets: sampleWallets(8, true) },
  { enterprise: 'Northwind Markets', wallets: sampleWallets(6) },
  { enterprise: 'Globex Treasury', wallets: sampleWallets(5) },
];

export const SAMPLE_ROLES: Role[] = [
  { id: 'org_admin',       name: 'Organization Admin', kind: 'Default', status: 'active',
    description: 'Manage users, roles, and access permissions',
    categories: ['Administrative'], permissionIds: ['org_admin', 'enterprise_view', 'wallet_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 23 },
  { id: 'ent_admin',       name: 'Enterprise Admin', kind: 'Default', status: 'active',
    description: 'Manage enterprise-level settings and policies',
    categories: ['Enterprise'], permissionIds: ['enterprise_admin', 'wallet_manage', 'enterprise_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 'All' },
  { id: 'wallet_admin',    name: 'Wallet Admin', kind: 'Default', status: 'active',
    description: 'Manage wallet-level settings and policies',
    categories: ['Wallets'], permissionIds: ['wallet_manage', 'wallet_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: '14 wallets' }, memberCount: 23 },
  { id: 'wallet_spender',  name: 'Wallet Spender', kind: 'Default', status: 'active',
    description: 'Initiate withdrawals and transactions',
    categories: ['Transactional'], permissionIds: ['transact', 'wallet_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 23 },
  { id: 'wallet_viewer',   name: 'Wallet Viewer', kind: 'Default', status: 'active',
    description: 'Read-only access to wallets',
    categories: ['View'], permissionIds: ['wallet_view', 'enterprise_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 72,
    memberRollup: { active: 67, pending: 1, inactive: 4 } },
  { id: 'auditor',         name: 'Auditor', kind: 'Default', status: 'active',
    description: 'Read-only access to activity logs',
    categories: ['Audit'], permissionIds: ['audit', 'wallet_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 23 },
  { id: 'trader',          name: 'Trader', kind: 'Default', status: 'active',
    description: 'Initiate trades within Go Account',
    categories: ['Trade'], permissionIds: ['trade', 'wallet_view'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 23 },
  { id: 'video_id_user',   name: 'Video ID User', kind: 'Default', status: 'active',
    description: 'Approve sensitive actions via Video ID calls',
    categories: ['Verification'], permissionIds: ['video_id'],
    enterpriseAccess: { enterprises: 'All enterprises', wallets: 'All wallets' }, memberCount: 2 },
  { id: 'external_auditor', name: 'External Auditor', kind: 'Custom', status: 'pending',
    description: 'Scoped external audit access across selected enterprises and wallets.',
    categories: ['Administrative', 'Transactional', 'Audit', 'View'],
    permissionIds: ['audit', 'transact', 'wallet_view', 'enterprise_view'],
    enterpriseAccess: { enterprises: '3 enterprises', wallets: '14 wallets' }, memberCount: 23 },
];

const _memberNames = [
  'Charles Leclerc', 'Joseph (You)', 'Lando Norris', 'Ami Schmitt', 'Oscar Piastri',
  'Alexander Albon', 'Fernando Alonso', 'Max Verstappen',
];
const _avatarColors = ['av-blue', 'av-teal', 'av-purple', 'av-amber'];

// Role assignments spread across members so every role has both assigned and available members.
// org_admin: Leclerc, Joseph, Fernando (3)
// ent_admin: Leclerc, Joseph, Ami, Max (4)
// wallet_admin: Leclerc, Joseph, Norris, Fernando (4)
// wallet_spender: Norris, Oscar, Max (3)
// wallet_viewer: Joseph, Norris, Ami, Albon (4)
// auditor: Ami, Albon (2)
// trader: Oscar, Fernando (2)
// video_id_user: Max (1)
// external_auditor: Albon (1)
const _memberRoles: string[][] = [
  ['org_admin', 'ent_admin', 'wallet_admin'],                         // Charles Leclerc
  ['org_admin', 'ent_admin', 'wallet_admin', 'wallet_viewer'],        // Joseph (You)
  ['wallet_admin', 'wallet_viewer', 'wallet_spender'],                // Lando Norris
  ['ent_admin', 'wallet_viewer', 'auditor'],                          // Ami Schmitt
  ['wallet_spender', 'trader'],                                       // Oscar Piastri
  ['wallet_viewer', 'auditor', 'external_auditor'],                   // Alexander Albon
  ['org_admin', 'wallet_admin', 'trader'],                            // Fernando Alonso
  ['ent_admin', 'wallet_spender', 'video_id_user'],                   // Max Verstappen
];

export const SAMPLE_MEMBERS: Member[] = _memberNames.map((name, i) => {
  const handle = name.replace(/\s*\(.*\)/, '').toLowerCase().replace(/\s+/g, '');
  const base: Member = {
    id: `m_${i + 1}`,
    name,
    email: `${handle}@myorg.com`,
    status: i === 2 ? 'pending' : 'active',
    joinedAt: 'Mar 11, 2024, 11:34 AM',
    userId: 'e2f422…e2f422',
    roleIds: _memberRoles[i],
    avatarColor: _avatarColors[i % _avatarColors.length],
  };
  if (i === 0) base.roleStatuses = { ent_admin: 'pending' };
  return base;
});

// ── Wallet callouts ───────────────────────────────────────────────────

export type CalloutType = 'info' | 'workflow';

export interface CalloutConfig {
  id: string;
  anchor: 'deposit' | 'avatar' | 'walletName' | 'icon';
  caretDir: 'left' | 'up-right' | 'up-left';
  title: string;
  body: string;
  type: CalloutType;
  primaryCta: string;
  secondaryCta?: string;
}

export const CALLOUT_CONFIGS: Record<string, CalloutConfig> = {
  deposit: {
    id: 'deposit', anchor: 'deposit', caretDir: 'left',
    title: 'Fund your wallet',
    body: 'Deposit crypto or fiat to start sending, receiving, and trading from this wallet.',
    type: 'workflow',
    primaryCta: 'Deposit Now',
    secondaryCta: 'Learn More',
  },
  invite: {
    id: 'invite', anchor: 'avatar', caretDir: 'up-right',
    title: 'Invite your team',
    body: 'Add colleagues to manage approvals, policies, and reporting together.',
    type: 'workflow',
    primaryCta: 'Invite Members',
    secondaryCta: 'Learn More',
  },
  policies: {
    id: 'policies', anchor: 'walletName', caretDir: 'up-left',
    title: 'Secured by default policies',
    body: "Your wallet is protected by BitGo's default approval and spend-limit policies. Configure them to fit your workflow.",
    type: 'workflow',
    primaryCta: 'Configure Policies',
    secondaryCta: 'Learn More',
  },
  ga_whatsGoAccount: {
    id: 'ga_whatsGoAccount', anchor: 'icon', caretDir: 'up-left',
    title: "What's Go Account?",
    body: "Go Account is BitGo's off-exchange settlement layer — fund it to start trading across counterparties without moving assets off custody.",
    type: 'info',
    primaryCta: 'Got it',
  },
  ga_invite: {
    id: 'ga_invite', anchor: 'avatar', caretDir: 'up-right',
    title: 'View members here',
    body: 'Wallet members can trade, approve, and manage activity on this account. Your Org Admin controls access — invite more from Settings.',
    type: 'workflow',
    primaryCta: 'View',
    secondaryCta: 'Learn More',
  },
  ga_policies: {
    id: 'ga_policies', anchor: 'walletName', caretDir: 'up-left',
    title: 'Secured by 2 default policies',
    body: 'Policies enforce spend limits and approval rules that protect this account. Your Ent Admin or Org Admin can configure and manage them.',
    type: 'workflow',
    primaryCta: 'View Policies',
    secondaryCta: 'Learn More',
  },
  staking: {
    id: 'staking', anchor: 'walletName', caretDir: 'up-left',
    title: 'Earn yield on this wallet',
    body: 'Stake ETH, SOL, and other supported assets directly from custody to earn passive income.',
    type: 'info',
    primaryCta: 'Explore Staking',
  },
  explore: {
    id: 'explore', anchor: 'deposit', caretDir: 'left',
    title: 'Your wallet is ready',
    body: 'Browse transaction history, check balances, and manage settings from the tabs above.',
    type: 'info',
    primaryCta: 'Got it',
  },
};

export const ROLE_CALLOUT_SEQUENCE: Record<UserRole, string[]> = {
  super_user:     ['deposit', 'invite', 'policies'],
  org_admin:      ['invite', 'policies'],
  ent_admin:      ['invite', 'policies'],
  wallet_admin:   ['policies', 'invite'],
  wallet_spender: ['deposit', 'staking'],
  wallet_viewer:  ['explore'],
  wallet_trader:  ['deposit', 'staking'],
  video_id_user:  ['explore'],
  auditor:        ['explore'],
};

// ── Walkthroughs (unchanged) ──────────────────────────────────────────

export const WALKTHROUGHS = {
  'secure-assets': {
    label: 'Secure & hold digital assets',
    icon: 'lock',
    steps: [
      { title: 'Create your first wallet',   body: 'Set up a cold storage or custody wallet to safely hold your digital assets with institutional-grade protection.',   cta: 'Create Wallet'   },
      { title: 'Deposit funds',              body: 'Copy your wallet address or scan the QR code to send assets in from any exchange or external wallet.',              cta: 'Go to Deposit'   },
      { title: 'Set spending policies',      body: 'Configure multi-sig approvals and daily spending limits to protect your holdings from unauthorized transfers.',     cta: 'Set Up Policies' },
    ],
  },
  'trade-earn': {
    label: 'Trade & earn yield',
    icon: 'chart',
    steps: [
      { title: 'Access prime brokerage',  body: "Connect to BitGo's liquidity network or link exchange accounts for institutional-grade trading execution.",           cta: 'Explore Trading' },
      { title: 'Start earning yield',     body: 'Stake ETH, SOL, and other supported assets directly from your custody wallet to earn passive income.',                cta: 'View Staking'    },
      { title: 'Create a trading wallet', body: 'Set up a hot wallet optimized for faster settlement and active trading strategies.',                                  cta: 'Create Wallet'   },
    ],
  },
  'payments': {
    label: 'Move & settle funds',
    icon: 'dollar',
    steps: [
      { title: 'Join Go Network',          body: 'Enable instant off-exchange settlement with counterparties — no on-chain fees, no settlement risk.',                 cta: 'Set Up Go Network' },
      { title: 'Add stablecoin wallets',   body: 'Create wallets for USDC, USDT, or other stablecoins to power your payment and settlement flows.',                   cta: 'Create Wallet'     },
      { title: 'Make your first transfer', body: 'Send funds to an external address or settle instantly with a counterparty in seconds.',                             cta: 'Move Funds'        },
    ],
  },
} as const;

export type WalkthroughKey = keyof typeof WALKTHROUGHS;
