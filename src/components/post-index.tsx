"use client";

import { useMemo, useState } from "react";
import { DocList, type DocListItem } from "@/components/doc-list";
import {
  IndexEmpty,
  IndexStatus,
  IndexToolbar,
  toggleFacet,
  type FacetGroup,
  type FacetSelection,
} from "@/components/index-controls";

export interface PostEntry extends DocListItem {
  year: number;
  /** Topic id and its display title; posts without a topic file under "Other". */
  topic?: { id: string; title: string };
}

const OTHER = { id: "other", title: "Other" };

/**
 * PostIndex — the blog's list with the shared index controls: search over
 * title, description, and topic, and filters by topic and year (no tags —
 * the topics are the site's own short, fixed list). Server-rendered with
 * every post visible; filtering is a hydration enhancement.
 */
export function PostIndex({ posts }: { posts: PostEntry[] }) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<FacetSelection>({});

  const tokens = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const topicOf = (p: PostEntry) => p.topic ?? OTHER;

  /** Does a post pass the search and every facet except `skip`? */
  const passes = (p: PostEntry, skip?: "topic" | "year") => {
    const hay = `${p.title} ${p.description} ${topicOf(p).title}`.toLowerCase();
    if (tokens.length && !tokens.every((t) => hay.includes(t))) return false;
    const topics = selection.topic ?? [];
    if (skip !== "topic" && topics.length && !topics.includes(topicOf(p).id)) return false;
    const years = selection.year ?? [];
    if (skip !== "year" && years.length && !years.includes(String(p.year))) return false;
    return true;
  };

  const shown = posts.filter((p) => passes(p));

  const topics = [...new Map(posts.map((p) => [topicOf(p).id, topicOf(p)])).values()];
  const years = [...new Set(posts.map((p) => p.year))].sort((a, b) => b - a);
  const groups: FacetGroup[] = [
    {
      id: "topic",
      title: "Topic",
      options: topics.map((t) => ({
        id: t.id,
        title: t.title,
        count: posts.filter((p) => passes(p, "topic") && topicOf(p).id === t.id).length,
      })),
    },
    {
      id: "year",
      title: "Year",
      options: years.map((y) => ({
        id: String(y),
        title: String(y),
        count: posts.filter((p) => passes(p, "year") && p.year === y).length,
      })),
    },
  ];

  const toggle = (group: string, value: string) =>
    setSelection((sel) => toggleFacet(sel, group, value));

  return (
    <div>
      <IndexToolbar
        noun="posts"
        query={query}
        onQuery={setQuery}
        groups={groups}
        selection={selection}
        onToggle={toggle}
        onClear={() => setSelection({})}
      />
      <IndexStatus
        shown={shown.length}
        total={posts.length}
        noun="posts"
        groups={groups}
        selection={selection}
        onToggle={toggle}
      />
      {posts.length > 0 && shown.length === 0 ? (
        <IndexEmpty
          onReset={() => {
            setQuery("");
            setSelection({});
          }}
        />
      ) : (
        <DocList items={shown} />
      )}
    </div>
  );
}
