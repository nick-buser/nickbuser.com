# Content model

Content lives as MDX files under `content/`. Frontmatter is validated by `zod`
schemas in `src/lib/content.ts` — a malformed post fails the build.

## Collections

- **`work`** — project writeups (richer frontmatter). Index at `/work`
  ("Writeups"), detail at `/work/<slug>`.
- **`writing`** — notes and essays, served as the blog at `/blog` and
  `/blog/<slug>` (the old `/writing` paths redirect).

Projects themselves are not MDX: they are typed rows in `src/lib/projects.ts`,
each with a `category` (`platform` | `software` | `modelling` | `essay`). Platform,
software, and formal modelling are the home page's sections, in that order,
each as two-column cards (`HOME_TOPICS`); visual essays get their own page at
`/visual-essays`, which keeps the searchable table. A project
row can point into a writeup with `writeup: "<slug>"` or
`"<slug>#<section-id>"`.

Categories are *topics* — clusters by the kind of work, never by where it
runs: a cloud platform project belongs in `platform` exactly as the homelab
does. A row is a program-sized project with its own goal. The parts of a
project (its deploy path, its database setup, its operator CLI) are described
in its card and writeup, never given rows of their own. Titles say what the
thing is to a reader with no context; internal names belong inside a writeup. There is deliberately no tag filtering — the table
filters on category, status, and which links a project has.

## Frontmatter

Shared by both collections:

| field | type | required | notes |
| --- | --- | --- | --- |
| `title` | string | ✅ | |
| `description` | string | ✅ | meta description + card subtitle |
| `date` | date | ✅ | `YYYY-MM-DD` |
| `updated` | date | | drives `lastModified` in sitemap |
| `tags` | string[] | | defaults to `[]` |
| `draft` | boolean | | hidden in production |
| `cover` | string | | image path |

`writing` (the blog) adds:

| field | type | required | notes |
| --- | --- | --- | --- |
| `topic` | `platform` \| `software` \| `modelling` | | the blog's filter, alongside year; posts without one file under "Other". Never free tags. |

`work` adds:

| field | type | required | notes |
| --- | --- | --- | --- |
| `summary` | string | ✅ | one-line card summary |
| `role` | string | | |
| `timeframe` | string | | e.g. `2025–2026` |
| `stack` | string[] | | rendered as chips |
| `featured` | boolean | | surfaced on the home page |
| `links.live` | url | | |
| `links.repo` | url | | |

## Authoring a new writeup

1. Create `content/writing/my-post.mdx` (or `content/work/my-project.mdx`).
2. Add frontmatter. The build fails loudly if it's invalid.
3. Write Markdown (GFM). Embed islands as components.
4. Work in progress? Set `draft: true`.

## Components available inside MDX

- `<Callout type="note|tip|warn">…</Callout>`
- `<D3BarChart />` — d3 example; pass `data={[{ label, value }]}`
- `<FlowDiagram />` — React Flow example; pass `nodes` / `edges`
- Standard Markdown + GFM, autolinked headings, and syntax-highlighted code
  fences (```ts).

**Add a component:** create it (mark `"use client"` if interactive) under
`src/components/islands/`, then register it in
`src/components/mdx/components.tsx`.
