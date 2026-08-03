/* Dial electricity meter — energy.
 *
 * The one machine every household already trusts to tell it the truth about
 * power. A bill is only this meter's reading with a price on it — so the object
 * is the meter itself: coils that feel the house, a disc that turns when the
 * house does, a register that counts where anyone can read it, and lead seals
 * because the reading has to be beyond argument. That is the energy journey
 * drawn as a machine: the number, itemised into the work that made it.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. Assembled, the face reads as bands around the
 * dial centre (0, -40):
 *   16 register dials · 104 crystal · 108 faceplate edge · 108–122 bezel
 *   · 130 bezel screws · case 280 × 330 behind it, terminals below.
 *
 * Waves, board up: 1 case and terminals · 2 coils and gears · 3 fixings
 * · 4 register and faceplate · 5 the disc · 6 bezel and glass · 7 seals.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

const TAU = Math.PI * 2;

/* face-centred placement — the register face sits above the disc slot */
const FACE = { x: 0, y: -40 };
const at = (rad, a, off = 0) => ({
  x: FACE.x + Math.cos(a) * rad - Math.sin(a) * off,
  y: FACE.y + Math.sin(a) * rad + Math.cos(a) * off,
});

/* ── 1 · case and terminals · the case goes up first ───────────── */
add({ id: 'backplate', shape: 'rect', w: 250, h: 300, rad: 16, seed: 4,
  lay: { x: 80, y: -225 }, to: { x: 0, y: 25, rot: 0 },
  wave: 1, z: 0, finish: 'dark', label: 'backplate' });

add({ id: 'case', shape: 'rect', w: 280, h: 330, rad: 26, seed: 2,
  lay: { x: 400, y: -190 }, to: { x: 0, y: 30, rot: 0 },
  wave: 1, z: 1, finish: 'cast', label: 'meter case' });

add({ id: 'hanger', shape: 'disc', r: 13,
  lay: { x: 505, y: 300 }, to: { x: 0, y: -178, rot: 0 },
  wave: 1, z: 0, finish: 'brushed', small: true });

add({ id: 'terminal-cover', shape: 'rect', w: 232, h: 62, rad: 10, seed: 6,
  lay: { x: 390, y: 30 }, to: { x: 0, y: 172, rot: 0 },
  wave: 1, z: 3, finish: 'cast', label: 'terminal cover' });

add({ id: 'terminal-rail', shape: 'bar', w: 204, h: 9,
  lay: { x: 390, y: 80 }, to: { x: 0, y: 140, rot: 0 },
  wave: 1, z: 4, finish: 'brass', small: true });

/* ── 2 · coils and gears · the field the reading forms in ──────── */
for (let i = 0; i < 2; i++) {
  add({ id: `coil-body-${i}`, shape: 'rect', w: 64, h: 74, rad: 8, grooves: 4, seed: 7 + i,
    lay: { x: -520 + i * 84, y: 190 },
    to: { x: i ? 62 : -62, y: 34, rot: 0 },
    wave: 2, z: 2, finish: 'brushed',
    label: i === 0 ? 'current and voltage coils' : undefined });
}

/* winding bars across each coil face */
for (let i = 0; i < 12; i++) {
  const c = Math.floor(i / 6);
  add({ id: `winding-${i}`, shape: 'bar', w: 54, h: 4,
    lay: { x: -520 + c * 84, y: 246 + (i % 6) * 12 },
    to: { x: c ? 62 : -62, y: 8 + (i % 6) * 11, rot: 0 },
    wave: 2, z: 3, finish: 'dark', small: true });
}

/* laminated core between the coils */
for (let i = 0; i < 3; i++) {
  add({ id: `lamination-${i}`, shape: 'rect', w: 76, h: 12, rad: 2,
    lay: { x: -350, y: 190 + i * 22 },
    to: { x: 0, y: 18 + i * 15, rot: 0 },
    wave: 2, z: 2, finish: 'brushed', small: true });
}

add({ id: 'brake-magnet', shape: 'rect', w: 46, h: 30, rad: 6, seed: 9,
  lay: { x: -350, y: 262 }, to: { x: 92, y: 76, rot: 0 },
  wave: 2, z: 3, finish: 'dark', label: 'brake magnet' });

add({ id: 'worm-gear', shape: 'gear', r: 15, teeth: 12, seed: 10,
  lay: { x: -350, y: 310 }, to: { x: 0, y: -6, rot: 0 },
  wave: 2, z: 4, finish: 'brass', spin: 1.6, label: 'worm gear' });

