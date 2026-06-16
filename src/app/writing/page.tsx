import Link from "next/link";
import type { Metadata } from "next";
import { getAllWriting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and essays.",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WritingIndex() {
  const posts = getAllWriting();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Writing</h1>
      <ul className="space-y-6">
        {posts.map((d) => (
          <li key={d.slug}>
            <Link href={`/writing/${d.slug}`} className="group block">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium group-hover:underline">
                  {d.frontmatter.title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatDate(d.frontmatter.date)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {d.frontmatter.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
