/**
 * assembl watermark proxy for Auaha-generated images.
 *
 * GET ?src=<fal image url> → fetches the Fal-hosted image, composites the
 * assembl wordmark + canary pill-dash into the bottom-right, and returns it.
 * This is the asset the user sees inline and downloads, so every shared image
 * carries the mark (assembl pays for the model call).
 *
 * SSRF guard: `src` MUST be a Fal CDN host. The proxy refuses anything else, so
 * it can't be turned into an open image fetcher.
 */
import sharp from 'sharp';

export const maxDuration = 30;

const ALLOWED_HOST = /(^|\.)fal\.(media|run|ai)$/i;

function isAllowed(src: string): boolean {
  try {
    const u = new URL(src);
    return u.protocol === 'https:' && ALLOWED_HOST.test(u.hostname);
  } catch {
    return false;
  }
}

/** Brand mark: charcoal plate + lowercase "assembl" wordmark + canary pill-dash. */
function watermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(16, Math.round(height * 0.03));
  const padX = Math.round(width * 0.022);
  const wordW = Math.round(fontSize * 0.52 * 7); // ~7 glyphs of "assembl"
  const pillW = Math.round(fontSize * 0.66);
  const pillH = Math.max(4, Math.round(fontSize * 0.22));
  const gap = Math.round(fontSize * 0.34);
  const plateW = wordW + gap + pillW + padX * 2;
  const plateH = Math.round(fontSize * 1.9);
  const plateX = width - plateW - Math.round(width * 0.018);
  const plateY = height - plateH - Math.round(height * 0.018);
  const textY = plateY + plateH / 2 + fontSize * 0.34;
  const textX = plateX + padX;
  const pillX = textX + wordW + gap;
  const pillY = textY - pillH;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="${Math.round(plateH * 0.32)}"
      fill="#3A3832" fill-opacity="0.55"/>
    <text x="${textX}" y="${textY}"
      font-family="'Cormorant Garamond','Georgia',serif"
      font-size="${fontSize}" font-weight="600" letter-spacing="-0.01em"
      fill="#FFF7EC" fill-opacity="0.96">assembl</text>
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${Math.round(pillH / 2)}" fill="#BFA37A"/>
  </svg>`;
  return Buffer.from(svg);
}

export async function GET(req: Request): Promise<Response> {
  const src = new URL(req.url).searchParams.get('src');
  if (!src) return new Response('Missing src', { status: 400 });
  if (!isAllowed(src)) return new Response('Source not allowed', { status: 403 });

  let upstream: Response;
  try {
    upstream = await fetch(src);
  } catch {
    return new Response('Upstream fetch failed', { status: 502 });
  }
  if (!upstream.ok) return new Response('Upstream error', { status: 502 });

  try {
    const input = Buffer.from(await upstream.arrayBuffer());
    const image = sharp(input);
    const meta = await image.metadata();
    const width = meta.width ?? 1024;
    const height = meta.height ?? 1024;
    const out = await image
      .composite([{ input: watermarkSvg(width, height), top: 0, left: 0 }])
      .png()
      .toBuffer();

    return new Response(out as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Content-Disposition': 'inline; filename="assembl-image.png"',
      },
    });
  } catch {
    return new Response('Watermark failed', { status: 500 });
  }
}
