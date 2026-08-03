/* Rotary desk telephone — branch lending.
 *
 * "The branch conversation starts before the phone rings." So the object is the
 * phone itself: bells that announce a customer, a dial that prepares the call
 * one digit at a time, and a handset that only a person can pick up. The whole
 * machine exists to put two people in a conversation — which is the branch
 * journey drawn as hardware: everything assembled in advance, and a human
 * voice at both ends of the line.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. Assembled, the face reads as bands around the
 * dial centre (0, 62):
 *   7 centre cap · 22 centre card · 54 finger holes · 80 dial plate
 *   · 80–92 bezel · 92 bezel screws · the body 340 × 180 behind, handset above.
 *
 * Waves, desk up: 1 base and feet · 2 bells and coils · 3 fixings · 4 the dial
 * · 5 handset and cradle · 6 the cord · 7 nameplate and volume.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

const TAU = Math.PI * 2;

/* dial-centred placement — holes, ticks and bezel screws all ride one circle */
const DIAL = { x: 0, y: 62 };
const at = (rad, a, off = 0) => ({
  x: DIAL.x + Math.cos(a) * rad - Math.sin(a) * off,
  y: DIAL.y + Math.sin(a) * rad + Math.cos(a) * off,
});

/* ── 1 · base and feet · the base lands on the desk ────────────── */
add({ id: 'baseplate', shape: 'bar', w: 300, h: 16,
  lay: { x: 365, y: -140 }, to: { x: 0, y: 158, rot: 0 },
  wave: 1, z: 0, finish: 'brushed', label: 'baseplate' });

add({ id: 'body', shape: 'poly', w: 340, h: 180, seed: 2,
  points: [[-170, 90], [-142, -38], [-96, -72], [96, -72], [142, -38], [170, 90]],
  lay: { x: 365, y: -250 }, to: { x: 0, y: 60, rot: 0 },
  wave: 1, z: 1, finish: 'cast', label: 'telephone body' });

[[-120, 172], [-45, 172], [45, 172], [120, 172]].forEach(([x, y], i) =>
  add({ id: `foot-${i}`, shape: 'rect', w: 30, h: 14, rad: 6,
    lay: { x: -535 + i * 44, y: 358 },
    to: { x, y, rot: 0 },
    wave: 1, z: 1, finish: 'rubber', small: true,
    label: i === 0 ? 'feet' : undefined }));

/* ── 2 · bells and coils · what the branch hears first ─────────── */
for (let i = 0; i < 2; i++) {
  add({ id: `bell-${i}`, shape: 'disc', r: 40, seed: 5 + i,
    lay: { x: -500 + i * 90, y: -60 },
    to: { x: i ? 62 : -62, y: 55, rot: 0 },
    wave: 2, z: 2, finish: 'polished',
    label: i === 0 ? 'the bells' : undefined });

  add({ id: `bell-bolt-${i}`, shape: 'screw', r: 6,
    lay: { x: -245 + i * 25, y: -60 },
    to: { x: i ? 62 : -62, y: 55, rot: 0.4 },
    wave: 2, z: 3, finish: 'brushed', small: true });
}

