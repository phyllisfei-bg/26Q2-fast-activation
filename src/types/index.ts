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

export const GS_TASKS = ['gsWallet', 'gsDeposit', 'gsGoAccount'] as const;
export type GsTask = typeof GS_TASKS[number];

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