for (let i = 0; i < 2; i++) {
  add({ id: `register-gear-${i}`, shape: 'gear', r: 10, teeth: 10,
    lay: { x: -310 + i * 26, y: 310 },
    to: { x: i ? 28 : -28, y: -6, rot: 0.3 },
    wave: 2, z: 4, finish: 'brass', small: true, spin: i ? -1.1 : 1.1 });
}

add({ id: 'spindle', shape: 'rect', w: 6, h: 74, rad: 3,
  lay: { x: -296, y: 190 }, to: { x: 0, y: 44, rot: 0 },
  wave: 2, z: 4, finish: 'polished', small: true });

for (let i = 0; i < 2; i++) {
  add({ id: `bearing-${i}`, shape: 'ring', r: 9, r2: 5,
    lay: { x: -260, y: 185 + i * 25 },
    to: { x: 0, y: i ? 84 : 4, rot: 0 },
    wave: 2, z: 5, finish: 'polished', small: true });
}

/* ── 3 · fixings · the checks nobody sees ──────────────────────── */
/* eight around the bezel — none across the top, where the hanger sits */
const BEZEL_SCREWS = [0.31, 0.92, 1.53, 2.14, 2.75, 3.36, 5.55, 6.16];
BEZEL_SCREWS.forEach((a, i) =>
  add({ id: `screw-${i}`, shape: 'screw', r: 4,
    lay: { x: 415 + (i % 4) * 36, y: 215 + Math.floor(i / 4) * 24 },
    to: { ...at(130, a), rot: a },
    wave: 3, z: 9, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined }));

/* case corners, terminal-cover corners */
[[-122, -120], [122, -120], [-122, 180], [122, 180]].forEach(([x, y], i) =>
  add({ id: `screw-c-${i}`, shape: 'screw', r: 4.4, cross: true,
    lay: { x: 415 + i * 36, y: 265 },
    to: { x, y, rot: 0.5 * i },
    wave: 3, z: 3, finish: 'polished', small: true }));

for (let i = 0; i < 2; i++) {
  add({ id: `screw-t-${i}`, shape: 'screw', r: 4, cross: true,
    lay: { x: 415 + i * 36, y: 290 },
    to: { x: i ? 96 : -96, y: 172, rot: 0.9 },
    wave: 3, z: 4, finish: 'polished', small: true });
}

/* six terminal screws in a row under the cover line */
for (let i = 0; i < 6; i++) {
  add({ id: `terminal-${i}`, shape: 'screw', r: 6,
    lay: { x: 280 + i * 36, y: 115 },
    to: { x: -85 + i * 34, y: 172, rot: 0.4 * i },
    wave: 3, z: 5, finish: 'brass', small: true,
    label: i === 0 ? 'terminals' : undefined });
}

const WASHERS = [[-122, -120], [122, -120], [-122, 180], [122, 180],
  [-62, 76], [62, 76], [-40, -6], [40, -6]];
WASHERS.forEach(([x, y], i) =>
  add({ id: `washer-${i}`, shape: 'ring', r: 6, r2: 3.5,
    lay: { x: 270 + i * 24, y: 150 },
    to: { x, y, rot: 0 },
    wave: 3, z: 2, finish: 'dark', small: true }));

const PINS = [
  [-30, -70, 0.4], [30, -70, -0.3], [-20, 60, 0.2],
  [20, 60, -0.5], [-60, 110, 0.3], [60, 110, -0.3],
];
PINS.forEach(([x, y, rot], i) =>
  add({ id: `pin-${i}`, shape: 'bar', w: 20, h: 4,
    lay: { x: 270 + i * 28, y: 180 },
    to: { x, y, rot },
    wave: 3, z: 4, finish: 'brushed', small: true }));

/* ── 4 · register and faceplate · counted where you can read it ── */
add({ id: 'faceplate', shape: 'disc', r: 108, seed: 3,
  lay: { x: -170, y: -240 }, to: { x: 0, y: -40, rot: 0 },
  wave: 4, z: 8, finish: 'brushed', label: 'faceplate' });

