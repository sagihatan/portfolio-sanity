# Service card animations

Editable Remotion sources for the three service cards. This package is an authoring tool only; it is not bundled into the website. Each source registers its own composition.

## Render

From this directory:

1. `npm install --registry=https://registry.npmjs.org`
2. `mkdir -p public/fonts && cp ../../site/app/fonts/Satoshi-*.woff2 public/fonts/`
3. For example: `npm run build-from-scratch -- master.mp4 --scale=2 --codec=h264 --crf=12 --public-dir=public`
4. Crop and encode: `ffmpeg -i master.mp4 -vf crop=1600:1000:160:76 -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart build-from-scratch-v1.mp4`

Other compositions: `MakeItBetter`, `JoinYourTeam`. Sources render 960×576 at 30 fps; the 2× master is cropped to 1600×1000 to fill the website's 16:10 card area. Keep filenames versioned when changing assets to avoid stale cached files.

The deployed files are in `site/public/assets/service-motion/`. The WebP posters (quality 92) are extracted from the cropped videos at 5.5s, 5.9s, and 4.2s respectively. They retain the same size and composition as the videos.

## Website behaviour

`site/app/ServiceVideo.tsx` server-renders a permanent poster and a source-less video. Sources attach within 300px of the viewport; playback requires at least 30% visibility. A decoded video frame reveals the film over its poster. Offscreen, hidden-tab and user-paused videos stop. Reduced motion / Save-Data show the still without loading video. Playback errors or 12 seconds of stalled visible playback restore the poster. A keyboard-accessible play/pause control is available on hover/focus (always visible on touch devices).

The existing `ClientScripts.tsx` video observer excludes these managed videos; CTA and hero behaviour remains under their existing controllers.

## Validation

Production build and targeted ESLint pass (page.tsx retains its existing image warnings). Browser checked at 1440×1000 and 390×844: no horizontal overflow; no card MP4 requests before scrolling; decoded 1600px video playback; manual pause and offscreen pause; reduced-motion and aborted-media requests preserve all three posters. Mobile tests are Chromium viewport emulation, not a physical iPhone.
