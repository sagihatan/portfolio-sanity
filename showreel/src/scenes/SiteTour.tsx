import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { IN_OUT, clamp01, tw } from "../lib/anim";
import { font } from "../lib/brand";
import { useLayout } from "../lib/layout";
import { Cam, Frame, Key, Name, Plan, World, camera, layoutFrames } from "./CanvasTour";
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
const FOCUS_LABEL = 90; // pinned title: 72px in the video = 24px on a 390 phone
const labelTop = (size: number) => size * 0.8 * 1.2 + size * 0.75 + RING_GAP + RING; // title block height above a frame (see Pill)
const TITLE = labelTop(FOCUS_LABEL); // pinned title block, on-screen px
const smooth = (t: number) => t * t * (3 - 2 * t);
// Frame labels (Figma-style, fixed on-screen size): 16px on a 1440 screen, 12px on a 390 phone (video shown 358 wide)
const LABEL = { desk: (16 * 1920) / 1248, phone: (12 * 1080) / 358 };
// Desktop focused title: 32px on a 1440 screen (the stage is 1248 of the video's 1920 px wide)
const DESK_LABEL = (32 * 1920) / 1248 / 0.8; // Pill draws text at 0.8 × size
const DESK_TITLE = labelTop(DESK_LABEL); // title block above the focused screen, video px

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

// Desktop cut: two rows — Websites | Mobile apps | SaaS, then Design systems | Branding — with enough air that the
// 32px title of a focused screen never sits under a neighbouring row (film/story keep layoutFrames' spacing)
const GRID = { x: 240, y: 320 };
const gridFrames = (): Frame[] => {
  const [web, mobile, saas, system, brand] = layoutFrames(false).frames;
  const mx = web.w + GRID.x;
  const y2 = Math.max(web.h, mobile.h, saas.h) + GRID.y;
  return [
    { ...web, x: 0, y: 0 },
    { ...mobile, x: mx, y: 0 },
    { ...saas, x: mx + mobile.w + GRID.x, y: 0 },
    { ...system, x: 0, y: y2 },
    { ...brand, x: system.w + GRID.x, y: y2 },
  ];
};

const buildPlan = (W: number, H: number, vertical: boolean) => {
  const { LAND, LEAVE, OPEN, RESET, ZOOM_OUT, DURATION } = timing(vertical);
  const frames = vertical ? stackFrames(H) : gridFrames();
  const fit = (k: number): Cam => {
    const F = frames[k];
    const c = { cx: F.x + F.w / 2, cy: F.y + F.h / 2, px: W / 2 };
    return vertical
      ? { ...c, z: phoneZoom(F, H), py: H / 2 + TITLE / 2 } // frame + title centred together
      : { ...c, z: Math.min((0.8 * W) / F.w, (0.88 * H - DESK_TITLE) / F.h), py: H / 2 + (DESK_TITLE - RING_GAP - RING) / 2 }; // title + screen + ring fit and centre together
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
  // Overview: fit the whole canvas, including the labels above the top row, into the frame
  const label = vertical ? LABEL.phone : LABEL.desk;
  const fitAll = (top: number): Cam => {
    const xs = frames.flatMap((F) => [F.x, F.x + F.w]);
    const ys = frames.flatMap((F) => [F.y - top, F.y + F.h]);
    const bw = Math.max(...xs) - Math.min(...xs);
    const bh = Math.max(...ys) - Math.min(...ys);
    return {
      cx: (Math.max(...xs) + Math.min(...xs)) / 2,
      cy: (Math.max(...ys) + Math.min(...ys)) / 2,
      z: Math.min((0.9 * W) / bw, (0.9 * H) / bh),
      px: W / 2,
      py: H / 2,
    };
  };
  const overview = fitAll((label * 1.7) / fitAll(0).z); // label block height, in world px at the overview zoom

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

  // Desktop: the labels and the spotlight follow the camera zoom, not the clock, so nothing can jump.
  // zoomIn: 0 on the overview → 1 at the given zoom (log scale, eased), read from the camera itself.
  const zoomIn = (z: number, to: number) => smooth(clamp01(Math.log(z / overview.z) / Math.log(to / overview.z)));
  const zMin = Math.min(...frames.map((_, k) => fit(k).z));
  // Overview-ness during the dive and the zoom-out (the only moves to and from the overview); 0 in between
  const ovZ = (f: number) => (f < LAND[0] || f > ZOOM_OUT[0] ? 1 - zoomIn(camera(keys, f).z, zMin) : 0);
  // The same screen for the spotlight: it never dims while the camera moves toward or away from it
  const lit = (k: number, f: number) =>
    (k === 0 ? 1 : tw(f, LAND[k] - PAN, LAND[k])) * (k < 4 ? 1 - tw(f, LEAVE[k], LEAVE[k] + PAN) : 1);
  // Desktop title: arrives with the focus ring (fade + a small rise) and leaves with it — the same on every screen,
  // so glides hand over one after the other. While zooming, only the grey labels show, fading with the zoom.
  const TITLE_PX = DESK_LABEL * 0.8; // 32px on a 1440 screen
  const deskTitle = (k: number, f: number): Name => {
    const inT = tw(f, OPEN[k], OPEN[k] + 18, 0, 1, IN_OUT);
    return {
      px: TITLE_PX,
      title: true,
      gap: (RING_GAP + RING) * fit(k).z + DESK_LABEL * 0.75, // clears the ring
      alpha: inT * (1 - tw(f, LEAVE[k] - 6, LEAVE[k] + 6, 0, 1, IN_OUT)),
      rise: (1 - inT) * ((8 * 1920) / 1248), // 8px on screen
    };
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
    // Built until the whip toward it, then rebuilds (hidden in the motion blur). Desktop keeps Websites built:
    // it's in full view for the whole dive, so a rebuild would show as the screen emptying out.
    lf: (k, f) => (!vertical && k === 0 ? 999 : f < RESET[k] ? 999 : f - RESET[k]),
    active: (k, f) => (f >= OPEN[k] && f < LEAVE[k] + 6 ? tw(f, OPEN[k], OPEN[k] + 10) * (1 - tw(f, LEAVE[k] - 6, LEAVE[k] + 6)) : 0),
    focus: (k, f) => (vertical ? Math.max(ov(f), 0.22 + 0.78 * inView(k, f)) : Math.max(ovZ(f), 0.22 + 0.78 * lit(k, f))),
    phase: (f) => f * ((40 * 4 * Math.PI) / DURATION), // ambient float completes whole cycles per loop
    // Labels (one on-screen size) only on the overview, fading with the zoom. Zoomed in: the desktop title
    // arrives with the ring; the phone's pinned title takes over.
    labelSize: () => label,
    labelAlpha: (_, f) => (vertical ? ov(f) : ovZ(f)),
    title: vertical ? undefined : deskTitle,
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
              fontFamily: font.sans, // Bricolage, styled like the site's card titles (.v-title)
              fontSize: FOCUS_LABEL * 0.8,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
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
