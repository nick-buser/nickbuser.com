import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeries, getSeries, getSteps } from "@/lib/experiments";
import { getWork } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/mdx/mdx";
import { MetricTiles, StepMap } from "@/components/experiment-steps";

type Params = Promise<{ series: string }>;

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ series: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { series } = await params;
  const s = getSeries(series);
  if (!s) return {};
  return { title: s.frontmatter.title, description: s.frontmatter.description };
}

/** A series as one dense writeup: the result, the method, every step in brief, and a map of the step pages. */
export default async function SeriesPage({ params }: { params: Params }) {
  const { series } = await params;
  const s = getSeries(series);
  if (!s) notFound();
  const steps = getSteps(s.slug);
  const project = s.frontmatter.project ? getWork(s.frontmatter.project) : null;

  return (
    <div className="nb-exp nb-settle">
      <Link href="/experiments" className="nb-extlink">
        ← Experiments
      </Link>

      <header className="nb-exp__head">
        <p className="nb-exp__eyebrow">
          <span>Experiment series</span>
          <span>{steps.length} steps</span>
          <span>{formatDate(s.frontmatter.updated ?? s.frontmatter.date, "long")}</span>
          {project ? (
            <Link href={`/work/${project.slug}`}>Runs on {project.frontmatter.title}</Link>
          ) : null}
        </p>
        <h1 className="nb-exp__title">{s.frontmatter.title}</h1>
        <p className="nb-exp__lead">{s.frontmatter.description}</p>
        <MetricTiles metrics={s.frontmatter.metrics} />
      </header>

      <article className="nb-dense">
        <Mdx source={s.content} components={{ StepIndex: () => <StepMap steps={steps} /> }} />
      </article>
    </div>
  );
}
