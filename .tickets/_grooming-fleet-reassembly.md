---
title: Fleet Reassembly — nick_buser_personal_site slice (grooming)
status: open
---

## Context

**This repo's slice of a three-loop, 41-ticket initiative.** The index and
the goal-side queue live in `nick-b/atlas`:
`atlas/.tickets/_grooming-fleet-reassembly.md` (+ `atlas/docs/fleet-reassembly.md`,
`atlas/docs/conventions.md`). Seeded here 2026-08-29 because the atlas loop
does not implement foreign-repo tickets — it reports them, and they are
claimed in the repo that owns the code. Until now that ticket existed only
inside atlas's grooming doc, where this repo's loop could not see it.

**Why the shared package exists:** Athanor — the pigment → semantic design
system born in memory-palace-app — was copy-pasted into six repos. Six
copies means a skin change is six PRs and a drift bug is invisible. It is
now `@atlas/tokens`, published to the homelab Gitea npm registry.

**Numbers below are provisional.** `/branch-new` recomputes at claim time;
the `G3x` labels are the atlas index's names, not branch names.

## Dependency — **GREEN as of 2026-08-29**

```bash
curl -s -o /dev/null -w '%{http_code}' \
  'https://git.bittern-chameleon.dev/api/packages/nick-b/npm/@atlas%2Ftokens'
# 200  ->  eligible.   404  ->  not published yet, not eligible.
```

