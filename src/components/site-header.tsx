"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { useCommandPalette } from "@/components/command-palette";

export function SiteHeader() {
  const { toggle } = useCommandPalette();
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm font-semibold">
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggle}
            aria-label="Open command menu"
            className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ⌘K
          </button>
        </nav>
      </div>
    </header>
  );
}
