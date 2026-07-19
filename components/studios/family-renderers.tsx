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

export const FAMILY_RENDERERS: Record<FamilyId, ComponentType<RendererProps>> = {
  line: LineCanvas,
  chrome: ChromeCanvas,
  flow: FlowCanvas,
  constellation: ConstellationCanvas,
  grid: GridCanvas,
  waves: WavesCanvas,
};
