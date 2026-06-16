# nickbuser.com

Personal site for Nick Buser — interactive, deeply-illustrated project case
studies and writing. Static-first Next.js with an MDX content layer.

## Stack

Next.js 16 (App Router / RSC) · TypeScript · Tailwind v4 · MDX
(`next-mdx-remote`) · zod-validated frontmatter · TanStack Query · cmdk (⌘K) ·
d3 + React Flow islands · shiki. Deployed on Vercel.

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build (currently fully static)
pnpm lint
```

## Structure

```
content/            # MDX writeups
  work/             #   project case studies
  writing/          #   notes & essays
src/
  app/              # routes (home, work, writing, about) + sitemap/robots/feed
  components/
    islands/        # interactive "use client" viz (d3, React Flow)
    mdx/            # MDX renderer + component map
  lib/
    content.ts      # zod-validated content loader (server-only)
    site.ts         # site-wide metadata
docs/               # planning docs ↓
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical decisions & rendering strategy
- [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) — frontmatter schema & how to author
- [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) — brief for the design session
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased plan

## Adding a writeup

Drop an `.mdx` file in `content/work/` or `content/writing/` with valid
frontmatter (see CONTENT-MODEL). Embed islands inline, e.g. `<D3BarChart />` or
`<FlowDiagram />`. Invalid frontmatter fails the build.

## Status

**Phase 0 (foundation) complete** — design and real content come next. The
current UI is an intentionally plain, working placeholder.
