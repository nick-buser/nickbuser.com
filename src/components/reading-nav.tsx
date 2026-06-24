"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * ReadingNav — the marginal apparatus. A sticky table of contents that tracks
 * the section you're reading, with a brass marker that slides between entries
 * and a thin reading-progress rule across the top. Reads the rendered `h2[id]`
 * headings out of the prose, so it stays in sync with whatever the article
 * actually renders. Hidden on narrow viewports (the progress rule stays).
 *
 * Scroll-spy is a rAF-throttled scroll handler picking the last heading whose
 * top has crossed a reading line — robust for short sections and fast scrolls
 * where a naive IntersectionObserver flickers. The marker is positioned
 * imperatively (via ref) so a wrapping entry stays measured without re-render.
 */

interface Heading {
  id: string;
  text: string;
}

const READING_LINE = 140; // px from viewport top that marks "now reading"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ReadingNav({
  contentSelector = ".nb-prose",
}: {
  contentSelector?: string;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Collect headings + wire the scroll spy. Initial state writes are deferred
  // into a rAF callback (not the effect body) on purpose.
  useEffect(() => {
    const root = document.querySelector(contentSelector);
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("h2[id]"));

    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;

      let current = els[0]?.id ?? "";
      for (const el of els) {
        if (el.getBoundingClientRect().top - READING_LINE <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const init = requestAnimationFrame(() => {
      setHeadings(els.map((el) => ({ id: el.id, text: el.textContent?.trim() ?? "" })));
      update();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(init);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [contentSelector]);

  // Slide the marker to the active entry. Imperative (ref) so a wrapping entry
  // is measured correctly and moving it never triggers a re-render.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const marker = markerRef.current;
    if (!list || !marker || !activeId) return;
    const link = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(activeId)}"]`);
    if (!link) return;
    marker.style.transform = `translateY(${link.offsetTop}px)`;
    marker.style.height = `${link.offsetHeight}px`;
    marker.style.opacity = "1";
  }, [activeId, headings]);

  return (
    <>
      <div className="nb-readbar" aria-hidden="true">
        <div ref={fillRef} className="nb-readbar__fill" />
      </div>

      {headings.length >= 2 ? (
        <nav className="nb-toc" aria-label="On this page">
          <p className="nb-toc__eyebrow">On this page</p>
          <ul className="nb-toc__list" ref={listRef}>
            <span ref={markerRef} className="nb-toc__marker" aria-hidden="true" />
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  data-id={h.id}
                  className={`nb-toc__link${h.id === activeId ? " is-active" : ""}`}
                  aria-current={h.id === activeId ? "true" : undefined}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
