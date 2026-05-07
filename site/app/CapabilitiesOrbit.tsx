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
  const systemRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - 1);

  const renderedItems = useMemo(() => items.filter(Boolean), [items]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || renderedItems.length === 0) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function readProgress() {
      if (reduceMotion || !section) return 0;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const tablet = window.matchMedia("(max-width: 900px)").matches;
      const startDelayRatio = mobile ? 0.4 : tablet ? 0.3 : 0.34;
      const startDelay = window.innerHeight * startDelayRatio;

      return clamp((-rect.top - startDelay) / Math.max(1, scrollable - startDelay), 0, 1);
    }

    function setFocus(idx: number) {
      if (idx === currentIndexRef.current) return;

      itemRefs.current[currentIndexRef.current]?.classList.remove("is-active");
      currentIndexRef.current = idx;
      itemRefs.current[currentIndexRef.current]?.classList.add("is-active");
      setActiveIndex(idx);
    }

    function render() {
      rafRef.current = null;

      const targetProgress = readProgress();
      progressRef.current += (targetProgress - progressRef.current) * (reduceMotion ? 1 : 0.11);

      if (Math.abs(targetProgress - progressRef.current) > 0.001) {
        rafRef.current = requestAnimationFrame(render);
      }

      const progress = progressRef.current;
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const tablet = window.matchMedia("(max-width: 900px)").matches;
      const exitStart = reduceMotion ? 1 : mobile ? 0.72 : 0.8;
      const exitProgress = clamp((progress - exitStart) / Math.max(0.001, 1 - exitStart), 0, 1);
      const easedExit = 1 - Math.pow(1 - exitProgress, 3);
      const raw = reduceMotion
        ? 0
        : progress < exitStart
          ? (progress / exitStart) * maxIndex
          : maxIndex + easedExit * (mobile ? 0.74 : 0.92);
      const nearest = exitProgress > 0 ? maxIndex : clamp(Math.round(raw), 0, maxIndex);

      setFocus(nearest);

      if (systemRef.current) {
        const exitOpacity = reduceMotion ? 1 : 1 - easedExit;
        const exitY = reduceMotion ? 0 : easedExit * (mobile ? 18 : 28);
        const sticky = systemRef.current.parentElement;
        if (sticky) {
          sticky.style.setProperty("--cap-exit-opacity", exitOpacity.toFixed(3));
          sticky.style.setProperty("--cap-exit-y", `${exitY.toFixed(2)}px`);
        }
      }

      const rx = mobile ? 48 : 58;
      const ry = mobile ? 26 : 34;
      const dotRx = mobile ? 84 : tablet ? 75 : 62;
      const dotRy = mobile ? 23 : tablet ? 24 : 32;
      const dotCenterY = mobile ? 29 : tablet ? 35 : 39;
      const step = mobile ? 24 : tablet ? 30 : 37;
      const visibleDistance = mobile ? 1.18 : 2.75;
      const farDistance = mobile ? 2.05 : 4.15;

      renderedItems.forEach((_, i) => {
        const distance = i - raw;
        const abs = Math.abs(distance);
        const angle = 90 - distance * step;
        const rad = angle * Math.PI / 180;
        const x = 50 + Math.cos(rad) * rx;
        const y = (mobile ? 66 : 74) - Math.sin(rad) * ry;
        const dotX = 50 + Math.cos(rad) * dotRx;
        const dotY = dotCenterY - Math.sin(rad) * dotRy;
        const focusness = clamp(1 - abs / visibleDistance, 0, 1);
        const fade = clamp(1 - Math.max(0, abs - visibleDistance) / (farDistance - visibleDistance), 0, 1);
        const scale = mobile ? 0.78 + focusness * 0.22 : 0.82 + focusness * 0.24;
        const opacity = mobile ? (0.06 + focusness * 0.78) * fade : (0.08 + focusness * 0.9) * fade;
        const blur = reduceMotion ? 0 : (1 - focusness) * (mobile ? 8 : 7.5);
        const item = itemRefs.current[i];

        if (item) {
          item.style.setProperty("--cap-x", x.toFixed(2));
          item.style.setProperty("--cap-y", y.toFixed(2));
          item.style.setProperty("--cap-scale", scale.toFixed(3));
          item.style.setProperty("--cap-opacity", opacity.toFixed(3));
          item.style.setProperty("--cap-blur", `${blur.toFixed(2)}px`);
          item.style.setProperty("--cap-z", String(Math.round(100 - abs * 10)));
        }

        const dot = dotRefs.current[i];

        if (dot) {
          dot.style.setProperty("--cap-dot-x", dotX.toFixed(2));
          dot.style.setProperty("--cap-dot-y", dotY.toFixed(2));
          dot.style.setProperty("--cap-dot-scale", (mobile ? 0.96 : 1.12).toFixed(3));
          dot.style.setProperty("--cap-dot-opacity", i === nearest ? "1" : "0");
          dot.style.setProperty("--cap-dot-blur", "0px");
        }
      });
    }

    function queue() {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(render);
    }

    itemRefs.current[0]?.classList.add("is-active");
    render();

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);

      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [maxIndex, renderedItems]);

  return (
    <section
      id="capabilities"
      className="wrap sys-reveal-trigger"
      aria-label="Product design capabilities"
      ref={sectionRef}
    >
      <div className="cap-sticky">
        <div className="section-head">
          <h2 className="section-title">
            <span className="mask-wrap"><span className="mask-text">One designer.</span></span><br />
            <span className="mask-wrap" style={{ paddingTop: "4px" }}>
              <span className="mask-text"><em>Full coverage.</em></span>
            </span>
          </h2>
        </div>

        <div className="cap-system" data-capabilities-system ref={systemRef}>
          <div className="cap-dot-layer" aria-hidden="true">
            {renderedItems.map((item, i) => (
              <span
                className="cap-path-dot"
                data-capability-dot
                key={`${item.key}-dot`}
                style={item.iconUrl ? { "--cap-icon": `url(${item.iconUrl})` } as CSSProperties : undefined}
                ref={(node) => {
                  dotRefs.current[i] = node;
                }}
              />
            ))}
          </div>

          <div className="cap-orbit-mask" aria-hidden="true">
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
      </div>
    </section>
  );
}
