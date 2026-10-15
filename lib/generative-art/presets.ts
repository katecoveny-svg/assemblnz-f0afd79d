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
  blurb: 'plum and rose shells stacked like tissue paper',
  shells: 28,
  warp: 0.78,
  hue: 200,
  tint: 0,
  alpha: 0.15,
  stroke: 1.15,
  noise: 1.5,
  palette: {
    ground: '#FDFCF9',
    stops: ['#472A3C', '#5C404E', '#765B67', '#907780', '#AA989E', '#D1C6C9'],
    fillAlphaScale: 0.68,
    strokeAlphaScale: 1.15,
  },
};

export const PETAL_SUNRISE: Preset = {
  id: 'sunrise',
  label: 'Petal Sunrise',
  blurb: 'dusty rose and muted plum at first light',
  shells: 26,
  warp: 0.82,
  hue: 18,
  tint: 0.4,
  alpha: 0.13,
  stroke: 1.10,
  noise: 1.6,
  palette: {
    ground: '#FDF9F4',
    stops: ['#47293A', '#543544', '#6F4D58', '#987A80', '#BBA2A5', '#D9CBCC'],
    fillAlphaScale: 0.75,
    strokeAlphaScale: 1.0,
  },
};

export const OCEAN_INTERFERENCE: Preset = {
  id: 'ocean',
  label: 'Tide Interference',
  blurb: 'deeper plum with more layers',
  shells: 36,
  warp: 0.72,
  hue: 190,
  tint: -0.3,
  alpha: 0.13,
  stroke: 1.05,
  noise: 1.75,
  palette: {
    ground: '#FCF9F7',
    stops: ['#371B2E', '#3A1E31', '#533747', '#705460', '#9C838A', '#BBABAF'],
    fillAlphaScale: 0.80,
    strokeAlphaScale: 1.05,
  },
};

export const WHISPER: Preset = {
  id: 'whisper',
  label: 'Whisper',
  blurb: 'paper and chalk, near-monochrome, ultra-soft',
  shells: 20,
  warp: 0.50,
  hue: 30,
  tint: 0.5,
  alpha: 0.09,
  stroke: 0.95,
  noise: 1.15,
  palette: {
    ground: '#FAF6F4',
    stops: ['#41283A', '#5D4554', '#88737D', '#AE9DA3', '#CBBFC2', '#E5DDDD'],
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
