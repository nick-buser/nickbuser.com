/**
 * Figure — the plate. A framed, captioned container for a live diagram, chart,
 * or SVG. Breaks out a little wider than the reading measure (see `.nb-figure`)
 * and carries a mono figure number with an italic caption beneath.
 *
 * <Figure num="Fig. 1" caption="The git push → live deploy path.">
 *   <CicdFlow />
 * </Figure>
 */
export function Figure({
  children,
  num,
  caption,
  frame = true,
}: {
  children: React.ReactNode;
  num?: string;
  caption?: React.ReactNode;
  /** wrap children in the surface/hairline plate. Off for bespoke SVGs. */
  frame?: boolean;
}) {
  return (
    <figure className="nb-figure not-prose">
      {frame ? <div className="nb-figure__frame">{children}</div> : children}
      {caption || num ? (
        <figcaption className="nb-figure__caption">
          {num ? <span className="nb-figure__num">{num}</span> : null}
          {caption ? (
            <span className="nb-figure__caption-body">{caption}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
