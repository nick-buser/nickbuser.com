"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, ExtLink } from "@/components/ui";
import {
  IndexEmpty,
  IndexStatus,
  IndexToolbar,
  toggleFacet,
  type FacetGroup,
  type FacetSelection,
} from "@/components/index-controls";
import {
  CATEGORIES,
  categoryTitle,
  statusTone,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";

/**
 * ProjectTable — the index register. A headless-table pattern in the TanStack
 * mould, hand-rolled because the data is a dozen typed rows: a global search
 * over every visible field, faceted filters behind one menu (OR within a facet,
 * AND across facets, live counts per option), and sortable column headers that
 * cycle asc → desc → curated order. The search and filter controls are the
 * shared index controls, so this and the blog behave the same.
 *
 * Server-rendered with every row visible; search, filters, and sorting are a
 * hydration enhancement, so the full table is in the initial HTML for no-JS
 * readers and crawlers. Below ~880px the rows reflow into stacked entries.
 */

type LinkKind = "writeup" | "live" | "repo";
type Facet = "category" | "status" | "links";
type SortKey = "title" | "category" | "status";
type Sort = { key: SortKey; desc: boolean } | null;

const STATUSES: ProjectStatus[] = ["Live", "Running", "Built", "In progress"];

const LINK_KINDS: { id: LinkKind; title: string }[] = [
  { id: "writeup", title: "Writeup" },
  { id: "live", title: "Live demo" },
  { id: "repo", title: "Public source" },
];

function hasLink(p: Project, kind: LinkKind): boolean {
  return kind === "writeup" ? Boolean(p.writeup) : Boolean(p.links[kind]);
}

function haystack(p: Project): string {
  return [p.title, p.result, categoryTitle(p.category), p.status, ...p.stack]
    .join(" ")
    .toLowerCase();
}

const sorters: Record<SortKey, (a: Project, b: Project) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  category: (a, b) =>
    CATEGORIES.findIndex((c) => c.id === a.category) -
    CATEGORIES.findIndex((c) => c.id === b.category),
  status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status),
};

