import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { EXPO, IN, IN_OUT, clamp01, lerp, rand, tw } from "../lib/anim";
import { c, font, grad } from "../lib/brand";
import { PAN_IN, PAN_OUT, T, TOUR_FROM, VORTEX, ZOOM_OUT } from "../lib/timeline";
import { WEB, WebFrame } from "../components/frames/WebFrame";
import { MOBILE, MobileFrame } from "../components/frames/MobileFrame";
import { SAAS, SaasFrame } from "../components/frames/SaasFrame";
import { SYSTEM, SystemFrame } from "../components/frames/SystemFrame";
import { BRAND, BrandFrame } from "../components/frames/BrandFrame";
import { useLayout } from "../lib/layout";
import { RING, RING_GAP, Selection, SelectionRing, selectionAt } from "../components/Selection";

// ─── Geometry, per orientation ──────────────────────────────────────
export type R = { x: number; y: number; w: number; h: number };
export type Frame = R & { name: string; lines: string[]; r: number };
// screen = (world − C) · z + P
export type Cam = { cx: number; cy: number; z: number; px: number; py: number };
export type Key = Cam & { f: number; pan?: boolean; dip?: number }; // dip: how far the camera pulls back mid-pan
type Geo = { frames: Frame[]; keys: Key[]; overview: Cam; collapse: { x: number; y: number } };

/** The canvas: five frames. Landscape = two rows; portrait = a centred column. */
export const layoutFrames = (vertical: boolean) => {
  const pos = vertical
    ? [[0, 0], [1600, 0], [290, 1060], [140, 2120], [150, 3180]]
    : [[0, 0], [1600, 0], [2180, 0], [0, 1060], [1900, 1060]];
  const base = [
    { ...WEB, name: "Websites", lines: ["Websites"], r: 18 },
    { ...MOBILE, name: "Mobile apps", lines: ["Mobile apps"], r: 60 },
    { ...SAAS, name: "SaaS & dashboards", lines: ["SaaS &", "dashboards"], r: 18 },
    { ...SYSTEM, name: "Design systems", lines: ["Design", "systems"], r: 18 },
    { ...BRAND, name: "Branding", lines: ["Branding"], r: 18 },
  ];
  const frames: Frame[] = base.map((b, i) => ({ ...b, x: pos[i][0], y: pos[i][1] }));
  return { frames };
};

const buildGeo = (vertical: boolean): Geo => {
  const { frames } = layoutFrames(vertical);
  const dwellP = vertical ? { px: 540, py: 1120 } : { px: 1300, py: 540 };
  const fit = (k: number): Cam => {
    const F = frames[k];
    const z = vertical ? Math.min(1000 / F.w, 980 / F.h) : Math.min(1100 / F.w, 800 / F.h);
    return { cx: F.x + F.w / 2, cy: F.y + F.h / 2, z, ...dwellP };
  };
  const overview: Cam = vertical ? { cx: 1010, cy: 2040, z: 0.43, px: 540, py: 960 } : { cx: 1810, cy: 980, z: 0.44, px: 960, py: 560 };

  const keys: Key[] = [];
  const f0 = fit(0);
  keys.push({ f: T[0] - 14, ...f0, cy: f0.cy - 760, z: f0.z * 0.7 });
  frames.forEach((_, i) => {
    const d = fit(i);
    keys.push({ f: T[i] + PAN_OUT, ...d, pan: i > 0 });
    keys.push({ f: i < 4 ? T[i + 1] - PAN_IN : ZOOM_OUT[0], ...d, z: d.z * 1.035 });
  });
  keys.push({ f: ZOOM_OUT[1], ...overview });
  // The vortex converges where the headline will write: push in slightly while everything spirals
  const collapse = vertical ? { x: 540, y: 925 } : { x: 960, y: 500 };
  keys.push({ f: VORTEX[0], ...overview });
  keys.push({ f: VORTEX[1], ...overview, z: overview.z * 1.12, px: collapse.x, py: collapse.y });
  return { frames, keys, overview, collapse };
};
const GEO = { h: buildGeo(false), v: buildGeo(true) };
const useGeo = () => GEO[useLayout().vertical ? "v" : "h"];

export const camera = (keys: Key[], f: number): Cam => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = IN_OUT((f - a.f) / (b.f - a.f));
      const dip = b.pan ? 1 - (b.dip ?? 0.34) * Math.sin(Math.PI * t) : 1;
      return {
        cx: lerp(a.cx, b.cx, t),
        cy: lerp(a.cy, b.cy, t),
        z: lerp(a.z, b.z, t) * dip,
        px: lerp(a.px, b.px, t),
        py: lerp(a.py, b.py, t),
      };
    }
  }
  return keys[keys.length - 1];
};

