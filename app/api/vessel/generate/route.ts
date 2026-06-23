import { NextRequest } from 'next/server';
import sharp from 'sharp';
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
 * Composite a small `assembl.co.nz` text mark onto the bottom-right of a
 * generated image. Replaces the unreliable Fal-prompt-based watermark
 * (Fal Flux often garbles requested text). Output stays the same encoding
 * as the input: jpeg → jpeg, png → png, webp → webp.
 *
 * Applied to every generation — assembl pays for the model call, so every
 * shared image carries the assembl.co.nz mark.
 */
async function applyWatermark(
  bytes: ArrayBuffer,
  contentType: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const input = Buffer.from(bytes);
  const image = sharp(input);
  const meta = await image.metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  // Scale the watermark to the image: ~3.2% of the height for the text
  // baseline, padded 2.4% from the edges. Pounamu green at 88% opacity
  // for legibility on the cream backgrounds we generate.
  const fontSize = Math.max(14, Math.round(height * 0.032));
  const padX = Math.round(width * 0.024);
  const padY = Math.round(height * 0.024);
  const text = 'assembl.co.nz';

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="${width - padX}" y="${height - padY}"
      text-anchor="end"
      font-family="'Helvetica Neue', Arial, sans-serif"
      font-size="${fontSize}"
      font-weight="500"
      fill="#3A3832"
      fill-opacity="0.88"
      letter-spacing="0.04em">${text}</text>
  </svg>`;

  let composited = image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);

  // Re-encode in the same format as the source so downstream MIME and the
  // storage path extension stay consistent.
  let outBytes: Buffer;
  let outType = contentType;
  if (contentType.includes('png')) {
    outBytes = await composited.png({ quality: 92 }).toBuffer();
    outType = 'image/png';
  } else if (contentType.includes('webp')) {
    outBytes = await composited.webp({ quality: 88 }).toBuffer();
    outType = 'image/webp';
  } else {
    outBytes = await composited.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    outType = 'image/jpeg';
  }

  return { bytes: outBytes, contentType: outType };
}

/**
 * Download a Fal.ai-hosted image and re-upload it to the
 * `vessel-generations` Supabase Storage bucket so the public share link
 * survives Fal's CDN expiry. Applies the server-side assembl watermark to
 * every image. Returns the bucket public URL on success.
 * Throws on any fetch / upload / watermark error so the caller can
 * record `mirror_failed=true` and fall back to the Fal URL.
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
  let contentType = res.headers.get('content-type') ?? 'image/jpeg';
  let bytes: ArrayBuffer | Buffer = await res.arrayBuffer();

  const watermarked = await applyWatermark(bytes, contentType);
  bytes = watermarked.bytes;
  contentType = watermarked.contentType;

  const ext = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
      ? 'webp'
      : 'jpg';
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
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#3A3832';
}

/**
 * The locked vessel aesthetic. Brand parameters are baked in here so a
 * visitor can only supply the subject, never override the form.
 *
 * Watermark is no longer requested from Fal — it's composited server-side
 * in `applyWatermark` after generation. Fal Flux was unreliable at
 * rendering specific text and frequently produced garbled marks.
 */
function buildPrompt(args: {
  brandName: string;
  brandColor: string;
  userPrompt: string;
}): string {
  return [
    `ceramic still-life vessel in ${args.brandColor},`,
    'cast from inside vessel mouth,',
    'A4 paper backdrop in soft warm cream',
    `(#FFF7EC), ${args.brandName} subtly visible on vessel surface,`,
    args.userPrompt + ',',
    'soft natural light, editorial fine-art photography',
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

  if (!userPrompt) {
    return json({ error: 'A prompt is required.' }, 400);
  }
  if (userPrompt.length > 600) {
    return json({ error: 'Prompt must be under 600 characters.' }, 400);
  }

  // assembl covers every generation, so every call is rate-limited.
  const ip = clientIp(req.headers);
  const verdict = await checkPublicRateLimit(ip);
  if (!verdict.allowed) return rateLimitedResponse(verdict);

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const sharedSecret = process.env.VESSEL_STUDIO_SHARED_SECRET;

  if (!supabaseUrl) {
    return json({ error: 'Vessel generator is not configured.' }, 500);
  }

  const prompt = buildPrompt({ brandName, brandColor, userPrompt });

  // Pre-allocate so the storage path `gen/<uuid>.<ext>` is deterministic
  // and the eventual DB row id matches the storage path.
  const generationId = crypto.randomUUID();

  // All generations go through the vessel-generate edge function so the
  // shared secret + platform FAL_API_KEY stay server-side. assembl pays for
  // the call — there is no bring-your-own-key path.
  let imageUrl = '';
  let costEstimateUsd = 0;

  if (!sharedSecret) {
    return json(
      { error: 'Vessel generation is not configured on this deployment.' },
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
    await service.from('vessel_generations').insert({
      id: generationId,
      brand_slug: brandSlug || null,
      brand_name: brandName,
      brand_color: brandColor,
      prompt: userPrompt,
      image_url: imageUrl,
      cost_estimate_usd: costEstimateUsd,
      byok: false,
      ip_hash: verdict.ipHash,
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
  });
}
