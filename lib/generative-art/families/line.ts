import type { Family, FamilyPreset } from '../families';

const SLIDERS = [
  { key: 'shells', label: 'shells', min: 5, max: 40, step: 1, format: (v: number) => String(Math.round(v)) },
  { key: 'warp', label: 'warp', min: 0, max: 1, step: 0.01, format: (v: number) => v.toFixed(2) },
  { key: 'alpha', label: 'alpha', min: 0.03, max: 0.22, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'stroke', label: 'stroke', min: 0.5, max: 2.5, step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
  { key: 'noise', label: 'noise', min: 0.5, max: 3, step: 0.05, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'bloom',
    label: 'Wubimonkey Bloom',
    blurb: 'blue-teal shells stacked like tissue paper',
    sliders: SLIDERS,
    defaults: { shells: 28, warp: 0.78, alpha: 0.15, stroke: 1.15, noise: 1.5 },
  },
  {
    id: 'sunrise',
    label: 'Petal Sunrise',
    blurb: 'warm coral and terracotta at dawn',
    sliders: SLIDERS,
    defaults: { shells: 26, warp: 0.82, alpha: 0.13, stroke: 1.10, noise: 1.6 },
  },
  {
    id: 'ocean',
    label: 'Ocean Interference',
    blurb: 'deeper teals with more layers',
    sliders: SLIDERS,
    defaults: { shells: 36, warp: 0.72, alpha: 0.13, stroke: 1.05, noise: 1.75 },
  },
  {
    id: 'whisper',
    label: 'Whisper',
    blurb: 'paper-cream, near-monochrome, ultra-soft',
    sliders: SLIDERS,
    defaults: { shells: 20, warp: 0.50, alpha: 0.09, stroke: 0.95, noise: 1.15 },
  },
];

export const LINE_FAMILY: Family = {
  id: 'line',
  label: 'Line',
  blurb: 'algorithmic — every pixel runs in your browser',
  ground: '#FDFCF9',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: true,
  supportsCodeDownload: true,
};
