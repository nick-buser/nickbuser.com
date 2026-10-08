import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeries, getSeries, getSteps } from "@/lib/experiments";
import { getWork } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/mdx/mdx";
import { Chip } from "@/components/ui";
import { StepList } from "@/components/experiment-steps";

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

/** A series overview: what was asked, the headline result, and every step, linked. */
export default async function SeriesPage({ params }: { params: Params }) {
  const { series } = await params;
  const s = getSeries(series);
  if (!s) notFound();
  const steps = getSteps(s.slug);
  const project = s.frontmatter.project ? getWork(s.frontmatter.project) : null;

  return (
    <div className="nb-article nb-settle" style={{ padding: "56px 0 96px" }}>
      <Link href="/experiments" className="nb-extlink">
        ← Experiments
      </Link>

      <header style={{ margin: "28px 0 var(--space-7)" }}>
        <p className="nb-article__eyebrow">Experiment series</p>
        <h1 className="nb-article__title">{s.frontmatter.title}</h1>
        <p className="nb-article__lead">{s.frontmatter.description}</p>
        <div className="nb-article__meta">
          <span>{formatDate(s.frontmatter.updated ?? s.frontmatter.date, "long")}</span>
          <span className="nb-article__meta-sep" aria-hidden>
            ·
          </span>
          <span>{steps.length} steps</span>
        </div>
        {s.frontmatter.stack.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "var(--space-4)" }}>
            {s.frontmatter.stack.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        ) : null}
        {project ? (
          <p style={{ marginTop: "var(--space-5)" }}>
            <Link href={`/work/${project.slug}`} className="nb-extlink">
              Runs on: {project.frontmatter.title} →
            </Link>
          </p>
        ) : null}
      </header>

      <article className="prose nb-prose">
        <Mdx source={s.content} components={{ StepIndex: () => <StepList steps={steps} /> }} />
      </article>
    </div>
  );
}
