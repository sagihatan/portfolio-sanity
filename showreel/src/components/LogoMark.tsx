import { PATHS, SLABS, SlabId } from "../lib/logo";

const G: Record<SlabId, [number, number, number, number]> = {
  mid: [-7.59, 0.87, 28.52, 58.12],
  bot: [-5.29, 25.34, 19.68, 64.94],
  top: [9.98, -6.68, 34.72, 32.72],
};

/** The full logo mark. `slab` lets callers transform each slab independently. */
export const LogoMark: React.FC<{
  height: number;
  slab?: (id: SlabId, i: number) => React.SVGProps<SVGGElement>;
  style?: React.CSSProperties;
  uid?: string;
  glint?: number; // -1 → 1 sweeps a highlight across the mark
}> = ({ height, slab, style, uid = "lm", glint }) => (
  <svg width={(height * 49) / 56} height={height} viewBox="0 0 49 56" style={{ overflow: "visible", ...style }}>
    <defs>
      {SLABS.map((id) => (
        <linearGradient key={id} id={`${uid}-${id}`} x1={G[id][0]} y1={G[id][1]} x2={G[id][2]} y2={G[id][3]} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA800" />
          <stop offset="0.5076" stopColor="#C32B5A" />
          <stop offset="1" stopColor="#2A00A3" />
        </linearGradient>
      ))}
      {glint !== undefined && (
        <>
          <clipPath id={`${uid}-clip`}>
            {SLABS.map((id) => (
              <path key={id} d={PATHS[id]} />
            ))}
          </clipPath>
          <linearGradient id={`${uid}-glint`} x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </>
      )}
    </defs>
    {SLABS.map((id, i) => (
      <g key={id} {...(slab ? slab(id, i) : {})}>
        <path d={PATHS[id]} fill={`url(#${uid}-${id})`} />
      </g>
    ))}
    {glint !== undefined && (
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x={glint * 60 - 10} y="-10" width="70" height="76" fill={`url(#${uid}-glint)`} />
      </g>
    )}
  </svg>
);
