// @ts-nocheck
"use client";
import { useEffect } from "react";

export default function ClientScripts() {
  useEffect(() => {
    // TWEAKS persistent state
    const TWEAKS = /*EDITMODE-BEGIN*/{
      "accentHue": "warm",
      "bg": "#FFFFFF"
    }/*EDITMODE-END*/;

    const HUE_GRADIENTS = {
      warm: "linear-gradient(140deg, #DC6034 16.04%, #C32B5A 50.78%, #671186 84.49%)",
      cool: "linear-gradient(140deg, #1ebfa0 16.04%, #2c6edb 50.78%, #4a2cdb 84.49%)",
      mono: "linear-gradient(140deg, #444 16.04%, #222 50.78%, #000 84.49%)",
      sun: "linear-gradient(140deg, #f5a524 16.04%, #e0467e 50.78%, #b02cb8 84.49%)"
    };
    const root = document.documentElement;

    function applyTweaks() {
      root.style.setProperty('--grad', HUE_GRADIENTS[TWEAKS.accentHue] || HUE_GRADIENTS.warm);
      root.style.setProperty('--bg', TWEAKS.bg);
      // swatch selection
      document.querySelectorAll('#hueSwatches .tw-swatch').forEach(s => s.classList.toggle('sel', s.dataset.hue === TWEAKS.accentHue));
      document.querySelectorAll('#bgSwatches .tw-swatch').forEach(s => s.classList.toggle('sel', s.dataset.bg === TWEAKS.bg));
    }
    applyTweaks();

    // CARD VIDEO: play-once on view, replay on hover
    (function () {
      const vids = document.querySelectorAll('[data-card-video]');
      const played = new WeakSet();
      const tryPlay = (v) => {
        try {
          const p = v.play();
          if (p && p.then) p.then(() => played.add(v)).catch(() => { });
          else played.add(v);
        } catch (e) { }
      };

      // Force iOS Safari to paint the first frame (it otherwise shows blank
      // background until play() actually resolves, which can be delayed on
      // Low Power Mode or weak connections)
      vids.forEach(v => {
        const paintFirstFrame = () => {
          try { v.currentTime = 0.05; } catch (e) { }
        };
        if (v.readyState >= 1) paintFirstFrame();
        else v.addEventListener('loadedmetadata', paintFirstFrame, { once: true });
      });

      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          const v = en.target;
          if (en.isIntersecting && !played.has(v)) {
            v.currentTime = 0;
            tryPlay(v);
          }
        }
      }, { threshold: 0.25 });
      vids.forEach(v => {
        io.observe(v);
        const card = v.closest('.v-card') || v.closest('.cta-visual');
        if (card) {
          card.addEventListener('mouseenter', () => {
            v.currentTime = 0;
            tryPlay(v);
          });
        }
      });

      // iOS Low Power Mode safety net: first touch anywhere retries all videos
      function onFirstInteraction() {
        vids.forEach(v => {
          if (v.paused) tryPlay(v);
        });
        window.removeEventListener('touchstart', onFirstInteraction);
        window.removeEventListener('click', onFirstInteraction);
      }
      window.addEventListener('touchstart', onFirstInteraction, { passive: true });
      window.addEventListener('click', onFirstInteraction);
    })();

    // NAV scroll — gate class toggle by state change to avoid layout churn
    (function () {
      const nav = document.getElementById('topnav');
      let compact = false;
      function onScroll() {
        const shouldCompact = window.scrollY > 40;
        if (shouldCompact !== compact) {
          compact = shouldCompact;
          nav.classList.toggle('compact', compact);
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();

    // TESTIMONIALS carousel — infinite loop
    (function () {
      const track = document.getElementById('love-track');
      if (!track) return;

      // Snapshot the original cards, then build clones on both sides for seamless looping
      const originals = Array.from(track.children);
      const N = originals.length;
      if (N === 0) return;

      // Append clones at end and prepend clones at start
      originals.forEach(card => {
        const c = card.cloneNode(true);
        c.dataset.clone = '1';
        track.appendChild(c);
      });
      originals.slice().reverse().forEach(card => {
        const c = card.cloneNode(true);
        c.dataset.clone = '1';
        track.insertBefore(c, track.firstChild);
      });

      const starPositions = ['top', 'right', 'bottom', 'left'];
      // total children now = 3N. Real originals occupy indices [N .. 2N-1].
      // loveIdx is the card centered in the viewport, so the first real card
      // (Daphna) is the featured card on initial reveal.
      let loveIdx = N;
      let animating = false;

      function stepWidth() {
        const first = track.children[0];
        const gap = parseInt(getComputedStyle(track).gap) || 24;
        return first.offsetWidth + gap;
      }

      function visibleCount() {
        const w = stepWidth();
        const trackWidth = track.parentElement.clientWidth;
        return Math.max(1, Math.round(trackWidth / w));
      }

      function swipeThreshold() {
        const singleCardView = visibleCount() === 1;
        const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const ratio = singleCardView || coarsePointer ? 0.1 : 0.22;
        const cap = singleCardView || coarsePointer ? 44 : 80;
        return Math.max(22, Math.min(cap, stepWidth() * ratio));
      }

      function applyStarsAndActive() {
        for (let i = 0; i < track.children.length; i++) {
          track.children[i].classList.toggle('active', i === loveIdx);
          // star position derived from logical (real) index so it stays consistent per testimonial
          const logical = ((i - N) % N + N) % N;
          track.children[i].setAttribute('data-star', starPositions[logical % starPositions.length]);
        }
      }

      function translateFor(idx, dragOffset = 0) {
        const card = track.children[idx] || track.children[0];
        const cardWidth = card ? card.offsetWidth : 0;
        const wrapWidth = track.parentElement.clientWidth;
        const centeredOffset = (wrapWidth - cardWidth) / 2;
        return centeredOffset - (idx * stepWidth()) + dragOffset;
      }

      function setTranslate(withTransition) {
        track.style.transition = withTransition
          ? 'transform .7s cubic-bezier(.2, .7, .2, 1)'
          : 'none';
        track.style.transform = `translateX(${translateFor(loveIdx)}px)`;
      }

      function snapIfNeeded() {
        // If we've drifted off the middle set, jump back to equivalent index in middle set
        if (loveIdx >= 2 * N) {
          loveIdx -= N;
          setTranslate(false);
        } else if (loveIdx < N) {
          loveIdx += N;
          setTranslate(false);
        }
        applyStarsAndActive();
        animating = false;
      }

      track.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') snapIfNeeded();
      });

      track.addEventListener('animationend', (e) => {
        if (e.animationName && e.animationName.indexOf('love-fan-') === 0) {
          e.target.removeAttribute('data-fan');
        }
      });

      function go(dir) {
        if (animating) return;
        animating = true;
        loveIdx += dir;
        setTranslate(true);
        applyStarsAndActive();
      }

      document.getElementById('love-prev').addEventListener('click', () => go(-1));
      document.getElementById('love-next').addEventListener('click', () => go(+1));

      // Swipe / drag support (mobile + desktop pointer)
      (function attachSwipe() {
        let startX = 0, startY = 0, dx = 0, dy = 0;
        let dragging = false, locked = false;
        let pointerId = null;

        function onDown(e) {
          if (animating) return;
          startX = e.clientX;
          startY = e.clientY;
          dx = 0; dy = 0;
          dragging = true;
          locked = false;
          pointerId = e.pointerId;
          try { track.setPointerCapture(pointerId); } catch (_) { }
          track.classList.add('is-dragging');
          track.style.transition = 'none';
        }
        function onMove(e) {
          if (!dragging) return;
          dx = e.clientX - startX;
          dy = e.clientY - startY;
          if (!locked) {
            // Lock axis once movement exceeds a small threshold
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
              if (Math.abs(dx) > Math.abs(dy)) {
                locked = 'x';
              } else {
                locked = 'y';
                dragging = false;
                track.classList.remove('is-dragging');
                track.style.transition = 'transform .7s cubic-bezier(.2, .7, .2, 1)';
                track.style.transform = `translateX(${translateFor(loveIdx)}px)`;
                return;
              }
            } else {
              return;
            }
          }
          if (locked === 'x') {
            if (e.cancelable) e.preventDefault();
            track.style.transform = `translateX(${translateFor(loveIdx, dx)}px)`;
          }
        }
        function onUp() {
          if (!dragging) return;
          dragging = false;
          track.classList.remove('is-dragging');
          try { track.releasePointerCapture(pointerId); } catch (_) { }
          const threshold = swipeThreshold();
          if (locked === 'x' && Math.abs(dx) > threshold) {
            const dir = dx < 0 ? +1 : -1;
            animating = true;
            loveIdx += dir;
            track.style.transition = 'transform .5s cubic-bezier(.2, .7, .2, 1)';
            track.style.transform = `translateX(${translateFor(loveIdx)}px)`;
            applyStarsAndActive();
          } else {
            // Snap back
            track.style.transition = 'transform .45s cubic-bezier(.2, .7, .2, 1)';
            track.style.transform = `translateX(${translateFor(loveIdx)}px)`;
          }
          locked = false;
          pointerId = null;
        }

        track.addEventListener('pointerdown', onDown);
        track.addEventListener('pointermove', onMove, { passive: false });
        track.addEventListener('pointerup', onUp);
        track.addEventListener('pointercancel', onUp);
        // Don't let images/inner drag interfere
        track.addEventListener('dragstart', e => e.preventDefault());
        track.style.touchAction = 'pan-y';
      })();

      let rTO;
      window.addEventListener('resize', () => {
        clearTimeout(rTO);
        rTO = setTimeout(() => setTranslate(false), 120);
      });

      // Initial paint — position without transition
      requestAnimationFrame(() => {
        setTranslate(false);
        applyStarsAndActive();
        // Tag the 3 initially-visible cards so the fan entrance animation
        // targets them (not offscreen clones). Runs once, then the
        // animationend cleanup hands control back to normal carousel styles.
        const centerIdx = loveIdx;
        const cCenter = track.children[centerIdx];
        const cLeft = track.children[centerIdx - 1];
        const cRight = track.children[centerIdx + 1];
        if (cCenter) cCenter.setAttribute('data-fan', 'center');
        if (cLeft) cLeft.setAttribute('data-fan', 'left');
        if (cRight) cRight.setAttribute('data-fan', 'right');
      });
    })();

    // EDIT MODE + TWEAKS
    (function () {
      const fab = document.getElementById('twFab');
      const panel = document.getElementById('twPanel');
      window.addEventListener('message', (e) => {
        const d = e.data || {};
        if (d.type === '__activate_edit_mode') fab.classList.add('show');
        if (d.type === '__deactivate_edit_mode') { fab.classList.remove('show'); panel.classList.remove('show'); }
      });
      try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) { }
      fab.addEventListener('click', () => panel.classList.toggle('show'));

      function bindSwatches(selector, key) {
        document.querySelectorAll(selector).forEach(s => {
          s.addEventListener('click', () => {
            TWEAKS[key] = s.dataset[key === 'accentHue' ? 'hue' : 'bg'];
            applyTweaks();
            try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: TWEAKS[key] } }, '*'); } catch (e) { }
          });
        });
      }
      bindSwatches('#hueSwatches .tw-swatch', 'accentHue');
      bindSwatches('#bgSwatches .tw-swatch', 'bg');
    })();

    // CINEMATIC REVEAL on scroll
    (function () {
      const triggers = document.querySelectorAll('.sys-reveal-trigger');
      const mobileReveal = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
      function revealDelayFor(id) {
        if (mobileReveal) {
          if (id === 'about') return 180;
          if (id === 'work') return 420;
          return 80;
        }
        return id === 'about' ? 600 : 340;
      }
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.unobserve(entry.target);
            const delay = revealDelayFor(entry.target.id);
            setTimeout(() => entry.target.classList.add('is-revealed'), delay);
          }
        }
      }, {
        threshold: 0,
        rootMargin: mobileReveal ? '0px 0px -12% 0px' : '0px 0px -10% 0px'
      });
      triggers.forEach(el => io.observe(el));

      if (mobileReveal) {
        const about = document.getElementById('about');
        const aboutGrid = about && about.querySelector('.about-grid');
        if (about && aboutGrid) {
          const aboutIo = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                aboutIo.unobserve(entry.target);
                setTimeout(() => about.classList.add('about-mobile-revealed'), 220);
              }
            }
          }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });
          aboutIo.observe(aboutGrid);
        }
      }

      // iOS safety net: after 6s, only force-reveal sections already at/above
      // the current viewport — never preempt sections still below the fold.
      setTimeout(() => {
        const vh = window.innerHeight;
        triggers.forEach(el => {
          if (el.classList.contains('is-revealed')) return;
          const rect = el.getBoundingClientRect();
          if (rect.top < vh * 0.9) el.classList.add('is-revealed');
        });
      }, 6000);
    })();

    // PARALLAX — rAF-throttled so mousemove doesn't write styles per-pixel
    (function () {
      const bg = document.querySelector('.bg-waves');
      if (!bg) return;
      let tx = 0, ty = 0, queued = false;
      window.addEventListener('mousemove', (e) => {
        tx = -(e.clientX / window.innerWidth - 0.5) * 30;
        ty = -(e.clientY / window.innerHeight - 0.5) * 30;
        if (!queued) {
          queued = true;
          requestAnimationFrame(() => {
            bg.style.setProperty('--px', tx);
            bg.style.setProperty('--py', ty);
            queued = false;
          });
        }
      }, { passive: true });
    })();

    // LOAD SEQUENCE — one char-splitter helper for all headlines
    // (runs immediately inside useEffect — DOM is already ready)
    (() => {
      function splitChars(selector, startOffset) {
        let idx = startOffset || 0;
        document.querySelectorAll(selector).forEach(el => {
          const walk = (node) => {
            if (node.nodeType === 3) {
              const text = node.textContent;
              if (!text.trim()) return;
              const frag = document.createDocumentFragment();
              for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === ' ' || ch === '\n') {
                  frag.appendChild(document.createTextNode(ch));
                } else {
                  const span = document.createElement('span');
                  span.textContent = ch;
                  span.className = 'char';
                  span.style.setProperty('--char-index', idx++);
                  frag.appendChild(span);
                }
              }
              node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT') {
              Array.from(node.childNodes).forEach(walk);
            }
          };
          Array.from(el.childNodes).forEach(walk);
        });
      }

      // Each section gets its own independent character index sequence
      splitChars('.hero-title .mask-text');
      splitChars('#services .section-title .mask-text');
      splitChars('#services .v-title');
      splitChars('#about .about-title .mask-text');
      splitChars('#about .about-sig .mask-text');
      splitChars('#work .section-title .mask-text');
      splitChars('#work .tile .overlay h4');
      splitChars('#love .love-title .mask-text');
      splitChars('#cta .cta-title .mask-text');

      document.body.classList.add('init-load');

      // Clean up nav animation so compact state can use backdrop-filter
      const topnav = document.getElementById('topnav');
      if (topnav) {
        topnav.addEventListener('animationend', function handler() {
          topnav.style.animation = 'none';
          topnav.style.visibility = 'visible';
          topnav.style.top = '0';
          topnav.removeEventListener('animationend', handler);
        });
      }
    })();
    (function () {
      const mq = window.matchMedia('(max-width: 720px)');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!mq.matches || prefersReduced.matches) return;

      const work = document.getElementById('work');
      const tiles = Array.from(document.querySelectorAll('#work .bento .tile'));
      if (!work || !tiles.length) return;

      // Wait for the first-scroll reveal to finish before taking over transforms
      let revealDone = false;
      function armAfterReveal() {
        if (revealDone) return;
        revealDone = true;
        work.classList.add('reveal-done');
      }
      if (work.classList.contains('is-revealed')) {
        // reveal already triggered before script ran
        setTimeout(armAfterReveal, 2000);
      } else {
        const mo = new MutationObserver(() => {
          if (work.classList.contains('is-revealed')) {
            mo.disconnect();
            // longest stagger (740ms) + duration (1100ms) + buffer
            setTimeout(armAfterReveal, 2000);
          }
        });
        mo.observe(work, { attributes: true, attributeFilter: ['class'] });
      }

      // Per-card lag weights — varied so movement feels layered
      const WEIGHTS = [0.95, 0.55, 0.35, 0.85, 0.50, 0.30];
      const MAX_PX = 14;          // hard clamp on drift amplitude
      const VEL_DECAY = 0.82;     // how fast raw velocity dies
      const SMOOTH = 0.18;        // how fast display chases target

      let lastY = window.scrollY;
      let rawVel = 0;
      let displayVel = 0;
      let inView = false;
      let rafId = null;

      function onScroll() {
        const y = window.scrollY;
        rawVel = y - lastY;
        lastY = y;
        if (inView && rafId == null) rafId = requestAnimationFrame(tick);
      }

      function tick() {
        rafId = null;
        // Hold off until entrance reveal has finished
        if (!revealDone) { return; }
        // smooth the raw velocity; raw decays each frame
        displayVel += (rawVel - displayVel) * SMOOTH;
        rawVel *= VEL_DECAY;

        const clamped = Math.max(-MAX_PX * 2, Math.min(MAX_PX * 2, displayVel));

        for (let i = 0; i < tiles.length; i++) {
          const w = WEIGHTS[i % WEIGHTS.length];
          let y = clamped * w;
          if (y > MAX_PX) y = MAX_PX;
          else if (y < -MAX_PX) y = -MAX_PX;
          tiles[i].style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
        }

        // keep ticking while there's meaningful motion; otherwise settle
        if (Math.abs(displayVel) > 0.05 || Math.abs(rawVel) > 0.05) {
          rafId = requestAnimationFrame(tick);
        } else {
          displayVel = 0;
          rawVel = 0;
          for (let i = 0; i < tiles.length; i++) {
            tiles[i].style.transform = 'translate3d(0,0,0)';
          }
        }
      }

      // Only run the loop when the section is on screen
      const io = new IntersectionObserver((entries) => {
        inView = entries.some(e => e.isIntersecting);
        if (inView && rafId == null) rafId = requestAnimationFrame(tick);
      }, { rootMargin: '120px 0px' });
      io.observe(work);

      window.addEventListener('scroll', onScroll, { passive: true });
    })();

    // Shimmer restart on every hover — CSS alone can't restart a completed forwards-fill animation
    document.querySelectorAll('.btn-primary').forEach(function(btn) {
      btn.addEventListener('mouseenter', function() {
        btn.classList.remove('shimmer-play');
        void btn.offsetWidth; // force reflow so browser sees animation as new
        btn.classList.add('shimmer-play');
      });
      btn.addEventListener('mouseleave', function() {
        btn.classList.remove('shimmer-play');
      });
    });

  }, []);

  return null;
}
