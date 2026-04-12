import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "toroa")!;
export const ToroaRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const ToroaRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
