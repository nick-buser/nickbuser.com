# Content model

Content lives as MDX files under `content/`. Frontmatter is validated by `zod`
schemas in `src/lib/content.ts` — a malformed post fails the build.

## Collections

- **`work`** — project case studies (richer frontmatter).
- **`writing`** — notes and essays.

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
