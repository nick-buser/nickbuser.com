"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { SectionLabel } from "@/components/ui";
import { SECTIONS, type Project, type ProjectSection } from "@/lib/projects";

/**
 * WorkBrowser — the work surface. Renders the project cards grouped into titled,
 * rule-delimited sections, with a search box (over name, blurb, and stack) and
 * section filter chips to narrow what's shown. Server-rendered with everything
 * visible; the search and chips are a hydration enhancement, so the cards are in
 * the initial HTML for no-JS readers and crawlers.
 */
export function WorkBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ProjectSection[]>([]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      items: projects.filter((p) => {
        if (p.section !== s.id) return false;
        if (active.length && !active.includes(p.section)) return false;
        if (!needle) return true;
        return (
          p.title.toLowerCase().includes(needle) ||
          p.result.toLowerCase().includes(needle) ||
          p.stack.some((tech) => tech.toLowerCase().includes(needle))
        );
      }),
    })).filter((g) => g.items.length > 0);
  }, [projects, query, active]);

  const toggle = (id: ProjectSection) =>
    setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <div>
      <div className="nb-workbar">
        <input
          type="search"
          className="nb-search"
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search projects by name, description, or stack"
        />
        <div className="nb-filters" role="group" aria-label="Filter by kind">
          {SECTIONS.map((s) => {
            const on = active.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className={`nb-filterchip${on ? " is-active" : ""}`}
                aria-pressed={on}
                onClick={() => toggle(s.id)}
              >
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="nb-empty">Nothing matches that.</p>
      ) : (
        groups.map((g, i) => (
          <section key={g.id} className="nb-work-section">
            {i > 0 ? <hr className="nb-rule nb-work-section__rule" /> : null}
            <SectionLabel>{g.title}</SectionLabel>
            <div className="nb-cards">
              {g.items.map((p) => (
                <ProjectCard key={p.title} project={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
