/* Swiss chronograph — the canonical assembl object.
 *
 * A watch *is* the wait. Every part of one, knolled on paper, then assembled.
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family. That deliberateness is the whole appeal of knolling — auto-flow it and
 * it stops being a photograph and becomes a chart.
 *
 * Waves, inside out: 1 chassis · 2 mechanism · 3 fasteners · 4 face · 5 indicators
 * · 6 enclosure · 7 attachment.
 *
 * Board is 960 × 640, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

/* ── 7 · bracelet · two columns of links, left and right ───────── */
const LINK_W = 62, LINK_H = 26;
for (let side = 0; side < 2; side++) {
  const sx = side ? 1 : -1;
  for (let i = 0; i < 6; i++) {
    add({
      id: `link-${side}-${i}`, shape: 'rect', w: LINK_W, h: LINK_H, rad: 5, grooves: 7,
      lay: { x: 470 + side * 74, y: -300 + i * 42 },
      to: { x: 0, y: sx * (128 + i * 30), rot: Math.PI / 2 },
      wave: 7, z: 1, finish: 'polished',
      label: side === 0 && i === 0 ? 'bracelet links' : undefined,
    });
  }
  /* narrower taper links, further out */
  for (let i = 0; i < 4; i++) {
    add({
      id: `taper-${side}-${i}`, shape: 'rect', w: 46, h: 22, rad: 4, grooves: 5,
      lay: { x: 470 + side * 74, y: -40 + i * 30 },
      to: { x: 0, y: sx * (308 + i * 26), rot: Math.PI / 2 },
      wave: 7, z: 1, finish: 'polished', small: true,
    });
  }
}

/* clasp */
add({ id: 'clasp-a', shape: 'rect', w: 42, h: 96, rad: 6,
  lay: { x: 470, y: 132 }, to: { x: 0, y: 430, rot: Math.PI / 2 },
  wave: 7, z: 1, finish: 'brushed', small: true, label: 'clasp' });
add({ id: 'clasp-b', shape: 'rect', w: 30, h: 74, rad: 5,
  lay: { x: 544, y: 126 }, to: { x: 0, y: -430, rot: Math.PI / 2 },
  wave: 7, z: 1, finish: 'brushed', small: true });

/* spring bars */
for (let i = 0; i < 4; i++) {
  add({ id: `bar-${i}`, shape: 'bar', w: 76, h: 5,
    lay: { x: 150, y: -186 + i * 20 },
    to: { x: 0, y: (i < 2 ? -1 : 1) * 112, rot: Math.PI / 2 },
    wave: 3, z: 0, finish: 'polished', small: true,
    label: i === 0 ? 'spring bars' : undefined });
}

