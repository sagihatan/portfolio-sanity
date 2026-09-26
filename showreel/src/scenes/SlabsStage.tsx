import { AbsoluteFill, useCurrentFrame } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { CORNERS, PATHS, SLABS, SlabId, bbox } from "../lib/logo";
import { EXPO, IN_OUT, SOFT, clamp01, kf, lerp, tw } from "../lib/anim";
import { c, font, shadowFloat } from "../lib/brand";
import { MockDashboard } from "../components/MockDashboard";
import { MockPhone } from "../components/MockPhone";
import { MockCanvas } from "../components/MockCanvas";
import { Layout, barWidth, useLayout } from "../lib/layout";
import { Cursor } from "../components/Cursor";

// ─── Layout ────────────────────────────────────────────────
const S = 10; // logo scale in scene 1 → 490 × 560

type Rect = { x: number; y: number; w: number; h: number };
// Mock UIs render at native size; placement scales them uniformly.
const NATIVE: Record<SlabId, { w: number; h: number }> = {
  mid: { w: 1040, h: 640 },
  bot: { w: 620, h: 420 },
  top: { w: 320, h: 660 },
};
type Place = { cx: number; cy: number; s: number; z: number; r: number };
const PLACES: Record<"h" | "v", Record<SlabId, Place>> = {
  h: {
    mid: { cx: 910, cy: 500, s: 1, z: -170, r: 24 },
    bot: { cx: 560, cy: 745, s: 1, z: 150, r: 18 },
    top: { cx: 1470, cy: 550, s: 1, z: 250, r: 44 },
  },
  v: {
    mid: { cx: 540, cy: 720, s: 0.96, z: -170, r: 24 },
    bot: { cx: 350, cy: 1330, s: 0.95, z: 150, r: 18 },
    top: { cx: 790, cy: 1250, s: 1.1, z: 250, r: 44 },
  },
};

// Geometry for the current composition, set once per render by SlabsStage (children render in the same pass).
let W = 1920;
let H = 1080;
let CX = 960;
let CY = 540;
let VERT = false;
let OX = 0;
let OY = 0;
let PANEL = {} as Record<SlabId, Rect & { z: number; r: number }>;
let BAR: Rect = { x: 0, y: 0, w: 0, h: 0 };
const applyLayout = (L: Layout) => {
  ({ W, H, cx: CX, cy: CY, vertical: VERT } = L);
  OX = CX - (49 * S) / 2;
  OY = CY - (56 * S) / 2;
  const places = PLACES[VERT ? "v" : "h"];
  PANEL = Object.fromEntries(
    SLABS.map((id) => {
      const p = places[id];
      const w = NATIVE[id].w * p.s;
      const h = NATIVE[id].h * p.s;
      return [id, { x: p.cx - w / 2, y: p.cy - h / 2, w, h, z: p.z, r: p.r }];
    }),
  ) as typeof PANEL;
  const bw = barWidth(VERT);
  BAR = { x: CX - bw / 2, y: CY - 6, w: bw, h: 12 };
};
const EXPLODE_Z: Record<SlabId, number> = { top: 190, mid: 0, bot: -190 };
const STAGGER: Record<SlabId, number> = { top: 0, mid: 6, bot: 12 };
const DRAW: Record<SlabId, [number, number]> = { top: [10, 36], mid: [40, 72], bot: [76, 98] };
const FILL: Record<SlabId, [number, number]> = { top: [34, 72], mid: [66, 104], bot: [92, 126] };
const TAGS: Record<SlabId, string> = { top: "01 — Think", mid: "02 — Design", bot: "03 — Ship" };

const LEN: Record<SlabId, number> = {
  top: getLength(PATHS.top),
  mid: getLength(PATHS.mid),
  bot: getLength(PATHS.bot),
};

