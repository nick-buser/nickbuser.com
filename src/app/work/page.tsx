import type { Metadata } from "next";
import { getListedWork } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { DocList } from "@/components/doc-list";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writeups",
  description: site.writeupsLead,
};

/**
 * The writeup index. Every writeup under content/work lands here, so a writeup
 * is never reachable only from the project card that links to it.
 */
export default function Writeups() {
  const writeups = getListedWork();
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader
        eyebrow="Writeups"
        title="How the work fits together"
        lead={site.writeupsLead}
      />
      <DocList
        items={writeups.map((d) => ({
          href: `/work/${d.slug}`,
          title: d.frontmatter.title,
          description: d.frontmatter.description,
          meta: [
            formatDate(d.frontmatter.updated ?? d.frontmatter.date),
            d.frontmatter.timeframe,
            d.readingTime,
          ].filter((m): m is string => Boolean(m)),
          chips: d.frontmatter.stack.slice(0, 6),
        }))}
      />
    </div>
  );
}
