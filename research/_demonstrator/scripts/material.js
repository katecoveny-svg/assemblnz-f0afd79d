/* assembl · materials — photoreal finishes for the knolling parts
 *
 * Every part is rasterised once into a sprite, so we can afford real work here:
 * anisotropic brushing, bevelled edges, a specular hotspot, ambient occlusion at
 * the rim, and a little grain to kill the vector cleanliness. Doing this per frame
 * would be impossible; doing it once per part is free.
 *
 * The light is always top-left at about 145°. One light, one direction, every part,
 * every object — the moment two parts disagree about where the light is, the flat
 * lay reads as a collage instead of a photograph.
 */

export const LIGHT = { x: -0.62, y: -0.78 };   /* normalised, top-left */

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (hex, a) => { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
export function shade(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  const f = v => Math.round(clamp01((v / 255) * (1 + amt)) * 255);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

/* ── finishes ──────────────────────────────────────────────────
   Each returns a fill for the part body. `p.colour` tints the coloured
   finishes; metals ignore it. */

const FINISH = {
  /* machined stainless — the default for mechanism parts */
  brushed(c, p, w, h) {
    const g = c.createLinearGradient(LIGHT.x * w, LIGHT.y * h, -LIGHT.x * w, -LIGHT.y * h);
    g.addColorStop(0.00, '#B9BEC3');
    g.addColorStop(0.18, '#F2F4F5');
    g.addColorStop(0.34, '#D3D8DC');
    g.addColorStop(0.52, '#EDEFF1');
    g.addColorStop(0.74, '#A9AFB5');
    g.addColorStop(1.00, '#C6CBD0');
    return g;
  },
  /* mirror chrome — high contrast, a hard horizon line, the classic watch-case look */
  polished(c, p, w, h) {
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0.00, '#8D949B');
    g.addColorStop(0.24, '#FFFFFF');
    g.addColorStop(0.44, '#C4CAD0');
    g.addColorStop(0.50, '#6E767E');   /* the horizon */
    g.addColorStop(0.58, '#D9DEE3');
    g.addColorStop(0.82, '#FBFCFC');
    g.addColorStop(1.00, '#9AA1A8');
    return g;
  },
  /* sand-cast alloy — flat, slightly warm, no mirror */
  cast(c, p, w, h) {
    const g = c.createLinearGradient(LIGHT.x * w, LIGHT.y * h, -LIGHT.x * w, -LIGHT.y * h);
    g.addColorStop(0, '#D6D4CF');
    g.addColorStop(0.45, '#BBB9B4');
    g.addColorStop(1, '#96948F');
    return g;
  },
  /* anodised — coloured metal, keeps a metallic falloff */
  anodised(c, p, w, h) {
    const base = p.colour || '#5B8480';
    const g = c.createLinearGradient(LIGHT.x * w, LIGHT.y * h, -LIGHT.x * w, -LIGHT.y * h);
    g.addColorStop(0, shade(base, 0.42));
    g.addColorStop(0.3, shade(base, 0.12));
    g.addColorStop(0.68, shade(base, -0.18));
    g.addColorStop(1, shade(base, -0.44));
    return g;
  },
  /* automotive paint — smooth, one strong highlight, deep shadow */
  painted(c, p, w, h) {
    const base = p.colour || '#2C3037';
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 0.34));
    g.addColorStop(0.22, shade(base, 0.62));
    g.addColorStop(0.42, shade(base, 0.02));
    g.addColorStop(1, shade(base, -0.42));
    return g;
  },
  /* timber — for the villa. warm, with grain drawn over the top */
  timber(c, p, w, h) {
    const base = p.colour || '#C4A582';
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 0.2));
    g.addColorStop(0.5, base);
    g.addColorStop(1, shade(base, -0.24));
    return g;
  },
  /* moulded rubber and gaskets — matte, absorbs light */
  rubber(c, p, w, h) {
    const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#33383D');
    g.addColorStop(0.4, '#1E2226');
    g.addColorStop(1, '#2A2F34');
    return g;
  },
  /* glass and crystal — mostly the page showing through */
  glass(c, p, w, h) {
    const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.28, 'rgba(216,231,230,0.30)');
    g.addColorStop(0.52, 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(190,212,210,0.26)');
    return g;
  },
  /* printed dial, black plastic, painted steel panel */
  dark(c, p, w, h) {
    const g = c.createLinearGradient(LIGHT.x * w, LIGHT.y * h, -LIGHT.x * w, -LIGHT.y * h);
    g.addColorStop(0, '#3A4048');
    g.addColorStop(0.35, '#22262B');
    g.addColorStop(1, '#111417');
    return g;
  },
  brass(c, p, w, h) {
    const g = c.createLinearGradient(LIGHT.x * w, LIGHT.y * h, -LIGHT.x * w, -LIGHT.y * h);
    g.addColorStop(0, '#E8D5A4');
    g.addColorStop(0.26, '#C9A75F');
    g.addColorStop(0.6, '#9C7F3E');
    g.addColorStop(1, '#6E5828');
    return g;
  },
};

export const finishFill = (c, p, w, h) =>
  (FINISH[p.finish] || FINISH.brushed)(c, p, w, h);

