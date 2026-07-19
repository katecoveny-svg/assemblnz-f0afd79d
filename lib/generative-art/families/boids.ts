import type { Family, FamilyPreset } from '../families';

export interface BoidsPalette {
  ground: string;
  body: string;
  trail: string;
}

export const BOIDS_PALETTES: Record<string, BoidsPalette> = {
  murmuration: { ground: '#F6F3EB', body: '#231F1B', trail: '#5B5049' },
  fish:        { ground: '#E9EFF2', body: '#1F5A6E', trail: '#3C7FA0' },
  wanderer:    { ground: '#F5EFDE', body: '#8F3A22', trail: '#C7623D' },
  corvid:      { ground: '#141821', body: '#F5F1E8', trail: '#8A93A0' },
  plankton:    { ground: '#0D1119', body: '#3EE7B3', trail: '#4C8BE0' },
};

const SLIDERS = [
  { key: 'count',       label: 'flock',      min: 40,  max: 800, step: 5,   format: (v: number) => String(Math.round(v)) },
  { key: 'separation',  label: 'separation', min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'alignment',   label: 'alignment',  min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'cohesion',    label: 'cohesion',   min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'vision',      label: 'vision',     min: 20,  max: 140, step: 1,   format: (v: number) => `${Math.round(v)}px` },
  { key: 'speed',       label: 'speed',      min: 0.4, max: 3.5, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'trail',       label: 'trail',      min: 0,   max: 0.3, step: 0.005, format: (v: number) => v.toFixed(3) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'murmuration', label: 'Murmuration', blurb: 'starlings at dusk on paper', sliders: SLIDERS,
    defaults: { count: 480, separation: 1.4, alignment: 1.1, cohesion: 0.95, vision: 42, speed: 1.5, trail: 0.04 } },
  { id: 'fish',        label: 'Fish School', blurb: 'silver school in shallow blue', sliders: SLIDERS,
    defaults: { count: 260, separation: 1.2, alignment: 1.5, cohesion: 0.8,  vision: 60, speed: 1.4, trail: 0.03 } },
  { id: 'wanderer',    label: 'Wanderers',   blurb: 'sparse warm agents drifting', sliders: SLIDERS,
    defaults: { count: 90,  separation: 1.6, alignment: 0.5, cohesion: 0.3,  vision: 100, speed: 1.1, trail: 0.02 } },
  { id: 'corvid',      label: 'Corvid',      blurb: 'crows against night sky', sliders: SLIDERS,
    defaults: { count: 220, separation: 1.5, alignment: 1.2, cohesion: 1.0,  vision: 55, speed: 1.6, trail: 0.06 } },
  { id: 'plankton',    label: 'Plankton',    blurb: 'phosphorescent motes in dark water', sliders: SLIDERS,
    defaults: { count: 600, separation: 1.0, alignment: 1.3, cohesion: 1.1,  vision: 34, speed: 1.2, trail: 0.08 } },
];

export const BOIDS_FAMILY: Family = {
  id: 'boids',
  label: 'Boids',
  blurb: 'physics — flocking via separation / alignment / cohesion',
  ground: '#F6F3EB',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
