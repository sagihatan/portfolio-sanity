# Showreel — final versions

**Read this before changing any showreel video.** It records what's live, where the files are, and how to re-make them. It's for Sagi, Claude and Codex alike. When you publish a new version, update this file in the same PR.

Last updated: 2026-09-28 (Claude), version **v12**.

## What's live on sagi.design

The homepage hero "stage" plays one wordless, looping canvas tour: the five service screens of the fictional client **Aurora** (Websites, Mobile apps, SaaS & dashboards, Design systems, Branding).

| Cut | Remotion composition | Size | Length | Web files (in `site/public/assets/showreel/`) |
|---|---|---|---|---|
| Desktop (> 720px) | `SiteDesktop` | 1920×1080, 60fps | 758 frames, 12.6s · mp4 3.02 MB (webm fallback 2.45 MB) | `site-desktop-v12.mp4` · `.webm` · `-poster.webp` |
| Phone (≤ 720px) | `SiteMobile` | 1080×1620 (2:3), 60fps; web files 864×1296 | 938 frames, 15.6s · mp4 1.93 MB (webm fallback 1.96 MB) | `site-mobile-v12.mp4` · `.webm` · `-poster.webp` |

- `site/app/HeroStage.tsx` loads **one** file after the first scroll: phone or desktop by `max-width: 720px`, **MP4 first**, then WebM as a fallback. The version (`-v12`) is written in that file in three places.
- Nothing loads with reduced motion or Save-Data; the poster (first frame) shows instead.
- Local copies of the final files (masters + web files) are in `showreel/final/` in Sagi's main project folder. That folder is not in git: the masters are ~10 MB each.

## How each cut behaves

**Both cuts:** start on the overview of all five screens, dive in, visit each screen, zoom back out, and hold the overview, so the loop has no visible seam. A soft glass ring draws around each screen as the camera lands. Screen names work like Figma frame labels: a small **label** (Bricolage 500, grey `#9A9AA2`) that keeps the **same on-screen size at any zoom** (16px on a 1440 screen, 12px on a 390 phone), shown on the overview and while moving. Only the screen in focus gets the big **title** (Bricolage 700, -0.02em like `.v-title`, pink `#B52752`). The label fades out first, then the title fades in, never both at once. While zoomed in, only the focused screen's name shows.

**Desktop:** 2s per screen. Title + screen + glass ring fit inside 88% of the height and are centred together, so nothing is cropped even during the slow push-in. The focused title sits on the canvas above the screen, **32px on a 1440 screen** (the stage is 1248px wide there, scale 0.65; `DESK_LABEL` in `SiteTour.tsx`).

**Phone:** every screen fills ~70% of the video's height. The wide ones overflow, and the camera glides across them from the left edge to the right (quick start, long slow finish), 2.6s per screen. The title is pinned to the video's top-left: 24px on a 390 phone, one at a time, sequential fades. Mobile apps stays centred.

## Where things are in the code (`showreel/src/`)

- `scenes/SiteTour.tsx`: the website loops. `timing(vertical)` (step per screen), phone layout (`stackFrames`, `phoneZoom`, `shot`), pinned titles (`PinnedTitles`), `LABEL` (frame label sizes), `FOCUS_LABEL` (phone title size), `DESK_LABEL` (desktop title size), `GLIDE` (pan easing). `Pill` in `CanvasTour.tsx` draws the label + title.
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
5. **Judge sizes at real display size, on Sagi's 4-point grid.** The phone video shows ~358px wide on a 390 phone (scale ≈ 0.33): 72px in the video ≈ 24px on screen. The desktop stage is 1248px wide at 1440 (scale 0.65): 49px ≈ 32px. `Pill` draws text at 0.8 × its size value.
6. **MP4 (H.264) beats WebM (VP9) here.** The grain overlay costs VP9 a lot: at the same size the MP4 scores SSIM ≈ 0.990 vs the master, the WebM ≈ 0.980, and even a 4.6 MB 2-pass WebM only reached 0.985. That's why the site plays the MP4 first.
7. **Labels stay small; only the focused title is big.** A name that scales with the canvas turns into huge grey text during the zoom and crowds the rows on the overview. Keep labels a fixed screen size.
8. **Bigger titles need room.** When a title grows, re-fit the screen so title + screen + ring still fit (with the push-in). Don't let the ring touch the frame edge.

## Version history (web loops)

| Version | Date | Change |
|---|---|---|
| v4 | 2026-09-26 | Aurora screens polish; phone overview layout; one title at a time |
| v5–v8 | 2026-09-27 | Phone: bigger pinned titles, screens fill the frame, glide across wide screens, ring on every screen, blur back to 6 samples (PR #15) |
| v9 | 2026-09-27 | Phone titles 24px, Bricolage (PR #16) |
| v10 | 2026-09-27 | Desktop re-rendered: Bricolage titles, single-layer colour blend; phone overview titles Bricolage too |
| v11 | 2026-09-27 | Desktop titles 32px, screens re-fitted so nothing is cropped, one title at a time; site plays MP4 first (sharper). Phone content = v10 |
| v12 | 2026-09-28 | Figma-style frame labels (fixed 16px desktop / 12px phone, regular grey) + the big pink title only on the focused screen, sequential swap |

## Not up to date

- **Film** (`Showreel`, `ShowreelWeb`) and **story** (`ShowreelStory`) cuts still show the **old** screens. They need a re-render, and the story needs its sound mix redone (`showreel/audio/mix.sh`; music files are not in git).
