import type { Metadata } from "next";
import { getAllSeries, getSteps } from "@/lib/experiments";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { DocList } from "@/components/doc-list";

const lead =
  "Experiment rounds run on the ML Orchestration Lab. Each series follows one question from a baseline to a result, one short step at a time.";

export const metadata: Metadata = {
  title: "Experiments",
  description: lead,
};

export default function Experiments() {
  const series = getAllSeries();
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader eyebrow="Experiments" title="Experiment rounds" lead={lead} />
      <DocList
        items={series.map((s) => ({
          href: `/experiments/${s.slug}`,
          title: s.frontmatter.title,
          description: s.frontmatter.description,
          meta: [
            formatDate(s.frontmatter.updated ?? s.frontmatter.date),
            `${getSteps(s.slug).length} steps`,
          ],
          chips: s.frontmatter.stack.slice(0, 6),
        }))}
      />
    </div>
  );
}
