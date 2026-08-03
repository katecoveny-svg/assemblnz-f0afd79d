/* Mechanical kitchen scale — meal kits.
 *
 * A household week, weighed. The box is chosen days before it is cooked, and in
 * between the week changes — so the object is the thing every kitchen trusts to
 * tell it what it actually has: a spring-and-rack dial scale. The mechanism has
 * to balance before the dial can read true, the needle only settles when the
 * weight is real, and the tare knob starts every week back at zero. That is the
 * meal-kit journey drawn as a machine: what the household is really carrying,
 * read honestly, before anything is packed.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. Assembled, the face reads as bands around the
 * dial centre (0, 15) so nothing important hides:
 *   0–13 hub · 13–74 needle throw · 94–96 graduations · 112 dial face edge
 *   · 112–126 bezel · 134 bezel screws · body 340 × 310 behind it all.
 *
 * Waves, base up: 1 body and feet · 2 mechanism · 3 fixings · 4 dial face
 * · 5 needle, bezel and crystal · 6 platform and bowl · 7 tare and badge.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

const TAU = Math.PI * 2;

/* dial-centred placement — most of the face lands on a circle around (0, 15) */
const DIAL = { x: 0, y: 15 };
const at = (rad, a, off = 0) => ({
  x: DIAL.x + Math.cos(a) * rad - Math.sin(a) * off,
  y: DIAL.y + Math.sin(a) * rad + Math.cos(a) * off,
});

/* ── 1 · body and feet · the base goes down first ──────────────── */
add({ id: 'back-plate', shape: 'rect', w: 300, h: 270, rad: 22, seed: 4,
  lay: { x: -40, y: -235 }, to: { x: 0, y: 50, rot: 0 },
  wave: 1, z: 0, finish: 'dark', label: 'back plate' });

add({ id: 'body-casting', shape: 'rect', w: 340, h: 310, rad: 34, seed: 2,
  lay: { x: 365, y: -195 }, to: { x: 0, y: 55, rot: 0 },
  wave: 1, z: 1, finish: 'cast', label: 'scale body' });

for (let i = 0; i < 2; i++) {
  add({ id: `cheek-${i}`, shape: 'rect', w: 22, h: 260, rad: 10,
    lay: { x: 137 + i * 29, y: -180 },
    to: { x: i ? 152 : -152, y: 55, rot: 0 },
    wave: 1, z: 2, finish: 'brushed', small: true });
}

add({ id: 'base-plate', shape: 'rect', w: 360, h: 26, rad: 6, grooves: 4, seed: 6,
  lay: { x: 330, y: 268 }, to: { x: 0, y: 218, rot: 0 },
  wave: 1, z: 2, finish: 'brushed', label: 'base plate' });

/* four rubber feet — the part that meets the bench */
[-135, -45, 45, 135].forEach((x, i) =>
  add({ id: `foot-${i}`, shape: 'rect', w: 30, h: 16, rad: 6,
    lay: { x: -535 + i * 44, y: 358 },
    to: { x, y: 240, rot: 0 },
    wave: 1, z: 2, finish: 'rubber', small: true,
    label: i === 0 ? 'feet' : undefined }));

/* ── 2 · mechanism · what has to balance before the dial can read ── */
for (let i = 0; i < 2; i++) {
  add({ id: `frame-rail-${i}`, shape: 'rect', w: 12, h: 180, rad: 3,
    lay: { x: -546 + i * 31, y: 190 },
    to: { x: i ? 118 : -118, y: 30, rot: 0 },
    wave: 2, z: 2, finish: 'cast', small: true });
}

