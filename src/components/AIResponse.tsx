import React, { useState, useEffect, useRef } from 'react';
import type { AIResponse as AIResponseData, Block, Span, ThoughtStep } from './aiChatResponses';

const LOGO = `${import.meta.env.BASE_URL}bitgo-logo.svg`;

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

// ─── Thought process (step-by-step, with skeletons while thinking) ──
export const ThoughtProcess: React.FC<{ steps: ThoughtStep[]; thinking?: boolean }> = ({ steps, thinking = false }) => {
  const [open, setOpen] = useState(thinking);            // collapsed once done; user expands via chevron
  const [shown, setShown] = useState(thinking ? 0 : steps.length);
  const [skeleton, setSkeleton] = useState(thinking);

  useEffect(() => {
    if (!thinking) { setShown(steps.length); setSkeleton(false); return; }
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
  }, [thinking, steps]);

  return (
    <div className="ai-thought">
      <button className="ai-thought-toggle" onClick={() => setOpen(o => !o)}>
        {thinking && <span className="ai-chat-thinking-ring" />}
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

// ─── Full response — streams blocks in sequence ─────────────────────
export const AIResponse: React.FC<{ data: AIResponseData }> = ({ data }) => {
  const [done, setDone] = useState(0);            // count of fully-revealed blocks
  const advance = () => setDone(d => d + 1);
  return (
    <div className="ai-response">
      <ThoughtProcess steps={data.thought} />
      {data.blocks.map((b, i) => {
        if (i > done) return null;                // not reached yet
        if (i < done) return <StaticBlock key={i} block={b} />;     // already revealed
        return <AnimatedBlock key={i} block={b} onDone={advance} />;// currently revealing
      })}
      {done >= data.blocks.length && <ResponseActions />}
    </div>
  );
};
