"use client";

import type { ComponentProps } from "react";
import { WorldAtelierStage } from "@/components/site/assembl-the-work/WorldAtelierStage";

type Props = Omit<ComponentProps<typeof WorldAtelierStage>, "paused">;

/** Public /do hero stage — motion always free; no product “paused” chrome. */
export function DoAtelierHeroStage(props: Props) {
  return <WorldAtelierStage {...props} paused={false} />;
}