// ─── Overlay: the capability name, big, left ───────────────────────
const Word: React.FC<{ k: number; f: number; frames: Frame[] }> = ({ k, f, frames }) => {
  const { vertical } = useLayout();
  const inAt = T[k] - 2;
  const outAt = k < 4 ? T[k + 1] - 8 : ZOOM_OUT[0] - 4;
  if (f < inAt || f > outAt + 14) return null;
  const out = tw(f, outAt, outAt + 10, 0, 1, IN_OUT);
  const lines = frames[k].lines;
  let n = 0;
  return (
    <div style={{ position: "absolute", left: vertical ? 90 : 118, top: vertical ? 300 : 540 - (lines.length * 104) / 2 - 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: font.sans,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.01em",
          color: "#8A8A92",
          marginBottom: 14,
          opacity: tw(f, inAt, inAt + 8) * (1 - out),
        }}
      >
        <span style={{ color: c.ink }}>0{k + 1}</span>
        <div style={{ width: 56, height: 2, borderRadius: 2, background: "rgba(11,11,15,.12)", overflow: "hidden" }}>
          <div style={{ width: `${((k + 1) / 5) * 100}%`, height: 2, background: grad }} />
        </div>
        <span>05</span>
      </div>
      {lines.map((line) => (
        <div key={line} style={{ overflow: "hidden", padding: "0.04em 0.06em 0.16em", margin: "-0.04em -0.06em -0.16em" }}>
          <div style={{ display: "flex", fontFamily: font.sans, fontWeight: 700, fontSize: 104, lineHeight: 1.0, letterSpacing: "-0.045em", color: c.ink }}>
            {line.split("").map((ch) => {
              const i = n++;
              return (
                <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${tw(f, inAt + i * 0.9, inAt + i * 0.9 + 16, 135, 0, EXPO) - out * 160}%)` }}>
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Vortex: everything spirals into one point ─────────────────────
const vortexT = (f: number) => tw(f, VORTEX[0], VORTEX[1], 0, 1, (t) => t); // linear — the spiral curve supplies the acceleration
/** Polar spiral around the overview centre C: angle accelerates, radius collapses, element spins and shrinks. */
const spiral = (x: number, y: number, C: Cam, v: number, turns: number) => {
  const dx = x - C.cx;
  const dy = y - C.cy;
  const r0 = Math.hypot(dx, dy);
  const a0 = Math.atan2(dy, dx);
  const da = turns * Math.PI * 2 * Math.pow(v, 1.6);
  const r = r0 * (1 - IN(v));
  return { x: C.cx + Math.cos(a0 + da) * r - x, y: C.cy + Math.sin(a0 + da) * r - y, rot: (da * 180) / Math.PI };
};

const FRAG_COLORS = ["#FFA800", "#D4532E", "#C32B5A", "#8E1B6A", "#42075A", "#2A00A3"];
const Fragments: React.FC<{ frames: Frame[]; C: Cam; f: number }> = ({ frames, C, f }) => {
  const v = vortexT(f);
  if (v <= 0) return null;
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => {
        const F = frames[i % frames.length];
        const delay = rand(i + 11) * 0.28;
        const vi = clamp01((v - delay) / (1 - delay));
        if (vi <= 0 || vi >= 1) return null;
        const x = F.x + 40 + rand(i * 3 + 1) * (F.w - 80);
        const y = F.y + 40 + rand(i * 3 + 2) * (F.h - 80);
        const kind = i % 4;
        const w = kind === 2 ? 60 + rand(i + 5) * 70 : 110 + rand(i + 5) * 220;
        const h = kind === 0 ? w * 0.62 : kind === 1 ? 46 : kind === 2 ? w : 20;
        const col = FRAG_COLORS[i % FRAG_COLORS.length];
        const s = spiral(x, y, C, vi, 1.3 + rand(i + 7) * 0.7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              borderRadius: kind === 0 ? 18 : 999,
              background: kind === 0 ? "#fff" : kind === 1 ? grad : kind === 2 ? col : "rgba(11,11,15,.14)",
              border: kind === 0 ? `2px solid ${c.border}` : "none",
              boxShadow: kind === 0 ? "0 20px 40px -20px rgba(66,7,90,.35)" : "none",
              opacity: tw(vi, 0, 0.08) * (1 - tw(vi, 0.85, 1)),
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rot + rand(i) * 90}deg) scale(${lerp(1, 0.2, vi)})`,
            }}
          >
            {kind === 0 && (
              <>
                <div style={{ margin: "18% 12% 0", height: "14%", width: "44%", borderRadius: 8, background: col, opacity: 0.8 }} />
                <div style={{ margin: "8% 12% 0", height: "10%", width: "70%", borderRadius: 8, background: "#E3E1E4" }} />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

/** Everything that differs between the social tour and the website loop. */
export type Plan = {
  offset: number; // added to the Sequence-local frame
  frames: Frame[];
  overview: Cam;
  keys: Key[];
  ring: (f: number) => Selection; // the glass ring on the frame in focus
  lf: (k: number, f: number) => number; // build clock for frame k
  active: (k: number, f: number) => number; // 0..1 — label highlight + selection outline
  focus: (k: number, f: number) => number; // spotlight opacity
  phase: (f: number) => number; // clock for ambient motion (loop-safe on the website)
  labelSize: (k: number) => number; // world px, per frame
  spin: boolean; // vortex
};

const useStoryPlan = (loop: boolean): Plan => {
  const geo = useGeo();
  return {
    offset: TOUR_FROM,
    frames: geo.frames,
    overview: geo.overview,
    keys: geo.keys,
    ring: (f) => selectionAt(geo.frames, T.map((t) => t + PAN_OUT - 6), T.map((t, k) => (k < 4 ? T[k + 1] - PAN_IN : ZOOM_OUT[0])), f, { open: 26, fade: 10 }),
    lf: (k, f) => f - (k === 0 ? TOUR_FROM + 2 : T[k] - 8),
    active: (k, f) => (f >= T[k] + 2 && f < (k < 4 ? T[k + 1] - PAN_IN : ZOOM_OUT[0]) ? tw(f, T[k] + 2, T[k] + 8) : 0),
    // Spotlight: the frame in view is full strength, the rest recede; all return for the zoom-out
    focus: (k, f) => {
      const inF = k === 0 ? 1 : tw(f, T[k] - PAN_IN, T[k] + PAN_OUT);
      const outF = k < 4 ? 1 - tw(f, T[k + 1] - PAN_IN, T[k + 1] + PAN_OUT) : 1;
      return Math.max(tw(f, ZOOM_OUT[0], ZOOM_OUT[0] + 20), 0.22 + 0.78 * inF * outF);
    },
    phase: (f) => f,
    labelSize: () => 0, // the story/film show the big capability word instead of frame titles
    spin: !loop,
  };
};

// ─── Selection ring + title ──────────────────────────────────────────
/** Frame title: plain text above the ring — primary when in focus, quiet grey otherwise. */
const Pill: React.FC<{ F: Frame; size: number; a: number }> = ({ F, size, a }) => {
  const fs = size * 0.8;
  const base: React.CSSProperties = {
    position: "absolute",
    left: F.x + 4,
    top: F.y - RING_GAP - RING - fs * 1.2 - size * 0.75, // clear air between the title and the ring
    fontFamily: font.body,
    fontSize: fs,
    lineHeight: 1.2,
    letterSpacing: "-0.005em",
    whiteSpace: "nowrap",
  };
  return (
    <>
      <div style={{ ...base, fontWeight: 500, color: "#9A9AA2", opacity: 1 - a }}>{F.name}</div>
      {a > 0 && <div style={{ ...base, fontWeight: 700, color: "#B52752", opacity: a }}>{F.name}</div>}
    </>
  );
};

export const World: React.FC<{ plan: Plan }> = ({ plan }) => {
  const f = useCurrentFrame() + plan.offset;
  const { frames: FRAMES, keys, overview, spin } = plan;
  const cam = camera(keys, f);
  const sel = plan.ring(f);
  const act = FRAMES.map((_, k) => plan.active(k, f));
  const lf = (k: number) => plan.lf(k, f);
  const focus = (k: number) => plan.focus(k, f);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${cam.px}px, ${cam.py}px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`,
        }}
      >
        {/* Canvas plane */}
        <div
          style={{
            opacity: spin ? 1 - tw(f, VORTEX[0] + 8, VORTEX[0] + 56) : 1,
            position: "absolute",
            left: -4000,
            top: -3000,
            width: 12000,
            height: 9000,
            background: "#F4F0F1",
            backgroundImage: "radial-gradient(rgba(11,11,15,.10) 2px, transparent 2px)",
            backgroundSize: "36px 36px",
          }}
        />
        {FRAMES.map((F, k) => {
          const v = spin ? vortexT(f) : 0;
          const fcx = F.x + F.w / 2;
          const fcy = F.y + F.h / 2;
          const s = spiral(fcx, fcy, overview, v, 1.1);
          return (
          <div
            key={F.name}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: focus(k) * (1 - tw(v, 0.86, 1)),
              transformOrigin: `${fcx}px ${fcy}px`,
              transform: v > 0 ? `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg) scale(${lerp(1, 0.12, Math.pow(v, 1.2))})` : undefined,
            }}
          >
            {plan.labelSize(k) > 0 && <Pill F={F} size={plan.labelSize(k)} a={act[k]} />}
            <div
              style={{
                position: "absolute",
                left: F.x,
                top: F.y,
                width: F.w,
                height: F.h,
                borderRadius: F.r,
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(16,24,40,.05), 0 40px 80px -40px rgba(66,7,90,.25)",
              }}
            >
              {k === 0 && <WebFrame lf={lf(0)} f={plan.phase(f)} />}
              {k === 1 && <MobileFrame lf={lf(1)} />}
              {k === 2 && <SaasFrame lf={lf(2)} />}
              {k === 3 && <SystemFrame lf={lf(3)} />}
              {k === 4 && <BrandFrame lf={lf(4)} />}
            </div>
          </div>
          );
        })}
        {spin && <Fragments frames={FRAMES} C={overview} f={f} />}
        {sel.rings.map((r) => (
          <SelectionRing key={r.k} F={FRAMES[r.k]} s={r} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const CanvasTour: React.FC<{ loop?: boolean }> = ({ loop = false }) => {
  const f = useCurrentFrame() + TOUR_FROM;
  const plan = useStoryPlan(loop);
  const { vertical } = useLayout();
  const { frames } = useGeo();
  const enter = tw(f, T[0] - 18, T[0] - 4);
  const { collapse } = useGeo();
  // Loop cut: hold the overview, then dissolve back to the empty canvas the film opens on.
  // Film/story: the vortex takes everything into one point.
  const leave = loop ? 1 - tw(f, ZOOM_OUT[1] + 30, ZOOM_OUT[1] + 56, 0, 1, IN_OUT) : 1 - tw(f, VORTEX[1] - 2, VORTEX[1] + 8);
  const v = loop ? 0 : vortexT(f);
  const pulse = loop ? 0 : tw(f, VORTEX[1] - 2, VORTEX[1] + 30, 0, 1, EXPO);
  const scrim = tw(f, T[0] - 10, T[0] + 4) * (1 - tw(f, ZOOM_OUT[0] - 4, ZOOM_OUT[0] + 12));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: enter * leave }}>
        <CameraMotionBlur samples={6} shutterAngle={180}>
          <World plan={plan} />
        </CameraMotionBlur>
      </AbsoluteFill>
      {/* Vortex core: a glow gathers as everything converges, then one soft pulse releases the headline */}
      {v > 0 && pulse < 1 && (
        <div
          style={{
            position: "absolute",
            left: collapse.x - 260,
            top: collapse.y - 260,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,168,0,.35), rgba(195,43,90,.28) 35%, rgba(103,17,134,.12) 60%, transparent 72%)",
            filter: "blur(12px)",
            opacity: Math.pow(v, 1.5) * (1 - pulse),
            transform: `scale(${lerp(0.4, 1.1, v) + pulse * 0.6})`,
          }}
        />
      )}
      {pulse > 0 && pulse < 1 && (
        <div
          style={{
            position: "absolute",
            left: collapse.x,
            top: collapse.y,
            width: 0,
            height: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -pulse * 900,
              top: -pulse * 900,
              width: pulse * 1800,
              height: pulse * 1800,
              borderRadius: "50%",
              boxShadow: "0 0 0 3px rgba(195,43,90,.55), 0 0 60px 10px rgba(255,168,0,.25)",
              opacity: 1 - pulse,
            }}
          />
        </div>
      )}
      <AbsoluteFill
        style={{
          opacity: scrim,
          background: vertical
            ? "linear-gradient(180deg, rgba(250,248,248,.98) 0%, rgba(250,248,248,.94) 24%, rgba(250,248,248,0) 34%)"
            : "linear-gradient(90deg, rgba(250,248,248,.98) 0%, rgba(250,248,248,.94) 27%, rgba(250,248,248,0) 38%)",
        }}
      />
      {frames.map((_, k) => (
        <Word key={k} k={k} f={f} frames={frames} />
      ))}
    </AbsoluteFill>
  );
};
