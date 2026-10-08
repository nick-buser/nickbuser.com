import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeries, getSeries, getStep, getSteps } from "@/lib/experiments";
import { Mdx } from "@/components/mdx/mdx";
import { StepList, StepPager, VerdictBadge } from "@/components/experiment-steps";

type Params = Promise<{ series: string; step: string }>;

export function generateStaticParams() {
  return getAllSeries().flatMap((s) =>
    getSteps(s.slug).map((step) => ({ series: s.slug, step: step.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { series, step } = await params;
  const s = getSeries(series);
  const st = getStep(series, step);
  if (!s || !st) return {};
  return {
    title: `${st.frontmatter.title} · ${s.frontmatter.title}`,
    description: st.frontmatter.result,
  };
}

/** One step of a series: problem, change, result and decision, then the way on. */
export default async function StepPage({ params }: { params: Params }) {
  const { series, step } = await params;
  const s = getSeries(series);
  const st = getStep(series, step);
  if (!s || !st) notFound();
  const steps = getSteps(series);
  const i = steps.findIndex((x) => x.slug === st.slug);
  const seriesHref = `/experiments/${s.slug}`;

  return (
    <div className="nb-article nb-settle" style={{ padding: "56px 0 96px" }}>
      <Link href={seriesHref} className="nb-extlink">
        ← {s.frontmatter.title}
      </Link>

      <header style={{ margin: "28px 0 var(--space-6)" }}>
        <p className="nb-article__eyebrow">
          Step {st.frontmatter.step} of {steps.length}
        </p>
        <h1 className="nb-article__title">{st.frontmatter.title}</h1>
        <div style={{ marginTop: "var(--space-3)" }}>
          <VerdictBadge verdict={st.frontmatter.verdict} />
        </div>
        <p className="nb-article__lead">{st.frontmatter.result}</p>
      </header>

      <article className="prose nb-prose">
        <Mdx source={st.content} />
      </article>

      <StepPager prev={steps[i - 1]} next={steps[i + 1]} seriesHref={seriesHref} />

      <section className="nb-steps-all" aria-label="Every step in this series">
        <p className="nb-steps-all__label">The series</p>
        <StepList steps={steps} current={st.slug} compact />
      </section>
    </div>
  );
}
