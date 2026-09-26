import { Easing, interpolate } from "remotion";

export const FPS = 60;
export { DURATION, LOOP_DURATION } from "./timeline";
export const BEAT = 30; // 120 BPM at 60fps

// Same curves the site uses (design.md → Motion)
export const EXPO = Easing.bezier(0.22, 1, 0.36, 1);
export const SOFT = Easing.bezier(0.2, 0.7, 0.2, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);

/** Clamped tween from `a` to `b` frames, mapping to [from, to]. */
export const tw = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = EXPO,
) =>
  interpolate(f, [a, b], [from, to], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Piecewise keyframes: [[frame, value], ...], eased per segment. */
export const kf = (
  f: number,
  keys: [number, number][],
  easing: (t: number) => number = IN_OUT,
) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i];
    const [b, vb] = keys[i + 1];
    if (f <= b) return va + (vb - va) * easing((f - a) / (b - a));
  }
  return keys[keys.length - 1][1];
};
