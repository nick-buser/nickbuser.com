import { site } from "@/lib/site";
import { ExtLink } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="nb-wrap flex flex-wrap items-center justify-between gap-4 py-6">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="flex flex-wrap gap-5">
          <ExtLink href={site.socials.github}>GitHub</ExtLink>
          <ExtLink href={site.socials.linkedin}>LinkedIn</ExtLink>
          <ExtLink href="/feed.xml">RSS</ExtLink>
        </div>
      </div>
    </footer>
  );
}
