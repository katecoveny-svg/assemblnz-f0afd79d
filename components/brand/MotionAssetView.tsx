'use client';

import type { MotionAsset } from '@/lib/brand/motion-assets';

import { GlbViewer } from './GlbViewer';
import { SplineScene } from './SplineScene';

/**
 * Renders any registered MotionAsset by dispatching to the right viewer
 * based on its `kind`. Keep page-level code agnostic of the underlying
 * renderer so we can swap GLB ⇄ Spline without touching consumers.
 */
export interface MotionAssetViewProps {
  asset: MotionAsset;
  className?: string;
  forceMotion?: boolean;
}

export function MotionAssetView({ asset, className, forceMotion }: MotionAssetViewProps) {
  if (asset.kind === 'glb') {
    return <GlbViewer asset={asset} className={className} forceMotion={forceMotion} />;
  }
  return <SplineScene asset={asset} className={className} forceMotion={forceMotion} />;
}
