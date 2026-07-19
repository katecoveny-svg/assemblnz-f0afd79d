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

export const FAMILY_RENDERERS: Record<FamilyId, ComponentType<RendererProps>> = {
  line: LineCanvas,
  chrome: ChromeCanvas,
  flow: FlowCanvas,
  constellation: ConstellationCanvas,
  grid: GridCanvas,
  waves: WavesCanvas,
  reaction: ReactionCanvas,
  boids: BoidsCanvas,
  attractors: AttractorsCanvas,
  growth: GrowthCanvas,
};
