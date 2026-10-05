import type { Metadata } from "next";
import { getAllWriting } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { categoryTitle } from "@/lib/projects";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { PostIndex } from "@/components/post-index";

export const metadata: Metadata = {
  title: "Blog",
  description: site.blogLead,
};

export default function BlogIndex() {
  const posts = getAllWriting();
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader eyebrow="Blog" title="Posts" lead={site.blogLead} />
      <PostIndex
        posts={posts.map((d) => {
          const topic = d.frontmatter.topic
            ? { id: d.frontmatter.topic, title: categoryTitle(d.frontmatter.topic) }
            : undefined;
          return {
            href: `/blog/${d.slug}`,
            title: d.frontmatter.title,
            description: d.frontmatter.description,
            meta: [formatDate(d.frontmatter.date), topic?.title, d.readingTime].filter(
              (m): m is string => Boolean(m),
            ),
            year: d.frontmatter.date.getUTCFullYear(),
            topic,
          };
        })}
      />
    </div>
  );
}
