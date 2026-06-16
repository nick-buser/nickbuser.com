import Link from "next/link";
import { getAllWork, getAllWriting } from "@/lib/content";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const work = getAllWork()
    .filter((d) => d.frontmatter.featured)
    .slice(0, 3);
  const writing = getAllWriting().slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="mb-16">
        <h1 className="text-3xl font-semibold tracking-tight">Nick Buser</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Engineer writing interactive, deeply-illustrated case studies on
          systems, data, and visualization. This is a design-agnostic
          foundation — the visual language comes next.
        </p>
      </section>

      <section className="mb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Selected work</h2>
          <Link
            href="/work"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            All work →
          </Link>
        </div>
        <ul className="space-y-4">
          {work.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/work/${d.slug}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <div className="font-medium">{d.frontmatter.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {d.frontmatter.summary}
                </div>
              </Link>
            </li>
          ))}
          {work.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              No featured work yet.
            </li>
          ) : null}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Recent writing</h2>
          <Link
            href="/writing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            All writing →
          </Link>
        </div>
        <ul className="space-y-3">
          {writing.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/writing/${d.slug}`}
                className="flex items-baseline justify-between gap-4 text-muted-foreground hover:text-foreground"
              >
                <span className="text-foreground">{d.frontmatter.title}</span>
                <span className="shrink-0 text-sm">
                  {formatDate(d.frontmatter.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
