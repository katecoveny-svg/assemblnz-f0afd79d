/**
 * Living Interface scene tunables — the central place Kate's art direction
 * lands. The dev panel (?motion-dev=1, development builds) overrides these
 * live and can copy the merged JSON back here.
 */

export type SceneConfig = {
  /** Multiplier on the quality tier's particle count (dev-panel density). */
  density: number;
  /** Multiplier on the quality tier's base point size. */
  pointSize: number;
  /** World-unit scale of every target form. */
  formScale: number;
  /** Seconds the directed assembly takes end to end. */
  assemblySeconds: number;
  /** Pointer influence 0–1 (0 = sculpture ignores the cursor). */
  interactionStrength: number;
  /** Seconds of stillness before the gathering begins (anticipation). */
  anticipationSeconds: number;
  cameraZ: number;
  fov: number;
};

export const defaultSceneConfig: SceneConfig = {
  density: 1,
  pointSize: 1,
  formScale: 1,
  assemblySeconds: 2.3,
  interactionStrength: 0.5,
  anticipationSeconds: 0.55,
  cameraZ: 10,
  fov: 34,
};

/** Base composition extents (world units) that formScale multiplies. */
export const FORM_EXTENTS = {
  width: 6.4,
  height: 3.8,
  depth: 2.2,
  atmosphere: 4.2,
} as const;

/** Particle role split — fixed by index across every form so one population
 *  morphs cleanly between states. */
export const ROLE_RATIOS = { structural: 0.24, supporting: 0.33 } as const;
