/**
 * Renders the front-door agent's answer into a shareable, assembl-branded
 * PNG card (portrait, 1080×1350). Used by the homepage agent's download +
 * share actions so every asset that leaves the site carries the wordmark.
 *
 * Self-contained canvas 2D — no external fonts (system serif/sans keep it
 * reliable across browsers); brand comes from the palette, wordmark and the
 * fixed tagline.
 */

const CREAM = '#FBFAF6';
const DEEP = '#2e5a58';
const INK = '#263339';
const BODY = '#4a5b58';
const MUTED = '#8d9695';
const BRASS = '#b8964f';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export interface AgentCardInput {
  agentName: string;
  role: string;
  business: string;
  answer: string;
}

export async function renderAgentCard(input: AgentCardInput): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Ground
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  const PAD = 92;
  const contentW = W - PAD * 2;

  // Header band
  ctx.fillStyle = DEEP;
  ctx.fillRect(0, 0, W, 190);
  ctx.fillStyle = CREAM;
  ctx.font = '600 52px Georgia, "Times New Roman", serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('assembl', PAD, 116);
  ctx.fillStyle = 'rgba(251,250,246,0.72)';
  ctx.font = '600 20px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillText('YOUR FIRST AGENT · DRAFT', PAD, 150);

  let y = 190 + 80;

  // Eyebrow — the business, in their words
  ctx.fillStyle = MUTED;
  ctx.font = '700 22px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillText('THE BUSINESS', PAD, y);
  y += 44;
  ctx.fillStyle = INK;
  ctx.font = '400 30px Georgia, serif';
  const bizLines = wrap(ctx, input.business.trim(), contentW).slice(0, 3);
  for (const line of bizLines) { ctx.fillText(line, PAD, y); y += 42; }

  y += 34;

  // Agent identity
  ctx.fillStyle = DEEP;
  ctx.font = '500 46px Georgia, serif';
  ctx.fillText(input.agentName, PAD, y);
  y += 40;
  ctx.fillStyle = BODY;
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillText(input.role, PAD, y);
  y += 56;

  // Divider
  ctx.strokeStyle = 'rgba(38,51,57,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 56;

  // The answer — fit as much as cleanly fits above the footer
  ctx.fillStyle = INK;
  ctx.font = '400 29px system-ui, sans-serif';
  const footerTop = H - 150;
  const lineH = 44;
  const lines = wrap(ctx, input.answer.trim(), contentW);
  for (const line of lines) {
    if (y + lineH > footerTop) {
      ctx.fillStyle = MUTED;
      ctx.fillText('…', PAD, y);
      break;
    }
    ctx.fillText(line, PAD, y);
    y += lineH;
  }

  // Footer
  ctx.strokeStyle = 'rgba(38,51,57,0.16)';
  ctx.beginPath();
  ctx.moveTo(PAD, footerTop);
  ctx.lineTo(W - PAD, footerTop);
  ctx.stroke();
  ctx.fillStyle = DEEP;
  ctx.font = '500 30px Georgia, serif';
  ctx.fillText('Mahi that earns its proof.', PAD, footerTop + 54);
  ctx.fillStyle = BRASS;
  ctx.font = '700 22px ui-monospace, "SF Mono", Menlo, monospace';
  const url = 'assembl.co.nz';
  ctx.fillText(url, W - PAD - ctx.measureText(url).width, footerTop + 52);

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}
