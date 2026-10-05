"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { useCommandPalette } from "@/components/command-palette";

/** "/" is only itself; every other section owns its subtree (/work/<slug> → Writeups). */
function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const { toggle } = useCommandPalette();
  const pathname = usePathname();
  return (
    <header className="border-b border-border">
      <div className="nb-wrap nb-header">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="nb-header__name"
        >
          {site.name}
        </Link>
        <nav className="nb-nav" aria-label="Site">
          {site.nav.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nb-extlink nb-nav__link${current ? " is-current" : ""}`}
                aria-current={current ? "page" : undefined}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={toggle}
          aria-label="Open command menu"
          className="nb-header__palette rounded-[2px] border border-border px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-brass hover:text-brass"
        >
          ⌘K
        </button>
      </div>
    </header>
  );
}
