/* Bank vault combination lock and bolt work — personal lending.
 *
 * A decision that has to be right, made of wheels that have to line up. Three
 * combination wheels, three gates. Only when all three gates come round together
 * does the fence drop into them, and only then can the lever fall and the bolts
 * throw. That is an affordability assessment drawn as a mechanism: income,
 * obligations and evidence all have to agree before anyone can say yes.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. That deliberateness is the whole appeal of
 * knolling — auto-flow it and it stops being a photograph and becomes a chart.
 *
 * Assembled, the part radii are laid out as bands that do not collide, so the
 * finished lock reads face-on as a set of concentric rings around the dial:
 *   14–39 dial · 39–53 dial ring · 54–60 escutcheon · 61–73, 76–88, 92–104 wheels
 *   · 108–119 bolt carrier · 126–138 cover plate · 116–221 bolts · 230 bolt tips.
 * Get those bands wrong and the wheel pack disappears behind the cover.
 *
 * Waves, inside out: 1 case · 2 wheel pack · 3 fixings · 4 fence and lever
 * · 5 bolt work · 6 cover and dial · 7 mounting.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

const TAU = Math.PI * 2;

/* Almost every part of a lock lands somewhere on a circle, so assembled positions
   are given as a radius, an angle, and an offset square to that angle. */
const at = (rad, a, off = 0) => ({
  x: Math.cos(a) * rad - Math.sin(a) * off,
  y: Math.sin(a) * rad + Math.cos(a) * off,
});

/* ── 7 · mounting · the door the lock is bolted to ─────────────── */
add({ id: 'door-plate', shape: 'rect', w: 332, h: 332, rad: 18, seed: 5,
  lay: { x: -414, y: -222 }, to: { x: 0, y: 0, rot: 0 },
  wave: 7, z: 0, finish: 'cast', label: 'door plate' });

/* three hinges, down the shut edge, just outside the plate */
for (let i = 0; i < 3; i++) {
  add({ id: `hinge-${i}`, shape: 'rect', w: 26, h: 48, rad: 4, grooves: 3,
    lay: { x: 318, y: 8 + i * 58 },
    to: { x: -184, y: -94 + i * 94, rot: 0 },
    wave: 7, z: 1, finish: 'brushed', small: true });
}

/* the escutcheon rides with the dial, so it is knolled with the dial family */
add({ id: 'escutcheon', shape: 'ring', r: 60, r2: 54,
  lay: { x: 110, y: -70 }, to: { x: 0, y: 0, rot: 0 },
  wave: 7, z: 12, finish: 'polished', label: 'escutcheon' });

/* corner anchor bolts — through the door plate, outside the cover */
[[136, 136], [-136, 136], [-136, -136], [136, -136]].forEach(([x, y], i) =>
  add({ id: `anchor-${i}`, shape: 'screw', r: 6, cross: true,
    lay: { x: 364, y: 8 + i * 30 }, to: { x, y, rot: 0.4 },
    wave: 7, z: 2, finish: 'brushed', small: true }));

/* ── 1 · case · what everything else is built onto ─────────────── */
add({ id: 'lock-body', shape: 'rect', w: 284, h: 284, rad: 12, seed: 2,
  lay: { x: 438, y: -246 }, to: { x: 0, y: 0, rot: 0 },
  wave: 1, z: 1, finish: 'cast', label: 'lock body' });

add({ id: 'boss', shape: 'disc', r: 24,
  lay: { x: 322, y: -68 }, to: { x: 0, y: 0, rot: 0 },
  wave: 1, z: 2, finish: 'brass', label: 'mounting boss' });

for (let i = 0; i < 2; i++) {
  add({ id: `rib-${i}`, shape: 'rect', w: 86, h: 13, rad: 3,
    lay: { x: 420, y: -80 + i * 20 },
    to: { x: 0, y: i ? 112 : -112, rot: 0 },
    wave: 1, z: 2, finish: 'brushed', small: true });
}

/* ── 2 · wheel pack · the three that have to agree ─────────────── */
/* Different radii, different gate positions, different speeds. If they all looked
   and turned the same there would be no story in them. */
const WHEELS = [
  { r: 104, r2: 92, mid: 98, gate: -1.00, spin: 0.90,  finish: 'brass',    lay: { x: -476, y: 60 } },
  { r: 88,  r2: 76, mid: 82, gate: 2.70,  spin: -1.35, finish: 'polished', lay: { x: -492, y: 262 } },
  { r: 73,  r2: 61, mid: 67, gate: 0.90,  spin: 1.80,  finish: 'brushed',  lay: { x: -322, y: 260 } },
];

