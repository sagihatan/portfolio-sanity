import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { tw } from "../lib/anim";
import { font } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { Cam, Frame, Key, Plan, World, layoutFrames } from "./CanvasTour";
import { RING, RING_GAP, selectionAt } from "../components/Selection";
import { Grain } from "../components/Grain";

/**
 * Website hero-stage loop @ 60fps: wordless canvas tour, frame labels only.
 * Starts and ends on the overview of all five frames, so it loops without a seam:
 *   0–84     dive from the overview into Websites
 *   84–…     five services, one STEP each: as the camera settles, the glass ring draws around the screen from
 *            both sides (quick → slow), holds, and fades as the camera glides on
 *   then     zoom out to all five, hold the overview 1s → loops to frame 0
 * Each frame rebuilds mid-whip (hidden in the motion blur) as the camera flies to it.
 * Phone cut: every screen fills ~70% of the height; wide ones overflow and the camera glides across them
 * (left edge → right edge), under a title pinned to the video instead of the canvas. Desktop: 2s per service
 * (≈12.6s); phone: 2.6s (≈15.6s) so the glide isn't rushed.
 */
const PAN = 40; // camera glide between screens, ~0.7s
const RING_TIMING = { open: 38, fade: 18 }; // draw quick → slow; fade soft as the camera leaves
const timing = (vertical: boolean) => {
  const step = vertical ? 156 : 120;
  const LAND = [0, 1, 2, 3, 4].map((i) => 84 + i * step); // camera settles on frame k
  const LEAVE = LAND.map((l) => l + step - PAN); // camera leaves frame k
  const OPEN = LAND.map((l) => l - 10); // ring starts drawing just before the camera settles
  const RESET = LAND.map((l, k) => (k === 0 ? 20 : l - PAN / 2)); // frame k rebuilds mid-glide, hidden in the motion blur
  const ZOOM_OUT = [LEAVE[4], LEAVE[4] + 54] as const;
  return { LAND, LEAVE, OPEN, RESET, ZOOM_OUT, DURATION: ZOOM_OUT[1] + 60 };
};
export const siteDuration = (vertical: boolean) => timing(vertical).DURATION;

// Phone cut: the frames sit on one left edge — Websites | Mobile apps on the first row, then one per row.
const GAP = 240;
const GLIDE = Easing.bezier(0.2, 0.3, 0.1, 1); // across a wide screen: picks up quickly, long slow finish
const M = 48; // phone side margin in video px (= the site's 16px gutter)
const OV_LABEL = 72; // overview titles, world px
const FOCUS_LABEL = 120; // pinned title: ~32px on a 390 phone, the largest where "SaaS & dashboards" fits on one line
const labelTop = (size: number) => size * 0.8 * 1.2 + size * 0.75 + RING_GAP + RING; // title block height above a frame (see Pill)
const TITLE = labelTop(FOCUS_LABEL); // pinned title block, on-screen px

// Every screen shows at the same height, the title block above it
const phoneZoom = (F: Frame, H: number) => (0.84 * H - TITLE) / F.h;
// One even row gap, wide enough that the frame above stays clear of the pinned title
const stackFrames = (H: number): Frame[] => {
  const [web, mobile, ...rest] = layoutFrames(true).frames;
  const gap = Math.max(GAP, ...rest.map((F) => (TITLE + M) / phoneZoom(F, H)));
  const out = [{ ...web, x: 0, y: 0 }, { ...mobile, x: web.w + GAP, y: 0 }];
  let y = Math.max(web.h, mobile.h);
  for (const F of rest) {
    y += gap;
    out.push({ ...F, x: 0, y });
    y += F.h;
  }
  return out;
};

