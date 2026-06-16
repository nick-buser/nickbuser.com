# Architecture

## Goal

A content-rich personal site whose heart is long-form, interactive project
case studies and writing — "Medium-quality writing, but with real custom
visuals." Static-first, fast, cheap to run, easy to author.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Content | MDX via `next-mdx-remote/rsc` (compiled at build time) |
| Validation | `zod` (frontmatter today; API contracts later) |
| Async client data | TanStack Query (only where data is genuinely async) |
| Command palette | `cmdk` (⌘K) |
| Interactive viz | `d3` + `@xyflow/react` (React Flow) |
| Code highlighting | `shiki` via `rehype-pretty-code` |
| Hosting | Vercel · domain `nickbuser.com` |

## Rendering strategy

- **Static by default (SSG).** Content routes use `generateStaticParams` and
  prerender at build. The whole site currently builds to static HTML.
- **Islands architecture.** The shell (nav, footer) and prose are server-rendered
  HTML. Only interactive islands ship JavaScript and hydrate.
- ISR / revalidation is reserved for any future dynamic data — not needed for
  content.

## Content layer

- Files: `content/<collection>/<slug>.mdx` (`work`, `writing`).
- `src/lib/content.ts` reads files, parses frontmatter with `gray-matter`,
  validates with `zod`, and returns typed docs. **Invalid frontmatter throws and
  fails the build** rather than shipping broken.
- `draft: true` posts are hidden in production, visible in dev.
- `import "server-only"` guards the module from being pulled into a client bundle.

See [CONTENT-MODEL.md](./CONTENT-MODEL.md).

## Interactive islands

- Live in `src/components/islands/*`, are `"use client"`, and are registered in
  `src/components/mdx/components.tsx` so they can be used directly inside MDX.
- **Rule of thumb:** an island should illustrate *real* data or architecture.
  Static frame, interactive islands — not interactivity for decoration.

## Backend / API rules

- The site needs **no database and no backend at launch.**
- If/when live data is added (e.g. GitHub activity, now-playing):
  1. Define an **OpenAPI contract** with the backend service.
  2. Generate a typed client from the contract.
  3. Next route handlers act only as a **thin BFF / proxy — they never speak to a
     database directly** (matches the existing personal-stack convention of
     `*-web` + `*-api` splits).
  4. Consume via TanStack Query on the client, or in RSC server-side, depending on
     freshness needs.

## SEO / distribution

- Per-route metadata with templated titles (`%s · Nick Buser`).
- `sitemap.ts`, `robots.ts`, and `/feed.xml` (RSS) are wired.
- **TODO:** per-post Open Graph images via `next/og`.

## Deployment

- GitHub `nick-buser/nickbuser.com` → Vercel project under team *Nick's projects*
  (`team_1u6oxnhYpVwhkUExZakgkZI6`).
- Production domain `nickbuser.com` + `www` with a canonical redirect.
- Preview deployment per pull request.
