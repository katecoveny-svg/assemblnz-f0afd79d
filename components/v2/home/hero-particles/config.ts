/**
 * Hero particle sculpture — central tuning (Kate's spec, 2026-07-13).
 * The sculpture must read as suspended metallic dust: thousands of distinct
 * pinpoints, mostly white page, never a filled volume.
 */

export type HeroBreakpoint = 'desktop' | 'tablet' | 'mobile';

export type HeroParticleSettings = {
  particleCount: number;
  structuralRatio: number;
  supportingRatio: number;
  /** remainder is atmospheric */
  pointSize: number;
  formationWidth: number;
  formationHeight: number;
  depthSpread: number;
  atmosphericSpread: number;
  cameraZ: number;
  fov: number;
};

export const heroParticleConfig: Record<HeroBreakpoint, HeroParticleSettings> = {
  desktop: {
    particleCount: 4200,
    structuralRatio: 0.24,
    supportingRatio: 0.33,
    pointSize: 1.55,
    formationWidth: 6.4,
    formationHeight: 3.8,
    depthSpread: 2.4,
    atmosphericSpread: 4.2,
    cameraZ: 10,
    fov: 34,
  },
  tablet: {
    particleCount: 3000,
    structuralRatio: 0.24,
    supportingRatio: 0.33,
    pointSize: 1.4,
    formationWidth: 5.4,
    formationHeight: 3.3,
    depthSpread: 2,
    atmosphericSpread: 3.6,
    cameraZ: 10,
    fov: 35,
  },
  mobile: {
    particleCount: 1700,
    structuralRatio: 0.24,
    supportingRatio: 0.33,
    pointSize: 1.25,
    formationWidth: 4.9,
    formationHeight: 2.7,
    depthSpread: 1.6,
    atmosphericSpread: 3.2,
    cameraZ: 11,
    fov: 36,
  },
};

export const FORMATIONS = ['wing', 'school', 'matariki', 'rivers', 'genome'] as const;
export type FormationName = (typeof FORMATIONS)[number];

/** Seconds a formation holds before morphing on. */
export const HOLD_SECONDS = 7;
/** Seconds a morph takes end to end. */
export const MORPH_SECONDS = 3.4;
