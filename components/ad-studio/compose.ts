// Client-side ad composition — shared by the Ad Studio and the homepage
// brand playground so a campaign renders identically everywhere.

export type ComposableCampaign = {
  business: { name: string; slug: string; tagline: string; accent: string; ink: string; bg: string };
  headline: string;
  caption: string;
  image: string;
};

export function hexToRgba(hex: string, a: number): string {
  const m = hex.replace('#', '');
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw: number;
  let dh: number;
  if (ir > r) {
    dh = h;
    dw = h * ir;
  } else {
    dw = w;
    dh = w / ir;
  }
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Wrap `text` to `maxWidth`, returning the lines (font must be set first). */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Compose one on-brand ad: image cover, scrim, eyebrow, headline, caption, wordmark. */
export function composeAd(img: HTMLImageElement, w: number, h: number, c: ComposableCampaign): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  coverDraw(ctx, img, w, h);

  // Bottom scrim so text stays legible over any image.
  const grad = ctx.createLinearGradient(0, h * 0.34, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, hexToRgba(c.business.ink, 0.9));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const pad = Math.round(w * 0.07);
  const maxW = w - pad * 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Measure headline + caption, then stack them bottom-up above the wordmark.
  const headSize = Math.round(w * 0.062);
  const headLH = Math.round(headSize * 1.12);
  ctx.font = `500 ${headSize}px 'Cormorant Garamond', Georgia, serif`;
  const headLines = wrapLines(ctx, c.headline, maxW).slice(0, 3);

  const capSize = Math.round(w * 0.032);
  const capLH = Math.round(capSize * 1.32);
  ctx.font = `400 ${capSize}px 'Lato', system-ui, sans-serif`;
  const capLines = wrapLines(ctx, c.caption, maxW).slice(0, 3);

  const wordSize = Math.round(w * 0.03);
  const bottom = h - pad;
  const capBottom = bottom - Math.round(w * 0.05);
  const capTop = capBottom - (capLines.length - 1) * capLH;
  const headBottom = capTop - Math.round(w * 0.045);
  const headTop = headBottom - (headLines.length - 1) * headLH;

  // Eyebrow — business name.
  ctx.font = `500 ${Math.round(w * 0.024)}px 'Space Mono', ui-monospace, monospace`;
  ctx.fillStyle = c.business.accent;
  ctx.fillText(c.business.name.toUpperCase(), pad, headTop - Math.round(w * 0.04));

  // Headline.
  ctx.font = `500 ${headSize}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  headLines.forEach((ln, i) => ctx.fillText(ln, pad, headTop + i * headLH));

  // Caption.
  ctx.font = `400 ${capSize}px 'Lato', system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  capLines.forEach((ln, i) => ctx.fillText(ln, pad, capTop + i * capLH));

  // Wordmark.
  ctx.font = `600 ${wordSize}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = c.business.accent;
  ctx.globalAlpha = 0.96;
  ctx.fillText('assembl', pad, bottom);
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}

/** Load a campaign's base image ready for composition. */
export function loadCampaignImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}
