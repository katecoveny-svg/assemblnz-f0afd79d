import { Composition } from "remotion";
import { TurfStory } from "./videos/TurfStory";
import { TurfGrid } from "./videos/TurfGrid";
import { AuraStory } from "./videos/AuraStory";
import { AuraGrid } from "./videos/AuraGrid";

export const RemotionRoot = () => (
  <>
    <Composition id="turf-story" component={TurfStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="turf-grid" component={TurfGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="aura-story" component={AuraStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="aura-grid" component={AuraGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
  </>
);