/* five register dials in a row, the way a meter actually counts */
for (let i = 0; i < 5; i++) {
  add({ id: `dial-${i}`, shape: 'ring', r: 16, r2: 12.5,
    lay: { x: -60 + i * 44, y: -30 },
    to: { x: -72 + i * 36, y: -62, rot: 0 },
    wave: 4, z: 9, finish: 'dark', small: true,
    label: i === 0 ? 'register dials' : undefined });

  add({ id: `dial-hand-${i}`, shape: 'poly', w: 24, h: 4,
    points: [[-5, 0], [-4, -2], [10, -0.8], [12, 0], [10, 0.8], [-4, 2]],
    lay: { x: -60 + i * 44, y: 10 },
    to: { x: -72 + i * 36, y: -62, rot: -0.9 + i * 1.25 },
    wave: 4, z: 10, finish: 'dark', small: true });
}

/* tick marks around each register dial */
for (let d = 0; d < 5; d++) {
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU - Math.PI / 2;
    add({ id: `tick-${d}-${k}`, shape: 'rect', w: 1.8, h: 4.5, rad: 0.5,
      lay: { x: -70 + ((d * 8 + k) % 10) * 22, y: 40 + Math.floor((d * 8 + k) / 10) * 14 },
      to: { x: -72 + d * 36 + Math.cos(a) * 20, y: -62 + Math.sin(a) * 20, rot: a + Math.PI / 2 },
      wave: 4, z: 9, finish: 'dark', small: true });
  }
}

add({ id: 'kwh-plate', shape: 'rect', w: 64, h: 16, rad: 4,
  lay: { x: 200, y: -30 }, to: { x: 0, y: -104, rot: 0 },
  wave: 4, z: 9, finish: 'brushed', small: true });

add({ id: 'serial-plate', shape: 'rect', w: 88, h: 14, rad: 3,
  lay: { x: 200, y: 0 }, to: { x: 0, y: 62, rot: 0 },
  wave: 4, z: 9, finish: 'brushed', small: true });

/* ── 5 · the disc · the part that moves when the house does ────── */
add({ id: 'disc', shape: 'bar', w: 176, h: 13, seed: 11,
  lay: { x: -240, y: -20 }, to: { x: 0, y: 8, rot: 0 },
  wave: 5, z: 9, finish: 'polished', spin: 2.0, label: 'the disc' });

/* the one part in this composition that carries colour — the mark you watch */
add({ id: 'disc-mark', shape: 'rect', w: 18, h: 13, rad: 2,
  lay: { x: -240, y: 15 }, to: { x: -46, y: 8, rot: 0 },
  wave: 5, z: 10, finish: 'anodised', colour: '#E62A32', label: 'the mark' });

add({ id: 'disc-collar', shape: 'ring', r: 10, r2: 6,
  lay: { x: -190, y: 15 }, to: { x: 0, y: 8, rot: 0 },
  wave: 5, z: 10, finish: 'polished', small: true });

/* ── 6 · bezel and glass · sealed in the open ──────────────────── */
add({ id: 'bezel', shape: 'ring', r: 122, r2: 108, seed: 5,
  lay: { x: -420, y: -240 }, to: { x: 0, y: -40, rot: 0 },
  wave: 6, z: 11, finish: 'polished', label: 'bezel' });

for (let i = 0; i < 4; i++) {
  const a = Math.PI / 4 + i * (Math.PI / 2);
  add({ id: `clip-${i}`, shape: 'trap', w: 14, h: 10, topW: 8,
    lay: { x: -90 + i * 26, y: 310 },
    to: { ...at(115, a), rot: a + Math.PI / 2 },
    wave: 6, z: 12, finish: 'brushed', small: true });
}

add({ id: 'crystal', shape: 'disc', r: 104,
  lay: { x: -440, y: 20 }, to: { x: 0, y: -40, rot: 0 },
  wave: 6, z: 14, finish: 'glass', label: 'crystal' });

/* ── 7 · seals · the reading, beyond argument ──────────────────── */
for (let i = 0; i < 2; i++) {
  add({ id: `seal-screw-${i}`, shape: 'screw', r: 5,
    lay: { x: -220 + i * 30, y: 300 },
    to: { x: i ? 102 : -102, y: 205, rot: 0.7 },
    wave: 7, z: 5, finish: 'polished', small: true });

  add({ id: `seal-${i}`, shape: 'ring', r: 7, r2: 4,
    lay: { x: -220 + i * 30, y: 330 },
    to: { x: i ? 110 : -110, y: 220, rot: 0.3 },
    wave: 7, z: 5, finish: 'brass', small: true,
    label: i === 0 ? 'lead seals' : undefined });
}

