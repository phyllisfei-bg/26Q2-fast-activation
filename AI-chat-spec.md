# AI Chat & Search — Spec

The AI assistant surface for the Fast Activation prototype: a chat panel that
overlays any page, plus a search command palette with an AI Mode. This is the
canonical reference for behavior, layout, and the response model.

## Entry points

| Trigger | Opens | Notes |
|---|---|---|
| Topbar **chat icon** (left of the profile icon) | Chat panel (compact) | Icon has a gradient hover animation. Placeholder glyph for now. |
| Sidebar **Search** nav item | Search command palette | Styled as a nav item with a `⌘K` hint |
| **⌘K / Ctrl+K** | Search command palette | Global listener in `App.tsx` |
| Clicking a **prompt** in the search palette | Chat panel (compact), auto-sending that prompt | See "Search → chat hand-off" |

All three surfaces are rendered globally in `App.tsx` (alongside the snackbar)
so they float over whatever page is active.

---

## Chat panel (`AIChatPanel.tsx`)

### States

- **Idle** (no messages): a cycling headline (`HEADLINES`, 5 phrases, 3s cadence
  with crossfade), a blurred BitGo-logo radial glow behind it, and the sample
  prompts pinned to the bottom (left-aligned with the input).
- **Thinking**: the user's message bubble + a `ThoughtProcess` that streams its
  steps one-by-one (each step skeleton-loads, then resolves). Expanded while
  thinking, then collapses to "Thought process ›" once the response arrives.
- **Conversation**: user bubbles (right) and full-width assistant responses
  (`AIResponse`), each with an action bar (copy / 👍 / 👎 / regenerate).

### Layout / geometry

Both states share the same vertical bounds (consistent height, only width changes):

- **Compact**: `position: fixed; top: 60px; right: 12px; bottom: 12px; width: 437px`.
  - `top: 60px` = topbar (52px) + 8px gap, keeping it visually connected to the
    trigger icon.
  - `width: 437px` makes the **left edge align with the trade card's left edge**
    (both are right-anchored: trade card left is ~449px from the viewport right,
    so `12 + 437 = 449`). Holds at any viewport width.
- **Expanded**: `top: 60px; right: 12px; bottom: 12px; left: 216px` (sidebar 192px
  + content padding 24px). Same height as compact; only the width grows.
  - Content is constrained to a **centered 720px column** (messages, idle, input);
    the panel itself stays full width (ChatGPT/Claude readable-column pattern).
  - A backdrop fades the main content toward the page background (not a black dim),
    scoped to the content area only (never the side nav or top nav).

### Critical behavior — `pointer-events`

The panel is always mounted (for the slide animation). When **closed** it is
`opacity: 0` **and** `pointer-events: none`; only `.ai-chat-overlay.open .ai-chat-panel`
re-enables pointer events. This is essential — without it the invisible panel sits
over the top-right region (`z-index: 600`) and silently swallows clicks on the
"Create Your First Wallet" card and the trade card's Deposit button.

### Auto-scroll while generating

A `ResizeObserver` on the conversation content scrolls the body to the bottom
whenever content grows (block reveals + typing). A `stickToBottom` ref disables
auto-follow if the user scrolls up and re-enables it near the bottom. Reset to
`true` at the start of each new response.

### User message editing

Hovering a user message reveals **copy** + **edit** icons. Edit replaces the
bubble with a full-width inline field (blue focus border, small Cancel/Save).
Save drops everything after that message and regenerates (`editMessage`).

---

## Response model (`aiChatResponses.ts`)

A response is `{ thought: ThoughtStep[], blocks: Block[] }`.

**Block kinds:** `heading`, `paragraph` (inline `Span`s), `bullets`, `dataCards`,
`table`, `chart`, `followup`.

**Inline `Span`s:** plain string, `{ link }`, `{ mono }`, `{ ref, href }` (a
clickable source chip that opens a link).

**Variants:** `RESPONSE_CAPABILITIES` (what the assistant can do),
`RESPONSE_TEXT` (wallet guide), `RESPONSE_DATA` (metric cards), `RESPONSE_TABLE`
(recent transactions), `RESPONSE_CHART` (6-month value trend). Content is realistic
BitGo mock data.

