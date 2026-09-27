import { Composition } from "remotion";
import { Showreel, ShowreelProps } from "./Showreel";
import { DURATION, FPS, LOOP_DURATION } from "./lib/anim";
import { SiteTour, siteDuration } from "./scenes/SiteTour";

export const Root = () => (
  <>
    {/* Full film with the logo end card — portfolio, LinkedIn, sharing */}
    <Composition id="Showreel" component={Showreel} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ ending: "logo" } as ShowreelProps} />
    {/* Website hero stage: no end card, seamless 15s loop */}
    <Composition id="ShowreelWeb" component={Showreel} durationInFrames={LOOP_DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ ending: "loop" } as ShowreelProps} />
    {/* Instagram / TikTok / LinkedIn story — ends on Sagi's portrait */}
    <Composition id="ShowreelStory" component={Showreel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ ending: "portrait" } as ShowreelProps} />
    {/* Website hero stage (wordless loop): desktop 16:9 and mobile 2:3 (fills a phone screen under the nav) */}
    <Composition id="SiteDesktop" component={SiteTour} durationInFrames={siteDuration(false)} fps={FPS} width={1920} height={1080} />
    <Composition id="SiteMobile" component={SiteTour} durationInFrames={siteDuration(true)} fps={FPS} width={1080} height={1620} />
  </>
);
