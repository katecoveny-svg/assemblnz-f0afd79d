/* assembl · the knolling assembly engine — shared across every vertical
 *
 * A flat lay of every part, laid out like a knolling photograph. As the visitor
 * scrolls, the parts lift, rotate and travel into place until they form the finished
 * object. The company's name, made literal.
 *
 * Verticals supply a parts manifest (scripts/parts/<object>.js). This file draws it.
 * If a vertical needs a new shape, add it here for everyone rather than forking.
 *
 * Spec: references/knolling-assembly.md
 */

import {
  finishFill, finishStroke, brush, lap, specular, bevel, rimAO, grain, LIGHT,
} from './material.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const LOW_POWER = (navigator.hardwareConcurrency || 8) <= 4;

const INK = '#14171A', CHROME = '#C9CDD1', CHROME_DEEP = '#7E868C';
const SEA = '#A9C7C4', SEA_LINE = '#5B8480', SIGNAL = '#C4602A', VERIFIED = '#3F6B4A';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = t => { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); };

/* Seven assembly waves, inside out. Real things assemble from the middle, and the
   animation has to as well — getting this order wrong is legible as wrong even to
   someone who could not name a single part. */
const WAVES = 7;
const waveWindow = wave => {
  const span = 1 / WAVES;
  const start = (wave - 1) * span * 0.92;      /* slight overlap between waves */
  return { start, len: span * 1.5 };
};

/* ── shape drawing ───────────────────────────────────────────────
   Chrome and glass on paper. One highlight per part, always from the same
   direction, or the flat lay reads as a collage rather than a photograph. */

