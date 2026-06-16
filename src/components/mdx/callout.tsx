export function Callout({
  children,
  type = "note",
}: {
  children: React.ReactNode;
  type?: "note" | "tip" | "warn";
}) {
  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm leading-relaxed">
      <span className="mb-1 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
        {type}
      </span>
      {children}
    </div>
  );
}
