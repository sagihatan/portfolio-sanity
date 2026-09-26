import { c, font, grad } from "../lib/brand";
import { EXPO, IN_OUT, SOFT, kf, tw } from "../lib/anim";
import { Cursor } from "./Cursor";

const W = 620;
const H = 420;
const BLUE = c.figma;

const Layer = ({ name, depth, sel, i, f }: { name: string; depth: number; sel?: boolean; i: number; f: number }) => (
  <div
    style={{
      height: 26,
      display: "flex",
      alignItems: "center",
      gap: 6,
      paddingLeft: 10 + depth * 12,
      fontSize: 11,
      color: sel ? "#fff" : "#3A3A40",
      background: sel ? BLUE : "transparent",
      borderRadius: 6,
      margin: "0 6px",
      opacity: tw(f, 4 + i * 2, 20 + i * 2),
    }}
  >
    <div style={{ width: 9, height: 9, borderRadius: depth === 0 ? 2 : 1, border: `1.4px solid ${sel ? "#fff" : "#9A9AA2"}` }} />
    {name}
  </div>
);

export const MockCanvas: React.FC<{ f: number }> = ({ f }) => {
  // Cursor path: enter → button → drag right edge
  const cx = kf(f, [[20, 470], [70, 300], [92, 354], [140, 388], [200, 388]], IN_OUT);
  const cy = kf(f, [[20, 390], [70, 330], [92, 331], [200, 331]], IN_OUT);
  const selected = f > 74;
  const press = f > 72 && f < 78;
  const btnW = kf(f, [[96, 112], [140, 146]], SOFT);
  const hue = tw(f, 60, 200, 0, 1);
  const hex = ["#D4532E", "#C83A48", "#B52752", "#8E1B6A", "#671186"][Math.min(4, Math.floor(hue * 5))];
  return (
    <div style={{ width: W, height: H, background: "#F5F4F5", fontFamily: font.body, color: c.ink, position: "relative", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ height: 40, background: "#fff", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: i === 0 ? BLUE : "transparent", display: "grid", placeItems: "center" }}>
            <div style={{ width: 11, height: 11, borderRadius: i === 3 ? 99 : 2, border: `1.6px solid ${i === 0 ? "#fff" : "#5A5A62"}`, transform: i === 1 ? "rotate(45deg)" : "none" }} />
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#6B6B72" }}>Checkout — v3</div>
          <div style={{ height: 24, padding: "0 10px", borderRadius: 7, background: BLUE, color: "#fff", fontSize: 11, fontWeight: 600, display: "grid", placeItems: "center" }}>Share</div>
        </div>
      </div>

      <div style={{ display: "flex", height: H - 40 }}>
        {/* Layers */}
        <div style={{ width: 138, background: "#fff", borderRight: `1px solid ${c.border}`, paddingTop: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#9A9AA2", padding: "0 16px 6px", letterSpacing: ".04em" }}>LAYERS</div>
          <Layer i={0} f={f} name="Checkout" depth={0} />
          <Layer i={1} f={f} name="Card" depth={1} />
          <Layer i={2} f={f} name="Image" depth={2} />
          <Layer i={3} f={f} name="Title" depth={2} />
          <Layer i={4} f={f} name="Price" depth={2} />
          <Layer i={5} f={f} name="Button" depth={2} sel={selected} />
          <Layer i={6} f={f} name="Footer" depth={1} />
        </div>

        {/* Canvas */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundImage: "radial-gradient(rgba(11,11,15,.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div style={{ position: "absolute", left: 92, top: 22, fontSize: 10, color: "#8A8A92" }}>Card</div>
          <div
            style={{
              position: "absolute",
              left: 92,
              top: 38,
              width: 150,
              height: 300,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,.1), 0 12px 24px -8px rgba(16,24,40,.14)",
              overflow: "visible",
              opacity: tw(f, 6, 24),
              transform: `scale(${tw(f, 6, 36, 0.92, 1)})`,
            }}
          >
            <div style={{ height: 120, margin: 10, borderRadius: 10, background: grad, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 90, height: 90, borderRadius: 99, right: -20, top: -30, background: "rgba(255,255,255,.18)" }} />
            </div>
            <div style={{ margin: "4px 12px", height: 10, width: 96, borderRadius: 4, background: "#1a1623" }} />
            <div style={{ margin: "8px 12px", height: 7, width: 110, borderRadius: 4, background: "#E3E1E4" }} />
            <div style={{ margin: "0 12px", height: 7, width: 80, borderRadius: 4, background: "#E3E1E4" }} />
            {/* Button */}
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 236,
                width: btnW,
                height: 34,
                borderRadius: 99,
                background: grad,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                display: "grid",
                placeItems: "center",
                transform: `scale(${press ? 0.96 : 1})`,
              }}
            >
              Pay now
            </div>
            {/* Selection */}
            {selected && (
              <div style={{ position: "absolute", left: 11, top: 235, width: btnW + 2, height: 36, border: `1.5px solid ${BLUE}`, opacity: tw(f, 74, 80) }}>
                {[
                  [-4, -4],
                  [btnW - 3, -4],
                  [-4, 30],
                  [btnW - 3, 30],
                ].map(([x, y], i) => (
                  <div key={i} style={{ position: "absolute", left: x, top: y, width: 7, height: 7, background: "#fff", border: `1.5px solid ${BLUE}` }} />
                ))}
                <div style={{ position: "absolute", top: 42, left: "50%", transform: "translateX(-50%)", background: BLUE, color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>
                  {Math.round(btnW)} × 34
                </div>
              </div>
            )}
            {/* Spacing guide */}
            <div style={{ position: "absolute", left: 0, top: 253, width: 12, height: 1, background: "#F24822", opacity: tw(f, 100, 110) * (1 - tw(f, 150, 160)) }} />
            <div style={{ position: "absolute", left: -2, top: 258, fontSize: 8, color: "#F24822", fontWeight: 700, opacity: tw(f, 100, 110) * (1 - tw(f, 150, 160)) }}>12</div>
          </div>
          <div style={{ position: "absolute", left: cx - 138, top: cy - 40 }}>
            <Cursor press={press || (f > 92 && f < 140)} />
          </div>
        </div>

        {/* Properties */}
        <div style={{ width: 150, background: "#fff", borderLeft: `1px solid ${c.border}`, padding: 12, fontSize: 11 }}>
          <div style={{ display: "flex", gap: 12, fontWeight: 600, marginBottom: 12 }}>
            <span>Design</span>
            <span style={{ color: "#9A9AA2" }}>Prototype</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              ["W", selected ? Math.round(btnW) : 150],
              ["H", selected ? 34 : 300],
              ["X", 12],
              ["R", 999],
            ].map(([k, v]) => (
              <div key={k as string} style={{ height: 24, borderRadius: 6, background: "#F5F4F5", display: "flex", alignItems: "center", gap: 6, padding: "0 7px" }}>
                <span style={{ color: "#9A9AA2" }}>{k}</span>
                {v}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontWeight: 600 }}>Fill</div>
          <div style={{ marginTop: 8, height: 26, borderRadius: 6, background: "#F5F4F5", display: "flex", alignItems: "center", gap: 7, padding: "0 7px" }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: grad }} />
            Linear
          </div>
          {/* Gradient editor */}
          <div style={{ marginTop: 10, height: 10, borderRadius: 6, background: grad, position: "relative" }}>
            {[0.12, 0.5, 0.86].map((p, i) => (
              <div key={i} style={{ position: "absolute", left: `${p * 100}%`, top: -3, width: 12, height: 16, marginLeft: -6, borderRadius: 4, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: `${hue * 100}%`,
                top: -6,
                width: 16,
                height: 22,
                marginLeft: -8,
                borderRadius: 5,
                border: `2px solid ${BLUE}`,
                background: hex,
              }}
            />
          </div>
          <div style={{ marginTop: 12, fontFamily: font.body, fontSize: 11, color: "#3A3A40" }}>{hex}</div>
          <div style={{ marginTop: 14, fontWeight: 600 }}>Auto layout</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: 24, borderRadius: 6, background: i === 1 ? "rgba(13,153,255,.12)" : "#F5F4F5", border: i === 1 ? `1px solid ${BLUE}` : "none" }} />
            ))}
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 9, background: "#F0EEF0" }}>
            <div style={{ height: 6, width: `${tw(f, 60, 170, 20, 80, EXPO)}%`, borderRadius: 9, background: BLUE }} />
          </div>
        </div>
      </div>
    </div>
  );
};
