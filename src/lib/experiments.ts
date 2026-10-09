import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * Experiment series. Each series is a directory under content/experiments:
 * index.mdx describes the series, and every other file is one step, named
 * <nn>-<slug>.mdx so the directory lists in order. A step's slug is its file
 * name without the extension. Steps number 1..N with no gaps.
 */

const EXPERIMENTS_DIR = path.join(process.cwd(), "content", "experiments");

/** A headline number shown as a tile: "Time to Ready" / "141 → 131 s". */
const metric = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});
export type Metric = z.infer<typeof metric>;

export const seriesFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  /** The writeup for the project this series runs on, by slug. */
  project: z.string().optional(),
  stack: z.array(z.string()).default([]),
  metrics: z.array(metric).default([]),
  draft: z.boolean().default(false),
});
export type SeriesFrontmatter = z.infer<typeof seriesFrontmatter>;

export const VERDICTS = {
  adopted: { label: "Adopted", tone: "positive" },
  fixed: { label: "Fixed", tone: "positive" },
  method: { label: "Method", tone: "complete" },
  suspect: { label: "Suspect result", tone: "pending" },
  falsified: { label: "Falsified", tone: "pending" },
  rejected: { label: "Rejected", tone: "pending" },
  "not-adopted": { label: "Not adopted", tone: "pending" },
} as const;
export type Verdict = keyof typeof VERDICTS;

export const stepFrontmatter = z.object({
  title: z.string(),
  step: z.number().int().positive(),
  verdict: z.enum(Object.keys(VERDICTS) as [Verdict, ...Verdict[]]),
  /** One line: what was measured, in the step list and under the title. */
  result: z.string(),
  /** Headline numbers for the step's tiles; the first also labels it on the series map. */
  metrics: z.array(metric).default([]),
  date: z.coerce.date(),
});
export type StepFrontmatter = z.infer<typeof stepFrontmatter>;

export interface Series {
  slug: string;
  frontmatter: SeriesFrontmatter;
  content: string;
}

export interface Step {
  series: string;
  slug: string;
  frontmatter: StepFrontmatter;
  content: string;
  href: string;
}

const STEP_FILE = /^\d{2}-[a-z0-9-]+\.mdx$/;
const includeDrafts = process.env.NODE_ENV !== "production";

function parse<S extends z.ZodType>(file: string, schema: S): { data: z.infer<S>; content: string } {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), file)}:\n${JSON.stringify(
        parsed.error.flatten().fieldErrors,
        null,
        2,
      )}`,
    );
  }
  return { data: parsed.data, content };
}

export function getAllSeries(): Series[] {
  if (!fs.existsSync(EXPERIMENTS_DIR)) return [];
  return fs
    .readdirSync(EXPERIMENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const { data, content } = parse(path.join(EXPERIMENTS_DIR, d.name, "index.mdx"), seriesFrontmatter);
      return { slug: d.name, frontmatter: data, content };
    })
    .filter((s) => includeDrafts || !s.frontmatter.draft)
    .sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
}

export function getSeries(slug: string): Series | null {
  return getAllSeries().find((s) => s.slug === slug) ?? null;
}

/** A series' steps in order. Throws if the files don't number 1..N. */
export function getSteps(series: string): Step[] {
  const dir = path.join(EXPERIMENTS_DIR, series);
  if (!fs.existsSync(dir)) return [];
  const steps = fs
    .readdirSync(dir)
    .filter((f) => f !== "index.mdx" && !f.startsWith("."))
    .map((f) => {
      if (!STEP_FILE.test(f)) {
        throw new Error(`Unexpected file experiments/${series}/${f}: steps are named <nn>-<slug>.mdx`);
      }
      const { data, content } = parse(path.join(dir, f), stepFrontmatter);
      const slug = f.replace(/\.mdx$/, "");
      return { series, slug, frontmatter: data, content, href: `/experiments/${series}/${slug}` };
    })
    .sort((a, b) => a.frontmatter.step - b.frontmatter.step);
  steps.forEach((s, i) => {
    if (s.frontmatter.step !== i + 1) {
      throw new Error(`experiments/${series} must number its steps 1..${steps.length}; ${s.slug} says ${s.frontmatter.step}`);
    }
  });
  return steps;
}

export function getStep(series: string, slug: string): Step | null {
  return getSteps(series).find((s) => s.slug === slug) ?? null;
}
