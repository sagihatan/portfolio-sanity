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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CapabilitiesOrbit({ items }: CapabilitiesOrbitProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const renderedItems = useMemo(() => items.filter(Boolean), [items]);
  const count = renderedItems.length;
  const maxIndex = Math.max(0, count - 1);

  function goPrev() {
    setActiveIndex((i) => Math.max(0, i - 1));
  }
  function goNext() {
    setActiveIndex((i) => Math.min(maxIndex, i + 1));
  }

  // Desktop & tablet: vertical scroll drives activeIndex. Mobile (≤720px) uses
  // arrow + swipe nav so the page scroll isn't hijacked. The CSS keeps the
  // section sticky on desktop and normal-flow on mobile, so this listener's
  // `scrollable` calculation naturally is non-positive on mobile and exits
  // early — but we also gate it explicitly on the media query for clarity.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count === 0) return;
    const mq = window.matchMedia("(max-width: 720px)");
    let lastIdx = 0;
    let raf: number | null = null;

    function update() {
      raf = null;
      if (mq.matches) return; // mobile: nav handled by arrows + swipe
      const s = section;
      if (!s) return;
      const rect = s.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      if (scrollable <= 0) return;

      let progress: number;
      if (rect.top > 0) progress = 0;
      else if (rect.bottom < vh) progress = 1;
      else progress = -rect.top / scrollable;

      const idx = Math.min(maxIndex, Math.max(0, Math.round(progress * maxIndex)));
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
    mq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [count, maxIndex]);

  // Recompute orbit positions whenever activeIndex (or viewport) changes.
  // CSS @property declarations + transitions on .cap-item smooth the motion —
  // JS only writes the target values, never animates between them.
  useEffect(() => {
    if (count === 0) return;

    function applyPositions() {
      const isMobile = window.matchMedia("(max-width: 720px)").matches;
      const isTablet = window.matchMedia("(max-width: 900px)").matches;

      const rx = isMobile ? 48 : 58;
      const ry = isMobile ? 26 : 34;
      const dotRx = isMobile ? 84 : isTablet ? 75 : 62;
      const dotRy = isMobile ? 23 : isTablet ? 24 : 32;
      const dotCenterY = isMobile ? 29 : isTablet ? 35 : 39;
      const stepDeg = isMobile ? 24 : isTablet ? 30 : 37;
      const visibleDistance = isMobile ? 1.18 : 2.75;
      const farDistance = isMobile ? 2.05 : 4.15;

      renderedItems.forEach((_, i) => {
        const distance = i - activeIndex;
        const abs = Math.abs(distance);
        const angle = 90 - distance * stepDeg;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * rx;
        const y = (isMobile ? 66 : 74) - Math.sin(rad) * ry;
        const dotX = 50 + Math.cos(rad) * dotRx;
        const dotY = dotCenterY - Math.sin(rad) * dotRy;
        const focusness = clamp(1 - abs / visibleDistance, 0, 1);
        const fade = clamp(
          1 - Math.max(0, abs - visibleDistance) / (farDistance - visibleDistance),
          0,
          1,
        );
        const scale = isMobile ? 0.78 + focusness * 0.22 : 0.82 + focusness * 0.24;
        const opacity = isMobile
          ? (0.06 + focusness * 0.78) * fade
          : (0.08 + focusness * 0.9) * fade;
        const blur = (1 - focusness) * (isMobile ? 8 : 7.5);

        const item = itemRefs.current[i];
        if (item) {
          item.style.setProperty("--cap-x", x.toFixed(2));
          item.style.setProperty("--cap-y", y.toFixed(2));
          item.style.setProperty("--cap-scale", scale.toFixed(3));
          item.style.setProperty("--cap-opacity", opacity.toFixed(3));
          item.style.setProperty("--cap-blur", `${blur.toFixed(2)}px`);
          item.style.setProperty("--cap-z", String(Math.round(100 - abs * 10)));
          if (i === activeIndex) item.classList.add("is-active");
          else item.classList.remove("is-active");
        }

        const dot = dotRefs.current[i];
        if (dot) {
          dot.style.setProperty("--cap-dot-x", dotX.toFixed(2));
          dot.style.setProperty("--cap-dot-y", dotY.toFixed(2));
          dot.style.setProperty("--cap-dot-scale", (isMobile ? 0.96 : 1.12).toFixed(3));
          dot.style.setProperty("--cap-dot-opacity", i === activeIndex ? "1" : "0");
          dot.style.setProperty("--cap-dot-blur", "0px");
        }
      });
    }

    applyPositions();
    window.addEventListener("resize", applyPositions);
    return () => window.removeEventListener("resize", applyPositions);
  }, [activeIndex, count, renderedItems]);

  // Touch swipe — left/right gesture on the orbit advances cards. Vertical
  // page scroll is preserved (we only act on swipes that are clearly horizontal).
  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit || count === 0) return;

    let startX: number | null = null;
    let startY: number | null = null;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX === null || startY === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      startY = null;

      // Require a clear horizontal motion: at least 40px and dominant over vertical
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) goNext();
      else goPrev();
    }

    orbit.addEventListener("touchstart", onTouchStart, { passive: true });
    orbit.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      orbit.removeEventListener("touchstart", onTouchStart);
      orbit.removeEventListener("touchend", onTouchEnd);
    };
  }, [count, maxIndex]);

  return (
    <section
      id="capabilities"
      className="wrap sys-reveal-trigger"
      aria-label="Product design capabilities"
      ref={sectionRef}
    >
      <div className="cap-stage">
        <div className="section-head">
          <h2 className="section-title">
            <span className="mask-wrap"><span className="mask-text">One designer.</span></span><br />
            <span className="mask-wrap" style={{ paddingTop: "4px" }}>
              <span className="mask-text"><em>Full coverage.</em></span>
            </span>
          </h2>
        </div>

        <div className="cap-system" data-capabilities-system>
          <div className="cap-dot-layer" aria-hidden="true">
            {renderedItems.map((item, i) => (
              <span
                className="cap-path-dot"
                data-capability-dot
                key={`${item.key}-dot`}
                style={item.iconUrl ? ({ "--cap-icon": `url(${item.iconUrl})` } as CSSProperties) : undefined}
                ref={(node) => {
                  dotRefs.current[i] = node;
                }}
              />
            ))}
          </div>

          <div className="cap-orbit-mask" aria-hidden="true" ref={orbitRef}>
            <div className="cap-orbit">
              {renderedItems.map((item, i) => (
                <article
                  className="cap-item"
                  data-capability-item
                  data-title={item.title}
                  data-copy={item.description}
                  key={item.key}
                  ref={(node) => {
                    itemRefs.current[i] = node;
                  }}
                >
                  <div className="cap-node">
                    <div className="cap-mini">
                      <span className="cap-photo-placeholder">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.altText || item.title}
                            loading={i === activeIndex ? "eager" : "lazy"}
                            decoding="async"
                          />
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="cap-side-copy">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="cap-nav">
          <button
            type="button"
            aria-label="Previous capability"
            onClick={goPrev}
            disabled={activeIndex === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next capability"
            onClick={goNext}
            disabled={activeIndex === maxIndex}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
