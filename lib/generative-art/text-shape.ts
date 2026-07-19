/**
 * Rasterise a phrase in the assembl font (Cormorant Garamond italic) to a
 * pixel mask so families can weave it into their compositions. Nodes cluster
 * on the mask (Constellation); the initial reaction-diffusion state is
 * seeded from it (Reaction).
 */

const ASSEMBL_FONT_STACK = "italic 500 {SIZE}px 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

let fontLoadedOnce = false;

async function ensureFontLoaded(): Promise<void> {
  if (fontLoadedOnce) return;
  const fonts = (globalThis as { document?: { fonts?: { load: (spec: string) => Promise<unknown> } } }).document?.fonts;
  if (fonts) {
    try {
      await fonts.load(ASSEMBL_FONT_STACK.replace('{SIZE}', '80'));
    } catch {
      // ignore — we'll fall back to the serif stack anyway
    }
  }
  fontLoadedOnce = true;
}

/**
 * Rasterise `text` into a boolean mask sized (w × h). `true` = pixel is
 * part of a letterform. Font size scales to fill ~72% of the shorter edge
 * so short and long phrases both read.
 */
export async function textToMask(text: string, w: number, h: number): Promise<Uint8Array> {
  const empty = new Uint8Array(w * h);
  if (!text.trim()) return empty;
  await ensureFontLoaded();

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return empty;

  const clean = text.trim();
  const targetHeight = Math.min(w, h) * 0.72;
  // Autosize width — measure at a candidate size, scale down until it fits.
  let size = targetHeight;
  ctx.font = ASSEMBL_FONT_STACK.replace('{SIZE}', String(size));
  let measured = ctx.measureText(clean).width;
  const maxWidth = w * 0.92;
  if (measured > maxWidth) {
    size = size * (maxWidth / measured);
    ctx.font = ASSEMBL_FONT_STACK.replace('{SIZE}', String(size));
    measured = ctx.measureText(clean).width;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';
  ctx.fillText(clean, w / 2, h / 2);

  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    // Any non-white pixel counts; anti-aliased edges included so the
    // mask has soft borders (nice for organic reaction-diffusion seeds).
    if (data[i] < 128) empty[j] = 1;
  }
  return empty;
}

/**
 * Sample N (x, y) points from a text mask. Uses simple rejection sampling
 * — good enough for a few hundred nodes and preserves letter proportions.
 */
export async function textToPoints(text: string, w: number, h: number, count: number): Promise<Array<[number, number]>> {
  const mask = await textToMask(text, w, h);
  const points: Array<[number, number]> = [];
  // Build a compact list of "on" indices once — much faster than repeatedly
  // rejection-sampling for sparse text on a big canvas.
  const onIndices: number[] = [];
  for (let i = 0; i < mask.length; i++) if (mask[i]) onIndices.push(i);
  if (onIndices.length === 0) return points;
  for (let n = 0; n < count; n++) {
    const idx = onIndices[Math.floor(Math.random() * onIndices.length)];
    const x = idx % w;
    const y = Math.floor(idx / w);
    // Slight per-node jitter so nodes don't stack on pixel-grid intersections.
    points.push([x + (Math.random() - 0.5) * 1.5, y + (Math.random() - 0.5) * 1.5]);
  }
  return points;
}
