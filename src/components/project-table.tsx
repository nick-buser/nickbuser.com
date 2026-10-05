"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Badge, ExtLink } from "@/components/ui";
import {
  CATEGORIES,
  categoryTitle,
  statusTone,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/lib/projects";

/**
 * ProjectTable — the index register. A headless-table pattern in the TanStack
 * mould, hand-rolled because the data is a dozen typed rows: a global search
 * over every visible field, faceted filters behind one menu (OR within a facet,
 * AND across facets, live counts per option), and sortable column headers that
 * cycle asc → desc → curated order.
 *
 * Server-rendered with every row visible; search, filters, and sorting are a
 * hydration enhancement, so the full table is in the initial HTML for no-JS
 * readers and crawlers. Below ~880px the rows reflow into stacked entries.
 */

type LinkKind = "writeup" | "live" | "repo";
type Facet = "category" | "status" | "links";
type SortKey = "title" | "category" | "status";
type Sort = { key: SortKey; desc: boolean } | null;

interface Filters {
  category: ProjectCategory[];
  status: ProjectStatus[];
  links: LinkKind[];
}

const NO_FILTERS: Filters = { category: [], status: [], links: [] };

const STATUSES: ProjectStatus[] = ["Live", "Running", "Built", "In progress"];

const LINK_KINDS: { id: LinkKind; title: string }[] = [
  { id: "writeup", title: "Case study" },
  { id: "live", title: "Live demo" },
  { id: "repo", title: "Public source" },
];

const FACET_TITLES: Record<Facet, string> = {
  category: "Kind",
  status: "Status",
  links: "Has",
};

function hasLink(p: Project, kind: LinkKind): boolean {
  return kind === "writeup" ? Boolean(p.caseStudy) : Boolean(p.links[kind]);
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
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<Sort>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (skip !== "category" && filters.category.length && !filters.category.includes(p.category))
      return false;
    if (skip !== "status" && filters.status.length && !filters.status.includes(p.status))
      return false;
    if (skip !== "links" && !filters.links.every((k) => hasLink(p, k))) return false;
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
    // `passes` closes over tokens + filters, both listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, tokens, filters, sort]);

  // Faceted counts: how many rows each option would leave, given everything
  // else that's applied. "Has" narrows (AND), so its counts include the
  // options already ticked; Kind and Status widen (OR), so theirs don't.
  const groups = [
    ...(showKind
      ? [
          {
            id: "category" as const,
            options: kinds.map((c) => ({
              id: c.id,
              title: c.title,
              count: projects.filter((p) => passes(p, "category") && p.category === c.id).length,
            })),
          },
        ]
      : []),
    {
      id: "status" as const,
      options: STATUSES.filter((s) => projects.some((p) => p.status === s)).map((s) => ({
        id: s,
        title: s,
        count: projects.filter((p) => passes(p, "status") && p.status === s).length,
      })),
    },
    {
      id: "links" as const,
      options: LINK_KINDS.filter((k) => projects.some((p) => hasLink(p, k.id))).map((k) => ({
        id: k.id,
        title: k.title,
        count: projects.filter(
          (p) => passes(p, "links") && [...filters.links, k.id].every((l) => hasLink(p, l)),
        ).length,
      })),
    },
  ];

  const toggle = (facet: Facet, value: string) =>
    setFilters((f) => {
      const list = f[facet] as string[];
      return {
        ...f,
        [facet]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const activeCount = filters.category.length + filters.status.length + filters.links.length;
  const pills = (Object.keys(FACET_TITLES) as Facet[]).flatMap((facet) =>
    (filters[facet] as string[]).map((value) => ({
      facet,
      value,
      label:
        facet === "category"
          ? categoryTitle(value as ProjectCategory)
          : facet === "links"
            ? LINK_KINDS.find((k) => k.id === value)!.title
            : value,
    })),
  );

  const cycleSort = (key: SortKey) =>
    setSort((s) =>
      !s || s.key !== key ? { key, desc: false } : !s.desc ? { key, desc: true } : null,
    );

  // "/" jumps to the search box, the way it does in most index views.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => {
    setQuery("");
    setFilters(NO_FILTERS);
  };

  return (
    <div className="nb-dt">
      <div className="nb-dt__toolbar">
        <label className="nb-dt__search">
          <SearchIcon />
          <span className="sr-only">Search {noun}</span>
          <input
            ref={searchRef}
            type="search"
            placeholder={`Search ${noun}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <FilterMenu
          groups={groups}
          filters={filters}
          activeCount={activeCount}
          onToggle={toggle}
          onClear={() => setFilters(NO_FILTERS)}
        />
      </div>

      <div className="nb-dt__status">
        <p className="nb-dt__count" aria-live="polite">
          {rows.length === projects.length
            ? `${projects.length} ${noun}`
            : `${rows.length} of ${projects.length} ${noun}`}
        </p>
        {pills.length ? (
          <ul className="nb-dt__pills" aria-label="Active filters">
            {pills.map((p) => (
              <li key={`${p.facet}:${p.value}`}>
                <button
                  type="button"
                  className="nb-dt__pill"
                  onClick={() => toggle(p.facet, p.value)}
                  aria-label={`Remove filter ${FACET_TITLES[p.facet]}: ${p.label}`}
                >
                  <span className="nb-dt__pill-facet">{FACET_TITLES[p.facet]}</span>
                  {p.label}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
                {p.caseStudy ? (
                  <Link href={`/work/${p.caseStudy}`} className="nb-extlink">
                    Case study →
                  </Link>
                ) : null}
                {p.links.live ? <ExtLink href={p.links.live}>Live</ExtLink> : null}
                {p.links.repo ? <ExtLink href={p.links.repo}>Source</ExtLink> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 ? (
        <p className="nb-empty">
          Nothing matches that.{" "}
          <button type="button" className="nb-dt__reset" onClick={reset}>
            Clear search and filters
          </button>
        </p>
      ) : null}
    </div>
  );
}

/** The title links to the deepest thing there is: case study, then demo, then source. */
function ProjectTitle({ project: p }: { project: Project }) {
  if (p.caseStudy) {
    return (
      <Link href={`/work/${p.caseStudy}`} className="nb-dt__title">
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

interface FilterGroup {
  id: Facet;
  options: { id: string; title: string; count: number }[];
}

function FilterMenu({
  groups,
  filters,
  activeCount,
  onToggle,
  onClear,
}: {
  groups: FilterGroup[];
  filters: Filters;
  activeCount: number;
  onToggle: (facet: Facet, value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Light dismiss: a press outside the menu or Escape closes it (Escape hands
  // focus back to the button so keyboard users aren't stranded).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="nb-fmenu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`nb-fmenu__button${activeCount ? " is-active" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <FilterIcon />
        Filter
        {activeCount ? <span className="nb-fmenu__badge">{activeCount}</span> : null}
      </button>

      <div id={panelId} className="nb-fmenu__panel" hidden={!open}>
        {groups.map((g) => (
          <fieldset key={g.id} className="nb-fmenu__group">
            <legend>{FACET_TITLES[g.id]}</legend>
            {g.options.map((o) => {
              const checked = (filters[g.id] as string[]).includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`nb-fmenu__option${o.count === 0 && !checked ? " is-empty" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(g.id, o.id)}
                  />
                  <span>{o.title}</span>
                  <span className="nb-fmenu__n">{o.count}</span>
                </label>
              );
            })}
          </fieldset>
        ))}
        <div className="nb-fmenu__foot">
          <button type="button" onClick={onClear} disabled={!activeCount}>
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Three rules of diminishing length — the filter-list "hamburger". */
function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4h12M4.5 8h7M7 12h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
