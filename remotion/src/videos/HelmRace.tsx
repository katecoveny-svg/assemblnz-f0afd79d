import React from "react";
import { SplitScreenRace } from "../shared/SplitScreenRace";
import { KETE_DATA } from "../shared/keteData";
const d = KETE_DATA.find(k => k.slug === "helm")!;
export const HelmRaceGrid: React.FC = () => <SplitScreenRace data={d} format="square" />;
export const HelmRaceStory: React.FC = () => <SplitScreenRace data={d} format="story" />;
