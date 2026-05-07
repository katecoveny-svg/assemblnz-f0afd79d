import {
  FAL_AR_MAP,
  PRICE_REDUX,
  PRICE_TEXT,
  reduxAspectFor,
} from './keteOptions';
import type {
  AspectRatio,
  GenerateRequestPayload,
  GenerateResponsePayload,
  Model,
  VesselStudioState,
} from './types';

export type GenerateMode = 'text' | 'redux';

export interface GenerateInput {
  state: VesselStudioState;
  promptForProvider: string;
  model: Model;
}

export interface GenerateResult {
  images: Array<{ url: string; width: number; height: number }>;
  mode: GenerateMode;
  cost_usd: number;
  generated_at: string;
  via: 'edge-function' | 'browser-fallback';
}

const SHARED_SECRET_ENV = process.env.NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET;
const SUPABASE_URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function hasEdgeFunctionConfig(): boolean {
  return !!(SHARED_SECRET_ENV && SUPABASE_URL_ENV);
}

// Primary path: call the assembl-prod Supabase Edge Function `vessel-generate`,
// which proxies to Fal.ai and (when configured) OpenAI. Server-side credentials
// stay server-side; this client only carries the shared secret bound to the
// in-app studios.
async function generateViaEdge(input: GenerateInput): Promise<GenerateResult> {
  if (!SUPABASE_URL_ENV || !SHARED_SECRET_ENV) {
    throw new Error('edge function not configured');
  }
  const useRedux = !!input.state.reference?.dataUrl;
  const payload: GenerateRequestPayload = {
    model: input.model,
    prompt: input.promptForProvider,
    aspect_ratio: input.state.ar,
    variants: input.state.variants,
    sref: input.state.sref.trim() || undefined,
    image_url: useRedux ? input.state.reference!.dataUrl : undefined,
    image_prompt_strength: useRedux ? input.state.imagePromptStrength : undefined,
  };

  const url = `${SUPABASE_URL_ENV.replace(/\/$/, '')}/functions/v1/vessel-generate`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SHARED_SECRET_ENV}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}) as { error?: string });
    const detail =
      errBody.error || `${resp.status} ${resp.statusText}`;
    throw new Error(detail.toString().slice(0, 280));
  }

  const data: GenerateResponsePayload = await resp.json();
  return {
    images: data.images.map((img) => ({
      url: img.url,
      width: img.width,
      height: img.height,
    })),
    mode: useRedux ? 'redux' : 'text',
    cost_usd: data.cost_estimate_usd,
    generated_at: data.generated_at,
    via: 'edge-function',
  };
}

// Fallback path used when NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET is not set.
// Calls Fal directly from the browser using the user-supplied API key — same
// behaviour as the standalone vessel-studio.html.
async function generateViaBrowser(
  input: GenerateInput,
  falKey: string
): Promise<GenerateResult> {
  const useRedux = !!input.state.reference?.dataUrl;
  const endpoint = useRedux
    ? 'https://fal.run/fal-ai/flux-pro/v1.1-ultra/redux'
    : 'https://fal.run/fal-ai/flux-pro/v1.1';

  const body: Record<string, unknown> = useRedux
    ? {
        prompt: input.promptForProvider,
        image_url: input.state.reference!.dataUrl,
        image_prompt_strength: input.state.imagePromptStrength,
        aspect_ratio: reduxAspectFor(input.state.ar),
        num_images: input.state.variants,
        enable_safety_checker: true,
        output_format: 'jpeg',
      }
    : {
        prompt: input.promptForProvider,
        image_size: FAL_AR_MAP[input.state.ar] || 'square_hd',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: input.state.variants,
        enable_safety_checker: true,
        output_format: 'jpeg',
      };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    let detail = `${resp.status} ${resp.statusText}`;
    try {
      const errBody = await resp.json();
      const m = errBody?.detail || errBody?.message || errBody?.error;
      if (m) detail = typeof m === 'string' ? m : JSON.stringify(m);
    } catch {
      // ignore
    }
    if (useRedux && /image_url|too large|payload|413|request entity/i.test(detail)) {
      detail = `${detail} — try a smaller reference image (under ~5 MB)`;
    }
    throw new Error(detail.slice(0, 280));
  }

  const data = await resp.json();
  const rawImages = Array.isArray(data?.images) ? data.images : [];
  if (rawImages.length === 0) throw new Error('no images returned');
  const cost = rawImages.length * (useRedux ? PRICE_REDUX : PRICE_TEXT);

  return {
    images: rawImages
      .map((img: { url?: string; width?: number; height?: number }) => ({
        url: img.url ?? '',
        width: img.width ?? 0,
        height: img.height ?? 0,
      }))
      .filter((img: { url: string }) => img.url.length > 0),
    mode: useRedux ? 'redux' : 'text',
    cost_usd: cost,
    generated_at: new Date().toISOString(),
    via: 'browser-fallback',
  };
}

export async function generateImages(
  input: GenerateInput,
  fallbackKey: string | null
): Promise<GenerateResult> {
  if (hasEdgeFunctionConfig()) {
    return generateViaEdge(input);
  }
  if (!fallbackKey) {
    throw new Error(
      'edge function not configured and no fal.ai key set — paste a key first'
    );
  }
  return generateViaBrowser(input, fallbackKey);
}

export function priceFor(mode: GenerateMode, n: number): number {
  return n * (mode === 'redux' ? PRICE_REDUX : PRICE_TEXT);
}

export function aspectFromState(state: VesselStudioState): AspectRatio {
  return state.ar;
}
