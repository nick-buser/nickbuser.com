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

export const writingFrontmatter = baseFrontmatter;
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
