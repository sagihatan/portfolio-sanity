import { useVideoConfig } from "remotion";

/** Frame geometry for the current composition (16:9 or 9:16). */
export const useLayout = () => {
  const { width: W, height: H } = useVideoConfig();
  return { W, H, cx: W / 2, cy: H / 2, vertical: H > W };
};
export type Layout = ReturnType<typeof useLayout>;

/** Width of the gradient bar SlabsStage hands to Bridge. */
export const barWidth = (vertical: boolean) => (vertical ? 900 : 1180);
