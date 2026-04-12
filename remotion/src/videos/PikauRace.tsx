import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "pikau")!;
export const PikauRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const PikauRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