export const finishStroke = p => {
  switch (p.finish) {
    case 'glass':    return 'rgba(91,132,128,0.55)';
    case 'rubber':
    case 'dark':     return 'rgba(10,12,14,0.85)';
    case 'painted':  return 'rgba(12,14,17,0.55)';
    case 'anodised': return rgba(p.colour || '#5B8480', 0.9);
    case 'brass':    return 'rgba(78,62,26,0.80)';
    case 'timber':   return 'rgba(90,66,42,0.60)';
    default:         return 'rgba(90,98,105,0.85)';
  }
};

/* ── surface treatments, drawn inside the part's clip ─────────── */

/* anisotropic brushing — fine streaks along the part's long axis. This is the
   single biggest step from "vector shape" to "machined metal". */
export function brush(c, w, h, seed = 1, strength = 1) {
  const along = w >= h;
  const span = along ? h : w;
  const lines = Math.min(90, Math.max(14, Math.round(span * 1.5)));
  c.save();
  c.globalAlpha = 0.5 * strength;
  for (let i = 0; i < lines; i++) {
    const t = (i + 0.5) / lines;
    const n = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453 % 1);
    c.strokeStyle = n > 0.5 ? `rgba(255,255,255,${0.06 + n * 0.13})`
                            : `rgba(20,23,26,${0.04 + n * 0.10})`;
    c.lineWidth = 0.35 + n * 0.5;
    c.beginPath();
    if (along) { const y = -h / 2 + t * h; c.moveTo(-w / 2, y); c.lineTo(w / 2, y); }
    else { const x = -w / 2 + t * w; c.moveTo(x, -h / 2); c.lineTo(x, h / 2); }
    c.stroke();
  }
  c.restore();
}

/* circular lapping — perlage / sunburst, for discs and dials */
export function lap(c, r, seed = 1) {
  c.save();
  c.globalAlpha = 0.4;
  const rings = Math.max(6, Math.round(r / 3));
  for (let i = 0; i < rings; i++) {
    const rr = (i + 1) / rings * r;
    const n = Math.abs(Math.sin(i * 9.13 + seed * 4.7) * 1e4 % 1);
    c.strokeStyle = n > 0.5 ? `rgba(255,255,255,${0.05 + n * 0.10})`
                            : `rgba(20,23,26,${0.03 + n * 0.08})`;
    c.lineWidth = 0.4 + n * 0.5;
    c.beginPath(); c.arc(0, 0, rr, 0, 6.2832); c.stroke();
  }
  c.restore();
}

/* the specular hotspot — one per part, always from the light direction */
export function specular(c, w, h, tightness = 0.55, power = 0.5) {
  const R = Math.max(w, h) * tightness;
  const g = c.createRadialGradient(LIGHT.x * w * 0.34, LIGHT.y * h * 0.34, 0,
                                   LIGHT.x * w * 0.34, LIGHT.y * h * 0.34, R);
  g.addColorStop(0, `rgba(255,255,255,${power})`);
  g.addColorStop(0.45, `rgba(255,255,255,${power * 0.28})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.save(); c.fillStyle = g; c.fillRect(-w, -h, w * 2, h * 2); c.restore();
}

/* bevel — light on the lit edge, occlusion on the far one. Draw after the body,
   inside the clip, by stroking the same path offset toward and away from the light. */
export function bevel(c, drawPath, w, h, depth = 2) {
  /* A bevel is a chamfer a millimetre or two wide, not a frame. Scaling it with
     the part makes big discs look like they have a grey halo, so it is capped. */
  depth = Math.max(0.7, Math.min(depth, 2.6));
  c.save();
  c.lineWidth = depth * 1.6;
  c.strokeStyle = 'rgba(255,255,255,0.62)';
  c.translate(LIGHT.x * depth * 0.8, LIGHT.y * depth * 0.8);
  drawPath(); c.stroke();
  c.restore();

  c.save();
  c.lineWidth = depth * 1.5;
  c.strokeStyle = 'rgba(20,23,26,0.34)';
  c.translate(-LIGHT.x * depth * 0.9, -LIGHT.y * depth * 0.9);
  drawPath(); c.stroke();
  c.restore();
}

/* ambient occlusion at the rim — stops parts looking like stickers */
export function rimAO(c, drawPath, depth = 1.1) {
  depth = Math.min(depth, 1.4);
  c.save();
  c.lineWidth = depth * 2;
  c.strokeStyle = 'rgba(20,23,26,0.16)';
  drawPath(); c.stroke();
  c.restore();
}

/* fine grain, so nothing reads as a perfect vector */
export function grain(c, w, h, seed = 1, amount = 0.05) {
  const n = Math.round((w * h) / 26);
  c.save();
  for (let i = 0; i < n; i++) {
    const a = Math.abs(Math.sin(i * 3.71 + seed) * 1e4 % 1);
    const b = Math.abs(Math.sin(i * 7.13 + seed * 2) * 1e4 % 1);
    const v = Math.abs(Math.sin(i * 1.37 + seed * 3) * 1e4 % 1);
    c.fillStyle = v > 0.5 ? `rgba(255,255,255,${amount})` : `rgba(20,23,26,${amount})`;
    c.fillRect(-w / 2 + a * w, -h / 2 + b * h, 0.8, 0.8);
  }
  c.restore();
}
