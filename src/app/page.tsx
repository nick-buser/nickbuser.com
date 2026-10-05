import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, HOME_TOPICS, projectsIn } from "@/lib/projects";
import { getAllWork, getAllWriting } from "@/lib/content";
import { ExtLink, SectionLabel } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";

export default function Home() {
  const essays = projectsIn("essay");
  const writeups = getAllWork();
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

      {/* ── Topics — platform first, then software, then formal modelling.
             One format for all three: a heading, a lead, two-column cards. ── */}
      {HOME_TOPICS.map((id) => {
        const topic = CATEGORIES.find((c) => c.id === id)!;
        return (
          <section key={id} className="nb-home-section" aria-labelledby={id}>
            <div className="nb-home-head">
              <h2 id={id} className="nb-home-head__title">
                {topic.title}
              </h2>
              <p className="nb-home-head__lead">{topic.lead}</p>
            </div>
            <div className="nb-cards">
              {projectsIn(id).map((p) => (
                <ProjectCard key={p.title} project={p} />
              ))}
            </div>
          </section>
        );
      })}

      {/* ── Elsewhere — the rest of the site, off to the side ────────────── */}
      <section className="nb-home-section nb-elsewhere" aria-label="Elsewhere on the site">
        <div>
          <SectionLabel>Visual essays</SectionLabel>
          <p className="nb-elsewhere__lead">
            {CATEGORIES.find((c) => c.id === "essay")!.lead}
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
          <SectionLabel>Writeups</SectionLabel>
          <p className="nb-elsewhere__lead">
            Long-form writeups of how the work fits together.
          </p>
          <ul className="nb-elsewhere__list">
            {writeups.map((d) => (
              <li key={d.slug}>
                <Link href={`/work/${d.slug}`}>{d.frontmatter.title}</Link>
              </li>
            ))}
          </ul>
          <Link href="/work" className="nb-extlink">
            All writeups →
          </Link>
        </div>

        <div>
          <SectionLabel>Blog</SectionLabel>
          <p className="nb-elsewhere__lead">{site.blogLead}</p>
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
