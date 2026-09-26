import { evolvePath } from "@remotion/paths";
import { c, grad } from "../../lib/brand";
import { SOFT, tw } from "../../lib/anim";
import { smoothPath } from "../../lib/timeline";
import { ACCENT, AuroraMark, B, FILL, H, INK3, abs, card, hstack, rise, vstack } from "./ui";

export const MOBILE = { w: 420, h: 900 };
const X = 32; // content margin (20 inside the 12px bezel)
const W = MOBILE.w - 2 * X; // 356

const CHART = { w: W - 48, h: 96 };
const SPEND_PATH = smoothPath([18, 26, 21, 34, 29, 46, 40], CHART.w, CHART.h);

export const MobileFrame: React.FC<{ lf: number }> = ({ lf }) => {
  const ev = evolvePath(tw(lf, 8, 30, 0, 1, SOFT), SPEND_PATH);
  return (
    <div style={{ ...abs(0, 0, MOBILE.w, MOBILE.h), background: "#fff", borderRadius: 60, overflow: "hidden", boxShadow: "inset 0 0 0 10px #0B0B0F, inset 0 0 0 12px #2A2A30" }}>
      {/* Status bar + island */}
      <div style={{ ...abs(0, 24, MOBILE.w, 28), ...hstack, justifyContent: "space-between", padding: "0 48px", ...B, fontWeight: 700, fontSize: 16 }}>
        <span>9:41</span>
        <span style={{ letterSpacing: 2 }}>•••</span>
      </div>
      <div style={{ ...abs(MOBILE.w / 2 - 62, 20, 124, 36), borderRadius: 20, background: "#0B0B0F" }} />

      <div style={{ ...abs(X, 76, W), ...vstack }}>
        {/* Greeting */}
        <div style={{ ...hstack, justifyContent: "space-between", ...rise(lf, 0, 14) }}>
          <div>
            <div style={{ ...B, fontSize: 14, lineHeight: "20px", color: INK3 }}>Good morning</div>
            <div style={{ ...H, fontSize: 28, lineHeight: "32px" }}>Hi, Maya</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: "linear-gradient(140deg,#F4C9A8,#D9B9D0)" }} />
        </div>

        {/* Balance — the Aurora card */}
        <div style={{ marginTop: 24, position: "relative", borderRadius: 32, background: grad, color: "#fff", padding: 24, overflow: "hidden", boxShadow: "0 20px 32px -16px rgba(181,39,82,.6)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,.28), transparent 50%)" }} />
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: 999, right: -72, top: -92, background: "rgba(255,255,255,.14)" }} />
          <div style={{ position: "relative", ...hstack, justifyContent: "space-between" }}>
            <span style={{ ...B, color: "rgba(255,255,255,.8)", fontSize: 16, lineHeight: "20px" }}>Total balance</span>
            <AuroraMark size={24} />
          </div>
          <div style={{ position: "relative", ...H, color: "#fff", fontSize: 40, lineHeight: "48px", marginTop: 8 }}>
            ${tw(lf, 4, 30, 18000, 24860, SOFT).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ position: "relative", ...hstack, gap: 8, marginTop: 24 }}>
            {["+ Add money", "Send"].map((t) => (
              <div key={t} style={{ ...B, color: "#fff", fontSize: 14, lineHeight: "20px", padding: "8px 16px", borderRadius: 99, background: "rgba(255,255,255,.2)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.3)" }}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Spending */}
        <div style={{ marginTop: 16, ...card, padding: 24, ...rise(lf, 4, 20) }}>
          <div style={{ ...hstack, justifyContent: "space-between", ...B, fontWeight: 700, fontSize: 16, lineHeight: "24px" }}>
            Spending <span style={{ fontWeight: 500, fontSize: 14, color: INK3 }}>This week</span>
          </div>
          <svg width={CHART.w} height={CHART.h} style={{ display: "block", marginTop: 16, overflow: "visible" }}>
            <defs>
              <linearGradient id="msl" x1="0" x2="1">
                <stop offset="0" stopColor={c.ember} />
                <stop offset="1" stopColor={c.plum} />
              </linearGradient>
            </defs>
            <path d={SPEND_PATH} fill="none" stroke="url(#msl)" strokeWidth={4} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          </svg>
          <div style={{ ...hstack, justifyContent: "space-between", marginTop: 8, ...B, fontSize: 12, lineHeight: "16px", color: INK3 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} style={{ width: 12, textAlign: "center", color: i === 5 ? ACCENT : undefined, fontWeight: i === 5 ? 700 : 500 }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ marginTop: 24, ...hstack, justifyContent: "space-between", ...B, fontSize: 16, lineHeight: "24px", fontWeight: 700, ...rise(lf, 7, 16) }}>
          Recent <span style={{ fontWeight: 500, fontSize: 14, color: INK3 }}>See all</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {[
            ["Studio Rent", "Today · Transfer", "-$1,200", "#F4C9A8"],
            ["Client — Helix", "Yesterday · Invoice", "+$2,150", "#BFE3D0"],
            ["Coffee Lab", "Mon · Card", "-$6.40", "#F2D59B"],
          ].map(([n, s, a, bg], i) => (
            <div key={n} style={{ ...hstack, height: 56, gap: 12, ...rise(lf, 8 + i * 3, 20) }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...B, fontWeight: 700, fontSize: 16, lineHeight: "20px" }}>{n}</div>
                <div style={{ ...B, fontSize: 14, lineHeight: "20px", color: INK3 }}>{s}</div>
              </div>
              <div style={{ ...B, fontWeight: 700, fontSize: 16, color: a.startsWith("+") ? ACCENT : c.ink }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ ...abs(X, 808, W, 64), borderRadius: 24, background: FILL, ...hstack, justifyContent: "space-around" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 24, height: 24, borderRadius: i === 2 ? 99 : 8, border: `2px solid ${i === 0 ? ACCENT : "#B8B8BF"}` }} />
        ))}
      </div>
    </div>
  );
};
