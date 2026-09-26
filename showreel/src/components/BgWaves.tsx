import { AbsoluteFill, useCurrentFrame } from "remotion";
import { c } from "../lib/brand";

/** The site's .bg-waves: three low-opacity radial glows that slowly breathe and drift. */
export const BgWaves: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const f = useCurrentFrame();
  const t = f / 60;
  const b = 1 + Math.sin(t * 0.9) * 0.06;
  const dx = Math.sin(t * 0.5) * 3;
  const dy = Math.cos(t * 0.4) * 2;
  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <AbsoluteFill
        style={{
          opacity: intensity,
          transform: `scale(${1.15 * b}) translate(${dx}%, ${dy}%)`,
          background: `
            radial-gradient(60% 45% at 16% 8%, rgba(220,96,52,.20), transparent 62%),
            radial-gradient(52% 40% at 86% 4%, rgba(103,17,134,.16), transparent 64%),
            radial-gradient(45% 34% at 50% 0%, rgba(195,43,90,.11), transparent 66%),
            radial-gradient(50% 40% at 70% 100%, rgba(195,43,90,.07), transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
