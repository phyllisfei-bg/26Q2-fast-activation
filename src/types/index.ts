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
  'gsWallet', 'gsDeposit', 'gsGoAccount', 'gsTransact',
  'gsPolicy', 'gsStaking', 'gsInvite', 'gsRoles',
  'gsCompliance', 'gsReporting', 'gsVerify', 'gsTrading',
  // super user
  'gsGoAccountFund', 'gsFirstTrade', 'gsGoAccountStaking',
  // org admin
  'gsViewOrgMembers', 'gsExploreRoles', 'gsExplorePortfolio',
  // ent admin / wallet admin (shared)
  'gsUnderstandTasks', 'gsUnderstandPolicies',
  // wallet spender
  'gsInitiateTransaction', 'gsUnderstandStaking',
  // wallet viewer
  'gsLearnDeposit', 'gsTryReports',
] as const;

export type GsTask = typeof ALL_GS_TASKS[number];
export type TaskType = 'action' | 'explore';

export interface GsTaskMeta {
  id: GsTask;
  type: TaskType;
  title: string;
  description: string;
  time: string;
  colorKey: string;
}

export const GS_TASK_META: Record<GsTask, GsTaskMeta> = {
  gsWallet: {
    id: 'gsWallet', type: 'action',
    title: 'Create Your First Wallet',
    description: 'Set up a secure custody wallet to safely hold digital assets with institutional-grade protection.',
    time: '2 min', colorKey: 'wallet',
  },
  gsDeposit: {
    id: 'gsDeposit', type: 'action',
    title: 'Make Your First Deposit',
    description: 'Fund your wallet via crypto transfer or wire to start moving and trading assets.',
    time: '3 min', colorKey: 'deposit',
  },
  gsGoAccount: {
    id: 'gsGoAccount', type: 'action',
    title: 'Trade on Go Account',
    description: "Execute your first trade with instant off-exchange settlement and zero on-chain fees.",
    time: '2 min', colorKey: 'go-account',
  },
  gsTransact: {
    id: 'gsTransact', type: 'action',
    title: 'Send Your First Transaction',
    description: 'Transfer funds to an external address or settle instantly with a counterparty.',
    time: '2 min', colorKey: 'transact',
  },
  gsPolicy: {
    id: 'gsPolicy', type: 'action',
    title: 'Configure Your First Policy',
    description: 'Set multi-sig approvals and spending limits to protect holdings from unauthorized transfers.',
    time: '3 min', colorKey: 'policy',
  },
  gsStaking: {
    id: 'gsStaking', type: 'explore',
    title: 'Explore Staking',
    description: 'Earn yield on ETH, SOL, and other supported assets directly from your custody wallet.',
    time: '1 min', colorKey: 'staking',
  },
  gsInvite: {
    id: 'gsInvite', type: 'action',
    title: 'Invite Team Members',
    description: 'Add colleagues and assign roles to control who can approve transactions and access wallets.',
    time: '2 min', colorKey: 'invite',
  },
  gsRoles: {
    id: 'gsRoles', type: 'action',
    title: 'Set Up Roles & Permissions',
    description: 'Define what each team member can do — from read-only auditors to full signers.',
    time: '3 min', colorKey: 'roles',
  },
  gsCompliance: {
    id: 'gsCompliance', type: 'explore',
    title: 'Review Compliance Status',
    description: 'Check KYB and KYC verification status and resolve any outstanding compliance items.',
    time: '2 min', colorKey: 'compliance',
  },
  gsReporting: {
    id: 'gsReporting', type: 'explore',
    title: 'Explore Reporting & Audits',
    description: 'Access transaction history, audit logs, and exportable reports for compliance and oversight.',
    time: '2 min', colorKey: 'reporting',
  },
  gsVerify: {
    id: 'gsVerify', type: 'action',
    title: 'Complete Video Verification',
    description: 'Finish your identity check with a short video session to unlock full platform access.',
    time: '5 min', colorKey: 'verify',
  },
  gsTrading: {
    id: 'gsTrading', type: 'explore',
    title: 'Set Up Trading Workflow',
    description: "Connect to BitGo's liquidity network and configure your Go Account trading strategy.",
    time: '2 min', colorKey: 'trading',
  },
  // ── super user ───────────────────────────────────────────────────────
  gsGoAccountFund: {
    id: 'gsGoAccountFund', type: 'action',
    title: 'Fund Go Account',
    description: 'Deposit cash or crypto to your Go Account to unlock trading.',
    time: '3 min', colorKey: 'deposit',
  },
  gsFirstTrade: {
    id: 'gsFirstTrade', type: 'action',
    title: 'Complete Your First Trade',
    description: 'Place your first order using the Go Account panel.',
    time: '2 min', colorKey: 'go-account',
  },
  gsGoAccountStaking: {
    id: 'gsGoAccountStaking', type: 'explore',
    title: 'Try Go Account Staking',
    description: 'Earn yield on idle assets directly from your Go Account.',
    time: '1 min', colorKey: 'staking',
  },
  // ── org admin ────────────────────────────────────────────────────────
  gsViewOrgMembers: {
    id: 'gsViewOrgMembers', type: 'explore',
    title: 'View Org Members',
    description: 'See who has access to your organization.',
    time: '1 min', colorKey: 'invite',
  },
  gsExploreRoles: {
    id: 'gsExploreRoles', type: 'explore',
    title: 'Explore User Roles',
    description: 'Understand how roles and permissions are structured.',
    time: '2 min', colorKey: 'roles',
  },
  gsExplorePortfolio: {
    id: 'gsExplorePortfolio', type: 'explore',
    title: 'Explore Portfolio',
    description: 'Get familiar with your portfolio overview.',
    time: '1 min', colorKey: 'wallet',
  },
  // ── ent admin / wallet admin ─────────────────────────────────────────
  gsUnderstandTasks: {
    id: 'gsUnderstandTasks', type: 'explore',
    title: 'Understand Tasks & Approval',
    description: 'Learn how transaction approvals and pending tasks work.',
    time: '2 min', colorKey: 'policy',
  },
  gsUnderstandPolicies: {
    id: 'gsUnderstandPolicies', type: 'explore',
    title: 'Understand Policies',
    description: 'See how spending policies protect your organization.',
    time: '2 min', colorKey: 'policy',
  },
  // ── wallet spender ───────────────────────────────────────────────────
  gsInitiateTransaction: {
    id: 'gsInitiateTransaction', type: 'action',
    title: 'Initiate a Transaction',
    description: 'Send funds or initiate a transfer from your wallet.',
    time: '2 min', colorKey: 'transact',
  },
  gsUnderstandStaking: {
    id: 'gsUnderstandStaking', type: 'explore',
    title: 'Understand Staking',
    description: 'Learn how to earn yield on your assets.',
    time: '1 min', colorKey: 'staking',
  },
  // ── wallet viewer ────────────────────────────────────────────────────
  gsLearnDeposit: {
    id: 'gsLearnDeposit', type: 'explore',
    title: 'Learn How to Deposit',
    description: 'Understand the steps to fund a wallet.',
    time: '1 min', colorKey: 'deposit',
  },
  gsTryReports: {
    id: 'gsTryReports', type: 'explore',
    title: 'Try Generating Reports',
    description: 'Export transaction history and audit logs.',
    time: '2 min', colorKey: 'reporting',
  },
};

