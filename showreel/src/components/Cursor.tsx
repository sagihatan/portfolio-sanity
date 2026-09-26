/** macOS-style arrow cursor. */
export const Cursor: React.FC<{ press?: boolean; scale?: number; color?: string }> = ({ press, scale = 1, color = "#0B0B0F" }) => (
  <svg
    width={22 * scale}
    height={28 * scale}
    viewBox="0 0 22 28"
    style={{ overflow: "visible", transform: `scale(${press ? 0.86 : 1})`, transformOrigin: "2px 2px", filter: "drop-shadow(0 3px 5px rgba(0,0,0,.28))" }}
  >
    <path d="M2 2 L2 22 L7.5 17 L11 25.5 L14.5 24 L11 15.8 L18.5 15.8 Z" fill={color} stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
