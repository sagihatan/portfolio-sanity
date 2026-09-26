import { c, font, grad } from "../lib/brand";
import { EXPO, SOFT, tw } from "../lib/anim";

const W = 320;
const H = 660;

const ROWS = [
  { n: "Studio Rent", s: "Today · Transfer", a: "-$1,200.00", col: "#F4C9A8" },
  { n: "Figma", s: "Yesterday · Subscription", a: "-$45.00", col: "#D9B9D0" },
  { n: "Client — Aurora", s: "Mon · Invoice #208", a: "+$4,800.00", col: "#BFE3D0" },
  { n: "Coffee Lab", s: "Mon · Card", a: "-$6.40", col: "#F2D59B" },
  { n: "Client — Helix", s: "Sun · Invoice #207", a: "+$2,150.00", col: "#BFC9F2" },
  { n: "Transit", s: "Sat · Card", a: "-$2.90", col: "#E6DDDE" },
];

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const MockPhone: React.FC<{ f: number }> = ({ f }) => {
  const scroll = tw(f, 120, 170, 0, -118, SOFT);
  const toastY = tw(f, 138, 158, -90, 0, EXPO) + tw(f, 196, 214, 0, -90, EXPO);
  const tab = f > 150 ? 1 : 0;
  return (
    <div style={{ width: W, height: H, background: "#fff", fontFamily: font.body, color: c.ink, position: "relative", overflow: "hidden" }}>
      {/* Status bar + island */}
      <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 28px 0", fontSize: 13, fontWeight: 600 }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ width: 16, height: 10, borderRadius: 2, background: c.ink, opacity: 0.85 }} />
          <div style={{ width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${c.ink}`, padding: 1 }}>
            <div style={{ width: "75%", height: "100%", background: c.ink, borderRadius: 1 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 12, left: W / 2 - 50, width: 100, height: 28, borderRadius: 20, background: "#0B0B0F", zIndex: 5 }} />

      {/* Toast */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          right: 14,
          height: 58,
          borderRadius: 20,
          zIndex: 6,
          transform: `translateY(${toastY}px)`,
          background: "rgba(22,18,28,.92)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          boxShadow: "0 16px 30px -10px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: grad }} />
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Payment received</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>Aurora paid invoice #208</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#FFB27A" }}>+$4,800</div>
      </div>

      <div style={{ transform: `translateY(${scroll}px)`, padding: "10px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: tw(f, 4, 22) }}>
          <div>
            <div style={{ fontSize: 12, color: "#8A8A92" }}>Good morning</div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 24, letterSpacing: "-0.03em" }}>Maya</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: "linear-gradient(140deg,#F4C9A8,#D9B9D0)" }} />
        </div>

        {/* Balance card */}
        <div
          style={{
            marginTop: 16,
            height: 158,
            borderRadius: 24,
            background: grad,
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            padding: 18,
            boxShadow: "0 18px 30px -14px rgba(181,39,82,.6)",
            opacity: tw(f, 8, 28),
            transform: `translateY(${tw(f, 8, 40, 26, 0)}px) scale(${tw(f, 8, 40, 0.94, 1)})`,
          }}
        >
          <div style={{ position: "absolute", width: 180, height: 180, borderRadius: 999, right: -60, top: -70, background: "rgba(255,255,255,.14)" }} />
          <div style={{ position: "absolute", width: 120, height: 120, borderRadius: 999, right: 30, bottom: -70, background: "rgba(255,255,255,.1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,.28), transparent 45%)" }} />
          <div style={{ position: "relative", fontSize: 12, opacity: 0.8 }}>Total balance</div>
          <div style={{ position: "relative", fontFamily: font.sans, fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", marginTop: 6 }}>
            ${fmtMoney(tw(f, 14, 80, 0, 12480.2, SOFT) + tw(f, 150, 175, 0, 4800, SOFT))}
          </div>
          <div style={{ position: "relative", display: "flex", gap: 8, marginTop: 22 }}>
            {["•••• 4821", "USD"].map((t) => (
              <div key={t} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)" }}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          {["Send", "Request", "Cards", "More"].map((l, i) => (
            <div key={l} style={{ textAlign: "center", opacity: tw(f, 18 + i * 3, 36 + i * 3), transform: `scale(${tw(f, 18 + i * 3, 42 + i * 3, 0.6, 1)})` }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, background: "#F6F2F3", border: `1px solid ${c.border}`, display: "grid", placeItems: "center" }}>
                <div style={{ width: 18, height: 18, borderRadius: i === 0 ? 99 : 5, border: "2px solid #B52752" }} />
              </div>
              <div style={{ fontSize: 11, color: "#6B6B72", marginTop: 6, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, fontSize: 14, fontWeight: 700, opacity: tw(f, 26, 44) }}>
          Activity <span style={{ fontSize: 12, color: "#B52752", fontWeight: 600 }}>See all</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={r.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 58,
              borderBottom: `1px solid ${c.border}`,
              opacity: tw(f, 30 + i * 4, 50 + i * 4),
              transform: `translateX(${tw(f, 30 + i * 4, 60 + i * 4, 30, 0)}px)`,
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: r.col }} />
            <div style={{ flex: 1, lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.n}</div>
              <div style={{ fontSize: 11, color: "#9A9AA2" }}>{r.s}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: r.a.startsWith("+") ? "#B52752" : c.ink }}>{r.a}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 62,
          borderRadius: 24,
          background: "rgba(255,255,255,.86)",
          border: `1px solid ${c.border}`,
          boxShadow: "0 10px 26px -10px rgba(16,24,40,.25)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: 20, height: 20, borderRadius: i === 2 ? 99 : 6, border: `2px solid ${i === tab ? "#B52752" : "#B8B8BF"}`, background: i === tab ? "rgba(195,43,90,.1)" : "none" }} />
            <div style={{ width: 4, height: 4, borderRadius: 9, background: i === tab ? "#B52752" : "transparent" }} />
          </div>
        ))}
      </div>
    </div>
  );
};
