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
  const lastTimeRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - 1);

  const renderedItems = useMemo(() => items.filter(Boolean), [items]);

  // Orbit animation: scroll-driven progress with velocity clamp
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || renderedItems.length === 0) return undefined;

    const mobileMQ = window.matchMedia("(max-width: 720px)");
    const tabletMQ = window.matchMedia("(max-width: 900px)");
    const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    let isMobile = mobileMQ.matches;
    let isTablet = tabletMQ.matches;
    let reduceMotion = reducedMQ.matches;
    let wasFarOffScreen = false;

    function readProgress() {
      if (reduceMotion) return 0;
      const rect = section!.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const startDelayRatio = isMobile ? 0.4 : isTablet ? 0.3 : 0.34;
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

    function stepAndHold(p: number, slots: number, range: number, holdRatio: number) {
      const slot = range / slots;
      const idx = Math.min(Math.floor(p / slot), slots - 1);
      const local = p - idx * slot;
      const hold = slot * holdRatio;
      if (local <= hold || idx === slots - 1) return idx;
      const t = (local - hold) / (slot - hold);
      const eased = t * t * (3 - 2 * t);
      return idx + eased;
    }

    function render() {
      rafRef.current = null;

      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;

      // Don't waste frames when the section is far outside the viewport
      const farAbove = rect.top > vh * 1.5;
      const farBelow = rect.bottom < -vh * 0.5;
      if (farAbove || farBelow) {
        progressRef.current = farAbove ? 0 : 1;
        lastTimeRef.current = null;
        wasFarOffScreen = true;
        return;
      }

      const targetProgress = readProgress();

      if (wasFarOffScreen) {
        // Re-entering view — sync immediately so we don't rewind through cards
        progressRef.current = targetProgress;
        lastTimeRef.current = null;
        wasFarOffScreen = false;
      } else {
        const now = performance.now();
        const dt = lastTimeRef.current != null
          ? Math.min(0.05, (now - lastTimeRef.current) / 1000)
          : 0;
        lastTimeRef.current = now;

        if (reduceMotion) {
          progressRef.current = targetProgress;
        } else {
          // Velocity clamp prevents fast scroll velocity from making the visual
          // race through cards in a fraction of a second
          const maxRate = isMobile ? 0.30 : 0.55;
          const lerpDelta = (targetProgress - progressRef.current) * 0.11;
          const maxDelta = maxRate * dt;
          const sign = Math.sign(lerpDelta);
          progressRef.current += sign * Math.min(Math.abs(lerpDelta), maxDelta);
        }
      }

      if (Math.abs(targetProgress - progressRef.current) > 0.005) {
        rafRef.current = requestAnimationFrame(render);
      }

      const progress = progressRef.current;
      const exitStart = reduceMotion ? 1 : isMobile ? 0.72 : 0.8;
      const exitProgress = clamp((progress - exitStart) / Math.max(0.001, 1 - exitStart), 0, 1);
      const easedExit = 1 - Math.pow(1 - exitProgress, 3);
      const holdRatio = isMobile ? 0.45 : 0.40;
      const raw = reduceMotion
        ? 0
        : progress < exitStart
          ? stepAndHold(progress, maxIndex + 1, exitStart, holdRatio)
          : maxIndex + easedExit * (isMobile ? 0.74 : 0.92);
      const nearest = exitProgress > 0 ? maxIndex : clamp(Math.round(raw), 0, maxIndex);

      setFocus(nearest);

      if (systemRef.current) {
        const exitOpacity = reduceMotion ? 1 : 1 - easedExit;
        const exitY = reduceMotion ? 0 : easedExit * (isMobile ? 18 : 28);
        const sticky = systemRef.current.parentElement;
        if (sticky) {
          sticky.style.setProperty("--cap-exit-opacity", exitOpacity.toFixed(3));
          sticky.style.setProperty("--cap-exit-y", `${exitY.toFixed(2)}px`);
        }
      }

      const rx = isMobile ? 48 : 58;
      const ry = isMobile ? 26 : 34;
      const dotRx = isMobile ? 84 : isTablet ? 75 : 62;
      const dotRy = isMobile ? 23 : isTablet ? 24 : 32;
      const dotCenterY = isMobile ? 29 : isTablet ? 35 : 39;
      const stepDeg = isMobile ? 24 : isTablet ? 30 : 37;
      const visibleDistance = isMobile ? 1.18 : 2.75;
      const farDistance = isMobile ? 2.05 : 4.15;

      renderedItems.forEach((_, i) => {
        const distance = i - raw;
        const abs = Math.abs(distance);
        const angle = 90 - distance * stepDeg;
        const rad = angle * Math.PI / 180;
        const x = 50 + Math.cos(rad) * rx;
        const y = (isMobile ? 66 : 74) - Math.sin(rad) * ry;
        const dotX = 50 + Math.cos(rad) * dotRx;
        const dotY = dotCenterY - Math.sin(rad) * dotRy;
        const focusness = clamp(1 - abs / visibleDistance, 0, 1);
        const fade = clamp(1 - Math.max(0, abs - visibleDistance) / (farDistance - visibleDistance), 0, 1);
        const scale = isMobile ? 0.78 + focusness * 0.22 : 0.82 + focusness * 0.24;
        const opacity = isMobile ? (0.06 + focusness * 0.78) * fade : (0.08 + focusness * 0.9) * fade;
        const blur = reduceMotion ? 0 : (1 - focusness) * (isMobile ? 8 : 7.5);
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
          dot.style.setProperty("--cap-dot-scale", (isMobile ? 0.96 : 1.12).toFixed(3));
          dot.style.setProperty("--cap-dot-opacity", i === nearest ? "1" : "0");
          dot.style.setProperty("--cap-dot-blur", "0px");
        }
      });
    }

    function queue() {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(render);
    }

    function onMediaChange() {
      isMobile = mobileMQ.matches;
      isTablet = tabletMQ.matches;
      reduceMotion = reducedMQ.matches;
      queue();
    }

    mobileMQ.addEventListener("change", onMediaChange);
    tabletMQ.addEventListener("change", onMediaChange);
    reducedMQ.addEventListener("change", onMediaChange);

    itemRefs.current[0]?.classList.add("is-active");
    render();

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      mobileMQ.removeEventListener("change", onMediaChange);
      tabletMQ.removeEventListener("change", onMediaChange);
      reducedMQ.removeEventListener("change", onMediaChange);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [maxIndex, renderedItems]);

  // Scoped scroll-snap: pulls scroll position to the nearest card *only* when
  // the user comes to rest strictly within the card range inside the section.
  // No buffer at the edges — we never pull users in from hero or back from
  // about. Other sections are completely untouched.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || renderedItems.length === 0) return undefined;

    const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMQ.matches) return undefined;

    const mobileMQ = window.matchMedia("(max-width: 720px)");
    const tabletMQ = window.matchMedia("(max-width: 900px)");

    let lastSnapTarget: number | null = null;
    let scrollDebounce: ReturnType<typeof setTimeout> | null = null;

    function tryScrollSnap() {
      const rect = section!.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionDocTop = window.scrollY + rect.top;
      const isMobile = mobileMQ.matches;
      const isTablet = tabletMQ.matches;
      // These positions mirror the orbit's progress math: startDelay + i × cardSlot
      const startVH = isMobile ? 40 : isTablet ? 30 : 34;
      const stepVH = isMobile ? 34.5 : isTablet ? 36.8 : 36;
      const count = renderedItems.length;

      const firstPos = sectionDocTop + (startVH * vh) / 100;
      const lastPos = sectionDocTop + ((startVH + (count - 1) * stepVH) * vh) / 100;
      const currentY = window.scrollY;

      // Strict range — must be inside the card range, not in any buffer zone
      if (currentY < firstPos || currentY > lastPos) {
        lastSnapTarget = null;
        return;
      }

      // We just snapped here — don't re-trigger during the smooth-scroll's
      // tail of scroll events
      if (lastSnapTarget != null && Math.abs(currentY - lastSnapTarget) < 5) return;

      let nearest = firstPos;
      for (let i = 1; i < count; i++) {
        const pos = sectionDocTop + ((startVH + i * stepVH) * vh) / 100;
        if (Math.abs(pos - currentY) < Math.abs(nearest - currentY)) {
          nearest = pos;
        }
      }

      if (Math.abs(nearest - currentY) < 3) return;

      lastSnapTarget = Math.round(nearest);
      window.scrollTo({ top: lastSnapTarget, behavior: "smooth" });
    }

    // scrollend (Safari 17+, Chrome 114+) fires once when scrolling truly
    // stops, including after iOS momentum. Falls back to a 220ms debounced
    // scroll listener on older browsers.
    const supportsScrollEnd = "onscrollend" in window;

    function onScrollDebounced() {
      if (scrollDebounce != null) clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(tryScrollSnap, 220);
    }

    if (supportsScrollEnd) {
      window.addEventListener("scrollend", tryScrollSnap, { passive: true });
    } else {
      window.addEventListener("scroll", onScrollDebounced, { passive: true });
    }

    return () => {
      if (supportsScrollEnd) {
        window.removeEventListener("scrollend", tryScrollSnap);
      } else {
        window.removeEventListener("scroll", onScrollDebounced);
      }
      if (scrollDebounce != null) clearTimeout(scrollDebounce);
    };
  }, [renderedItems]);

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
