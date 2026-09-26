import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EXPO, IN_OUT, tw } from "../lib/anim";
import { c, font, grad } from "../lib/brand";
import { barWidth, useLayout } from "../lib/layout";

// Local 0 = global 436. SlabsStage hands over a 12px gradient bar at the centre (~local 10).
export const Bridge: React.FC = () => {
  const l = useCurrentFrame();
  const { W, cx, cy, vertical } = useLayout();
  const bar = barWidth(vertical);
  const blockW = tw(l, 10, 24, bar, vertical ? 980 : 1500, EXPO);
  const blockH = tw(l, 10, 24, 12, vertical ? 320 : 176, EXPO);
  const retract = tw(l, 24, 46, 0, 1, IN_OUT);
  const blockLeft = cx - blockW / 2 + retract * blockW;
  const out = tw(l, 64, 78, 0, 1, IN_OUT);
  const accent = <span style={{ fontFamily: font.serif, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em", fontSize: 136 }}>product.</span>;

  return (
    <AbsoluteFill>
      {out < 1 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: cy - 170,
            height: 340,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            clipPath: `inset(-40% ${W - blockLeft}px -40% 0)`,
            fontFamily: font.sans,
            fontWeight: 700,
            fontSize: 124,
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
            color: c.ink,
          }}
        >
          <span style={{ display: "inline-flex", overflow: "hidden", padding: "0.1em 0.1em 0.2em", margin: "-0.1em" }}>
            <span style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${-out * 140}%)` }}>
              {vertical ? (
                <>
                  From idea{"\n"}to {accent}
                </>
              ) : (
                <>From idea to {accent}</>
              )}
            </span>
          </span>
        </div>
      )}
      {l >= 8 && l < 48 && (
        <div
          style={{
            position: "absolute",
            left: blockLeft,
            width: cx + blockW / 2 - blockLeft,
            top: cy - blockH / 2,
            height: blockH,
            borderRadius: Math.min(6, blockH / 2),
            background: grad,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
