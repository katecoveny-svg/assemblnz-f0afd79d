/**
 * A square for every agent, drawn rather than designed.
 *
 * 58 agents need 58 tiles, and hand-making them would mean 58 files that go
 * stale the moment the registry changes. Instead each tile is drawn at runtime
 * onto a canvas from the agent's own slug, so a new agent gets a mark the day
 * it ships and the same agent always gets the same one.
 *
 * The vocabulary is assembl's, not decoration invented for this: the rose dot
 * that follows the wordmark, the ring from the contact panel, the hairline
 * grid the whole site is built on, and the split square — parts that come
 * together, which is what the word means. Six primitives, picked by slug hash,
 * with a rotation and an accent placement from the same hash. Systematic
 * enough to read as one family; varied enough that no two adjacent tiles on
 * the cube look the same.
 */

/** The canon, repeated here because a canvas cannot read CSS variables. */
export const MARK_COLOURS = {
  plum: '#240B21',
  plumDeep: '#1A0718',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
  rose: '#916A70',
  roseLight: '#B08D93',
  hairline: 'rgba(245,241,242,0.22)',
} as const;

/** Stable small hash — same slug, same mark, every render and every machine. */
function hash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type MarkSpec = {
  /** which primitive to draw */
  glyph: 0 | 1 | 2 | 3 | 4 | 5;
  /** quarter turns applied to the glyph */
  turn: 0 | 1 | 2 | 3;
  /** true when the accent element is rose rather than chalk */
  roseAccent: boolean;
};

export function markSpec(slug: string): MarkSpec {
  const h = hash(slug);
  return {
    glyph: (h % 6) as MarkSpec['glyph'],
    turn: (Math.floor(h / 6) % 4) as MarkSpec['turn'],
    roseAccent: Math.floor(h / 24) % 2 === 0,
  };
}

/**
 * Draw one agent's mark into a square context.
 *
 * `size` is the full tile edge; the glyph occupies the middle band so the name
 * and category have room beneath it.
 */
function drawGlyph(ctx: CanvasRenderingContext2D, size: number, spec: MarkSpec) {
  const accent = spec.roseAccent ? MARK_COLOURS.rose : MARK_COLOURS.chalk;
  const quiet = spec.roseAccent ? MARK_COLOURS.chalk : MARK_COLOURS.rose;
  const g = size * 0.30; // glyph box edge
  const cx = size / 2;
  const cy = size * 0.40;
  const w = size * 0.018; // stroke weight

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((spec.turn * Math.PI) / 2);
  ctx.lineWidth = w;
  ctx.lineCap = 'butt';

  switch (spec.glyph) {
    // The wordmark dot inside its ring.
    case 0: {
      ctx.strokeStyle = quiet;
      ctx.beginPath();
      ctx.arc(0, 0, g / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, 0, g * 0.13, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    // A quarter arc meeting two hairlines — the corner of the grid.
    case 1: {
      ctx.strokeStyle = quiet;
      ctx.beginPath();
      ctx.arc(-g / 2, -g / 2, g, 0, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-g / 2, -g / 2);
      ctx.lineTo(g / 2, -g / 2);
      ctx.stroke();
      break;
    }
    // The split square: two halves, offset. Parts that come together.
    case 2: {
      const half = g / 2;
      const gap = g * 0.12;
      ctx.fillStyle = quiet;
      ctx.fillRect(-half, -half - gap, half - gap / 2, g);
      ctx.fillStyle = accent;
      ctx.fillRect(gap / 2, -half + gap, half - gap / 2, g);
      break;
    }
    // Three stacked bars — the brief.
    case 3: {
      const bar = g * 0.17;
      const step = g * 0.36;
      ctx.fillStyle = quiet;
      ctx.fillRect(-g / 2, -step - bar / 2, g, bar);
      ctx.fillRect(-g / 2, -bar / 2, g * 0.66, bar);
      ctx.fillStyle = accent;
      ctx.fillRect(-g / 2, step - bar / 2, g * 0.4, bar);
      break;
    }
    // Concentric squares — a record inside a record.
    case 4: {
      ctx.strokeStyle = quiet;
      ctx.strokeRect(-g / 2, -g / 2, g, g);
      ctx.strokeStyle = accent;
      ctx.strokeRect(-g * 0.26, -g * 0.26, g * 0.52, g * 0.52);
      break;
    }
    // A circle crossing a square — the customer moment meeting the system.
    default: {
      ctx.strokeStyle = quiet;
      ctx.strokeRect(-g / 2, -g / 2, g * 0.78, g * 0.78);
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.arc(g * 0.14, g * 0.14, g * 0.39, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

/** Shorten a long agent name so it never wraps out of its square. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1);
  return `${out}…`;
}

/**
 * Render one agent tile and return the canvas, ready to become a texture.
 *
 * Kept synchronous and dependency-free so the cube can build all of its faces
 * in one pass without waiting on the network.
 */
export function drawAgentTile(
  agent: { slug: string; name: string; categoryLabel: string },
  size = 320,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const spec = markSpec(agent.slug);

  // Ground, with a hairline inset — the same border the site draws everywhere.
  ctx.fillStyle = MARK_COLOURS.plum;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = MARK_COLOURS.hairline;
  ctx.lineWidth = Math.max(1, size * 0.006);
  const inset = size * 0.055;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  drawGlyph(ctx, size, spec);

  // Name, then category beneath it.
  ctx.textAlign = 'center';
  ctx.fillStyle = MARK_COLOURS.paper;
  ctx.font = `500 ${Math.round(size * 0.105)}px "Instrument Sans", system-ui, sans-serif`;
  ctx.fillText(fit(ctx, agent.name, size * 0.8), size / 2, size * 0.705);

  ctx.fillStyle = MARK_COLOURS.rose;
  ctx.font = `500 ${Math.round(size * 0.052)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.fillText(
    fit(ctx, agent.categoryLabel.toUpperCase(), size * 0.82),
    size / 2,
    size * 0.805,
  );

  return canvas;
}

/**
 * The assembl mark itself, for any slot on the cube that has no agent.
 * A blank tile would read as a missing agent; the mark reads as the brand.
 */
export function drawBrandTile(size = 320): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = MARK_COLOURS.chalk;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(36,11,33,0.18)';
  ctx.lineWidth = Math.max(1, size * 0.006);
  const inset = size * 0.055;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  ctx.textAlign = 'center';
  ctx.fillStyle = MARK_COLOURS.plum;
  ctx.font = `500 ${Math.round(size * 0.155)}px "Instrument Sans", system-ui, sans-serif`;
  const label = 'assembl';
  ctx.fillText(label, size / 2, size * 0.55);

  // The rose dot that follows the wordmark.
  const w = ctx.measureText(label).width;
  ctx.fillStyle = MARK_COLOURS.rose;
  ctx.beginPath();
  ctx.arc(size / 2 + w / 2 + size * 0.045, size * 0.545, size * 0.026, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}
