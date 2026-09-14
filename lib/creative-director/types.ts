/**
 * Creative Director PREVIEW — shared types.
 * Pipeline: idea → direction → world → experience.
 * DEMO / PREVIEW only — fixtures and stubs are honest.
 */

export type PipelineStep =
  | 'understand'
  | 'art-direct'
  | 'visual-targets'
  | 'construct'
  | 'critic';

export const PIPELINE_STEPS: ReadonlyArray<{
  id: PipelineStep;
  label: string;
  number: string;
}> = [
  { id: 'understand', label: 'Understand', number: '01' },
  { id: 'art-direct', label: 'Art direct', number: '02' },
  { id: 'visual-targets', label: 'Visual targets', number: '03' },
  { id: 'construct', label: 'Construct', number: '04' },
  { id: 'critic', label: 'Critic', number: '05' },
] as const;

/** Casual prompt → structured creative intent. */
export interface CreativeIntent {
  coreIdea: string;
  brand: string;
  audience: string;
  emotion: string;
  nzContext: string;
  references: string[];
  avoid: string[];
  hero: string;
  motion: string;
  qualityGate: string[];
  rawPrompt: string;
}

export type DirectionId = 'aerial-assembly' | 'object-world' | 'editorial-scroll';

/** One of exactly three materially different art directions. */
export interface ArtDirection {
  id: DirectionId;
  title: string;
  metaphor: string;
  composition: string;
  motion: string;
  type: string;
  paletteNote: string;
  registryBlocks: string[];
  whyDifferent: string;
}

export type VisualTargetKind =
  | 'desktop-hero'
  | 'mobile-hero'
  | 'key-interaction'
  | 'motion-storyboard';

export interface VisualTarget {
  kind: VisualTargetKind;
  label: string;
  placeholder: string;
  demoNote: string;
}

export type ConstructGrammar =
  | 'editorial-css-gsap'
  | 'cinematic-video'
  | 'spatial-r3f';

export interface ConstructChoice {
  id: ConstructGrammar;
  label: string;
  summary: string;
  stack: string[];
  registryBlocks: string[];
}

export type CriticSeverity = 'pass' | 'warn' | 'fail';

export interface CriticCheck {
  id: string;
  label: string;
  severity: CriticSeverity;
  detail: string;
}

export interface CriticResult {
  passed: boolean;
  checks: CriticCheck[];
  reviseReasons: string[];
  mockScreenshotNote: string;
}

export interface PipelineState {
  step: PipelineStep;
  prompt: string;
  intent: CreativeIntent | null;
  directions: ArtDirection[];
  selectedDirectionId: DirectionId | null;
  visualTargets: VisualTarget[];
  construct: ConstructGrammar | null;
  critic: CriticResult | null;
  demoSeeded: boolean;
}
