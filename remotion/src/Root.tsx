import { Composition } from "remotion";
import { TurfStory } from "./videos/TurfStory";
import { TurfGrid } from "./videos/TurfGrid";
import { AuraStory } from "./videos/AuraStory";
import { AuraGrid } from "./videos/AuraGrid";
import { PrismGrid } from "./videos/PrismGrid";
import { HavenGrid } from "./videos/HavenGrid";
import { HelmGrid } from "./videos/HelmGrid";
import { HangaBimGrid } from "./videos/HangaBimGrid";

import { PikauRaceGrid, PikauRaceStory } from "./videos/PikauRace";
import { ManaakiRaceGrid, ManaakiRaceStory } from "./videos/ManaakiRace";
import { AratakiRaceGrid, AratakiRaceStory } from "./videos/AratakiRace";
import { AuahaRaceGrid, AuahaRaceStory } from "./videos/AuahaRace";
import { WaihangaRaceGrid, WaihangaRaceStory } from "./videos/WaihangaRace";
import { HavenRaceGrid, HavenRaceStory } from "./videos/HavenRace";
import { ToroaRaceGrid, ToroaRaceStory } from "./videos/ToroaRace";
import { HelmRaceGrid, HelmRaceStory } from "./videos/HelmRace";

// Race videos: 5 steps × 50 frames/human step + 45 intro + 60 outro ≈ 355 frames
const RACE_FRAMES = 360;

export const RemotionRoot = () => (
  <>
    <Composition id="turf-story" component={TurfStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="turf-grid" component={TurfGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="aura-story" component={AuraStory} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="aura-grid" component={AuraGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="prism-grid" component={PrismGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="haven-grid" component={HavenGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="helm-grid" component={HelmGrid} durationInFrames={270} fps={30} width={1080} height={1080} />
    <Composition id="hanga-bim-grid" component={HangaBimGrid} durationInFrames={330} fps={30} width={1080} height={1080} />

    <Composition id="pikau-race-grid" component={PikauRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="manaaki-race-grid" component={ManaakiRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="arataki-race-grid" component={AratakiRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="auaha-race-grid" component={AuahaRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="waihanga-race-grid" component={WaihangaRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="haven-race-grid" component={HavenRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="toroa-race-grid" component={ToroaRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />
    <Composition id="helm-race-grid" component={HelmRaceGrid} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1080} />

    <Composition id="pikau-race-story" component={PikauRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="manaaki-race-story" component={ManaakiRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="arataki-race-story" component={AratakiRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="auaha-race-story" component={AuahaRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="waihanga-race-story" component={WaihangaRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="haven-race-story" component={HavenRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="toroa-race-story" component={ToroaRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="helm-race-story" component={HelmRaceStory} durationInFrames={RACE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
