/**
 * PageHeader — the masthead for an index page: an engraved mono eyebrow, the
 * title in Fraunces, and an optional lead in Spectral at reading measure.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
}) {
  return (
    <header className="nb-pagehead">
      {eyebrow ? <p className="nb-pagehead__eyebrow">{eyebrow}</p> : null}
      <h1 className="nb-pagehead__title">{title}</h1>
      {lead ? <p className="nb-pagehead__lead">{lead}</p> : null}
    </header>
  );
}