// ── Roles ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_user' | 'org_admin' | 'ent_admin' | 'wallet_admin'
  | 'wallet_spender' | 'wallet_viewer' | 'trader' | 'video_id_user' | 'auditor';

export const USER_ROLES: { id: UserRole; label: string; description: string }[] = [
  { id: 'super_user',     label: 'Super User',       description: 'Full access, all permissions' },
  { id: 'org_admin',      label: 'Org Admin',        description: 'Manage organization & users' },
  { id: 'ent_admin',      label: 'Enterprise Admin', description: 'Enterprise governance & compliance' },
  { id: 'wallet_admin',   label: 'Wallet Admin',     description: 'Create wallets & set policies' },
  { id: 'wallet_spender', label: 'Wallet Spender',   description: 'Move funds & execute transactions' },
  { id: 'wallet_viewer',  label: 'Wallet Viewer',    description: 'Read-only wallet access' },
  { id: 'trader',         label: 'Trader',           description: 'Trade & earn yield' },
  { id: 'video_id_user',  label: 'Video ID User',    description: 'Pending identity verification' },
  { id: 'auditor',        label: 'Auditor',          description: 'Read-only reporting access' },
];

export const ROLE_TASKS: Record<UserRole, GsTask[]> = {
  super_user:     ['gsGoAccountFund', 'gsFirstTrade', 'gsGoAccountStaking'],
  org_admin:      ['gsViewOrgMembers', 'gsExploreRoles', 'gsExplorePortfolio'],
  ent_admin:      ['gsExplorePortfolio', 'gsUnderstandTasks', 'gsUnderstandPolicies'],
  wallet_admin:   ['gsExplorePortfolio', 'gsUnderstandTasks', 'gsUnderstandPolicies'],
  wallet_spender: ['gsExplorePortfolio', 'gsInitiateTransaction', 'gsUnderstandStaking'],
  wallet_viewer:  ['gsExplorePortfolio', 'gsLearnDeposit', 'gsTryReports'],
  trader:         ['gsGoAccount', 'gsStaking', 'gsTrading'],
  video_id_user:  ['gsVerify', 'gsGoAccount', 'gsStaking'],
  auditor:        ['gsCompliance', 'gsReporting'],
};

export const ROLE_GS_SUBTITLE: Record<UserRole, string> = {
  super_user:     'Fund your Go Account and place your first trade.',
  org_admin:      'Get to know your team and how access is structured.',
  ent_admin:      'Understand how approvals and policies govern your enterprise.',
  wallet_admin:   'Explore your portfolio and the controls that protect it.',
  wallet_spender: 'See your holdings, move funds, and learn about staking.',
  wallet_viewer:  'Get familiar with what you can see and do.',
  trader:         'Hit the ground running with your first trades.',
  video_id_user:  'Complete verification to unlock full platform access.',
  auditor:        'Get familiar with what you can review and report on.',
};

// ── Wallet callouts ───────────────────────────────────────────────────

export type CalloutType = 'info' | 'workflow';

export interface CalloutConfig {
  id: string;
  anchor: 'deposit' | 'avatar' | 'walletName';
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
  trader:         ['deposit', 'staking'],
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
