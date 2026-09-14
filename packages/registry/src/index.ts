/**
 * @assembl/registry — barrel for Creative Director PREVIEW stubs.
 * Canonical install names (future packages): @assembl/<block>.
 * Today: import from `@assembl/registry/<block>` or this barrel.
 */

export { CinemaHero } from './cinema-hero';
export type { CinemaHeroProps } from './cinema-hero';
export { SidewaysStory } from './sideways-story';
export type { SidewaysStoryProps, SidewaysChapter } from './sideways-story';
export { ObjectAssembly } from './object-assembly';
export type { ObjectAssemblyProps } from './object-assembly';
export { AerialWorld } from './aerial-world';
export type { AerialWorldProps } from './aerial-world';
export { AgentLive } from './agent-live';
export type { AgentLiveProps } from './agent-live';
export { WaitState } from './wait-state';
export type { WaitStateProps } from './wait-state';
export { EditorialType } from './editorial-type';
export type { EditorialTypeProps } from './editorial-type';
export { CameraScroll } from './camera-scroll';
export type { CameraScrollProps } from './camera-scroll';
export { ParticleField } from './particle-field';
export type { ParticleFieldProps } from './particle-field';

export const REGISTRY_BLOCKS = [
  'cinema-hero',
  'sideways-story',
  'object-assembly',
  'aerial-world',
  'agent-live',
  'wait-state',
  'editorial-type',
  'camera-scroll',
  'particle-field',
  'nz-material',
] as const;

export type RegistryBlockName = (typeof REGISTRY_BLOCKS)[number];
