import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { continueRender, delayRender, staticFile } from "remotion";

const bricolage = loadBricolage("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const serif = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
// Satoshi (site body font) isn't on Google Fonts — self-hosted from Fontshare.
if (typeof document !== "undefined") {
  const handle = delayRender("Loading Satoshi");
  Promise.all(
    ["400", "500", "700"].map((w) =>
      new FontFace("Satoshi", `url(${staticFile(`fonts/Satoshi-${w}.woff2`)}) format("woff2")`, { weight: w })
        .load()
        .then((ff) => document.fonts.add(ff)),
    ),
  ).then(() => continueRender(handle));
}

export const font = {
  sans: bricolage.fontFamily,
  serif: serif.fontFamily,
  body: "Satoshi",
};

// Tokens mirror design.md / site/app/globals.css
export const c = {
  bg: "#FAF8F8",
  bg2: "#F3EEF0",
  ink: "#0B0B0F",
  ink70: "#5F5F5F",
  line: "rgba(11,11,15,0.08)",
  border: "#EAECF0",
  ember: "#D4532E",
  magenta: "#C32B5A",
  plum: "#42075A",
  plum2: "#671186",
  // logo gradient
  gold: "#FFA800",
  indigo: "#2A00A3",
  figma: "#0D99FF",
};

export const grad = `linear-gradient(132deg, ${c.ember} 14.9%, #B52752 50.16%, ${c.plum} 84.36%)`;
export const logoGrad = (deg = 148) =>
  `linear-gradient(${deg}deg, ${c.gold} 0%, ${c.magenta} 50.7%, ${c.indigo} 100%)`;

export const shadowCard =
  "0 1px 3px 0 rgba(0,0,0,.12), 0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)";
export const shadowFloat =
  "0 2px 4px rgba(0,0,0,.06), 0 30px 60px -20px rgba(66,7,90,.28), 0 18px 36px -18px rgba(16,24,40,.18)";
export const innerEdge =
  "0 -3px 0 0 rgba(0,0,0,.05) inset, 0 0 0 1.5px #FFFFFF inset, 0 4px 2px 0 rgba(0,0,0,.06) inset, 0 0 24px 4px rgba(0,0,0,.04) inset";
