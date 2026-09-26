import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/** Animated film grain + soft vignette. Sits on top of everything. */
export const Grain: React.FC<{ opacity?: number; dark?: boolean }> = ({ opacity = 0.09, dark }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity, mixBlendMode: dark ? "screen" : "multiply" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: dark
            ? "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)"
            : "radial-gradient(130% 100% at 50% 45%, transparent 60%, rgba(66,7,90,.07) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
