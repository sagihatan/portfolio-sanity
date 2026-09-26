import { evolvePath } from "@remotion/paths";
import { c, grad } from "../../lib/brand";
import { SOFT, tw } from "../../lib/anim";
import { smoothPath } from "../../lib/timeline";
import { AuroraLogo, B, FILL, H, INK2, INK3, abs, card, chip, hstack, rise, vstack } from "./ui";

export const SAAS = { w: 1440, h: 900 };
/*
 * Sidebar 240 | 40 | main 1120 | 40. Header 32–80, then a 24-gap grid:
 * chart 776 × 456 beside three KPI cards 320 × 136, and the table below (bottom margin 40).
 */
const MX = 280;
const TOP = 112;
const KPI_W = 320;
const CHART_W = SAAS.w - 40 - MX - KPI_W - 24; // 776
const CHART_H = 3 * 136 + 2 * 24; // 456

const DATA = [20, 28, 24, 36, 33, 46, 41, 55, 50, 63, 58, 74];
const PLOT = { w: CHART_W - 64, h: 240 };
const CHART_PATH = smoothPath(DATA, PLOT.w, PLOT.h, 82);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Kpi: React.FC<{ label: string; value: string; delta: string; style?: React.CSSProperties }> = ({ label, value, delta, style }) => (
  <div style={{ ...card, height: 136, padding: 24, ...vstack, justifyContent: "space-between", ...style }}>
    <div style={{ ...B, fontSize: 16, lineHeight: "20px", color: INK3 }}>{label}</div>
    <div style={{ ...hstack, justifyContent: "space-between" }}>
      <div style={{ ...H, fontSize: 40, lineHeight: "48px" }}>{value}</div>
      <div style={chip}>{delta}</div>
    </div>
  </div>
);

