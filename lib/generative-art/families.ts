export type FamilyId = 'line' | 'chrome' | 'flow' | 'constellation' | 'grid' | 'waves';

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
   *   png — a rendered image
   *   svg — SVG source (Line only)
   *   code — a self-contained HTML+JS snippet that reproduces the current
   *          state (the "download as code" export)
   */
  onExportersReady?: (exporters: {
    png?: () => Promise<Blob | null> | Blob | null;
    svg?: () => string | null;
    code?: () => string | null;
    /**
     * Render at any pixel size, returning a fresh PNG blob with the
     * watermark already stamped. Line + Chrome re-run their generators at
     * the exact size; Flow falls back to a letterboxed scale of the
     * current sim because the trails ARE the current sim.
     */
    renderAtSize?: (width: number, height: number) => Promise<Blob | null>;
  }) => void;
}

export interface Family {
  id: FamilyId;
  label: string;
  blurb: string;
  ground: string;
  presets: FamilyPreset[];
  supportsPngDownload: boolean;
  supportsSvgDownload: boolean;
  supportsCodeDownload: boolean;
}

export function getPreset(family: Family, id: string): FamilyPreset {
  return family.presets.find((p) => p.id === id) ?? family.presets[0];
}
