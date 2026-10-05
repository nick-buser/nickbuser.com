import Link from "next/link";
import { site } from "@/lib/site";
import { projectsIn } from "@/lib/projects";
import { getAllWork, getAllWriting } from "@/lib/content";
import { ExtLink, SectionLabel } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import { ProjectTable } from "@/components/project-table";

export default function Home() {
  const platform = projectsIn("platform");
  const built = projectsIn("software", "modelling");
  const essays = projectsIn("essay");
  const studies = getAllWork();
  const posts = getAllWriting();

  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      {/* ── Masthead: the name set in live Fraunces, plus real contact links ── */}
      <header className="nb-masthead">
        <h1 className="nb-masthead__name">{site.name}</h1>
        <p className="nb-masthead__lede">{site.lede}</p>
        <nav className="nb-masthead__links">
          <ExtLink href={site.socials.github}>GitHub</ExtLink>
          <ExtLink href={site.socials.linkedin}>LinkedIn</ExtLink>
        </nav>
      </header>

      <hr className="nb-rule" style={{ margin: "8px 0 var(--space-7)" }} />

      {/* ── Platform — the topic the work clusters around, wherever it runs ── */}
      <section className="nb-home-section" aria-labelledby="platform">
        <div className="nb-home-head">
          <h2 id="platform" className="nb-home-head__title">
            Platform
          </h2>
          <p className="nb-home-head__lead">
            Infrastructure, delivery, and developer tooling — the systems other
            software is built, shipped, and run on.
          </p>
        </div>
        <div className="nb-cards">
          {platform.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </section>

      {/* ── Software & formal modelling — the searchable index ───────────── */}
      <section className="nb-home-section" aria-labelledby="built">
        <div className="nb-home-head">
          <h2 id="built" className="nb-home-head__title">
            Software &amp; formal modelling
          </h2>
          <p className="nb-home-head__lead">
            Full-stack applications, and formal models of reasoning and dynamics.
          </p>
        </div>
        <ProjectTable projects={built} caption="Software and formal-modelling projects" />
      </section>

      {/* ── Elsewhere — the rest of the site, off to the side ────────────── */}
      <section className="nb-home-section nb-elsewhere" aria-label="Elsewhere on the site">
        <div>
          <SectionLabel>Visual essays</SectionLabel>
          <p className="nb-elsewhere__lead">
            Interactive explorables, read by moving through them.
          </p>
          <ul className="nb-elsewhere__list">
            {essays.map((p) => (
              <li key={p.title}>
                {p.links.live ? (
                  <a href={p.links.live} target="_blank" rel="noreferrer">
                    {p.title}
                  </a>
                ) : (
                  p.title
                )}
              </li>
            ))}
          </ul>
          <Link href="/visual-essays" className="nb-extlink">
            All visual essays →
          </Link>
        </div>

        <div>
          <SectionLabel>Case studies</SectionLabel>
          <p className="nb-elsewhere__lead">
            Long-form writeups of how the work fits together.
          </p>
          <ul className="nb-elsewhere__list">
            {studies.map((d) => (
              <li key={d.slug}>
                <Link href={`/work/${d.slug}`}>{d.frontmatter.title}</Link>
              </li>
            ))}
          </ul>
          <Link href="/work" className="nb-extlink">
            All case studies →
          </Link>
        </div>

        <div>
          <SectionLabel>Blog</SectionLabel>
          <p className="nb-elsewhere__lead">Shorter notes and essays.</p>
          <ul className="nb-elsewhere__list">
            {posts.slice(0, 4).map((d) => (
              <li key={d.slug}>
                <Link href={`/blog/${d.slug}`}>{d.frontmatter.title}</Link>
              </li>
            ))}
          </ul>
          <Link href="/blog" className="nb-extlink">
            All posts →
          </Link>
        </div>
      </section>
    </div>
  );
}
