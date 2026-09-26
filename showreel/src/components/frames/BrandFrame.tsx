import { grad } from "../../lib/brand";
import { EXPO, tw } from "../../lib/anim";
import { AuroraMark, B, FILL, H, INK2, INK3, MAGENTA, PALETTE, SERIF, abs, hstack, pop, rise } from "./ui";

export const BRAND = { w: 1720, h: 900 };
/* Margin 40, gap 36: panel 624 | 472 | 472 columns, two 392 rows. */
const M = 40;
const G = 36;
const ROW = 392;
const COLS = [M, M + 624 + G, M + 624 + G + 472 + G];

const tile: React.CSSProperties = { borderRadius: 32, overflow: "hidden", position: "absolute" };
const at = (c: number, r: number, w = 472, h = ROW) => abs(COLS[c], M + r * (ROW + G), w, h);

export const BrandFrame: React.FC<{ lf: number }> = ({ lf }) => (
  <div style={{ ...abs(0, 0, BRAND.w, BRAND.h), background: "#fff", overflow: "hidden" }}>
    {/* Logo panel */}
    <div style={{ ...tile, ...at(0, 0, 624, 2 * ROW + G), background: grad, display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 60% at 30% 20%, rgba(255,255,255,.22), transparent 70%)" }} />
      <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: 24, ...pop(lf, 2, 20) }}>
        <AuroraMark size={176} />
        <div style={{ ...H, color: "#fff", fontSize: 80, lineHeight: "80px" }}>Aurora</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, ...SERIF, color: "rgba(255,255,255,.8)", fontSize: 32, ...rise(lf, 8, 16) }}>Money that moves with you.</div>
    </div>

    {/* Type specimen */}
    <div style={{ ...tile, ...at(1, 0), background: FILL, padding: 32, ...rise(lf, 3, 32) }}>
      <div style={{ ...H, fontSize: 176, lineHeight: "144px" }}>Aa</div>
      <div style={{ ...B, fontSize: 20, lineHeight: "24px", marginTop: 24, fontWeight: 700 }}>Bricolage Grotesque</div>
      <div style={{ ...B, fontSize: 16, lineHeight: "20px", color: INK3, marginTop: 4 }}>Display · Headings</div>
      <div style={{ ...hstack, gap: 24, marginTop: 24 }}>
        {[400, 500, 700, 800].map((w) => (
          <div key={w} style={{ ...H, fontWeight: w, fontSize: 32, lineHeight: "40px" }}>Ag</div>
        ))}
      </div>
    </div>

    {/* Palette */}
    <div style={{ ...tile, ...at(2, 0), display: "flex", ...rise(lf, 5, 32) }}>
      {PALETTE.map(({ n, hex }, i) => (
        <div key={hex} style={{ flex: 1, background: hex, transformOrigin: "top", transform: `scaleY(${tw(lf, 5 + i * 2, 24 + i * 2, 0, 1, EXPO)})`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
          <span style={{ ...B, color: "#fff", fontSize: 14, lineHeight: "20px", fontWeight: 700 }}>{n}</span>
          <span style={{ ...B, color: "rgba(255,255,255,.7)", fontSize: 12, lineHeight: "16px" }}>{hex.slice(1)}</span>
        </div>
      ))}
    </div>

    {/* Business card */}
    <div style={{ ...tile, ...at(1, 1), background: "#EFE9EB", ...rise(lf, 7, 32) }}>
      <div
        style={{
          ...abs(64, 96, 344, 200),
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 32px 40px -20px rgba(16,24,40,.35)",
          transform: `rotate(${tw(lf, 7, 30, -14, -6, EXPO)}deg)`,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <AuroraMark size={40} color={MAGENTA} />
        <div>
          <div style={{ ...H, fontSize: 24, lineHeight: "28px" }}>Maya Cohen</div>
          <div style={{ ...B, fontSize: 14, lineHeight: "20px", color: INK2, marginTop: 4 }}>Head of Product · aurora.co</div>
        </div>
      </div>
    </div>

    {/* App icon */}
    <div style={{ ...tile, ...at(2, 1), background: "#15101B", display: "grid", placeItems: "center", ...rise(lf, 9, 32) }}>
      <div style={{ width: 192, height: 192, borderRadius: 48, background: grad, display: "grid", placeItems: "center", boxShadow: "0 32px 48px -20px rgba(195,43,90,.7), inset 0 2px 0 rgba(255,255,255,.3)", ...pop(lf, 11, 22) }}>
        <AuroraMark size={112} />
      </div>
      <div style={{ ...abs(0, ROW - 32 - 20, 472), textAlign: "center", ...B, color: "rgba(255,255,255,.6)", fontSize: 14, lineHeight: "20px" }}>App icon · 1024</div>
    </div>
  </div>
);
