// ─── AI chat rich-response model + sample data ──────────────────────
// Demonstrates the response variants from the design specs:
// plain rich text, data-insight cards, tables, and charts — each with
// an expandable step-by-step "thought process".

export interface ThoughtStep {
  header: string;
  desc: string;
}

// Inline span types for paragraph content
export type Span =
  | string                                  // plain text
  | { link: string; href?: string }         // underlined link
  | { mono: string }                        // monospace w/ background
  | { ref: string; href?: string };         // clickable reference chip e.g. "BitGo Docs +2"

// Icon keyword for action cards → an inline glyph (see AIResponse `actionIcon`).
export type ActionIcon = 'wallet' | 'deposit' | 'trade' | 'policy' | 'shield' | 'stake';

// A single proposed agent action: user approves it, it "runs", then leaves a receipt.
export interface ActionItem {
  id: string;
  icon?: ActionIcon;
  title: string;
  desc: string;
  cta: string;     // button label, e.g. "Create wallet"
  done: string;    // receipt line shown after it runs, e.g. "Hot wallet created"
}

// A selectable recommendation in an `options` block.
export interface OptionItem {
  id: string;
  title: string;
  desc?: string;
  rules?: string[];   // optional bullet rules shown inside the card
}

export type Block =
  | { kind: 'heading'; text: string; underline?: boolean }
  | { kind: 'paragraph'; spans: Span[] }
  | { kind: 'bullets'; intro?: string; items: { bold: string; rest: string }[] }
  | { kind: 'dataCards'; cards: { label: string; value: string }[] }
  | { kind: 'table'; title?: string; columns: string[]; rows: string[][] }
  | { kind: 'chart'; title?: string; bars: { label: string; value: number }[] }
  | { kind: 'followup'; text: string }
  // ── Interactive (ideal mode only) ──
  // Agent actions the assistant can run on the user's behalf (approve → run → receipt + undo).
  | { kind: 'actions'; intro?: string; items: ActionItem[] }
  // A selectable list of recommendations with a batch apply. `appliedText` may contain "{n}".
  | { kind: 'options'; intro?: string; multi?: boolean; applyLabel?: string; appliedText?: string; options: OptionItem[] }
  // Clickable follow-up prompts that continue the conversation.
  | { kind: 'quickReplies'; replies: string[] };

// Block kinds that are interactive — rendered only in ideal mode.
export const INTERACTIVE_KINDS = ['actions', 'options', 'quickReplies'] as const;
export function isInteractive(kind: Block['kind']): boolean {
  return (INTERACTIVE_KINDS as readonly string[]).includes(kind);
}

export interface AIResponse {
  thought: ThoughtStep[];
  blocks: Block[];
}

// Shared sample prompts — used by both the chat idle state and the search modal.
export const SAMPLE_PROMPTS = [
  'What can you do?',
  'How do I create a new wallet?',
  'Show me my recent transactions',
];

// Variant: capabilities overview — "What can you do?"
const RESPONSE_CAPABILITIES: AIResponse = {
  thought: [
    { header: 'Reviewing my capabilities', desc: 'Checking the tools and data I can access for your enterprise.' },
    { header: 'Organizing by category', desc: 'Grouping what I can help with into clear areas.' },
    { header: 'Preparing an overview', desc: 'Summarizing how I can assist you.' },
  ],
  blocks: [
    { kind: 'paragraph', spans: ['I am your BitGo enterprise assistant. I can answer questions, guide you through workflows, surface insights, and take actions on your behalf — all from this chat.'] },
    {
      kind: 'bullets',
      intro: 'Here is what I can do:',
      items: [
        { bold: 'Answer questions', rest: ' — ask anything about your enterprise, wallets, balances, or policies.' },
        { bold: 'Guide you step by step', rest: ' — walk through setup flows like creating a wallet or funding your account.' },
        { bold: 'Navigate instantly', rest: ' — jump straight to any workflow or page without hunting through menus.' },
        { bold: 'Surface insights', rest: ' — query your data and turn it into summaries, tables, and charts.' },
        { bold: 'Execute actions', rest: ' — start transfers, trades, or policy changes, always with your approval.' },
      ],
    },
    { kind: 'heading', text: 'Try Asking' },
    { kind: 'followup', text: 'What would you like to start with?' },
    { kind: 'quickReplies', replies: ['Show me my recent transactions', 'Recommend policies for my enterprise', 'Fund my Go Account', 'How do I create a wallet?'] },
  ],
};

