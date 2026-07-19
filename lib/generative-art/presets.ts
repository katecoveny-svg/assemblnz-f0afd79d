export type PresetId = 'bloom' | 'sunrise' | 'ocean' | 'whisper';

export interface PresetPalette {
  ground: string;
  stops: string[];
  fillAlphaScale: number;
  strokeAlphaScale: number;
}

export interface Preset {
  id: PresetId;
  label: string;
  blurb: string;
  shells: number;
  warp: number;
  hue: number;
  tint: number;
  alpha: number;
  stroke: number;
  noise: number;
  palette: PresetPalette;
}

export const WUBIMONKEY_BLOOM: Preset = {
  id: 'bloom',
  label: 'Wubimonkey Bloom',
  blurb: 'blue-teal shells stacked like tissue paper',
  shells: 28,
  warp: 0.78,
  hue: 200,
  tint: 0,
  alpha: 0.15,
  stroke: 1.15,
  noise: 1.5,
  palette: {
    ground: '#FDFCF9',
    stops: ['#0D3B48', '#1A5164', '#2C6E7E', '#4A8A99', '#79A6B2', '#B7CED5'],
    fillAlphaScale: 0.68,
    strokeAlphaScale: 1.15,
  },
};

export const PETAL_SUNRISE: Preset = {
  id: 'sunrise',
  label: 'Petal Sunrise',
  blurb: 'warm coral and terracotta at dawn',
  shells: 26,
  warp: 0.82,
  hue: 18,
  tint: 0.4,
  alpha: 0.13,
  stroke: 1.10,
  noise: 1.6,
  palette: {
    ground: '#FDF9F4',
    stops: ['#3D160C', '#5B2418', '#8F3A22', '#C7623D', '#E39274', '#F3C3AF'],
    fillAlphaScale: 0.75,
    strokeAlphaScale: 1.0,
  },
};

export const OCEAN_INTERFERENCE: Preset = {
  id: 'ocean',
  label: 'Ocean Interference',
  blurb: 'deeper teals with more layers',
  shells: 36,
  warp: 0.72,
  hue: 190,
  tint: -0.3,
  alpha: 0.13,
  stroke: 1.05,
  noise: 1.75,
  palette: {
    ground: '#F8FAFA',
    stops: ['#08222A', '#0E2E36', '#164856', '#1F677A', '#4A97A9', '#8AB9C4'],
    fillAlphaScale: 0.80,
    strokeAlphaScale: 1.05,
  },
};

export const WHISPER: Preset = {
  id: 'whisper',
  label: 'Whisper',
  blurb: 'paper-cream, near-monochrome, ultra-soft',
  shells: 20,
  warp: 0.50,
  hue: 30,
  tint: 0.5,
  alpha: 0.09,
  stroke: 0.95,
  noise: 1.15,
  palette: {
    ground: '#FBF7F0',
    stops: ['#3B2F22', '#5B4A38', '#8A7660', '#B39F87', '#D0C0AA', '#E8DECD'],
    fillAlphaScale: 0.65,
    strokeAlphaScale: 0.9,
  },
};

export const PRESETS: Record<PresetId, Preset> = {
  bloom: WUBIMONKEY_BLOOM,
  sunrise: PETAL_SUNRISE,
  ocean: OCEAN_INTERFERENCE,
  whisper: WHISPER,
};

export const PRESET_ORDER: PresetId[] = ['bloom', 'sunrise', 'ocean', 'whisper'];

export interface SketchParams {
  preset: PresetId;
  shells: number;
  warp: number;
  hue: number;
  tint: number;
  alpha: number;
  stroke: number;
  noise: number;
  seed: number;
}

export function defaultParams(preset: PresetId = 'bloom'): SketchParams {
  const p = PRESETS[preset];
  return {
    preset: p.id,
    shells: p.shells,
    warp: p.warp,
    hue: p.hue,
    tint: p.tint,
    alpha: p.alpha,
    stroke: p.stroke,
    noise: p.noise,
    seed: 8471,
  };
}
