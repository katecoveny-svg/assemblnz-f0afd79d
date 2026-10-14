/* assembl tide engine for publishing: murmur-tide.js + murmur-page.js as one plain script (no imports) so it can be inlined.
   Needs window.THREE from vendor/three.min.js. Regenerate from those two files after editing them. */
(function () {
'use strict';
let THREE;
// assembl — tide. Tara (white-fronted terns) gather over a scroll-scrubbed dusk clip; larger tara made of lilac glass and light glide past.
// The page opens on a deep plum field with the assembl wordmark set into it as glass, in the brand's lilac, rose and plum modules.
// The clip shows through the glass, then the view flies into the l and the clip takes the screen. The clip is graded live from the TONES presets.

const FONT = getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim() || '"Instrument Sans", system-ui, sans-serif';
const TAN = Math.tan((16 * Math.PI) / 180);
const smooth = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
const key = p => p[0] + p[1] * 0.35;
function rng(s) { return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const text = (s, wgt, px, w, h, base, fit) => ({ w, h, fit, draw: g => { g.font = `${wgt} ${px}px ${FONT}`; g.textAlign = 'center'; g.fillText(s, w / 2, base); } });
const GLYPH = {
  tick: { w: 600, h: 470, fit: ['h', 2.5], draw: g => { g.lineWidth = 64; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(80, 250); g.lineTo(230, 395); g.lineTo(520, 75); g.stroke(); } },
  pin: { w: 440, h: 580, fit: ['h', 2.9], draw: g => { g.beginPath(); g.arc(220, 205, 165, Math.PI * 0.82, Math.PI * 2.18); g.lineTo(220, 545); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(220, 205, 66, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over'; } },
  bubble: { w: 660, h: 520, fit: ['h', 2.6], draw: g => { rr(g, 40, 40, 580, 330, 100); g.fill(); g.beginPath(); g.moveTo(150, 340); g.lineTo(110, 480); g.lineTo(290, 360); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; [215, 330, 445].forEach(x => { g.beginPath(); g.arc(x, 205, 34, 0, Math.PI * 2); g.fill(); }); g.globalCompositeOperation = 'source-over'; } },
  sparkle: { w: 600, h: 600, fit: ['h', 2.9], draw: g => { g.beginPath(); g.moveTo(300, 30); g.quadraticCurveTo(325, 275, 570, 300); g.quadraticCurveTo(325, 325, 300, 570); g.quadraticCurveTo(275, 325, 30, 300); g.quadraticCurveTo(275, 275, 300, 30); g.fill(); } },
  padlock: { w: 500, h: 620, fit: ['h', 2.9], draw: g => { rr(g, 40, 260, 420, 330, 56); g.fill(); g.lineWidth = 58; g.beginPath(); g.arc(250, 262, 134, Math.PI, 0); g.stroke(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(250, 395, 40, 0, Math.PI * 2); g.fill(); g.fillRect(231, 405, 38, 95); g.globalCompositeOperation = 'source-over'; } },
  amark: text('a', 600, 560, 520, 520, 430, ['h', 2.6]),
  DO: text('DO', 700, 380, 900, 420, 350, ['w', 4.8]),
  word: text('assembl', 600, 260, 1400, 360, 270, ['w', 6.6]),
  signal: { w: 640, h: 420, fit: ['h', 2.9], draw: g => { g.lineWidth = 40; g.lineCap = 'round'; [100, 185, 270].forEach(r => { g.beginPath(); g.arc(320, 385, r, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); }); g.beginPath(); g.arc(320, 385, 36, 0, Math.PI * 2); g.fill(); } },
  frame: { w: 640, h: 440, fit: ['h', 2.9], draw: g => { g.lineWidth = 36; rr(g, 40, 40, 560, 360, 70); g.stroke(); g.beginPath(); g.moveTo(282, 150); g.lineTo(392, 220); g.lineTo(282, 290); g.closePath(); g.fill(); } },
  seal: { w: 520, h: 520, fit: ['h', 2.9], draw: g => { g.lineWidth = 34; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.arc(260, 260, 210, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(160, 268); g.lineTo(232, 340); g.lineTo(368, 190); g.stroke(); } },
};
// one slot per page section: shape, centre height, rig offset on wide screens, mills instead of holding a shape
// formation shapes: [centre height, rig offset on wide screens, mills instead of holding a shape]. Pages pass their own order as opts.slots.
const SHAPES = { cloud: [3.75, 0, 1], signal: [1.9, 2.7, 0], pin: [1.9, 2.7, 0], DO: [1.9, 2.7, 0], bubble: [1.9, 2.7, 0], tick: [1.9, 2.7, 0], frame: [1.9, 2.7, 0], sparkle: [1.9, 2.7, 0], padlock: [1.9, 2.7, 0], seal: [1.9, 2.7, 0], amark: [2.6, 0, 0], word: [2.75, 0, 0] };
const DEFAULT_SLOTS = ['cloud', 'signal', 'DO', 'frame', 'seal', 'word'];
// a large tara glides through when the flock passes these points: [form, direction, height]
const TRIG = [[0.45, 1, 3.0], [2.45, -1, 3.2], [4.45, 1, 3.4]];
// sh/hi are soft-light tints (0.5 is neutral) for shadows and highlights; duo pulls toward a plum-to-paper duotone
const TONES = {
  // film: the footage keeps its light but every frame is pulled toward the plum-to-paper duotone, so a dark stretch of the clip still reads as assembl plum rather than black.
  film: { exp: 1.1, con: 1.08, sat: 0.9, split: 0.55, sh: [0.42, 0.36, 0.5], hi: [0.6, 0.53, 0.5], duo: 0.26, vig: 0.38, th: 0.8, bloom: 0.28, glow: 0.05, haze: [0.74, 0.62, 0.7], ink: 0.75 },
  shot: { exp: 1.0, con: 1.04, sat: 1.0, split: 0, sh: [0.5, 0.5, 0.5], hi: [0.5, 0.5, 0.5], duo: 0, vig: 0.3, th: 0.9, bloom: 0.16, glow: 0, haze: [0.72, 0.6, 0.7], ink: 0.7 },
  glow: { exp: 1.06, con: 1.12, sat: 1.14, split: 0.85, sh: [0.4, 0.29, 0.46], hi: [0.68, 0.53, 0.5], duo: 0, vig: 0.45, th: 0.68, bloom: 0.5, glow: 0.08, haze: [0.8, 0.64, 0.7], ink: 0.85 },
  ink: { exp: 1.0, con: 1.32, sat: 0.7, split: 0, sh: [0.5, 0.5, 0.5], hi: [0.5, 0.5, 0.5], duo: 0.84, vig: 0.4, th: 0.8, bloom: 0.3, glow: 0, haze: [0.6, 0.5, 0.58], ink: 0.8 },
  night: { exp: 0.58, con: 1.22, sat: 1.18, split: 0.7, sh: [0.37, 0.29, 0.5], hi: [0.54, 0.5, 0.72], duo: 0, vig: 0.62, th: 0.48, bloom: 0.62, glow: 0.7, haze: [0.22, 0.12, 0.24], ink: 0 },
  // looks: aur draws aurora curtains and stars into the sky, paua lays an iridescent shell sheen over the sea, streak adds anamorphic light streaks
  aurora: { exp: 0.52, con: 1.24, sat: 1.12, split: 0.75, sh: [0.36, 0.3, 0.54], hi: [0.52, 0.5, 0.72], duo: 0, vig: 0.58, th: 0.5, bloom: 0.72, glow: 0.6, haze: [0.2, 0.12, 0.26], aur: 1, star: 1, ink: 0 },
  paua: { exp: 0.96, con: 1.18, sat: 1.05, split: 0.45, sh: [0.4, 0.34, 0.52], hi: [0.55, 0.55, 0.6], duo: 0, vig: 0.5, th: 0.62, bloom: 0.42, glow: 0.12, haze: [0.48, 0.5, 0.62], paua: 1, ink: 0.7 },
  streak: { exp: 1.08, con: 1.16, sat: 1.18, split: 0.8, sh: [0.38, 0.3, 0.48], hi: [0.72, 0.56, 0.47], duo: 0, vig: 0.5, th: 0.6, bloom: 0.62, glow: 0.04, haze: [0.86, 0.66, 0.64], streak: 1, ink: 0.85 },
};
const TONE0 = { aur: 0, star: 0, paua: 0, streak: 0, ink: 0 }, toneOf = name => ({ ...TONE0, ...(TONES[name] || TONES.glow) });

function blob(n, R, cy, sx, sy, sz) { const out = []; for (let i = 0; i < n; i++) { const u = R() * Math.PI * 2, v = Math.acos(2 * R() - 1), r = Math.cbrt(R()); out.push([Math.sin(v) * Math.cos(u) * r * sx, cy + Math.cos(v) * r * sy, Math.sin(v) * Math.sin(u) * r * sz]); } return out.sort((p, q) => key(p) - key(q)); }
function sample(spec, n, R, cy) {
  if (!spec) return null;
  const cv = document.createElement('canvas'); cv.width = spec.w; cv.height = spec.h;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.fillStyle = '#000'; g.strokeStyle = '#000'; spec.draw(g);
  const d = g.getImageData(0, 0, spec.w, spec.h).data, pts = [];
  for (let y = 0; y < spec.h; y += 2) for (let x = 0; x < spec.w; x += 2) if (d[(y * spec.w + x) * 4 + 3] > 140) pts.push(x, y);
  if (pts.length < 40) return null;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  const s = spec.fit[0] === 'h' ? spec.fit[1] / (y1 - y0) : spec.fit[1] / (x1 - x0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, out = [];
  for (let i = 0; i < n; i++) { const k = Math.floor(R() * (pts.length / 2)) * 2; out.push([(pts[k] - mx + (R() - 0.5) * 2) * s, -(pts[k + 1] - my + (R() - 0.5) * 2) * s + cy, (R() - 0.5) * 0.45]); }
  return out.sort((p, q) => key(p) - key(q));
}
const build = (name, cy, n, R) => (name === 'cloud' ? null : sample(GLYPH[name], n, R, cy)) || blob(n, R, cy, 4.0, 0.95, 2.2);
// geometry parts: 0 body, 1 cap, 2 arm (inner wing), 3 hand (outer wing), 4 tail, 5 bill
function parts(fn) {
  const P = [], K = [], tri = (a, b, c, k) => { P.push(...a, ...b, ...c); K.push(k, k, k); };
  fn(tri, (a, b, c, k) => { tri(a, b, c, k); tri([-a[0], a[1], a[2]], [-c[0], c[1], c[2]], [-b[0], b[1], b[2]], k); });
  // barycentrics for the gliders' edge light: edges shared by two triangles are lifted out of reach, so only the outline glows
  const nv = P.length / 3, vk = [], cnt = new Map(), B = [];
  for (let i = 0; i < nv; i++) vk.push(P.slice(i * 3, i * 3 + 3).map(x => Math.round(x * 1e5)).join(','));
  const ek = (t, e) => { const a = vk[t * 3 + ((e + 1) % 3)], b = vk[t * 3 + ((e + 2) % 3)]; return a < b ? a + '|' + b : b + '|' + a; };
  for (let t = 0; t < nv / 3; t++) for (let e = 0; e < 3; e++) cnt.set(ek(t, e), (cnt.get(ek(t, e)) || 0) + 1);
  for (let t = 0; t < nv / 3; t++) { const up = [0, 1, 2].map(e => (cnt.get(ek(t, e)) > 1 ? 1 : 0)); for (let j = 0; j < 3; j++) B.push(+(j === 0) + up[0], +(j === 1) + up[1], +(j === 2) + up[2]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aPart', new THREE.Float32BufferAttribute(K, 1)); g.setAttribute('aBary', new THREE.Float32BufferAttribute(B, 3));
  return g;
}
// tara: slim body, black cap, long angled wings with a wrist, deep tail fork. x right, y up, forward +z.
// chord > 1 widens the wing front to back around its own line, so at 25 to 40 css px a bird still reads as a shape, not a hairline
const ternGeometry = (chord = 1.25) => parts((tri, both) => {
  const v = (x, y, z) => [x * 0.8, y * 0.8, z * 0.8], d = (chord - 1) * 0.012, fwd = p => [p[0], p[1], p[2] + d * 0.8], aft = p => [p[0], p[1], p[2] - d * 0.8];
  tri(v(0, 0, 0.058), v(-0.011, 0, 0.022), v(0.011, 0, 0.022), 0);
  tri(v(-0.011, 0, 0.022), v(0, 0, -0.036), v(0.011, 0, 0.022), 0);
  tri(v(0, 0.009, 0.05), v(0, -0.009, 0.012), v(0, 0.003, -0.036), 0);
  tri(v(0, 0.0015, 0.062), v(-0.0075, 0.0015, 0.043), v(0.0075, 0.0015, 0.043), 1);
  tri(v(0, 0.011, 0.047), v(0, 0.003, 0.064), v(0, -0.002, 0.044), 1);
  tri(v(0, 0.001, 0.084), v(-0.0028, 0.001, 0.061), v(0.0028, 0.001, 0.061), 5);
  const rf = fwd(v(0.009, 0, 0.024)), rb = aft(v(0.009, 0, -0.002)), wf = fwd(v(0.056, 0, 0.02)), wb = aft(v(0.051, 0, -0.006)), le = fwd(v(0.083, 0, 0.006)), tip = aft(v(0.108, 0, -0.024));
  both(rf, rb, wf, 2); both(wf, rb, wb, 2); both(wf, wb, le, 3); both(le, wb, tip, 3);
  tri(v(-0.008, 0, -0.033), v(0.008, 0, -0.033), v(0, 0, -0.058), 4);
  tri(v(-0.008, 0, -0.033), v(0, 0, -0.058), v(-0.019, 0, -0.09), 4);
  tri(v(0.008, 0, -0.033), v(0.019, 0, -0.09), v(0, 0, -0.058), 4);
});
// each letter is split into glass modules like the brand marks: plum stems, lilac tops, rose bowls. [u from, u to, top, bottom, glass]
const GLASS = ['#CCADF5', '#EDB2B6', '#5C1733'];
const MOD = {
  a: [[0.64, 1.3, 't', 'b', 2], [-0.3, 0.64, 't', 'm', 0], [-0.3, 0.64, 'm', 'b', 1]],
  s: [[-0.3, 1.3, 't', 'm', 0], [-0.3, 1.3, 'm', 'b', 1]],
  e: [[-0.3, 1.3, 't', 'm', 0], [-0.3, 1.3, 'm', 'b', 1]],
  m: [[-0.3, 0.34, 't', 'b', 2], [0.34, 0.67, 't', 'b', 0], [0.67, 1.3, 't', 'b', 1]],
  b: [[-0.3, 0.34, 't', 'b', 2], [0.34, 1.3, 't', 'm', 0], [0.34, 1.3, 'm', 'b', 1]],
  l: [[-0.3, 1.3, 't', 'b', 2]],
};
function boxBlur(src, w, h, r) {
  const a = src.slice(), b = new Float32Array(a.length), k = 1 / (2 * r + 1);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) { const o = y * w; let s = 0; for (let x = -r; x <= r; x++) s += a[o + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { b[o + x] = s * k; s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { a[y * w + x] = s * k; s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]; } }
  }
  return a;
}
// exact Euclidean distance transform (Felzenszwalb and Huttenlocher), one dimension; f holds squared distances, INF where empty
const EDT_INF = 1e20;
function edt1d(f, d, v, z, n) {
  let k = 0; v[0] = 0; z[0] = -EDT_INF; z[1] = EDT_INF;
  for (let q = 1; q < n; q++) {
    let s = 0;
    for (;;) { const r = v[k]; s = ((f[q] + q * q) - (f[r] + r * r)) / (2 * q - 2 * r); if (s <= z[k] && k > 0) k--; else break; }
    k++; v[k] = q; z[k] = s; z[k + 1] = EDT_INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const r = v[k]; d[q] = (q - r) * (q - r) + f[r]; }
}
function edt2d(g, w, h) {
  const n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; edt1d(f, d, v, z, h); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { const o = y * w; for (let x = 0; x < w; x++) f[x] = g[o + x]; edt1d(f, d, v, z, w); for (let x = 0; x < w; x++) g[o + x] = d[x]; }
}
// signed distance field of a coverage image: positive inside the ink, in pixels, encoded as 0.5 + d / (2 * spread)
function signedDistance(alpha, w, h, spread) {
  const n = w * h, inside = new Float64Array(n), outside = new Float64Array(n);
  for (let i = 0; i < n; i++) { const ink = alpha[i] >= 0.5; inside[i] = ink ? EDT_INF : 0; outside[i] = ink ? 0 : EDT_INF; }
  edt2d(inside, w, h); edt2d(outside, w, h);
  const out = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) {
    // the antialiased coverage at an edge pixel refines the distance by a fraction of a pixel
    const d = alpha[i] >= 0.5 ? Math.sqrt(inside[i]) - 0.5 + (alpha[i] - 0.5) : -(Math.sqrt(outside[i]) - 0.5 + (0.5 - alpha[i]));
    out[i] = Math.round((0.5 + d / (2 * spread)) * 255);
  }
  return out;
}
function makeMask(maxTexture = 4096) {
  const F = 640, WORD = 'assembl', q = 0.25, c = document.createElement('canvas'), g = c.getContext('2d');
  const setup = x => { x.font = `600 ${F}px ${FONT}`; x.letterSpacing = `${-0.055 * F}px`; x.textBaseline = 'alphabetic'; };
  setup(g);
  const m = g.measureText(WORD), mb = g.measureText('assemb'), ml = g.measureText('l'), xh = g.measureText('x').actualBoundingBoxAscent;
  const pad = 48, asc = m.actualBoundingBoxAscent, des = Math.max(0, m.actualBoundingBoxDescent);
  const W = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight + pad * 2), H = Math.ceil(asc + des + pad * 2);
  c.width = W; c.height = H; setup(g); g.fillStyle = '#fff';
  const ox = pad + m.actualBoundingBoxLeft, oy = pad + asc;
  g.fillText(WORD, ox, oy);
  // the knockout edge is a signed distance field at the largest size the GPU takes, so the letters stay crisp at every zoom of the fly-through
  const F2 = Math.max(64, Math.floor(F * Math.min(maxTexture / W, 6.4) * 0.98)), scale = F2 / F;
  const sc = document.createElement('canvas'), sg = sc.getContext('2d', { willReadFrequently: true });
  const W2 = Math.ceil(W * scale), H2 = Math.ceil(H * scale), spread = pad * scale;
  sc.width = W2; sc.height = H2; sg.font = `600 ${F2}px ${FONT}`; sg.letterSpacing = `${-0.055 * F2}px`; sg.textBaseline = 'alphabetic'; sg.fillStyle = '#fff';
  sg.fillText(WORD, ox * scale, oy * scale);
  const sid = sg.getImageData(0, 0, W2, H2), sd = sid.data, cov = new Float32Array(W2 * H2);
  for (let i = 0; i < cov.length; i++) cov[i] = sd[i * 4 + 3] / 255;
  const t0 = performance.now(), dist = signedDistance(cov, W2, H2, spread);
  if (performance.measure) try { performance.measure('assembl-mask-sdf', { start: t0, detail: { width: W2, height: H2 } }); } catch (e) { /* older browsers */ }
  for (let i = 0; i < cov.length; i++) { sd[i * 4] = sd[i * 4 + 1] = sd[i * 4 + 2] = dist[i]; sd[i * 4 + 3] = 255; }
  sg.putImageData(sid, 0, 0);
  const lx = ox + mb.width + (ml.actualBoundingBoxRight - ml.actualBoundingBoxLeft) / 2, ly = oy - ml.actualBoundingBoxAscent * 0.5;
  // quarter-size fields for the glass: red is the rounded bevel, green a wide glow
  const bw = Math.ceil(W * q), bh = Math.ceil(H * q), mkc = () => { const k = document.createElement('canvas'); k.width = bw; k.height = bh; return k; };
  const bc = mkc(), bg = bc.getContext('2d', { willReadFrequently: true });
  bg.drawImage(c, 0, 0, bw, bh);
  const id = bg.getImageData(0, 0, bw, bh), d = id.data, n = bw * bh, al = new Float32Array(n);
  for (let i = 0; i < n; i++) al[i] = d[i * 4 + 3] / 255;
  const b1 = boxBlur(al, bw, bh, 6), b2 = boxBlur(al, bw, bh, 14);
  for (let i = 0; i < n; i++) { d[i * 4] = Math.round(b1[i] * 255); d[i * 4 + 1] = Math.round(b2[i] * 255); d[i * 4 + 2] = 0; d[i * 4 + 3] = 255; }
  bg.putImageData(id, 0, 0);
  // module colours, painted a little past the ink so the edges keep their tint
  const tc = mkc(), tg = tc.getContext('2d'), lc = mkc(), lg = lc.getContext('2d');
  tg.fillStyle = '#000'; tg.fillRect(0, 0, bw, bh);
  for (let i = 0; i < WORD.length; i++) {
    const ch = WORD[i], x = ox + g.measureText(WORD.slice(0, i)).width, mi = g.measureText(ch);
    const x0 = x - mi.actualBoundingBoxLeft, w = mi.actualBoundingBoxLeft + mi.actualBoundingBoxRight, Y = { t: oy - mi.actualBoundingBoxAscent - 40, m: oy - xh * 0.56, b: oy + 60 };
    lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, bw, bh);
    lg.setTransform(q, 0, 0, q, 0, 0); setup(lg); lg.fillStyle = lg.strokeStyle = '#fff'; lg.lineWidth = 36; lg.lineJoin = 'round';
    lg.fillText(ch, x, oy); lg.strokeText(ch, x, oy);
    lg.globalCompositeOperation = 'source-atop';
    for (const [u0, u1, y0, y1, k] of MOD[ch] || MOD.s) { lg.fillStyle = GLASS[k]; lg.fillRect(x0 + u0 * w, Y[y0], (u1 - u0) * w, Y[y1] - Y[y0]); }
    tg.drawImage(lc, 0, 0);
  }
  const tex = new THREE.CanvasTexture(sc), bevel = new THREE.CanvasTexture(bc), tint = new THREE.CanvasTexture(tc);
  // aa: distance-field units per horizontal uv unit, so the shader can size its edge to one screen pixel at any zoom
  return { tex, bevel, tint, texel: [1 / bw, 1 / bh], base: (pad + des) / H, aspect: W / H, ink: (asc + des) / W, ax: lx / W, ay: 1 - ly / H, aa: W2 / (2 * spread) };
}

const FS_VS = `varying vec2 vUv; void main(){ vUv = position.xy*0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const PLATE_FS = `varying vec2 vUv;
uniform sampler2D tPlate, tPoster, tMask, tBevel, tTint;
uniform float uHas, uPosterAspect, uPlateMix, uAspect, uPlateAspect, uZoom, uExp, uCon, uSat, uSplit, uDuo, uVig, uKW, uKA, uKS, uKOn, uKLine, uKBase, uGlass, uTime, uAur, uStar, uPaua, uKAa;
uniform vec2 uPtr, uRes, uKC, uKAnchor, uBT; uniform vec3 uSh, uHi, uField;
vec3 sl(vec3 b, vec3 s){ return mix(2.0*b*s + b*b*(1.0 - 2.0*s), sqrt(max(b, 0.0))*(2.0*s - 1.0) + 2.0*b*(1.0 - s), step(0.5, s)); }
vec3 dusk(vec2 uv){
  float hz = 0.47;
  vec3 c = uv.y > hz ? mix(vec3(0.93, 0.8, 0.84), vec3(0.42, 0.3, 0.5), smoothstep(hz, 1.0, uv.y)) : mix(vec3(0.6, 0.46, 0.6), vec3(0.15, 0.06, 0.15), smoothstep(hz, 0.0, uv.y));
  float d = length((uv - vec2(0.38, hz))*vec2(uAspect, 1.0));
  c += vec3(1.0, 0.86, 0.9)*(0.5*exp(-d*14.0) + 0.18*exp(-d*3.0));
  c += vec3(1.0, 0.9, 0.94)*0.3*exp(-abs(uv.x - 0.38)*uAspect*9.0)*smoothstep(hz, hz - 0.35, uv.y)*step(uv.y, hz);
  return c;
}
vec3 grade(vec3 c){
  c *= uExp;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = clamp((mix(vec3(l), c, uSat) - 0.5)*uCon + 0.5, 0.0, 1.0);
  l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, sl(c, mix(uSh, uHi, smoothstep(0.1, 0.9, l))), uSplit);
  return mix(c, mix(vec3(0.141, 0.043, 0.129), vec3(1.0, 0.99, 0.985), smoothstep(0.04, 0.96, l)), uDuo);
}
vec2 plateUv(vec2 v, float aspect){ vec2 u = v - 0.5; float ra = uAspect/aspect; if (ra > 1.0) u.y /= ra; else u.x *= ra; return u/uZoom + 0.5 + uPtr*vec2(-0.006, 0.004); }
vec3 src(vec2 v){
  if (uHas < 0.5) return dusk(v);
  vec3 c = texture2D(tPlate, plateUv(v, uPlateAspect)).rgb;
  if (uPlateMix < 1.0) c = mix(texture2D(tPoster, plateUv(v, uPosterAspect)).rgb, c, uPlateMix);
  return c;
}
float caustic(vec2 p, float t){
  for (int i = 0; i < 3; i++) p += 0.55*vec2(sin(p.y*1.6 + t*0.8 + float(i)*1.7), cos(p.x*1.4 - t*0.6 + float(i)*2.3));
  return pow(1.0 - abs(sin(p.x*2.1)*sin(p.y*2.1)), 10.0);
}
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a*vn(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
// aurora curtains: a wandering lower edge, folds and fine vertical rays; lilac at the base, rose at the tops
vec3 aurora(vec2 uv, float t){
  float x = uv.x*uAspect;
  float d = uv.y - (0.6 + 0.24*(fbm(vec2(x*0.45, t*0.04)) - 0.5));
  float cur = smoothstep(-0.015, 0.012, d)*exp(-max(d, 0.0)*4.2);
  float rays = fbm(vec2(x*7.0 + fbm(vec2(x*1.2, t*0.06))*4.0, t*0.12));
  rays = pow(clamp(rays*1.45 - 0.2, 0.0, 1.0), 2.0);
  float fold = 0.45 + 0.55*smoothstep(0.2, 0.8, fbm(vec2(x*0.9 + t*0.02, 3.7)));
  return mix(vec3(0.58, 0.4, 1.0), vec3(1.0, 0.52, 0.78), smoothstep(0.02, 0.22, d))*cur*(0.25 + rays*1.6)*fold;
}
float stars(vec2 uv){
  vec2 g = uv*vec2(uAspect, 1.0)*150.0, id = floor(g);
  float r = h21(id);
  vec2 o = fract(g) - 0.5 - (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5)*0.5;
  return step(0.982, r)*(1.0 - smoothstep(0.0, 0.3, length(o)))*(0.55 + 0.45*sin(uTime*(1.2 + r*3.0) + r*60.0));
}
// paua shell colours: violet, sea-green, blue, rose
vec3 pcol(float t){
  t = fract(t)*4.0;
  vec3 a = vec3(0.6, 0.42, 1.0), b = vec3(0.32, 0.8, 0.84), e = vec3(0.3, 0.4, 0.96), f = vec3(1.0, 0.55, 0.78);
  return t < 1.0 ? mix(a, b, smoothstep(0.0, 1.0, t)) : t < 2.0 ? mix(b, e, smoothstep(1.0, 2.0, t)) : t < 3.0 ? mix(e, f, smoothstep(2.0, 3.0, t)) : mix(f, a, smoothstep(3.0, 4.0, t));
}
void main(){
  vec3 c = grade(src(vUv));
  if (uAur > 0.001 || uStar > 0.001){
    float dk = 1.0 - smoothstep(0.16, 0.5, dot(c, vec3(0.299, 0.587, 0.114)));
    vec2 rv = vec2(vUv.x + (vn(vec2(vUv.x*30.0, vUv.y*140.0 + uTime*0.6)) - 0.5)*0.012, 1.0 - vUv.y);
    vec3 au = aurora(vUv, uTime) + aurora(rv, uTime)*0.3*(1.0 - smoothstep(0.4, 0.5, vUv.y));
    c += (au*uAur*0.9 + vec3(1.0, 0.96, 1.0)*stars(vUv)*uStar*smoothstep(0.58, 0.78, vUv.y))*dk;
  }
  if (uPaua > 0.001){
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    vec2 gp = vUv*vec2(uAspect, 1.0);
    float ph = l*2.4 + fbm(gp*2.6 + vec2(uTime*0.03, -uTime*0.02))*1.7 + gp.x*0.3 - gp.y*0.55 + uTime*0.035 + uPtr.x*0.25;
    vec3 film = pcol(ph)*(0.22 + 1.2*l) + vec3(1.0, 0.97, 1.0)*pow(l, 4.0)*0.6;
    vec3 sheen = mix(vec3(0.05, 0.03, 0.09) + c*0.3, film, smoothstep(0.04, 0.55, l));
    c = mix(c, sheen, uPaua*(0.42 + 0.58*(1.0 - smoothstep(0.42, 0.58, vUv.y))));
  }
  if (uKOn > 0.001){
    vec2 sp = vUv*uRes, size = vec2(uKW, uKW/uKA), A = uKC + (uKAnchor - 0.5)*size;
    vec2 m2 = (A + (sp - A)/uKS - uKC)/size + 0.5, rl = 2.4/(size*uKS), ex = vec2(uBT.x, 0.0), ey = vec2(0.0, uBT.y);
    float inb = step(0.0, m2.x)*step(m2.x, 1.0)*step(0.0, m2.y)*step(m2.y, 1.0);
    // the mask is a signed distance field: cover one screen pixel either side of the edge, however far the view has flown in
    float px = uKAa/(uKW*uKS);
    float m = smoothstep(0.5 - 0.7*px, 0.5 + 0.7*px, texture2D(tMask, m2).r)*inb, dl = 0.0;
    for (int i = 0; i < 8; i++){ vec2 o = vec2(cos(float(i)*0.7854), sin(float(i)*0.7854)); dl = max(dl, smoothstep(0.5 - 0.7*px, 0.5 + 0.7*px, texture2D(tMask, m2 + o*rl).r)); }
    dl *= inb;
    vec2 bv = texture2D(tBevel, m2).rg*inb;
    vec2 g = vec2(texture2D(tBevel, m2 + ex).r - texture2D(tBevel, m2 - ex).r, texture2D(tBevel, m2 + ey).r - texture2D(tBevel, m2 - ey).r)*inb;
    vec3 N = normalize(vec3(-g*22.0, 1.0));
    vec3 inside = c*1.15 + vec3(0.03, 0.015, 0.03);
    // glass: each module bends and tints the clip, darkens toward its rounded edges and catches two lights; it clears as the view flies in
    float ga = uGlass*(1.0 - smoothstep(1.6, 5.0, uKS));
    if (m > 0.001 && ga > 0.001){
      vec3 tint = texture2D(tTint, m2).rgb;
      vec2 os = N.xy*vec2(1.0/uAspect, 1.0)*0.03;
      vec3 T = grade(vec3(src(vUv - os*0.8).r, src(vUv - os).g, src(vUv - os*1.25).b));
      vec3 gc = mix(T*tint*1.25, tint, 0.22 + 0.3*pow(1.0 - N.z, 2.0))*mix(1.0, 0.62, smoothstep(0.25, 0.85, 1.0 - N.z));
      float nh = max(dot(N, normalize(vec3(-0.45, 0.62, 1.64))), 0.0), nb = max(dot(N, normalize(vec3(0.5, -0.55, 1.67))), 0.0);
      gc += vec3(1.0, 0.98, 1.0)*(pow(nh, 90.0)*1.5 + pow(nh, 14.0)*0.2) + mix(tint, vec3(1.0), 0.5)*pow(nb, 40.0)*0.5;
      gc = mix(gc, mix(tint, vec3(1.0), 0.7), smoothstep(0.6, 0.5, bv.r)*0.35);
      float seam = smoothstep(0.1, 0.5, length(texture2D(tTint, m2 + ex*1.5).rgb - texture2D(tTint, m2 - ex*1.5).rgb) + length(texture2D(tTint, m2 + ey*1.5).rgb - texture2D(tTint, m2 - ey*1.5).rgb));
      gc = mix(gc, gc*0.5, seam*0.55) + vec3(1.0, 0.95, 0.98)*seam*0.3;
      inside = mix(inside, gc, ga);
    }
    vec3 field = uField*(0.8 + 0.4*vUv.y) + c*0.05 + vec3(0.3, 0.09, 0.24)*0.35*exp(-length((sp - uKC)/size*vec2(1.0, uKA*0.5))*2.4) + vec3(0.85, 0.55, 0.85)*bv.g*0.3*smoothstep(0.0, 0.05, m2.x)*smoothstep(1.0, 0.95, m2.x)*smoothstep(0.0, 0.14, m2.y)*smoothstep(1.0, 0.86, m2.y);
    field += aurora(vUv, uTime)*uAur*0.4 + vec3(1.0, 0.96, 1.0)*stars(vUv)*uStar*0.75;
    // caustics: light through the glass lands on the plum under the word
    float bl = uKBase - m2.y, band = smoothstep(-0.02, 0.05, bl)*exp(-bl*bl/0.05)*smoothstep(0.0, 0.06, m2.x)*smoothstep(1.0, 0.94, m2.x);
    field += (texture2D(tTint, vec2(m2.x, uKBase + 0.12)).rgb + 0.12)*caustic(vec2(m2.x*uKA, m2.y*2.2)*5.0, uTime*0.45)*band*0.55*uGlass;
    c = mix(mix(c, inside, uKOn), field, uKOn*(1.0 - m));
    // fine outline: white where it faces the light, pink on the shadow side
    vec3 lc = mix(vec3(0.93, 0.62, 0.84), vec3(1.0, 0.99, 0.985), smoothstep(-0.5, 0.5, dot(-g/max(length(g), 1e-5), vec2(-0.587, 0.809))));
    c = mix(c, lc, clamp(dl - m, 0.0, 1.0)*uKLine*uKOn);
  }
  c = mix(c, c*vec3(0.32, 0.16, 0.3), uVig*smoothstep(0.35, 1.1, length((vUv - 0.5)*vec2(uAspect, 1.0))));
  gl_FragColor = vec4(c, 1.0);
}`;
const TERN_VS = `
attribute vec3 aFA; attribute vec3 aFB;
attribute vec4 aSeed; attribute float aPart;
uniform float uTime, uA, uB, uT, uMillA, uMillB, uSpin, uLit, uPulse, uFormed, uSweep, uRip, uGlow, uSize, uArrive, uInk, uWait;
uniform vec3 uCA, uCB, uHaze, uL; uniform vec2 uPtr;
varying vec3 vCol;
vec3 mill(vec3 p, vec3 c, out vec3 tg){
  float ang = uTime*uSpin*(0.7 + aSeed.w*0.6);
  vec3 q = p - c; float cs = cos(ang), sn = sin(ang);
  q = vec3(q.x*cs - q.z*sn, q.y, q.x*sn + q.z*cs);
  q.y += sin(uTime*1.1 + q.x*1.3)*0.2;
  q.x += sin(uTime*0.7 + q.y*2.0)*0.15;
  tg = normalize(vec3(-q.z, 0.05, q.x) + vec3(0.0001));
  return q + c;
}
void main(){
  float ti = clamp((uT - aSeed.x*0.45)/0.55, 0.0, 1.0), e = ti*ti*(3.0 - 2.0*ti), tr = sin(3.14159*ti);
  vec3 hold = normalize(vec3(sin(aSeed.y*6.283)*0.45, -0.38, 1.0));
  vec3 A = aFA, B = aFB, fA = hold, fB = hold, tg = hold;
  if (uMillA > 0.5) { A = mill(A, uCA, tg); fA = tg; }
  if (uMillB > 0.5) { B = mill(B, uCB, tg); fB = tg; }
  vec3 sw = vec3(sin(uTime*0.9 + aSeed.y*6.283 + A.y), cos(uTime*0.8 + aSeed.y*5.0 + A.x), sin(uTime*0.7 + aSeed.w*6.283));
  vec3 p0 = mix(A, B, e), dAB = B - A;
  vec3 side = normalize(cross(dAB + vec3(0.0001), vec3(0.0, 0.0, 1.0)) + vec3(0.0, 0.0001, 0.0));
  vec3 flow = vec3(sin(p0.y*1.3 + uTime*0.8), cos(p0.x*1.1 - uTime*0.7), sin((p0.x + p0.y)*0.9 + uTime*0.5));
  vec3 p = p0 + sw*0.03 + tr*(side*length(dAB)*0.22 + flow*0.45 + sw*0.12 + vec3(0.0, 0.5, 0.0));
  vec3 cen = mix(uCA, uCB, e);
  float sq = (p.x - mix(-3.6, 3.6, uSweep))/0.45;
  float band = (uSweep > 0.001 && uSweep < 0.999) ? exp(-sq*sq) : 0.0;
  float rd = length((p - cen).xy) - uRip*4.6;
  float ring = (uRip > 0.001 && uRip < 0.999) ? exp(-(rd*rd)/0.12)*(1.0 - uRip) : 0.0;
  p.z += band*0.35 + ring*0.5;
  p.xy += uPtr*0.12*(0.5 + aSeed.w);
  p += normalize(p - cen + vec3(0.001))*uPulse*0.35*(0.5 + aSeed.w);
  // arrival: birds wait above the frame and stream down in a staggered order
  float arr = clamp((uArrive*1.15 - aSeed.w)/0.15, 0.0, 1.0); arr = arr*arr*(3.0 - 2.0*arr);
  p += (1.0 - arr)*vec3((aSeed.y - 0.5)*7.0, 7.5 + aSeed.w*3.0, aSeed.w*2.0 - 2.0);
  vec3 hf = normalize(mix(fA, fB, e) + vec3(0.0001));
  vec3 travel = dAB + side*length(dAB)*0.6*(1.0 - 2.0*ti) + flow*0.4 + vec3(0.0, 0.0, 0.001);
  vec3 f = normalize(mix(hf, normalize(travel), clamp(tr*1.6, 0.0, 1.0)));
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f) + vec3(0.0001)), u = cross(f, r);
  // bank into the circle when milling, a gentle rock when holding a shape, so the wing shape reads
  float ml = mix(uMillA, uMillB, e), bank = ml*(0.7 + 0.25*sin(uTime*0.6 + aSeed.y*12.0)) + (1.0 - ml)*0.28*sin(uTime*0.5 + aSeed.y*9.0);
  r = r*cos(bank) + u*sin(bank); u = cross(f, r);
  // uWait: size of a bird still waiting above the frame (1 = full size); it grows to full size as it arrives
  float s = aSeed.z*uSize*(1.0 + band*0.3 + ring*0.25)*mix(uWait, 1.0, arr);
  vec3 lp = position*s;
  lp.z *= 1.0 + tr*0.5;
  // wingbeat: the arm lifts, the hand follows a beat later and sweeps back on the upstroke
  float ax = abs(lp.x), wing = step(1.5, aPart)*step(aPart, 3.5), ph = uTime*(12.0 + aSeed.w*4.0) + aSeed.y*30.0;
  float a1 = 0.72*sin(ph), a2 = 0.85*sin(ph - 0.8), upst = max(0.0, cos(ph));
  float arm = clamp(ax - 0.0072*s, 0.0, 0.0376*s), hand = max(ax - 0.0448*s, 0.0);
  float lift = wing*(arm*a1 + hand*(a1 + a2));
  lp.y += lift - 0.006*s*sin(ph);
  lp.z -= wing*hand*0.45*upst;
  lp.x -= wing*sign(lp.x)*hand*0.22*upst;
  vec4 w4 = modelMatrix*vec4(p + r*lp.x + u*lp.y + f*lp.z, 1.0);
  vec4 mv = viewMatrix*w4;
  gl_Position = projectionMatrix*mv;
  vec3 V = normalize(cameraPosition - w4.xyz);
  vec3 n = normalize(u - r*sign(lp.x)*lift/max(ax, 0.001));
  float top = step(0.0, dot(n, V)), dark = step(0.5, aPart)*step(aPart, 1.5) + step(4.5, aPart);
  vec3 upper = aPart < 0.5 ? vec3(0.95, 0.94, 0.95) : aPart < 1.5 ? vec3(0.06, 0.035, 0.06) : aPart < 2.5 ? vec3(0.79, 0.78, 0.84) : aPart < 3.5 ? vec3(0.6, 0.58, 0.66) : aPart < 4.5 ? vec3(0.94, 0.93, 0.95) : vec3(0.09, 0.05, 0.08);
  vec3 under = aPart < 0.5 ? vec3(0.98, 0.96, 0.97) : aPart < 1.5 ? vec3(0.06, 0.035, 0.06) : aPart < 2.5 ? vec3(0.97, 0.95, 0.97) : aPart < 3.5 ? vec3(0.86, 0.83, 0.88) : aPart < 4.5 ? vec3(0.97, 0.95, 0.97) : vec3(0.09, 0.05, 0.08);
  vec3 c = mix(under, upper, top)*(0.56 + 0.44*abs(dot(n, uL)));
  c += vec3(1.0, 0.84, 0.88)*pow(1.0 - abs(dot(n, V)), 3.0)*0.3*(1.0 - dark);
  float lit = smoothstep(aSeed.x - 0.05, aSeed.x, uLit);
  c = mix(c, vec3(1.0, 0.72, 0.87), lit*0.5*(1.0 - dark));
  c += vec3(1.0, 0.8, 0.9)*(band*0.38 + ring*0.28);
  c = mix(c, mix(c*0.3 + vec3(0.95, 0.88, 1.0)*0.78, c, dark), uGlow);
  // silhouette: on bright footage the birds read as dark plum shapes with a rose rim; the settle sweep still lights them
  c = mix(c, vec3(0.13, 0.04, 0.12) + vec3(1.0, 0.66, 0.84)*pow(1.0 - abs(dot(n, V)), 2.0)*0.5, uInk);
  c += vec3(1.0, 0.8, 0.9)*(band*0.45 + ring*0.32)*uInk;
  vCol = mix(c, uHaze, clamp((-mv.z - 10.5)/12.0, 0.0, 0.5));
}`;
// the gliders are larger tara made of lilac glass and light: translucent panels, glowing outlines, brighter where the wings turn edge-on
const GLIDE_VS = `
attribute float aPart; attribute vec3 aBary;
uniform float uTime, uFlap, uSeed;
varying vec3 vB; varying float vF, vSpan, vPart;
void main(){
  vec3 p = position; float ax = abs(p.x), wing = step(1.5, aPart)*step(aPart, 3.5), ph = uTime*8.5 + uSeed;
  float a1 = 0.72*uFlap*sin(ph), a2 = 0.85*uFlap*sin(ph - 0.8), upst = uFlap*max(0.0, cos(ph));
  float arm = clamp(ax - 0.0072, 0.0, 0.0376), hand = max(ax - 0.0448, 0.0), lift = wing*(arm*a1 + hand*(a1 + a2));
  p.y += lift - 0.006*uFlap*sin(ph);
  p.z -= wing*hand*0.45*upst;
  p.x -= wing*sign(p.x)*hand*0.22*upst;
  vec4 w = modelMatrix*vec4(p, 1.0);
  vec3 n = normalize(mat3(modelMatrix)*vec3(-sign(p.x)*lift/max(ax, 0.001), 1.0, 0.0));
  vF = 1.0 - abs(dot(n, normalize(cameraPosition - w.xyz)));
  vB = aBary; vSpan = clamp(ax/0.0864, 0.0, 1.0); vPart = aPart;
  gl_Position = projectionMatrix*viewMatrix*w;
}`;
const GLIDE_FS = `varying vec3 vB; varying float vF, vSpan, vPart;
void main(){
  vec3 e3 = smoothstep(vec3(0.0), fwidth(vB)*3.2, vB);
  float edge = 1.0 - min(min(e3.x, e3.y), e3.z), cap = step(0.5, vPart)*step(vPart, 1.5) + step(4.5, vPart);
  vec3 body = mix(mix(vec3(0.42, 0.22, 0.92), vec3(0.7, 0.52, 1.0), vSpan), vec3(0.3, 0.06, 0.26), cap*0.75);
  vec3 c = body*(0.7 + 0.8*vF) + vec3(0.95, 0.55, 0.85)*pow(vF, 3.0)*0.7 + vec3(0.74, 0.56, 1.0)*edge*1.7;
  gl_FragColor = vec4(c, clamp(0.45 + 0.4*vF + 0.25*cap + edge*0.9, 0.0, 1.0));
}`;
// a ribbon of light behind each glider: white-hot at the bird, cooling to violet and rose as it fades
const TRAIL_VS = `attribute float aT; attribute float aS; varying float vT; varying float vS;
void main(){ vT = aT; vS = aS; gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0); }`;
const TRAIL_FS = `varying float vT; varying float vS;
void main(){
  vec3 c = mix(vec3(0.86, 0.72, 1.0)*1.35, mix(vec3(0.62, 0.44, 1.0), vec3(0.95, 0.66, 0.82), vT), smoothstep(0.0, 0.3, vT));
  gl_FragColor = vec4(c, (1.0 - vS*vS)*pow(1.0 - vT, 1.8)*0.8);
}`;
const COL_FS = `varying vec3 vCol; void main(){ gl_FragColor = vec4(vCol, 1.0); }`;
const BRIGHT_FS = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTh;
void main(){
  vec3 c = (texture2D(tSrc, vUv + uTexel*vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel*vec2(1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel*vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel*vec2(1.0, 1.0)).rgb)*0.25;
  gl_FragColor = vec4(c*smoothstep(uTh, uTh + 0.4, max(c.r, max(c.g, c.b))), 1.0);
}`;
const BLUR_FS = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uDir; uniform vec2 uTexel;
void main(){
  vec2 o = uDir*uTexel;
  vec3 c = texture2D(tSrc, vUv).rgb*0.227027;
  c += (texture2D(tSrc, vUv + o*1.3846).rgb + texture2D(tSrc, vUv - o*1.3846).rgb)*0.3162162;
  c += (texture2D(tSrc, vUv + o*3.2308).rgb + texture2D(tSrc, vUv - o*3.2308).rgb)*0.0702703;
  gl_FragColor = vec4(c, 1.0);
}`;
const COMP_FS = `varying vec2 vUv; uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uStrength, uTime, uStreak; uniform vec2 uRes;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
void main(){
  vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb*uStrength;
  if (uStreak > 0.001){
    vec3 st = vec3(0.0);
    for (int i = 1; i <= 12; i++){ float o = float(i)*0.017, w = exp(-float(i)*0.2); st += (texture2D(tBloom, vUv + vec2(o, 0.0)).rgb + texture2D(tBloom, vUv - vec2(o, 0.0)).rgb)*w; }
    c += st*vec3(0.76, 0.62, 1.0)*0.15*uStreak;
  }
  c = clamp(c, 0.0, 1.0);
  vec2 q = vUv - 0.5; c *= 1.0 - dot(q, q)*0.2;
  c += (hash(vUv*uRes + fract(uTime)*91.0) - 0.5)*0.018;
  gl_FragColor = vec4(c, 1.0);
}`;

async function mount(canvas, opts = {}) {
  try { await Promise.race([document.fonts.load(`600 200px ${FONT}`), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* system font fallback */ }
  if (opts.signal?.aborted) throw new DOMException("Scene cancelled", "AbortError");
  // Decode the intrinsic-size poster before exposing a canvas; never flash dusk while it loads.
  const poster = opts.poster ? new Image() : null;
  if (poster) {
    poster.src = opts.poster.currentSrc || opts.poster.src;
    let deadline;
    try {
      await Promise.race([poster.decode(), new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Poster unavailable')), 3000); })]);
    } catch {
      // Both media sources may fail: retain the intentional procedural/flock fallback.
    } finally { clearTimeout(deadline); }
    if (opts.signal?.aborted) throw new DOMException("Scene cancelled", "AbortError");
  }
  THREE = window.THREE;
  const SLOTS = (opts.slots || DEFAULT_SLOTS).filter(n => SHAPES[n]).map(n => [n, ...SHAPES[n]]);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, narrow0 = innerWidth < 900;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  // pixel ratio: 2 on a capable desktop so the terns hold their shape on retina, 1.5 elsewhere, 1.25 on narrow screens; opts.dprCap overrides
  const capable = !narrow0 && (navigator.hardwareConcurrency || 4) >= 8;
  const dpr = Math.min(window.devicePixelRatio || 1, opts.dprCap || (narrow0 ? 1.25 : capable ? 2 : 1.5));
  renderer.setPixelRatio(dpr);
  const gl = renderer.getContext(), gl2 = renderer.capabilities.isWebGL2;
  const canFloat = gl2 && !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  const type = canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const rtScene = new THREE.WebGLRenderTarget(2, 2, { type, samples: gl2 ? (narrow0 ? 2 : 4) : 0 });
  const rtA = new THREE.WebGLRenderTarget(2, 2, { type }), rtB = new THREE.WebGLRenderTarget(2, 2, { type });
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400), rig = new THREE.Group();
  scene.add(rig);
  let toneT = toneOf(opts.tone);
  const T = JSON.parse(JSON.stringify(toneT));
  const G = { uTime: { value: 0 }, uPtr: { value: new THREE.Vector2() }, uLit: { value: 0 }, uPulse: { value: 0 }, uGlow: { value: T.glow }, uHaze: { value: new THREE.Vector3(...T.haze) }, uL: { value: new THREE.Vector3(-0.4, 0.3, -0.86).normalize() } };
  const PL = { tPoster: { value: null }, uPosterAspect: { value: 16 / 9 }, uPlateMix: { value: 1 }, tPlate: { value: null }, tMask: { value: null }, uHas: { value: 0 }, uAspect: { value: 1 }, uPlateAspect: { value: 16 / 9 }, uZoom: { value: 1.05 }, uPtr: G.uPtr, uRes: { value: new THREE.Vector2(2, 2) },
    // field: deep plum #240B21 (was 0.105, 0.032, 0.095, about #1B0818, which read as black once the vignette landed on it); opts.field overrides
    uExp: { value: 1 }, uCon: { value: 1 }, uSat: { value: 1 }, uSplit: { value: 0 }, uDuo: { value: 0 }, uVig: { value: 0 }, uSh: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uHi: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uField: { value: new THREE.Vector3(...(opts.field || [0.141, 0.043, 0.129])) },
    uKC: { value: new THREE.Vector2() }, uKAnchor: { value: new THREE.Vector2(0.5, 0.5) }, uKW: { value: 1 }, uKA: { value: 3.6 }, uKS: { value: 1 }, uKOn: { value: 0 }, uKAa: { value: 1 }, uKLine: { value: opts.outline === false ? 0 : typeof opts.outline === 'number' ? opts.outline : 1 },
    tBevel: { value: null }, tTint: { value: null }, uBT: { value: new THREE.Vector2(0.001, 0.001) }, uKBase: { value: 0.08 }, uGlass: { value: opts.glass === false ? 0 : 1 }, uTime: G.uTime, uAur: { value: 0 }, uStar: { value: 0 }, uPaua: { value: 0 } };
  const plate = opts.plate || null;
  let plateTex = null, plateDirty = true;
  const mark = () => { plateDirty = true; };
  if (plate) { plateTex = new THREE.VideoTexture(plate); PL.tPlate.value = plateTex; plate.addEventListener('seeked', mark); plate.addEventListener('loadeddata', mark); }
  // A detached image retains intrinsic dimensions; the CSS-sized DOM image can
  // allocate a smaller GPU texture than its decoded pixels in Three's upload path.
  const posterTex = poster ? new THREE.Texture(poster) : null;
  const hasPoster = () => poster && poster.complete && poster.naturalWidth;
  let posterUploaded = false, videoBlend = 1;
  const mask = opts.knock === false ? null : makeMask(Math.min(renderer.capabilities.maxTextureSize || 4096, narrow0 ? 2048 : 4096));
  if (mask) { PL.uKAa.value = mask.aa; PL.tMask.value = mask.tex; PL.tBevel.value = mask.bevel; PL.tTint.value = mask.tint; PL.uBT.value.set(...mask.texel); PL.uKBase.value = mask.base; PL.uKA.value = mask.aspect; PL.uKAnchor.value.set(mask.ax, mask.ay); PL.uKOn.value = 1; }
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: PL, vertexShader: FS_VS, fragmentShader: PLATE_FS, depthWrite: false, depthTest: false }));
  sky.frustumCulled = false; sky.renderOrder = -1; scene.add(sky);

  const R = rng(7), N = opts.count ? Math.round(opts.count * (narrow0 ? 0.62 : 1)) : (narrow0 ? 460 : 760), base = ternGeometry(opts.wingChord ?? 1.25), geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', base.getAttribute('position')); geo.setAttribute('aPart', base.getAttribute('aPart'));
  const FORMS = SLOTS.map(([name, cy]) => new Float32Array(build(name, cy, N, R).flat()));
  let curA = 0, curB = Math.min(1, FORMS.length - 1);
  const attA = new THREE.InstancedBufferAttribute(FORMS[curA].slice(), 3).setUsage(THREE.DynamicDrawUsage), attB = new THREE.InstancedBufferAttribute(FORMS[curB].slice(), 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aFA', attA); geo.setAttribute('aFB', attB);
  const seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { seed[i * 4] = Math.min(1, (i / N) * 0.8 + R() * 0.12); seed[i * 4 + 1] = R(); seed[i * 4 + 2] = 0.95 + R() * 0.5; seed[i * 4 + 3] = R(); }
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
  geo.instanceCount = N;
  const U = { uTime: G.uTime, uPtr: G.uPtr, uLit: G.uLit, uPulse: G.uPulse, uGlow: G.uGlow, uHaze: G.uHaze, uL: G.uL, uSize: { value: 1 }, uInk: { value: 0 }, uA: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uMillA: { value: 1 }, uMillB: { value: 1 }, uSpin: { value: 0.2 }, uFormed: { value: 1 }, uSweep: { value: 0 }, uRip: { value: 0 }, uCA: { value: new THREE.Vector3() }, uCB: { value: new THREE.Vector3() }, uArrive: { value: reduced ? 1 : (opts.arrive ?? 1) }, uWait: { value: opts.waitScale ?? 1 } };
  const terns = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: TERN_VS, fragmentShader: COL_FS, side: THREE.DoubleSide }));
  terns.frustumCulled = false;
  const pivot = new THREE.Group(); pivot.position.y = 1.8; rig.add(pivot); pivot.add(terns); terns.position.y = -1.8;
  const centers = SLOTS.map(([, cy]) => new THREE.Vector3(0, cy, 0));
  let last = -1, sw = 1;
  const assign = f => {
    const top = SLOTS.length - 1, a = Math.max(0, Math.min(top, Math.floor(f))), b = Math.min(top, a + 1), t = f - a;
    if (a !== curA) { attA.array.set(FORMS[a]); attA.needsUpdate = true; curA = a; }
    if (b !== curB) { attB.array.set(FORMS[b]); attB.needsUpdate = true; curB = b; }
    U.uA.value = a; U.uB.value = b; U.uT.value = a === b ? 0 : t;
    U.uMillA.value = SLOTS[a][3]; U.uMillB.value = SLOTS[b][3];
    U.uCA.value.copy(centers[a]); U.uCB.value.copy(centers[b]);
    U.uFormed.value = a === b ? 1 : 1 - Math.sin(Math.PI * Math.min(1, t));
  };
  // when the flock settles on a new shape, a band of light sweeps across it and a ripple runs out from the centre
  const settle = (f, dt) => {
    const k = Math.max(0, Math.min(SLOTS.length - 1, Math.round(f)));
    if (Math.abs(f - k) < 0.05 && k !== last) { last = k; if (!SLOTS[k][3] && !reduced) sw = 0; }
    if (sw < 1) sw = Math.min(1, sw + dt / 1.8);
    U.uSweep.value = sw < 1 ? sw : 0; U.uRip.value = sw < 1 ? Math.min(1, sw * 1.15) : 0;
  };

  const albGeo = ternGeometry(1), TRN = 110, TRAIL_AGE = 1.1;
  const trailMat = new THREE.ShaderMaterial({ vertexShader: TRAIL_VS, fragmentShader: TRAIL_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const mkTrail = () => {
    const g = new THREE.BufferGeometry(), idx = [], S = new Float32Array(TRN * 2);
    for (let i = 0; i < TRN - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    for (let i = 0; i < TRN; i++) { S[i * 2] = -1; S[i * 2 + 1] = 1; }
    g.setIndex(idx);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRN * 6), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(TRN * 2), 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aS', new THREE.BufferAttribute(S, 1));
    g.setDrawRange(0, 0);
    const mesh = new THREE.Mesh(g, trailMat); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);
    return { g, mesh, hist: [] };
  };
  const alb = [0, 1, 2].map(i => {
    const AU = { uTime: G.uTime, uFlap: { value: 0 }, uSeed: { value: i * 2.1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: AU, vertexShader: GLIDE_VS, fragmentShader: GLIDE_FS, side: THREE.DoubleSide, transparent: true, depthWrite: false });
    mat.extensions.derivatives = true;
    const mesh = new THREE.Mesh(albGeo, mat);
    mesh.visible = false; mesh.frustumCulled = false; mesh.scale.setScalar(7.3); scene.add(mesh);
    return { mesh, AU, on: false, t0: 0, dur: 11, P: null, D: null, E: null, trail: mkTrail() };
  });
  let albOn = opts.gliders !== false, introDone = false;
  const launch = (dir, y0) => {
    const a = alb.find(x => !x.on); if (!a || reduced || !albOn) return;
    const X = 8.5, V = (x, y, z) => new THREE.Vector3(x, y, z);
    a.P = [V(-dir * X, y0 + 0.9, -6), V(-dir * X * 0.32, y0 - 0.3, 5.2), V(dir * X * 0.32, y0 - 0.55, 5.0), V(dir * X, y0 + 0.6, -5)];
    a.D = [a.P[1].clone().sub(a.P[0]), a.P[2].clone().sub(a.P[1]), a.P[3].clone().sub(a.P[2])];
    a.E = [a.P[2].clone().sub(a.P[1]).sub(a.P[1]).add(a.P[0]), a.P[3].clone().sub(a.P[2]).sub(a.P[2]).add(a.P[1])];
    a.on = true; a.t0 = t; a.mesh.visible = true; a.trail.hist.length = 0;
  };
  const vp = new THREE.Vector3(), vf = new THREE.Vector3(), va = new THREE.Vector3(), vu = new THREE.Vector3(), vr = new THREE.Vector3(), m4 = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0);
  // follows a cubic path; banks into the turn by tilting its lift toward the lateral acceleration
  const fly = a => {
    const s = (t - a.t0) / a.dur;
    if (s >= 1) { a.on = false; a.mesh.visible = false; return; }
    const u = 1 - s, P = a.P, D = a.D, E = a.E;
    vp.set(0, 0, 0).addScaledVector(P[0], u * u * u).addScaledVector(P[1], 3 * u * u * s).addScaledVector(P[2], 3 * u * s * s).addScaledVector(P[3], s * s * s);
    vf.set(0, 0, 0).addScaledVector(D[0], 3 * u * u).addScaledVector(D[1], 6 * u * s).addScaledVector(D[2], 3 * s * s).normalize();
    va.set(0, 0, 0).addScaledVector(E[0], 6 * u).addScaledVector(E[1], 6 * s).multiplyScalar(1 / (a.dur * a.dur));
    va.addScaledVector(vf, -va.dot(vf));
    vu.copy(UP).multiplyScalar(0.9).add(va).normalize();
    vr.crossVectors(vu, vf).normalize(); vu.crossVectors(vf, vr);
    m4.makeBasis(vr, vu, vf); a.mesh.quaternion.setFromRotationMatrix(m4); a.mesh.position.copy(vp); a.mesh.updateMatrixWorld();
    a.AU.uFlap.value = 0.25 + 0.75 * smooth(0.5 + 0.8 * Math.sin(t * 0.8 + a.AU.uSeed.value));
  };

  // the ribbon follows the tail and fades by age, so it is the same length at any frame rate
  const tp = new THREE.Vector3(), td = new THREE.Vector3(), tv = new THREE.Vector3(), ts = new THREE.Vector3();
  const trail = a => {
    const T = a.trail, h = T.hist;
    if (a.on) { tp.set(0, 0, -0.05).applyMatrix4(a.mesh.matrixWorld); h.unshift([tp.x, tp.y, tp.z, t]); }
    while (h.length > TRN || (h.length && t - h[h.length - 1][3] > TRAIL_AGE)) h.pop();
    const n = h.length; T.mesh.visible = n > 1;
    if (n < 2) return;
    const P = T.g.attributes.position.array, A = T.g.attributes.aT.array;
    for (let i = 0; i < n; i++) {
      const p = h[i], pa = h[Math.max(0, i - 1)], pb = h[Math.min(n - 1, i + 1)], age = Math.min(1, (t - p[3]) / TRAIL_AGE), j = i * 6;
      td.set(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]); tv.set(camera.position.x - p[0], camera.position.y - p[1], camera.position.z - p[2]);
      ts.crossVectors(td, tv).normalize().multiplyScalar(0.075 * Math.pow(1 - age, 0.6) + 0.004);
      P[j] = p[0] - ts.x; P[j + 1] = p[1] - ts.y; P[j + 2] = p[2] - ts.z; P[j + 3] = p[0] + ts.x; P[j + 4] = p[1] + ts.y; P[j + 5] = p[2] + ts.z;
      A[i * 2] = A[i * 2 + 1] = age;
    }
    T.g.attributes.position.needsUpdate = true; T.g.attributes.aT.needsUpdate = true; T.g.setDrawRange(0, (n - 1) * 6);
  };
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false; postScene.add(quad);
  const mk = (fs, u) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: FS_VS, fragmentShader: fs, depthTest: false, depthWrite: false });
  const bright = mk(BRIGHT_FS, { tSrc: { value: rtScene.texture }, uTexel: { value: new THREE.Vector2() }, uTh: { value: T.th } });
  const blur = mk(BLUR_FS, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() }, uTexel: { value: new THREE.Vector2() } });
  const comp = mk(COMP_FS, { tScene: { value: rtScene.texture }, tBloom: { value: rtA.texture }, uStrength: { value: T.bloom }, uStreak: { value: 0 }, uTime: G.uTime, uRes: { value: new THREE.Vector2() } });
  const pass = (m, target) => { quad.material = m; renderer.setRenderTarget(target); renderer.render(postScene, postCam); };
  const blurPass = (src, dst, x, y) => { blur.uniforms.tSrc.value = src.texture; blur.uniforms.uDir.value.set(x, y); pass(blur, dst); };

  let fT = 0, fC = 0, lit = 0, litC = 0, pulse = 0, paused = false, lost = false, wide = innerWidth > 900, px = 0, py = 0, cx = 0, cy = 0, t = 0, raf = 0, last0 = performance.now();
  let kp = 0, kC = 0, kZoom = opts.knockZoom !== false;
  const layout = (w, h) => {
    if (!mask) return;
    const W = Math.min(0.9 * w, 0.4 * h * mask.aspect), top = 0.42 * h;
    PL.uKW.value = W * dpr; PL.uKC.value.set(0.5 * w * dpr, (h - top) * dpr);
    if (opts.onLayout) opts.onLayout({ cx: 0.5 * w, cy: top, w: W, h: W * mask.ink });
  };
  let paintDirty = true;
  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    const fw = Math.max(2, Math.floor(w * dpr)), fh = Math.max(2, Math.floor(h * dpr)), qw = Math.max(2, fw >> 2), qh = Math.max(2, fh >> 2);
    rtScene.setSize(fw, fh); rtA.setSize(qw, qh); rtB.setSize(qw, qh);
    camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
    PL.uAspect.value = camera.aspect; PL.uRes.value.set(fw, fh);
    const fit = Math.min(1, (2 * TAN * 10.6 * camera.aspect * 0.92) / 6.8);
    pivot.scale.setScalar(fit); U.uSize.value = (1 + (1 - fit) * 1.2) * (opts.birdScale || 1);
    bright.uniforms.uTexel.value.set(1 / fw, 1 / fh); blur.uniforms.uTexel.value.set(1 / qw, 1 / qh); comp.uniforms.uRes.value.set(fw, fh);
    layout(w, h);
    paintDirty = true;
  };
  resize(); addEventListener('resize', resize);
  const onLost = e => { e.preventDefault(); lost = true; };
  canvas.addEventListener('webglcontextlost', onLost);
  const NUM = ['exp', 'con', 'sat', 'split', 'duo', 'vig', 'th', 'bloom', 'glow', 'aur', 'star', 'paua', 'streak', 'ink'], VEC = ['sh', 'hi', 'haze'];
  // Re-select every paint: a decoded but unverified/stale video must not hide the poster.
  const backdrop = () => plate && plate.readyState >= 2 && plate.videoWidth && !plate.error &&
    (!opts.plateReady || opts.plateReady()) ? plateTex :
    poster && poster.complete && poster.naturalWidth ? posterTex : null;
  const paint = texture => {
    if (hasPoster() && !posterUploaded) {
      posterTex.needsUpdate = true; PL.tPoster.value = posterTex;
      PL.uPosterAspect.value = poster.naturalWidth / poster.naturalHeight; posterUploaded = true;
    }
    const previous = PL.tPlate.value;
    if (texture === plateTex && previous === posterTex && hasPoster()) videoBlend = 0;
    if (texture !== plateTex) videoBlend = 1; // Failure immediately discards the stale video.
    PL.uPlateMix.value = videoBlend;
    PL.tPlate.value = texture;
    PL.uHas.value = texture ? 1 : 0;
    if (texture === plateTex && texture) {
      PL.uPlateAspect.value = plate.videoWidth / plate.videoHeight;
      if (plateDirty || !plate.paused) { plateTex.needsUpdate = true; plateDirty = false; }
    } else if (texture === posterTex && texture) {
      PL.uPlateAspect.value = poster.naturalWidth / poster.naturalHeight;
    }
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    pass(bright, rtA);
    blurPass(rtA, rtB, 1, 0); blurPass(rtB, rtA, 0, 1); blurPass(rtA, rtB, 2.2, 0); blurPass(rtB, rtA, 0, 2.2);
    pass(comp, null);
    paintDirty = false;
  };
  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min((now - last0) / 1000, 0.05)); last0 = now;
    if (lost || document.hidden) return;
    if (paused) {
      // Resize clears the drawing buffer. Repaint the frozen scene without advancing it.
      if (paintDirty || PL.tPlate.value !== backdrop()) paint(backdrop());
      return;
    }
    if (!reduced) t += dt;
    videoBlend = reduced ? 1 : Math.min(1, videoBlend + dt / .6);
    const fPrev = fC;
    fC = reduced ? fT : fC + (fT - fC) * (1 - Math.exp(-dt * 1.8));
    litC += (lit - litC) * 0.06; pulse = Math.max(0, pulse - dt * 0.8);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.5);
    for (const n of NUM) T[n] += (toneT[n] - T[n]) * k;
    for (const n of VEC) for (let j = 0; j < 3; j++) T[n][j] += (toneT[n][j] - T[n][j]) * k;
    PL.uExp.value = T.exp; PL.uCon.value = T.con; PL.uSat.value = T.sat; PL.uSplit.value = T.split; PL.uDuo.value = T.duo; PL.uVig.value = T.vig;
    PL.uSh.value.set(...T.sh); PL.uHi.value.set(...T.hi); G.uGlow.value = T.glow; G.uHaze.value.set(...T.haze);
    PL.uAur.value = T.aur; PL.uStar.value = T.star; PL.uPaua.value = T.paua; comp.uniforms.uStreak.value = T.streak;
    U.uInk.value = T.ink * (opts.silhouette || 0) * (1 - PL.uKOn.value);
    bright.uniforms.uTh.value = T.th; comp.uniforms.uStrength.value = T.bloom + pulse * 0.5;
    kC += (kp - kC) * (reduced ? 1 : 0.2);
    if (mask) {
      const z = kZoom && !reduced ? smooth(kC / 0.92) : 0;
      PL.uKS.value = Math.exp(z * z * Math.log(28));
      PL.uKOn.value = kZoom && !reduced ? 1 - smooth((kC - 0.55) / 0.35) : 1 - smooth((kC - 0.2) / 0.5);
    }
    assign(fC); settle(fC, dt);
    const top = SLOTS.length - 1, a = Math.max(0, Math.min(top, Math.floor(fC))), b = Math.min(top, a + 1), e = smooth(fC - a);
    rig.position.x += ((wide ? SLOTS[a][2] + (SLOTS[b][2] - SLOTS[a][2]) * e : 0) - rig.position.x) * 0.06;
    cx += (px - cx) * 0.04; cy += (py - cy) * 0.04;
    const drift = 0.35 * Math.sin(fC * 1.1);
    camera.position.set(drift + cx * 0.5, 1.9 - cy * 0.3, 10.6);
    camera.lookAt(drift * 0.6, 1.8, 0);
    if (albOn && !introDone && t > 1.6) { introDone = true; launch(-1, 2.55); }
    if (albOn) for (const [th, dir, y] of TRIG) if (fPrev < th && fC >= th) launch(dir, y);
    for (const al of alb) { if (al.on) fly(al); trail(al); }
    G.uTime.value = t; G.uLit.value = litC; G.uPulse.value = pulse * pulse; G.uPtr.value.set(cx, -cy);
    paint(backdrop());
  };
  // Readiness means a painted frame, including an initially paused mount.
  paint(backdrop());
  raf = requestAnimationFrame(frame);
  return {
    setForm: f => { fT = Math.max(0, Math.min(SLOTS.length - 1, Math.round(f))); },
    setPointer: (x, y) => { px = x; py = y; },
    setLit: x => { lit = Math.max(0, Math.min(1, x)); },
    pulse: () => { pulse = 1; },
    setTone: name => { if (TONES[name]) toneT = toneOf(name); },
    setKnock: p => { kp = Math.max(0, Math.min(1, p)); },
    setKnockZoom: on => { kZoom = !!on; },
    setOutline: on => { PL.uKLine.value = typeof on === 'number' ? on : on ? 1 : 0; },
    setArrive: v => { if (!reduced) U.uArrive.value = Math.max(0, Math.min(1, v)); },
    setWait: v => { U.uWait.value = Math.max(0.1, Math.min(1, v)); },
    setGliders: on => { albOn = !!on; if (!albOn) alb.forEach(a => { a.on = false; a.mesh.visible = false; a.trail.hist.length = 0; a.trail.mesh.visible = false; }); },
    setGlass: on => { PL.uGlass.value = on ? 1 : 0; },
    setPaused: p => { paused = p; },
    setWide: w => { wide = w; },
    dispose: () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); canvas.removeEventListener('webglcontextlost', onLost); if (plate) { plate.removeEventListener('seeked', mark); plate.removeEventListener('loadeddata', mark); } if (plateTex) plateTex.dispose(); if (posterTex) posterTex.dispose(); if (mask) { mask.tex.dispose(); mask.bevel.dispose(); mask.tint.dispose(); } alb.forEach(a => { a.trail.g.dispose(); a.mesh.material.dispose(); }); trailMat.dispose(); albGeo.dispose(); rtScene.dispose(); rtA.dispose(); rtB.dispose(); renderer.dispose(); },
  };
}

// Page wiring shared by the assembl murmuration pages: scroll position → world shape, parallax, reveals, pointer, pause.
function attach({ canvas, preset, theme, plate, grade, onFail, engine, extra }) {
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches, paused = reduced, disposed = false;
  let io = null, api = null, raf = 0;
  const savedStyles = Array.from(document.querySelectorAll('[data-par], [data-rv]'), el => [el, el.style.transform, el.style.opacity, el.style.transition]);
  if (!reduced && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(es => es.forEach(e => { if (!paused && !disposed && e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-rv]').forEach(el => {
      const d = parseInt(el.getAttribute('data-rv'), 10) || 0;
      el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity .8s ease ${d}ms, transform 1s cubic-bezier(.16,1,.3,1) ${d}ms`;
      io.observe(el);
    });
  }
  const formAt = () => {
    const vc = innerHeight * 0.5, pts = [];
    document.querySelectorAll('[data-form]').forEach(el => {
      const r = el.getBoundingClientRect(), f = parseFloat(el.dataset.form);
      if (el.dataset.formFrom !== undefined) { pts.push([r.top + innerHeight * 0.5, parseFloat(el.dataset.formFrom)]); pts.push([r.bottom - innerHeight * 0.1, f]); }
      else pts.push([r.top + r.height / 2, f]);
    });
    if (!pts.length) return 0;
    if (vc <= pts[0][0]) return pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) { const [y0, f0] = pts[i], [y1, f1] = pts[i + 1]; if (vc <= y1) return f0 + (f1 - f0) * Math.min(1, Math.max(0, (vc - y0) / Math.max(1, y1 - y0))); }
    return pts[pts.length - 1][1];
  };
  const par = () => {
    if (reduced || paused || disposed) return;
    const vh = innerHeight;
    document.querySelectorAll('[data-par]').forEach(el => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = 'translate3d(0,' + (((r.top + r.height / 2) - vh / 2) * 0.12).toFixed(1) + 'px,0)'; });
  };
  const tick = () => { raf = 0; if (paused || reduced || disposed) return; if (api) api.setForm(formAt()); par(); };
  const onScroll = () => { if (!paused && !reduced && !disposed && !raf) raf = requestAnimationFrame(tick); };
  const onMove = e => { if (!paused && !reduced && !disposed && api) api.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1); };
  const onResize = () => { if (paused || reduced || disposed) return; if (api) api.setWide(innerWidth > 900); tick(); };
  const bindMotion = () => {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('resize', onResize);
  };
  const unbindMotion = () => {
    removeEventListener('scroll', onScroll);
    removeEventListener('pointermove', onMove);
    removeEventListener('resize', onResize);
  };
  if (!reduced) bindMotion();
  tick();
  const setPaused = p => {
    if (disposed) return;
    paused = Boolean(p) || reduced;
    if (api) api.setPaused(paused);
    document.documentElement.toggleAttribute('data-paused', paused);
    if (paused) {
      unbindMotion();
      document.querySelectorAll('[data-par]').forEach(el => { el.style.transform = 'none'; });
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      // Pausing must not strand unrevealed content at opacity zero.
      document.querySelectorAll('[data-rv]').forEach(el => { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; });
    } else { bindMotion(); onResize(); }
  };
  const onMotionChange = () => {
    reduced = motionQuery.matches;
    if (reduced) document.querySelectorAll('[data-par]').forEach(el => { el.style.transform = 'none'; });
    setPaused(paused || reduced);
  };
  motionQuery.addEventListener('change', onMotionChange);
  if (reduced) setPaused(true);
  const abort = new AbortController();
  const ready = mount(canvas, { preset, theme, plate, grade, ...(extra || {}), signal: abort.signal }).then(next => {
    if (disposed) { next.dispose(); return; }
    api = next;
    api.setPaused(paused || reduced);
    onResize();
  }).catch(err => {
    if (disposed) return;
    console.warn('assembl world unavailable', err);
    if (onFail) onFail();
  });
  return {
    ready,
    get api() { return api; },
    setPaused,
    dispose() { if (disposed) return; disposed = true; abort.abort(); motionQuery.removeEventListener('change', onMotionChange); savedStyles.forEach(([el, transform, opacity, transition]) => { el.style.transform = transform; el.style.opacity = opacity; el.style.transition = transition; }); unbindMotion(); if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); if (api) api.dispose(); document.documentElement.removeAttribute('data-paused'); },
  };
}

// ternGeometry is exported for the bird study artboard; it needs THREE before any mount has run
window.AssemblTide = { attach, mount, TONES, ternGeometry: chord => { THREE = window.THREE; return ternGeometry(chord); } };
})();