export const SaasFrame: React.FC<{ lf: number }> = ({ lf }) => {
  const draw = tw(lf, 6, 34, 0, 1, SOFT);
  const ev = evolvePath(draw, CHART_PATH);
  return (
    <div style={{ ...abs(0, 0, SAAS.w, SAAS.h), background: "#FBFAFB", overflow: "hidden" }}>
      {/* Sidebar — logo row centred on the header (y 56) */}
      <div style={{ ...abs(0, 0, 240, SAAS.h), background: "#fff", borderRight: `1px solid ${c.border}`, padding: "40px 24px" }}>
        <div style={rise(lf, 0, 10)}>
          <AuroraLogo size={32} word={24} />
        </div>
        <div style={{ ...vstack, gap: 4, marginTop: 40 }}>
          {["Revenue", "Customers", "Plans", "Invoices", "Reports", "Settings"].map((t, i) => (
            <div
              key={t}
              style={{
                height: 44,
                ...hstack,
                gap: 12,
                padding: "0 12px",
                borderRadius: 12,
                background: i === 0 ? "rgba(195,43,90,.08)" : "transparent",
                ...B,
                fontSize: 16,
                color: i === 0 ? c.ink : INK2,
                ...rise(lf, 1 + i, 10),
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? grad : "none", boxShadow: i === 0 ? "none" : "inset 0 0 0 2px #B8B8BF" }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ ...abs(MX, 32, SAAS.w - 40 - MX, 48), ...hstack, gap: 24, ...rise(lf, 0, 14) }}>
        <div style={{ ...H, fontSize: 40, lineHeight: "48px" }}>Revenue</div>
        <div style={{ ...hstack, padding: 4, borderRadius: 12, background: FILL, ...B, fontSize: 14 }}>
          {["Day", "Week", "Month", "Year"].map((t, i) => (
            <div key={t} style={{ height: 32, padding: "0 16px", ...hstack, borderRadius: 8, background: i === 2 ? "#fff" : "none", color: i === 2 ? c.ink : INK2, boxShadow: i === 2 ? "0 1px 3px rgba(0,0,0,.1)" : "none" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", height: 40, ...hstack, ...B, fontSize: 14, padding: "0 16px", borderRadius: 12, border: `1px solid ${c.border}`, background: "#fff" }}>Jan 1 — Dec 31</div>
      </div>

      {/* Chart */}
      <div style={{ ...abs(MX, TOP, CHART_W, CHART_H), ...card, padding: 32 }}>
        <div style={{ ...B, fontSize: 16, lineHeight: "20px", color: INK3 }}>Net revenue</div>
        <div style={{ ...H, fontSize: 48, lineHeight: "56px", marginTop: 4 }}>${tw(lf, 4, 34, 0, 1.28, SOFT).toFixed(2)}M</div>
        <svg width={PLOT.w} height={PLOT.h} style={{ position: "absolute", left: 32, bottom: 64, overflow: "visible" }}>
          <defs>
            <linearGradient id="scl" x1="0" x2="1">
              <stop offset="0" stopColor={c.ember} />
              <stop offset=".5" stopColor="#B52752" />
              <stop offset="1" stopColor={c.plum} />
            </linearGradient>
            <linearGradient id="sca" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#C32B5A" stopOpacity=".2" />
              <stop offset="1" stopColor="#C32B5A" stopOpacity="0" />
            </linearGradient>
            <clipPath id="scc">
              <rect x="0" y="-20" width={PLOT.w * draw} height={PLOT.h + 40} />
            </clipPath>
          </defs>
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={k} x1="0" x2={PLOT.w} y1={(k * PLOT.h) / 4} y2={(k * PLOT.h) / 4} stroke="rgba(11,11,15,.06)" strokeDasharray="4 8" />
          ))}
          <path d={`${CHART_PATH} L ${PLOT.w} ${PLOT.h} L 0 ${PLOT.h} Z`} fill="url(#sca)" clipPath="url(#scc)" />
          <path d={CHART_PATH} fill="none" stroke="url(#scl)" strokeWidth={4} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        </svg>
        <div style={{ ...abs(32, CHART_H - 32 - 20, PLOT.w, 20), ...hstack, justifyContent: "space-between", ...B, fontSize: 12, color: INK3 }}>
          {MONTHS.map((m) => (
            <span key={m} style={{ width: 24, textAlign: "center" }}>{m}</span>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ ...abs(MX + CHART_W + 24, TOP, KPI_W), ...vstack, gap: 24 }}>
        <Kpi label="MRR" value="$84.2k" delta="+12%" />
        <Kpi label="Churn" value="1.8%" delta="-0.4%" style={rise(lf, 4, 20)} />
        <Kpi label="Active seats" value="3,204" delta="+212" style={rise(lf, 7, 20)} />
      </div>

      {/* Table */}
      <div style={{ ...abs(MX, TOP + CHART_H + 24, SAAS.w - 40 - MX), ...card, padding: "16px 24px", ...rise(lf, 8, 24) }}>
        <div style={{ ...hstack, height: 44, ...B, fontSize: 14, color: INK3, borderBottom: `1px solid ${c.border}` }}>
          <span style={{ width: 420 }}>Customer</span>
          <span style={{ width: 220 }}>Plan</span>
          <span style={{ width: 220 }}>Status</span>
          <span style={{ marginLeft: "auto" }}>MRR</span>
        </div>
        {[
          ["Helix Labs", "Enterprise", "Active", "$12,400", "#BFC9F2"],
          ["Northwind", "Growth", "Active", "$4,800", "#F4C9A8"],
          ["Orbit", "Growth", "Trial", "$2,150", "#D9B9D0"],
        ].map(([n, p, s, m, bg], i) => (
          <div key={n} style={{ ...hstack, height: 64, borderBottom: i < 2 ? `1px solid ${c.border}` : "none", ...B, fontSize: 16, ...rise(lf, 10 + i * 2, 12) }}>
            <span style={{ width: 420, ...hstack, gap: 12, fontWeight: 700 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: bg }} />
              {n}
            </span>
            <span style={{ width: 220 }}>
              <span style={{ fontSize: 14, lineHeight: "20px", padding: "4px 12px", borderRadius: 99, background: FILL }}>{p}</span>
            </span>
            <span style={{ width: 220, ...hstack, gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: s === "Active" ? "#2BB673" : "#F2A93B" }} />
              {s}
            </span>
            <span style={{ marginLeft: "auto", fontWeight: 700 }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
