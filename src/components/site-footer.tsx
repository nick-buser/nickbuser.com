import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="flex gap-4">
          <a
            href={site.socials.github}
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a href="/feed.xml" className="transition-colors hover:text-foreground">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
