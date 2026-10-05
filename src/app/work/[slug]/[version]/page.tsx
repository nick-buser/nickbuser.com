import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllWork, getWorkVersion, getWorkVersions } from "@/lib/content";
import { WriteupArticle } from "@/components/writeup-article";

/**
 * An earlier version of a writeup, at /work/<slug>/v<n>. The current version
 * stays at /work/<slug>; these are the frozen snapshots it replaced.
 */

type Params = Promise<{ slug: string; version: string }>;

function parseVersion(segment: string): number | null {
  const match = /^v([1-9]\d*)$/.exec(segment);
  return match ? Number(match[1]) : null;
}

export function generateStaticParams() {
  return getAllWork().flatMap((d) =>
    getWorkVersions(d.slug)
      .filter((v) => !v.current)
      .map((v) => ({ slug: d.slug, version: `v${v.version}` })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, version } = await params;
  const n = parseVersion(version);
  const doc = n ? getWorkVersion(slug, n) : null;
  if (!doc) return {};
  return {
    title: `${doc.frontmatter.title} (version ${n})`,
    description: doc.frontmatter.description,
    // Readable from the version list, but search should land on the current version.
    robots: { index: false, follow: true },
  };
}

export default async function WorkVersionPage({ params }: { params: Params }) {
  const { slug, version } = await params;
  const n = parseVersion(version);
  const doc = n ? getWorkVersion(slug, n) : null;
  if (!n || !doc) notFound();
  return <WriteupArticle doc={doc} versions={getWorkVersions(slug)} version={n} />;
}