// Variant: plain rich text — "How do I create a new wallet?"
const RESPONSE_TEXT: AIResponse = {
  thought: [
    { header: 'Reviewing your enterprise setup', desc: 'Checked your roles, enabled assets, and existing wallets.' },
    { header: 'Matching to wallet options', desc: 'Compared self-managed hot/cold wallets against qualified custody for your tier.' },
    { header: 'Preparing recommendations', desc: 'Drafted the fastest path to your first wallet.' },
  ],
  blocks: [
    { kind: 'heading', text: 'Creating Your First Wallet' },
    { kind: 'paragraph', spans: ['You can spin up a wallet in a few minutes. Start from ', { link: 'Wallets → Create Wallet' }, ' on the dashboard.'] },
    { kind: 'paragraph', spans: ['Most enterprises begin with a ', { mono: 'hot wallet' }, ' for everyday transfers and add cold storage later.'] },
    { kind: 'heading', text: 'Recommended Setup', underline: true },
    { kind: 'paragraph', spans: ['Based on your enterprise profile, a multi-signature hot wallet is the best fit.', { ref: 'BitGo Docs +2' }] },
    {
      kind: 'bullets',
      intro: 'Here is what you will configure:',
      items: [
        { bold: 'Key management', rest: ' — BitGo holds one key, you hold two, so you keep full control.' },
        { bold: 'Supported assets', rest: ' — BTC, ETH, and 700+ other coins and tokens.' },
        { bold: 'Spending policies', rest: ' — set approval thresholds before any funds can move.' },
      ],
    },
    {
      kind: 'actions',
      intro: 'I can set these up for you:',
      items: [
        { id: 'create-hot', icon: 'wallet', title: 'Create a hot wallet', desc: 'Multi-signature, ready for everyday transfers.', cta: 'Create wallet', done: 'Hot wallet created and ready to fund.' },
        { id: 'add-policy', icon: 'policy', title: 'Add a spending policy', desc: 'Require approvals above a threshold before funds move.', cta: 'Set policy', done: 'Spending policy added to the wallet.' },
      ],
    },
    { kind: 'quickReplies', replies: ['Recommend policies for my enterprise', 'What assets are supported?', 'Fund my Go Account'] },
  ],
};

// Variant: agent actions — "Fund my Go Account" / deposit
const RESPONSE_DEPOSIT: AIResponse = {
  thought: [
    { header: 'Checking your Go Account', desc: 'Confirmed your account is verified and ready to receive funds.' },
    { header: 'Preparing funding options', desc: 'Gathered the fastest cash and crypto deposit paths for your tier.' },
  ],
  blocks: [
    { kind: 'paragraph', spans: ['You can fund your Go Account in a couple of minutes. I can start a deposit for you now.'] },
    {
      kind: 'actions',
      items: [
        { id: 'deposit-cash', icon: 'deposit', title: 'Deposit cash', desc: 'Wire USD to your Go Account.', cta: 'Start deposit', done: 'Wire instructions generated — check your email.' },
        { id: 'deposit-crypto', icon: 'deposit', title: 'Deposit crypto', desc: 'Send BTC, ETH, or 700+ assets to a deposit address.', cta: 'Get address', done: 'Deposit address generated and copied.' },
      ],
    },
    { kind: 'followup', text: 'Once funds land, I can help you place your first trade.' },
    { kind: 'quickReplies', replies: ['What is the minimum deposit?', 'Show supported assets', 'Make my first trade'] },
  ],
};

// Variant: selectable recommendations — "Recommend policies"
const RESPONSE_POLICIES: AIResponse = {
  thought: [
    { header: 'Reviewing your activity', desc: 'Analyzed transfer patterns, counterparties, and approval history.' },
    { header: 'Matching to policy templates', desc: 'Compared your profile against common enterprise controls.' },
    { header: 'Ranking recommendations', desc: 'Prioritized the highest-impact policies for your enterprise.' },
  ],
  blocks: [
    { kind: 'paragraph', spans: ['Based on your enterprise profile, here are three policies I recommend. Select the ones you want and I will apply them.'] },
    {
      kind: 'options',
      intro: 'Recommended policies',
      multi: true,
      applyLabel: 'Apply selected policies',
      appliedText: 'Applied {n} policies to your enterprise.',
      options: [
        { id: 'p1', title: 'Withdrawal approval threshold', desc: 'Require multiple approvals for large withdrawals.', rules: ['Trigger: Withdrawal over $50,000', 'Require: 2 of 3 approvers'] },
        { id: 'p2', title: 'Daily velocity limit', desc: 'Cap total outbound value per day.', rules: ['Trigger: Daily outbound over $250,000', 'Action: Block and notify admins'] },
        { id: 'p3', title: 'Whitelist-only withdrawals', desc: 'Allow withdrawals only to approved addresses.', rules: ['Trigger: Withdrawal to a new address', 'Action: Require whitelist first'] },
      ],
    },
    { kind: 'followup', text: 'Want me to simulate their impact on last month of activity?' },
    { kind: 'quickReplies', replies: ['Simulate the impact', 'Explain the velocity limit', 'Show my recent transactions'] },
  ],
};

