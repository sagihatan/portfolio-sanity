import { AbsoluteFill, Sequence } from "remotion";
import { BgWaves } from "./components/BgWaves";
import { Grain } from "./components/Grain";
import { SlabsStage } from "./scenes/SlabsStage";
import { Bridge } from "./scenes/Bridge";
import { CanvasTour } from "./scenes/CanvasTour";
import { Headline } from "./scenes/Headline";
import { EndCard } from "./scenes/EndCard";
import { PortraitEnd } from "./scenes/PortraitEnd";
import { BRIDGE_FROM, END_FROM, HEAD_HOLD, HEADLINE_FROM, SLABS_END, TOUR_FROM } from "./lib/timeline";
import { DURATION, LOOP_DURATION } from "./lib/anim";

export type ShowreelProps = { ending: "logo" | "portrait" | "loop" };

/**
 * ≈21s @ 60fps (the website loop is 15.5s). Every scene adapts to 16:9 or 9:16 via useLayout().
 * Frame ranges live in lib/timeline.ts.
 *    0–128   Ignition     pen tool draws the logo, gradient floods in
 *  128–266   Deconstruct  slabs explode into 3D layers, morph into panels
 *  266–440   Interfaces   invented product UIs come alive, collapse into a bar
 *  436–512   Bridge       block reveal: "From idea to product."
 *  500–1008  Canvas tour  five capability frames, 1.1s each, each handing an element
 *                         to the next; zoom out to all five together
 *  868–1010  Headline     "One designer. Full coverage." over the blurred canvas
 *  962–1362  Ending       logo lock-up (film) or the headline settles under the pop-out portrait (story)
 *  840–930   Loop         hold the overview, dissolve to the empty opening canvas (website)
 */
export const Showreel: React.FC<ShowreelProps> = ({ ending }) => {
  const loop = ending === "loop";
  const end = loop ? LOOP_DURATION : DURATION;
  return (
    <AbsoluteFill style={{ background: "#FAF8F8" }}>
      <BgWaves />
      <Sequence durationInFrames={SLABS_END} layout="none">
        <SlabsStage />
      </Sequence>
      <Sequence from={BRIDGE_FROM} durationInFrames={80} layout="none">
        <Bridge />
      </Sequence>
      <Sequence from={TOUR_FROM} durationInFrames={(loop ? end : END_FROM + 150) - TOUR_FROM} layout="none">
        <CanvasTour loop={loop} />
      </Sequence>
      {!loop && (
        <>
          <Sequence from={HEADLINE_FROM} durationInFrames={ending === "portrait" ? end - HEADLINE_FROM : 92 + HEAD_HOLD} layout="none">
            <Headline settle={ending === "portrait"} />
          </Sequence>
          <Sequence from={END_FROM} durationInFrames={end - END_FROM} layout="none">
            {ending === "portrait" ? <PortraitEnd /> : <EndCard />}
          </Sequence>
        </>
      )}
      <Grain />
    </AbsoluteFill>
  );
};
