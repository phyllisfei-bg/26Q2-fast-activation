import React, { useState, useEffect, useRef } from 'react';
import type { AIResponse as AIResponseData, Block, Span, ThoughtStep } from './aiChatResponses';
import { isInteractive } from './aiChatResponses';
import type { PolicyDraft } from '../types';
import { AiStar } from './AiShield';

const LOGO = `${import.meta.env.BASE_URL}bitgo-logo.png`;

// ─── helpers ────────────────────────────────────────────────────────
function spanText(s: Span): string {
  if (typeof s === 'string') return s;
  if ('link' in s) return s.link;
  if ('mono' in s) return s.mono;
  return s.ref;
}

// Typewriter that reveals `total` characters, then calls onDone once.
function useTyper(total: number, onDone: () => void, perTick = 4): number {
  const [chars, setChars] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    setChars(0);
    if (total === 0) { doneRef.current(); return; }
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(total, n + perTick);
      setChars(n);
      if (n >= total) { clearInterval(id); doneRef.current(); }
    }, 18);
    return () => clearInterval(id);
  }, [total]);
  return chars;
}

// Render spans up to `chars` characters revealed (ref chips appear whole once reached).
const RevealedSpans: React.FC<{ spans: Span[]; chars: number }> = ({ spans, chars }) => {
  let remaining = chars;
  const out: React.ReactNode[] = [];
  spans.forEach((s, i) => {
    const text = spanText(s);
    const start = remaining;
    remaining -= text.length;
    if (start <= 0) return;                 // not yet reached
    const visible = text.slice(0, start);
    if (typeof s === 'string') { out.push(<React.Fragment key={i}>{visible}</React.Fragment>); return; }
    if ('link' in s) { out.push(<a key={i} className="ai-resp-link" href={s.href ?? '#'} onClick={e => e.preventDefault()}>{visible}</a>); return; }
    if ('mono' in s) { out.push(<code key={i} className="ai-resp-mono">{visible}</code>); return; }
    // ref chip — show whole as soon as reached
    out.push(
      <a key={i} className="ai-resp-ref" href={s.href ?? 'https://www.bitgo.com'} target="_blank" rel="noreferrer" title={`Open source: ${s.ref}`}>
        <img src={LOGO} alt="" aria-hidden="true" className="ai-resp-ref-logo" />{s.ref}
      </a>
    );
  });
  return <>{out}</>;
};

// Skeleton primitives
const SkLine: React.FC<{ w: string; h?: number; mt?: number }> = ({ w, h = 12, mt = 0 }) => (
  <div className="ai-sk" style={{ width: w, height: h, marginTop: mt }} />
);

