import React from 'react';

/* Exposed filter pattern — a row of pill triggers (label + chevron) that
   replaces the single "Filter" button. Prototype: chips are visual only.
   Matches Figma Addresses 6011:205487. */
export const FilterChips: React.FC<{ filters: string[]; activeIndex?: number }> = ({ filters, activeIndex }) => (
  <div className="filter-chips">
    {filters.map((label, i) => (
      <button key={label} type="button" className={`filter-chip${i === activeIndex ? ' active' : ''}`}>
        {label}
        <span className="filter-chip-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
    ))}
  </div>
);