// Fraction along each path where each corner sits (anchor pop timing)
const CORNER_T: Record<SlabId, number[]> = Object.fromEntries(
  SLABS.map((id) => {
    const samples = Array.from({ length: 240 }, (_, i) => getPointAtLength(PATHS[id], (i / 240) * LEN[id])!);
    return [
      id,
      CORNERS[id].map(([x, y]) => {
        let best = 0;
        let bd = Infinity;
        samples.forEach((p, i) => {
          const d = (p.x - x) ** 2 + (p.y - y) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        return best / 240;
      }),
    ];
  }),
) as Record<SlabId, number[]>;

const logoRect = (id: SlabId): Rect => {
  const b = bbox(id);
  return { x: OX + b.x * S, y: OY + b.y * S, w: b.w * S, h: b.h * S };
};
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

// ─── Pieces ────────────────────────────────────────────────
const GradDefs = ({ id }: { id: string }) => {
  const g: Record<SlabId, [number, number, number, number]> = {
    mid: [-7.59, 0.87, 28.52, 58.12],
    bot: [-5.29, 25.34, 19.68, 64.94],
    top: [9.98, -6.68, 34.72, 32.72],
  };
  const [x1, y1, x2, y2] = g[id as SlabId];
  return (
    <linearGradient id={`lg-${id}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFA800" />
      <stop offset="0.5076" stopColor="#C32B5A" />
      <stop offset="1" stopColor="#2A00A3" />
    </linearGradient>
  );
};

export const SlabArt: React.FC<{ id: SlabId; asRect: boolean; dim?: number }> = ({ id, asRect, dim = 0 }) => {
  const b = bbox(id);
  return (
    <svg
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible", filter: dim ? `brightness(${1 - dim})` : undefined }}
    >
      <defs>
        <GradDefs id={id} />
      </defs>
      {asRect ? (
        <rect x={b.x - 1} y={b.y - 1} width={b.w + 2} height={b.h + 2} fill={`url(#lg-${id})`} />
      ) : (
        <path d={PATHS[id]} fill={`url(#lg-${id})`} />
      )}
    </svg>
  );
};

const Slab: React.FC<{ id: SlabId; f: number; idx: number }> = ({ id, f, idx }) => {
  const st = STAGGER[id];
  const e = tw(f, 128, 188, 0, 1, IN_OUT);
  const m = tw(f, 196 + st, 262 + st, 0, 1, IN_OUT);
  const mc = tw(f, 196 + st, 246 + st, 0, 1, IN_OUT);
  const o = tw(f, 404 + st / 2, 440 + st / 2, 0, 1, IN_OUT);

  const P = PANEL[id];
  let r = lerpRect(logoRect(id), P, m);
  r = lerpRect(r, BAR, o);
  const float = Math.sin(f / 42 + idx * 2) * 7 * m * (1 - o);
  const z = lerp(lerp(EXPLODE_Z[id] * e, P.z, m), 0, o);
  const radius = lerp(lerp(0, P.r, mc), 6, o);

  // Slab corners (normalized in its bbox) → rect corners
  const b = bbox(id);
  const rectPts = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const poly = CORNERS[id]
    .map(([x, y], k) => {
      const nx = (x - b.x) / b.w;
      const ny = (y - b.y) / b.h;
      return `${(lerp(nx, rectPts[k][0], mc) * 100).toFixed(3)}% ${(lerp(ny, rectPts[k][1], mc) * 100).toFixed(3)}%`;
    })
    .join(", ");

  const fill = tw(f, FILL[id][0], FILL[id][1], 0, 1, SOFT);
  const wipe = fill * 118 - 6;
  const content = tw(f, 234 + st, 262 + st) * (1 - tw(f, 416, 430));
  const contentFrame = f - (id === "mid" ? 230 : id === "top" ? 236 : 240);
  const Mock = id === "mid" ? MockDashboard : id === "top" ? MockPhone : MockCanvas;
  const glow = e * (1 - m);

  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        transformStyle: "preserve-3d",
        transform: `translate3d(0, ${float}px, ${z}px)`,
      }}
    >
      {/* Soft coloured glow under the slab in exploded view */}
      {glow > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: glow * 0.55, filter: "blur(26px)", transform: "translateZ(-60px)" }}>
          <SlabArt id={id} asRect={false} />
        </div>
      )}
      {/* Extrusion: stacked darker copies give each slab thickness */}
      {glow > 0.01 &&
        Array.from({ length: 9 }, (_, k) => (
          <div key={k} style={{ position: "absolute", inset: 0, opacity: e * (1 - clamp01(mc * 4)), transform: `translateZ(${-(k + 1) * 2.2}px)` }}>
            <SlabArt id={id} asRect={false} dim={0.35 + k * 0.03} />
          </div>
        ))}
      {/* Panel shadow */}
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, boxShadow: shadowFloat, opacity: tw(mc, 0.7, 1) * (1 - o) }} />
      {/* Face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          clipPath: mc > 0 ? `polygon(${poly})` : undefined,
          WebkitMaskImage: fill < 1 ? `linear-gradient(128deg, #000 ${wipe}%, transparent ${wipe + 10}%)` : undefined,
          maskImage: fill < 1 ? `linear-gradient(128deg, #000 ${wipe}%, transparent ${wipe + 10}%)` : undefined,
        }}
      >
        <SlabArt id={id} asRect={mc > 0} />
        {content > 0.001 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: NATIVE[id].w,
              height: NATIVE[id].h,
              transformOrigin: "0 0",
              transform: `scale(${r.w / NATIVE[id].w}, ${r.h / NATIVE[id].h})`,
              opacity: content,
            }}
          >
            <Mock f={contentFrame} />
          </div>
        )}
        {/* Inner edge light, like the site's cards */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            opacity: mc * (1 - o),
            boxShadow: "0 0 0 1px rgba(234,236,240,.9) inset, 0 -3px 0 0 rgba(0,0,0,.04) inset, 0 0 0 2px rgba(255,255,255,.6) inset",
          }}
        />
        {/* Glint sweep across the finished logo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%)",
            transform: `translateX(${tw(f, 104 + st, 150 + st, -120, 120, SOFT)}%)`,
            opacity: 1 - m,
          }}
        />
      </div>
    </div>
  );
};

/** Pen-tool drawing overlay: strokes, anchors, selection box. Lives flat in the world. */
const PenOverlay: React.FC<{ f: number }> = ({ f }) => {
  const out = 1 - tw(f, 108, 128);
  if (out <= 0) return null;
  const selIn = tw(f, 102, 112) * (1 - tw(f, 126, 138));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${OX} ${OY}) scale(${S})`} opacity={out}>
        {SLABS.map((id) => {
          const p = tw(f, DRAW[id][0], DRAW[id][1], 0, 1, IN_OUT);
          if (p <= 0) return null;
          const ev = evolvePath(p, PATHS[id]);
          return (
            <path
              key={id}
              d={PATHS[id]}
              fill="none"
              stroke={c.figma}
              strokeWidth={0.2}
              strokeDasharray={ev.strokeDasharray}
              strokeDashoffset={ev.strokeDashoffset}
            />
          );
        })}
      </g>
      {SLABS.flatMap((id) =>
        CORNERS[id].map(([x, y], k) => {
          const at = lerp(DRAW[id][0], DRAW[id][1], CORNER_T[id][k]);
          const s = tw(f, at - 1, at + 8, 0, 1, EXPO) * out;
          if (s <= 0) return null;
          const handle = tw(f, at, at + 10, 0, 1, EXPO) * (1 - tw(f, at + 14, at + 24));
          const sx = OX + x * S;
          const sy = OY + y * S;
          return (
            <g key={`${id}${k}`} transform={`translate(${sx} ${sy}) scale(${s})`}>
              {handle > 0.01 && (
                <g opacity={handle} stroke={c.figma} strokeWidth={1.2}>
                  <line x1={-34 * handle} y1={-24 * handle} x2={34 * handle} y2={24 * handle} />
                  <circle cx={-34 * handle} cy={-24 * handle} r={3.5} fill="#fff" />
                  <circle cx={34 * handle} cy={24 * handle} r={3.5} fill="#fff" />
                </g>
              )}
              <rect x={-5} y={-5} width={10} height={10} fill="#fff" stroke={c.figma} strokeWidth={1.6} />
            </g>
          );
        }),
      )}
      {selIn > 0.01 && (
        <g opacity={selIn}>
          <rect x={OX - 12} y={OY - 12} width={49 * S + 24} height={56 * S + 24} fill="none" stroke={c.figma} strokeWidth={1.5} />
          {[
            [0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1],
          ].map(([u, v], i) => (
            <rect key={i} x={OX - 12 + u * (49 * S + 24) - 5} y={OY - 12 + v * (56 * S + 24) - 5} width={10} height={10} fill="#fff" stroke={c.figma} strokeWidth={1.5} />
          ))}
          <g transform={`translate(${CX} ${OY + 56 * S + 36})`}>
            <rect x={-52} y={-2} width={104} height={24} rx={5} fill={c.figma} />
            <text x={0} y={15} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={600} fontFamily={font.body}>
              490 × 560
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

const penCursor = (f: number) => {
  const tip = (id: SlabId, t: number) => {
    const p = getPointAtLength(PATHS[id], clamp01(t) * LEN[id])!;
    return [OX + p.x * S, OY + p.y * S];
  };
  const seq: [number, number, () => number[]][] = [];
  if (f < DRAW.top[0]) {
    const s = tip("top", 0);
    const t = tw(f, 0, DRAW.top[0], 0, 1, EXPO);
    return [lerp(CX + 420, s[0], t), lerp(CY + 280, s[1], t)];
  }
  for (const id of SLABS) {
    const [a, b] = DRAW[id];
    if (f <= b) {
      if (f >= a) return tip(id, IN_OUT((f - a) / (b - a)));
      // gap: glide from previous end to this start
      const prev = SLABS[SLABS.indexOf(id) - 1];
      const from = tip(prev, 1);
      const to = tip(id, 0);
      const t = IN_OUT((f - DRAW[prev][1]) / (a - DRAW[prev][1]));
      return [lerp(from[0], to[0], t), lerp(from[1], to[1], t)];
    }
  }
  void seq;
  const end = tip("bot", 1);
  const t = tw(f, DRAW.bot[1], 130, 0, 1, IN_OUT);
  return [lerp(end[0], CX + 540, t), lerp(end[1], CY + 470, t)];
};

/** Billboarded layer tags in the exploded view. */
const Tag: React.FC<{ id: SlabId; f: number; rx: number; ry: number; rz: number }> = ({ id, f, rx, ry, rz }) => {
  const st = STAGGER[id];
  const v = tw(f, 160 + st, 180 + st) * (1 - tw(f, 200, 214));
  if (v <= 0.01) return null;
  const e = tw(f, 128, 188, 0, 1, IN_OUT);
  const right = CORNERS[id][1];
  const x = OX + right[0] * S + 26;
  const y = OY + right[1] * S;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transformStyle: "preserve-3d",
        transform: `translateZ(${EXPLODE_Z[id] * e}px) rotateZ(${-rz}deg) rotateY(${-ry}deg) rotateX(${-rx}deg)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          transform: `translate(${(1 - v) * -16}px, -50%)`,
          opacity: v,
          fontFamily: font.sans,
          fontSize: 17,
          fontWeight: 600,
          color: c.ink,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ width: 60 * v, height: 1.5, background: c.ink, opacity: 0.35 }} />
        <div
          style={{
            padding: "9px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,.78)",
            border: "1px solid rgba(234,236,240,.9)",
            boxShadow: "0 8px 20px -8px rgba(16,24,40,.2)",
            letterSpacing: "-0.01em",
          }}
        >
          {TAGS[id]}
        </div>
      </div>
    </div>
  );
};