// ─── Thought process ──
// `variant` controls the in-progress ("thinking") animation only:
//   'ideal'   → star + "Thinking…" + steps stream in below (skeleton → text)
//   'current' → star + a single shimmering line that swaps to each step's name
// Once done, both variants collapse to the same expandable "Thought process".
export const ThoughtProcess: React.FC<{ steps: ThoughtStep[]; thinking?: boolean; variant?: 'ideal' | 'current' }> = ({ steps, thinking = false, variant = 'ideal' }) => {
  const [open, setOpen] = useState(thinking);            // collapsed once done; user expands via chevron
  const [shown, setShown] = useState(thinking ? 0 : steps.length);
  const [skeleton, setSkeleton] = useState(thinking);
  const [activeStep, setActiveStep] = useState(0);       // 'current' variant: which step name is shown

  // 'ideal': stream each step as skeleton → text
  useEffect(() => {
    if (!thinking) { setShown(steps.length); setSkeleton(false); return; }
    if (variant !== 'ideal') return;
    setShown(0); setSkeleton(true);
    let cancelled = false;
    let i = 0;
    const run = () => {
      if (cancelled) return;
      setSkeleton(true);                                  // step loads as skeleton…
      setTimeout(() => {
        if (cancelled) return;
        i += 1;
        setShown(i);                                      // …then resolves to text
        if (i >= steps.length) { setSkeleton(false); return; }
        setTimeout(run, 250);
      }, 520);
    };
    run();
    return () => { cancelled = true; };
  }, [thinking, variant, steps]);

  // 'current': advance the single live label through each step name
  useEffect(() => {
    if (!thinking || variant !== 'current') return;
    setActiveStep(0);
    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      if (i >= steps.length) return;                      // hold on the last step until thinking ends
      setActiveStep(i);
      timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 3000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [thinking, variant, steps]);

  // 'current' variant while thinking: reuse the ideal toggle row (identical alignment);
  // the label is one shimmering line that swaps to each step name.
  if (thinking && variant === 'current') {
    return (
      <div className="ai-thought">
        <div className="ai-thought-toggle ai-thought-live">
          <AiStar size={16} className="ai-chat-thinking-star" />
          <span key={activeStep} className="ai-thought-label thinking ai-thought-live-step">
            {steps[activeStep]?.header ?? 'Thinking...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-thought">
      <button className="ai-thought-toggle" onClick={() => setOpen(o => !o)}>
        {thinking && <AiStar size={16} className="ai-chat-thinking-star" />}
        <span className={`ai-thought-label${thinking ? ' thinking' : ''}`}>
          {thinking ? 'Thinking...' : 'Thought process'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="ai-thought-steps">
          {steps.slice(0, shown).map((s, i) => (
            <div key={i} className="ai-thought-step ai-stream-in">
              <div className="ai-thought-step-header">{s.header}</div>
              <div className="ai-thought-step-desc">{s.desc}</div>
            </div>
          ))}
          {thinking && skeleton && shown < steps.length && (
            <div className="ai-thought-step">
              <SkLine w="42%" />
              <SkLine w="72%" mt={7} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Static block (fully rendered) ──────────────────────────────────
const StaticBlock: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.kind) {
    case 'heading':
      return <h3 className="ai-resp-heading">{block.text}</h3>;
    case 'paragraph':
      return <p className="ai-resp-paragraph"><RevealedSpans spans={block.spans} chars={Infinity} /></p>;
    case 'bullets':
      return (
        <div className="ai-resp-bullets-wrap">
          {block.intro && <p className="ai-resp-paragraph">{block.intro}</p>}
          <ul className="ai-resp-bullets">
            {block.items.map((it, i) => <li key={i}><strong>{it.bold}</strong>{it.rest}</li>)}
          </ul>
        </div>
      );
    case 'dataCards':
      return <DataCardsView block={block} />;
    case 'table':
      return <TableView block={block} />;
    case 'chart':
      return <ChartView block={block} />;
    case 'followup':
      return <p className="ai-resp-followup"><em>{block.text}</em></p>;
    default:
      return null;
  }
};

// ─── Visual content views ───────────────────────────────────────────
const DataCardsView: React.FC<{ block: Extract<Block, { kind: 'dataCards' }> }> = ({ block }) => (
  <div className="ai-resp-cards">
    {block.cards.map((c, i) => (
      <div key={i} className="ai-resp-card">
        <div className="ai-resp-card-label">{c.label}</div>
        <div className="ai-resp-card-value">{c.value}</div>
      </div>
    ))}
  </div>
);

const StatusBadge: React.FC<{ value: string }> = ({ value }) => {
  const v = value.toLowerCase();
  let tone = 'neutral';
  if (/confirm|settle|complete|success|active|done|approved/.test(v)) tone = 'success';
  else if (/pend|process|review|await|queue/.test(v)) tone = 'warning';
  else if (/fail|reject|error|declin|cancel/.test(v)) tone = 'danger';
  return <span className={`ai-resp-status ${tone}`}>{value}</span>;
};

const TableView: React.FC<{ block: Extract<Block, { kind: 'table' }> }> = ({ block }) => {
  const statusIdx = block.columns.findIndex(c => c.toLowerCase() === 'status');
  return (
    <div className="ai-resp-table-block">
      {block.title && <div className="ai-resp-table-title">{block.title}</div>}
      <div className="ai-resp-table-scroll">
        <table className="ai-resp-table">
          <thead><tr>{block.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{ci === statusIdx ? <StatusBadge value={cell} /> : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChartView: React.FC<{ block: Extract<Block, { kind: 'chart' }> }> = ({ block }) => {
  const max = Math.max(...block.bars.map(b => b.value), 1);
  return (
    <div className="ai-resp-chart-block">
      {block.title && <div className="ai-resp-table-title">{block.title}</div>}
      <div className="ai-resp-chart-scroll">
        <div className="ai-resp-chart">
          {block.bars.map((b, i) => (
            <div key={i} className="ai-resp-chart-col">
              <div className="ai-resp-chart-bar" style={{ height: `${(b.value / max) * 100}%` }} />
              <span className="ai-resp-chart-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Skeletons for visual content ───────────────────────────────────
const CardsSkeleton: React.FC<{ n: number }> = ({ n }) => (
  <div className="ai-resp-cards">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="ai-resp-card"><SkLine w="55%" /><SkLine w="40%" h={22} mt={12} /></div>
    ))}
  </div>
);
const TableSkeleton: React.FC<{ cols: number; rows: number; title?: boolean }> = ({ cols, rows, title }) => (
  <div className="ai-resp-table-block">
    {title && <SkLine w="30%" h={14} />}
    <div className="ai-sk-table">
      <div className="ai-sk-row header">{Array.from({ length: cols }).map((_, i) => <SkLine key={i} w="60%" />)}</div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="ai-sk-row">{Array.from({ length: cols }).map((_, i) => <SkLine key={i} w="70%" />)}</div>
      ))}
    </div>
  </div>
);
const ChartSkeleton: React.FC<{ n: number; title?: boolean }> = ({ n, title }) => (
  <div className="ai-resp-chart-block">
    {title && <SkLine w="40%" h={14} />}
    <div className="ai-resp-chart">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="ai-resp-chart-col">
          <div className="ai-sk ai-sk-bar" style={{ height: `${30 + (i % 4) * 18}%` }} />
          <SkLine w="60%" h={9} />
        </div>
      ))}
    </div>
  </div>
);

// Shows a skeleton for `duration`, then the children + onDone.
const SkeletonGate: React.FC<{ duration: number; onDone: () => void; skeleton: React.ReactNode; children: React.ReactNode }> = ({ duration, onDone, skeleton, children }) => {
  const [loaded, setLoaded] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const id = setTimeout(() => { setLoaded(true); doneRef.current(); }, duration);
    return () => clearTimeout(id);
  }, []);
  return <div className="ai-stream-in">{loaded ? children : skeleton}</div>;
};

// ─── Animated block (typing for text, skeleton for visuals) ─────────
const AnimatedBlock: React.FC<{ block: Block; onDone: () => void }> = ({ block, onDone }) => {
  switch (block.kind) {
    case 'heading': {
      const chars = useTyper(block.text.length, onDone, 4);
      return <h3 className="ai-resp-heading">{block.text.slice(0, chars)}</h3>;
    }
    case 'paragraph': {
      const total = block.spans.reduce((a, s) => a + spanText(s).length, 0);
      const chars = useTyper(total, onDone, 6);
      return <p className="ai-resp-paragraph"><RevealedSpans spans={block.spans} chars={chars} /></p>;
    }
    case 'followup': {
      const chars = useTyper(block.text.length, onDone, 4);
      return <p className="ai-resp-followup"><em>{block.text.slice(0, chars)}</em></p>;
    }
    case 'bullets':
      return <AnimatedBullets block={block} onDone={onDone} />;
    case 'dataCards':
      return <SkeletonGate duration={900} onDone={onDone} skeleton={<CardsSkeleton n={block.cards.length} />}><DataCardsView block={block} /></SkeletonGate>;
    case 'table':
      return <SkeletonGate duration={1000} onDone={onDone} skeleton={<TableSkeleton cols={block.columns.length} rows={block.rows.length} title={!!block.title} />}><TableView block={block} /></SkeletonGate>;
    case 'chart':
      return <SkeletonGate duration={1000} onDone={onDone} skeleton={<ChartSkeleton n={block.bars.length} title={!!block.title} />}><ChartView block={block} /></SkeletonGate>;
    default:
      return null;
  }
};

const AnimatedBullets: React.FC<{ block: Extract<Block, { kind: 'bullets' }>; onDone: () => void }> = ({ block, onDone }) => {
  const introLen = block.intro?.length ?? 0;
  const [introChars, setIntroChars] = useState(0);
  const [items, setItems] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    let n = 0;
    let itemTimer: ReturnType<typeof setInterval>;
    const typeId = setInterval(() => {
      n = Math.min(introLen, n + 6);
      setIntroChars(n);
      if (n >= introLen) {
        clearInterval(typeId);
        let k = 0;
        itemTimer = setInterval(() => {
          k += 1;
          setItems(k);
          if (k >= block.items.length) { clearInterval(itemTimer); doneRef.current(); }
        }, 220);
      }
    }, 18);
    return () => { clearInterval(typeId); clearInterval(itemTimer); };
  }, []);
  return (
    <div className="ai-resp-bullets-wrap">
      {block.intro && <p className="ai-resp-paragraph">{block.intro.slice(0, introChars)}</p>}
      <ul className="ai-resp-bullets">
        {block.items.slice(0, items).map((it, i) => (
          <li key={i} className="ai-stream-in"><strong>{it.bold}</strong>{it.rest}</li>
        ))}
      </ul>
    </div>
  );
};

// ─── Message action bar ─────────────────────────────────────────────
const ResponseActions: React.FC = () => (
  <div className="ai-resp-actions ai-stream-in">
    <button className="ai-resp-action-btn" title="Copy">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    </button>
    <button className="ai-resp-action-btn" title="Good response">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
    </button>
    <button className="ai-resp-action-btn" title="Bad response">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
      </svg>
    </button>
    <button className="ai-resp-action-btn" title="Regenerate">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    </button>
  </div>
);

// ─── Interactive blocks (ideal mode only) ───────────────────────────
// Small inline glyphs for action cards (this repo's feather-style, currentColor).
function actionIcon(name?: string): React.ReactNode {
  const p = (n: React.ReactNode) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{n}</svg>;
  switch (name) {
    case 'wallet':  return p(<><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></>);
    case 'deposit': return p(<><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>);
    case 'trade':   return p(<><line x1="9" y1="3" x2="9" y2="6"/><rect x="7" y="6" width="4" height="7" rx="1"/><line x1="9" y1="13" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="10"/><rect x="13" y="10" width="4" height="6" rx="1"/><line x1="15" y1="16" x2="15" y2="21"/></>);
    case 'stake':   return p(<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3"/><path d="M3 12c0 1.66 4 3 9 3"/></>);
    case 'shield':  return p(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>);
    case 'policy':
    default:        return p(<><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></>);
  }
}
const CheckIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

// One proposed action: approve → running → done (receipt) with Undo.
const ActionCard: React.FC<{ item: Extract<Block, { kind: 'actions' }>['items'][number] }> = ({ item }) => {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  return (
    <div className={`ai-resp-action-card ${state}`}>
      <span className="ai-resp-action-icon">{state === 'done' ? CheckIcon : actionIcon(item.icon)}</span>
      <div className="ai-resp-action-main">
        <div className="ai-resp-action-title">{item.title}</div>
        <div className="ai-resp-action-desc">{state === 'done' ? item.done : item.desc}</div>
      </div>
      {state === 'idle' && (
        <button className="ai-resp-action-cta" onClick={() => { setState('running'); setTimeout(() => setState('done'), 1200); }}>{item.cta}</button>
      )}
      {state === 'running' && <span className="ai-resp-inline-spinner" aria-label="Running" />}
      {state === 'done' && <button className="ai-resp-action-undo" onClick={() => setState('idle')}>Undo</button>}
    </div>
  );
};

const ActionsBlock: React.FC<{ block: Extract<Block, { kind: 'actions' }> }> = ({ block }) => (
  <div className="ai-resp-actions-block">
    {block.intro && <p className="ai-resp-paragraph">{block.intro}</p>}
    <div className="ai-resp-action-list">
      {block.items.map(it => <ActionCard key={it.id} item={it} />)}
    </div>
  </div>
);

// Payload for a notification shown above the composer (Undo optional).
export interface NoticePayload { text: string; onUndo?: () => void; }

// Pill-button glyphs (14px, currentColor).
const iEdit = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
const iSim  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>;
const iEye  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const iCheck2 = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
type PolicyCardData = Extract<Block, { kind: 'policyCards' }>['cards'][number];

// Build the PolicyDraft handed to the product PolicyModal (preview / edit).
function toDraft(card: PolicyCardData): PolicyDraft {
  const detail = card.detail && card.detail.length
    ? card.detail
    : card.rules.map(r => {
        const i = r.indexOf(':');
        return i >= 0 ? { label: r.slice(0, i).trim(), value: r.slice(i + 1).trim() } : { label: 'Rule', value: r };
      });
  return { name: card.name, desc: card.desc, detail };
}

// Simulate → inline impact summary + metric tiles.
const PolicySim: React.FC<{ sim: NonNullable<PolicyCardData['sim']> }> = ({ sim }) => (
  <div className="ai-resp-policy-panel ai-stream-in">
    <div className="ai-resp-policy-panel-title">Estimated impact</div>
    <p className="ai-resp-policy-panel-text">{sim.impact}</p>
    <div className="ai-resp-sim-tiles">
      {sim.tiles.map((t, i) => (
        <div key={i} className="ai-resp-sim-tile">
          <div className="ai-resp-sim-tile-value">{t.value}</div>
          <div className="ai-resp-sim-tile-label">{t.label}</div>
        </div>
      ))}
    </div>
  </div>
);

// A recommended policy card. Simulate is inline (AI impact preview); Edit and Preview
// open the real product PolicyModal; Apply raises the "policy applied" notification.
const PolicyCardItem: React.FC<{
  card: PolicyCardData;
  onNotify?: (n: NoticePayload) => void;
  onEditPolicy?: (p: PolicyDraft) => void;
  onPreviewPolicy?: (p: PolicyDraft) => void;
}> = ({ card, onNotify, onEditPolicy, onPreviewPolicy }) => {
  const [showSim, setShowSim] = useState(false);
  const [applied, setApplied] = useState(false);
  const apply = () => {
    setApplied(true);
    onNotify?.({ text: `Applied "${card.name}" policy.`, onUndo: () => setApplied(false) });
  };
  return (
    <div className={`ai-resp-policy-card${applied ? ' applied' : ''}`}>
      <div className="ai-resp-policy-head">
        <span className="ai-resp-policy-icon">{actionIcon('policy')}</span>
        <div className="ai-resp-policy-main">
          <div className="ai-resp-policy-title">
            <span>{card.name}</span>
            {applied && <span className="ai-resp-policy-badge applied">Applied</span>}
          </div>
          <div className="ai-resp-policy-desc">{card.desc}</div>
          <ul className="ai-resp-option-rules">{card.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </div>

      {showSim && card.sim && <PolicySim sim={card.sim} />}

      <div className="ai-resp-policy-actions">
        {/* Icon-only utilities (tooltip via title), then the text decision CTAs */}
        <button className="ai-resp-pill-btn icon" aria-label="Edit policy" title="Edit policy" onClick={() => onEditPolicy?.(toDraft(card))}>{iEdit}</button>
        <button className="ai-resp-pill-btn icon" aria-label="Preview policy" title="Preview policy" onClick={() => onPreviewPolicy?.(toDraft(card))}>{iEye}</button>
        {card.sim && <button className={`ai-resp-pill-btn icon${showSim ? ' on' : ''}`} aria-label="Simulate impact" title="Simulate impact" onClick={() => setShowSim(s => !s)}>{iSim}</button>}
        <button className="ai-resp-pill-btn primary" onClick={apply} disabled={applied}>{iCheck2} {applied ? 'Applied' : 'Apply'}</button>
      </div>
    </div>
  );
};

const PolicyCards: React.FC<{
  block: Extract<Block, { kind: 'policyCards' }>;
  onNotify?: (n: NoticePayload) => void;
  onEditPolicy?: (p: PolicyDraft) => void;
  onPreviewPolicy?: (p: PolicyDraft) => void;
}> = ({ block, onNotify, onEditPolicy, onPreviewPolicy }) => (
  <div className="ai-resp-policy-block">
    {block.intro && <div className="ai-resp-table-title">{block.intro}</div>}
    <div className="ai-resp-policy-list">
      {block.cards.map(c => (
        <PolicyCardItem key={c.id} card={c} onNotify={onNotify} onEditPolicy={onEditPolicy} onPreviewPolicy={onPreviewPolicy} />
      ))}
    </div>
  </div>
);

const QuickReplies: React.FC<{ block: Extract<Block, { kind: 'quickReplies' }>; onQuickReply?: (t: string) => void }> = ({ block, onQuickReply }) => (
  <div className="ai-resp-qr">
    {block.replies.map((r, i) => (
      <button key={i} className="ai-resp-qr-chip" onClick={() => onQuickReply?.(r)}>{r}</button>
    ))}
  </div>
);

// A decision action lifted to a pinned card above the composer (see AIChatPanel).
export interface PinnedAction {
  key: string;
  title: string;
  subtext?: string;
  buttons: { label: string; onClick: () => void }[];
}

const chevron = (open: boolean) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// An approval gate: pauses the response with a pinned Approve/Deny (or choose-mode)
// card above the composer. While waiting it shows an inline "Thinking…"; on a positive
// choice it streams `approvedThought` inline, raises `notify`, then continues the response.
const ApprovalGate: React.FC<{
  block: Extract<Block, { kind: 'approvalGate' }>;
  active: boolean;                 // this is the gate the stream is currently paused on
  onDone: () => void;              // continue streaming the rest of the response
  onPinAction?: (a: PinnedAction | null) => void;
  onNavigateWhitelist?: () => void;
  onConsolidate?: (mode: 'manual' | 'auto') => void;
  onNotify?: (n: NoticePayload) => void;
}> = ({ block, active, onDone, onPinAction, onNavigateWhitelist, onConsolidate, onNotify }) => {
  const [phase, setPhase] = useState<'waiting' | 'approved' | 'denied'>('waiting');
  const [shownSteps, setShownSteps] = useState(0);
  const [open, setOpen] = useState(true);
  const doneRef = useRef(onDone); doneRef.current = onDone;
  const notifyRef = useRef(onNotify); notifyRef.current = onNotify;
  const pinRef = useRef(onPinAction); pinRef.current = onPinAction;
  const navRef = useRef(onNavigateWhitelist); navRef.current = onNavigateWhitelist;
  const consRef = useRef(onConsolidate); consRef.current = onConsolidate;

  // Only the active gate manages the pinned Approve/Deny card.
  useEffect(() => {
    if (!active) return;
    if (phase !== 'waiting') { pinRef.current?.(null); return; }
    pinRef.current?.({
      key: `gate-${block.title}`,
      title: block.title,
      subtext: block.subtext,
      buttons: block.buttons.map(btn => ({
        label: btn.label,
        onClick: () => {
          if (btn.stop) { setPhase('denied'); return; }
          if (btn.effect === 'navigate') navRef.current?.();
          else if (btn.effect === 'consolidateManual') consRef.current?.('manual');
          else if (btn.effect === 'consolidateAuto') consRef.current?.('auto');
          setPhase('approved');
        },
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, phase]);

  // On a positive choice, stream the second thought, then raise notify + continue.
  useEffect(() => {
    if (phase !== 'approved') return;
    setShownSteps(0);
    let n = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      n += 1;
      setShownSteps(n);
      if (n < block.approvedThought.length) { t = setTimeout(tick, 950); }
      else {
        t = setTimeout(() => {
          if (block.notify) notifyRef.current?.({ text: block.notify });
          doneRef.current();
        }, 800);
      }
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'denied') {
    return <p className="ai-resp-paragraph ai-stream-in"><em>No problem — let me know if you change your mind.</em></p>;
  }
  const streaming = phase === 'approved' && shownSteps < block.approvedThought.length;
  const thinking = phase === 'waiting' || streaming;
  return (
    <div className="ai-thought">
      <button className="ai-thought-toggle" onClick={() => setOpen(o => !o)}>
        {thinking && <AiStar size={16} className="ai-chat-thinking-star" />}
        <span className={`ai-thought-label${thinking ? ' thinking' : ''}`}>{thinking ? 'Thinking...' : 'Thought process'}</span>
        {chevron(open)}
      </button>
      {open && phase === 'approved' && (
        <div className="ai-thought-steps">
          {block.approvedThought.slice(0, shownSteps).map((s, i) => (
            <div key={i} className="ai-thought-step ai-stream-in">
              <div className="ai-thought-step-header">{s.header}</div>
              <div className="ai-thought-step-desc">{s.desc}</div>
            </div>
          ))}
          {streaming && <div className="ai-thought-step"><SkLine w="42%" /><SkLine w="72%" mt={7} /></div>}
        </div>
      )}
    </div>
  );
};

// Wrapper: brief skeleton reveal (once), then the stateful control. Rendered as ONE
// stable component across the stream so selection/run state persists as later blocks arrive.
const InteractiveBlock: React.FC<{
  block: Block;
  onReveal: () => void;
  onQuickReply?: (t: string) => void;
  onNotify?: (n: NoticePayload) => void;
  onEditPolicy?: (p: PolicyDraft) => void;
  onPreviewPolicy?: (p: PolicyDraft) => void;
}> = ({ block, onReveal, onQuickReply, onNotify, onEditPolicy, onPreviewPolicy }) => {
  const instant = block.kind === 'quickReplies';
  const [shown, setShown] = useState(instant);
  const doneRef = useRef(onReveal);
  doneRef.current = onReveal;
  useEffect(() => {
    if (instant) { doneRef.current(); return; }
    const id = setTimeout(() => { setShown(true); doneRef.current(); }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!shown) {
    return <div className="ai-resp-actions-block ai-stream-in"><SkLine w="45%" /><SkLine w="100%" h={46} mt={10} /><SkLine w="100%" h={46} mt={8} /></div>;
  }
  return (
    <div className="ai-stream-in">
      {block.kind === 'actions' && <ActionsBlock block={block} />}
      {block.kind === 'policyCards' && <PolicyCards block={block} onNotify={onNotify} onEditPolicy={onEditPolicy} onPreviewPolicy={onPreviewPolicy} />}
      {block.kind === 'quickReplies' && <QuickReplies block={block} onQuickReply={onQuickReply} />}
    </div>
  );
};

// ─── Full response — streams blocks in sequence ─────────────────────
export const AIResponse: React.FC<{
  data: AIResponseData;
  showThought?: boolean;
  interactive?: boolean;                 // ideal mode → render interactive blocks
  onQuickReply?: (text: string) => void; // quick-reply chip continues the conversation
  onNotify?: (n: NoticePayload) => void; // policy applied → notification above the composer
  onEditPolicy?: (p: PolicyDraft) => void;    // Edit → product policy editor
  onPreviewPolicy?: (p: PolicyDraft) => void; // Preview → product policy detail
  onConsolidate?: (mode: 'manual' | 'auto') => void; // whitelist consolidation
  onNavigateWhitelist?: () => void;           // approval gate → open the Whitelist page
  onPinAction?: (a: PinnedAction | null) => void; // lift a decision action above the composer
}> = ({ data, showThought = true, interactive = true, onQuickReply, onNotify, onEditPolicy, onPreviewPolicy, onConsolidate, onNavigateWhitelist, onPinAction }) => {
  // In non-ideal (current) mode, drop the interactive blocks entirely.
  const blocks = interactive ? data.blocks : data.blocks.filter(b => !isInteractive(b.kind));
  const [done, setDone] = useState(0);            // count of fully-revealed blocks
  const advance = () => setDone(d => d + 1);
  return (
    <div className="ai-response">
      {showThought && <ThoughtProcess steps={data.thought} />}
      {blocks.map((b, i) => {
        if (i > done) return null;                // not reached yet
        if (b.kind === 'approvalGate') return <ApprovalGate key={i} block={b} active={i === done} onDone={advance} onPinAction={onPinAction} onNavigateWhitelist={onNavigateWhitelist} onConsolidate={onConsolidate} onNotify={onNotify} />;
        if (isInteractive(b.kind)) return <InteractiveBlock key={i} block={b} onReveal={advance} onQuickReply={onQuickReply} onNotify={onNotify} onEditPolicy={onEditPolicy} onPreviewPolicy={onPreviewPolicy} />;
        if (i < done) return <StaticBlock key={i} block={b} />;     // already revealed
        return <AnimatedBlock key={i} block={b} onDone={advance} />;// currently revealing
      })}
      {done >= blocks.length && <ResponseActions />}
    </div>
  );
};
