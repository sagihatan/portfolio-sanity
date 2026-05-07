/* eslint-disable @next/next/no-img-element */
"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

export type CapabilityOrbitItem = {
  key: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  altText?: string | null;
};

type CapabilitiesOrbitProps = {
  items: CapabilityOrbitItem[];
};

export default function CapabilitiesOrbit({ items }: CapabilitiesOrbitProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const renderedItems = useMemo(() => items.filter(Boolean), [items]);
  const count = renderedItems.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count === 0) return;

    let lastIdx = 0;
    let raf: number | null = null;

    function update() {
      raf = null;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return;

      let progress: number;
      if (rect.top > 0) progress = 0;
      else if (rect.bottom < vh) progress = 1;
      else progress = -rect.top / scrollable;

      // Map progress to a discrete card index. Math.round gives the *nearest*
      // card, so the middle of each scroll slot lands on that card.
      const idx = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIndex(idx);
      }
    }

    function onScroll() {
      if (raf == null) raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [count]);

  return (
    <section
      id="capabilities"
      className="wrap sys-reveal-trigger"
      aria-label="Product design capabilities"
      ref={sectionRef}
    >
      <div className="cap-stage" style={{ "--cap-active": activeIndex } as CSSProperties}>
        <div className="cap-head">
          <h2 className="section-title">
            <span className="mask-wrap"><span className="mask-text">One designer.</span></span><br />
            <span className="mask-wrap" style={{ paddingTop: "4px" }}>
              <span className="mask-text"><em>Full coverage.</em></span>
            </span>
          </h2>
        </div>

        <div className="cap-track-wrap">
          <div className="cap-track">
            {renderedItems.map((item, i) => (
              <article
                key={item.key}
                className={`cap-card ${i === activeIndex ? "is-active" : ""}`}
              >
                <div className="cap-photo">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.altText || item.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : null}
                </div>
                <h3 className="cap-title">{item.title}</h3>
                <p className="cap-desc">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <nav className="cap-dots" aria-label="Capabilities navigation">
          {renderedItems.map((item, i) => (
            <span
              key={`${item.key}-dot`}
              className={`cap-dot ${i === activeIndex ? "is-active" : ""}`}
              aria-hidden="true"
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
