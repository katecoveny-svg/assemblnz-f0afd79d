/**
 * Renders an assembled agent (from the guided builder) into a shareable,
 * assembl-branded PNG card (portrait, 1080×1350). Same branded frame as the
 * homepage agent card so every asset that leaves the site carries the
 * wordmark + tagline.
 */

const CREAM = '#FBFAF6';
const DEEP = '#2e5a58';
const INK = '#263339';
const BODY = '#4a5b58';
const MUTED = '#8d9695';
const BRASS = '#b8964f';

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = word; }
    else line = test;
  }
  if (line) out.push(line);
  return out;
}

export interface BuildCardInput {
  name: string;
  jobLabel: string;
  knows: string[];
  does: string[];
  asks: string[];
}

export async function renderBuildCard(input: BuildCardInput): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  const PAD = 92;
  const contentW = W - PAD * 2;

  // Header
  ctx.fillStyle = DEEP;
  ctx.fillRect(0, 0, W, 190);
  ctx.fillStyle = CREAM;
  ctx.font = '600 52px Georgia, serif';
  ctx.fillText('assembl', PAD, 116);
  ctx.fillStyle = 'rgba(251,250,246,0.72)';
  ctx.font = '600 20px ui-monospace, Menlo, monospace';
  ctx.fillText('AN AGENT YOU ASSEMBLED · DRAFT', PAD, 150);

  let y = 190 + 96;

  // Name + job
  ctx.fillStyle = DEEP;
  ctx.font = '500 62px Georgia, serif';
  ctx.fillText(input.name || 'your agent', PAD, y);
  y += 44;
  ctx.fillStyle = BODY;
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillText(input.jobLabel ? `your ${input.jobLabel.toLowerCase()} agent` : 'your agent', PAD, y);
  y += 62;

  const footerTop = H - 150;

  const section = (title: string, items: string[]) => {
    if (y > footerTop - 80) return;
    ctx.fillStyle = MUTED;
    ctx.font = '700 22px ui-monospace, Menlo, monospace';
    ctx.fillText(title, PAD, y);
    y += 40;
    ctx.font = '400 27px system-ui, sans-serif';
    for (const item of items.length ? items : ['—']) {
      for (const [i, line] of wrapLine(ctx, item, contentW - 26).entries()) {
        if (y + 40 > footerTop) return;
        ctx.fillStyle = i === 0 ? BRASS : INK;
        if (i === 0) { ctx.fillText('—', PAD, y); }
        ctx.fillStyle = INK;
        ctx.fillText(line, PAD + 26, y);
        y += 40;
      }
      y += 6;
    }
    y += 22;
  };

  section('IT KNOWS', input.knows);
  section('IT CAN', input.does);
  section('IT ASKS YOU FIRST', input.asks);

  // Footer
  ctx.strokeStyle = 'rgba(38,51,57,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, footerTop);
  ctx.lineTo(W - PAD, footerTop);
  ctx.stroke();
  ctx.fillStyle = DEEP;
  ctx.font = '500 30px Georgia, serif';
  ctx.fillText('Mahi that earns its proof.', PAD, footerTop + 54);
  ctx.fillStyle = BRASS;
  ctx.font = '700 22px ui-monospace, Menlo, monospace';
  const url = 'assembl.co.nz';
  ctx.fillText(url, W - PAD - ctx.measureText(url).width, footerTop + 52);

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
