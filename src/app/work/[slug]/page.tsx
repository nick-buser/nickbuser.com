import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllWork, getWork, getWorkVersions } from "@/lib/content";
import { WriteupArticle } from "@/components/writeup-article";

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
  const versions = getWorkVersions(slug);
  return <WriteupArticle doc={doc} versions={versions} version={versions[0].version} />;
}
