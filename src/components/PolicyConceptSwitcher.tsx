import React, { useState, useRef, useEffect, useCallback } from 'react';

export type PolicyConcept = 'near' | 'vision';

interface Props {
  concept: PolicyConcept;
  onConceptChange: (c: PolicyConcept) => void;
}

const GripIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <circle cx="2" cy="2" r="1.1" /><circle cx="5" cy="2" r="1.1" /><circle cx="8" cy="2" r="1.1" />
    <circle cx="2" cy="5" r="1.1" /><circle cx="5" cy="5" r="1.1" /><circle cx="8" cy="5" r="1.1" />
    <circle cx="2" cy="8" r="1.1" /><circle cx="5" cy="8" r="1.1" /><circle cx="8" cy="8" r="1.1" />
  </svg>
);

const CONCEPTS: { id: PolicyConcept; name: string; short: string; desc: string }[] = [
  { id: 'near', name: '1 · Near future', short: 'Near future', desc: 'Sentence-based Policies page' },
  { id: 'vision', name: '2 · Vision', short: 'Vision', desc: 'Security Center' },
];

/** Floating, draggable prototype control — same family as the Role Switcher.
 *  Switches the Security → Policies surface between the near-term page and the Security Center vision. */
export const PolicyConceptSwitcher: React.FC<Props> = ({ concept, onConceptChange }) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const originX = pos?.x ?? rect.left;
    const originY = pos?.y ?? rect.top;
    const sx = e.clientX, sy = e.clientY;
    let moved = false;
    if (!pos) setPos({ x: rect.left, y: rect.top });
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) { moved = true; dragging.current = true; document.body.style.userSelect = 'none'; }
      if (!moved) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - rect.width, originX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - rect.height, originY + dy)),
      });
    };
    const up = () => {
      document.body.style.userSelect = '';
      setTimeout(() => { dragging.current = false; }, 0);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }, [pos]);

  if (dismissed) return null;
  const cur = CONCEPTS.find(c => c.id === concept)!;
  // Default: bottom-right. Once dragged, the stored coordinates win.
  const style: React.CSSProperties = pos
    ? { top: pos.y, left: pos.x, bottom: 'auto', right: 'auto' }
    : { top: 'auto', left: 'auto', bottom: 24, right: 24 };

  return (
    <div className="role-switcher" ref={ref} style={style} onMouseDown={onDragStart}>
      {open && (
        <div className="role-switcher-menu" style={{ top: 'auto', bottom: 'calc(100% + 6px)', left: 'auto', right: 0 }}>
          <div className="role-switcher-col" style={{ minWidth: 260 }}>
            <div className="role-switcher-menu-header">Policy concept</div>
            {CONCEPTS.map(c => (
              <button key={c.id} className={`role-switcher-item${concept === c.id ? ' active' : ''}`} onClick={() => { if (!dragging.current) onConceptChange(c.id); }}>
                <span className={`role-switcher-radio${concept === c.id ? ' checked' : ''}`} />
                <span className="role-switcher-item-body">
                  <span className="role-switcher-item-name">{c.name}</span>
                  <span className="role-switcher-item-desc block">{c.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="role-switcher-pill">
        <div className="role-switcher-grip"><GripIcon /></div>
        <button className="role-switcher-trigger" onClick={() => { if (!dragging.current) setOpen(o => !o); }} title="Switch Policies concept">
          <span className="role-switcher-label"><span className="role-switcher-prefix">Policy concept</span>•<span>{cur.short}</span></span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'none' : 'rotate(180deg)', transition: 'transform .15s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button className="role-switcher-dismiss" title="Hide (returns on refresh)" onClick={() => { if (!dragging.current) { setOpen(false); setDismissed(true); } }} onMouseDown={e => e.stopPropagation()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
};
