import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "haven")!;
export const HavenRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const HavenRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
