import Link from "next/link";
import { Badge } from "@/components/ui";
import { VERDICTS, type Metric, type Step, type Verdict } from "@/lib/experiments";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const v = VERDICTS[verdict];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

function stepNumber(n: number) {
  return String(n).padStart(2, "0");
}

/** Headline numbers as a row of tiles. */
export function MetricTiles({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <dl className="nb-tiles">
      {metrics.map((m) => (
        <div key={m.label} className="nb-tile">
          <dt className="nb-tile__label">{m.label}</dt>
          <dd className="nb-tile__value">{m.value}</dd>
          {m.note ? <dd className="nb-tile__note">{m.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Every step as a tile: number, verdict, title and its first headline number. */
export function StepMap({ steps }: { steps: Step[] }) {
  return (
    <ol className="nb-stepmap not-prose">
      {steps.map((s) => {
        const v = VERDICTS[s.frontmatter.verdict];
        const m = s.frontmatter.metrics[0];
        return (
          <li key={s.slug}>
            <Link href={s.href} className={`nb-stepmap__tile nb-stepmap__tile--${v.tone}`}>
              <span className="nb-stepmap__head">
                <span className="nb-stepmap__num">{stepNumber(s.frontmatter.step)}</span>
                <span className="nb-stepmap__verdict">{v.label}</span>
              </span>
              <span className="nb-stepmap__title">{s.frontmatter.title}</span>
              {m ? (
                <span className="nb-stepmap__metric">
                  {m.label}: <strong>{m.value}</strong>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** The sticky side rail on a step page: the series and every step in it. */
export function StepRail({
  seriesTitle,
  seriesHref,
  steps,
  current,
}: {
  seriesTitle: string;
  seriesHref: string;
  steps: Step[];
  current: string;
}) {
  return (
    <nav className="nb-rail" aria-label="Steps in this series">
      <Link href={seriesHref} className="nb-rail__series">
        ← {seriesTitle}
      </Link>
      <ol className="nb-rail__list">
        {steps.map((s) => {
          const here = s.slug === current;
          const tone = VERDICTS[s.frontmatter.verdict].tone;
          return (
            <li key={s.slug}>
              <Link
                href={s.href}
                className="nb-rail__item"
                aria-current={here ? "page" : undefined}
              >
                <span className="nb-rail__num">{stepNumber(s.frontmatter.step)}</span>
                <span className="nb-rail__title">{s.frontmatter.title}</span>
                <span className={`nb-rail__dot nb-rail__dot--${tone}`} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Previous and next step, compact. */
export function StepPager({
  prev,
  next,
  seriesHref,
}: {
  prev?: Step;
  next?: Step;
  seriesHref: string;
}) {
  return (
    <nav className="nb-pager" aria-label="Previous and next step">
      {prev ? (
        <Link href={prev.href} className="nb-pager__link">
          <span className="nb-pager__dir">← {stepNumber(prev.frontmatter.step)}</span>
          <span className="nb-pager__title">{prev.frontmatter.title}</span>
        </Link>
      ) : (
        <Link href={seriesHref} className="nb-pager__link">
          <span className="nb-pager__dir">← Overview</span>
          <span className="nb-pager__title">The whole series</span>
        </Link>
      )}
      {next ? (
        <Link href={next.href} className="nb-pager__link nb-pager__link--next">
          <span className="nb-pager__dir">{stepNumber(next.frontmatter.step)} →</span>
          <span className="nb-pager__title">{next.frontmatter.title}</span>
        </Link>
      ) : (
        <Link href={seriesHref} className="nb-pager__link nb-pager__link--next">
          <span className="nb-pager__dir">Overview →</span>
          <span className="nb-pager__title">The whole series</span>
        </Link>
      )}
    </nav>
  );
}
