import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

/**
 * File-based content layer.
 *
 * Writeups live as MDX under /content/<collection>/<slug>.mdx. Frontmatter is
 * validated against a zod schema at read time, so a malformed post fails the
 * build instead of shipping broken. Everything here is server-only (read at
 * build time for SSG) — never import it into a client component.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

const baseFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
});

export const writingFrontmatter = baseFrontmatter.extend({
  /** One of the site's topics (HOME_TOPICS in lib/projects.ts) — the blog's filter; never free tags. */
  topic: z.enum(["platform", "software", "modelling"]).optional(),
});
export type WritingFrontmatter = z.infer<typeof writingFrontmatter>;

export const workFrontmatter = baseFrontmatter.extend({
  summary: z.string(),
  role: z.string().optional(),
  timeframe: z.string().optional(),
  stack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  links: z
    .object({
      live: z.url().optional(),
      repo: z.url().optional(),
    })
    .default({}),
  /** What this version changed from the one before it — shown in the version list. */
  changes: z.string().optional(),
  /**
   * A reserved page for a writeup not written yet, so another writeup can link
   * to it. Reachable by URL, kept out of every listing, and noindex.
   */
  placeholder: z.boolean().default(false),
});
export type WorkFrontmatter = z.infer<typeof workFrontmatter>;

type Collection = "writing" | "work";

export interface Doc<T> {
  slug: string;
  frontmatter: T;
  content: string;
  readingTime: string;
}

const includeDrafts = process.env.NODE_ENV !== "production";

function listFiles(collection: Collection): string[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

function loadDoc<S extends z.ZodType>(
  collection: Collection,
  file: string,
  schema: S,
): Doc<z.infer<S>> {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, collection, file), "utf8");
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${collection}/${file}:\n${JSON.stringify(
        parsed.error.flatten().fieldErrors,
        null,
        2,
      )}`,
    );
  }
  return {
    slug,
    frontmatter: parsed.data,
    content,
    readingTime: readingTime(content).text,
  };
}

function byDateDesc(a: { frontmatter: { date: Date } }, b: { frontmatter: { date: Date } }) {
  return b.frontmatter.date.getTime() - a.frontmatter.date.getTime();
}

export function getAllWriting(): Doc<WritingFrontmatter>[] {
  return listFiles("writing")
    .map((f) => loadDoc("writing", f, writingFrontmatter))
    .filter((d) => includeDrafts || !d.frontmatter.draft)
    .sort(byDateDesc);
}

export function getWriting(slug: string): Doc<WritingFrontmatter> | null {
  return getAllWriting().find((d) => d.slug === slug) ?? null;
}

export function getAllWork(): Doc<WorkFrontmatter>[] {
  return listFiles("work")
    .map((f) => loadDoc("work", f, workFrontmatter))
    .filter((d) => includeDrafts || !d.frontmatter.draft)
    .sort(byDateDesc);
}

export function getWork(slug: string): Doc<WorkFrontmatter> | null {
  return getAllWork().find((d) => d.slug === slug) ?? null;
}

/** The writeups a reader can browse to: everything except placeholders. */
export function getListedWork(): Doc<WorkFrontmatter>[] {
  return getAllWork().filter((d) => !d.frontmatter.placeholder);
}

/*
 * Writeup versions. A writeup that gets rewritten keeps its earlier versions
 * rather than being edited in place: content/work/<slug>.mdx is always the
 * current version, and each earlier one is a frozen snapshot at
 * content/work/<slug>/v<n>.mdx. Snapshots number v1..vN with no gaps, and the
 * current version is N + 1.
 */

export interface WorkVersion {
  version: number;
  current: boolean;
  href: string;
  /** When this version was published — its own `date`. */
  date: Date;
  /** What this version changed from the one before it. */
  changes?: string;
}

const SNAPSHOT_FILE = /^v([1-9]\d*)\.mdx$/;

function snapshotNumbers(slug: string): number[] {
  const dir = path.join(CONTENT_DIR, "work", slug);
  if (!fs.existsSync(dir)) return [];
  const numbers = fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .map((f) => {
      const match = SNAPSHOT_FILE.exec(f);
      if (!match) {
        throw new Error(`Unexpected file work/${slug}/${f}: earlier versions are named v<n>.mdx`);
      }
      return Number(match[1]);
    })
    .sort((a, b) => a - b);
  numbers.forEach((n, i) => {
    if (n !== i + 1) {
      throw new Error(`work/${slug}/ must hold v1..v${numbers.length} with no gaps; found v${n}`);
    }
  });
  return numbers;
}

function loadSnapshot(slug: string, version: number): Doc<WorkFrontmatter> {
  return { ...loadDoc("work", `${slug}/v${version}.mdx`, workFrontmatter), slug };
}

/** An earlier version of a writeup, or null if the writeup or that snapshot doesn't exist. */
export function getWorkVersion(slug: string, version: number): Doc<WorkFrontmatter> | null {
  if (!getWork(slug) || !snapshotNumbers(slug).includes(version)) return null;
  return loadSnapshot(slug, version);
}

/** Every version of a writeup, newest first — the first entry is the current one. */
export function getWorkVersions(slug: string): WorkVersion[] {
  const current = getWork(slug);
  if (!current) return [];
  const snapshots = snapshotNumbers(slug);
  const entry = (doc: Doc<WorkFrontmatter>, version: number, isCurrent: boolean): WorkVersion => ({
    version,
    current: isCurrent,
    href: isCurrent ? `/work/${slug}` : `/work/${slug}/v${version}`,
    date: doc.frontmatter.date,
    changes: doc.frontmatter.changes,
  });
  return [
    entry(current, snapshots.length + 1, true),
    ...snapshots
      .slice()
      .reverse()
      .map((n) => entry(loadSnapshot(slug, n), n, false)),
  ];
}