WHEELS.forEach((w, i) => {
  add({ id: `wheel-${i}`, shape: 'tyre', r: w.r, r2: w.r2, seed: 3 + i,
    lay: w.lay, to: { x: 0, y: 0, rot: 0 },
    wave: 2, z: 4 + i, finish: w.finish, spin: w.spin,
    label: i === 0 ? 'combination wheels' : undefined });

  /* the gate — the notch the fence has to find */
  add({ id: `gate-${i}`, shape: 'trap', w: 16, h: 12, topW: 9,
    lay: { x: -350 + i * 28, y: 132 },
    to: { ...at(w.mid, w.gate), rot: w.gate + Math.PI / 2 },
    wave: 2, z: 7, finish: 'dark', small: true });
});

add({ id: 'drive-cam', shape: 'plate', r: 28, seed: 7,
  holes: [[-9, -5, 4], [8, 7, 4]],
  lay: { x: -322, y: 0 }, to: { x: 0, y: 0, rot: 0 },
  wave: 2, z: 7, finish: 'brass', spin: 0.6, label: 'drive cam' });

add({ id: 'cam-follower', shape: 'hand', w: 26, h: 5,
  lay: { x: -322, y: 162 }, to: { x: 0, y: 0, rot: -0.6 },
  wave: 2, z: 8, finish: 'polished', small: true });

add({ id: 'spindle', shape: 'disc', r: 11,
  lay: { x: -322, y: 48 }, to: { x: 0, y: 0, rot: 0 },
  wave: 2, z: 8, finish: 'polished' });

add({ id: 'spindle-collar', shape: 'ring', r: 15, r2: 10,
  lay: { x: -322, y: 90 }, to: { x: 0, y: 0, rot: 0 },
  wave: 2, z: 9, finish: 'brushed', small: true });

/* ── 4 · fence and lever · the parts that fall when the wheels agree ── */
/* The lever is a poly rather than a hand so the full length survives the sprite
   bounds. It is the one part in this composition that carries colour. */
add({ id: 'lever', shape: 'poly', w: 132, h: 22,
  points: [[-66, -8], [-51, -11], [40, -6], [66, -3], [66, 3], [40, 6], [-51, 11], [-66, 8]],
  lay: { x: -170, y: 110 }, to: { x: -26, y: -96, rot: 0.16 },
  wave: 4, z: 11, finish: 'anodised', colour: '#056268', label: 'lever' });

add({ id: 'fence', shape: 'bar', w: 110, h: 8,
  lay: { x: -180, y: 142 }, to: { x: -26, y: -82, rot: 0.16 },
  wave: 4, z: 9, finish: 'polished', label: 'fence' });

add({ id: 'lever-spring', shape: 'coil', r: 13, turns: 5,
  lay: { x: -222, y: 176 }, to: { x: -86, y: -118, rot: 0 },
  wave: 4, z: 11, finish: 'brushed', small: true });

add({ id: 'lever-pivot', shape: 'screw', r: 7,
  lay: { x: -186, y: 176 }, to: { x: -92, y: -104, rot: 0.3 },
  wave: 4, z: 12, finish: 'polished', small: true });

add({ id: 'fence-pin', shape: 'screw', r: 6,
  lay: { x: -158, y: 176 }, to: { x: -26, y: -82, rot: -0.4 },
  wave: 4, z: 12, finish: 'polished', small: true });

add({ id: 'lever-nose', shape: 'trap', w: 18, h: 12, topW: 10,
  lay: { x: -128, y: 176 }, to: { x: 36, y: -84, rot: 0.16 },
  wave: 4, z: 12, finish: 'brushed', small: true });

add({ id: 'detent', shape: 'hand', w: 28, h: 5,
  lay: { x: -86, y: 176 }, to: { x: 52, y: -116, rot: 0.8 },
  wave: 4, z: 12, finish: 'brushed', small: true });

/* ── 5 · bolt work · what actually moves ───────────────────────── */
add({ id: 'bolt-carrier', shape: 'ring', r: 119, r2: 108,
  lay: { x: 167, y: -269 }, to: { x: 0, y: 0, rot: 0 },
  wave: 5, z: 3, finish: 'cast', label: 'bolt carrier' });

/* four bolts, thrown out at 90° — right, bottom, left, top */
const THROW = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

THROW.forEach((a, i) => {
  add({ id: `bolt-${i}`, shape: 'rect', w: 105, h: 28, rad: 4, grooves: 5, seed: 8 + i,
    lay: { x: -181, y: -80 + i * 44 },
    to: { ...at(168, a), rot: a },
    wave: 5, z: 4, finish: 'polished',
    label: i === 0 ? 'bolts' : undefined });

  add({ id: `bolt-tip-${i}`, shape: 'trap', w: 28, h: 24, topW: 14,
    lay: { x: -100, y: -80 + i * 44 },
    to: { ...at(230, a), rot: a + Math.PI / 2 },
    wave: 5, z: 4, finish: 'brushed', small: true });

  add({ id: `bolt-guide-${i}`, shape: 'rect', w: 40, h: 20, rad: 3,
    lay: { x: -46, y: -80 + i * 44 },
    to: { ...at(119, a), rot: a },
    wave: 5, z: 3, finish: 'dark', small: true });
});

