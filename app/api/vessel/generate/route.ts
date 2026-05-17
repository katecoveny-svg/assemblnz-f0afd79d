import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import {
  checkPublicRateLimit,
  clientIp,
  rateLimitedResponse,
} from '@/lib/vessel/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'vessel-generations';

/**
 * Download a Fal.ai-hosted image and re-upload it to the
 * `vessel-generations` Supabase Storage bucket so the public share link
 * survives Fal's CDN expiry. Returns the bucket public URL on success.
 * Throws on any fetch / upload error so the caller can record
 * `mirror_failed=true` and fall back to the Fal URL.
 */
async function mirrorToStorage(
  service: ReturnType<typeof getServiceClient>,
  generationId: string,
  remoteUrl: string,
): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) {
    throw new Error(`Fetching Fal image failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const ext = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
      ? 'webp'
      : 'jpg';
  const bytes = await res.arrayBuffer();
  const path = `gen/${generationId}.${ext}`;
  const { error } = await service.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  const { data } = service.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Supabase Storage returned no public URL.');
  }
  return data.publicUrl;
}

type GenerateBody = {
  brandSlug?: string;
  brandName?: string;
  brandColor?: string;
  logoUrl?: string;
  prompt?: string;
  byok?: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function safeBrandColor(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#2B6B57';
}

/**
 * The locked vessel aesthetic. Brand parameters are baked in here so a
 * visitor can only supply the subject, never override the form.
 *
 * Watermark is only added when not BYOK — BYOK callers paid for the call,
 * they get a clean image.
 */
function buildPrompt(args: {
  brandName: string;
  brandColor: string;
  userPrompt: string;
  byok: boolean;
}): string {
  const watermark = args.byok
    ? ''
    : ', "assembl.co.nz" watermark text in bottom right corner';
  return [
    `ceramic still-life vessel in ${args.brandColor},`,
    'cast from inside vessel mouth,',
    'A4 paper backdrop in soft warm cream',
    `(#FAF7F2), ${args.brandName} subtly visible on vessel surface,`,
    args.userPrompt + ',',
    'soft natural light, editorial fine-art photography',
    watermark,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as GenerateBody;
  const brandSlug = cleanString(body.brandSlug);
  const brandName = cleanString(body.brandName) || 'assembl';
  const brandColor = safeBrandColor(cleanString(body.brandColor));
  const userPrompt = cleanString(body.prompt);
  const byokKey = cleanString(body.byok);
  const byok = byokKey.length > 0;

  if (!userPrompt) {
    return json({ error: 'A prompt is required.' }, 400);
  }
  if (userPrompt.length > 600) {
    return json({ error: 'Prompt must be under 600 characters.' }, 400);
  }

  // Rate limit only for non-BYOK calls. BYOK pays its own way.
  const ip = clientIp(req.headers);
  if (!byok) {
    const verdict = await checkPublicRateLimit(ip);
    if (!verdict.allowed) return rateLimitedResponse(verdict);
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const sharedSecret = process.env.VESSEL_STUDIO_SHARED_SECRET;
  const platformFalKey = process.env.FAL_API_KEY;

  if (!supabaseUrl) {
    return json({ error: 'Vessel generator is not configured.' }, 500);
  }

  const prompt = buildPrompt({ brandName, brandColor, userPrompt, byok });

  // Pre-allocate so the storage path `gen/<uuid>.<ext>` is deterministic
  // and the eventual DB row id matches the storage path.
  const generationId = crypto.randomUUID();

  // Two call paths:
  //   - BYOK: hit Fal.ai directly with the visitor's key so the platform
  //     key never sees their prompt and we don't bill platform Fal.
  //   - Platform: go through the vessel-generate edge function so the
  //     shared secret + platform key stay server-side.
  let imageUrl = '';
  let costEstimateUsd = 0;

  if (byok) {
    const falRes = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${byokKey}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: 'portrait_4_5',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'jpeg',
      }),
    });
    if (!falRes.ok) {
      const text = await falRes.text().catch(() => '');
      return json(
        { error: `Fal.ai (BYOK) returned ${falRes.status}: ${text.slice(0, 300)}` },
        502,
      );
    }
    const data = await falRes.json();
    imageUrl =
      Array.isArray(data?.images) && typeof data.images[0]?.url === 'string'
        ? data.images[0].url
        : '';
    costEstimateUsd = 0; // visitor's account, not ours
  } else {
    if (!sharedSecret || !platformFalKey) {
      return json(
        { error: 'Platform vessel generation is not configured on this deployment.' },
        500,
      );
    }
    const edgeRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/vessel-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharedSecret}`,
        Origin: 'https://www.assembl.co.nz',
      },
      body: JSON.stringify({
        model: 'flux',
        prompt,
        aspect_ratio: '4:5',
        variants: 1,
        image_prompt_strength: 0.35,
      }),
    });
    if (!edgeRes.ok) {
      const text = await edgeRes.text().catch(() => '');
      return json(
        { error: `Vessel edge function returned ${edgeRes.status}: ${text.slice(0, 300)}` },
        502,
      );
    }
    const data = await edgeRes.json();
    imageUrl =
      Array.isArray(data?.images) && typeof data.images[0]?.url === 'string'
        ? data.images[0].url
        : '';
    costEstimateUsd =
      typeof data?.cost_estimate_usd === 'number' ? data.cost_estimate_usd : 0.04;
  }

  if (!imageUrl) {
    return json({ error: 'Image provider returned no image.' }, 502);
  }

  const falImageUrl = imageUrl;
  let mirrorFailed = false;

  // Mirror the Fal image into Supabase Storage so the share link survives
  // Fal CDN expiry. If the mirror fails, fall back to the Fal URL and flag
  // the row so a future retry cron can pick it up.
  const service = getServiceClient();
  try {
    imageUrl = await mirrorToStorage(service, generationId, falImageUrl);
  } catch (err) {
    mirrorFailed = true;
    imageUrl = falImageUrl;
    console.error('[vessel/generate] mirror upload failed', {
      generationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Log the generation. Best-effort — the visitor's image returns either way.
  try {
    const verdict = byok
      ? { ipHash: null as string | null }
      : await checkPublicRateLimit(ip);
    await service.from('vessel_generations').insert({
      id: generationId,
      brand_slug: brandSlug || null,
      brand_name: brandName,
      brand_color: brandColor,
      prompt: userPrompt,
      image_url: imageUrl,
      cost_estimate_usd: costEstimateUsd,
      byok,
      ip_hash: byok ? null : verdict.ipHash,
      user_agent: req.headers.get('user-agent')?.slice(0, 240) ?? null,
      mirror_failed: mirrorFailed,
    });
  } catch (err) {
    console.error('[vessel/generate] persistence failed', {
      generationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return json({
    generationId,
    imageUrl,
    brandName,
    brandColor,
    byok,
  });
}
