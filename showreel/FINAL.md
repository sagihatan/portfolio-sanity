# Showreel — final versions

**Read this before changing any showreel video.** It records what's live, where the files are, and how to re-make them. It's for Sagi, Claude and Codex alike. When you publish a new version, update this file in the same PR.

Last updated: 2026-09-27 (Claude), version **v10**.

## What's live on sagi.design

The homepage hero "stage" plays one wordless, looping canvas tour: the five service screens of the fictional client **Aurora** (Websites, Mobile apps, SaaS & dashboards, Design systems, Branding).

| Cut | Remotion composition | Size | Length | Web files (in `site/public/assets/showreel/`) |
|---|---|---|---|---|
| Desktop (> 720px) | `SiteDesktop` | 1920×1080, 60fps | 758 frames, 12.6s · webm 2.45 MB, mp4 3.04 MB | `site-desktop-v10.webm` · `.mp4` · `-poster.webp` |
| Phone (≤ 720px) | `SiteMobile` | 1080×1620 (2:3), 60fps; web files 864×1296 | 938 frames, 15.6s · webm 1.95 MB, mp4 1.93 MB | `site-mobile-v10.webm` · `.mp4` · `-poster.webp` |

- `site/app/HeroStage.tsx` loads **one** file after the first scroll: phone or desktop by `max-width: 720px`, WebM first, then MP4. The version (`-v10`) is written in that file in three places.
- Nothing loads with reduced motion or Save-Data; the poster (first frame) shows instead.
- Local copies of the final files (masters + web files) are in `showreel/final/` in Sagi's main project folder. That folder is not in git: the masters are ~10 MB each.

## How each cut behaves

**Both cuts:** start on the overview of all five screens, dive in, visit each screen, zoom back out, and hold the overview, so the loop has no visible seam. A soft glass ring draws around each screen as the camera lands. Titles are Bricolage Grotesque 700, -0.02em (like the site's card titles `.v-title`), grey when out of focus and brand pink `#B52752` in focus.

**Desktop:** the 16:9 frame fits each screen at ~80% of its height, 2s per screen. Titles sit on the canvas above each screen, ~23px on a 1440 screen.

**Phone:** every screen fills ~70% of the video's height. The wide ones overflow, and the camera glides across them from the left edge to the right (quick start, long slow finish), 2.6s per screen. The title is pinned to the video's top-left: 24px on a 390 phone, one at a time, sequential fades. Mobile apps stays centred.

## Where things are in the code (`showreel/src/`)

- `scenes/SiteTour.tsx`: the website loops. `timing(vertical)` (step per screen), phone layout (`stackFrames`, `phoneZoom`, `shot`), pinned titles (`PinnedTitles`), `FOCUS_LABEL` (title size), `GLIDE` (pan easing).
- `scenes/CanvasTour.tsx`: the shared canvas (`World`), camera (`camera()`, keys with optional `ease`), canvas titles (`Pill`), and the story/film tour.
- `components/frames/*`: the five Aurora screens. `frames/ui.tsx` has the shared tokens.
- `components/Selection.tsx`: the glass ring.
- `Root.tsx`: all compositions.

## How to re-make them

From `showreel/` (`npm install` once):

```bash
npx remotion render SiteDesktop out/vN/site-desktop-master.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p
npx remotion render SiteMobile out/vN/site-mobile-master.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p
```

Web files. The phone adds `-vf scale=864:1296:flags=lanczos` to each line, and its WebM uses `-crf 38` (desktop uses 41, to stay ~2.5 MB):

```bash
ffmpeg -i site-desktop-master.mp4 -c:v libx264 -profile:v high -crf 26 -pix_fmt yuv420p -movflags +faststart -an site-desktop-vN.mp4
ffmpeg -i site-desktop-master.mp4 -c:v libvpx-vp9 -b:v 0 -crf 41 -row-mt 1 -pix_fmt yuv420p -an site-desktop-vN.webm
ffmpeg -i site-desktop-master.mp4 -frames:v 1 poster.png && cwebp -q 82 poster.png -o site-desktop-vN-poster.webp
```

Then copy the six web files into `site/public/assets/showreel/`, delete the old ones, and update the version in `HeroStage.tsx`.

## Rules learned the hard way

1. **Always bump the version in the filename** (`-v10` → `-v11`), for both cuts, even if only one changed. `/assets/*` is cached for 7 days, so a same-name file would keep serving the old video.
2. **Motion blur stays at 6 samples** (`CameraMotionBlur` in `SiteTour`). 16 samples banded the glass ring into stacked outlines and turned the warm canvas `#F4F0F1` grey (8-bit rounding when blending 16 copies).
3. **Never stack two text layers to cross-fade** a title (e.g. grey medium + pink bold). Mid-fade it reads as a dark, doubled edge. Use one layer and blend its colour.
4. **Check the whole loop, not a few stills.** Contact sheet every 24 frames, check the loop seam (first vs last frame SSIM ≥ 0.98), and look at frames mid-move, where most glitches hide.
5. **Judge sizes at real display size.** The phone video shows ~358px wide on a 390 phone (scale ≈ 0.33), so 72px in the video ≈ 24px on screen.

## Version history (web loops)

| Version | Date | Change |
|---|---|---|
| v4 | 2026-09-26 | Aurora screens polish; phone overview layout; one title at a time |
| v5–v8 | 2026-09-27 | Phone: bigger pinned titles, screens fill the frame, glide across wide screens, ring on every screen, blur back to 6 samples (PR #15) |
| v9 | 2026-09-27 | Phone titles 24px, Bricolage (PR #16) |
| v10 | 2026-09-27 | Desktop re-rendered: Bricolage titles, single-layer colour blend; phone overview titles Bricolage too |

## Not up to date

- **Film** (`Showreel`, `ShowreelWeb`) and **story** (`ShowreelStory`) cuts still show the **old** screens. They need a re-render, and the story needs its sound mix redone (`showreel/audio/mix.sh`; music files are not in git).
