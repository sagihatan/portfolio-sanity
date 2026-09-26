import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { c, font, grad } from "../lib/brand";
import { EXPO, SOFT, tw } from "../lib/anim";

const W = 1040;
const H = 640;

const DATA = [22, 30, 26, 38, 34, 47, 42, 58, 52, 66, 61, 78];
const CW = 470;
const CH = 170;

const pts = DATA.map((v, i) => [(i / (DATA.length - 1)) * CW, CH - (v / 86) * CH] as const);
// Catmull-Rom → cubic bezier for a smooth line
const LINE = pts
  .map((p, i) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p3 = pts[i + 1] ?? p;
    const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
    const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
    return `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p[0]} ${p[1]}`;
  })
  .join(" ");
const LEN = getLength(LINE);

const pointAtX = (x: number) => {
  let lo = 0;
  let hi = LEN;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (getPointAtLength(LINE, mid)!.x < x) lo = mid;
    else hi = mid;
  }
  return getPointAtLength(LINE, lo)!;
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const Nav = ({ label, active, i, f }: { label: string; active?: boolean; i: number; f: number }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 36,
      padding: "0 12px",
      borderRadius: 10,
      background: active ? "rgba(195,43,90,.08)" : "transparent",
      color: active ? c.ink : "#6B6B72",
      fontWeight: active ? 600 : 500,
      fontSize: 13,
      opacity: tw(f, 6 + i * 3, 26 + i * 3),
      transform: `translateX(${tw(f, 6 + i * 3, 30 + i * 3, -14, 0)}px)`,
    }}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: active ? grad : "transparent",
        border: active ? "none" : "1.6px solid #B8B8BF",
      }}
    />
    {label}
  </div>
);

const Kpi = ({ label, value, delta, i, f }: { label: string; value: string; delta: string; i: number; f: number }) => (
  <div
    style={{
      flex: 1,
      height: 104,
      borderRadius: 16,
      background: "#fff",
      border: `1px solid ${c.border}`,
      boxShadow: "0 1px 2px rgba(16,24,40,.04)",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      opacity: tw(f, 14 + i * 5, 34 + i * 5),
      transform: `translateY(${tw(f, 14 + i * 5, 44 + i * 5, 18, 0)}px)`,
    }}
  >
    <div style={{ fontSize: 12, color: "#7A7A82", fontWeight: 500 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", color: c.ink }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: 999,
          color: "#B52752",
          background: "linear-gradient(140deg, rgba(220,96,52,.14), rgba(103,17,134,.12))",
        }}
      >
        {delta}
      </div>
    </div>
  </div>
);

