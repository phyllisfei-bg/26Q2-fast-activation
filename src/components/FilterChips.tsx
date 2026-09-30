import React, { useState, useRef, useEffect } from 'react';

/* Exposed filter pattern — a row of pill triggers (label + chevron) that
   replaces the single "Filter" button. A chip with `options` opens a
   dropdown of choices on click (prototype: selection is visual only).
   Matches Figma Addresses 6011:205487. */

export interface FilterDef { label: string; options?: string[]; }
type Filter = string | FilterDef;

const Chevron = () => (
  <span className="filter-chip-chevron">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
);

export const FilterChips: React.FC<{ filters: Filter[] }> = ({ filters }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenIdx(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openIdx]);

  return (
    <div className="filter-chips" ref={rootRef}>
      {filters.map((f, i) => {
        const def: FilterDef = typeof f === 'string' ? { label: f } : f;
        const sel = selected[i];
        const active = openIdx === i || !!sel;
        return (
          <div key={def.label} className="filter-chip-wrap">
            <button
              type="button"
              className={`filter-chip${active ? ' active' : ''}`}
              onClick={() => setOpenIdx(o => (o === i ? null : i))}
            >
              {sel ?? def.label}
              <Chevron />
            </button>
            {openIdx === i && def.options && (
              <div className="filter-chip-menu">
                {def.options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`filter-chip-menu-item${sel === opt ? ' selected' : ''}`}
                    onClick={() => { setSelected(s => ({ ...s, [i]: opt })); setOpenIdx(null); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
