import { NextResponse } from 'next/server';
import { LINE_FAMILY } from '@/lib/generative-art/families/line';
import { LIQUID_FAMILY } from '@/lib/generative-art/families/liquid';
import { CHROME_FAMILY } from '@/lib/generative-art/families/chrome';
import type { Family } from '@/lib/generative-art/families';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FAMILIES: Record<string, Family> = {
  line: LINE_FAMILY,
  liquid: LIQUID_FAMILY,
  chrome: CHROME_FAMILY,
};

interface RenderPayload {
  family: string;
  presetId: string;
  values: Record<string, number>;
  seed: number;
}

/**
 * POST /api/creative-playground/render
 *   { family, presetId, values, seed }
 * Composes the family's editorial prompt and ships it to Fal Flux 1.1 Pro.
 * Fails softly with a JSON error (never a 500) so the client can render the
 * "connect FAL_API_KEY" empty state instead of a dev overlay.
 */
export async function POST(request: Request) {
  let payload: RenderPayload;
  try {
    payload = (await request.json()) as RenderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  const family = FAMILIES[payload.family];
  if (!family) {
    return NextResponse.json(
      { ok: false, error: `unknown family: ${payload.family}` },
      { status: 400 },
    );
  }
  const preset = family.presets.find((p) => p.id === payload.presetId);
  if (!preset) {
    return NextResponse.json(
      { ok: false, error: `unknown preset: ${payload.presetId}` },
      { status: 400 },
    );
  }

  const seed = Number.isFinite(payload.seed) ? Math.floor(payload.seed) : 8471;
  const values = payload.values ?? {};
  const prompt = family.aiPrompt(preset.id, values, seed);

  const key = process.env.FAL_API_KEY ?? process.env.FAL_KEY ?? '';
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error: 'FAL_API_KEY is not set on the server.',
        hint: 'Add FAL_API_KEY to Vercel env (Preview + Production) and redeploy — the render pass runs server-side, no client key.',
        prompt,
      },
      { status: 200 },
    );
  }

  try {
    const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_images: 1,
        seed,
        enable_safety_checker: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        {
          ok: false,
          error: `fal responded ${res.status}`,
          hint: body.slice(0, 400),
          prompt,
        },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      images?: Array<{ url: string; width?: number; height?: number }>;
      timings?: unknown;
    };
    const url = data.images?.[0]?.url;
    if (!url) {
      return NextResponse.json(
        { ok: false, error: 'fal returned no image', prompt },
        { status: 200 },
      );
    }
    return NextResponse.json({
      ok: true,
      imageUrl: url,
      prompt,
      cost_usd: 0.04,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'render failed';
    return NextResponse.json(
      { ok: false, error: message, prompt },
      { status: 200 },
    );
  }
}