export const MockDashboard: React.FC<{ f: number }> = ({ f }) => {
  const draw = tw(f, 34, 110, 0, 1, SOFT);
  const ev = evolvePath(draw, LINE);
  const hoverX = tw(f, 110, 200, CW * 0.52, CW * 0.91, SOFT);
  const hp = pointAtX(hoverX);
  const hoverOn = tw(f, 104, 116);
  const idx = Math.round((hoverX / CW) * (DATA.length - 1));
  const bars = [0.52, 0.86, 0.64, 0.95, 0.4, 0.72];
  return (
    <div style={{ width: W, height: H, display: "flex", background: "#fff", fontFamily: font.body, color: c.ink }}>
      {/* Sidebar */}
      <div style={{ width: 188, background: "#FBFAFA", borderRight: `1px solid ${c.border}`, padding: "22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px 22px", opacity: tw(f, 0, 20) }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: grad }} />
          <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>Lumen</div>
        </div>
        {["Overview", "Analytics", "Customers", "Reports", "Automations", "Settings"].map((l, i) => (
          <Nav key={l} label={l} active={i === 0} i={i} f={f} />
        ))}
        <div
          style={{
            marginTop: 120,
            borderRadius: 14,
            padding: 14,
            background: "linear-gradient(140deg, rgba(220,96,52,.12), rgba(195,43,90,.08) 45%, rgba(103,17,134,.12))",
            opacity: tw(f, 40, 60),
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600 }}>Pro plan</div>
          <div style={{ fontSize: 11, color: "#7A7A82", marginTop: 4 }}>82% of seats used</div>
          <div style={{ height: 5, borderRadius: 9, background: "rgba(11,11,15,.08)", marginTop: 10 }}>
            <div style={{ height: 5, borderRadius: 9, width: `${tw(f, 50, 110, 0, 82)}%`, background: grad }} />
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: tw(f, 4, 24) }}>
          <div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 26, letterSpacing: "-0.03em" }}>Overview</div>
            <div style={{ fontSize: 12, color: "#8A8A92", marginTop: 2 }}>Last 30 days · Updated just now</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 200, height: 36, borderRadius: 999, border: `1px solid ${c.border}`, background: "#FAFAFB", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 12, color: "#A0A0A8" }}>
              Search…
            </div>
            {["#F4C9A8", "#D9B9D0", "#BFC9F2"].map((bg, i) => (
              <div key={bg} style={{ width: 34, height: 34, borderRadius: 99, background: bg, border: "2px solid #fff", marginLeft: i ? -16 : 0 }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          <Kpi i={0} f={f} label="Revenue" value={`$${fmt(tw(f, 20, 90, 0, 482910, SOFT))}`} delta="+12.4%" />
          <Kpi i={1} f={f} label="Active users" value={`${tw(f, 25, 95, 0, 38.2, SOFT).toFixed(1)}k`} delta="+8.1%" />
          <Kpi i={2} f={f} label="Conversion" value={`${tw(f, 30, 100, 0, 6.4, SOFT).toFixed(1)}%`} delta="+2.3%" />
        </div>

        <div style={{ display: "flex", gap: 14, flex: 1 }}>
          {/* Line chart */}
          <div
            style={{
              flex: 1,
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              padding: "16px 18px",
              opacity: tw(f, 26, 46),
              transform: `translateY(${tw(f, 26, 56, 20, 0)}px)`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
              Revenue growth
              <span style={{ fontSize: 11, color: "#8A8A92", fontWeight: 500 }}>Jan — Dec</span>
            </div>
            <svg width={CW + 20} height={CH + 40} style={{ marginTop: 14, overflow: "visible" }}>
              <defs>
                <linearGradient id="dl" x1="0" x2="1">
                  <stop offset="0" stopColor={c.ember} />
                  <stop offset=".5" stopColor="#B52752" />
                  <stop offset="1" stopColor={c.plum} />
                </linearGradient>
                <linearGradient id="da" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#C32B5A" stopOpacity=".22" />
                  <stop offset="1" stopColor="#C32B5A" stopOpacity="0" />
                </linearGradient>
                <clipPath id="dc">
                  <rect x="0" y="-20" width={CW * draw} height={CH + 40} />
                </clipPath>
              </defs>
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1="0" x2={CW} y1={(k * CH) / 3} y2={(k * CH) / 3} stroke="rgba(11,11,15,.06)" strokeDasharray="3 5" />
              ))}
              <path d={`${LINE} L ${CW} ${CH} L 0 ${CH} Z`} fill="url(#da)" clipPath="url(#dc)" />
              <path d={LINE} fill="none" stroke="url(#dl)" strokeWidth={3} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
              <g opacity={hoverOn}>
                <line x1={hp.x} x2={hp.x} y1={0} y2={CH} stroke="rgba(11,11,15,.18)" strokeDasharray="3 4" />
                <circle cx={hp.x} cy={hp.y} r={9} fill="rgba(195,43,90,.18)" />
                <circle cx={hp.x} cy={hp.y} r={5} fill="#fff" stroke="#B52752" strokeWidth={2.5} />
                <g transform={`translate(${hp.x - 46}, ${hp.y - 48})`}>
                  <rect width="92" height="32" rx="9" fill={c.ink} />
                  <text x="46" y="21" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600" fontFamily={font.body}>
                    ${(DATA[idx] * 6.19).toFixed(1)}k
                  </text>
                </g>
              </g>
            </svg>
          </div>
          {/* Bars */}
          <div
            style={{
              width: 250,
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              opacity: tw(f, 32, 52),
              transform: `translateY(${tw(f, 32, 62, 20, 0)}px)`,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Channels</div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 12, paddingTop: 14 }}>
              {bars.map((b, i) => (
                <div key={i} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${b * tw(f, 44 + i * 5, 100 + i * 5, 0, 100, EXPO)}%`,
                      borderRadius: 8,
                      background: i === 3 ? grad : "rgba(195,43,90,.12)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9A9AA2", marginTop: 8 }}>
              {["Web", "iOS", "And", "API", "Ref", "Ads"].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