function toneFill(ctx, tone, w, h) {
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  switch (tone) {
    case 'chrome':
      g.addColorStop(0, CHROME_DEEP);
      g.addColorStop(0.34, '#FFFFFF');
      g.addColorStop(0.62, CHROME);
      g.addColorStop(1, CHROME_DEEP);
      return g;
    case 'steel':
      g.addColorStop(0, CHROME);
      g.addColorStop(0.5, '#EDEFF1');
      g.addColorStop(1, CHROME_DEEP);
      return g;
    case 'dark':
      g.addColorStop(0, '#22262B');
      g.addColorStop(0.5, '#14171A');
      g.addColorStop(1, '#2C3138');
      return g;
    case 'glass':
      g.addColorStop(0, 'rgba(169,199,196,0.16)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      g.addColorStop(1, 'rgba(169,199,196,0.12)');
      return g;
    case 'accent':
      g.addColorStop(0, '#8E3F13');
      g.addColorStop(0.4, '#D0783F');
      g.addColorStop(1, SIGNAL);
      return g;
    default:
      return CHROME;
  }
}

const strokeFor = tone =>
  tone === 'glass' ? SEA_LINE
  : tone === 'dark' ? '#3A4048'
  : tone === 'accent' ? '#7C3810'
  : CHROME_DEEP;

function roundRectPath(ctx, w, h, r) {
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* PATHS build the silhouette only — no fill, no stroke. The material layer clips,
   bevels and occludes against them, so a path that fills itself would defeat the
   lighting. DETAIL draws the machined marks that sit on top of the finish. */
const PATHS = {
  rect(c, p) { roundRectPath(c, p.w, p.h, p.rad ?? 1.5); },
  bar(c, p) { roundRectPath(c, p.w, p.h, p.h / 2); },
  disc(c, p) { c.beginPath(); c.arc(0, 0, p.r, 0, 6.2832); },

  ring(c, p) {
    c.beginPath();
    c.arc(0, 0, p.r, 0, 6.2832);
    c.arc(0, 0, p.r2, 0, 6.2832, true);
  },

  gear(c, p) {
    const teeth = p.teeth || 18, ro = p.r, ri = p.r * 0.86;
    c.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * 6.2832;
      const rr = i % 2 ? ri : ro;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
  },

  /* tapered indicator — watch hand, gauge needle, wiper, lever */
  hand(c, p) {
    const L = p.w, t = p.h;
    c.beginPath();
    c.moveTo(-t * 1.6, 0);
    c.lineTo(-t * 0.6, -t / 2);
    c.lineTo(L * 0.86, -t * 0.26);
    c.lineTo(L, 0);
    c.lineTo(L * 0.86, t * 0.26);
    c.lineTo(-t * 0.6, t / 2);
    c.closePath();
  },

  screw(c, p) { c.beginPath(); c.arc(0, 0, p.r, 0, 6.2832); },

  coil(c, p) {
    c.beginPath();
    const turns = p.turns || 5, steps = turns * 26;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, a = t * turns * 6.2832;
      const rr = lerp(p.r, p.r * 0.28, t);
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    /* trace back with a small offset so the coil has width and can be filled */
    for (let i = steps; i >= 0; i--) {
      const t = i / steps, a = t * turns * 6.2832;
      const rr = lerp(p.r, p.r * 0.28, t) + 1.6;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
  },

  /* irregular mechanism plate — the dense middle of any movement */
  plate(c, p) {
    c.beginPath();
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.2832;
      const wob = 1 + Math.sin(i * 2.3 + (p.seed || 0)) * 0.11;
      const x = Math.cos(a) * p.r * wob, y = Math.sin(a) * p.r * wob * 0.94;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
  },

  /* arbitrary silhouette — car body, roof pitch, truss, seat, bracket.
     points are in part-local units, already centred. */
  poly(c, p) {
    c.beginPath();
    p.points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
  },

  /* trapezoid — roof planes, wedges, tapered panels */
  trap(c, p) {
    const w = p.w, h = p.h, tw = p.topW ?? w * 0.5;
    c.beginPath();
    c.moveTo(-tw / 2, -h / 2); c.lineTo(tw / 2, -h / 2);
    c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2);
    c.closePath();
  },

  /* tyre — a fat ring; the rim is a separate part so it can arrive on its own wave */
  tyre(c, p) {
    c.beginPath();
    c.arc(0, 0, p.r, 0, 6.2832);
    c.arc(0, 0, p.r2 ?? p.r * 0.62, 0, 6.2832, true);
  },
};

const DETAIL = {
  rect(c, p) {
    if (p.grooves) {
      c.save();
      c.strokeStyle = 'rgba(20,23,26,0.20)'; c.lineWidth = 0.55;
      for (let i = 1; i < p.grooves; i++) {
        const gx = -p.w / 2 + (i * p.w) / p.grooves;
        c.beginPath(); c.moveTo(gx, -p.h / 2 + 2); c.lineTo(gx, p.h / 2 - 2); c.stroke();
      }
      c.restore();
    }
    /* window mullions and panel battens */
    if (p.mullions) {
      c.save();
      c.strokeStyle = 'rgba(20,23,26,0.5)'; c.lineWidth = 1.1;
      const [cols, rows] = p.mullions;
      for (let i = 1; i < cols; i++) {
        const x = -p.w / 2 + (i * p.w) / cols;
        c.beginPath(); c.moveTo(x, -p.h / 2); c.lineTo(x, p.h / 2); c.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const y = -p.h / 2 + (j * p.h) / rows;
        c.beginPath(); c.moveTo(-p.w / 2, y); c.lineTo(p.w / 2, y); c.stroke();
      }
      c.restore();
    }
  },

  gear(c, p) {
    c.save();
    c.strokeStyle = 'rgba(60,68,76,0.75)'; c.lineWidth = 0.8;
    c.beginPath(); c.arc(0, 0, p.r * 0.22, 0, 6.2832); c.stroke();
    if (p.spokes) {
      const ri = p.r * 0.86;
      for (let i = 0; i < p.spokes; i++) {
        const a = (i / p.spokes) * 6.2832;
        c.beginPath();
        c.moveTo(Math.cos(a) * p.r * 0.26, Math.sin(a) * p.r * 0.26);
        c.lineTo(Math.cos(a) * ri * 0.9, Math.sin(a) * ri * 0.9);
        c.stroke();
      }
    }
    c.restore();
  },

  screw(c, p) {
    c.save();
    c.lineWidth = Math.max(0.7, p.r * 0.24);
    c.strokeStyle = 'rgba(20,23,26,0.62)';
    c.beginPath(); c.moveTo(-p.r * 0.6, 0); c.lineTo(p.r * 0.6, 0); c.stroke();
    if (p.cross) { c.beginPath(); c.moveTo(0, -p.r * 0.6); c.lineTo(0, p.r * 0.6); c.stroke(); }
    c.restore();
  },

  plate(c, p) {
    c.save();
    c.lineWidth = 0.8; c.strokeStyle = 'rgba(20,23,26,0.4)';
    (p.holes || []).forEach(([hx, hy, hr]) => {
      c.beginPath(); c.arc(hx, hy, hr, 0, 6.2832); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.beginPath(); c.arc(hx - 0.6, hy - 0.6, hr, -2.4, 0.4); c.stroke();
      c.strokeStyle = 'rgba(20,23,26,0.4)';
    });
    c.restore();
  },

  /* tread blocks, so a tyre reads as rubber rather than a black ring */
  tyre(c, p) {
    const ri = p.r2 ?? p.r * 0.62;
    c.save();
    c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 1.4;
    const n = Math.max(18, Math.round(p.r * 0.9));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.2832;
      c.beginPath();
      c.moveTo(Math.cos(a) * (ri + 2), Math.sin(a) * (ri + 2));
      c.lineTo(Math.cos(a) * (p.r - 2), Math.sin(a) * (p.r - 2));
      c.stroke();
    }
    c.strokeStyle = 'rgba(20,23,26,0.5)'; c.lineWidth = 0.8;
    c.beginPath(); c.arc(0, 0, ri, 0, 6.2832); c.stroke();
    c.restore();
  },

  disc(c, p) {
    if (!p.hole) return;
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath(); c.arc(0, 0, p.hole, 0, 6.2832); c.fill();
    c.restore();
  },
};

/* ── the engine ─────────────────────────────────────────────── */

export function createAssembly(canvas, manifest, opts = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setProgress() {}, setBeat() {}, destroy() {}, isDegraded: () => true };

  const board = manifest.board || { w: 960, h: 640 };
  const parts = manifest.parts;

  /* Convergence — the signature's mechanism for Giltrap. The centre is fixed
     from frame one; every other part starts off-stage and arrives along its
     own radial, seating centre-out. The renderer is untouched: this is only
     a different answer to where a part starts and when it moves. */
  if (manifest.mechanism === 'convergence') {
    const R = Math.hypot(manifest.board.w, manifest.board.h) / 2 + 160;
    const ranked = [...parts].sort((a, b) =>
      Math.hypot(a.to.x, a.to.y) - Math.hypot(b.to.x, b.to.y));
    const bandSize = Math.ceil(ranked.length / 7);
    ranked.forEach((part, i) => {
      const band = Math.min(7, Math.floor(i / bandSize) + 1);
      part.wave = band;
      part.labelAt = { x: part.to.x, y: part.to.y };
      if (band === 1) {
        part.lay = { x: part.to.x, y: part.to.y };   /* the fixed centre */
        part.layRot = part.to.rot || 0;
      } else {
        const d = Math.hypot(part.to.x, part.to.y);
        const a = d > 1 ? Math.atan2(part.to.y, part.to.x)
          : (i / ranked.length) * 6.2832;
        part.lay = { x: Math.cos(a) * R, y: Math.sin(a) * R };
        part.layRot = (part.to.rot || 0) + (i % 2 ? 0.55 : -0.55);
      }
    });
  }

  /* The blueprint direction, Aug 2026: the resting state is a technical
     drawing — deep ink linework on off-white graph paper — and the parts
     come OFF the plans as their wave lifts: ink crossfades to material in
     flight. The still (reduced motion, low power) is the drawing plate. */
  const INK = opts.ink || manifest.ink || '#12294F';
  const NIGHT = opts.unresolved || manifest.unresolved || '#10254F';
  const PAPER = opts.paper || manifest.paper || '#F8F5EE';

  const state = {
    progress: 0, target: 0, beat: 'gather', t: 0,
    pointer: { x: 0, y: 0 }, pointerTarget: { x: 0, y: 0 },
    running: false, visible: false, slow: 0,
    degraded: REDUCED.matches || LOW_POWER,
  };

  let W = 0, H = 0, DPR = 1, scale = 1, mobile = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(r.width, 1); H = Math.max(r.height, 1);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mobile = W < 760;
    sprites.clear();
    inkSprites.clear();
    /* fit the board with a margin; the flat lay is the wider of the two states */
    scale = Math.min(W / (board.w * 0.94), H / (board.h * 0.94));
    bakeSheet();
    draw();
  }

  /* Mobile drops the fastener families rather than shrinking everything —
     a knolling composition squeezed to 390px stops being one. */
  const visibleParts = () => (mobile ? parts.filter(p => !p.small) : parts);

  /* ── the drawing sheet, baked once per resize ─────────────────
     Off-white paper, a faint graph grid, a border frame, corner ticks and
     two dimension lines around the board extent. The quality bar is a
     draughtsman's plate, not a background texture — everything is placed. */
  let sheetLayer = null;
  function bakeSheet() {
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(W * DPR));
    off.height = Math.max(1, Math.round(H * DPR));
    const c = off.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);

    /* graph grid in board units, centred with the board */
    const step = 24 * scale;
    if (step > 4) {
      c.strokeStyle = INK;
      for (let gx = (W / 2) % step, i = Math.round(-(W / 2) / step); gx <= W; gx += step, i++) {
        c.globalAlpha = i % 5 === 0 ? 0.10 : 0.045;
        c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, H); c.stroke();
      }
      for (let gy = (H / 2) % step, j = Math.round(-(H / 2) / step); gy <= H; gy += step, j++) {
        c.globalAlpha = j % 5 === 0 ? 0.10 : 0.045;
        c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke();
      }
    }

    /* border frame and corner registration ticks */
    c.globalAlpha = 0.32; c.lineWidth = 1;
    const m = 16;
    c.strokeRect(m, m, W - m * 2, H - m * 2);
    c.globalAlpha = 0.5;
    const t = 9;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      c.beginPath(); c.moveTo(x + sx * 3, y); c.lineTo(x + sx * (3 + t), y);
      c.moveTo(x, y + sy * 3); c.lineTo(x, y + sy * (3 + t)); c.stroke();
    });

    /* dimension lines on the board extent — ticks and arrows, no numbers:
       the honesty rule is easier kept when the drawing doesn't invent them */
    const bw = board.w * scale / 2, bh = board.h * scale / 2;
    const dimY = Math.min(H - m - 10, H / 2 + bh + 18);
    const dimX = Math.max(m + 10, W / 2 - bw - 18);
    c.globalAlpha = 0.40; c.lineWidth = 0.8;
    const arrow = (x, y, dx, dy) => {
      c.beginPath(); c.moveTo(x, y);
      c.lineTo(x + dx * 7 - dy * 2.4, y + dy * 7 + dx * 2.4);
      c.lineTo(x + dx * 7 + dy * 2.4, y + dy * 7 - dx * 2.4);
      c.closePath(); c.fillStyle = INK; c.fill();
    };
    c.beginPath();
    c.moveTo(W / 2 - bw, dimY); c.lineTo(W / 2 + bw, dimY);
    c.moveTo(W / 2 - bw, dimY - 6); c.lineTo(W / 2 - bw, dimY + 6);
    c.moveTo(W / 2 + bw, dimY - 6); c.lineTo(W / 2 + bw, dimY + 6);
    c.stroke();
    arrow(W / 2 - bw, dimY, 1, 0); arrow(W / 2 + bw, dimY, -1, 0);
    c.beginPath();
    c.moveTo(dimX, H / 2 - bh); c.lineTo(dimX, H / 2 + bh);
    c.moveTo(dimX - 6, H / 2 - bh); c.lineTo(dimX + 6, H / 2 - bh);
    c.moveTo(dimX - 6, H / 2 + bh); c.lineTo(dimX + 6, H / 2 + bh);
    c.stroke();
    arrow(dimX, H / 2 - bh, 0, 1); arrow(dimX, H / 2 + bh, 0, -1);
    c.globalAlpha = 1;
    sheetLayer = off;
  }

  function poseOf(p, prog) {
    const { start, len } = waveWindow(p.wave || 4);
    const local = ease((prog - start) / len);
    const layRot = p.layRot || 0;
    return {
      x: lerp(p.lay.x, p.to.x, local),
      y: lerp(p.lay.y, p.to.y, local),
      rot: lerp(layRot, p.to.rot || 0, local),
      sc: lerp(1, p.to.scale ?? 1, local),
      t: local,
    };
  }

  /* Sprite cache. Every part's shape is fixed — only its position, rotation and
     scale change — so rasterise each one once and blit it. Building 150 gradient
     paths with shadow blur every frame is what made the engine trip its own
     low-performance guard and fall back to the still on a perfectly capable machine. */
  const SS = 2.6;                    /* supersample, so the push-in stays crisp */
  const sprites = new Map();
  const inkSprites = new Map();

  /* The part as its own working drawing: outline in ink, a centreline or a
     crosshair the way a draughtsman would mark it, nothing filled. This is
     what every part looks like before its wave lifts it off the paper. */
  function inkSprite(p) {
    const cached = inkSprites.get(p.id);
    if (cached) return cached;
    const w = p.w || (p.r || 5) * 2, h = p.h || (p.r || 5) * 2;
    const pad = 12;
    const cw = Math.ceil((w + pad * 2) * SS), ch = Math.ceil((h + pad * 2) * SS);
    const off = document.createElement('canvas');
    off.width = cw; off.height = ch;
    const c = off.getContext('2d');
    c.setTransform(SS, 0, 0, SS, cw / 2, ch / 2);
    const path = pathOf(p, c);

    c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round';
    c.globalAlpha = 0.92; c.lineWidth = 1.05;
    path(); c.stroke();

    const round = p.shape === 'disc' || p.shape === 'ring' || p.shape === 'gear'
      || p.shape === 'tyre' || p.shape === 'screw' || p.shape === 'coil';
    c.lineWidth = 0.5;
    if (round) {
      const r = (p.r || Math.max(w, h) / 2);
      c.globalAlpha = 0.55;
      c.setLineDash([6, 3.5, 1.2, 3.5]);
      c.beginPath();
      c.moveTo(-r - 5, 0); c.lineTo(r + 5, 0);
      c.moveTo(0, -r - 5); c.lineTo(0, r + 5);
      c.stroke(); c.setLineDash([]);
      c.globalAlpha = 0.7;
      c.beginPath(); c.arc(0, 0, 1.4, 0, 6.2832); c.stroke();
    } else if (Math.max(w, h) > 30) {
      c.globalAlpha = 0.42;
      c.setLineDash([7, 4, 1.5, 4]);
      c.beginPath();
      if (w >= h) { c.moveTo(-w / 2 - 4, 0); c.lineTo(w / 2 + 4, 0); }
      else { c.moveTo(0, -h / 2 - 4); c.lineTo(0, h / 2 + 4); }
      c.stroke(); c.setLineDash([]);
    }
    c.globalAlpha = 1;

    const rec = { canvas: off, w: cw / SS, h: ch / SS };
    inkSprites.set(p.id, rec);
    return rec;
  }

  /* Shapes register their path so the material layer can clip, bevel and
     occlude against the real silhouette rather than a bounding box. */
  function pathOf(p, c) {
    return () => { (PATHS[p.shape] || PATHS.rect)(c, p); };
  }

  function sprite(p) {
    const cached = sprites.get(p.id);
    if (cached) return cached;

    const w = p.w || (p.r || 5) * 2, h = p.h || (p.r || 5) * 2;
    const pad = 12;
    const cw = Math.ceil((w + pad * 2) * SS), ch = Math.ceil((h + pad * 2) * SS);
    const off = document.createElement('canvas');
    off.width = cw; off.height = ch;
    const c = off.getContext('2d');
    c.setTransform(SS, 0, 0, SS, cw / 2, ch / 2);

    const path = pathOf(p, c);
    const finish = p.finish || 'brushed';

    /* Cast shadow onto the paper, baked once, same angle for every part — that
       consistency is what makes a flat lay read as photographed rather than drawn.
       The shape itself is then erased, leaving only the blur that falls outside it;
       otherwise the offset silhouette shows through anything translucent. */
    c.save();
    c.shadowColor = finish === 'glass' ? 'rgba(20,23,26,0.10)' : 'rgba(20,23,26,0.22)';
    c.shadowBlur = 7;
    c.shadowOffsetX = -LIGHT.x * 3.4;
    c.shadowOffsetY = -LIGHT.y * 3.4;
    c.fillStyle = '#000';
    path(); c.fill();
    c.restore();
    c.save();
    c.globalCompositeOperation = 'destination-out';
    path(); c.fill();
    c.restore();

    /* body */
    c.save();
    path(); c.clip();

    c.fillStyle = finishFill(c, p, w, h);
    c.fillRect(-w, -h, w * 2, h * 2);

    /* surface treatment */
    if (finish === 'brushed' || finish === 'cast') {
      if (p.shape === 'disc' || p.shape === 'gear' || p.shape === 'ring') lap(c, Math.max(w, h) / 2, p.seed || 1);
      else brush(c, w, h, p.seed || 1, finish === 'cast' ? 0.5 : 1);
    }
    if (finish === 'timber') brush(c, w, h, p.seed || 3, 0.8);
    if (finish === 'anodised') brush(c, w, h, p.seed || 2, 0.45);

    /* one specular hotspot, from the one light */
    const spec = finish === 'polished' ? 0.72
      : finish === 'painted' ? 0.6
      : finish === 'glass' ? 0.5
      : finish === 'rubber' ? 0.06
      : finish === 'dark' ? 0.14
      : 0.34;
    specular(c, w, h, finish === 'painted' ? 0.42 : 0.6, spec);

    bevel(c, path, w, h, Math.min(w, h) * 0.05);
    rimAO(c, path, 1.1);
    if (finish !== 'glass') grain(c, w, h, p.seed || 1, finish === 'rubber' ? 0.07 : 0.045);
    c.restore();

    /* the outline, and any machined detail that sits on top */
    c.save();
    c.strokeStyle = finishStroke(p);
    c.lineWidth = 0.85;
    c.lineJoin = 'round';
    path(); c.stroke();
    (DETAIL[p.shape] || (() => {}))(c, p);
    c.restore();

    const rec = { canvas: off, w: cw / SS, h: ch / SS };
    sprites.set(p.id, rec);
    return rec;
  }

  /* v2, Kate 3 Aug: no crossfades. The scene renders twice — line and
     material — and a hard-edged light sweep converts one to the other. */
  function drawPartLayer(c, p, pose, layer) {
    const sp = layer === 'ink' ? inkSprite(p) : sprite(p);
    c.save();
    c.translate(pose.x * scale, pose.y * scale);
    c.rotate(pose.rot);
    c.drawImage(sp.canvas, (-sp.w / 2) * pose.sc * scale, (-sp.h / 2) * pose.sc * scale,
                sp.w * pose.sc * scale, sp.h * pose.sc * scale);
    c.restore();

    if (layer === 'mat') {
      /* weight: a contact shadow blooms and a specular streak runs as a part seats */
      if (pose.t >= 0.999 && seated[p.id] === undefined) seated[p.id] = state.t;
      const dt = seated[p.id] !== undefined ? state.t - seated[p.id] : 1e9;
      if (dt < 460) {
        const k = 1 - dt / 460;
        const w = (p.w || (p.r || 5) * 2) * pose.sc * scale;
        const h = (p.h || (p.r || 5) * 2) * pose.sc * scale;
        c.save();
        c.translate(pose.x * scale, pose.y * scale);
        c.globalAlpha = 0.26 * k;
        c.fillStyle = '#14171A';
        c.beginPath();
        c.ellipse(0, h / 2 + 4, w * 0.52, Math.max(3, h * 0.09), 0, 0, 6.2832);
        c.fill();
        c.globalAlpha = 0.5 * k;
        const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(Math.min(0.95, Math.max(0.05, 1 - k)), 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.fillRect(-w / 2, -h / 2, w, Math.max(2, h * 0.16));
        c.restore();
      }
    }
    if (layer === 'ink' && p.label && !mobile) {
      /* accretion: flat-lay labels that fade as assembly begins. convergence:
         a label belongs at the seat, appears when its part lands, and clears
         before the sweep so the beauty shot stays clean. */
      const conv = manifest.mechanism === 'convergence';
      const a = conv
        ? (pose.t >= 0.98 ? clamp01(1 - (state.progress - 0.5) / 0.1) * 0.6 : 0)
        : clamp01(1 - state.progress / 0.25) * 0.6;
      if (a > 0.02) {
        const at = conv ? p.labelAt : p.lay;
        c.save();
        c.globalAlpha = a;
        c.fillStyle = INK;
        c.font = `400 ${Math.max(8, 9.5 * scale)}px Jost, Futura, system-ui, sans-serif`;
        c.textAlign = 'center';
        const below = (p.h || (p.r || 5) * 2) / 2 + 11;
        c.fillText(p.label, at.x * scale, (at.y + below) * scale);
        c.restore();
      }
    }
  }

  let layerA = null, layerB = null;
  const seated = {};
  function ensureLayers() {
    if (layerA && layerA.width === canvas.width) return;
    layerA = document.createElement('canvas'); layerB = document.createElement('canvas');
    layerA.width = layerB.width = canvas.width;
    layerA.height = layerB.height = canvas.height;
  }

  function renderScene(c, layer, prog) {
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);
    const px = state.degraded || mobile ? 0 : state.pointer.x * 9;
    const py = state.degraded || mobile ? 0 : state.pointer.y * 6;
    c.save();
    c.translate(W / 2 + px, H / 2 + py);
    const zoom = lerp(1, (manifest.zoom || 1.75) * 1.12, ease(clamp01((prog - 0.62) / 0.38)));
    c.scale(zoom, zoom);
    const spin = (state.degraded || state.beat !== 'prepare') ? 0 : state.t / 5200;
    visibleParts()
      .map(p => ({ p, pose: poseOf(p, prog) }))
      .sort((a, b) => (a.p.z || 0) - (b.p.z || 0))
      .forEach(({ p, pose }) => {
        if (p.spin && spin) pose.rot += spin * (p.spin || 1);
        drawPartLayer(c, p, pose, layer);
      });
    c.restore();
  }

  function draw() {
    const prog = state.progress;
    ensureLayers();
    /* the ground is part of the assembly: cyanotype navy drains to bone */
    const drain = ease(clamp01((prog - 0.10) / 0.35));
    const sweep = ease(clamp01((prog - 0.55) / 0.42));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = NIGHT;
    ctx.fillRect(0, 0, W, H);
    if (drain > 0.001) {
      ctx.globalAlpha = drain; ctx.fillStyle = '#F4F1EA';
      ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    }
    if (sheetLayer) {
      ctx.globalAlpha = Math.max(0, drain * (1 - sweep * 0.92));
      ctx.drawImage(sheetLayer, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    const ua = (1 - ease(clamp01(prog / 0.55))) * 0.55 * Math.max(drain, 0.25);
    if (manifest.underlay && ua > 0.015) {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.globalAlpha = ua;
      ctx.strokeStyle = drain < 0.5 ? '#E8EEF7' : INK;
      try { manifest.underlay(ctx, drain < 0.5 ? '#E8EEF7' : INK); } catch (e) {}
      ctx.restore();
    }

    const A = layerA.getContext('2d'), B = layerB.getContext('2d');
    renderScene(A, 'ink', prog);
    renderScene(B, 'mat', prog);
    /* line work reads chalk on navy, graphite on bone */
    if (drain < 0.98) {
      A.save();
      A.setTransform(DPR, 0, 0, DPR, 0, 0);
      A.globalCompositeOperation = 'source-atop';
      A.globalAlpha = 1 - drain;
      A.fillStyle = '#E8EEF7';
      A.fillRect(0, 0, W, H);
      A.restore();
    }
    /* the conversion front: matter behind the sweep, line ahead of it */
    const sweepY = -40 + (H + 80) * sweep;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, sweepY)); ctx.clip();
    ctx.drawImage(layerB, 0, 0, W, H);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, Math.max(0, sweepY), W, H + 4); ctx.clip();
    ctx.drawImage(layerA, 0, 0, W, H);
    ctx.restore();
    if (sweep > 0.002 && sweep < 0.998) {
      const g = ctx.createLinearGradient(0, sweepY - 16, 0, sweepY + 8);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.7, 'rgba(255,255,255,0.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, sweepY - 16, W, 24);
    }
  }

  /* ── loop ─────────────────────────────────────────────────── */
  let raf = 0, last = 0;
  function frame(now) {
    if (!state.running) return;
    const dt = last ? now - last : 16; last = now; state.t += dt;
    /* Only degrade on *sustained* slowness, and never during the first second while
       sprites are still being rasterised — an eager guard drops a capable machine to
       the still image and looks like the animation is broken. */
    if (state.t > 1200) {
      if (dt > 40) state.slow += 1; else state.slow = Math.max(0, state.slow - 2);
      if (state.slow > 150) { degrade(); return; }
    }

    state.progress = lerp(state.progress, state.target, 0.085);
    state.pointer.x = lerp(state.pointer.x, state.pointerTarget.x, 0.08);
    state.pointer.y = lerp(state.pointer.y, state.pointerTarget.y, 0.08);
    draw();
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!state.running && !state.degraded) { state.running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { state.running = false; cancelAnimationFrame(raf); };

  /* The designed still is the FLAT LAY, not the assembled object: it is the more
     beautiful frame, it shows every part, and it reads as a considered photograph
     rather than an animation caught at the end. */
  function degrade() {
    stop();
    state.degraded = true;
    state.progress = 0;
    state.pointer.x = state.pointer.y = 0;
    draw();
    canvas.dispatchEvent(new CustomEvent('scene:degraded', { bubbles: true }));
  }

  const io = new IntersectionObserver(es => {
    state.visible = es[0].isIntersecting;
    state.visible ? start() : stop();
  }, { threshold: 0.02 });
  io.observe(canvas);

  const onVis = () => (document.hidden ? stop() : state.visible && start());
  document.addEventListener('visibilitychange', onVis);
  const onResize = () => resize();
  window.addEventListener('resize', onResize, { passive: true });

  const onPointer = e => {
    const r = canvas.getBoundingClientRect();
    state.pointerTarget.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.pointerTarget.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  if (!('ontouchstart' in window)) window.addEventListener('pointermove', onPointer, { passive: true });

  const onPref = () => { if (REDUCED.matches) degrade(); };
  REDUCED.addEventListener?.('change', onPref);

  resize();
  if (state.degraded) degrade(); else start();

  return {
    setProgress(v) {
      state.target = clamp01(v);
      if (state.degraded) { state.progress = 0; draw(); }   /* the still stays the flat lay */
    },
    setBeat(b) {
      state.beat = b;
      /* hold: parts freeze mid-flight. a watch suspended half-assembled is the best
         image in the system for "the agent did the work and stopped for a person". */
      if (b === 'hold') state.target = state.progress;
      if (state.degraded) draw();
    },
    isDegraded: () => state.degraded,
    /* exposed for tests: assemblies fail silently and this is how you catch it */
    debug: () => ({ progress: +state.progress.toFixed(3), target: +state.target.toFixed(3), beat: state.beat, running: state.running, visible: state.visible, degraded: state.degraded, parts: visibleParts().length }),
    destroy() {
      stop(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      REDUCED.removeEventListener?.('change', onPref);
    },
  };
}
