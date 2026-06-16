import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllWork, getWork } from "@/lib/content";
import { Mdx } from "@/components/mdx/mdx";

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/work"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Work
      </Link>
      <header className="mb-10 mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{frontmatter.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {frontmatter.role ? <span>{frontmatter.role}</span> : null}
          {frontmatter.timeframe ? <span>{frontmatter.timeframe}</span> : null}
          <span>{readingTime}</span>
        </div>
      </header>
      <article className="prose max-w-none dark:prose-invert">
        <Mdx source={doc.content} />
      </article>
    </div>
  );
}
