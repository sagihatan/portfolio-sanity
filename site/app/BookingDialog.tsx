"use client";

import { useEffect, useRef, useState } from "react";

export default function BookingDialog({ bookingUrl }: { bookingUrl: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;

    let restorePage: (() => void) | undefined;
    let pressedBackdrop = false;
    const close = () => dialog.close();
    const onClose = () => {
      restorePage?.();
      restorePage = undefined;
      setIsOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      const trigger = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[data-booking-trigger]")
        : null;
      // Preserve new-tab / modified clicks and the ordinary link without JS.
      if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (dialog.open) return;
      dialog.showModal();
      event.preventDefault();
      const scrollY = window.scrollY;
      const body = document.body;
      const root = document.documentElement;
      const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: root.style.overflow, paddingRight: body.style.paddingRight };
      const scrollbar = window.innerWidth - root.clientWidth;
      if (scrollbar) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
      root.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      restorePage = () => {
        body.style.position = previous.position;
        body.style.top = previous.top;
        body.style.width = previous.width;
        body.style.paddingRight = previous.paddingRight;
        root.style.overflow = previous.overflow;
        window.scrollTo({ top: scrollY, behavior: "instant" });
        trigger.focus({ preventScroll: true });
      };
      setLoaded(false);
      setIsOpen(true);
    };
    const isBackdrop = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    };
    const onPointerDown = (event: PointerEvent) => { pressedBackdrop = isBackdrop(event); };
    const onPointerUp = (event: PointerEvent) => {
      if (pressedBackdrop && isBackdrop(event) && window.matchMedia("(min-width: 721px)").matches) close();
      pressedBackdrop = false;
    };
    document.addEventListener("click", onClick);
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      document.removeEventListener("click", onClick);
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
      if (dialog.open) dialog.close();
      restorePage?.();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="booking-dialog" aria-labelledby="booking-title">
      <div className="booking-handle" aria-hidden="true" />
      <header className="booking-header">
        <h2 id="booking-title">Book a call</h2>
        <button type="button" className="booking-close" aria-label="Close booking" autoFocus onClick={() => dialogRef.current?.close()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="booking-content">
        {isOpen && <>
          {!loaded && <p className="booking-loading" role="status">Loading available times…</p>}
          <iframe title="Book a 30-minute call with Sagi" src={`${bookingUrl}?embed=true&theme=light&layout=month_view`} onLoad={() => setLoaded(true)} />
        </>}
      </div>
      <footer className="booking-footer"><a href={bookingUrl} target="_blank" rel="noopener noreferrer">Open in Cal.com <span aria-hidden="true">↗</span></a></footer>
    </dialog>
  );
}
