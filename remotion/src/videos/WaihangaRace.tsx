import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "waihanga")!;
export const WaihangaRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const WaihangaRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
