import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeries, getSeries, getStep, getSteps } from "@/lib/experiments";
import { Mdx } from "@/components/mdx/mdx";
import { MetricTiles, StepPager, StepRail, VerdictBadge } from "@/components/experiment-steps";

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

/** One step of a series: its numbers and chart first, then problem, change, result and decision. */
export default async function StepPage({ params }: { params: Params }) {
  const { series, step } = await params;
  const s = getSeries(series);
  const st = getStep(series, step);
  if (!s || !st) notFound();
  const steps = getSteps(series);
  const i = steps.findIndex((x) => x.slug === st.slug);
  const seriesHref = `/experiments/${s.slug}`;

  return (
    <div className="nb-exp nb-exp--rail nb-settle">
      <StepRail seriesTitle={s.frontmatter.title} seriesHref={seriesHref} steps={steps} current={st.slug} />
      <div className="nb-exp__main">
        <header className="nb-exp__head">
          <p className="nb-exp__eyebrow">
            <span>
              Step {st.frontmatter.step} of {steps.length}
            </span>
            <VerdictBadge verdict={st.frontmatter.verdict} />
          </p>
          <h1 className="nb-exp__title">{st.frontmatter.title}</h1>
          <p className="nb-exp__lead">{st.frontmatter.result}</p>
          <MetricTiles metrics={st.frontmatter.metrics} />
        </header>

        <article className="nb-dense nb-dense--step">
          <Mdx source={st.content} />
        </article>

        <StepPager prev={steps[i - 1]} next={steps[i + 1]} seriesHref={seriesHref} />
      </div>
    </div>
  );
}