add({ id: 'striker-arm', shape: 'rect', w: 8, h: 46, rad: 3,
  lay: { x: -245, y: -15 }, to: { x: 0, y: 40, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', small: true });

add({ id: 'striker-ball', shape: 'screw', r: 7,
  lay: { x: -195, y: -60 }, to: { x: 0, y: 16, rot: 0 },
  wave: 2, z: 3, finish: 'polished', small: true });

for (let i = 0; i < 2; i++) {
  add({ id: `ringer-coil-${i}`, shape: 'rect', w: 30, h: 44, rad: 5, grooves: 3, seed: 7 + i,
    lay: { x: -500 + i * 45, y: 20 },
    to: { x: i ? 24 : -24, y: 108, rot: 0 },
    wave: 2, z: 2, finish: 'brushed', small: true,
    label: i === 0 ? 'ringer coils' : undefined });
}

add({ id: 'yoke', shape: 'rect', w: 64, h: 12, rad: 3,
  lay: { x: -395, y: 20 }, to: { x: 0, y: 132, rot: 0 },
  wave: 2, z: 2, finish: 'cast', small: true });

add({ id: 'capacitor', shape: 'rect', w: 40, h: 24, rad: 5, seed: 9,
  lay: { x: -330, y: 20 }, to: { x: 98, y: 112, rot: 0 },
  wave: 2, z: 2, finish: 'dark', small: true });

add({ id: 'hookswitch', shape: 'poly', w: 70, h: 6,
  points: [[-35, -3], [28, -2.1], [35, 0], [28, 2.1], [-35, 3]],
  lay: { x: -500, y: 80 }, to: { x: 0, y: -20, rot: 0.12 },
  wave: 2, z: 4, finish: 'brushed', small: true, label: 'hookswitch' });

add({ id: 'hook-spring', shape: 'coil', r: 9, turns: 4,
  lay: { x: -445, y: 80 }, to: { x: -40, y: -14, rot: 0 },
  wave: 2, z: 4, finish: 'brushed', small: true });

for (let i = 0; i < 6; i++) {
  add({ id: `wire-pin-${i}`, shape: 'bar', w: 16, h: 3.5,
    lay: { x: -540 + i * 28, y: 110 },
    to: { x: -75 + i * 30, y: 138, rot: 0 },
    wave: 2, z: 3, finish: 'dark', small: true });
}

/* ── 3 · fixings · the checks nobody sees ──────────────────────── */
/* eight around the bezel — none across the top, where the hookswitch sits */
const BEZEL_SCREWS = [0.31, 0.92, 1.53, 2.14, 2.75, 3.36, 5.55, 6.16];
BEZEL_SCREWS.forEach((a, i) =>
  add({ id: `screw-${i}`, shape: 'screw', r: 4,
    lay: { x: 415 + (i % 4) * 36, y: 215 + Math.floor(i / 4) * 24 },
    to: { ...at(92, a), rot: a },
    wave: 3, z: 9, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined }));

[[-92, -2], [92, -2], [-148, 134], [148, 134]].forEach(([x, y], i) =>
  add({ id: `screw-c-${i}`, shape: 'screw', r: 4.4, cross: true,
    lay: { x: 415 + i * 36, y: 263 },
    to: { x, y, rot: 0.5 * i },
    wave: 3, z: 2, finish: 'polished', small: true }));

const PINS = [
  [-80, 80, 0.4], [80, 80, -0.3], [-50, 30, 0.2],
  [50, 30, -0.5], [0, 96, 0.3], [110, 60, -0.3],
];
PINS.forEach(([x, y, rot], i) =>
  add({ id: `pin-${i}`, shape: 'bar', w: 20, h: 4,
    lay: { x: 270 + i * 28, y: 180 },
    to: { x, y, rot },
    wave: 3, z: 3, finish: 'brushed', small: true }));

const WASHERS = [[-92, -2], [92, -2], [-148, 134], [148, 134],
  [-62, 55], [62, 55], [-24, 108], [24, 108]];
WASHERS.forEach(([x, y], i) =>
  add({ id: `washer-${i}`, shape: 'ring', r: 6, r2: 3.5,
    lay: { x: 270 + i * 24, y: 150 },
    to: { x, y, rot: 0 },
    wave: 3, z: 1, finish: 'dark', small: true }));

/* ── 4 · the dial · the conversation, prepared one digit at a time ── */
add({ id: 'dial-bezel', shape: 'ring', r: 92, r2: 80, seed: 3,
  lay: { x: -215, y: -275 }, to: { x: 0, y: 62, rot: 0 },
  wave: 4, z: 9, finish: 'polished', label: 'dial bezel' });

add({ id: 'dial-plate', shape: 'disc', r: 80, seed: 4,
  lay: { x: -30, y: -275 }, to: { x: 0, y: 62, rot: 0 },
  wave: 4, z: 8, finish: 'brushed', label: 'dial plate' });

/* ten finger holes, the gap at upper right where the finger stop lives */
for (let i = 0; i < 10; i++) {
  const a = 1.047 + i * 0.5236;
  add({ id: `hole-${i}`, shape: 'ring', r: 11, r2: 8,
    lay: { x: -160 + (i % 5) * 36, y: -85 + Math.floor(i / 5) * 30 },
    to: { ...at(54, a), rot: 0 },
    wave: 4, z: 10, finish: 'dark', small: true,
    label: i === 0 ? 'finger holes' : undefined });

  add({ id: `numeral-${i}`, shape: 'rect', w: 3, h: 6, rad: 1,
    lay: { x: -160 + i * 16, y: -20 },
    to: { ...at(68, a), rot: a + Math.PI / 2 },
    wave: 4, z: 9, finish: 'dark', small: true });
}

add({ id: 'finger-stop', shape: 'trap', w: 16, h: 22, topW: 10,
  lay: { x: 0, y: -20 }, to: { ...at(66, 0.26), rot: 0.26 + Math.PI / 2 },
  wave: 4, z: 11, finish: 'polished', small: true });

/* the one part in this composition that carries colour */
add({ id: 'centre-card', shape: 'disc', r: 22,
  lay: { x: 60, y: -30 }, to: { x: 0, y: 62, rot: 0 },
  wave: 4, z: 10, finish: 'anodised', colour: '#47A1A3', spin: 1.4, label: 'centre card' });

add({ id: 'centre-cap', shape: 'disc', r: 7,
  lay: { x: 105, y: -30 }, to: { x: 0, y: 62, rot: 0 },
  wave: 4, z: 11, finish: 'polished', small: true });

/* ── 5 · handset and cradle · the part a person picks up ───────── */
add({ id: 'grip', shape: 'poly', w: 200, h: 26, seed: 10,
  points: [[-100, 6], [-72, -10], [0, -16], [72, -10], [100, 6], [72, 2], [0, -4], [-72, 2]],
  lay: { x: -440, y: -340 }, to: { x: 0, y: -142, rot: 0 },
  wave: 5, z: 6, finish: 'brushed', label: 'handset' });

for (let i = 0; i < 2; i++) {
  const x = i ? 110 : -110;
  add({ id: `cup-${i}`, shape: 'disc', r: 33, seed: 11 + i,
    lay: { x: -490 + i * 80, y: -270 },
    to: { x, y: -122, rot: 0 },
    wave: 5, z: 5, finish: 'brushed', small: true });

  add({ id: `cap-${i}`, shape: 'disc', r: 26,
    lay: { x: -490 + i * 80, y: -200 },
    to: { x, y: -122, rot: 0 },
    wave: 5, z: 6, finish: 'polished', small: true });

  add({ id: `grille-${i}`, shape: 'ring', r: 14, r2: 9,
    lay: { x: -490 + i * 80, y: -150 },
    to: { x, y: -122, rot: 0 },
    wave: 5, z: 7, finish: 'dark', small: true });
}

for (let i = 0; i < 2; i++) {
  add({ id: `cradle-${i}`, shape: 'poly', w: 34, h: 84,
    points: [[-17, 42], [-10, -30], [0, -42], [10, -30], [6, 42]],
    lay: { x: -330 + i * 50, y: -105 },
    to: { x: i ? 95 : -95, y: -54, rot: 0 },
    wave: 5, z: 7, finish: 'cast', small: true,
    label: i === 0 ? 'cradle' : undefined });

  add({ id: `plunger-${i}`, shape: 'bar', w: 10, h: 26,
    lay: { x: -235 + i * 25, y: -105 },
    to: { x: i ? 40 : -40, y: -38, rot: 0 },
    wave: 5, z: 4, finish: 'polished', small: true });

  add({ id: `plunger-collar-${i}`, shape: 'ring', r: 8, r2: 5,
    lay: { x: -192, y: -135 + i * 30 },
    to: { x: i ? 40 : -40, y: -20, rot: 0 },
    wave: 5, z: 5, finish: 'brushed', small: true });
}

/* ── 6 · the cord · one line between customer and branch ───────── */
for (let i = 0; i < 8; i++) {
  add({ id: `loop-${i}`, shape: 'coil', r: 8, turns: 3,
    lay: { x: -240 + i * 24, y: 30 },
    to: { x: 150 + (i % 2) * 12, y: -96 + i * 24, rot: 0.3 },
    wave: 6, z: 6, finish: 'brushed', small: true,
    label: i === 0 ? 'the cord' : undefined });
}

add({ id: 'cord-tail', shape: 'bar', w: 40, h: 5,
  lay: { x: -30, y: 30 }, to: { x: 158, y: 100, rot: 1.2 },
  wave: 6, z: 6, finish: 'brushed', small: true });

for (let i = 0; i < 2; i++) {
  add({ id: `line-cord-${i}`, shape: 'bar', w: 70, h: 5,
    lay: { x: -240 + i * 80, y: 65 },
    to: { x: i ? 272 : 215, y: i ? 168 : 162, rot: i ? 0.02 : 0.08 },
    wave: 6, z: 0, finish: 'dark', small: true });
}

for (let i = 0; i < 2; i++) {
  add({ id: `relief-${i}`, shape: 'trap', w: 12, h: 16, topW: 8,
    lay: { x: -80 + i * 30, y: 65 },
    to: { x: i ? 188 : 168, y: i ? 156 : 138, rot: i ? 0.1 : 0.3 },
    wave: 6, z: 2, finish: 'rubber', small: true });
}

/* ── 7 · nameplate and volume · the record with a name on it ───── */
add({ id: 'nameplate', shape: 'rect', w: 84, h: 20, rad: 5, seed: 12,
  lay: { x: -240, y: 110 }, to: { x: -95, y: 128, rot: 0 },
  wave: 7, z: 5, finish: 'brushed', label: 'nameplate' });

for (let i = 0; i < 2; i++) {
  add({ id: `rivet-${i}`, shape: 'screw', r: 2.5,
    lay: { x: -160 + i * 30, y: 110 },
    to: { x: i ? -65 : -125, y: 128, rot: 0 },
    wave: 7, z: 6, finish: 'polished', small: true });
}

add({ id: 'volume-knob', shape: 'tyre', r: 15, r2: 6,
  lay: { x: -90, y: 110 }, to: { x: 135, y: 128, rot: 0 },
  wave: 7, z: 5, finish: 'polished', spin: 0.7, small: true, label: 'ringer volume' });

add({ id: 'dial-card-ring', shape: 'ring', r: 27, r2: 23,
  lay: { x: 155, y: -30 }, to: { x: 0, y: 62, rot: 0 },
  wave: 7, z: 9, finish: 'brass', small: true });

export const phone = {
  /* "the actual thing" — the telephone's own front elevation, drawn on the
     sheet the way a maker's drawing sits behind the parts. It fades as the
     parts leave the paper. */
  underlay(c, ink) {
    const X = 30, Y = 10;                  /* elevation block, centre of sheet */
    c.strokeStyle = ink; c.fillStyle = ink;
    c.lineJoin = 'round'; c.lineCap = 'round';
    /* the pyramid body */
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(X - 135, Y + 125);
    c.lineTo(X - 112, Y + 22); c.lineTo(X - 76, Y - 5);
    c.lineTo(X + 76, Y - 5); c.lineTo(X + 112, Y + 22);
    c.lineTo(X + 135, Y + 125);
    c.closePath(); c.stroke();
    /* dial with crosshair */
    c.lineWidth = 1.1;
    c.beginPath(); c.arc(X, Y + 60, 66, 0, TAU); c.stroke();
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(X - 78, Y + 60); c.lineTo(X + 78, Y + 60);
    c.moveTo(X, Y - 18); c.lineTo(X, Y + 138);
    c.stroke();
    c.lineWidth = 0.9;
    for (let i = 0; i < 10; i++) {
      const a = 1.047 + i * 0.5236;
      c.beginPath();
      c.arc(X + Math.cos(a) * 44, Y + 60 + Math.sin(a) * 44, 8, 0, TAU);
      c.stroke();
    }
    /* handset resting above the cradle */
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(X - 90, Y - 82);
    c.quadraticCurveTo(X, Y - 108, X + 90, Y - 82);
    c.stroke();
    c.beginPath(); c.arc(X - 88, Y - 76, 24, 0, TAU); c.stroke();
    c.beginPath(); c.arc(X + 88, Y - 76, 24, 0, TAU); c.stroke();
    c.beginPath();
    c.moveTo(X - 62, Y - 42); c.lineTo(X - 55, Y - 5);
    c.moveTo(X + 62, Y - 42); c.lineTo(X + 55, Y - 5);
    c.stroke();
    /* the desk line */
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(X - 190, Y + 138); c.lineTo(X + 190, Y + 138); c.stroke();
    /* overall-height dimension string */
    c.lineWidth = 0.65;
    const dx = X - 210;
    c.beginPath();
    c.moveTo(dx, Y - 104); c.lineTo(dx, Y + 138);
    c.moveTo(dx - 5, Y - 104); c.lineTo(dx + 5, Y - 104);
    c.moveTo(dx - 5, Y + 138); c.lineTo(dx + 5, Y + 138);
    c.stroke();
  },
  name: 'rotary desk telephone',
  board: { w: 1180, h: 800 },
  /* a desk object with a handset above and a cord trailing beside — height and
     the cord's reach both clear the frame */
  zoom: 1.3,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['body, baseplate and feet', 'the branch as it stands — fifty-five years of rooms with people in them'],
    ['bells, ringer coils, striker and hookswitch', 'what the branch hears before the customer arrives — the appointment, announced ahead of itself'],
    ['screws, pins and washers', 'the checks nobody sees — the story carried once, the documents counted, before the desk'],
    ['dial, finger holes and centre card', 'the conversation prepared one digit at a time — ten holes, one person on the other end'],
    ['handset and cradle', 'the part only a person picks up — this journey ends in a human voice, by design'],
    ['the cord', 'one line between customer and branch — never handed to a third party, never carrying an advertisement'],
    ['nameplate and ringer volume', 'the record with a name on it: what was prepared, who read it, before hello'],
  ],
};