/* rack teeth along each bolt — the carrier drives all four together */
for (let i = 0; i < 20; i++) {
  const b = Math.floor(i / 5), k = i % 5, a = THROW[b];
  add({ id: `tooth-${i}`, shape: 'rect', w: 14, h: 9, rad: 1.5,
    lay: { x: -226 + (i % 5) * 40, y: 230 + Math.floor(i / 5) * 26 },
    to: { ...at(130 + k * 18, a, -21), rot: a },
    wave: 5, z: 5, finish: 'brushed', small: true,
    label: i === 0 ? 'bolt teeth' : undefined });
}

/* ── 6 · cover and dial · the face the customer reads ──────────── */
add({ id: 'cover-plate', shape: 'ring', r: 138, r2: 126, seed: 6,
  lay: { x: -100, y: -250 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 10, finish: 'brushed', label: 'cover plate' });

add({ id: 'dial-ring', shape: 'ring', r: 53, r2: 39,
  lay: { x: 231, y: -77 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 12, finish: 'brass', label: 'dial ring' });

add({ id: 'dial', shape: 'tyre', r: 39, r2: 14,
  lay: { x: 91, y: 40 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 13, finish: 'polished', label: 'knurled dial' });

add({ id: 'index-mark', shape: 'rect', w: 7, h: 17, rad: 2,
  lay: { x: 152, y: 40 }, to: { x: 0, y: -58, rot: 0 },
  wave: 6, z: 14, finish: 'brass', small: true });

add({ id: 'spindle-cap', shape: 'disc', r: 10,
  lay: { x: 180, y: 40 }, to: { x: 0, y: 0, rot: 0 },
  wave: 6, z: 15, finish: 'polished', small: true });

/* knurling on the dial edge */
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * TAU;
  add({ id: `knurl-${i}`, shape: 'rect', w: 3, h: 12, rad: 0.8,
    lay: { x: 56 + i * 18, y: 140 },
    to: { ...at(27, a), rot: a + Math.PI / 2 },
    wave: 6, z: 14, finish: 'polished', small: true });
}

/* dial graduations — every sixth one long, the way a dial is actually numbered */
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * TAU - Math.PI / 2;
  const major = i % 6 === 0;
  add({ id: `grad-${i}`, shape: 'rect', w: major ? 7 : 4, h: major ? 12 : 10, rad: 0.8,
    lay: { x: 56 + (i % 6) * 38, y: 190 + Math.floor(i / 6) * 30 },
    to: { ...at(46, a), rot: a + Math.PI / 2 },
    wave: 6, z: 13, finish: 'dark', small: true });
}

/* ── 3 · fixings · the small parts nobody sees ─────────────────── */
for (let i = 0; i < 20; i++) {
  const a = (i / 20) * TAU;
  add({ id: `screw-${i}`, shape: 'screw', r: 3.4 + (i % 3) * 0.7,
    lay: { x: 310 + (i % 7) * 36, y: 188 + Math.floor(i / 7) * 36 },
    to: { ...at(132, a), rot: a },
    wave: 3, z: 12, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined });
}

for (let i = 0; i < 8; i++) {
  const a = (i / 8) * TAU + 0.4;
  add({ id: `pin-${i}`, shape: 'bar', w: 22, h: 4,
    lay: { x: 316 + (i % 4) * 60, y: 296 + Math.floor(i / 4) * 24 },
    to: { ...at(113, a), rot: a },
    wave: 3, z: 9, finish: 'brushed', small: true });
}

for (let i = 0; i < 10; i++) {
  const a = (i / 10) * TAU + TAU / 40;
  add({ id: `washer-${i}`, shape: 'ring', r: 6, r2: 3.4,
    lay: { x: 310 + i * 26, y: 356 },
    to: { ...at(132, a), rot: 0 },
    wave: 3, z: 11, finish: 'dark', small: true });
}

export const vault = {
  name: 'vault lock and bolt work',
  board: { w: 1180, h: 800 },
  /* the bolts throw almost to the edge of the frame at this zoom, which is the
     point of them — a lock that opens by moving metal a long way */
  zoom: 1.6,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['lock body and mounting boss', 'the application already submitted — everything else is built onto it'],
    ['three combination wheels, drive cam and spindle', 'income, obligations and evidence. all three have to line up before anyone can say yes'],
    ['screws, pins and washers', 'the small checks nobody sees, which are the ones that stop a file being sent back'],
    ['fence and lever', 'the moment the wheels agree and a person can finally make the call'],
    ['four bolts and the bolt carrier', 'what actually moves — money released, or not'],
    ['knurled dial, index mark and cover plate', 'the face the customer reads: what was counted, and what it was measured against'],
    ['door plate, hinges and escutcheon', 'the lender systems all of this has to bolt onto'],
  ],
};
