export type AspectRatio = '16:9' | '4:5' | '1:1' | '9:16';

export type MotionToken =
  | 'slow gentle rotation'
  | 'slow drift'
  | 'gentle sway'
  | 'falling cloth'
  | 'still';

export type LightingToken =
  | 'soft natural light'
  | 'morning sun through linen'
  | 'overcast diffuse'
  | 'candle warmth'
  | 'studio rake light'
  | 'late afternoon gold';

export type Model = 'flux' | 'openai';

export type Studio = 'vessel' | 'image';

export interface KeteOption {
  id: string;
  name: string;
  label: string;
  pillar: string;
  grammar: string;
  tonalSignature: string;
  accent?: string;
  custom?: boolean;
  portrait?: boolean;
  defaultAspectRatio?: AspectRatio;
  defaultMotion?: MotionToken;
  flagNegatives?: string[];
}

export interface ReferenceImage {
  dataUrl: string;
  filename: string;
  sizeBytes: number;
}

export interface VesselStudioState {
  kete: string;
  ar: AspectRatio;
  motion: MotionToken;
  lighting: LightingToken;
  sref: string;
  variants: number;
  customMaterial: string;
  customForm: string;
  customPalette: string;
  reference: ReferenceImage | null;
  imagePromptStrength: number;
}

export interface SocialSize {
  group: string;
  name: string;
  w: number;
  h: number;
}

export interface SizeExportRecord {
  size_label: string;
  exported_at: string;
  focal_point: { x: number; y: number };
}

export interface VesselGeneration {
  id: string;
  user_id?: string;
  studio: Studio;
  preset_key: string;
  preset_label: string;
  prompt_full: string;
  prompt_to_provider: string;
  aspect_ratio: AspectRatio;
  variants: number;
  model: Model;
  reference_image_url: string | null;
  anchor_strength: number | null;
  image_urls: string[];
  size_exports: SizeExportRecord[];
  cost_usd: number;
  generated_at: string;
}

export interface GenerateRequestPayload {
  model: Model;
  prompt: string;
  aspect_ratio: AspectRatio;
  variants: number;
  sref?: string;
  image_url?: string;
  image_prompt_strength?: number;
}

export interface GenerateResponsePayload {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  model: Model;
  cost_estimate_usd: number;
  generated_at: string;
}
