import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Topbar } from '../components/Topbar';

type DestTab = 'addresses' | 'wallets' | 'enterprise';

interface Destination {
  id: string;
  label: string;
  address: string;
  coin: string;
  coinColor: string;
  coinBg: string;
  scopes: string[];
  status: 'active' | 'pending';
  groupId?: string;
}

const DESTINATIONS: Destination[] = [
  // ── 2-label group: BTC cold storage ────────────────────────────────
  {
    id: 'a1', groupId: 'grp-btc-cold',
    label: 'Cold Storage Main',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    coin: 'BTC', coinColor: '#F7931A', coinBg: '#FFF3E0',
    scopes: ['All Custodial Wallets', 'Treasury Wallet'], status: 'active',
  },
  {
    id: 'a2', groupId: 'grp-btc-cold',
    label: 'Treasury Reserve',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    coin: 'BTC', coinColor: '#F7931A', coinBg: '#FFF3E0',
    scopes: ['CFO Custody', 'Cold Vault A'], status: 'active',
  },

  // ── 5-label group: ETH operating address ───────────────────────────
  {
    id: 'b1', groupId: 'grp-eth-ops',
    label: 'ETH Operating Wallet',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['Operations Hot Wallet'], status: 'active',
  },
  {
    id: 'b2', groupId: 'grp-eth-ops',
    label: 'Payroll Distribution',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['HR Wallet', 'Finance Desk'], status: 'active',
  },
  {
    id: 'b3', groupId: 'grp-eth-ops',
    label: 'Vendor Settlement',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['AP Wallet'], status: 'active',
  },
  {
    id: 'b4', groupId: 'grp-eth-ops',
    label: 'Emergency Liquidity',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['Risk Management'], status: 'pending',
  },
  {
    id: 'b5', groupId: 'grp-eth-ops',
    label: 'Bridge Collateral',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['DeFi Bridge', 'L2 Relay'], status: 'active',
  },

  // ── 11-label group: USDC treasury address ──────────────────────────
  {
    id: 'c1', groupId: 'grp-usdc-main',
    label: 'USDC Treasury Main',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Finance Vault', 'All Custodial Wallets'], status: 'active',
  },
  {
    id: 'c2', groupId: 'grp-usdc-main',
    label: 'Stablecoin Reserve',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Risk Reserve Wallet'], status: 'active',
  },
  {
    id: 'c3', groupId: 'grp-usdc-main',
    label: 'Yield Optimization',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['DeFi Yield Wallet'], status: 'active',
  },
  {
    id: 'c4', groupId: 'grp-usdc-main',
    label: 'Liquidity Buffer A',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['MM Desk Wallet'], status: 'active',
  },
  {
    id: 'c5', groupId: 'grp-usdc-main',
    label: 'OTC Settlement',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['OTC Desk', 'Prime Brokerage'], status: 'active',
  },
  {
    id: 'c6', groupId: 'grp-usdc-main',
    label: 'Prime Brokerage Collateral',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Prime Wallet A'], status: 'active',
  },
  {
    id: 'c7', groupId: 'grp-usdc-main',
    label: 'Payroll USDC',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['HR Wallet'], status: 'active',
  },
  {
    id: 'c8', groupId: 'grp-usdc-main',
    label: 'Insurance Fund',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Risk Management'], status: 'active',
  },
  {
    id: 'c9', groupId: 'grp-usdc-main',
    label: 'Margin Account',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Trading Desk'], status: 'pending',
  },
  {
    id: 'c10', groupId: 'grp-usdc-main',
    label: 'Cross-chain Bridge',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['L2 Bridge Wallet', 'Arbitrum Relay'], status: 'active',
  },
  {
    id: 'c11', groupId: 'grp-usdc-main',
    label: 'Arbitrage Reserve',
    address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    coin: 'USDC', coinColor: '#2775CA', coinBg: '#E8F1FB',
    scopes: ['Algo Trading Wallet'], status: 'active',
  },

  // ── Single-label addresses ──────────────────────────────────────────
  {
    id: 's1',
    label: 'BTC Staking Vault',
    address: 'bc1p5d7rjq925snlakguwn36ltzrm0lrg9t7gvf7ex',
    coin: 'BTC', coinColor: '#F7931A', coinBg: '#FFF3E0',
    scopes: ['Staking Pool Wallet'], status: 'active',
  },
  {
    id: 's2',
    label: 'Mining Pool Rewards',
    address: 'DPS9aZMsNahSqG1ZBfpXekHs7oGkBbhkHf',
    coin: 'DOGE', coinColor: '#C2A633', coinBg: '#FFFDE7',
    scopes: ['Mining Wallet', 'All Custodial Wallets'], status: 'active',
  },
  {
    id: 's3',
    label: 'Gas Fee Reserve',
    address: '0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43',
    coin: 'ETH', coinColor: '#627EEA', coinBg: '#EEF2FF',
    scopes: ['Operations Hot Wallet'], status: 'active',
  },
  {
    id: 's4',
    label: 'OTC Desk Collateral',
    address: 'bc1qcxadrfvl7gv25k7hfmjqy5n6p9d2egl70kfhx',
    coin: 'BTC', coinColor: '#F7931A', coinBg: '#FFF3E0',
    scopes: ['OTC Desk'], status: 'active',
  },
  {
    id: 's5',
    label: 'SUI Validator Stake',
    address: '0x4e306d3f4d392e6bb28b7ebf8a9d4e5f6c7b8a91',
    coin: 'SUI', coinColor: '#4DA2FF', coinBg: '#E3F2FD',
    scopes: ['Staking Pool Wallet'], status: 'pending',
  },
];

