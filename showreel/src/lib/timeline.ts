// Global frame timeline (60fps, 120 BPM → 30 frames/beat).
export const SLABS_END = 450; // SlabsStage hands a 1180×12 bar at y 540 around frame 440
export const BRIDGE_FROM = 436; // "From idea to product."
export const TOUR_FROM = 500; // canvas fly-through
// Arrival of each capability frame; the camera lands at T+PAN_OUT and leaves at T[k+1]-PAN_IN
export const STEP = 66; // 1.1s per capability
export const T = [0, 1, 2, 3, 4].map((i) => 518 + i * STEP);
export const PAN_IN = 8; // pan into frame k spans [T[k]-8, T[k]+10]
export const PAN_OUT = 10;
export const ZOOM_OUT = [T[4] + STEP - PAN_IN, T[4] + STEP - PAN_IN + 32] as const;
// Everything after the tour is timed relative to the zoom-out
export const SHIFT = ZOOM_OUT[0] - 672;
export const HEAD_HOLD = 50; // extra reading time on "One designer. Full coverage."
// Vortex (film + story): after the overview holds, every frame spirals into one point
export const VORTEX = [ZOOM_OUT[1] + 28, ZOOM_OUT[1] + 118] as const;
const VX = VORTEX[1] - 18 - (700 + SHIFT); // headline writes out of the collapse
export const HEADLINE_FROM = 700 + SHIFT + VX;
export const END_FROM = 640 + SHIFT + HEAD_HOLD + VX;
export const END_LEN = 400; // ending plays out and holds ~1.4s on the final frame
export const DURATION = END_FROM + END_LEN; // ≈22.7s
export const LOOP_DURATION = ZOOM_OUT[1] + 58; // website loop: hold the overview, then dissolve

export const smoothPath = (data: number[], w: number, h: number, max = Math.max(...data) * 1.1) => {
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - (v / max) * h] as const);
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const p0 = pts[i - 2] ?? pts[i - 1];
      const p1 = pts[i - 1];
      const p3 = pts[i + 1] ?? p;
      return `C ${p1[0] + (p[0] - p0[0]) / 6} ${p1[1] + (p[1] - p0[1]) / 6} ${p[0] - (p3[0] - p1[0]) / 6} ${p[1] - (p3[1] - p1[1]) / 6} ${p[0]} ${p[1]}`;
    })
    .join(" ");
};