`@atlas/tokens@0.1.0` published from atlas `v0.1.0` (tickets G1 PR #1,
G2 PR #2, F2 PR #3, G8 PR #4). Published tarball contains
`dist/{athanor,tailwind,fonts,categorical}.css`, `dist/index.js`,
`dist/index.d.ts`.

### Registry wiring (identical in every consumer)

`.npmrc` — **repo root. This repo has a root `package.json` + `pnpm-workspace.yaml` (Next 16), so a root-level `.npmrc` is read. Verified 2026-08-29.**

The scope must be pointed at Gitea or install looks for `@atlas/tokens` on
npmjs.com and fails with `ERR_PNPM_FETCH_404 GET
https://registry.npmjs.org/@atlas%2Ftokens`. pnpm resolves config from the
project dir and the workspace root only; a repo whose root is *not* a pnpm
project never sees a root-level `.npmrc`. Verified per repo, not assumed —
G3a hit exactly this (memory-palace-app's root is a Python project):

```
@atlas:registry=https://git.bittern-chameleon.dev/api/packages/nick-b/npm/
```

The package is public on that registry; reads need no token. Only atlas's
own publish step needs `NODE_AUTH_TOKEN`.

### What the package gives you

| import | use |
|---|---|
| `@atlas/tokens/athanor.css` | the tokens alone — pigments, 17 semantic colours, 3 font families, space/radius/type scales |
| `@atlas/tokens/tailwind.css` | **the one to use here** — a Tailwind v4 `@theme` bridge that itself imports `athanor.css`, so `bg-surface` / `text-foreground` / `border-border` resolve to the semantic vars |
| `@atlas/tokens/fonts.css` | opt-in Google Fonts fetch for Fraunces / Spectral / JetBrains Mono. **Import first, before anything else** — CSS ignores an import at-rule that does not precede every other rule |
| `@atlas/tokens/categorical.css` + `defineCategorical()` | domain colour (service classes, supply types) — content the design system deliberately does not own |

Import exactly one of `athanor.css` / `tailwind.css`, once, before your
own CSS.

### Two behaviour changes to expect

1. **The package adds an OS light fallback the copy never had.** The
   copied `colors.css` had `:root` (dark) + `:root[data-theme="light"]`
   and no `prefers-color-scheme` query. The package adds one. Any app that
   was effectively dark-only will start following the OS on the day it
   migrates — so **pin `<html data-theme="dark">`** unless light is wanted.
   conventions §4: theme selection is the tenant's.
2. **`athanor.css` no longer fetches webfonts.** The copy's `fonts.css`
   was imported first and worked; when the six files were concatenated for
   the package the fetch landed at line 223 where CSS ignored it (found by
   the F2 review, fixed by G8). Fonts are now the tenant's — either import
   `@atlas/tokens/fonts.css` first, `<link>` them from your HTML, or
   self-host. Do nothing and you get the fallback stacks, silently.

## Ticket — adopt `@atlas/tokens` (atlas index: **G3e**)

**Tier:** T0 as filed in the atlas index — **argue for T1 at claim time**,
see below · **Repo:** nick_buser_personal_site · **Deps:** the probe above
(green) + G3a merged (donor diff, partially transferable)

**The atlas index's scope for this ticket is wrong, and the correction is
the ticket's main content.** G3e reads "replace the local `styles/athanor/`
directory ... delete the copy," with the acceptance criterion
`find . -iname '*athanor*'` is empty. Neither matches this repo:

- **There is no `styles/athanor/` directory here.** Athanor is *inlined*
  into a single 975-line `src/app/globals.css`. The tokens occupy roughly
  lines 4–190: a dark `:root` block, a
  `:root[data-theme="light"], .theme-light` block, and an
  `@theme inline` bridge at line 174. All 17 contract colours are present.
  The rest of the file (~lines 190–975) is this site's own layout,
  typography, reading-column, diagram and motion CSS — **it is not
  Athanor and must not be deleted.** So the work is an *extraction* from
  the middle of a live stylesheet, not a directory swap. That is why the
  T0 tier is worth re-arguing.
- **`find . -iname '*athanor*'` will never be empty**, and should not be:
  `src/components/islands/athanor-flow.tsx` is a *component named after*
  the design system, not a copy of it. A criterion that demands its
  deletion is wrong. Use the token-level criteria below instead.
- **This repo is on GitHub** (`git@github.com:nick-buser/nickbuser.com.git`),
  not the homelab Gitea — no Woodpecker pipeline, no `tea`. Gates run
  locally or in GitHub Actions; the sibling repos' CI assumptions do not
  transfer.
- **Next 16 + React 19 + Tailwind v4**, not Vite. The import goes in
  `src/app/globals.css`, which currently starts `@import "tailwindcss";`.

**Scope:**
- `.npmrc` registry line (above)
- in `src/app/globals.css`: replace the inlined token blocks with
  `@import "@atlas/tokens/tailwind.css";`, keeping everything below them
- **`@theme inline` vs `@theme`** — this file uses `@theme inline` at line
  174; the package ships plain `@theme`. Resolve deliberately and record
  which won and why. `inline` changes how Tailwind resolves the values,
  so this is a real decision, not a formatting detail
- `src/app/layout.tsx` sets `data-theme` — pin `dark` if the site was
  dark-only, since the package adds the OS light fallback

**Acceptance criteria:**
- [ ] `pnpm build && pnpm lint` green (this repo has no `test` script) (substrate: unit)
- [ ] `src/app/globals.css` contains no local definition of any of the 17 §4 colour names — `grep -cE -- '--(background|foreground|surface|surface-warm|muted|muted-foreground|border|rule-warm|rule-cool|accent|accent-sacred|accent-gleam|link|positive|danger|ember-wash|ember-wash-strong):' src/app/globals.css` is 0 (substrate: unit)
- [ ] built CSS contains `--rubedo` (the package arrived) (substrate: unit)
- [ ] the site renders dark by default and the light toggle still works, both spot-checked (substrate: deployed)
- [ ] `src/components/islands/athanor-flow.tsx` still exists and still builds — it is a component, not a copy (substrate: unit)

## Notes

- **Never vendor the package back into this repo.** The package is the
  source; a local copy is the thing this initiative exists to delete.
- Report friction into this file's Notes rather than working around it
  silently — this workflow is being dogfooded on purpose.
- Sibling slices seeded the same day: memory-palace-app, knowledge-mapping,
  metaphor-explorer, crucible, nick_buser_personal_site (tokens adoption);
  philosophy_explorer (workbench split); homelab-gitops (k3s onboard);
  swe-interview-prep (formal-CS pack).
