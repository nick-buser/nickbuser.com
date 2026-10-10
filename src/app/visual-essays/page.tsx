import type { Metadata } from "next";
import { projectsIn } from "@/lib/projects";
import { PageHeader } from "@/components/page-header";
import { ProjectTable } from "@/components/project-table";

export const metadata: Metadata = {
  title: "Visual essays",
  description:
    "Interactive explainers I built with LLMs to learn animal communication, pharmacology, mathematics, physics, and neuroscience.",
};

export default function VisualEssays() {
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      <PageHeader
        eyebrow="Visual essays"
        title="Built to learn from"
        lead="This is how I learn a subject I want to understand: I use LLMs to build explanations and interactive visualizations aimed at what I'm trying to grasp, then work through them. These cover animal communication, pharmacology, mathematics, physics, and neuroscience. I made them to learn these subjects, not to teach them as an expert."
      />
      <ProjectTable projects={projectsIn("essay")} caption="Visual essays" noun="essays" />
    </div>
  );
}
