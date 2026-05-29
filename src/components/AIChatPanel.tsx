import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIResponse, ThoughtProcess } from './AIResponse';
import { pickResponse, SAMPLE_PROMPTS } from './aiChatResponses';
import type { AIResponse as AIResponseData } from './aiChatResponses';

type ChatMode = 'idle' | 'thinking';

interface Message {
  role: 'user' | 'assistant';
  content?: string;            // user text
  response?: AIResponseData;   // rich assistant response
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string | null;     // auto-sent when the chat opens from a search prompt
  onInitialPromptConsumed?: () => void;
}

const HEADLINES = [
  'Ask questions about your enterprise',
  'Get step-by-step guidance',
  'Navigate between workflows instantly',
  'Query data and surface insights',
  'Execute actions with full control',
];

// ─── User message — hover actions (copy/edit) + inline edit field ───
const UserMessage: React.FC<{
  text: string;
  disabled?: boolean;
  onSave: (next: string) => void;
}> = ({ text, disabled, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(text);
      const el = taRef.current;
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }
  }, [editing, text]);

  if (editing) {
    return (
      <div className="ai-user-edit">
        <textarea
          ref={taRef}
          className="ai-user-edit-field"
          value={draft}
          rows={1}
          onChange={e => setDraft(e.target.value)}
        />
        <div className="ai-user-edit-actions">
          <button className="ai-user-edit-cancel" onClick={() => setEditing(false)}>Cancel</button>
          <button
            className="ai-user-edit-save"
            disabled={!draft.trim() || draft.trim() === text}
            onClick={() => { onSave(draft.trim()); setEditing(false); }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-user-msg">
      <div className="ai-chat-bubble user">{text}</div>
      <div className="ai-user-actions">
        <button className="ai-user-action-btn" title="Copy" onClick={() => navigator.clipboard?.writeText(text)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button className="ai-user-action-btn" title="Edit" disabled={disabled} onClick={() => setEditing(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ open, onClose, initialPrompt, onInitialPromptConsumed }) => {
  const [expanded, setExpanded]       = useState(false);
  const [mode, setMode]               = useState<ChatMode>('idle');
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [fading, setFading]           = useState(false);
  const [pending, setPending]         = useState<AIResponseData | null>(null); // response being "thought about"
  const turnRef                       = useRef(0);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);
  const bodyRef                       = useRef<HTMLDivElement>(null);
  const stickToBottom                 = useRef(true);
  const roRef                         = useRef<ResizeObserver | null>(null);

  // Keep the latest (currently-generating) content in view as it grows.
  const scrollToBottom = () => {
    const b = bodyRef.current;
    if (b && stickToBottom.current) b.scrollTop = b.scrollHeight;
  };
  // If the user scrolls up, stop auto-following; re-enable when near the bottom.
  const onBodyScroll = () => {
    const b = bodyRef.current;
    if (b) stickToBottom.current = b.scrollHeight - b.scrollTop - b.clientHeight < 80;
  };
  // Observe the conversation content; scroll down whenever it grows (streaming/typing).
  const messagesRefCb = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (node) {
      const ro = new ResizeObserver(() => scrollToBottom());
      ro.observe(node);
      roRef.current = ro;
    }
  }, []);

  // Cycle headlines in idle state
  useEffect(() => {
    if (!open || messages.length > 0) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setHeadlineIdx(i => (i + 1) % HEADLINES.length);
        setFading(false);
      }, 320);
    }, 3000);
    return () => clearInterval(id);
  }, [open, messages.length]);

  // Collapse when closed
  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  // Generate a response for `text`, replacing everything from `baseMessages` onward.
  const generate = (text: string, baseMessages: Message[]) => {
    const response = pickResponse(text, turnRef.current++);
    stickToBottom.current = true;   // follow the new response as it streams
    setMessages([...baseMessages, { role: 'user', content: text }]);
    setPending(response);
    setMode('thinking');
    const thinkMs = response.thought.length * 800 + 600;   // let thought steps stream first
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', response }]);
      setPending(null);
      setMode('idle');
    }, thinkMs);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mode === 'thinking') return;
    setInput('');
    generate(trimmed, messages);
  };

  // Auto-send a prompt passed in when the chat is opened from the search modal.
  useEffect(() => {
    if (open && initialPrompt) {
      generate(initialPrompt, []);          // start a fresh conversation with this prompt
      onInitialPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  // Edit a prior user message: drop everything after it and regenerate.
  const editMessage = (index: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mode === 'thinking') return;
    generate(trimmed, messages.slice(0, index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isConversation = messages.length > 0 || mode === 'thinking';

  return (
    <div className={`ai-chat-overlay${open ? ' open' : ''}${expanded ? ' expanded' : ''}`}>
      {expanded && (
        <div className="ai-chat-backdrop" onClick={() => setExpanded(false)} />
      )}
      <div className="ai-chat-panel">

        {/* ── Header ── */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <button className="ai-chat-hdr-btn" title="History">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="ai-chat-name">AI Name</span>
            <span className="ai-chat-beta-badge">Beta</span>
          </div>
          <div className="ai-chat-header-right">
            <button className="ai-chat-hdr-btn" title="New chat"
              onClick={() => { setMessages([]); setMode('idle'); setInput(''); setPending(null); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button className="ai-chat-hdr-btn" title={expanded ? 'Collapse' : 'Expand'}
              onClick={() => setExpanded(e => !e)}>
              {expanded ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="4 14 10 14 10 20"/>
                  <polyline points="20 10 14 10 14 4"/>
                  <line x1="10" y1="14" x2="3" y2="21"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3"  y1="21" x2="10" y2="14"/>
                </svg>
              )}
            </button>
            <button className="ai-chat-hdr-btn" title="Close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ai-chat-body" ref={bodyRef} onScroll={onBodyScroll}>
          {!isConversation ? (
            /* Idle / default state */
            <div className="ai-chat-idle">
              {/* Headline centered in growing hero area */}
              <div className="ai-chat-idle-hero">
                <img
                  className="ai-chat-hero-logo"
                  src={`${import.meta.env.BASE_URL}bitgo-logo.svg`}
                  alt=""
                  aria-hidden="true"
                />
                <p className={`ai-chat-headline${fading ? ' fading' : ''}`}>
                  {HEADLINES[headlineIdx]}
                </p>
              </div>
              {/* Prompts pinned to bottom, left-aligned */}
              <div className="ai-chat-prompts">
                {SAMPLE_PROMPTS.map(p => (
                  <button key={p} className="ai-chat-prompt-row"
                    onClick={() => { setInput(p); sendMessage(p); }}>
                    <span className="ai-chat-prompt-glyph">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 5v6a2 2 0 0 0 2 2h11"/><polyline points="14 9 18 13 14 17"/>
                      </svg>
                    </span>
                    {p}
                  </button>
                ))}
                <button className="ai-chat-prompt-row ai-chat-prompt-more">
                  <span className="ai-chat-prompt-glyph">↳</span>
                  View all suggestions
                </button>
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className="ai-chat-messages" ref={messagesRefCb}>
              {messages.map((msg, i) => (
                <div key={i} className={`ai-chat-msg-row ${msg.role}`}>
                  {msg.role === 'user' ? (
                    <UserMessage
                      text={msg.content!}
                      disabled={mode === 'thinking'}
                      onSave={(next) => editMessage(i, next)}
                    />
                  ) : (
                    <AIResponse data={msg.response!} />
                  )}
                </div>
              ))}
              {mode === 'thinking' && pending && (
                <div className="ai-chat-msg-row assistant">
                  <ThoughtProcess steps={pending.thought} thinking />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="ai-chat-input-wrap">
          <div className="ai-chat-input-box">
          <textarea
            ref={textareaRef}
            className="ai-chat-textarea"
            placeholder="Placeholder"
            value={input}
            rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="ai-chat-toolbar">
            <div className="ai-chat-toolbar-left">
              <button className="ai-chat-tool-btn" title="Attach">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button className="ai-chat-tool-btn" title="Options">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8"  x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1"  y1="14" x2="7"  y2="14"/>
                  <line x1="9"  y1="8"  x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
              </button>
            </div>
            <button className="ai-chat-mode-pill">
              Mode Name
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {mode === 'thinking' ? (
              <button className="ai-chat-send-btn stop" title="Stop" onClick={() => setMode('idle')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="2"/>
                </svg>
              </button>
            ) : (
              <button
                className="ai-chat-send-btn"
                title="Send"
                disabled={!input.trim()}
                onClick={() => sendMessage(input)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            )}
          </div>
          </div>{/* end ai-chat-input-box */}
          <p className="ai-chat-disclaimer">
            [AI Name] can make mistakes. Secured by BitGo.{' '}
            <a href="#" className="ai-chat-disclaimer-link" onClick={e => e.preventDefault()}>Learn More</a>
          </p>
        </div>

      </div>
    </div>
  );
};
