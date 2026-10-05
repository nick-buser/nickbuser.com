import type { Metadata } from "next";
import { projectsIn } from "@/lib/projects";
import { PageHeader } from "@/components/page-header";
import { ProjectTable } from "@/components/project-table";

export const metadata: Metadata = {
  title: "Visual essays",
  description:
    "Interactive explorables on animal communication, pharmacology, mathematics, physics, and neuroscience.",
};

export default function VisualEssays() {
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader
        eyebrow="Visual essays"
        title="Read by moving through them"
        lead="Interactive explorables on animal communication, pharmacology, mathematics, physics, and neuroscience."
      />
      <ProjectTable projects={projectsIn("essay")} caption="Visual essays" noun="essays" />
    </div>
  );
}