/** Floating chips around the interface collage. */
const Chips: React.FC<{ f: number; rx: number; ry: number; rz: number }> = ({ f, rx, ry, rz }) => {
  const items = VERT
    ? [
        { x: 60, y: 300, z: 320, d: 282, el: "comment" },
        { x: 560, y: 250, z: 280, d: 292, el: "tokens" },
        { x: 520, y: 1690, z: 360, d: 302, el: "proto" },
      ]
    : [
        { x: 300, y: 205, z: 320, d: 282, el: "comment" },
        { x: 1120, y: 150, z: 280, d: 292, el: "tokens" },
        { x: 1250, y: 890, z: 360, d: 302, el: "proto" },
      ];
  return (
    <>
      {items.map((it, i) => {
        const v = tw(f, it.d, it.d + 22) * (1 - tw(f, 396, 408));
        if (v <= 0.01) return null;
        const bob = Math.sin(f / 38 + i * 1.7) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y,
              transformStyle: "preserve-3d",
              transform: `translate3d(0, ${bob}px, ${it.z}px) rotateZ(${-rz}deg) rotateY(${-ry}deg) rotateX(${-rx}deg) scale(${lerp(0.7, 1, v)})`,
              opacity: v,
            }}
          >
            {it.el === "comment" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50% 50% 50% 4px", background: "linear-gradient(140deg,#F4C9A8,#D9B9D0)", border: "2.5px solid #fff", boxShadow: "0 6px 14px -4px rgba(0,0,0,.25)" }} />
                <div style={{ background: "#fff", borderRadius: "4px 16px 16px 16px", padding: "11px 15px", fontFamily: font.body, fontSize: 15, boxShadow: shadowFloat, border: `1px solid ${c.border}` }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#8A8A92", marginBottom: 3 }}>Noa · Product lead</div>
                  This flow feels effortless ✨
                </div>
              </div>
            )}
            {it.el === "tokens" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.9)", borderRadius: 16, padding: "10px 14px", boxShadow: shadowFloat, border: `1px solid ${c.border}`, fontFamily: font.body, fontSize: 13, fontWeight: 600 }}>
                {["#FFA800", "#C32B5A", "#2A00A3"].map((col) => (
                  <div key={col} style={{ width: 22, height: 22, borderRadius: 7, background: col, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.4)" }} />
                ))}
                <span style={{ marginLeft: 4 }}>brand/gradient</span>
              </div>
            )}
            {it.el === "proto" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: c.ink, color: "#fff", borderRadius: 999, padding: "11px 18px 11px 12px", boxShadow: "0 16px 30px -12px rgba(0,0,0,.4)", fontFamily: font.body, fontSize: 14, fontWeight: 600 }}>
                <div style={{ width: 24, height: 24, borderRadius: 99, background: "linear-gradient(132deg,#D4532E,#B52752,#42075A)", display: "grid", placeItems: "center" }}>
                  <div style={{ width: 0, height: 0, borderLeft: "8px solid #fff", borderTop: "5px solid transparent", borderBottom: "5px solid transparent", marginLeft: 2 }} />
                </div>
                Smart animate · 300ms
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

/** Screen-space layout grid + centre guides for the opening. */
const Guides: React.FC<{ f: number }> = ({ f }) => {
  const v = tw(f, 0, 18) * (1 - tw(f, 104, 130));
  if (v <= 0) return null;
  const draw = tw(f, 0, 30, 0, 1, EXPO);
  return (
    <AbsoluteFill style={{ opacity: v }}>
      <div style={{ position: "absolute", left: W * 0.1875, right: W * 0.1875, top: 0, bottom: 0, display: "flex", gap: 24 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ flex: 1, background: "rgba(195,43,90,.028)", transform: `scaleY(${tw(f, i * 1.5, 24 + i * 1.5, 0, 1, EXPO)})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: CY, left: 0, width: W * draw, height: 1, background: "rgba(195,43,90,.35)" }} />
      <div style={{ position: "absolute", left: CX, top: 0, height: H * draw, width: 1, background: "rgba(195,43,90,.35)" }} />
    </AbsoluteFill>
  );
};

export const SlabsStage: React.FC = () => {
  const f = useCurrentFrame();
  applyLayout(useLayout());

  const rx = kf(f, [[128, 0], [188, 56], [212, 60], [266, 9], [404, 3], [440, 0]]);
  const ry = kf(f, [[196, 0], [266, -15], [404, -5], [440, 0]]);
  const rz = kf(f, [[128, 0], [188, -34], [212, -40], [266, 0]]);
  const sc = kf(f, [[0, 0.9], [128, 1], [188, 0.9], [266, 1.0], [404, 1.06], [440, 1]], (t) => SOFT(t));
  const [cx, cy] = penCursor(f);
  const curV = tw(f, 0, 8) * (1 - tw(f, 112, 128));

  return (
    <AbsoluteFill>
      <Guides f={f} />
      <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            width: W,
            height: H,
            transformStyle: "preserve-3d",
            transformOrigin: `${CX}px ${CY}px`,
            transform: `scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          }}
        >
          {SLABS.map((id, i) => (
            <Slab key={id} id={id} f={f} idx={i} />
          ))}
          <PenOverlay f={f} />
          {SLABS.map((id) => (
            <Tag key={id} id={id} f={f} rx={rx} ry={ry} rz={rz} />
          ))}
          <Chips f={f} rx={rx} ry={ry} rz={rz} />
        </div>
      </AbsoluteFill>
      {curV > 0.01 && (
        <div style={{ position: "absolute", left: CX + (cx - CX) * sc, top: CY + (cy - CY) * sc, opacity: curV }}>
          <Cursor scale={1.25} />
        </div>
      )}
    </AbsoluteFill>
  );
};
