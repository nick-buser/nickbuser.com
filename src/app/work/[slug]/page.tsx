import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllWork, getWork } from "@/lib/content";
import { Mdx } from "@/components/mdx/mdx";
import { Chip, ExtLink } from "@/components/ui";
import { ReadingNav } from "@/components/reading-nav";

export function generateStaticParams() {
  return getAllWork().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getWork(slug);
  if (!doc) return {};
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getWork(slug);
  if (!doc) notFound();
  const { frontmatter, readingTime } = doc;

  const meta = [
    frontmatter.role,
    frontmatter.timeframe,
    readingTime,
  ].filter(Boolean) as string[];

  return (
    <div className="nb-article nb-settle" style={{ padding: "56px 0 96px" }}>
      <Link href="/" className="nb-extlink">
        ← Work
      </Link>

      <header style={{ margin: "28px 0 var(--space-7)" }}>
        <p className="nb-article__eyebrow">Case study</p>
        <h1 className="nb-article__title">{frontmatter.title}</h1>
        <p className="nb-article__lead">{frontmatter.description}</p>

        {meta.length ? (
          <div className="nb-article__meta">
            {meta.map((m, i) => (
              <span key={m} style={{ display: "flex", gap: "14px" }}>
                {i > 0 ? (
                  <span className="nb-article__meta-sep" aria-hidden>
                    ·
                  </span>
                ) : null}
                {m}
              </span>
            ))}
          </div>
        ) : null}

        {frontmatter.stack.length ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: "var(--space-4)",
            }}
          >
            {frontmatter.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        ) : null}

        {frontmatter.links.live || frontmatter.links.repo ? (
          <div
            style={{
              display: "flex",
              gap: 22,
              marginTop: "var(--space-5)",
            }}
          >
            {frontmatter.links.live ? (
              <ExtLink href={frontmatter.links.live}>Live</ExtLink>
            ) : null}
            {frontmatter.links.repo ? (
              <ExtLink href={frontmatter.links.repo}>Repo</ExtLink>
            ) : null}
          </div>
        ) : null}
      </header>

      <article className="prose nb-prose">
        <Mdx source={doc.content} />
      </article>

      <ReadingNav />
    </div>
  );
}
