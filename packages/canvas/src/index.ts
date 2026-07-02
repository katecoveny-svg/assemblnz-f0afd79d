'use client';

/**
 * @assembl/canvas — the assembl design-system canvas.
 *
 * Visual canon: public/brand/direction/DIRECTION-LOCKED-2026-07-01.md.
 * Token values are shared with the pilot-chrome kit
 * (components/assembl/chrome.tsx, PR #644) — never fork divergent values.
 *
 * Server components: import tokens from `@assembl/canvas/tokens`
 * (this entry carries the "use client" directive for the components).
 */

export { tokens, palette, typography, motionTokens, motto } from './tokens';
export type { CanvasTokens } from './tokens';

export { mulberry32, gauss } from './seeded';

export { ParticulateLandscape } from './components/ParticulateLandscape';
export type { ParticulateLandscapeProps } from './components/ParticulateLandscape';

export { Constellation } from './components/Constellation';
export type { ConstellationProps } from './components/Constellation';

export { BundleCard } from './components/BundleCard';
export type { BundleCardProps } from './components/BundleCard';

export { MicroLabel } from './components/MicroLabel';
export type { MicroLabelProps } from './components/MicroLabel';

export { RightRail } from './components/RightRail';
export type { RightRailProps } from './components/RightRail';

export { KpiTrio } from './components/KpiTrio';
export type { KpiStat, KpiTrioProps } from './components/KpiTrio';

export { drift, pulse, levitate, assemblingLoader, AssemblingLoader } from './motion';
export type { AssemblingLoaderProps } from './motion';
