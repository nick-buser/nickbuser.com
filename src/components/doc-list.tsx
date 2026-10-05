import Link from "next/link";
import { Chip } from "@/components/ui";

export interface DocListItem {
  href: string;
  title: string;
  description: string;
  /** Left-margin readout: date, timeframe, reading time — one per line. */
  meta: string[];
  chips?: string[];
}

/**
 * DocList — the ledger of writeups and posts. A mono readout in the left margin,
 * the title in Fraunces and its description in Spectral on the right, each
 * entry closed by a hairline. Collapses to a single column on narrow screens.
 */
export function DocList({ items }: { items: DocListItem[] }) {
  if (items.length === 0) {
    return <p className="nb-empty">Nothing here yet.</p>;
  }
  return (
    <ul className="nb-doclist">
      {items.map((d) => (
        <li key={d.href} className="nb-doclist__item">
          <div className="nb-doclist__meta">
            {d.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div>
            <h2 className="nb-doclist__title">
              <Link href={d.href}>{d.title}</Link>
            </h2>
            <p className="nb-doclist__desc">{d.description}</p>
            {d.chips?.length ? (
              <div className="nb-card__chips">
                {d.chips.map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
