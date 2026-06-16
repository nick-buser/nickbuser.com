import Link from "next/link";
import type { Metadata } from "next";
import { getAllWork } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Project case studies and writeups.",
};

export default function WorkIndex() {
  const work = getAllWork();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Work</h1>
      <ul className="space-y-4">
        {work.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/work/${d.slug}`}
              className="block rounded-lg border border-border p-5 transition-colors hover:bg-muted"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{d.frontmatter.title}</span>
                {d.frontmatter.timeframe ? (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {d.frontmatter.timeframe}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {d.frontmatter.summary}
              </p>
              {d.frontmatter.stack.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.frontmatter.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
