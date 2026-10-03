"use client";
import { useEffect, useRef } from "react";

// Showreel stage under the hero. It shows the reel's first frame as a still
// from the start. The first scroll loads one H.264 MP4 (mobile or desktop).
// When the stage reaches the middle of the screen it widens, the
// hero copy fades and the video plays over the matching still. If the video
// never plays, the still simply stays.
//
// Focus follows the stage's centre (a 1px marker that scaling doesn't move),
// so the widened stage can't keep itself in focus, and the slot gets enough
// room below that the centred stage fills the screen with nothing else in view.
export default function HeroStage() {
  const slotRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    const video = videoRef.current;
    const stage = slot?.firstElementChild as HTMLElement | null;
    const hero = slot?.closest(".hero");
    const mid = stage?.querySelector(".hero-stage-mid");
    if (!slot || !video || !stage || !hero || !mid) return;
    const nextTitle = hero.nextElementSibling?.querySelector("h2");

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

      // Room below so the next section's title stays off screen (with a 24px
      // margin) while the stage is centred.
      slot!.style.paddingBottom = "";
      if (scale <= 1 || !nextTitle) return;
      const gap = nextTitle.getBoundingClientRect().top - slot!.getBoundingClientRect().bottom;
      slot!.style.paddingBottom = `${Math.max(0, Math.ceil((innerHeight - stage!.offsetHeight) / 2 + 24 - gap))}px`;
    }
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });

    // Focus starts when the stage's centre reaches 55% down the screen and
    // ends once it has risen to 20% from the top. The video plays while that
    // centre is anywhere on screen.
    const focus = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-stage-focus", entry.isIntersecting);
    }, { rootMargin: "-20% 0px -45% 0px" });
    const play = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });

    function arm() {
      const size = matchMedia("(max-width: 720px)").matches ? "mobile" : "desktop";
      // One optimized H.264 source; retain the poster if playback is unavailable.
      const source = document.createElement("source");
      source.src = `/assets/showreel/site-${size}-v16.mp4`;
      source.type = "video/mp4";
      video!.append(source);
      video!.muted = true;
      video!.addEventListener("playing", () => stage!.classList.add("is-playing"), { once: true });
      video!.load();
      focus.observe(mid!);
      play.observe(mid!);
    }

    window.addEventListener("scroll", arm, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", arm);
      window.removeEventListener("resize", measure);
      focus.disconnect();
      play.disconnect();
    };
  }, []);

  return (
    <div className="hero-stage-slot" ref={slotRef} aria-hidden="true">
      <div className="hero-stage">
        <span className="hero-stage-mid"></span>
        <div className="hero-stage-inner">
          <picture>
            <source media="(max-width: 720px)" srcSet="/assets/showreel/site-mobile-v16-poster.jpg" />
            <img className="hero-stage-still" src="/assets/showreel/site-desktop-v16-poster.jpg" alt="" fetchPriority="low" decoding="async" />
          </picture>
          <video ref={videoRef} className="hero-stage-video" muted loop playsInline preload="none"></video>
        </div>
      </div>
    </div>
  );
}
