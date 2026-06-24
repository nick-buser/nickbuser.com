"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { useCommandPalette } from "@/components/command-palette";

export function SiteHeader() {
  const { toggle } = useCommandPalette();
  return (
    <header className="border-b border-border">
      <div className="nb-wrap flex items-center justify-between py-4">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 100",
            fontWeight: 600,
            fontSize: "1.05rem",
            letterSpacing: "-0.01em",
            color: "var(--foreground)",
            textDecoration: "none",
          }}
        >
          {site.name}
        </Link>
        <nav className="flex items-center gap-6">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="nb-extlink">
              {item.title}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggle}
            aria-label="Open command menu"
            className="rounded-[2px] border border-border px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-brass hover:text-brass"
          >
            ⌘K
          </button>
        </nav>
      </div>
    </header>
  );
}
