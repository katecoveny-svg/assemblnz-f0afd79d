/**
 * Registry of 3D motion assets for the assembl press kit and marketing pages.
 *
 * Two kinds are supported:
 *   - `glb`  — a .glb file served from /public/brand/motion/, rendered with
 *              <model-viewer>. This is the primary path (self-hosted, no
 *              third-party runtime, downloadable as-is by press).
 *   - `spline` — a Spline production scene URL
 *                (https://prod.spline.design/<hash>/scene.splinecode),
 *                rendered with @splinetool/react-spline. Use this when the
 *                scene was built in Spline and you want its full interactive
 *                behaviour (states, events, parameters) rather than a static
 *                exported model.
 *
 * Editor URLs (app.spline.design/file/... or
 * app.spline.design/community/file/...) cannot be embedded directly — they
 * belong in `editorUrl` as the "View on Spline" credit link.
 */
export type MotionAssetKind = 'glb' | 'spline';

interface BaseMotionAsset {
  id: string;
  name: string;
  description: string;
  /** Aspect ratio for the embed container. */
  aspect: '16/9' | '4/3' | '1/1' | '21/9';
  /** Optional poster image shown for reduced-motion users and while loading. */
  posterSrc?: string;
  /** Optional Spline editor / community URL for attribution. */
  editorUrl?: string;
}

export interface GlbMotionAsset extends BaseMotionAsset {
  kind: 'glb';
  /** Path to the .glb file, typically under /public/brand/motion/. */
  src: string;
  /** Hex background colour for the model-viewer canvas. Defaults to brand cream. */
  background?: string;
}

export interface SplineMotionAsset extends BaseMotionAsset {
  kind: 'spline';
  /** Production Spline scene URL. */
  sceneUrl: string;
  /** True until a real prod URL replaces the placeholder. */
  placeholder?: boolean;
}

export type MotionAsset = GlbMotionAsset | SplineMotionAsset;

export const MOTION_ASSETS: MotionAsset[] = [
  {
    id: 'assembl-mark',
    kind: 'glb',
    name: 'assembl mark — texturised',
    description:
      'The sculptural assembl mark in warm clay-and-pounamu tones. Free to embed in editorial coverage; please attribute as "assembl" (lowercase).',
    src: '/brand/motion/assembl-mark.glb',
    aspect: '1/1',
    background: '#FAF7F2',
  },
  {
    id: 'assembl-mark-glass',
    kind: 'glb',
    name: 'assembl mark — glass',
    description:
      'Translucent glass interpretation of the assembl mark — suited to dark-mode hero panels and overlay loops.',
    src: '/brand/motion/assembl-mark-glass.glb',
    aspect: '1/1',
    background: '#23211F',
  },
  {
    id: 'koru-unfurl',
    kind: 'spline',
    name: 'Koru unfurl (Spline)',
    description:
      'Interactive Spline scene — sculptural koru opening on warm cream. Awaiting prod.spline.design export.',
    sceneUrl: 'https://prod.spline.design/REPLACE_ME/scene.splinecode',
    editorUrl:
      'https://app.spline.design/community/file/927883a9-fc91-4de7-a434-ecf48acf819c',
    aspect: '16/9',
    placeholder: true,
  },
  {
    id: 'assembl-mark-spline',
    kind: 'spline',
    name: 'assembl motion mark (Spline)',
    description:
      'Spline scene companion to the GLB above — full interactive states once exported.',
    sceneUrl: 'https://prod.spline.design/REPLACE_ME/scene.splinecode',
    editorUrl: 'https://app.spline.design/file/7f497650-081a-4531-bf85-2f294c2a2444',
    aspect: '16/9',
    placeholder: true,
  },
];

export function getMotionAsset(id: string): MotionAsset | undefined {
  return MOTION_ASSETS.find((asset) => asset.id === id);
}

export const FEATURED_ASSET_ID = 'assembl-mark';
