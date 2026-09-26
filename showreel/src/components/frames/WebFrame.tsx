import { c, grad } from "../../lib/brand";
import { EXPO, tw } from "../../lib/anim";
import { ACCENT, AuroraLogo, AuroraMark, B, H, INK2, INK3, SERIF, abs, card, hstack, pop, rise, vstack } from "./ui";

export const WEB = { w: 1440, h: 900 };
const M = 64; // page margin (sides and bottom)

const button = (primary: boolean): React.CSSProperties => ({
  ...B,
  height: 64,
  padding: "0 32px",
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 20,
  fontWeight: primary ? 700 : 500,
  color: primary ? "#fff" : c.ink,
  background: primary ? grad : "#fff",
  border: primary ? "none" : `1px solid ${c.border}`,
  boxShadow: primary ? "0 12px 24px -12px rgba(181,39,82,.6), inset 0 1px 0 rgba(255,255,255,.36)" : "none",
});

export const WebFrame: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const float = Math.sin(f / 40) * 8;
  return (
    <div style={{ ...abs(0, 0, WEB.w, WEB.h), background: "#fff", overflow: "hidden" }}>
      {/* Soft hero glow */}
      <div
        style={{
          ...abs(700, -120, 900, 900),
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(195,43,90,.22), transparent 70%), radial-gradient(40% 40% at 70% 30%, rgba(255,168,0,.18), transparent 70%)",
          opacity: tw(lf, 0, 20),
        }}
      />

      {/* Nav: logo | centred links | actions */}
      <div style={{ ...abs(M, 32, WEB.w - 2 * M, 48), display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", ...rise(lf, 0, 12) }}>
        <AuroraLogo size={40} word={28} />
        <div style={{ ...hstack, gap: 40, ...B, fontSize: 16, color: INK2 }}>
          {["Product", "Pricing", "Customers", "Company"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div style={{ ...hstack, justifyContent: "flex-end", gap: 24, ...B, fontSize: 16 }}>
          <span>Log in</span>
          <div style={{ height: 44, padding: "0 20px", borderRadius: 999, background: c.ink, color: "#fff", display: "grid", placeItems: "center" }}>Sign up</div>
        </div>
      </div>

      {/* Hero copy: pill 24 headline 24 sub 40 buttons */}
      <div style={{ ...abs(M, 216, 720), ...vstack, alignItems: "flex-start" }}>
        <div
          style={{
            ...B,
            fontSize: 16,
            lineHeight: "20px",
            padding: "8px 16px",
            borderRadius: 999,
            background: "linear-gradient(140deg, rgba(220,96,52,.12), rgba(195,43,90,.08) 45%, rgba(103,17,134,.12))",
            color: ACCENT,
            ...rise(lf, 2, 14),
          }}
        >
          New · Instant payouts
        </div>
        <div style={{ ...H, fontSize: 96, lineHeight: "96px", letterSpacing: "-0.045em", marginTop: 24 }}>
          <div style={rise(lf, 3, 40, 20)}>Money that</div>
          <div style={rise(lf, 6, 40, 20)}>
            moves <span style={SERIF}>with you.</span>
          </div>
        </div>
        <div style={{ ...B, fontWeight: 450, fontSize: 20, lineHeight: "32px", color: INK2, marginTop: 24, ...rise(lf, 9, 20) }}>
          Payments, cards and payouts in one simple app —<br />built for teams that move fast.
        </div>
        <div style={{ ...hstack, gap: 16, marginTop: 40 }}>
          <div style={{ ...button(true), ...pop(lf, 11) }}>Get started →</div>
          <div style={{ ...button(false), ...pop(lf, 13) }}>Book a demo</div>
        </div>
      </div>

      {/* Hero visual: card + revenue widget */}
      <div style={{ ...abs(848, 168 + float, 472, 296), transform: `rotate(-8deg) translateY(${tw(lf, 4, 26, 60, 0, EXPO)}px)`, opacity: tw(lf, 4, 16) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 32, background: grad, boxShadow: "0 40px 72px -32px rgba(103,17,134,.6)", position: "relative", overflow: "hidden", padding: 32 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,.36), transparent 45%)" }} />
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: 999, right: -88, top: -120, background: "rgba(255,255,255,.14)" }} />
          <AuroraMark size={40} />
          <div style={{ position: "absolute", left: 32, right: 32, bottom: 32, ...hstack, justifyContent: "space-between", ...B, color: "#fff" }}>
            <span style={{ fontSize: 24, letterSpacing: "0.12em" }}>•••• 2048</span>
            <span style={{ fontSize: 16, letterSpacing: "0.08em", color: "rgba(255,255,255,.8)" }}>MAYA COHEN</span>
          </div>
        </div>
      </div>
      <div style={{ ...abs(976, 528 - float * 0.6, 360), ...card, borderRadius: 24, background: "rgba(255,255,255,.9)", boxShadow: "0 32px 60px -24px rgba(16,24,40,.28)", padding: 24, ...rise(lf, 8, 40, 22) }}>
        <div style={{ ...B, fontSize: 16, lineHeight: "20px", color: INK3 }}>Revenue this month</div>
        <div style={{ ...H, fontSize: 40, lineHeight: "48px", marginTop: 8 }}>${Math.round(tw(lf, 8, 40, 0, 48210, EXPO)).toLocaleString("en-US")}</div>
        <div style={{ ...hstack, alignItems: "flex-end", gap: 8, height: 32, marginTop: 16 }}>
          {[0.4, 0.6, 0.5, 0.8, 0.7, 1, 0.9].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * tw(lf, 12 + i, 30 + i, 0, 100, EXPO)}%`, borderRadius: 4, background: i === 5 ? grad : "rgba(195,43,90,.16)" }} />
          ))}
        </div>
      </div>

      {/* Customer logos (the same clients as the dashboard) */}
      <div style={{ ...abs(M, WEB.h - M - 28, WEB.w - 2 * M, 28), ...hstack, justifyContent: "space-between", ...rise(lf, 14, 12) }}>
        <div style={{ ...B, fontSize: 14, color: INK3 }}>Trusted by 4,000+ teams</div>
        {["Helix Labs", "Northwind", "Orbit", "Lumen", "Vertex"].map((n) => (
          <div key={n} style={{ ...H, fontSize: 24, lineHeight: "28px", color: "#C4C2C8" }}>{n}</div>
        ))}
      </div>
    </div>
  );
};
