import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "manaaki")!;
export const ManaakiRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const ManaakiRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
