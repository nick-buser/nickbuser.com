# Design brief — for the Claude design session

## What this is

The personal site for Nick Buser (`nickbuser.com`). The heart of it is
**long-form, highly visual, interactive writeups** — *"Medium-quality writing,
but with real custom visuals."* Two content types, **Work** (project case
studies) and **Writing** (notes/essays), plus **Home** and **About**.

## Already decided — please don't redesign

- **Information architecture / routes:** Home, Work (index + detail), Writing
  (index + detail), About.
- Content is authored in MDX; bespoke interactive components embed inline.
- A **⌘K command palette** handles navigation/search.
- **Static-first.** A fast, calm reading experience is a hard requirement; heavy
  global client-side JS is out of scope.

## What the design session owns

Everything visual, and above all the reading experience:

- **Visual language** — type system, color, spacing, motion. The code already
  reads from semantic CSS variables (`--background`, `--foreground`, `--muted`,
  `--muted-foreground`, `--border`, `--accent`) in `src/app/globals.css`. Fill
  these; add more tokens as needed.
- **Long-form reading layout — the single most important screen.** Measure / line
  length, heading hierarchy, figures + captions, footnotes, pull quotes, code
  blocks, a table of contents with sticky reading progress, "time to read."
- **How interactive islands sit in the flow** — full-bleed vs. inset, captioning,
  light/dark behavior, the frame around a live diagram or chart.
- **Work** — index cards and the case-study detail (hero, metadata for
  role/timeframe/stack/links, section rhythm).
- **Home** — hero + selected work + recent writing.
- Header, footer, nav, the **⌘K palette** styling, focus states, motion.
- **Dark mode** (tokens are already wired to `prefers-color-scheme`).
- Empty / loading states.

## Component inventory to design

- Reading container (prose) + every MDX element: `h1–h4`, lists, blockquote,
  inline + block code, tables, links
- **Figure + caption** wrapper for islands
- **Callout** (`note` / `tip` / `warn`)
- **Work card**, **Writing list row**
- Tag / stack **chips**
- **Command palette** — input, groups, items, empty state
- Header, footer
- Hero (home), case-study header

## Tone / direction (open — bring options)

Technical, calm, content-first. Visuals should feel *engineered*, not decorative.
Worth exploring: high-craft engineering blogs and explorable-explanation sites,
strong editorial typography. This is deliberately open — propose a few distinct
directions.

## Constraints

- Keep it **static-first**; no heavy global client JS.
- **Accessibility:** real focus management, sufficient contrast,
  `prefers-reduced-motion` respected.
- Interactivity must **serve the content.**

## Practical handoff notes

- Set tokens in `src/app/globals.css` (`:root` + the dark-mode block).
- Prose is styled today by `@tailwindcss/typography` (`prose dark:prose-invert`).
  Override it heavily or replace it — your call.
- The islands (`src/components/islands/*`) are **real React components with live
  behavior** — design around how they actually move, not screenshots.
- The current UI is an intentionally plain, working placeholder. Nothing visual
  is precious; replace freely.
