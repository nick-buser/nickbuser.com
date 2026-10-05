import type { Metadata } from "next";
import { getAllWriting } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { DocList } from "@/components/doc-list";

export const metadata: Metadata = {
  title: "Blog",
  description: "Shorter notes and essays.",
};

export default function BlogIndex() {
  const posts = getAllWriting();
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader
        eyebrow="Blog"
        title="Notes and essays"
        lead="Shorter pieces — how this site and other things are built, and essays."
      />
      <DocList
        items={posts.map((d) => ({
          href: `/blog/${d.slug}`,
          title: d.frontmatter.title,
          description: d.frontmatter.description,
          meta: [formatDate(d.frontmatter.date), d.readingTime],
        }))}
      />
    </div>
  );
}
