"use client";
import { useEffect, useRef } from "react";

// Showreel stage under the hero. It shows the reel's first frame as a still
// from the start. The first scroll loads one video (mobile or desktop, WebM
// then MP4); when the stage reaches the middle of the screen it widens, the
// hero copy fades and the video plays over the matching still. If the video
// never plays, the still simply stays.
export default function HeroStage() {
  const slotRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    const video = videoRef.current;
    const stage = slot?.firstElementChild as HTMLElement | null;
    const hero = slot?.closest(".hero");
    if (!slot || !video || !stage || !hero) return;

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Widest the stage gets in focus: the screen minus the gutter, never taller than the screen.
    function measure() {
      const gutter = parseFloat(getComputedStyle(slot!).getPropertyValue("--stage-gutter"));
      const scale = Math.min(
        (innerWidth - 2 * gutter) / stage!.offsetWidth,
        (innerHeight - 2 * gutter) / stage!.offsetHeight,
      );
      slot!.style.setProperty("--stage-scale", String(Math.max(1, scale)));
    }
    measure();
    window.addEventListener("resize", measure, { passive: true });

    const focus = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-stage-focus", entry.isIntersecting);
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { rootMargin: "-35% 0px -35% 0px" });

    function arm() {
      const size = matchMedia("(max-width: 720px)").matches ? "mobile" : "desktop";
      for (const ext of ["webm", "mp4"]) {
        const source = document.createElement("source");
        source.src = `/assets/showreel/site-${size}-v9.${ext}`;
        source.type = `video/${ext}`;
        video!.append(source);
      }
      video!.muted = true;
      video!.addEventListener("playing", () => stage!.classList.add("is-playing"), { once: true });
      video!.load();
      focus.observe(stage!);
    }

    window.addEventListener("scroll", arm, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("resize", measure);
      focus.disconnect();
    };
  }, []);

  return (
    <div className="hero-stage-slot" ref={slotRef} aria-hidden="true">
      <div className="hero-stage">
        <div className="hero-stage-inner">
          <picture>
            <source media="(max-width: 720px)" srcSet="/assets/showreel/site-mobile-v9-poster.webp" />
            <img className="hero-stage-still" src="/assets/showreel/site-desktop-v9-poster.webp" alt="" fetchPriority="low" decoding="async" />
          </picture>
          <video ref={videoRef} className="hero-stage-video" muted loop playsInline preload="none"></video>
        </div>
      </div>
    </div>
  );
}
