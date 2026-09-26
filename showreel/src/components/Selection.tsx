import { lerp } from "../lib/anim";

// ─── The glass selection ring and its choreography ────────────────────
// Look: the original sleek glass band (brand gradient under a white sheen, white edges, soft glow),
// revealed along the frame's edge by an SVG stroke mask so it can draw and un-draw.
// Motion: as the camera settles on a frame, the ring draws from its top-centre down both sides and
// meets at the bottom (quick → slow). It holds, then fades out with a hint of expansion as the camera
// leaves. Nothing travels between frames — only the camera moves.

export type Box = { x: number; y: number; w: number; h: number; r: number; name: string };

export const RING_GAP = 14;
export const RING = 20;
const G = RING_GAP + RING / 2; // ring centreline offset from the frame
const OFF = 6000; // masked layers start this far above/left of the canvas origin

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const c01 = (t: number) => Math.min(1, Math.max(0, t));

const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;

const centreline = (F: Box) => ({ x: F.x - G, y: F.y - G, w: F.w + 2 * G, h: F.h + 2 * G, r: F.r + G });

/** Where the ray from the frame's centre toward (tx, ty) meets the ring, as a point and a 0..1 perimeter position. */
const edgePoint = (F: Box, tx: number, ty: number) => {
  const c = centreline(F);
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  const s = Math.min(Math.abs((c.w / 2) / (dx || 1e-6)), Math.abs((c.h / 2) / (dy || 1e-6)));
  const px = cx + dx * s;
  const py = cy + dy * s;
  // perimeter position, clockwise from the path start (top edge, x + r), straight sides approximated
  const P = 2 * (c.w + c.h);
  let d: number;
  if (Math.abs(py - c.y) < 1) d = px - (c.x + c.r);
  else if (Math.abs(px - (c.x + c.w)) < 1) d = c.w - c.r + (py - c.y);
  else if (Math.abs(py - (c.y + c.h)) < 1) d = c.w - c.r + c.h + (c.x + c.w - px);
  else d = c.w - c.r + c.h + c.w + (c.y + c.h - py);
  return { x: px, y: py, p: (((d / P) % 1) + 1) % 1 };
};

export type RingState = { k: number; p: number; a: number; o: number; grow: number }; // frame k: arc centred on p, half-length a (0..0.5), opacity, scale
export type Selection = { rings: RingState[] };

/** open[k] = when the ring starts drawing around frame k; fade[k] = when it starts fading away. */
export const selectionAt = (frames: Box[], open: number[], fade: number[], f: number, len: { open: number; fade: number }): Selection => {
  const rings: RingState[] = [];
  frames.forEach((F, k) => {
    if (f < open[k] || f >= fade[k] + len.fade) return;
    const out = c01((f - fade[k]) / len.fade);
    rings.push({
      k,
      p: edgePoint(F, F.x + F.w / 2, F.y - 1e5).p, // top-centre
      a: 0.5 * easeOut(c01((f - open[k]) / len.open)),
      o: 1 - easeInOut(out),
      grow: 1 + 0.015 * easeOut(out),
    });
  });
  return { rings };
};

const bandMask = (F: Box, s: RingState, width: number, blur = 0) => {
  const c = centreline(F);
  const pad = 140;
  const W = c.w + pad * 2;
  const H = c.h + pad * 2;
  const vb = `${c.x - pad} ${c.y - pad} ${W} ${H}`;
  const P = 2 * (c.w + c.h) - 8 * c.r + 2 * Math.PI * c.r; // perimeter in px
  const len = Math.min(1, s.a * 2) * P;
  const start = (s.p - s.a) * P;
  const filt = blur ? `<filter id='b' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='${blur}'/></filter>` : "";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='${vb}'>${filt}<path d='${rrect(c.x, c.y, c.w, c.h, c.r)}' fill='none' stroke='black' stroke-width='${width}' stroke-linecap='round' stroke-dasharray='${len} ${P - len + 0.01}' stroke-dashoffset='${-start}' ${blur ? "filter='url(#b)'" : ""}/></svg>`;
  return { url: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, x: c.x - pad, y: c.y - pad, W, H };
};

/** One ring: the original CSS glass band, revealed along the drawn arc. */
export const SelectionRing: React.FC<{ F: Box; s: RingState }> = ({ F, s }) => {
  if (s.a <= 0.002) return null;
  const o = RING_GAP + RING;
  const box: React.CSSProperties = { position: "absolute", left: F.x - o, top: F.y - o, width: F.w + o * 2, height: F.h + o * 2, borderRadius: F.r + o };
  const band = bandMask(F, s, RING + 8);
  const glow = bandMask(F, s, 170, 34);
  // Masked layers span the whole canvas (offset so negative world coordinates stay inside the mask's box)
  const layer = (m: ReturnType<typeof bandMask>): React.CSSProperties => ({
    position: "absolute",
    left: -OFF,
    top: -OFF,
    width: OFF * 4,
    height: OFF * 4,
    WebkitMaskImage: m.url,
    maskImage: m.url,
    WebkitMaskPosition: `${m.x + OFF}px ${m.y + OFF}px`,
    maskPosition: `${m.x + OFF}px ${m.y + OFF}px`,
    WebkitMaskSize: `${m.W}px ${m.H}px`,
    maskSize: `${m.W}px ${m.H}px`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        overflow: "visible",
        opacity: s.o,
        transformOrigin: `${F.x + F.w / 2}px ${F.y + F.h / 2}px`,
        transform: `scale(${s.grow})`,
      }}
    >
      {/* soft brand glow, following the line */}
      <div style={layer(glow)}>
        <div style={{ position: "absolute", left: OFF, top: OFF }}>
          <div style={{ ...box, boxShadow: "0 40px 90px -30px rgba(181,39,82,.45), 0 0 60px -10px rgba(212,83,46,.25)" }} />
        </div>
      </div>
      {/* the glass band + crisp edges */}
      <div style={layer(band)}>
        <div style={{ position: "absolute", left: OFF, top: OFF }}>
        <div
          style={{
            ...box,
            padding: RING,
            background:
              "linear-gradient(160deg, rgba(255,255,255,.62), rgba(255,255,255,.14) 42%, rgba(255,255,255,.4)), linear-gradient(132deg, rgba(212,83,46,.34), rgba(181,39,82,.3) 50%, rgba(66,7,90,.34))",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div style={{ ...box, border: "1.5px solid rgba(255,255,255,.85)" }} />
        <div
          style={{
            position: "absolute",
            left: F.x - RING_GAP,
            top: F.y - RING_GAP,
            width: F.w + RING_GAP * 2,
            height: F.h + RING_GAP * 2,
            borderRadius: F.r + RING_GAP,
            border: "1.5px solid rgba(255,255,255,.7)",
            boxShadow: "inset 0 0 0 1px rgba(181,39,82,.12)",
          }}
        />
        </div>
      </div>
    </div>
  );
};
