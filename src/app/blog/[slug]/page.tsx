import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllWriting, getWriting } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/mdx/mdx";
import { ReadingNav } from "@/components/reading-nav";

export function generateStaticParams() {
  return getAllWriting().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getWriting(slug);
  if (!doc) return {};
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getWriting(slug);
  if (!doc) notFound();
  const { frontmatter, readingTime } = doc;

  return (
    <>
      <ReadingNav />
      <div className="nb-article nb-settle" style={{ padding: "56px 0 96px" }}>
        <Link href="/blog" className="nb-extlink">
          ← Blog
        </Link>

        <header style={{ margin: "28px 0 var(--space-7)" }}>
          <p className="nb-article__eyebrow">Blog</p>
          <h1 className="nb-article__title">{frontmatter.title}</h1>
          <p className="nb-article__lead">{frontmatter.description}</p>
          <div className="nb-article__meta">
            <span>{formatDate(frontmatter.date, "long")}</span>
            <span className="nb-article__meta-sep" aria-hidden>
              ·
            </span>
            <span>{readingTime}</span>
          </div>
        </header>

        <article className="prose nb-prose">
          <Mdx source={doc.content} />
        </article>
      </div>
    </>
  );
}
