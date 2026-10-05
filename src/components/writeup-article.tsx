import Link from "next/link";
import type { Doc, WorkFrontmatter, WorkVersion } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/mdx/mdx";
import { Chip, ExtLink } from "@/components/ui";
import { ReadingNav } from "@/components/reading-nav";

/**
 * A writeup page — the current version at /work/<slug> and each earlier one
 * at /work/<slug>/v<n> render through this, so a snapshot reads exactly like
 * the page it once was, plus a notice saying it has been replaced.
 */
export function WriteupArticle({
  doc,
  versions,
  version,
}: {
  doc: Doc<WorkFrontmatter>;
  versions: WorkVersion[];
  version: number;
}) {
  const { frontmatter, readingTime } = doc;
  const meta = [
    frontmatter.role,
    frontmatter.timeframe,
    readingTime,
  ].filter(Boolean) as string[];

  const current = versions.find((v) => v.current);
  const successor = versions.find((v) => v.version === version + 1);

  return (
    <>
    <ReadingNav />
    <div className="nb-article nb-settle" style={{ padding: "56px 0 96px" }}>
      <Link href="/work" className="nb-extlink">
        ← Writeups
      </Link>

      {current && successor ? (
        <aside className="nb-version-notice" role="note">
          <p>
            <strong>This is an earlier version.</strong> You are reading version{" "}
            {version} of this writeup, published {formatDate(frontmatter.date, "long")}.
            It was replaced on {formatDate(successor.date, "long")}.
          </p>
          <Link href={current.href} className="nb-extlink">
            Read the current version →
          </Link>
        </aside>
      ) : null}

      <header style={{ margin: "28px 0 var(--space-7)" }}>
        <p className="nb-article__eyebrow">Writeup</p>
        <h1 className="nb-article__title">{frontmatter.title}</h1>
        <p className="nb-article__lead">{frontmatter.description}</p>

        {meta.length ? (
          <div className="nb-article__meta">
            {meta.map((m, i) => (
              <span key={m} style={{ display: "flex", gap: "14px" }}>
                {i > 0 ? (
                  <span className="nb-article__meta-sep" aria-hidden>
                    ·
                  </span>
                ) : null}
                {m}
              </span>
            ))}
          </div>
        ) : null}

        {frontmatter.stack.length ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: "var(--space-4)",
            }}
          >
            {frontmatter.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        ) : null}

        {frontmatter.links.live || frontmatter.links.repo ? (
          <div
            style={{
              display: "flex",
              gap: 22,
              marginTop: "var(--space-5)",
            }}
          >
            {frontmatter.links.live ? (
              <ExtLink href={frontmatter.links.live}>Live</ExtLink>
            ) : null}
            {frontmatter.links.repo ? (
              <ExtLink href={frontmatter.links.repo}>Repo</ExtLink>
            ) : null}
          </div>
        ) : null}

        {versions.length > 1 ? (
          <VersionList versions={versions} reading={version} />
        ) : null}
      </header>

      <article className="prose nb-prose">
        <Mdx source={doc.content} />
      </article>
    </div>
    </>
  );
}

/** The ledger of a writeup's versions, newest first, with the one being read marked. */
function VersionList({
  versions,
  reading,
}: {
  versions: WorkVersion[];
  reading: number;
}) {
  return (
    <nav className="nb-versions" aria-label="Versions of this writeup">
      <p className="nb-versions__label">Versions</p>
      <ol className="nb-versions__list">
        {versions.map((v) => (
          <li key={v.version} className="nb-versions__item">
            <span className="nb-versions__num">v{v.version}</span>
            <time className="nb-versions__date" dateTime={v.date.toISOString().slice(0, 10)}>
              {formatDate(v.date)}
            </time>
            <span className="nb-versions__note">
              {v.changes ?? (v.version === 1 ? "First published." : null)}
            </span>
            {v.version === reading ? (
              <span className="nb-versions__here" aria-current="page">
                Reading
              </span>
            ) : (
              <Link href={v.href} className="nb-extlink">
                {v.current ? "Current →" : "Read →"}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