// Pre-compute groups that have multiple labels
const MULTI_LABEL_GROUPS = (() => {
  const map = new Map<string, Destination[]>();
  DESTINATIONS.forEach(d => {
    if (d.groupId) {
      if (!map.has(d.groupId)) map.set(d.groupId, []);
      map.get(d.groupId)!.push(d);
    }
  });
  return Array.from(map.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([groupId, rows]) => ({ groupId, rows }));
})();

function truncateAddr(addr: string): string {
  if (addr.length <= 18) return addr;
  return addr.slice(0, 10) + '...' + addr.slice(-6);
}

const CoinIcon: React.FC<{ coin: string; color: string; bg: string }> = ({ coin, color, bg }) => (
  <div
    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
    style={{ background: bg }}
  >
    <span style={{ color, fontSize: coin.length > 3 ? 7 : 9, fontWeight: 700 }}>{coin.slice(0, 4)}</span>
  </div>
);

interface Props {
  isLight: boolean;
  onThemeToggle: () => void;
}

type ConsolPhase = 'idle' | 'labels' | 'collapse' | 'scope';

const TH = 'px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] bg-[#F5F6F7] border-b border-[var(--color-border)]';

export const DestinationsPage: React.FC<Props> = ({ isLight, onThemeToggle }) => {
  const [tab, setTab] = useState<DestTab>('addresses');
  const [search, setSearch] = useState('');

  // Mutable local copy of destinations so consolidation edits are reflected live
  const [localDests, setLocalDests] = useState<Destination[]>(() => DESTINATIONS.map(d => ({ ...d })));

  const [consolidating, setConsolidating] = useState(false);
  const [groupIdx, setGroupIdx] = useState(0);
  const [doneGroups, setDoneGroups] = useState<Set<string>>(new Set());
  const [customLabel, setCustomLabel] = useState('');
  const [selectedChip, setSelectedChip] = useState('');
  const [modalPos, setModalPos] = useState({ top: 0, left: 0, width: 0 });
  const [consolPhase, setConsolPhase] = useState<ConsolPhase>('idle');
  const [collapsingIds, setCollapsingIds] = useState<Set<string>>(new Set());
  const [animatingScopes, setAnimatingScopes] = useState<Set<string>>(new Set());
  const [animatingLabels, setAnimatingLabels] = useState<Map<string, string>>(new Map());
  const [cursorVisible, setCursorVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lastActiveRowRef = useRef<HTMLTableRowElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cursorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On group change: scroll just enough so last active row + modal fit,
  // then store viewport-relative coords for the fixed-position modal.
  useEffect(() => {
    if (!consolidating || consolPhase !== 'idle') return;
    const raf = requestAnimationFrame(() => {
      if (!lastActiveRowRef.current || !contentRef.current) return;
      const container = contentRef.current;
      const containerRect = container.getBoundingClientRect();
      const MODAL_HEIGHT = 340;
      const TOP_PAD = 24;
      const BOTTOM_PAD = 48;

      // Row's absolute bottom offset within the scrollable container
      const rowOffsetBottom =
        lastActiveRowRef.current.getBoundingClientRect().bottom -
        containerRect.top +
        container.scrollTop;

      // Minimum scrollTop that fits row + modal inside the container
      const minScrollTop = rowOffsetBottom + MODAL_HEIGHT + BOTTOM_PAD - container.clientHeight;
      if (minScrollTop > container.scrollTop) {
        container.scrollTop = minScrollTop;
      }

      // Re-measure (instant scroll already applied) → store fixed coords
      const updatedRow = lastActiveRowRef.current.getBoundingClientRect();
      const desiredTop = updatedRow.bottom + 8;
      // Clamp so the modal always has at least BOTTOM_PAD clearance from viewport bottom
      const clampedTop = Math.min(desiredTop, window.innerHeight - MODAL_HEIGHT - BOTTOM_PAD);
      setModalPos({
        top: Math.max(clampedTop, containerRect.top + TOP_PAD),
        left: updatedRow.left,
        width: updatedRow.width,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [groupIdx, consolidating, consolPhase]);

  const currentGroup = consolidating ? MULTI_LABEL_GROUPS[groupIdx] : null;

  const displayed = consolidating
    ? localDests
    : localDests.filter(d => {
        const q = search.toLowerCase();
        return !q
          || d.address.toLowerCase().includes(q)
          || d.label.toLowerCase().includes(q)
          || d.coin.toLowerCase().includes(q);
      });

  const handleStartConsolidate = () => {
    // Resume from first group that hasn't been consolidated yet
    const firstRemaining = MULTI_LABEL_GROUPS.findIndex(g => !doneGroups.has(g.groupId));
    setGroupIdx(firstRemaining >= 0 ? firstRemaining : 0);
    setCustomLabel('');
    setSelectedChip('');
    setConsolPhase('idle');
    setConsolidating(true);
  };

  const handleClose = () => {
    if (cursorTimerRef.current) clearInterval(cursorTimerRef.current);
    setConsolidating(false);
    setConsolPhase('idle');
    setCollapsingIds(new Set());
    setAnimatingScopes(new Set());
    setAnimatingLabels(new Map());
    setCursorVisible(false);
    setCustomLabel('');
    setSelectedChip('');
    setGroupIdx(0);
  };

  const handleChipClick = (label: string) => {
    setSelectedChip(label);
    setCustomLabel(label);
  };

  const handleInputChange = (v: string) => {
    setCustomLabel(v);
    setSelectedChip('');
  };

  const suggestedLabel = currentGroup ? currentGroup.rows[0].label : '';

  const handleSkip = () => {
    if (groupIdx < MULTI_LABEL_GROUPS.length - 1) {
      setGroupIdx(g => g + 1);
      setCustomLabel('');
      setSelectedChip('');
    } else {
      setConsolidating(false);
    }
  };

  const remaining = MULTI_LABEL_GROUPS.length - doneGroups.size;
  const actionCardBody = doneGroups.size === 0
    ? `${remaining} address${remaining !== 1 ? 'es' : ''} each have multiple labels assigned. For best practices, consolidate each into a single label.`
    : `${remaining} address${remaining !== 1 ? 'es' : ''} still ${remaining !== 1 ? 'need' : 'needs'} label consolidation.`;

  const handleUpdateNext = () => {
    if (!currentGroup || consolPhase !== 'idle') return;
    const newLabel = customLabel.trim() || suggestedLabel;
    const groupId = currentGroup.groupId;

    const groupRows = localDests.filter(d => d.groupId === groupId);
    if (groupRows.length < 2) { handleSkip(); return; }
    const firstId = groupRows[0].id;
    const restIds = new Set(groupRows.slice(1).map(r => r.id));
    const allScopes = [...new Set(groupRows.flatMap(r => r.scopes))];
    const originalScopes = new Set(groupRows[0].scopes);
    const newScopes = allScopes.filter(s => !originalScopes.has(s));

    setConsolPhase('labels');

    // Build mutable text map for animation
    const texts = new Map(groupRows.map(r => [r.id, r.label]));
    setAnimatingLabels(new Map(texts));
    setCursorVisible(true);
    cursorTimerRef.current = setInterval(() => setCursorVisible(v => !v), 450);

    const DELETE_MS = 22;
    const TYPE_MS   = 32;

    const runDelete = (resolve: () => void) => {
      let anyLeft = false;
      texts.forEach((cur, id) => {
        if (cur.length > 0) { texts.set(id, cur.slice(0, -1)); anyLeft = true; }
      });
      setAnimatingLabels(new Map(texts));
      if (anyLeft) setTimeout(() => runDelete(resolve), DELETE_MS);
      else setTimeout(resolve, 120); // brief pause before typing
    };

    const runType = (step: number, resolve: () => void) => {
      const next = step + 1;
      texts.forEach((_, id) => texts.set(id, newLabel.slice(0, next)));
      setAnimatingLabels(new Map(texts));
      if (next < newLabel.length) setTimeout(() => runType(next, resolve), TYPE_MS);
      else resolve();
    };

    new Promise<void>(res => setTimeout(() => runDelete(res), DELETE_MS))
      .then(() => new Promise<void>(res => runType(0, res)))
      .then(() => {
        if (cursorTimerRef.current) clearInterval(cursorTimerRef.current);
        setCursorVisible(false);
        setAnimatingLabels(new Map());

        // Commit final labels to localDests
        setLocalDests(prev => prev.map(d =>
          d.groupId === groupId ? { ...d, label: newLabel } : d
        ));

        // Phase 2 — collapse rows 2..N
        setTimeout(() => {
          setConsolPhase('collapse');
          setCollapsingIds(restIds);

          setTimeout(() => {
            setLocalDests(prev =>
              prev
                .filter(d => !restIds.has(d.id))
                .map(d => d.id === firstId ? { ...d, scopes: allScopes } : d)
            );
            setCollapsingIds(new Set());

            // Phase 3 — scope chip animation
            setConsolPhase('scope');
            setAnimatingScopes(new Set(newScopes));

            setTimeout(() => {
              setAnimatingScopes(new Set());
              setConsolPhase('idle');
              setDoneGroups(prev => {
                const next = new Set([...prev, groupId]);
                const nextIdx = MULTI_LABEL_GROUPS.findIndex(
                  (g, i) => i > groupIdx && !next.has(g.groupId)
                );
                if (nextIdx >= 0) {
                  setGroupIdx(nextIdx);
                  setCustomLabel('');
                  setSelectedChip('');
                } else {
                  setConsolidating(false);
                  setGroupIdx(0);
                  setCustomLabel('');
                  setSelectedChip('');
                }
                return next;
              });
            }, 800);
          }, 700);
        }, 150);
      });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--color-level1)]">
      <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />

      <div className="flex-1 overflow-y-auto px-7 py-7" ref={contentRef}>
        {/* Page header */}
        <div className={`flex items-start justify-between mb-6${consolidating ? ' opacity-40 pointer-events-none' : ''}`}>
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Whitelist Destinations</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage whitelisted addresses, wallets, and enterprise-wide allowlists.</p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--brand-500)] text-sm font-semibold text-white border-none cursor-pointer hover:bg-[var(--brand-700)] transition-colors shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Action card — consolidate nudge (hidden when all groups are done) */}
        {doneGroups.size < MULTI_LABEL_GROUPS.length && (
          <div className={`flex items-center gap-3.5 py-3.5 px-[18px] mb-5 rounded-xl bg-white${consolidating ? ' opacity-25 pointer-events-none' : ''}`} style={{ border: '1px solid #EAECED' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--brand-a100)] text-[var(--brand-500)] shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-medium text-[var(--color-text)] mb-0.5">Consolidate Address Labels</div>
              <div className="text-[14px] text-[var(--color-text-secondary)]">{actionCardBody}</div>
            </div>
            <button
              className="border-none rounded-full px-[18px] py-2 text-[13.5px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors text-[var(--color-text)]"
              style={{ backgroundColor: 'rgba(40,89,234,0.2)' }}
              onClick={handleStartConsolidate}
            >
              Consolidate
            </button>
          </div>
        )}

        {/* Tabs + search row */}
        <div className={`flex items-center justify-between gap-4 border-b border-[var(--color-border)] mb-4${consolidating ? ' opacity-40 pointer-events-none' : ''}`}>
          <div className="flex">
            {(['addresses', 'wallets', 'enterprise'] as DestTab[]).map(t => (
              <button
                key={t}
                className={`h-9 px-4 text-sm font-medium cursor-pointer bg-transparent border-0 border-b-2 -mb-px transition-colors ${tab === t ? 'border-[var(--brand-500)] text-[var(--color-text)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
                onClick={() => setTab(t)}
              >
                {t === 'addresses' ? 'Addresses' : t === 'wallets' ? 'Wallets' : 'Enterprise Whitelist'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="dest-search-wrap flex items-center gap-2 h-9 px-4 rounded-full bg-white min-w-[180px]" style={{ border: '1px solid #E5E7EB' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-text-muted)] shrink-0">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="bg-transparent border-none outline-none text-sm text-[var(--color-text)] flex-1 w-36 placeholder:text-[var(--color-text-muted)]"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={consolidating}
              />
            </div>
            <button
              className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--brand-a100)] text-[var(--brand-500)] border-none text-sm font-medium cursor-pointer hover:bg-[var(--brand-a200)] transition-colors"
              disabled={consolidating}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-xl border border-[var(--color-border)]">
          <table className="dest-cols w-full table-fixed border-collapse">
            <thead className={consolidating ? 'opacity-40' : ''}>
              <tr>
                <th className={TH}>Destination</th>
                <th className={TH}>Network</th>
                <th className={TH}>Scope (Whitelisted On)</th>
                <th className={TH}>Status</th>
                <th className="px-4 py-3 bg-[#F5F6F7] border-b border-[var(--color-border)]"></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((d, idx) => {
                const isActive = !!currentGroup && d.groupId === currentGroup.groupId;
                const isCollapsing = collapsingIds.has(d.id);
                const nextRow = displayed[idx + 1];
                const isLastActive = isActive && !isCollapsing
                  && (!nextRow || nextRow.groupId !== currentGroup!.groupId || collapsingIds.has(nextRow.id));
                const rowClass = [
                  'dest-row',
                  consolidating && !isActive ? 'opacity-40' : '',
                  isCollapsing ? 'dest-row-collapsing' : '',
                ].filter(Boolean).join(' ');

                return (
                  <tr
                    key={d.id}
                    className={rowClass}
                    ref={isLastActive ? (el) => { lastActiveRowRef.current = el; } : undefined}
                    onMouseEnter={() => setHoveredId(d.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <td className="px-4 py-[14px] align-middle">
                      {isActive ? (
                        <div className="text-[16px] font-medium text-[var(--color-text)] mb-0.5 flex items-baseline gap-px">
                          <mark className="label-mark">{animatingLabels.get(d.id) ?? d.label}</mark>
                          {animatingLabels.has(d.id) && (
                            <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s', color: 'var(--color-text)', fontWeight: 300 }}>|</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[16px] font-medium text-[var(--color-text)] mb-0.5">{d.label}</div>
                      )}
                      <div className="flex items-center gap-[8px] mt-0.5">
                        <span className="text-[14px] text-[var(--color-text-secondary)] font-mono">{truncateAddr(d.address)}</span>
                        {hoveredId === d.id && (
                          <button
                            className="p-0 bg-transparent border-none cursor-pointer text-[var(--color-text-secondary)] flex items-center shrink-0"
                            title="Copy address"
                            onClick={() => navigator.clipboard.writeText(d.address)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2"/>
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-[14px] align-middle">
                      <div className="flex items-center gap-2">
                        <CoinIcon coin={d.coin} color={d.coinColor} bg={d.coinBg} />
                        <span className="text-[13.5px] font-medium text-[var(--color-text)]">{d.coin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-[14px] align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {d.scopes.slice(0, 3).map(s => (
                          <span
                            key={s}
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[#EBEBEB] text-[var(--color-text)] whitespace-nowrap${animatingScopes.has(s) ? ' chip-appear' : ''}`}
                          >{s}</span>
                        ))}
                        {d.scopes.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium bg-[#EBEBEB] text-[var(--color-text)] whitespace-nowrap">+{d.scopes.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-[14px] align-middle">
                      {d.status === 'pending' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-semibold text-[var(--color-gold)]">Pending Approval</span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-medium bg-[var(--color-level2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-[14px] align-middle">
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-level3)] hover:text-[var(--color-text)] transition-colors"
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consolidate modal — fixed in viewport, stays put while user scrolls the table */}
      {consolidating && consolPhase === 'idle' && currentGroup && ReactDOM.createPortal(
        <div
          className="bg-white border border-[var(--color-border)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,.18)] max-w-[520px] px-5 pt-5 pb-4 animate-[gsFadeIn_.15s_ease_both]"
          style={{ position: 'fixed', top: modalPos.top, left: modalPos.left, width: modalPos.width, zIndex: 500 }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[20px] font-normal text-[var(--color-text)]">Consolidate</span>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] hover:bg-[var(--color-level3)] hover:text-[var(--color-text)] transition-colors"
              onClick={handleClose}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <label className="block text-[14px] font-normal text-[var(--color-text-secondary)] mb-2">Consolidated Label</label>
          <input
            className="w-full box-border bg-white rounded-xl px-[16px] py-[16px] text-[15px] text-[var(--color-text)] outline-none mb-3 placeholder:text-[var(--color-text-muted)]"
            style={{ border: '1px solid #DBDDDF' }}
            onFocus={e => (e.currentTarget.style.border = '1.5px solid var(--brand-500)')}
            onBlur={e => (e.currentTarget.style.border = '1px solid #DBDDDF')}
            placeholder={`System recommended: ${suggestedLabel}`}
            value={customLabel}
            onChange={e => handleInputChange(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
            <span className="text-[13.5px] font-medium text-[var(--color-text)] whitespace-nowrap shrink-0">Or select from:</span>
            {currentGroup.rows.map(r => (
              <button
                key={r.id}
                className={`px-[14px] py-[6px] rounded-lg text-[13.5px] font-medium cursor-pointer transition-colors ${selectedChip === r.label ? 'bg-[var(--brand-a100)] text-[var(--brand-500)] font-semibold' : 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
                style={{ border: selectedChip === r.label ? '1.5px solid var(--brand-500)' : '1px solid #D3D6D9' }}
                onClick={() => handleChipClick(r.label)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-[12.5px] text-[var(--color-text-muted)]">
              Group {groupIdx + 1} of {MULTI_LABEL_GROUPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="bg-transparent border-none cursor-pointer text-[13.5px] font-medium text-[var(--color-text-secondary)] px-3 py-2 rounded-lg hover:text-[var(--color-text)] hover:bg-[var(--color-level3)] transition-colors"
                onClick={handleSkip}
              >Skip</button>
              <button
                className="h-9 px-[18px] rounded-full text-[13.5px] font-semibold bg-[var(--brand-500)] text-white border-none cursor-pointer hover:bg-[var(--brand-700)] transition-colors"
                onClick={handleUpdateNext}
              >
                {groupIdx < MULTI_LABEL_GROUPS.length - 1 ? 'Update & Next' : 'Update & Finish'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