add({ id: 'nameplate', shape: 'rect', w: 84, h: 20, rad: 5, seed: 12,
  lay: { x: -160, y: 250 }, to: { x: 0, y: 118, rot: 0 },
  wave: 7, z: 9, finish: 'brushed', label: 'nameplate' });

for (let i = 0; i < 2; i++) {
  add({ id: `rivet-${i}`, shape: 'screw', r: 2.5,
    lay: { x: -175 + i * 30, y: 285 },
    to: { x: i ? 30 : -30, y: 118, rot: 0 },
    wave: 7, z: 10, finish: 'polished', small: true });
}

export const meter = {
  /* "the actual thing" — the meter's own front elevation, drawn on the sheet
     the way a maker's drawing sits behind the parts. It fades as the parts
     leave the paper. */
  underlay(c, ink) {
    const X = 30, Y = 0;                   /* elevation block, centre of sheet */
    c.strokeStyle = ink; c.fillStyle = ink;
    c.lineJoin = 'round'; c.lineCap = 'round';
    /* case outline with the round bezel proud of it */
    c.lineWidth = 1.6;
    const bw = 220, bh = 260, r = 22;
    c.beginPath();
    c.moveTo(X - bw / 2 + r, Y - bh / 2 + 30);
    c.arcTo(X + bw / 2, Y - bh / 2 + 30, X + bw / 2, Y + bh / 2 + 30, r);
    c.arcTo(X + bw / 2, Y + bh / 2 + 30, X - bw / 2, Y + bh / 2 + 30, r);
    c.arcTo(X - bw / 2, Y + bh / 2 + 30, X - bw / 2, Y - bh / 2 + 30, r);
    c.arcTo(X - bw / 2, Y - bh / 2 + 30, X + bw / 2, Y - bh / 2 + 30, r);
    c.closePath(); c.stroke();
    c.lineWidth = 1.1;
    c.beginPath(); c.arc(X, Y - 30, 92, 0, TAU); c.stroke();
    /* crosshair, register row, disc slot */
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(X - 104, Y - 30); c.lineTo(X + 104, Y - 30);
    c.moveTo(X, Y - 134); c.lineTo(X, Y + 74);
    c.stroke();
    c.lineWidth = 1.0;
    for (let i = 0; i < 5; i++) {
      c.beginPath(); c.arc(X - 56 + i * 28, Y - 48, 11, 0, TAU); c.stroke();
    }
    c.beginPath();
    c.moveTo(X - 70, Y + 8); c.lineTo(X + 70, Y + 8);
    c.moveTo(X - 70, Y + 18); c.lineTo(X + 70, Y + 18);
    c.stroke();
    /* terminal row */
    c.beginPath();
    c.moveTo(X - 90, Y + 145); c.lineTo(X + 90, Y + 145);
    c.stroke();
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.arc(X - 65 + i * 26, Y + 145, 5, 0, TAU); c.stroke();
    }
    /* overall-height dimension string */
    c.lineWidth = 0.65;
    const dx = X - 165;
    c.beginPath();
    c.moveTo(dx, Y - 140); c.lineTo(dx, Y + 168);
    c.moveTo(dx - 5, Y - 140); c.lineTo(dx + 5, Y - 140);
    c.moveTo(dx - 5, Y + 168); c.lineTo(dx + 5, Y + 168);
    c.stroke();
  },
  name: 'dial electricity meter',
  board: { w: 1180, h: 800 },
  /* wall object, read at eye height — the bezel and terminals both clear the
     frame with room for the seals to hang */
  zoom: 1.12,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['case, backplate and terminals', 'the account as it stands — the bill lands on this'],
    ['coils, laminations, worm gear and brake magnet', 'the house’s real usage — heating, hot water, the cold snap — the field the reading forms in'],
    ['screws, pins and washers', 'the checks nobody sees — the read verified before anyone explains anything'],
    ['faceplate and five register dials', 'the numbers, counted where the household can actually read them'],
    ['the disc and its red mark', 'the part that moves when the house does — and the mark that lets you watch it'],
    ['bezel and crystal', 'sealed in the open: you can always see the work, and nothing hides behind the glass'],
    ['lead seals and nameplate', 'the reading, beyond argument — who read it, what it said, and the credit in plain words'],
  ],
};