add({ id: 'main-spring', shape: 'coil', r: 26, turns: 6,
  lay: { x: -480, y: 130 }, to: { x: 0, y: -40, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', label: 'main spring' });

for (let i = 0; i < 2; i++) {
  add({ id: `spring-${i}`, shape: 'coil', r: 14, turns: 4,
    lay: { x: -480, y: 190 + i * 40 },
    to: { x: i ? 70 : -70, y: -15, rot: 0 },
    wave: 2, z: 3, finish: 'brushed', small: true });
}

add({ id: 'rack', shape: 'rect', w: 16, h: 88, rad: 3, grooves: 5, seed: 8,
  lay: { x: -445, y: 150 }, to: { x: 34, y: -52, rot: 0 },
  wave: 2, z: 3, finish: 'polished', label: 'rack and pinion' });

for (let i = 0; i < 8; i++) {
  add({ id: `rack-tooth-${i}`, shape: 'rect', w: 10, h: 7, rad: 1.5,
    lay: { x: -420, y: 105 + i * 13 },
    to: { x: 22, y: -88 + i * 11, rot: 0 },
    wave: 2, z: 4, finish: 'brushed', small: true });
}

add({ id: 'pinion', shape: 'gear', r: 24, teeth: 14, seed: 7,
  lay: { x: -435, y: 255 }, to: { x: 0, y: 15, rot: 0 },
  wave: 2, z: 4, finish: 'brushed', spin: 1.4, label: 'pinion' });

add({ id: 'arbor', shape: 'disc', r: 7,
  lay: { x: -445, y: 292 }, to: { x: 0, y: 15, rot: 0 },
  wave: 2, z: 5, finish: 'polished', small: true });

/* three levers carry the platform load down to the rack. Polys rather than
   hands so the full length survives the sprite bounds. */
const leverPts = (L, t) => [[-L / 2, -t / 2], [L * 0.4, -t * 0.35], [L / 2, 0],
  [L * 0.4, t * 0.35], [-L / 2, t / 2]];
const LEVERS = [
  { w: 88, h: 6, lay: { x: -345, y: 295 }, to: { x: -46, y: -52, rot: 0.55 } },
  { w: 70, h: 6, lay: { x: -345, y: 320 }, to: { x: 52, y: 42, rot: -2.6 } },
  { w: 62, h: 5, lay: { x: -345, y: 345 }, to: { x: -52, y: 52, rot: 2.7 } },
];
LEVERS.forEach((l, i) =>
  add({ id: `lever-${i}`, shape: 'poly', w: l.w, h: l.h, points: leverPts(l.w, l.h),
    lay: l.lay, to: l.to,
    wave: 2, z: 3, finish: 'brushed', small: true,
    label: i === 0 ? 'levers' : undefined }));

[[-90, -75], [95, 55], [-95, 68]].forEach(([x, y], i) =>
  add({ id: `pivot-${i}`, shape: 'screw', r: 5.5,
    lay: { x: -282, y: 295 + i * 25 },
    to: { x, y, rot: 0.3 + i },
    wave: 2, z: 4, finish: 'polished', small: true }));

/* the damper — the part that stops the needle swinging past the truth */
add({ id: 'damper-cylinder', shape: 'rect', w: 24, h: 56, rad: 9,
  lay: { x: -250, y: 300 }, to: { x: -86, y: 60, rot: 0.15 },
  wave: 2, z: 2, finish: 'brushed', small: true });

add({ id: 'damper-piston', shape: 'bar', w: 8, h: 38,
  lay: { x: -222, y: 300 }, to: { x: -86, y: 18, rot: 0.15 },
  wave: 2, z: 2, finish: 'polished', small: true });

add({ id: 'stem', shape: 'rect', w: 18, h: 95, rad: 4, seed: 5,
  lay: { x: -440, y: -140 }, to: { x: 0, y: -148, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', label: 'platform stem' });

add({ id: 'stem-guide', shape: 'ring', r: 16, r2: 10,
  lay: { x: -398, y: -145 }, to: { x: 0, y: -100, rot: 0 },
  wave: 2, z: 4, finish: 'polished', small: true });

add({ id: 'calibration-screw', shape: 'screw', r: 6, cross: true,
  lay: { x: -95, y: 332 }, to: { x: 108, y: 174, rot: 0.6 },
  wave: 2, z: 9, finish: 'polished', small: true });

/* ── 3 · fixings · the small checks nobody sees ────────────────── */
/* ten around the bezel — none across the top, where the stem passes through */
const BEZEL_SCREWS = [0, 0.524, 1.047, 1.31, 1.83, 2.094, 2.618, 3.142, 3.665, 5.76];
BEZEL_SCREWS.forEach((a, i) =>
  add({ id: `screw-${i}`, shape: 'screw', r: 4,
    lay: { x: 415 + (i % 4) * 36, y: 300 + Math.floor(i / 4) * 22 },
    to: { ...at(134, a), rot: a },
    wave: 3, z: 9, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined }));

/* four at the body corners, two through the base plate */
[[-150, -85], [150, -85], [-150, 192], [150, 192]].forEach(([x, y], i) =>
  add({ id: `screw-c-${i}`, shape: 'screw', r: 4.4, cross: true,
    lay: i < 2 ? { x: 487 + i * 36, y: 344 } : { x: 415 + (i - 2) * 36, y: 366 },
    to: { x, y, rot: 0.5 * i },
    wave: 3, z: 3, finish: 'polished', small: true }));

for (let i = 0; i < 2; i++) {
  add({ id: `screw-b-${i}`, shape: 'screw', r: 4,
    lay: { x: 487 + i * 36, y: 366 },
    to: { x: i ? 60 : -60, y: 218, rot: 0.9 },
    wave: 3, z: 3, finish: 'polished', small: true });
}

/* washers behind the corner screws, and inside the movement */
const WASHERS = [[-150, -85], [150, -85], [-150, 192], [150, 192],
  [-40, -80], [40, -80], [-80, 55], [80, 55]];
WASHERS.forEach(([x, y], i) =>
  add({ id: `washer-${i}`, shape: 'ring', r: 6, r2: 3.5,
    lay: { x: 225 + i * 22, y: 310 },
    to: { x, y, rot: 0 },
    wave: 3, z: 2, finish: 'dark', small: true }));

const PINS = [
  [-20, -70, 0.4], [30, -30, -0.3], [-30, 40, 0.2],
  [40, 70, -0.5], [-60, 90, 0.3], [60, 90, -0.3],
];
PINS.forEach(([x, y, rot], i) =>
  add({ id: `pin-${i}`, shape: 'bar', w: 20, h: 4,
    lay: { x: 225 + i * 26, y: 340 },
    to: { x, y, rot },
    wave: 3, z: 4, finish: 'brushed', small: true }));

/* ── 4 · dial face · the week laid out where it can be read ────── */
add({ id: 'dial-face', shape: 'disc', r: 112, seed: 3,
  lay: { x: -10, y: 40 }, to: { x: 0, y: 15, rot: 0 },
  wave: 4, z: 8, finish: 'brushed', label: 'dial face' });

/* 32 graduations — every fourth one major, the way a scale is actually printed */
let minor = 0;
for (let i = 0; i < 32; i++) {
  const a = (i / 32) * TAU - Math.PI / 2;
  const major = i % 4 === 0;
  const lay = major
    ? { x: -64 + (i / 4) * 26, y: 240 }
    : { x: -60 + (minor % 8) * 26, y: 275 + Math.floor(minor / 8) * 25 };
  if (!major) minor++;
  add({ id: `grad-${i}`, shape: 'rect', w: major ? 7 : 3.5, h: major ? 16 : 9, rad: 0.8,
    lay,
    to: { ...at(major ? 94 : 96, a), rot: a + Math.PI / 2 },
    wave: 4, z: 9, finish: 'dark', small: true,
    label: i === 0 ? 'graduations' : undefined });
}

add({ id: 'zero-index', shape: 'trap', w: 12, h: 14, topW: 6,
  lay: { x: -100, y: 240 }, to: { x: 0, y: -59, rot: 0 },
  wave: 4, z: 10, finish: 'brass', small: true });

/* ── 5 · needle, bezel and crystal · the yes that packs the box ── */
/* the one part in this composition that carries colour. A poly with its pivot
   at the origin, so it swings around the hub and never clips its tip. */
add({ id: 'needle', shape: 'poly', w: 150, h: 12,
  points: [[-46, 0], [-40, -5], [-30, -6], [60, -2.6], [75, 0], [60, 2.6], [-30, 6], [-40, 5]],
  lay: { x: -315, y: 250 }, to: { x: 0, y: 15, rot: -1.05 },
  wave: 5, z: 11, finish: 'anodised', colour: '#77A222', spin: 2.2, label: 'needle' });

add({ id: 'needle-tail', shape: 'bar', w: 26, h: 7,
  lay: { x: -222, y: 250 }, to: { x: -15, y: 41, rot: -1.05 },
  wave: 5, z: 11, finish: 'dark', small: true });

add({ id: 'hub', shape: 'disc', r: 13,
  lay: { x: -170, y: 110 }, to: { x: 0, y: 15, rot: 0 },
  wave: 5, z: 12, finish: 'polished', small: true });

add({ id: 'hub-cap', shape: 'disc', r: 5.5,
  lay: { x: -170, y: 145 }, to: { x: 0, y: 15, rot: 0 },
  wave: 5, z: 13, finish: 'polished', small: true });

add({ id: 'bezel', shape: 'ring', r: 126, r2: 112, seed: 9,
  lay: { x: 330, y: 120 }, to: { x: 0, y: 15, rot: 0 },
  wave: 5, z: 10, finish: 'polished', label: 'bezel' });

for (let i = 0; i < 4; i++) {
  const a = Math.PI / 4 + i * (Math.PI / 2);
  add({ id: `clip-${i}`, shape: 'trap', w: 14, h: 10, topW: 8,
    lay: { x: -60 + i * 26, y: 200 },
    to: { ...at(119, a), rot: a + Math.PI / 2 },
    wave: 5, z: 11, finish: 'brushed', small: true });
}

add({ id: 'crystal', shape: 'disc', r: 108,
  lay: { x: -300, y: 110 }, to: { x: 0, y: 15, rot: 0 },
  wave: 5, z: 14, finish: 'glass', label: 'crystal' });

/* ── 6 · platform and bowl · what the box carries ──────────────── */
add({ id: 'platform-boss', shape: 'disc', r: 20,
  lay: { x: -505, y: -160 }, to: { x: 0, y: -178, rot: 0 },
  wave: 6, z: 5, finish: 'brushed', small: true });

add({ id: 'platform', shape: 'rect', w: 260, h: 18, rad: 8, seed: 10,
  lay: { x: -390, y: -205 }, to: { x: 0, y: -192, rot: 0 },
  wave: 6, z: 6, finish: 'polished', label: 'platform' });

add({ id: 'bowl-base', shape: 'bar', w: 120, h: 7,
  lay: { x: -390, y: -238 }, to: { x: 0, y: -205, rot: 0 },
  wave: 6, z: 6, finish: 'brushed', small: true });

add({ id: 'bowl', shape: 'poly', w: 300, h: 66, seed: 11,
  points: [[-150, -33], [-150, -29], [-132, -14], [-104, 6], [-66, 22], [-20, 30],
    [20, 30], [66, 22], [104, 6], [132, -14], [150, -29], [150, -33]],
  lay: { x: -390, y: -320 }, to: { x: 0, y: -240, rot: 0 },
  wave: 6, z: 7, finish: 'brushed', label: 'the bowl' });

add({ id: 'bowl-rim', shape: 'bar', w: 306, h: 9,
  lay: { x: -390, y: -262 }, to: { x: 0, y: -274, rot: 0 },
  wave: 6, z: 8, finish: 'polished', small: true });

/* ── 7 · tare and badge · back to zero each week ───────────────── */
add({ id: 'tare-knob', shape: 'tyre', r: 26, r2: 10,
  lay: { x: -150, y: 255 }, to: { x: 0, y: 178, rot: 0 },
  wave: 7, z: 9, finish: 'polished', spin: 0.8, label: 'tare knob' });

add({ id: 'badge', shape: 'rect', w: 84, h: 20, rad: 5, seed: 12,
  lay: { x: -150, y: 300 }, to: { x: -104, y: 178, rot: 0 },
  wave: 7, z: 9, finish: 'brushed', small: true });

for (let i = 0; i < 2; i++) {
  add({ id: `rivet-${i}`, shape: 'screw', r: 2.5,
    lay: { x: -165 + i * 30, y: 330 },
    to: { x: i ? -74 : -134, y: 178, rot: 0 },
    wave: 7, z: 10, finish: 'polished', small: true });
}

export const scale = {
  /* "the actual thing" — the scale's own front elevation, drawn on the sheet the
     way a maker's drawing sits behind the parts. It fades as the parts leave
     the paper. */
  underlay(c, ink) {
    const X = 30, Y = 20;                  /* elevation block, centre of sheet */
    c.strokeStyle = ink; c.fillStyle = ink;
    c.lineJoin = 'round'; c.lineCap = 'round';
    /* body outline */
    c.lineWidth = 1.6;
    const bw = 260, bh = 240, r = 26;
    c.beginPath();
    c.moveTo(X - bw / 2 + r, Y - bh / 2 + 45);
    c.arcTo(X + bw / 2, Y - bh / 2 + 45, X + bw / 2, Y + bh / 2 + 45, r);
    c.arcTo(X + bw / 2, Y + bh / 2 + 45, X - bw / 2, Y + bh / 2 + 45, r);
    c.arcTo(X - bw / 2, Y + bh / 2 + 45, X - bw / 2, Y - bh / 2 + 45, r);
    c.arcTo(X - bw / 2, Y - bh / 2 + 45, X + bw / 2, Y - bh / 2 + 45, r);
    c.closePath(); c.stroke();
    /* dial with crosshair, and the resting needle */
    c.lineWidth = 1.1;
    c.beginPath(); c.arc(X, Y + 12, 90, 0, TAU); c.stroke();
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(X - 102, Y + 12); c.lineTo(X + 102, Y + 12);
    c.moveTo(X, Y - 90); c.lineTo(X, Y + 114);
    c.stroke();
    c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(X, Y + 12); c.lineTo(X + 40, Y - 52); c.stroke();
    /* stem, platform and bowl */
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(X - 7, Y - 75); c.lineTo(X - 7, Y - 132);
    c.moveTo(X + 7, Y - 75); c.lineTo(X + 7, Y - 132);
    c.moveTo(X - 100, Y - 138); c.lineTo(X + 100, Y - 138);
    c.stroke();
    c.beginPath();
    c.moveTo(X - 115, Y - 172);
    c.quadraticCurveTo(X, Y - 128, X + 115, Y - 172);
    c.stroke();
    /* feet and the bench line */
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(X - 105, Y + 165); c.lineTo(X - 75, Y + 165);
    c.moveTo(X + 75, Y + 165); c.lineTo(X + 105, Y + 165);
    c.stroke();
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(X - 165, Y + 172); c.lineTo(X + 165, Y + 172); c.stroke();
    /* overall-height dimension string, the way a maker would check it */
    c.lineWidth = 0.65;
    const dx = X - 185;
    c.beginPath();
    c.moveTo(dx, Y - 172); c.lineTo(dx, Y + 172);
    c.moveTo(dx - 5, Y - 172); c.lineTo(dx + 5, Y - 172);
    c.moveTo(dx - 5, Y + 172); c.lineTo(dx + 5, Y + 172);
    c.stroke();
  },
  name: 'mechanical kitchen scale',
  board: { w: 1180, h: 800 },
  /* a tall object: the bowl rim and the feet both have to clear the frame, so
     the zoom stays modest — the presence comes from the height, not the crop */
  zoom: 0.98,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['body casting, base plate and feet', 'the order as you chose it — everything else fits to this'],
    ['main spring, rack and pinion, levers and damper', 'the week’s moving parts: busy nights, activities, what is already in the fridge — all balancing before anything is packed'],
    ['screws, pins and washers', 'the small checks nobody sees — lunches counted, staples noticed, before the order locks'],
    ['dial face and graduations', 'the week laid out where the household can actually read it'],
    ['needle, bezel and crystal', 'the needle settles only when the weight is real — and the box changes only on your yes'],
    ['platform and bowl', 'what the box carries: the fast meal on the busy night, tomorrow’s lunch from tonight’s leftovers'],
    ['tare knob and maker’s badge', 'back to zero each week — the record of what changed, and why, with your name on the yes'],
  ],
};