// Variant: data-insight cards — "Summarize my key metrics"
const RESPONSE_DATA: AIResponse = {
  thought: [
    { header: 'Gathering account data', desc: 'Pulled balances across all wallets and your Go Account.' },
    { header: 'Calculating totals', desc: 'Aggregated holdings and 24-hour changes by asset.' },
    { header: 'Summarizing', desc: 'Highlighted the figures that matter most today.' },
  ],
  blocks: [
    {
      kind: 'dataCards',
      cards: [
        { label: 'Total balance', value: '$14.67M' },
        { label: 'Assets held', value: '12' },
        { label: '24h change', value: '+2.4%' },
      ],
    },
    { kind: 'heading', text: 'Portfolio Snapshot' },
    { kind: 'paragraph', spans: ['Your enterprise holds ', { mono: '$14.67M' }, ' across 12 assets, with BTC and ETH making up most of the portfolio.'] },
    { kind: 'paragraph', spans: ['See the full breakdown in ', { link: 'Portfolio' }, '.'] },
    { kind: 'heading', text: 'Notable Movements', underline: true },
    { kind: 'paragraph', spans: ['Ethereum is up 4.1% over the last 24 hours, leading your gains today.', { ref: 'Market data +1' }] },
    {
      kind: 'bullets',
      intro: 'Quick highlights:',
      items: [
        { bold: 'Largest holding', rest: ' — Bitcoin at $5.3M, about 36% of your portfolio.' },
        { bold: 'Best performer', rest: ' — Ethereum, up 4.1% today.' },
        { bold: 'Idle cash', rest: ' — $1.2M available to deploy or stake.' },
      ],
    },
    { kind: 'followup', text: 'Want me to suggest ways to put your idle cash to work?' },
  ],
};

// Variant: table — "Show me my recent transactions"
const RESPONSE_TABLE: AIResponse = {
  thought: [
    { header: 'Locating recent activity', desc: 'Queried transactions across all wallets from the last 7 days.' },
    { header: 'Sorting and filtering', desc: 'Ordered by date and removed pending dust transfers.' },
    { header: 'Formatting results', desc: 'Built a summary table of your latest transactions.' },
  ],
  blocks: [
    {
      kind: 'table',
      title: 'Recent Transactions',
      columns: ['Date', 'Type', 'Asset', 'Amount', 'Status'],
      rows: [
        ['May 27', 'Deposit', 'BTC', '+0.45 BTC', 'Confirmed'],
        ['May 26', 'Withdrawal', 'ETH', '−12.0 ETH', 'Confirmed'],
        ['May 24', 'Trade', 'USDC → BTC', '$250,000', 'Settled'],
        ['May 22', 'Deposit', 'USDC', '+$500,000', 'Confirmed'],
      ],
    },
    { kind: 'paragraph', spans: ['You had ', { mono: '4 transactions' }, ' in the past week, totaling roughly $1.1M in volume.'] },
    { kind: 'paragraph', spans: ['View the complete history in ', { link: 'Reports → Activity Log' }, '.'] },
    { kind: 'followup', text: 'Want me to export these to a CSV report?' },
  ],
};

// Variant: chart — "Show me the trend over time"
const RESPONSE_CHART: AIResponse = {
  thought: [
    { header: 'Pulling historical balances', desc: 'Retrieved monthly enterprise value for the past 6 months.' },
    { header: 'Computing the trend', desc: 'Calculated month-over-month change and overall growth rate.' },
    { header: 'Rendering the chart', desc: 'Plotted total enterprise value by month.' },
  ],
  blocks: [
    {
      kind: 'chart',
      title: 'Enterprise Value — Last 6 Months ($M)',
      bars: [
        { label: 'Dec', value: 9.2 },
        { label: 'Jan', value: 10.4 },
        { label: 'Feb', value: 11.1 },
        { label: 'Mar', value: 12.8 },
        { label: 'Apr', value: 13.5 },
        { label: 'May', value: 14.7 },
      ],
    },
    { kind: 'paragraph', spans: ['Your enterprise value grew from ', { mono: '$9.2M' }, ' to $14.7M over six months — a 60% increase.'] },
    { kind: 'paragraph', spans: ['Detailed reporting is available in ', { link: 'Reports' }, '.'] },
    { kind: 'followup', text: 'Want me to break this growth down by asset class?' },
  ],
};

const VARIANTS: AIResponse[] = [RESPONSE_TEXT, RESPONSE_DATA, RESPONSE_TABLE, RESPONSE_CHART];

// Pick a response: keyword-driven when possible, else rotate through variants.
// Word boundaries prevent false matches (e.g. "growth" containing "row").
export function pickResponse(prompt: string, turn: number): AIResponse {
  const p = prompt.toLowerCase();
  if (/what can you do|what do you do|capabilities|what can this|how can you help/.test(p)) return RESPONSE_CAPABILITIES;
  if (/\b(deposit|deposits|fund|funding|add funds)\b/.test(p)) return RESPONSE_DEPOSIT;
  if (/\b(polic(y|ies)|recommend|recommendation|compliance|approval|whitelist|controls?)\b/.test(p)) return RESPONSE_POLICIES;
  if (/\b(chart|trend|trends|graph|growth|over time)\b/.test(p)) return RESPONSE_CHART;
  if (/\b(transactions?|history|activity|recent|table|rows?)\b/.test(p)) return RESPONSE_TABLE;
  if (/\b(data|insights?|metrics?|summary|balance|balances|portfolio|total|how much)\b/.test(p)) return RESPONSE_DATA;
  if (/\b(wallet|wallets|create|set ?up|get started|how do i)\b/.test(p)) return RESPONSE_TEXT;
  return VARIANTS[turn % VARIANTS.length];
}
