import React, { useEffect, useRef, useState } from 'react';
import { SAMPLE_PROMPTS } from './aiChatResponses';
import { AiShield } from './AiShield';
import { useSpinGlow, CometRing } from './cometRing';

interface SearchPopoverProps {
  open: boolean;
  onClose: () => void;
  onOpenChat?: (prompt?: string) => void;   // clicking a prompt opens the chat (optionally pre-filling/sending it)
}

// Same sample prompts as the chat UI, plus the "view all" affordance.
const AI_PROMPTS = [...SAMPLE_PROMPTS, 'View all suggestions'];

interface Category {
  label: string;
  icon: React.ReactNode;
  dropdown?: boolean;
}

const ico = (path: React.ReactNode) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const CATEGORIES: Category[] = [
  { label: 'Transactions', dropdown: true, icon: ico(<><path d="M7 7h10M7 7l3-3M7 7l3 3"/><path d="M17 17H7M17 17l-3 3M17 17l-3-3"/></>) },
  { label: 'Wallets',  icon: ico(<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h.01"/></>) },
  { label: 'Assets',   icon: ico(<><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h4a1.5 1.5 0 0 1 0 3H9h4.5a1.5 1.5 0 0 1 0 3H9"/></>) },
  { label: 'Addresses', dropdown: true, icon: ico(<><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>) },
  { label: 'Policies', icon: ico(<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/></>) },
  { label: 'Reports',  icon: ico(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>) },
  { label: 'Members',  icon: ico(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></>) },
];

const SMART_PROMPTS = [
  'Search deposits or withdraws for specific dates',
  'Search Buy/Sell orders for specific dates',
  'Search Policies created by a specific user',
  'Search addresses whitelisted on a specific date',
];

export const SearchPopover: React.FC<SearchPopoverProps> = ({ open, onClose, onOpenChat }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiMode, setAiMode] = useState(false);
  const [chipHovered, setChipHovered] = useState(false);

  const modalSpin = useSpinGlow();   // comet sweep around the modal on entering AI Mode
  const chipSpin = useSpinGlow();    // comet sweep around the AI Mode chip on hover

  const enterAiMode = () => {
    setAiMode(true);
    modalSpin.trigger(true, 1);
  };

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else setAiMode(false);   // reset to normal search when closed
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`search-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className={`search-popover${aiMode ? ' ai-mode' : ''}`} onClick={e => e.stopPropagation()}>

        {/* Comet-ring outline — sweeps once around the modal on entering AI Mode */}
        <CometRing {...modalSpin} br={16} />

        {/* Input row */}
        <div className="search-input-row">
          <button className="search-plus" title="Add filter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <input ref={inputRef} className="search-input" placeholder="Search" />
          {aiMode ? (
            <button className="search-ai-close" title="Exit AI Mode" onClick={() => setAiMode(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ) : (
            <button
              className="search-ai-mode"
              onClick={enterAiMode}
              onMouseEnter={() => { setChipHovered(true); if (!chipSpin.spinning) chipSpin.trigger(true, 1); }}
              onMouseLeave={() => setChipHovered(false)}
            >
              <CometRing {...chipSpin} br={100} idleGlow={chipHovered && !chipSpin.spinning} />
              <AiShield size={15} animated={false} className="search-ai-spark" />
              AI Mode
            </button>
          )}
        </div>

        {aiMode ? (
          /* ── AI Mode: prompt suggestions ── */
          <div className="search-ai-prompts">
            {AI_PROMPTS.map(p => (
              <button key={p} className="search-ai-prompt-row"
                onClick={() => onOpenChat?.(p === 'View all suggestions' ? undefined : p)}>
                <span className="search-ai-prompt-glyph">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 5v6a2 2 0 0 0 2 2h11"/><polyline points="14 9 18 13 14 17"/>
                  </svg>
                </span>
                {p}
              </button>
            ))}
          </div>
        ) : (
          /* ── Normal: categories + smart prompts ── */
          <>
            <div className="search-categories">
              <div className="search-cat-chips">
                {CATEGORIES.map(c => (
                  <button key={c.label} className="search-cat-chip">
                    <span className="search-cat-icon">{c.icon}</span>
                    {c.label}
                    {c.dropdown && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <button className="search-cal-btn" title="Date range">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
            </div>

            <div className="search-section-label">Smart Prompts</div>
            <div className="search-prompts">
              {SMART_PROMPTS.map(p => (
                <button key={p} className="search-prompt-row" onClick={() => onOpenChat?.(p)}>
                  <svg className="search-prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span className="search-prompt-text">{p}</span>
                  <svg className="search-prompt-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="search-footer">
          Use <span className="search-kbd">↑</span><span className="search-kbd">↓</span> to navigate and <span className="search-kbd">↵</span> to select
        </div>
      </div>
    </div>
  );
};
