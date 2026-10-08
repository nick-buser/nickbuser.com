import Link from "next/link";
import { Badge } from "@/components/ui";
import { VERDICTS, type Step, type Verdict } from "@/lib/experiments";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const v = VERDICTS[verdict];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

function stepNumber(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * A series' steps as a numbered list, each linked, with its verdict. On a step
 * page the list is compact and marks the step being read.
 */
export function StepList({
  steps,
  current,
  compact = false,
}: {
  steps: Step[];
  current?: string;
  compact?: boolean;
}) {
  return (
    <ol className={`nb-steps not-prose${compact ? " nb-steps--compact" : ""}`}>
      {steps.map((s) => {
        const here = s.slug === current;
        return (
          <li key={s.slug} className="nb-steps__item" aria-current={here ? "step" : undefined}>
            <span className="nb-steps__num">{stepNumber(s.frontmatter.step)}</span>
            <div className="nb-steps__main">
              {here ? (
                <span className="nb-steps__title">{s.frontmatter.title}</span>
              ) : (
                <Link href={s.href} className="nb-steps__title">
                  {s.frontmatter.title}
                </Link>
              )}
              {compact ? null : <p className="nb-steps__result">{s.frontmatter.result}</p>}
            </div>
            <VerdictBadge verdict={s.frontmatter.verdict} />
          </li>
        );
      })}
    </ol>
  );
}

/** Previous and next step, with the series overview between them. */
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
    <nav className="nb-pager" aria-label="Steps">
      {prev ? (
        <Link href={prev.href} className="nb-pager__link nb-pager__link--prev">
          <span className="nb-pager__dir">← Step {stepNumber(prev.frontmatter.step)}</span>
          <span className="nb-pager__title">{prev.frontmatter.title}</span>
        </Link>
      ) : (
        <Link href={seriesHref} className="nb-pager__link nb-pager__link--prev">
          <span className="nb-pager__dir">← Overview</span>
          <span className="nb-pager__title">The series</span>
        </Link>
      )}
      {next ? (
        <Link href={next.href} className="nb-pager__link nb-pager__link--next">
          <span className="nb-pager__dir">Step {stepNumber(next.frontmatter.step)} →</span>
          <span className="nb-pager__title">{next.frontmatter.title}</span>
        </Link>
      ) : (
        <Link href={seriesHref} className="nb-pager__link nb-pager__link--next">
          <span className="nb-pager__dir">Overview →</span>
          <span className="nb-pager__title">Back to the series</span>
        </Link>
      )}
    </nav>
  );
}