/* ── 6 · enclosure ─────────────────────────────────────────────── */
add({ id: 'case', shape: 'ring', r: 118, r2: 96,
  lay: { x: -300, y: -60 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 9, finish: 'polished', label: 'case' });

add({ id: 'bezel', shape: 'ring', r: 100, r2: 84,
  lay: { x: -58, y: -60 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 10, finish: 'brushed', label: 'bezel' });

add({ id: 'crystal', shape: 'disc', r: 88,
  lay: { x: 300, y: 158 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 11, finish: 'glass', label: 'crystal' });

add({ id: 'caseback', shape: 'disc', r: 92,
  lay: { x: -300, y: 158 }, to: { x: 0, y: 0, rot: 0 },
  wave: 1, z: 0, finish: 'dark', label: 'caseback' });

add({ id: 'gasket', shape: 'ring', r: 90, r2: 84, finishOverride: 1,
  lay: { x: -90, y: 158 }, to: { x: 0, y: 0, rot: 0 },
  wave: 1, z: 1, finish: 'rubber', label: 'gasket' });

/* crown and pushers — the accent. the part the human turns. */
add({ id: 'crown', shape: 'rect', w: 22, h: 26, rad: 5, grooves: 6,
  lay: { x: 252, y: -186 }, to: { x: 122, y: 0, rot: 0 },
  wave: 6, z: 8, finish: 'anodised', colour: '#C4602A', label: 'crown' });
add({ id: 'pusher-a', shape: 'rect', w: 16, h: 18, rad: 4,
  lay: { x: 292, y: -194 }, to: { x: 116, y: -44, rot: -0.5 },
  wave: 6, z: 8, finish: 'polished', small: true });
add({ id: 'pusher-b', shape: 'rect', w: 16, h: 18, rad: 4,
  lay: { x: 292, y: -162 }, to: { x: 116, y: 44, rot: 0.5 },
  wave: 6, z: 8, finish: 'polished', small: true });

/* ── 4 · face ──────────────────────────────────────────────────── */
add({ id: 'dial', shape: 'disc', r: 82,
  lay: { x: 110, y: 158 }, to: { x: 0, y: 0, rot: 0 },
  wave: 4, z: 5, finish: 'dark', label: 'dial' });

add({ id: 'subdial-l', shape: 'disc', r: 26,
  lay: { x: 470, y: 300 }, to: { x: -36, y: -12, rot: 0 },
  wave: 4, z: 6, finish: 'brushed', small: true });
add({ id: 'subdial-r', shape: 'disc', r: 26,
  lay: { x: 470, y: 360 }, to: { x: 36, y: -12, rot: 0 },
  wave: 4, z: 6, finish: 'brushed', small: true });

/* chapter ring — index marks, generated */
for (let i = 0; i < 60; i++) {
  const a = (i / 60) * Math.PI * 2;
  const major = i % 5 === 0;
  add({
    id: `idx-${i}`, shape: 'rect', w: major ? 9 : 5, h: major ? 3 : 1.6, rad: 0.6,
    lay: { x: -352 + (i % 20) * 7.2, y: 286 + Math.floor(i / 20) * 11 },
    to: { x: Math.cos(a - Math.PI / 2) * 70, y: Math.sin(a - Math.PI / 2) * 70, rot: a },
    wave: 4, z: 6, finish: 'polished', small: true,
    label: i === 0 ? 'index marks' : undefined,
  });
}

/* ── 5 · indicators ────────────────────────────────────────────── */
add({ id: 'hand-h', shape: 'hand', w: 48, h: 7,
  lay: { x: 30, y: 262 }, to: { x: 0, y: 0, rot: -1.05 },
  wave: 5, z: 7, finish: 'polished', label: 'hands' });
add({ id: 'hand-m', shape: 'hand', w: 68, h: 6,
  lay: { x: 30, y: 292 }, to: { x: 0, y: 0, rot: 1.4 },
  wave: 5, z: 7, finish: 'polished' });
add({ id: 'hand-s', shape: 'hand', w: 74, h: 3,
  lay: { x: 30, y: 322 }, to: { x: 0, y: 0, rot: 2.6 },
  wave: 5, z: 8, finish: 'anodised', colour: '#C4602A' });
add({ id: 'hand-sub-l', shape: 'hand', w: 20, h: 2.4,
  lay: { x: 148, y: 268 }, to: { x: -36, y: -12, rot: -2.1 },
  wave: 5, z: 8, finish: 'polished', small: true });
add({ id: 'hand-sub-r', shape: 'hand', w: 20, h: 2.4,
  lay: { x: 148, y: 300 }, to: { x: 36, y: -12, rot: 0.7 },
  wave: 5, z: 8, finish: 'polished', small: true });

/* ── 2 · mechanism ─────────────────────────────────────────────── */
add({ id: 'mainplate', shape: 'plate', r: 76, seed: 1,
  holes: [[-30, -18, 6], [26, -24, 5], [12, 30, 7], [-38, 26, 4], [44, 10, 4]],
  lay: { x: 130, y: -60 }, to: { x: 0, y: 0, rot: 0 },
  wave: 2, z: 2, finish: 'brushed', label: 'main plate' });

add({ id: 'bridge', shape: 'plate', r: 52, seed: 4,
  holes: [[-16, -10, 4], [18, 14, 5]],
  lay: { x: 272, y: -60 }, to: { x: -6, y: 6, rot: 0.4 },
  wave: 2, z: 3, finish: 'brushed', label: 'bridge' });

/* wheel train */
const WHEELS = [
  { r: 30, teeth: 30, x: -34, y: -20, spin: 1.0 },
  { r: 22, teeth: 24, x: 6, y: -30, spin: -1.6 },
  { r: 26, teeth: 26, x: 30, y: 14, spin: 1.3 },
  { r: 16, teeth: 18, x: -18, y: 26, spin: -2.2 },
];
WHEELS.forEach((w, i) => add({
  id: `wheel-${i}`, shape: 'gear', r: w.r, teeth: w.teeth, spokes: 4,
  lay: { x: -352 + i * 76, y: -286 },
  to: { x: w.x, y: w.y, rot: 0 },
  wave: 2, z: 4, finish: 'polished', spin: w.spin,
  label: i === 0 ? 'wheel train' : undefined,
}));

add({ id: 'balance', shape: 'gear', r: 34, teeth: 4, spokes: 3,
  lay: { x: -46, y: -286 }, to: { x: 44, y: -34, rot: 0 },
  wave: 2, z: 4, finish: 'polished', spin: -0.8, label: 'balance' });

add({ id: 'hairspring', shape: 'coil', r: 18, turns: 6,
  lay: { x: 26, y: -286 }, to: { x: 44, y: -34, rot: 0 },
  wave: 2, z: 5, finish: 'brushed', small: true, label: 'hairspring' });

add({ id: 'battery', shape: 'disc', r: 22, hole: 0,
  lay: { x: 90, y: -286 }, to: { x: -18, y: 34, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', label: 'cell' });

add({ id: 'rotor', shape: 'plate', r: 58, seed: 9,
  holes: [[0, 0, 8]],
  lay: { x: 176, y: -286 }, to: { x: 0, y: 0, rot: 0.9 },
  wave: 2, z: 4, finish: 'polished', spin: 0.4, small: true });

add({ id: 'circuit', shape: 'plate', r: 44, seed: 6,
  holes: [[-14, -8, 3], [10, 12, 3], [20, -14, 2]],
  lay: { x: 274, y: -286 }, to: { x: 10, y: 10, rot: -0.3 },
  wave: 2, z: 3, finish: 'dark', small: true });

/* levers and springs — the chronograph work */
[[-352, -180, 0.4], [-284, -180, -0.7], [-216, -180, 1.1]].forEach(([x, y, rot], i) =>
  add({ id: `lever-${i}`, shape: 'hand', w: 34, h: 4,
    lay: { x, y }, to: { x: -20 + i * 22, y: -46 + i * 8, rot },
    wave: 2, z: 5, finish: 'brushed', small: true,
    label: i === 0 ? 'levers' : undefined }));

/* ── 3 · fasteners ─────────────────────────────────────────────── */
for (let i = 0; i < 24; i++) {
  const col = i % 8, row = Math.floor(i / 8);
  const a = (i / 24) * Math.PI * 2;
  const rr = 58 + (i % 3) * 12;
  add({
    id: `screw-${i}`, shape: 'screw', r: 3.4 + (i % 3) * 0.7,
    lay: { x: -160 + col * 19, y: -186 + row * 19 },
    to: { x: Math.cos(a) * rr, y: Math.sin(a) * rr, rot: a },
    wave: 3, z: 6, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined,
  });
}
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  add({
    id: `jewel-${i}`, shape: 'disc', r: 2.6,
    lay: { x: -160 + i * 19, y: -128 },
    to: { x: Math.cos(a) * 30, y: Math.sin(a) * 30, rot: 0 },
    wave: 3, z: 5, finish: 'anodised', colour: '#C4602A', small: true,
    label: i === 0 ? 'jewels' : undefined,
  });
}

export const watch = {
  name: 'Swiss chronograph',
  board: { w: 1180, h: 800 },
  zoom: 1.9,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['caseback and gasket', 'what everything else is built onto'],
    ['main plate, bridge and wheel train', 'the mechanism that does the actual work'],
    ['screws and jewels', 'the small parts nobody sees that stop it wearing out'],
    ['dial, subdials and index marks', 'the face — what the customer reads'],
    ['hands', 'the part your eye follows'],
    ['case, bezel and crystal', 'the enclosure that keeps it honest'],
    ['bracelet and clasp', 'how it attaches to the person'],
  ],
};
