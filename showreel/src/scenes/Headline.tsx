import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EXPO, IN_OUT, lerp, tw } from "../lib/anim";
import { c, font } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { HEAD_HOLD } from "../lib/timeline";

// Local 0 = global 700. Set exactly like the site's Services heading.
const Wave: React.FC<{ text: string; h: number; start: number; out: number }> = ({ text, h, start, out }) => (
  <span style={{ display: "inline-flex", overflow: "hidden", padding: "0.06em 0.08em 0.18em", margin: "-0.06em -0.08em -0.18em" }}>
    {text.split("").map((ch, i) => (
      <span
        key={i}
        style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${tw(h, start + i * 1.5, start + i * 1.5 + 24, 135, 0, EXPO) - out * 170}%)` }}
      >
        {ch}
      </span>
    ))}
  </span>
);

// Line 2 lands half a second after line 1, so each gets its own beat (and its own sound)
const LINE2 = 50;

/** `settle` (story): instead of leaving, the headline glides down to become the caption under the portrait. */
export const Headline: React.FC<{ settle?: boolean }> = ({ settle }) => {
  const h = useCurrentFrame();
  const { cy, vertical } = useLayout();
  const m = settle ? tw(h, 118, 158, 0, 1, IN_OUT) : 0;
  const outA = settle ? 0 : tw(h, 68 + HEAD_HOLD, 82 + HEAD_HOLD, 0, 1, IN_OUT);
  const outB = settle ? 0 : tw(h, 72 + HEAD_HOLD, 86 + HEAD_HOLD, 0, 1, IN_OUT);
  const base: React.CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", color: c.ink, lineHeight: 1.04 };
  // Writes out of the vortex's collapse point with a gentle scale-up
  const grow = tw(h, 16, 64, 0.94, 1, EXPO);
  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${m * (vertical ? 300 : 0)}px) scale(${grow * lerp(1, 0.85, m)})`,
        transformOrigin: `50% ${vertical ? 925 : 500}px`,
      }}
    >
      <div style={{ ...base, top: cy - (vertical ? 170 : 210), fontFamily: font.sans, fontWeight: 700, fontSize: vertical ? 118 : 150, letterSpacing: "-0.04em" }}>
        <Wave text="One designer." h={h} start={22} out={outA} />
      </div>
      <div style={{ ...base, top: cy - (vertical ? 45 : 58), fontFamily: font.serif, fontStyle: "italic", fontWeight: 400, fontSize: vertical ? 132 : 168, letterSpacing: "-0.01em" }}>
        <Wave text="Full coverage." h={h} start={LINE2} out={outB} />
      </div>
    </AbsoluteFill>
  );
};