const buildPlan = (W: number, H: number, vertical: boolean) => {
  const { LAND, LEAVE, OPEN, RESET, ZOOM_OUT, DURATION } = timing(vertical);
  const frames = vertical ? stackFrames(H) : layoutFrames(false).frames;
  const fit = (k: number): Cam => {
    const F = frames[k];
    const c = { cx: F.x + F.w / 2, cy: F.y + F.h / 2, px: W / 2 };
    return vertical
      ? { ...c, z: phoneZoom(F, H), py: H / 2 + TITLE / 2 } // frame + title centred together
      : { ...c, z: Math.min((0.8 * W) / F.w, (0.8 * H) / F.h), py: H / 2 + 30 };
  };
  // Where the camera lands on frame k and where it leaves: a slight push-in, and on the phone a glide
  // from the left edge to the right edge of any screen wider than the video
  const shot = (k: number): [Cam, Omit<Key, "f">] => {
    const F = frames[k];
    const d = fit(k);
    const z2 = d.z * 1.03;
    if (!vertical || F.w * d.z <= W - 2 * M) return [d, { ...d, z: z2 }];
    return [
      { ...d, cx: F.x + (W / 2 - M) / d.z },
      { ...d, z: z2, cx: F.x + F.w - (W / 2 - M) / z2, ease: GLIDE },
    ];
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
    const [land, leave] = shot(k);
    keys.push({ f: LAND[k], ...land, pan: k > 0, dip: 0.2 });
    keys.push({ f: LEAVE[k], ...leave });
  });
  keys.push({ f: ZOOM_OUT[1], ...overview });
  keys.push({ f: DURATION, ...overview });

  // Overview-ness: full at the start (coming from the loop's end) and after the zoom-out
  const ov = (f: number) => Math.max(1 - tw(f, 8, LAND[0]), tw(f, ZOOM_OUT[0], ZOOM_OUT[0] + 24));
  const inView = (k: number, f: number) => {
    const inF = tw(f, LAND[k] - PAN, LAND[k]);
    const outF = k < 4 ? 1 - tw(f, LEAVE[k], LEAVE[k] + PAN) : 1 - tw(f, ZOOM_OUT[0], ZOOM_OUT[0] + 24);
    return inF * outF;
  };

  // Pinned phone title for frame k: fades out over the first half of each glide and in over the second,
  // so two titles never overlap
  const title = (k: number, f: number) => {
    const out = k < 4 ? LEAVE[k] : ZOOM_OUT[0];
    const inT = tw(f, LAND[k] - PAN / 2, LAND[k]);
    return { a: inT * (1 - tw(f, out, out + PAN / 2)), rise: (1 - inT) * 24 };
  };

  const plan: Plan = {
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
    phase: (f) => f * ((40 * 4 * Math.PI) / DURATION), // ambient float completes whole cycles per loop
    // Desktop: same on-screen pill size on every frame (divide out each frame's camera zoom).
    // Phone: canvas titles only on the overview; zoomed in, the pinned title takes over.
    labelSize: (k) => (vertical ? OV_LABEL : 36 / fit(k).z),
    labelAlpha: (_, f) => (vertical ? ov(f) : 1),
    spin: false,
  };
  // Pinned title's left edge: the screen's left edge where the camera lands (the margin for wide screens)
  const titleX = frames.map((F, k) => Math.max(M, W / 2 - (F.w * fit(k).z) / 2));
  return { plan, title, titleX };
};

const PinnedTitles: React.FC<{ frames: Frame[]; title: (k: number, f: number) => { a: number; rise: number }; titleX: number[] }> = ({ frames, title, titleX }) => {
  const f = useCurrentFrame();
  const { H } = useLayout();
  return (
    <>
      {frames.map((F, k) => {
        const t = title(k, f);
        if (t.a <= 0) return null;
        return (
          <div
            key={F.name}
            style={{
              position: "absolute",
              left: titleX[k],
              top: 0.08 * H + t.rise, // the title block sits right above the screen (see phoneZoom)
              fontFamily: font.body,
              fontSize: FOCUS_LABEL * 0.8,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              color: "#B52752",
              opacity: t.a,
            }}
          >
            {F.name}
          </div>
        );
      })}
    </>
  );
};

export const SiteTour: React.FC = () => {
  const { W, H, vertical } = useLayout();
  const { plan, title, titleX } = buildPlan(W, H, vertical);
  return (
    <AbsoluteFill style={{ background: "#F4F0F1" }}>
      <CameraMotionBlur samples={6} shutterAngle={180}>
        <World plan={plan} />
      </CameraMotionBlur>
      {vertical && <PinnedTitles frames={plan.frames} title={title} titleX={titleX} />}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
