import { EXPO, tw } from "../../lib/anim";
import { c, font, grad } from "../../lib/brand";

/*
 * The five frames are one fictional client, Aurora (a payments product), and share one small system:
 * every size, gap, padding and radius is a multiple of 4; text uses the greys and type sizes below.
 */
export const MAGENTA = "#C32B5A";
export const INK2 = "#5F5F68"; // secondary text
export const INK3 = "#8A8A92"; // labels, captions
export const FILL = "#F4F1F2"; // neutral fill: chips, tracks, tiles
export const TINT = "rgba(195,43,90,.1)"; // brand-tinted fill
export const ACCENT = "#B52752"; // text on TINT, positive numbers

/** Aurora's brand colours (Branding palette), and the brand ramp built from them (Design system tokens). */
export const PALETTE = [
  { n: "Ember", hex: "#D4532E" },
  { n: "Rose", hex: MAGENTA },
  { n: "Violet", hex: "#671186" },
  { n: "Plum", hex: "#42075A" },
  { n: "Ink", hex: c.ink },
];
export const RAMP = ["#FDF0F4", "#F8D4DF", "#EFA5BB", "#DE6B8F", MAGENTA, "#971F56", "#6B1459", "#42075A"];

/** Element entrance: fade + rise, expo-out. */
export const rise = (lf: number, at: number, dist = 24, dur = 18): React.CSSProperties => ({
  opacity: tw(lf, at, at + dur * 0.6),
  transform: `translateY(${tw(lf, at, at + dur, dist, 0, EXPO)}px)`,
});

export const pop = (lf: number, at: number, dur = 18): React.CSSProperties => ({
  opacity: tw(lf, at, at + dur * 0.6),
  transform: `scale(${tw(lf, at, at + dur, 0.9, 1, EXPO)})`,
});

export const abs = (x: number, y: number, w?: number, h?: number): React.CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
});

export const H: React.CSSProperties = { fontFamily: font.sans, fontWeight: 700, letterSpacing: "-0.035em", color: c.ink };
export const B: React.CSSProperties = { fontFamily: font.body, fontWeight: 500, color: c.ink };
export const SERIF: React.CSSProperties = { fontFamily: font.serif, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" };
export const hstack: React.CSSProperties = { display: "flex", alignItems: "center" };
export const vstack: React.CSSProperties = { display: "flex", flexDirection: "column" };

export const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  border: `1px solid ${c.border}`,
  boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 8px 20px -10px rgba(16,24,40,.10)",
};

export const chip: React.CSSProperties = { ...B, fontSize: 14, lineHeight: "20px", fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: TINT, color: ACCENT };

/** Aurora's mark: a ring with a dot. */
export const AuroraMark: React.FC<{ size: number; color?: string }> = ({ size, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="28.5" cy="11.5" r="6" fill={color} />
  </svg>
);

/** The mark on its gradient tile (app icon shape), optionally with the wordmark. */
const q4 = (n: number) => Math.round(n / 4) * 4;
export const AuroraLogo: React.FC<{ size: number; word?: number }> = ({ size, word }) => (
  <div style={{ ...hstack, gap: q4(size * 0.3) }}>
    <div style={{ width: size, height: size, borderRadius: q4(size * 0.3), background: grad, display: "grid", placeItems: "center" }}>
      <AuroraMark size={size * 0.6} />
    </div>
    {word ? <div style={{ ...H, fontSize: word, lineHeight: 1 }}>Aurora</div> : null}
  </div>
);
