'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { FamilyId, RendererProps } from '@/lib/generative-art/families';

const LineCanvas = dynamic(
  () => import('./families/LineCanvas').then((m) => m.LineCanvas),
  { ssr: false }
);
const LiquidCanvas = dynamic(
  () => import('./families/LiquidCanvas').then((m) => m.LiquidCanvas),
  { ssr: false }
);
const ChromeCanvas = dynamic(
  () => import('./families/ChromeCanvas').then((m) => m.ChromeCanvas),
  { ssr: false }
);

export const FAMILY_RENDERERS: Record<FamilyId, ComponentType<RendererProps>> = {
  line: LineCanvas,
  liquid: LiquidCanvas,
  chrome: ChromeCanvas,
};
