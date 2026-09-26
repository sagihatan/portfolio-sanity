import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EXPO, IN_OUT, SOFT, kf, lerp, tw } from "../lib/anim";
import { c, font, grad } from "../lib/brand";
import { CORNERS, SlabId, bbox } from "../lib/logo";
import { LogoMark } from "../components/LogoMark";
import { SlabArt } from "./SlabsStage";
import { Layout, useLayout } from "../lib/layout";

// Local frame 0 = END_FROM (see lib/timeline).
// The "full coverage" line draws under the capability pills, then splits into three
// pieces that morph into the logo's slabs — a bookend to the opening's slab → panel morph.

let LINE_X = 580;
const LINE_W = 760;
let LINE_Y = 712;
const LINE_H = 4;

const LOGO_H = 420;
const S = LOGO_H / 56;
let OX = 960 - (49 * S) / 2;
let OY = 250;
let CX = 960;
let CY = 540;
// Centre everything on the current frame (16:9 or 9:16); set once per render by EndCard.
const applyLayout = (L: Layout) => {
  CX = L.cx;
  CY = L.cy;
  LINE_X = CX - LINE_W / 2;
  LINE_Y = CY + (L.vertical ? 130 : 172);
  OX = CX - (49 * S) / 2;
  OY = CY - 290;
};

const ORDER: SlabId[] = ["bot", "mid", "top"]; // left → right segment becomes…
const SWAP = 200; // after this, render the single LogoMark (identical geometry) for the glint

const Wave: React.FC<{ text: string; e: number; start: number; style?: React.CSSProperties }> = ({ text, e, start, style }) => (
  <span style={{ display: "inline-flex", overflow: "hidden", padding: "0.06em 0.08em 0.18em", margin: "-0.06em -0.08em -0.18em", ...style }}>
    {text.split("").map((ch, i) => (
      <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${tw(e, start + i * 2, start + i * 2 + 28, 135, 0, EXPO)}%)` }}>
        {ch}
      </span>
    ))}
  </span>
);

const Piece: React.FC<{ id: SlabId; i: number; e: number }> = ({ id, i, e }) => {
  const gap = tw(e, 138, 152, 0, 28, EXPO);
  const segW = LINE_W / 3;
  const from = { x: LINE_X + i * segW + gap / 2, y: LINE_Y, w: segW - gap, h: LINE_H };
  const b = bbox(id);
  const to = { x: OX + b.x * S, y: OY + b.y * S, w: b.w * S, h: b.h * S };

  const m = tw(e, 146 + i * 5, 192 + i * 5, 0, 1, IN_OUT);
  const mc = tw(e, 154 + i * 5, 192 + i * 5, 0, 1, IN_OUT);
  const arc = -Math.sin(Math.PI * m) * (90 + i * 30);
  const r = { x: lerp(from.x, to.x, m), y: lerp(from.y, to.y, m) + arc, w: lerp(from.w, to.w, m), h: lerp(from.h, to.h, m) };

  // Rect corners TL, TR, BR, BL → slab corners top, right, bottom, left
  const rectPts = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const poly = CORNERS[id]
    .map(([x, y], k) => {
      const nx = (x - b.x) / b.w;
      const ny = (y - b.y) / b.h;
      return `${(lerp(rectPts[k][0], nx, mc) * 100).toFixed(3)}% ${(lerp(rectPts[k][1], ny, mc) * 100).toFixed(3)}%`;
    })
    .join(", ");
  const art = tw(e, 146 + i * 5, 168 + i * 5);

  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        clipPath: `polygon(${poly})`,
        borderRadius: mc > 0 ? 0 : 2,
        transform: `rotate(${Math.sin(Math.PI * m) * (i - 1) * 8}deg)`,
      }}
    >
      {/* Continuous brand gradient while it is still the line */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: grad,
          backgroundSize: `${LINE_W}px 100%`,
          backgroundPosition: `${-(i * segW)}px 0`,
          opacity: 1 - art,
        }}
      />
      <div style={{ position: "absolute", inset: 0, opacity: art }}>
        <SlabArt id={id} asRect={mc < 1} />
      </div>
    </div>
  );
};

export const EndCard: React.FC = () => {
  const e = useCurrentFrame();
  applyLayout(useLayout());
  const draw = tw(e, 98, 124, 0, 1, IN_OUT);
  const cam = kf(e, [[180, 1.03], [268, 1]], SOFT);
  const shadow = tw(e, 196, 230);
  const glint = tw(e, 214, 258, -1, 1, SOFT);

  return (
    <AbsoluteFill style={{ transform: `scale(${e > 180 ? cam : 1})`, transformOrigin: `${CX}px ${CY}px` }}>
      {/* The line */}
      {e >= 98 && e < 140 && (
        <div style={{ position: "absolute", left: LINE_X, top: LINE_Y, width: LINE_W * draw, height: LINE_H, borderRadius: 2, background: grad, backgroundSize: `${LINE_W}px 100%` }} />
      )}
      {e >= 140 && e < SWAP && ORDER.map((id, i) => <Piece key={id} id={id} i={i} e={e} />)}
      {e >= SWAP && (
        <div style={{ position: "absolute", left: OX, top: OY }}>
          <LogoMark
            height={LOGO_H}
            uid="end"
            glint={e > 214 && e < 258 ? glint : undefined}
            style={{ filter: `drop-shadow(0 30px 50px rgba(103,17,134,${0.22 * shadow}))`, display: "block" }}
          />
        </div>
      )}

      {/* Sagi Design */}
      <div
        style={{
          position: "absolute",
          top: OY + LOGO_H + 54,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: font.sans,
          fontWeight: 700,
          fontSize: 104,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: c.ink,
        }}
      >
        <Wave text="Sagi " e={e} start={190} />
        <Wave text="Design" e={e} start={198} />
      </div>
    </AbsoluteFill>
  );
};
