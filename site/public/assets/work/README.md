# Work Section Images

The project tiles are numbered left to right in the Work section.
To update a picture, replace the matching file in this folder:

| Tile | Project | File to replace | Best size to send |
| --- | --- | --- | --- |
| 01 | Midori Music | `project-01.webp` | 2400 x 1100 px |
| 02 | Fast Logistics | `project-02.webp` | 1600 x 1500 px |
| 03 | Halcyon CRM | `project-03.webp` | 1800 x 1100 px |
| 04 | Aurora Studio | `project-04.webp` | 1800 x 1100 px |
| 05 | Ledger Cash | `project-05.webp` | 2400 x 1100 px |
| 06 | Wallet card | `project-06.webp` | 1600 x 1500 px |

## CMS fields to keep in sync

Each project card now has a hover overlay in `index.html` with:

- Brand icon: 48 x 48 px visual, currently shown as a single letter in `.project-icon`.
- Brand name: `.project-name`, Bricolage Grotesque, 20 px.
- Brand subtext: `.project-subtext`, Satoshi, 16 px.
- Tags: `.project-tag`, Satoshi, 14 px, glass pill style.

For CMS management, keep these fields per project:

| Field | Example | Notes |
| --- | --- | --- |
| `brandName` | `Fast Logistics` | Keep short enough to fit beside the icon. |
| `brandSubtext` | `Same-day delivery platform` | One short line is best. |
| `iconLabel` or `iconAsset` | `F` | Use a 48 x 48 px icon if replacing the letter. |
| `tags` | `Branding`, `Identity` | Two tags is the safest default. |
| `image` | `project-02.webp` | Match the tile file map above. |

## Card behavior to preserve

- Default card state shows only the image.
- Hover reveals the bottom-left content from `opacity: 0` and `translateY(40px)`.
- Reveal order is staggered: icon, title, subtext, then tags.
- Tags use the current glass style:
  - `linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))`
  - `backdrop-filter: blur(18px) saturate(150%)`
  - `border: 1px solid rgba(255,255,255,0.24)`
  - inset highlight/shadow plus `0 6px 18px rgba(0,0,0,0.22)`
- Do not change card size, border radius, shadows, or image `background-size: cover` behavior when updating CMS content.

Recommended format: `.webp`, quality 80-90.
Good alternatives: `.jpg` for photos, `.png` only when the image is mostly UI/text and needs crisp edges.

Keep important UI/text in the center of the image. The website uses `background-size: cover`, so edges may crop differently on desktop, tablet, and mobile.

If you send one universal size for all six images, use 2400 x 1600 px and keep the main subject centered.
