/**
 * Athanor UI primitives — the instrument register.
 *
 * Server components, styled entirely through `.nb-*` utility classes in
 * globals.css so they stay static (no client JS for hover state).
 */

export function Badge({
  tone,
  children,
}: {
  tone: "positive" | "complete";
  children: React.ReactNode;
}) {
  return <span className={`nb-badge nb-badge--${tone}`}>{children}</span>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="nb-chip">{children}</span>;
}

export function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className="nb-extlink"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children} →
    </a>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="nb-section-label">{children}</div>;
}
