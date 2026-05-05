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
  'gsViewUMSTasks', 'gsViewEnterprisesWallets',
  // ent admin
  'gsAddBankAccount', 'gsExplorePolicies',
  // wallet admin / spender shared
  'gsStartFirstTrade',
  // wallet viewer
  'gsViewReports',
  // wallet trader
  'gsViewTrades',
  // ent admin / wallet admin (shared, legacy)
  'gsUnderstandTasks', 'gsUnderstandPolicies',
  // wallet spender (legacy)
  'gsInitiateTransaction', 'gsUnderstandStaking',
  // wallet viewer (legacy)
  'gsLearnDeposit', 'gsTryReports',
  // video id user
  'gsCompleteVideoID', 'gsUnderstandTasksApprovals', 'gsUnlockPolicy',
  // auditor
  'gsViewActivityLog',
  // organic super user
  'gsCompleteKYB', 'gsCompleteKYC',
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
  isBusinessGoal?: boolean;
}

export const GS_TASK_META: Record<GsTask, GsTaskMeta> = {
  gsWallet: {
    id: 'gsWallet', type: 'action',
    title: 'Create Your First Wallet',
    description: 'Multi-sig custody wallet to safely hold and protect your assets.',
    time: '2 min', colorKey: 'wallet',
  },
  gsDeposit: {
    id: 'gsDeposit', type: 'action',
    title: 'Make Your First Deposit',
    description: 'Fund your wallet via bank wire or on-chain crypto transfer.',
    time: '3 min', colorKey: 'deposit',
  },
  gsGoAccount: {
    id: 'gsGoAccount', type: 'action',
    title: 'Trade on Go Account',
    description: 'Execute trades with instant off-exchange settlement and zero gas fees.',
    time: '2 min', colorKey: 'go-account',
  },
  gsTransact: {
    id: 'gsTransact', type: 'action',
    title: 'Send Your First Transaction',
    description: 'Send funds on-chain or settle instantly off-exchange with a counterparty.',
    time: '2 min', colorKey: 'transact',
  },
  gsPolicy: {
    id: 'gsPolicy', type: 'action',
    title: 'Configure Your First Policy',
    description: 'Set spend limits and multi-sig approval rules to protect holdings.',
    time: '3 min', colorKey: 'policy',
  },
  gsStaking: {
    id: 'gsStaking', type: 'explore',
    title: 'Explore Staking',
    description: 'Earn yield on ETH, SOL, and more from your custody wallet.',
    time: '1 min', colorKey: 'staking',
  },
  gsInvite: {
    id: 'gsInvite', type: 'action',
    title: 'Invite Team Members',
    description: 'Add colleagues and control who can approve transactions and access wallets.',
    time: '2 min', colorKey: 'invite',
  },
  gsRoles: {
    id: 'gsRoles', type: 'action',
    title: 'Set Up Roles & Permissions',
    description: 'Define what each member can do, from read-only viewer to signer.',
    time: '3 min', colorKey: 'roles',
  },
  gsCompliance: {
    id: 'gsCompliance', type: 'explore',
    title: 'Review Compliance Status',
    description: 'Check KYB and KYC status and resolve any outstanding compliance items.',
    time: '2 min', colorKey: 'compliance',
  },
  gsReporting: {
    id: 'gsReporting', type: 'explore',
    title: 'Explore Reporting & Audits',
    description: 'Access full transaction history, audit logs, and exportable compliance reports.',
    time: '2 min', colorKey: 'reporting',
  },
  gsVerify: {
    id: 'gsVerify', type: 'action',
    title: 'Complete Video Verification',
    description: 'Complete a short video session to unlock full platform access.',
    time: '5 min', colorKey: 'verify',
  },
  gsTrading: {
    id: 'gsTrading', type: 'explore',
    title: 'Set Up Trading Workflow',
    description: 'Configure your Go Account strategy for off-exchange liquidity and trading.',
    time: '2 min', colorKey: 'trading',
  },
  // ── super user ───────────────────────────────────────────────────────
  gsGoAccountFund: {
    id: 'gsGoAccountFund', type: 'action',
    title: 'Fund Go Account',
    description: 'Deposit cash or crypto to your Go Account to start trading.',
    time: '3 min', colorKey: 'deposit', isBusinessGoal: true,
  },
  gsFirstTrade: {
    id: 'gsFirstTrade', type: 'action',
    title: 'Complete Your First Trade',
    description: 'Instant off-exchange settlement with no on-chain wait or gas fees.',
    time: '2 min', colorKey: 'go-account', isBusinessGoal: true,
  },
  gsGoAccountStaking: {
    id: 'gsGoAccountStaking', type: 'explore',
    title: 'Try Go Account Staking',
    description: 'Earn rewards on idle assets held in your Go Account.',
    time: '1 min', colorKey: 'staking',
  },
  // ── org admin ────────────────────────────────────────────────────────
  gsViewOrgMembers: {
    id: 'gsViewOrgMembers', type: 'explore',
    title: 'View Org Members',
    description: 'See active users, their roles, and access levels in your org.',
    time: '1 min', colorKey: 'invite',
  },
  gsExploreRoles: {
    id: 'gsExploreRoles', type: 'explore',
    title: 'Explore User Roles',
    description: 'See what each role allows before your team goes live.',
    time: '2 min', colorKey: 'roles',
  },
  gsExplorePortfolio: {
    id: 'gsExplorePortfolio', type: 'explore',
    title: 'Explore Portfolio',
    description: 'View your total holdings and recent activity across all wallets.',
    time: '1 min', colorKey: 'wallet',
  },
  // ── ent admin / wallet admin ─────────────────────────────────────────
  gsUnderstandTasks: {
    id: 'gsUnderstandTasks', type: 'explore',
    title: 'Understand Tasks & Approval',
    description: 'Transactions over policy limits require approval before they can execute.',
    time: '2 min', colorKey: 'policy',
  },
  gsUnderstandPolicies: {
    id: 'gsUnderstandPolicies', type: 'explore',
    title: 'Understand Policies',
    description: 'Spend limits and multi-sig rules that actively protect your wallets.',
    time: '2 min', colorKey: 'policy',
  },
  // ── wallet spender ───────────────────────────────────────────────────
  gsInitiateTransaction: {
    id: 'gsInitiateTransaction', type: 'action',
    title: 'Initiate a Transaction',
    description: 'Send funds on-chain or settle instantly off-exchange with a counterparty.',
    time: '2 min', colorKey: 'transact',
  },
  gsUnderstandStaking: {
    id: 'gsUnderstandStaking', type: 'explore',
    title: 'Understand Staking',
    description: 'ETH, SOL, and more earn rewards while staying in BitGo custody.',
    time: '1 min', colorKey: 'staking',
  },
  // ── wallet viewer ────────────────────────────────────────────────────
  gsLearnDeposit: {
    id: 'gsLearnDeposit', type: 'explore',
    title: 'Learn How to Deposit',
    description: 'Fund a custody wallet via on-chain transfer or bank wire.',
    time: '1 min', colorKey: 'deposit',
  },
  gsTryReports: {
    id: 'gsTryReports', type: 'explore',
    title: 'Try Generating Reports',
    description: 'Export transaction history and audit logs for compliance and tax.',
    time: '2 min', colorKey: 'reporting',
  },
  // ── spec-aligned tasks ───────────────────────────────────────────────
  gsViewUMSTasks: {
    id: 'gsViewUMSTasks', type: 'explore',
    title: 'View UMS Tasks',
    description: 'Review pending tasks and approvals across all enterprise users.',
    time: '1 min', colorKey: 'policy',
  },
  gsViewEnterprisesWallets: {
    id: 'gsViewEnterprisesWallets', type: 'explore',
    title: 'View Enterprises & Wallets',
    description: 'Browse all enterprise accounts and wallet configurations in your org.',
    time: '2 min', colorKey: 'wallet',
  },
  gsAddBankAccount: {
    id: 'gsAddBankAccount', type: 'action',
    title: 'Add Bank Account',
    description: 'Link a bank account to enable cash deposits and withdrawals.',
    time: '3 min', colorKey: 'deposit',
  },
  gsExplorePolicies: {
    id: 'gsExplorePolicies', type: 'explore',
    title: 'Explore Policies',
    description: 'Review spend limits and approval rules protecting your wallets.',
    time: '2 min', colorKey: 'policy',
  },
  gsStartFirstTrade: {
    id: 'gsStartFirstTrade', type: 'action',
    title: 'Start First Trade',
    description: 'Place a buy or sell order using your Go Account balance.',
    time: '2 min', colorKey: 'go-account',
  },
  gsViewReports: {
    id: 'gsViewReports', type: 'explore',
    title: 'View Reports',
    description: 'Browse transaction history, audit logs, and compliance exports.',
    time: '2 min', colorKey: 'reporting',
  },
  gsViewTrades: {
    id: 'gsViewTrades', type: 'explore',
    title: 'View Trades',
    description: 'See your executed trades and Go Account performance history.',
    time: '1 min', colorKey: 'go-account',
  },
  gsCompleteVideoID: {
    id: 'gsCompleteVideoID', type: 'action',
    title: 'Complete Video ID',
    description: 'Complete a short video session to verify and approve actions.',
    time: '5 min', colorKey: 'verify',
  },
  gsUnderstandTasksApprovals: {
    id: 'gsUnderstandTasksApprovals', type: 'explore',
    title: 'Understand Tasks & Approvals',
    description: 'Learn how transactions above policy limits get reviewed and approved.',
    time: '2 min', colorKey: 'policy',
  },
  gsUnlockPolicy: {
    id: 'gsUnlockPolicy', type: 'explore',
    title: 'Unlock Policy Controls',
    description: 'Understand how policies are configured and who can approve changes.',
    time: '2 min', colorKey: 'policy',
  },
  gsViewActivityLog: {
    id: 'gsViewActivityLog', type: 'explore',
    title: 'View Activity Log',
    description: 'Audit transaction history and org-level activity for compliance.',
    time: '1 min', colorKey: 'reporting',
  },
  gsCompleteKYB: {
    id: 'gsCompleteKYB', type: 'action',
    title: 'Complete KYB',
    description: 'Submit entity documents to verify your business for compliance.',
    time: '10 min', colorKey: 'compliance',
  },
  gsCompleteKYC: {
    id: 'gsCompleteKYC', type: 'action',
    title: 'Complete KYC',
    description: 'Verify your identity to unlock full platform access.',
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

export const ROLE_TASKS: Record<UserRole, GsTask[]> = {
  super_user:     ['gsGoAccountFund', 'gsFirstTrade', 'gsWallet'],
  org_admin:      ['gsViewOrgMembers', 'gsViewUMSTasks', 'gsViewEnterprisesWallets'],
  ent_admin:      ['gsWallet', 'gsAddBankAccount', 'gsExplorePolicies'],
  wallet_admin:   ['gsGoAccountFund', 'gsExplorePortfolio', 'gsExplorePolicies'],
  wallet_spender: ['gsGoAccountFund', 'gsExplorePortfolio', 'gsStartFirstTrade'],
  wallet_viewer:  ['gsGoAccountFund', 'gsExplorePortfolio', 'gsViewReports'],
  wallet_trader:  ['gsFirstTrade', 'gsViewTrades'],
  video_id_user:  ['gsCompleteVideoID', 'gsUnderstandTasksApprovals', 'gsUnlockPolicy'],
  auditor:        ['gsViewActivityLog'],
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
