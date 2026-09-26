import { c, grad } from "../../lib/brand";
import { tw } from "../../lib/anim";
import { AuroraLogo, B, FILL, H, INK2, INK3, MAGENTA, RAMP, abs, card, chip, hstack, pop, rise } from "./ui";

export const SYSTEM = { w: 1740, h: 900 };
/*
 * Margin 64. Header, then two columns (left 1008 | gap 64 | right 540).
 * Every section is label → 16 → component; sections start on the same rows (184, 332, 508, 640).
 */
const L = 64;
const R = 1136;
const ROWS = [184, 332, 508, 640];
const CARD = { x: R, y: ROWS[0] + 36, w: 360, h: 136, pad: 24 };
const SPEC = "#F24822";

const Label: React.FC<{ x: number; y: number; t: string; lf: number; at: number }> = ({ x, y, t, lf, at }) => (
  <div style={{ ...abs(x, y), ...H, fontWeight: 600, fontSize: 16, lineHeight: "20px", color: INK3, letterSpacing: "-0.01em", ...rise(lf, at, 10) }}>{t}</div>
);

export const SystemFrame: React.FC<{ lf: number }> = ({ lf }) => {
  const toggle = tw(lf, 16, 24);
  const slide = tw(lf, 10, 30, 20, 64);
  return (
    <div style={{ ...abs(0, 0, SYSTEM.w, SYSTEM.h), background: "#fff", overflow: "hidden" }}>
      <div style={{ ...abs(L, 64), ...hstack, gap: 16, ...rise(lf, 0, 12) }}>
        <AuroraLogo size={40} />
        <div style={{ ...H, fontSize: 48, lineHeight: "56px" }}>Components</div>
        <div style={{ ...chip, fontWeight: 500, background: FILL, color: c.ink }}>Aurora DS · v2.4</div>
      </div>

      {/* Buttons */}
      <Label x={L} y={ROWS[0]} t="Buttons" lf={lf} at={1} />
      <div style={{ ...abs(L, ROWS[0] + 36), ...hstack, gap: 16 }}>
        {[
          { t: "Primary", bg: grad, col: "#fff" },
          { t: "Secondary", bg: c.ink, col: "#fff" },
          { t: "Ghost", bg: "#fff", col: c.ink, bd: `inset 0 0 0 1px ${c.border}` },
          { t: "Disabled", bg: FILL, col: "#B0AEB4" },
        ].map((b, i) => (
          <div key={b.t} style={{ height: 56, padding: "0 28px", borderRadius: 999, background: b.bg, boxShadow: b.bd, display: "grid", placeItems: "center", ...B, color: b.col, fontWeight: 700, fontSize: 18, ...pop(lf, 2 + i * 2) }}>
            {b.t}
          </div>
        ))}
        <div style={{ width: 56, height: 56, borderRadius: 99, background: FILL, display: "grid", placeItems: "center", ...pop(lf, 10) }}>
          <div style={{ width: 20, height: 4, background: c.ink, borderRadius: 2 }} />
        </div>
      </div>

      {/* Inputs */}
      <Label x={L} y={ROWS[1]} t="Inputs" lf={lf} at={3} />
      <div style={{ ...abs(L, ROWS[1] + 36), ...hstack, gap: 24 }}>
        {[
          { l: "Email", v: "maya@aurora.co", focus: false },
          { l: "Amount", v: "$2,400.00", focus: true },
        ].map((f, i) => (
          <div key={f.l} style={rise(lf, 4 + i * 2, 16)}>
            <div style={{ ...B, fontSize: 14, lineHeight: "20px", color: INK2, marginBottom: 8 }}>{f.l}</div>
            <div
              style={{
                width: 360,
                height: 56,
                borderRadius: 16,
                boxShadow: f.focus ? `inset 0 0 0 2px ${MAGENTA}, 0 0 0 4px rgba(195,43,90,.12)` : `inset 0 0 0 1px ${c.border}`,
                ...hstack,
                padding: "0 16px",
                ...B,
                fontSize: 18,
              }}
            >
              {f.v}
              {f.focus && <div style={{ width: 2, height: 24, background: MAGENTA, marginLeft: 4, opacity: Math.floor(lf / 8) % 2 ? 1 : 0 }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <Label x={L} y={ROWS[2]} t="Controls" lf={lf} at={5} />
      <div style={{ ...abs(L, ROWS[2] + 36, undefined, 40), ...hstack, gap: 32, ...rise(lf, 6, 14) }}>
        <div style={{ width: 72, height: 40, borderRadius: 99, background: toggle > 0.5 ? grad : "#E4E2E6", padding: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "#fff", transform: `translateX(${toggle * 32}px)`, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: grad, display: "grid", placeItems: "center", ...B, color: "#fff", fontWeight: 700, fontSize: 20 }}>✓</div>
        <div style={{ width: 32, height: 32, borderRadius: 99, boxShadow: `inset 0 0 0 2px ${MAGENTA}`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 16, height: 16, borderRadius: 99, background: MAGENTA }} />
        </div>
        <div style={{ width: 320, height: 8, borderRadius: 8, background: FILL, position: "relative" }}>
          <div style={{ width: `${slide}%`, height: 8, borderRadius: 8, background: grad }} />
          <div style={{ position: "absolute", left: `${slide}%`, top: -8, width: 24, height: 24, marginLeft: -12, borderRadius: 99, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
        </div>
      </div>

      {/* Tokens: the Aurora brand ramp */}
      <Label x={L} y={ROWS[3]} t="Color tokens" lf={lf} at={7} />
      <div style={{ ...abs(L, ROWS[3] + 36), ...hstack, gap: 16 }}>
        {RAMP.map((col, i) => (
          <div key={col} style={pop(lf, 7 + i)}>
            <div style={{ width: 112, height: 112, borderRadius: 24, background: col, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)" }} />
            <div style={{ ...B, fontSize: 14, lineHeight: "20px", color: INK2, marginTop: 12 }}>brand/{(i + 1) * 100}</div>
          </div>
        ))}
      </div>

      {/* Card component with its spec */}
      <Label x={R} y={ROWS[0]} t="Card" lf={lf} at={2} />
      <div style={{ ...abs(CARD.x, CARD.y, CARD.w, CARD.h), ...card, padding: CARD.pad, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ ...B, fontSize: 16, lineHeight: "20px", color: INK3 }}>Metric</div>
        <div style={{ ...hstack, justifyContent: "space-between" }}>
          <div style={{ ...H, fontSize: 40, lineHeight: "48px" }}>$84.2k</div>
          <div style={chip}>+12%</div>
        </div>
      </div>
      <div style={{ opacity: tw(lf, 14, 22), ...B, fontSize: 12, lineHeight: "16px", fontWeight: 700 }}>
        <div style={{ ...abs(CARD.x, CARD.y + CARD.h + 12, CARD.w, 2), background: SPEC }} />
        <div style={{ ...abs(CARD.x + CARD.w / 2 - 20, CARD.y + CARD.h + 20, 40), textAlign: "center", color: "#fff", background: SPEC, padding: "2px 0", borderRadius: 4 }}>{CARD.w}</div>
        <div style={{ ...abs(CARD.x + 1, CARD.y + 1, CARD.pad, CARD.h - 2), background: "rgba(242,72,34,.08)" }} />
        <div style={{ ...abs(CARD.x - 12, CARD.y + CARD.h / 2 - 8, 0), color: SPEC, transform: "translateX(-100%)" }}>{CARD.pad}</div>
      </div>

      {/* Badges */}
      <Label x={R} y={ROWS[2]} t="Badges" lf={lf} at={6} />
      <div style={{ ...abs(R, ROWS[2] + 36, undefined, 40), ...hstack, gap: 12, ...rise(lf, 8, 12) }}>
        {[
          ["Active", "#E7F6EE", "#1F8A55"],
          ["Pending", "#FDF1DE", "#A9690F"],
          ["New", "rgba(195,43,90,.1)", "#B52752"],
        ].map(([t, bg, col]) => (
          <div key={t} style={{ ...chip, padding: "8px 16px", background: bg, color: col }}>{t}</div>
        ))}
      </div>

      {/* Type scale — the sizes the other frames use */}
      <Label x={R} y={ROWS[3]} t="Typography" lf={lf} at={9} />
      <div style={{ ...abs(R, ROWS[3] + 36), ...hstack, alignItems: "flex-end", gap: 32, ...rise(lf, 10, 16) }}>
        <div style={{ ...H, fontSize: 144, lineHeight: "112px" }}>Aa</div>
        <div style={{ ...B, fontSize: 16, lineHeight: "32px", color: INK2 }}>
          <div>Display · 96</div>
          <div>Heading · 48</div>
          <div>Body · 16</div>
        </div>
      </div>
    </div>
  );
};
