'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { FamilyId, RendererProps } from '@/lib/generative-art/families';

const LineCanvas = dynamic(
  () => import('./families/LineCanvas').then((m) => m.LineCanvas),
  { ssr: false }
);
const ChromeCanvas = dynamic(
  () => import('./families/ChromeCanvas').then((m) => m.ChromeCanvas),
  { ssr: false }
);
const FlowCanvas = dynamic(
  () => import('./families/FlowCanvas').then((m) => m.FlowCanvas),
  { ssr: false }
);
const ConstellationCanvas = dynamic(
  () => import('./families/ConstellationCanvas').then((m) => m.ConstellationCanvas),
  { ssr: false }
);
const GridCanvas = dynamic(
  () => import('./families/GridCanvas').then((m) => m.GridCanvas),
  { ssr: false }
);
const OrbitCanvas = dynamic(
  () => import('./families/OrbitCanvas').then((m) => m.OrbitCanvas),
  { ssr: false }
);
const WavesCanvas = dynamic(
  () => import('./families/WavesCanvas').then((m) => m.WavesCanvas),
  { ssr: false }
);
const ReactionCanvas = dynamic(
  () => import('./families/ReactionCanvas').then((m) => m.ReactionCanvas),
  { ssr: false }
);
const BoidsCanvas = dynamic(
  () => import('./families/BoidsCanvas').then((m) => m.BoidsCanvas),
  { ssr: false }
);
const AttractorsCanvas = dynamic(
  () => import('./families/AttractorsCanvas').then((m) => m.AttractorsCanvas),
  { ssr: false }
);
const GrowthCanvas = dynamic(
  () => import('./families/GrowthCanvas').then((m) => m.GrowthCanvas),
  { ssr: false }
);
const ChladniCanvas = dynamic(
  () => import('./families/ChladniCanvas').then((m) => m.ChladniCanvas),
  { ssr: false }
);
const VerletCanvas = dynamic(
  () => import('./families/VerletCanvas').then((m) => m.VerletCanvas),
  { ssr: false }
);
const MarbleCanvas = dynamic(
  () => import('./families/MarbleCanvas').then((m) => m.MarbleCanvas),
  { ssr: false }
);
const TerrainCanvas = dynamic(
  () => import('./families/TerrainCanvas').then((m) => m.TerrainCanvas),
  { ssr: false }
);
const SandpileCanvas = dynamic(
  () => import('./families/SandpileCanvas').then((m) => m.SandpileCanvas),
  { ssr: false }
);
const RipplesCanvas = dynamic(
  () => import('./families/RipplesCanvas').then((m) => m.RipplesCanvas),
  { ssr: false }
);
const DlaCanvas = dynamic(
  () => import('./families/DlaCanvas').then((m) => m.DlaCanvas),
  { ssr: false }
);

export const FAMILY_RENDERERS: Record<FamilyId, ComponentType<RendererProps>> = {
  line: LineCanvas,
  chrome: ChromeCanvas,
  flow: FlowCanvas,
  constellation: ConstellationCanvas,
  grid: GridCanvas,
  orbit: OrbitCanvas,
  waves: WavesCanvas,
  reaction: ReactionCanvas,
  boids: BoidsCanvas,
  attractors: AttractorsCanvas,
  growth: GrowthCanvas,
  chladni: ChladniCanvas,
  verlet: VerletCanvas,
  marble: MarbleCanvas,
  terrain: TerrainCanvas,
  sandpile: SandpileCanvas,
  ripples: RipplesCanvas,
  dla: DlaCanvas,
};
