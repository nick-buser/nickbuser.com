import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllWriting, getWriting } from "@/lib/content";
import { Mdx } from "@/components/mdx/mdx";

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

export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getWriting(slug);
  if (!doc) notFound();
  const { frontmatter, readingTime } = doc;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/writing"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Writing
      </Link>
      <header className="mb-10 mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{frontmatter.description}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          {frontmatter.date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · {readingTime}
        </div>
      </header>
      <article className="prose max-w-none dark:prose-invert">
        <Mdx source={doc.content} />
      </article>
    </div>
  );
}
