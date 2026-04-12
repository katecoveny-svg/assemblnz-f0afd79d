import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "arataki")!;
export const AratakiRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const AratakiRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
