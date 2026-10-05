"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * The controls every index view shares — the project table and the blog alike:
 * a search box ("/" jumps to it), one filter menu of faceted checkboxes with
 * live counts, and a status line with the result count and removable pills.
 * Headless about the data: callers own the state and the matching, these only
 * render it, so every index looks and behaves the same.
 */

export interface FacetGroup {
  id: string;
  title: string;
  options: { id: string; title: string; count: number }[];
}

/** Selected option ids, keyed by facet group id. */
export type FacetSelection = Record<string, string[]>;

export function countSelected(selection: FacetSelection): number {
  return Object.values(selection).reduce((n, values) => n + values.length, 0);
}

/** Toggle one option in a selection, immutably. */
export function toggleFacet(
  selection: FacetSelection,
  group: string,
  value: string,
): FacetSelection {
  const list = selection[group] ?? [];
  return {
    ...selection,
    [group]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
  };
}

export function IndexToolbar({
  noun,
  query,
  onQuery,
  groups,
  selection,
  onToggle,
  onClear,
}: {
  /** Plural noun for the placeholder, e.g. "projects" or "posts". */
  noun: string;
  query: string;
  onQuery: (q: string) => void;
  groups: FacetGroup[];
  selection: FacetSelection;
  onToggle: (group: string, value: string) => void;
  onClear: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="nb-dt__toolbar">
      <label className="nb-dt__search">
        <SearchIcon />
        <span className="sr-only">Search {noun}</span>
        <input
          ref={searchRef}
          type="search"
          placeholder={`Search ${noun}…`}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd aria-hidden="true">/</kbd>
      </label>
      <FilterMenu groups={groups} selection={selection} onToggle={onToggle} onClear={onClear} />
    </div>
  );
}

export function IndexStatus({
  shown,
  total,
  noun,
  groups,
  selection,
  onToggle,
}: {
  shown: number;
  total: number;
  noun: string;
  groups: FacetGroup[];
  selection: FacetSelection;
  onToggle: (group: string, value: string) => void;
}) {
  const pills = groups.flatMap((g) =>
    (selection[g.id] ?? []).map((value) => ({
      group: g,
      value,
      label: g.options.find((o) => o.id === value)?.title ?? value,
    })),
  );
  return (
    <div className="nb-dt__status">
      <p className="nb-dt__count" aria-live="polite">
        {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
      </p>
      {pills.length ? (
        <ul className="nb-dt__pills" aria-label="Active filters">
          {pills.map((p) => (
            <li key={`${p.group.id}:${p.value}`}>
              <button
                type="button"
                className="nb-dt__pill"
                onClick={() => onToggle(p.group.id, p.value)}
                aria-label={`Remove filter ${p.group.title}: ${p.label}`}
              >
                <span className="nb-dt__pill-facet">{p.group.title}</span>
                {p.label}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** The empty state, with a way back out of it. */
export function IndexEmpty({ onReset }: { onReset: () => void }) {
  return (
    <p className="nb-empty">
      Nothing matches that.{" "}
      <button type="button" className="nb-dt__reset" onClick={onReset}>
        Clear search and filters
      </button>
    </p>
  );
}

function FilterMenu({
  groups,
  selection,
  onToggle,
  onClear,
}: {
  groups: FacetGroup[];
  selection: FacetSelection;
  onToggle: (group: string, value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const activeCount = countSelected(selection);

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
            <legend>{g.title}</legend>
            {g.options.map((o) => {
              const checked = (selection[g.id] ?? []).includes(o.id);
              return (
                <label
                  key={o.id}
                  className={`nb-fmenu__option${o.count === 0 && !checked ? " is-empty" : ""}`}
                >
                  <input type="checkbox" checked={checked} onChange={() => onToggle(g.id, o.id)} />
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
      <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
