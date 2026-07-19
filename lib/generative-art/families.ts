export type FamilyId = 'line' | 'liquid' | 'chrome';

export interface SliderSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Return the display string for the current value. */
  format?: (value: number) => string;
}

export interface FamilyPreset {
  id: string;
  label: string;
  blurb: string;
  /** Sliders visible for this preset. Keys must exist in `defaults`. */
  sliders: SliderSpec[];
  /** Slider-value defaults; the slider key is the object key. */
  defaults: Record<string, number>;
}

export interface RendererProps {
  presetId: string;
  values: Record<string, number>;
  seed: number;
  ground?: string;
  /**
   * Called by the renderer to expose export functions to the host.
   * Line: png + svg. Chrome: png (canvas toDataURL). Liquid: png (the AI return).
   */
  onExportersReady?: (exporters: {
    png?: () => Promise<Blob | null> | Blob | null;
    svg?: () => string | null;
  }) => void;
}

export interface Family {
  id: FamilyId;
  label: string;
  blurb: string;
  ground: string;
  presets: FamilyPreset[];
  /**
   * Compose a fine-tuned Firefly/Flux prompt from the current family state so
   * the "Render at Firefly quality" button ships something well-shaped for the
   * family. Line → painterly render. Liquid → keeps photoreal. Chrome →
   * richer 3D render.
   */
  aiPrompt: (presetId: string, values: Record<string, number>, seed: number) => string;
  supportsPngDownload: boolean;
  supportsSvgDownload: boolean;
  /** True when the family's own renderer IS the AI call (Liquid). */
  isAiFirst: boolean;
}

export function getPreset(family: Family, id: string): FamilyPreset {
  return family.presets.find((p) => p.id === id) ?? family.presets[0];
}