export function ProjectTable({
  projects,
  caption,
  noun = "projects",
}: {
  projects: Project[];
  /** Accessible table caption (visually hidden). */
  caption: string;
  /** Plural noun for the result count, e.g. "projects" or "essays". */
  noun?: string;
}) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<FacetSelection>({});
  const [sort, setSort] = useState<Sort>(null);
  const picked = (facet: Facet) => selection[facet] ?? [];

  // A facet only earns a place in the menu (and a column) if it can split the
  // rows — a single-kind table hides "Kind" altogether.
  const kinds = useMemo(
    () => CATEGORIES.filter((c) => projects.some((p) => p.category === c.id)),
    [projects],
  );
  const showKind = kinds.length > 1;

  const hay = useMemo(() => new Map(projects.map((p) => [p, haystack(p)])), [projects]);
  const tokens = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  /** Does a row pass the search and every facet except `skip`? */
  const passes = (p: Project, skip?: Facet) => {
    if (tokens.length && !tokens.every((t) => hay.get(p)!.includes(t))) return false;
    const category = picked("category");
    if (skip !== "category" && category.length && !category.includes(p.category)) return false;
    const status = picked("status");
    if (skip !== "status" && status.length && !status.includes(p.status)) return false;
    if (skip !== "links" && !picked("links").every((k) => hasLink(p, k as LinkKind)))
      return false;
    return true;
  };

  const rows = useMemo(() => {
    const kept = projects.filter((p) => passes(p));
    if (!sort) return kept;
    const cmp = sorters[sort.key];
    const order = new Map(projects.map((p, i) => [p, i]));
    return [...kept].sort(
      (a, b) => (sort.desc ? -cmp(a, b) : cmp(a, b)) || order.get(a)! - order.get(b)!,
    );
    // `passes` closes over tokens + selection, both listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, tokens, selection, sort]);

  // Faceted counts: how many rows each option would leave, given everything
  // else that's applied. "Has" narrows (AND), so its counts include the
  // options already ticked; Kind and Status widen (OR), so theirs don't.
  const groups: FacetGroup[] = [
    ...(showKind
      ? [
          {
            id: "category",
            title: "Kind",
            options: kinds.map((c) => ({
              id: c.id,
              title: c.title,
              count: projects.filter((p) => passes(p, "category") && p.category === c.id).length,
            })),
          },
        ]
      : []),
    {
      id: "status",
      title: "Status",
      options: STATUSES.filter((s) => projects.some((p) => p.status === s)).map((s) => ({
        id: s,
        title: s,
        count: projects.filter((p) => passes(p, "status") && p.status === s).length,
      })),
    },
    {
      id: "links",
      title: "Has",
      options: LINK_KINDS.filter((k) => projects.some((p) => hasLink(p, k.id))).map((k) => ({
        id: k.id,
        title: k.title,
        count: projects.filter(
          (p) =>
            passes(p, "links") &&
            [...picked("links"), k.id].every((l) => hasLink(p, l as LinkKind)),
        ).length,
      })),
    },
  ];

  const toggle = (group: string, value: string) =>
    setSelection((sel) => toggleFacet(sel, group, value));

  const cycleSort = (key: SortKey) =>
    setSort((s) =>
      !s || s.key !== key ? { key, desc: false } : !s.desc ? { key, desc: true } : null,
    );

  const reset = () => {
    setQuery("");
    setSelection({});
  };

  return (
    <div className="nb-dt">
      <IndexToolbar
        noun={noun}
        query={query}
        onQuery={setQuery}
        groups={groups}
        selection={selection}
        onToggle={toggle}
        onClear={() => setSelection({})}
      />
      <IndexStatus
        shown={rows.length}
        total={projects.length}
        noun={noun}
        groups={groups}
        selection={selection}
        onToggle={toggle}
      />

      <table className="nb-dt__table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <SortHeader label="Project" sortKey="title" sort={sort} onSort={cycleSort} />
            {showKind ? (
              <SortHeader label="Kind" sortKey="category" sort={sort} onSort={cycleSort} />
            ) : null}
            <th scope="col">Stack</th>
            <SortHeader label="Status" sortKey="status" sort={sort} onSort={cycleSort} />
            <th scope="col">
              <span className="sr-only">Links</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.title}>
              <td className="nb-dt__project">
                <ProjectTitle project={p} />
                <span className="nb-dt__blurb">{p.result}</span>
              </td>
              {showKind ? (
                <td className="nb-dt__kind">{categoryTitle(p.category)}</td>
              ) : null}
              <td className="nb-dt__stack">{p.stack.join(" · ")}</td>
              <td className="nb-dt__state">
                <Badge tone={statusTone(p.status)}>{p.status}</Badge>
              </td>
              <td className="nb-dt__links">
                {p.writeup ? (
                  <Link href={`/work/${p.writeup}`} className="nb-extlink">
                    Writeup →
                  </Link>
                ) : null}
                {p.links.live ? <ExtLink href={p.links.live}>Live</ExtLink> : null}
                {p.links.repo ? <ExtLink href={p.links.repo}>Source</ExtLink> : null}
                {p.links.template ? <ExtLink href={p.links.template}>Template</ExtLink> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 ? <IndexEmpty onReset={reset} /> : null}
    </div>
  );
}

/** The title links to the deepest thing there is: writeup, then demo, then source. */
function ProjectTitle({ project: p }: { project: Project }) {
  if (p.writeup) {
    return (
      <Link href={`/work/${p.writeup}`} className="nb-dt__title">
        {p.title}
      </Link>
    );
  }
  const href = p.links.live ?? p.links.repo;
  return href ? (
    <a href={href} className="nb-dt__title" target="_blank" rel="noreferrer">
      {p.title}
    </a>
  ) : (
    <span className="nb-dt__title">{p.title}</span>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  const current = sort && sort.key === sortKey ? sort : null;
  const dir = current ? (current.desc ? "descending" : "ascending") : "none";
  return (
    <th scope="col" aria-sort={dir}>
      <button type="button" className="nb-dt__sort" onClick={() => onSort(sortKey)}>
        {label}
        <span className={`nb-dt__sort-mark${current ? " is-active" : ""}`} aria-hidden="true">
          {current ? (current.desc ? "↓" : "↑") : "↕"}
        </span>
      </button>
    </th>
  );
}