**Routing — `pickResponse(prompt, turn)`:** keyword match first (with **word
boundaries** — important: without them "g**row**th" falsely matched the table
regex's `rows?`), checked in order chart → table → data → text → capabilities;
falls back to rotating through variants by `turn`.

`SAMPLE_PROMPTS` is exported here and shared by both the chat idle state and the
search palette so they stay in sync.

---

## Rich response rendering (`AIResponse.tsx`)

- **ThoughtProcess** — collapsed by default once done; expand via the chevron.
  While `thinking`, streams steps with skeleton placeholders.
- **Text blocks** type in (`useTyper` reveals characters; `RevealedSpans` renders
  links/mono progressively and pops ref chips in whole once reached). Bullets type
  the intro, then stagger the items in.
- **Visual blocks** (`dataCards`, `table`, `chart`) always **skeleton-load** first
  (`SkeletonGate` shows a shimmer, then the real content).
- **Headings**: Title Case, weight 500, no underline. **Body text**: 16px.
- **Status column** in tables renders as outlined color-coded badges
  (success/warning/danger/neutral by keyword).
- **Tables & charts** scroll horizontally on narrow viewports and fill the column
  when wide. **Data cards** size to content (don't stretch) and scroll if needed.
- Sections are spaced 20px apart; paragraphs 8px; the follow-up sits in its own
  section and uses the primary text color.

Streaming is orchestrated block-by-block: each block animates, and on completion
the next begins; the action bar fades in once all blocks finish. Completed
messages keep their state (they don't re-animate when new messages append).

---

## Search command palette (`SearchPopover.tsx`)

Center-aligned popover (`12vh` from top, max-width 900px). Closes on Escape or
backdrop click; input auto-focuses.

- **Normal mode**: search input (`+` left, **AI Mode** toggle right), category
  chips (Transactions ▾, Wallets, Assets, Addresses ▾, Policies, Reports, Members)
  + a calendar button, and a **Smart Prompts** list.
- **AI Mode** (toggle): the chips/Smart Prompts are replaced by the shared
  `SAMPLE_PROMPTS` (↳ rows). The AI Mode toggle becomes an **X** to exit. The whole
  modal gets a **BitGo-blue gradient outline** drawn once on entry, then reverts to
  the regular border.

### Gradient outline details

- Shared `#searchBorderGrad` (BitGo blue: `#2859EA → #3D65F0 → #5C84FC → #8FB0FF`),
  continuously rotated for a flow/shimmer, plus a soft blue glow (`drop-shadow`).
- **AI Mode toggle hover**: the gradient draws around the button's outline and
  stays animated while hovered. The SVG `rect` uses `rx = ry = half the button
  height` to render a stadium (using `rx/ry` ≥ both width/2 and height/2 produces an
  ellipse — avoid that).
- **Modal in AI Mode**: a one-time `ai-border-draw` keyframe (draw → hold → fade)
  positioned exactly on the 1px border line (no gap).

### Search → chat hand-off

Clicking **any** prompt closes the palette and opens the chat in **default compact
sizing**. Real prompts are passed via `onOpenChat(prompt)` → `App` sets
`chatInitialPrompt` → `AIChatPanel` auto-sends it on open (`initialPrompt` effect →
`generate(prompt, [])`). "View all suggestions" opens the chat without sending.

---

## File map

| Path | What it is |
|---|---|
| `src/components/AIChatPanel.tsx` | Chat panel shell, state, `UserMessage` subcomponent |
| `src/components/AIResponse.tsx` | Thought process, block renderers, status badges, streaming/skeleton |
| `src/components/aiChatResponses.ts` | Response data model, sample variants, `SAMPLE_PROMPTS`, `pickResponse()` |
| `src/components/SearchPopover.tsx` | Search command palette + AI Mode |
| `src/components/Topbar.tsx` | Chat trigger button + profile icon |
| `src/components/Sidebar.tsx` | Search nav item (`onSearchOpen`) |
| `public/bitgo-logo.svg` | BitGo shield logo (used for the idle radial glow) |
| `src/App.tsx` | Wires `chatOpen` / `searchOpen` / `chatInitialPrompt`, ⌘K, renders all three surfaces |

All styling lives in `src/styles/globals.css` under labeled section headers; colors
use design tokens (`var(--token)`) and adapt to light/dark mode.
