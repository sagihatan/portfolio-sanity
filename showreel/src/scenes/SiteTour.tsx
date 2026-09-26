import { AbsoluteFill } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { lerp, tw } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { Cam, Frame, Key, Plan, World, layoutFrames } from "./CanvasTour";
import { RING, RING_GAP, selectionAt } from "../components/Selection";
import { Grain } from "../components/Grain";

/**
 * Website hero-stage loop (≈12.6s @ 60fps): wordless canvas tour, frame labels only.
 * Starts and ends on the overview of all five frames, so it loops without a seam:
 *   0–84     dive from the overview into Websites
 *   84–644   five services, 2s each: as the camera settles, the glass ring draws around the screen from
 *            both sides (quick → slow), holds, and fades as the camera glides on
 *   644–698  zoom out to all five
 *   698–758  hold the overview → loops to frame 0
 * Each frame rebuilds mid-whip (hidden in the motion blur) as the camera flies to it.
 */
const STEP = 120; // 2s per service
const PAN = 40; // camera glide between screens, ~0.7s
const LAND = [0, 1, 2, 3, 4].map((i) => 84 + i * STEP); // camera settles on frame k
const LEAVE = LAND.map((l) => l + STEP - PAN); // camera leaves frame k
const OPEN = LAND.map((l) => l - 10); // ring starts drawing just before the camera settles
const RESET = LAND.map((l, k) => (k === 0 ? 20 : l - PAN / 2)); // frame k rebuilds mid-glide, hidden in the motion blur
const ZOOM_OUT = [LEAVE[4], LEAVE[4] + 54] as const;
export const SITE_DURATION = ZOOM_OUT[1] + 60; // hold the overview 1s, then loop (≈12.6s)
const RING_TIMING = { open: 38, fade: 18 }; // draw quick → slow; fade soft as the camera leaves

// Phone cut: the frames sit on one left edge — Websites | Mobile apps on the first row, then one per row.
// Titles are one size on the overview (world px) and grow to a fixed on-screen size as the camera lands on a frame.
const GAP = 240;
const OV_LABEL = 72;
const FOCUS_LABEL = 120; // on-screen title when zoomed in: ~32px on a 390 phone, the largest where "SaaS & dashboards" still fits on one line
const labelTop = (size: number) => size * 0.8 * 1.2 + size * 0.75 + RING_GAP + RING; // title block height above a frame (see Pill)
const TITLE = labelTop(FOCUS_LABEL); // focused title block, on-screen px

// Zoom that fits a frame plus its focused title into the phone video
const phoneZoom = (F: Frame, W: number, H: number) => Math.min((0.8 * W) / F.w, (0.84 * H - TITLE) / F.h);
// One even row gap, wide enough that every zoomed-in title clears the frame above it
const stackFrames = (W: number, H: number): Frame[] => {
  const [web, mobile, ...rest] = layoutFrames(true).frames;
  const gap = Math.max(GAP, ...rest.map((F) => (TITLE + 48) / phoneZoom(F, W, H)));
  const out = [{ ...web, x: 0, y: 0 }, { ...mobile, x: web.w + GAP, y: 0 }];
  let y = Math.max(web.h, mobile.h);
  for (const F of rest) {
    y += gap;
    out.push({ ...F, x: 0, y });
    y += F.h;
  }
  return out;
};

const buildPlan = (W: number, H: number, vertical: boolean): Plan => {
  const frames = vertical ? stackFrames(W, H) : layoutFrames(false).frames;
  const fit = (k: number): Cam => {
    const F = frames[k];
    const c = { cx: F.x + F.w / 2, cy: F.y + F.h / 2, px: W / 2 };
    return vertical
      ? { ...c, z: phoneZoom(F, W, H), py: H / 2 + TITLE / 2 } // frame + title centred together
      : { ...c, z: Math.min((0.8 * W) / F.w, (0.8 * H) / F.h), py: H / 2 + 30 };
  };
  // Overview: fit the whole canvas (incl. labels) into the frame
  const xs = frames.flatMap((F) => [F.x, F.x + F.w]);
  const ys = frames.flatMap((F) => [F.y - (vertical ? labelTop(OV_LABEL) : 70), F.y + F.h]);
  const bw = Math.max(...xs) - Math.min(...xs);
  const bh = Math.max(...ys) - Math.min(...ys);
  const overview: Cam = {
    cx: (Math.max(...xs) + Math.min(...xs)) / 2,
    cy: (Math.max(...ys) + Math.min(...ys)) / 2,
    z: Math.min((0.9 * W) / bw, (0.9 * H) / bh),
    px: W / 2,
    py: H / 2,
  };

  const keys: Key[] = [{ f: 0, ...overview }, { f: 8, ...overview }];
  frames.forEach((_, k) => {
    const d = fit(k);
    keys.push({ f: LAND[k], ...d, pan: k > 0, dip: 0.2 });
    keys.push({ f: LEAVE[k], ...d, z: d.z * 1.03 });
  });
  keys.push({ f: ZOOM_OUT[1], ...overview });
  keys.push({ f: SITE_DURATION, ...overview });

  // Overview-ness: full at the start (coming from the loop's end) and after the zoom-out
  const ov = (f: number) => Math.max(1 - tw(f, 8, LAND[0]), tw(f, ZOOM_OUT[0], ZOOM_OUT[0] + 24));
  const inView = (k: number, f: number) => {
    const inF = tw(f, LAND[k] - PAN, LAND[k]);
    const outF = k < 4 ? 1 - tw(f, LEAVE[k], LEAVE[k] + PAN) : 1 - tw(f, ZOOM_OUT[0], ZOOM_OUT[0] + 24);
    return inF * outF;
  };

  return {
    offset: 0,
    frames,
    overview,
    keys,
    // The ring draws around each screen as the camera settles and fades as it leaves — nothing on the
    // overview, so the loop starts and ends clean.
    ring: (f) => selectionAt(frames, OPEN, LEAVE.map((l) => l - 6), f, RING_TIMING),
    lf: (k, f) => (f < RESET[k] ? 999 : f - RESET[k]), // built until the whip toward it, then rebuilds
    active: (k, f) => (f >= OPEN[k] && f < LEAVE[k] + 6 ? tw(f, OPEN[k], OPEN[k] + 10) * (1 - tw(f, LEAVE[k] - 6, LEAVE[k] + 6)) : 0),
    focus: (k, f) => Math.max(ov(f), 0.22 + 0.78 * inView(k, f)),
    phase: (f) => f * ((40 * 4 * Math.PI) / SITE_DURATION), // ambient float completes whole cycles per loop
    // Same on-screen pill size on every frame (divide out each frame's camera zoom)
    labelSize: (k, f) => (vertical ? lerp(OV_LABEL, FOCUS_LABEL / fit(k).z, 1 - ov(f)) : 36 / fit(k).z),
    // Phone cut: while zoomed in, only the focused frame's title shows (neighbours' titles sit right under it)
    labelAlpha: (k, f) => (vertical ? Math.max(ov(f), inView(k, f)) : 1),
    spin: false,
  };
};

export const SiteTour: React.FC = () => {
  const { W, H, vertical } = useLayout();
  const plan = buildPlan(W, H, vertical);
  return (
    <AbsoluteFill style={{ background: "#F4F0F1" }}>
      <CameraMotionBlur samples={16} shutterAngle={180}>
        <World plan={plan} />
      </CameraMotionBlur>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
