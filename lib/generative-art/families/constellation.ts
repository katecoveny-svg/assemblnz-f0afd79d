import type { Family, FamilyPreset } from '../families';

export interface ConstellationPalette {
  ground: string;
  node: string;
  edge: string;
  edgeStrong: string;
}

export const CONSTELLATION_PALETTES: Record<string, ConstellationPalette> = {
  paper:    { ground: '#FBF7EE', node: '#2B6B57', edge: '#5B5049', edgeStrong: '#23211F' },
  ink:      { ground: '#F6F5F0', node: '#0B0B0F', edge: '#4A4A55', edgeStrong: '#0B0B0F' },
  night:    { ground: '#0D1119', node: '#F4CE7A', edge: '#4C8BE0', edgeStrong: '#8A56D0' },
  linen:    { ground: '#F4EFE4', node: '#8F3A22', edge: '#B29B7B', edgeStrong: '#5B2418' },
  slate:    { ground: '#1F262D', node: '#F5F1E8', edge: '#8AB9C4', edgeStrong: '#4A97A9' },
};

const SLIDERS = [
  { key: 'nodes',     label: 'nodes',     min: 20, max: 220, step: 1, format: (v: number) => String(Math.round(v)) },
  { key: 'radius',    label: 'linkRange', min: 40, max: 220, step: 1, format: (v: number) => `${Math.round(v)}px` },
  { key: 'speed',     label: 'drift',     min: 0.1, max: 2,  step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'nodeSize',  label: 'nodeSize',  min: 1,   max: 8,  step: 0.5, format: (v: number) => `${v.toFixed(1)}px` },
  { key: 'edgeAlpha', label: 'edgeAlpha', min: 0.05, max: 0.6, step: 0.01, format: (v: number) => v.toFixed(2) },
  { key: 'edgeWidth', label: 'edgeWidth', min: 0.4, max: 2.4, step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'paper',
    label: 'Paper Network',
    blurb: 'pounamu nodes on paper — the assembl register',
    sliders: SLIDERS,
    defaults: { nodes: 110, radius: 110, speed: 0.55, nodeSize: 3.5, edgeAlpha: 0.28, edgeWidth: 0.9 },
  },
  {
    id: 'ink',
    label: 'Ink Network',
    blurb: 'black nodes, editorial diagram',
    sliders: SLIDERS,
    defaults: { nodes: 140, radius: 100, speed: 0.4, nodeSize: 3.0, edgeAlpha: 0.35, edgeWidth: 0.8 },
  },
  {
    id: 'night',
    label: 'Night Sky',
    blurb: 'golden nodes on midnight, drifting',
    sliders: SLIDERS,
    defaults: { nodes: 160, radius: 130, speed: 0.35, nodeSize: 2.5, edgeAlpha: 0.20, edgeWidth: 0.7 },
  },
  {
    id: 'linen',
    label: 'Linen',
    blurb: 'warm coral network on cream',
    sliders: SLIDERS,
    defaults: { nodes: 90, radius: 120, speed: 0.5, nodeSize: 3.8, edgeAlpha: 0.24, edgeWidth: 1.0 },
  },
  {
    id: 'slate',
    label: 'Slate',
    blurb: 'pearl nodes on slate',
    sliders: SLIDERS,
    defaults: { nodes: 120, radius: 110, speed: 0.6, nodeSize: 3.0, edgeAlpha: 0.30, edgeWidth: 0.9 },
  },
];

export const CONSTELLATION_FAMILY: Family = {
  id: 'constellation',
  label: 'Constellation',
  blurb: 'algorithmic — nodes and edges, the assembl signature',
  ground: '#FBF7EE',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
  supportsBackground: true,
  supportsText: true,
};
