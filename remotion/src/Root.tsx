import { Composition } from "remotion";
import { TurfStory } from "./videos/TurfStory";
import { TurfGrid } from "./videos/TurfGrid";
import { AuraStory } from "./videos/AuraStory";
import { AuraGrid } from "./videos/AuraGrid";
import { PrismGrid } from "./videos/PrismGrid";
import { HavenGrid } from "./videos/HavenGrid";
import { HelmGrid } from "./videos/HelmGrid";

export const RemotionRoot = () => (
  <>
    <Composition id="turf-story" component={TurfStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="turf-grid" component={TurfGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="aura-story" component={AuraStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="aura-grid" component={AuraGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="prism-grid" component={PrismGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="haven-grid" component={HavenGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="helm-grid" component={HelmGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
  </>
);
