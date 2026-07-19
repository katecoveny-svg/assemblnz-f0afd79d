import type { Family, FamilyPreset } from '../families';

const SLIDERS = [
  { key: 'ior', label: 'ior', min: 1.0, max: 2.4, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'roughness', label: 'roughness', min: 0, max: 1, step: 0.01, format: (v: number) => v.toFixed(2) },
  { key: 'dispersion', label: 'dispersion', min: 0, max: 0.2, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'spin', label: 'spin', min: 0, max: 2, step: 0.05, format: (v: number) => `${v.toFixed(2)}×` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'torus',
    label: 'Iridescent Torus',
    blurb: 'chrome torus with dispersion · Vision-Pro register',
    sliders: SLIDERS,
    defaults: { ior: 1.5, roughness: 0.05, dispersion: 0.06, spin: 0.5 },
  },
  {
    id: 'frost',
    label: 'Frosted Sphere',
    blurb: 'matte frosted glass, soft cast light',
    sliders: SLIDERS,
    defaults: { ior: 1.45, roughness: 0.55, dispersion: 0.01, spin: 0.35 },
  },
  {
    id: 'mercury',
    label: 'Liquid Metal',
    blurb: 'mercury blob, subsurface highlights',
    sliders: SLIDERS,
    defaults: { ior: 1.8, roughness: 0.02, dispersion: 0.08, spin: 0.7 },
  },
];

export const CHROME_FAMILY: Family = {
  id: 'chrome',
  label: 'Chrome',
  blurb: 'real-time 3D — glass and metal in your browser',
  ground: '#EBECED',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  isAiFirst: false,
  aiPrompt: (presetId, v) => {
    const label: Record<string, string> = {
      torus: 'iridescent chrome torus, physically-based glass with chromatic dispersion',
      frost: 'matte frosted glass sphere, cast soft light through translucency',
      mercury: 'mercury-like liquid metal blob with subsurface highlights',
    };
    const rough = v.roughness < 0.15 ? 'mirror-polished' : v.roughness < 0.5 ? 'slightly hazed' : 'frosted matte';
    const dispersion = v.dispersion > 0.05 ? 'strong chromatic aberration at the edges' : 'subtle prism dispersion';
    return `${label[presetId] ?? label.torus}, ${rough}, ${dispersion}, editorial studio product photography, greyscale neutral background with soft radial gradient, Apple Vision Pro register, 8k detail, no text, no logo, no watermark, aspect ratio 1:1`;
  },
};
