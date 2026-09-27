"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { asset: string; title: string };
type Connection = EventTarget & { saveData?: boolean };

/** Decorative loops: a permanent poster under a source-less, viewport-loaded video. */
export default function ServiceVideo({ asset, title }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [controls, setControls] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let disposed = false;
    let near = false;
    let visible = false;
    let failed = false;
    let loaded = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    const permitted = () => !motion.matches && !connection?.saveData;
    const clearWatchdog = () => { if (watchdog) clearTimeout(watchdog); };
    const fail = () => {
      if (disposed) return;
      failed = true;
      clearWatchdog();
      video.pause();
      video.removeAttribute("src");
      video.load();
      setReady(false);
      setControls(false);
    };
    const watch = () => {
      clearWatchdog();
      if (visible && !document.hidden && !pausedRef.current) watchdog = setTimeout(fail, 12000);
    };
    const reveal = () => {
      if (disposed || failed || !permitted() || !visible || document.hidden || pausedRef.current) return;
      clearWatchdog();
      setReady(true);
      setControls(true);
    };
    const playing = () => {
      clearWatchdog();
      if ("requestVideoFrameCallback" in video) {
        if (frame !== undefined) video.cancelVideoFrameCallback(frame);
        frame = video.requestVideoFrameCallback(reveal);
      } else reveal();
    };
    const sync = () => {
      if (disposed || failed) return;
      if (!permitted()) {
        clearWatchdog();
        video.pause();
        if (loaded) { video.removeAttribute("src"); video.load(); loaded = false; }
        setReady(false);
        setControls(false);
        return;
      }
      if (near && !loaded && !document.hidden) {
        loaded = true;
        video.muted = true;
        video.src = `/assets/service-motion/${asset}.mp4`;
        video.preload = "auto";
        video.load();
      }
      if (loaded && visible && !document.hidden && !pausedRef.current) {
        if (!video.paused) return;
        watch();
        video.play().catch((error: DOMException) => {
          // A scroll-away or deliberate pause can interrupt a pending play promise.
          if (error.name !== "AbortError" && visible && !document.hidden && !pausedRef.current) fail();
        });
      } else { clearWatchdog(); video.pause(); }
    };
    const loadObserver = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; sync(); }, { rootMargin: "300px 0px" });
    const playObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= 0.3; sync(); }, { threshold: [0, 0.3] });
    const waiting = () => { if (loaded && permitted()) watch(); };
    video.addEventListener("playing", playing);
    video.addEventListener("waiting", waiting);
    video.addEventListener("error", fail);
    root.addEventListener("service-playback-change", sync);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    loadObserver.observe(root);
    playObserver.observe(root);
    return () => {
      disposed = true;
      clearWatchdog();
      if (frame !== undefined) video.cancelVideoFrameCallback(frame);
      loadObserver.disconnect();
      playObserver.disconnect();
      video.removeEventListener("playing", playing);
      video.removeEventListener("waiting", waiting);
      video.removeEventListener("error", fail);
      root.removeEventListener("service-playback-change", sync);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [asset]);

  function toggle() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    rootRef.current?.dispatchEvent(new Event("service-playback-change"));
  }

  return (
    <div ref={rootRef} className={`v-video service-motion${ready ? " is-ready" : ""}`}>
      <Image className="service-poster" src={`/assets/service-motion/${asset}-poster.webp`} alt="" width={1600} height={1000} loading="lazy" unoptimized />
      <video ref={videoRef} className="service-film" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      {controls && <button className="service-motion-toggle" type="button" onClick={toggle} aria-label={`${paused ? "Play" : "Pause"} ${title} animation`}>
        {paused ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" fill="currentColor" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2" /></svg>}
      </button>}
    </div>
  );
}
