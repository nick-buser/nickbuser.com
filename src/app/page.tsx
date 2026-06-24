import { site } from "@/lib/site";
import { projects } from "@/lib/projects";
import { ExtLink } from "@/components/ui";
import { WorkBrowser } from "@/components/work-browser";

export default function Home() {
  return (
    <div className="nb-wrap nb-settle" style={{ paddingBottom: 96 }}>
      {/* ── Masthead: the name set in live Fraunces, plus real contact links ── */}
      <header style={{ padding: "64px 0 36px" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 144",
            fontWeight: 600,
            fontSize: "clamp(2.6rem, 1.9rem + 3vw, 4.4rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
          }}
        >
          {site.name}
        </h1>
        <nav
          style={{ display: "flex", gap: 20, marginTop: 22, flexWrap: "wrap" }}
        >
          <ExtLink href={site.socials.github}>GitHub</ExtLink>
          <ExtLink href={site.socials.linkedin}>LinkedIn</ExtLink>
          <ExtLink href={site.socials.email}>Email</ExtLink>
        </nav>
      </header>

      <hr className="nb-rule" style={{ margin: "8px 0 44px" }} />

      {/* ── Work — grouped, searchable, filterable ──────────────────────── */}
      <WorkBrowser projects={projects} />
    </div>
  );
}
