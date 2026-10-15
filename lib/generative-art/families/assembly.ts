import type { Family, FamilyPreset, SliderSpec } from '../families';
import { SPECIES, type Species } from '../species';

/**
 * Generative assembly: the homepage tide engine as a studio family. A flock
 * of any species gathers into any assembl object, or spells a word.
 */

/** Formation targets, in the engine's names. `text` spells the studio's text field. */
export const FORMATIONS = [
  { id: 'word', label: 'assembl' },
  { id: 'amark', label: 'a mark' },
  { id: 'DO', label: 'DO' },
  { id: 'text', label: 'your word' },
  { id: 'cloud', label: 'cloud' },
  { id: 'signal', label: 'signal' },
  { id: 'pin', label: 'pin' },
  { id: 'bubble', label: 'bubble' },
  { id: 'tick', label: 'tick' },
  { id: 'frame', label: 'frame' },
  { id: 'sparkle', label: 'sparkle' },
  { id: 'padlock', label: 'padlock' },
  { id: 'seal', label: 'seal' },
] as const;

export type FormationId = (typeof FORMATIONS)[number]['id'];

export function formationAt(index: number): FormationId {
  return FORMATIONS[Math.max(0, Math.min(FORMATIONS.length - 1, Math.round(index)))].id;
}

const sliders = (sp: Species): SliderSpec[] => [
  { key: 'formation', label: 'formation', min: 0, max: FORMATIONS.length - 1, step: 1, options: FORMATIONS.map((f) => f.label) },
  { key: 'count', label: 'flock', min: 40, max: 2000, step: 10, format: (v) => String(Math.round(v)) },
  { key: 'size', label: 'body size', min: sp.size.min, max: sp.size.max, step: 0.05, format: (v) => v.toFixed(2) },
  { key: 'beat', label: sp.motion === 'mote' ? 'pulse' : sp.motion === 'bird' ? 'wingbeat' : 'tail beat', min: 1, max: 24, step: 0.5, format: (v) => v.toFixed(1) },
  { key: 'mill', label: 'mill', min: 0, max: 0.8, step: 0.01, format: (v) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = SPECIES.map((sp) => ({
  id: sp.id,
  label: sp.name,
  blurb: sp.gloss,
  sliders: sliders(sp),
  defaults: { formation: 0, count: sp.flock.count, size: sp.size.default, beat: sp.beat, mill: sp.flock.spin },
}));

export const ASSEMBLY_FAMILY: Family = {
  id: 'assembly',
  label: 'Assembly',
  blurb: 'any species assembling any assembl object, or any word',
  ground: '#240B21',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
  supportsText: true,
  supportsLoop: true,
};
