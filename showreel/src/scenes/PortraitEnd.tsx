import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { EXPO, IN_OUT, SOFT, lerp, tw } from "../lib/anim";
import { c, font, grad } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { LogoMark } from "../components/LogoMark";

// Story ending. Local frame 0 = END_FROM (same clock as EndCard).
// The headline settles below as a caption (Headline `settle`), a ring draws above it and Sagi rises
// up out of it — a pop-out portrait: the body is clipped by the circle, the head stands above the ring.

const SRC = { w: 514, h: 610, cx: 257, chest: 330 }; // cutout, measured from its alpha
const SCALE = 1.35;
const R = 300;
const STROKE = 7;

/** circle ∪ a column above the centre line (x ∈ cx ± 0.6R): head passes the ring, shoulders are cut by it. */
const popOutClip = (cx: number, cy: number, r: number) => {
  const hw = 0.6 * r;
  const y = cy - Math.sqrt(r * r - hw * hw);
  return `path('M ${cx - hw} 0 L ${cx + hw} 0 L ${cx + hw} ${y} A ${r} ${r} 0 1 1 ${cx - hw} ${y} Z')`;
};

const CARDS = [
  { x: 40, y: 560, w: 300, h: 84, d: -1 },
  { x: 70, y: 720, w: 230, h: 70, d: -1 },
  { x: 740, y: 520, w: 300, h: 84, d: 1 },
  { x: 780, y: 810, w: 250, h: 70, d: 1 },
];

export const PortraitEnd: React.FC = () => {
  const e = useCurrentFrame();
  const { W, H, cx, cy, vertical } = useLayout();
  const ringY = vertical ? 740 : cy - 90;
  const bottom = ringY + R;

  // 1 — once the headline has settled below, the ring draws both ways from the bottom and closes at the top
  const ring = tw(e, 160, 200, 0, 1, IN_OUT);
  const arc = (sweep: 0 | 1) => `M ${cx} ${bottom} A ${R} ${R} 0 0 ${sweep} ${cx} ${ringY - R}`;

  // 2 — glass disc + glow, then Sagi rises out of the circle
  const disc = tw(e, 176, 210, 0, 1, IN_OUT);
  const rise = tw(e, 190, 256, 380, 0, EXPO);
  const person = tw(e, 190, 204);
  const cards = tw(e, 200, 270, 0, 1, EXPO);
  const push = tw(e, 176, 400, 1.04, 1, SOFT);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${cx}px ${ringY}px` }}>
        {/* Glass UI cards drifting behind, echoing the site's About art */}
        {CARDS.map((k, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: k.x + k.d * (1 - cards) * 60,
              top: k.y + Math.sin(e / 50 + i) * 6,
              width: k.w,
              height: k.h,
              borderRadius: 20,
              background: "rgba(255,255,255,.55)",
              border: "1px solid rgba(255,255,255,.9)",
              boxShadow: "0 16px 40px -18px rgba(103,17,134,.25)",
              opacity: cards * 0.8,
              filter: "blur(1.2px)",
            }}
          >
            <div style={{ margin: "22px 24px 0", height: 10, width: "46%", borderRadius: 6, background: "rgba(195,43,90,.16)" }} />
            <div style={{ margin: "10px 24px 0", height: 8, width: "70%", borderRadius: 6, background: "rgba(11,11,15,.07)" }} />
          </div>
        ))}

        {/* Brand glow + glass disc */}
        <div
          style={{
            position: "absolute",
            left: cx - R * 1.35,
            top: ringY - R * 1.35,
            width: R * 2.7,
            height: R * 2.7,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(195,43,90,.30), rgba(103,17,134,.18) 45%, transparent 70%)",
            filter: "blur(30px)",
            opacity: disc,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: cx - R,
            top: ringY - R,
            width: R * 2,
            height: R * 2,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #F6EEF4 45%, #E7D6EC 100%)",
            boxShadow: "inset 0 -20px 60px rgba(103,17,134,.12), inset 0 10px 30px rgba(255,255,255,.9)",
            opacity: disc,
            transform: `scale(${lerp(0.92, 1, disc)})`,
          }}
        />

        {/* Ring (under the person, so the head overlaps it) */}
        {ring > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 14px rgba(195,43,90,.28))" }}>
            {([1, 0] as const).map((s) => {
              const p = evolvePath(ring, arc(s));
              return (
                <path key={s} d={arc(s)} fill="none" stroke="#fff" strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
              );
            })}
          </svg>
        )}

        {/* Sagi — clipped just inside the ring so the stroke stays clean where they meet */}
        {person > 0 && (
          <div style={{ position: "absolute", inset: 0, clipPath: popOutClip(cx, ringY, R - STROKE / 2) }}>
            <Img
              src={staticFile("img/portrait-cutout@2x.png")}
              style={{
                position: "absolute",
                left: cx - SRC.cx * SCALE,
                top: ringY - SRC.chest * SCALE + rise,
                width: SRC.w * SCALE,
                height: SRC.h * SCALE,
                opacity: person,
                filter: "drop-shadow(0 18px 30px rgba(66,7,90,.22))",
              }}
            />
          </div>
        )}
      </AbsoluteFill>

      {/* Footer: small brand mark, well clear of the headline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vertical ? 1620 : H - 110,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          fontFamily: font.body,
          fontWeight: 500,
          fontSize: 32,
          color: c.ink70,
          opacity: tw(e, 270, 300),
          transform: `translateY(${tw(e, 270, 304, 14, 0, EXPO)}px)`,
        }}
      >
        <LogoMark height={40} uid="pe" />
        sagi.design
      </div>
    </AbsoluteFill>
  );
};
