"use client";
import { useEffect, useRef } from "react";

// Showreel stage under the hero. Renders collapsed with no video source, so
// first load is unchanged. After the visitor's first scroll it loads one file
// (mobile or desktop, WebM then MP4) and only unfolds once playback has
// actually started. Any failure leaves it collapsed, as if it didn't exist.
export default function HeroStage() {
  const slotRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    const video = videoRef.current;
    if (!slot || !video) return;

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let near: IntersectionObserver | undefined;
    let seen: IntersectionObserver | undefined;
    let timer = 0;
    let settled = false;

    function fail() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video!.pause();
      video!.replaceChildren();
      video!.load(); // aborts the download
    }

    function reveal() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (slot!.getBoundingClientRect().top < 0) {
        // Already scrolled past: open instantly and keep the visible content still.
        const services = document.getElementById("services");
        const before = services?.getBoundingClientRect().top ?? 0;
        slot!.classList.add("is-instant", "is-ready", "is-open");
        window.scrollBy(0, (services?.getBoundingClientRect().top ?? 0) - before);
      } else {
        slot!.classList.add("is-ready");
        setTimeout(() => slot!.classList.add("is-open"), 800);
      }
      seen = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) video!.play().catch(() => {});
        else video!.pause();
      });
      seen.observe(slot!);
    }

    function start() {
      near?.disconnect();
      const size = matchMedia("(max-width: 720px)").matches ? "mobile" : "desktop";
      for (const ext of ["webm", "mp4"]) {
        const source = document.createElement("source");
        source.src = `/assets/showreel/site-${size}.${ext}`;
        source.type = `video/${ext}`;
        video!.append(source);
      }
      video!.muted = true;
      timer = window.setTimeout(fail, 10000);
      const canPlayThrough = new Promise((resolve) => video!.addEventListener("canplaythrough", resolve, { once: true }));
      video!.load();
      Promise.all([canPlayThrough, video!.play()]).then(reveal, fail);
    }

    function arm() {
      near = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start();
      }, { rootMargin: "0px 0px 25% 0px" });
      near.observe(slot!);
    }

    window.addEventListener("scroll", arm, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", arm);
      near?.disconnect();
      seen?.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="hero-stage-slot" ref={slotRef} aria-hidden="true">
      <div className="hero-stage-clip">
        <div className="hero-stage">
          <div className="hero-stage-chrome"><span className="d"></span><span className="d"></span><span className="d"></span></div>
          <div className="hero-stage-inner">
            <video ref={videoRef} className="hero-stage-video" muted loop playsInline preload="none"></video>
          </div>
        </div>
      </div>
    </div>
  );
}
