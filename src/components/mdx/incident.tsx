/**
 * Incident cards — a "what broke" list where each entry shows only its headline
 * until opened. Native <details>, so it opens without client JS and works from
 * the keyboard. The closed card carries an explicit "Details +" label, so it
 * reads as something to open rather than a list of headings.
 *
 * <Incidents>
 *   <Incident title="Image pulls failed for a day and a half">
 *
 *   Markdown body, with blank lines around it so MDX parses it as Markdown.
 *
 *   </Incident>
 * </Incidents>
 */
export function Incidents({ children }: { children: React.ReactNode }) {
  return <div className="nb-incidents">{children}</div>;
}

export function Incident({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="nb-incident">
      <summary className="nb-incident__summary">
        <span className="nb-incident__title">{title}</span>
        <span className="nb-incident__toggle" aria-hidden="true" />
      </summary>
      <div className="nb-incident__body">{children}</div>
    </details>
  );
}
