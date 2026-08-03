/* Mechanical coin bank — investing.
 *
 * The first machine anyone trusts with money. A coin goes in the slot, a lever
 * and a spring carry it through a trap door, gears turn a counter, and the door
 * only ever opens to the owner's key. That is the investing journey drawn as a
 * machine: contributions counted where you can read them, real machinery
 * between paying in and it counting, and a body built so that watching it work
 * is how you come to understand it. The coin hangs mid-drop — one decision,
 * on its way to counting.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. Assembled, the face reads top down:
 *   coin at −206 · slot −132 · roof −112 · counter window −60 · mechanism 0–60
 *   · the door at (58, 66) · skirt 160 · feet 182. Body 300 × 260 behind it all.
 *
 * Waves, bench up: 1 body, roof and feet · 2 lever, spring and gears
 * · 3 fixings · 4 the counter · 5 the coin and slot · 6 the door and key
 * · 7 handle and nameplate.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

const TAU = Math.PI * 2;

/* ── 1 · body, roof and feet · the vault body goes down first ──── */
add({ id: 'backplate', shape: 'rect', w: 260, h: 230, rad: 14, seed: 4,
  lay: { x: 60, y: -240 }, to: { x: 0, y: 20, rot: 0 },
  wave: 1, z: 0, finish: 'dark', label: 'backplate' });

add({ id: 'vault-body', shape: 'rect', w: 300, h: 260, rad: 20, seed: 2,
  lay: { x: 390, y: -230 }, to: { x: 0, y: 20, rot: 0 },
  wave: 1, z: 1, finish: 'cast', label: 'vault body' });

add({ id: 'roof-cap', shape: 'rect', w: 320, h: 24, rad: 10, seed: 6,
  lay: { x: 390, y: -70 }, to: { x: 0, y: -112, rot: 0 },
  wave: 1, z: 2, finish: 'brushed', label: 'roof' });

add({ id: 'base-skirt', shape: 'rect', w: 330, h: 30, rad: 8, grooves: 3, seed: 8,
  lay: { x: 390, y: -20 }, to: { x: 0, y: 160, rot: 0 },
  wave: 1, z: 2, finish: 'brushed', label: 'base' });

/* rivets along the roof line */
for (let i = 0; i < 6; i++) {
  add({ id: `roof-rivet-${i}`, shape: 'screw', r: 3,
    lay: { x: 240 + i * 30, y: 20 },
    to: { x: -125 + i * 50, y: -112, rot: 0.4 * i },
    wave: 1, z: 3, finish: 'polished', small: true });
}

[[-135, 182], [-50, 182], [50, 182], [135, 182]].forEach(([x, y], i) =>
  add({ id: `foot-${i}`, shape: 'rect', w: 32, h: 14, rad: 6,
    lay: { x: -535 + i * 44, y: 358 },
    to: { x, y, rot: 0 },
    wave: 1, z: 1, finish: 'rubber', small: true,
    label: i === 0 ? 'feet' : undefined }));

/* ── 2 · lever, spring and gears · the mechanism learns to count ── */
add({ id: 'lever', shape: 'poly', w: 110, h: 8,
  points: [[-55, -4], [44, -2.8], [55, 0], [44, 2.8], [-55, 4]],
  lay: { x: -480, y: 0 }, to: { x: -40, y: 30, rot: 0.35 },
  wave: 2, z: 3, finish: 'brushed', label: 'the lever' });

add({ id: 'lever-pivot', shape: 'screw', r: 6,
  lay: { x: -405, y: 0 }, to: { x: -88, y: 44, rot: 0.3 },
  wave: 2, z: 4, finish: 'polished', small: true });

add({ id: 'main-spring', shape: 'coil', r: 16, turns: 5,
  lay: { x: -370, y: 0 }, to: { x: -100, y: 80, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', small: true, label: 'spring' });

add({ id: 'linkage', shape: 'bar', w: 8, h: 54,
  lay: { x: -330, y: 10 }, to: { x: 18, y: 0, rot: -0.2 },
  wave: 2, z: 3, finish: 'polished', small: true });

add({ id: 'trap-door', shape: 'rect', w: 62, h: 10, rad: 3,
  lay: { x: -480, y: 40 }, to: { x: -28, y: 58, rot: 0 },
  wave: 2, z: 3, finish: 'brushed', small: true });

add({ id: 'trap-hinge', shape: 'bar', w: 20, h: 4,
  lay: { x: -430, y: 40 }, to: { x: -56, y: 58, rot: 0 },
  wave: 2, z: 4, finish: 'brushed', small: true });

add({ id: 'count-gear', shape: 'gear', r: 15, teeth: 12, seed: 10,
  lay: { x: -390, y: 45 }, to: { x: -6, y: -14, rot: 0 },
  wave: 2, z: 4, finish: 'brass', spin: 1.3, label: 'counting gears' });

add({ id: 'count-pinion', shape: 'gear', r: 10, teeth: 10,
  lay: { x: -350, y: 45 }, to: { x: 26, y: -10, rot: 0.3 },
  wave: 2, z: 4, finish: 'brass', small: true, spin: -1.6 });

add({ id: 'pawl', shape: 'poly', w: 26, h: 6,
  points: [[-13, -3], [10, -2], [13, 0], [10, 2], [-13, 3]],
  lay: { x: -318, y: 45 }, to: { x: 12, y: -34, rot: 1.2 },
  wave: 2, z: 5, finish: 'brushed', small: true });

/* ── 3 · fixings · the small checks nobody sees ────────────────── */
const EDGE_SCREWS = [
  [-138, -96], [138, -96], [-138, 0], [138, 0], [-138, 96], [138, 96],
  [-90, 138], [90, 138],
];
EDGE_SCREWS.forEach(([x, y], i) =>
  add({ id: `screw-${i}`, shape: 'screw', r: 4,
    lay: { x: 415 + (i % 4) * 36, y: 215 + Math.floor(i / 4) * 24 },
    to: { x, y, rot: 0.4 * i },
    wave: 3, z: 6, finish: 'polished', small: true,
    label: i === 0 ? 'screws' : undefined }));

[[-125, -140], [125, -140], [-150, 160], [150, 160]].forEach(([x, y], i) =>
  add({ id: `screw-c-${i}`, shape: 'screw', r: 4.4, cross: true,
    lay: { x: 415 + i * 36, y: 263 },
    to: { x, y, rot: 0.5 * i },
    wave: 3, z: 3, finish: 'polished', small: true }));

const PINS = [
  [-70, 0, 0.4], [-16, 44, -0.3], [40, 34, 0.2],
  [-52, -34, -0.5], [44, -34, 0.3], [0, 96, -0.3],
];
PINS.forEach(([x, y, rot], i) =>
  add({ id: `pin-${i}`, shape: 'bar', w: 20, h: 4,
    lay: { x: 270 + i * 28, y: 180 },
    to: { x, y, rot },
    wave: 3, z: 4, finish: 'brushed', small: true }));

const WASHERS = [[-125, -140], [125, -140], [-150, 160], [150, 160],
  [-88, 44], [-6, -14], [26, -10], [-100, 80]];
WASHERS.forEach(([x, y], i) =>
  add({ id: `washer-${i}`, shape: 'ring', r: 6, r2: 3.5,
    lay: { x: 270 + i * 24, y: 150 },
    to: { x, y, rot: 0 },
    wave: 3, z: 2, finish: 'dark', small: true }));

/* ── 4 · the counter · the balance, counted where you can read it ── */
add({ id: 'counter-bezel', shape: 'rect', w: 150, h: 44, rad: 8, seed: 3,
  lay: { x: -200, y: -350 }, to: { x: 0, y: -60, rot: 0 },
  wave: 4, z: 8, finish: 'polished', label: 'the counter' });

add({ id: 'counter-glass', shape: 'rect', w: 134, h: 30, rad: 4,
  lay: { x: -200, y: -300 }, to: { x: 0, y: -60, rot: 0 },
  wave: 4, z: 9, finish: 'glass', small: true });

for (let i = 0; i < 4; i++) {
  add({ id: `digit-ring-${i}`, shape: 'ring', r: 13, r2: 10,
    lay: { x: -260 + i * 34, y: -260 },
    to: { x: -51 + i * 34, y: -60, rot: 0 },
    wave: 4, z: 10, finish: 'dark', small: true,
    label: i === 0 ? 'digit wheels' : undefined });

  add({ id: `digit-bar-${i}`, shape: 'rect', w: 3, h: 8, rad: 1,
    lay: { x: -260 + i * 34, y: -228 },
    to: { x: -51 + i * 34, y: -60, rot: 0.5 * i - 0.7 },
    wave: 4, z: 11, finish: 'dark', small: true });
}

/* ── 5 · the coin and the slot · one decision, mid-drop ────────── */
add({ id: 'slot-bezel', shape: 'rect', w: 84, h: 18, rad: 5, seed: 7,
  lay: { x: -460, y: -230 }, to: { x: 0, y: -132, rot: 0 },
  wave: 5, z: 2, finish: 'brushed', label: 'the slot' });

add({ id: 'slot', shape: 'bar', w: 50, h: 5,
  lay: { x: -380, y: -230 }, to: { x: 0, y: -132, rot: 0 },
  wave: 5, z: 3, finish: 'dark', small: true });

/* the one part in this composition that carries colour */
add({ id: 'coin', shape: 'disc', r: 34,
  lay: { x: -460, y: -330 }, to: { x: 0, y: -206, rot: 0 },
  wave: 5, z: 10, finish: 'anodised', colour: '#E50072', spin: 1.8, label: 'the coin' });

add({ id: 'coin-rim', shape: 'ring', r: 34, r2: 30,
  lay: { x: -380, y: -330 }, to: { x: 0, y: -206, rot: 0 },
  wave: 5, z: 11, finish: 'polished', small: true });

add({ id: 'coin-inner', shape: 'ring', r: 20, r2: 17,
  lay: { x: -320, y: -330 }, to: { x: 0, y: -206, rot: 0 },
  wave: 5, z: 11, finish: 'polished', small: true });

/* reeding around the coin edge */
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * TAU;
  add({ id: `reed-${i}`, shape: 'rect', w: 2.5, h: 7, rad: 0.8,
    lay: { x: -500 + i * 20, y: -270 },
    to: { x: Math.cos(a) * 31, y: -206 + Math.sin(a) * 31, rot: a + Math.PI / 2 },
    wave: 5, z: 12, finish: 'polished', small: true });
}

/* ── 6 · the door and your key · it only opens to you ──────────── */
add({ id: 'door', shape: 'disc', r: 46, seed: 5,
  lay: { x: -470, y: -140 }, to: { x: 58, y: 66, rot: 0 },
  wave: 6, z: 5, finish: 'brushed', label: 'the door' });

add({ id: 'door-ring', shape: 'ring', r: 52, r2: 46,
  lay: { x: -360, y: -140 }, to: { x: 58, y: 66, rot: 0 },
  wave: 6, z: 6, finish: 'polished', small: true });

for (let i = 0; i < 2; i++) {
  add({ id: `door-hinge-${i}`, shape: 'rect', w: 12, h: 20, rad: 3,
    lay: { x: -290, y: -155 + i * 30 },
    to: { x: 108, y: i ? 82 : 50, rot: 0 },
    wave: 6, z: 6, finish: 'brushed', small: true });
}

add({ id: 'lock', shape: 'disc', r: 12,
  lay: { x: -260, y: -140 }, to: { x: 58, y: 66, rot: 0 },
  wave: 6, z: 7, finish: 'dark', small: true, label: 'the lock' });

add({ id: 'keyhole', shape: 'trap', w: 5, h: 10, topW: 3,
  lay: { x: -235, y: -140 }, to: { x: 58, y: 70, rot: 0 },
  wave: 6, z: 8, finish: 'dark', small: true });

/* eight bolts around the door ring */
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * TAU + 0.39;
  add({ id: `door-bolt-${i}`, shape: 'screw', r: 3.5,
    lay: { x: -440 + (i % 4) * 24, y: -70 + Math.floor(i / 4) * 20 },
    to: { x: 58 + Math.cos(a) * 48, y: 66 + Math.sin(a) * 48, rot: a },
    wave: 6, z: 7, finish: 'polished', small: true });
}

/* the key, resting on the base — the owner's, not the machine's */
add({ id: 'key-shaft', shape: 'bar', w: 34, h: 5,
  lay: { x: -500, y: -70 }, to: { x: -80, y: 132, rot: 0 },
  wave: 6, z: 3, finish: 'polished', small: true, label: 'your key' });

add({ id: 'key-bow', shape: 'ring', r: 9, r2: 5.5,
  lay: { x: -470, y: -70 }, to: { x: -104, y: 132, rot: 0 },
  wave: 6, z: 3, finish: 'polished', small: true });

/* ── 7 · handle and nameplate · the record with your name on it ── */
for (let i = 0; i < 2; i++) {
  add({ id: `handle-post-${i}`, shape: 'bar', w: 6, h: 14,
    lay: { x: 240 + i * 30, y: 60 },
    to: { x: i ? 38 : -38, y: -146, rot: 0 },
    wave: 7, z: 2, finish: 'brushed', small: true });
}

add({ id: 'handle', shape: 'rect', w: 96, h: 7, rad: 3.5,
  lay: { x: 350, y: 60 }, to: { x: 0, y: -156, rot: 0 },
  wave: 7, z: 3, finish: 'polished', label: 'handle' });

add({ id: 'nameplate', shape: 'rect', w: 84, h: 20, rad: 5, seed: 12,
  lay: { x: 470, y: 60 }, to: { x: -85, y: 112, rot: 0 },
  wave: 7, z: 5, finish: 'brushed', label: 'nameplate' });

for (let i = 0; i < 2; i++) {
  add({ id: `rivet-${i}`, shape: 'screw', r: 2.5,
    lay: { x: 250 + i * 30, y: 95 },
    to: { x: i ? -55 : -115, y: 112, rot: 0 },
    wave: 7, z: 6, finish: 'polished', small: true });
}

export const coinbank = {
  /* "the actual thing" — the coin bank's own front elevation, drawn on the
     sheet the way a maker's drawing sits behind the parts. It fades as the
     parts leave the paper. */
  underlay(c, ink) {
    const X = 30, Y = 0;                   /* elevation block, centre of sheet */
    c.strokeStyle = ink; c.fillStyle = ink;
    c.lineJoin = 'round'; c.lineCap = 'round';
    /* the body, roof and skirt */
    c.lineWidth = 1.6;
    c.strokeRect(X - 115, Y - 88, 230, 200);
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(X - 125, Y - 88); c.lineTo(X + 125, Y - 88);
    c.moveTo(X - 128, Y + 112); c.lineTo(X + 128, Y + 112);
    c.stroke();
    /* the slot, and the coin above it, dashed mid-drop */
    c.beginPath();
    c.moveTo(X - 26, Y - 102); c.lineTo(X + 26, Y - 102);
    c.stroke();
    c.setLineDash([4, 4]);
    c.beginPath(); c.arc(X, Y - 148, 26, 0, TAU); c.stroke();
    c.setLineDash([]);
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(X, Y - 122); c.lineTo(X, Y - 106);
    c.stroke();
    /* counter window and the door with its crosshair */
    c.lineWidth = 1.0;
    c.strokeRect(X - 58, Y - 62, 116, 34);
    c.beginPath(); c.arc(X + 45, Y + 50, 38, 0, TAU); c.stroke();
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(X + 1, Y + 50); c.lineTo(X + 89, Y + 50);
    c.moveTo(X + 45, Y + 6); c.lineTo(X + 45, Y + 94);
    c.stroke();
    /* feet and the bench line */
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(X - 100, Y + 126); c.lineTo(X - 70, Y + 126);
    c.moveTo(X + 70, Y + 126); c.lineTo(X + 100, Y + 126);
    c.stroke();
    c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(X - 175, Y + 133); c.lineTo(X + 175, Y + 133); c.stroke();
    /* overall-height dimension string */
    c.lineWidth = 0.65;
    const dx = X - 195;
    c.beginPath();
    c.moveTo(dx, Y - 174); c.lineTo(dx, Y + 133);
    c.moveTo(dx - 5, Y - 174); c.lineTo(dx + 5, Y - 174);
    c.moveTo(dx - 5, Y + 133); c.lineTo(dx + 5, Y + 133);
    c.stroke();
  },
  name: 'mechanical coin bank',
  board: { w: 1180, h: 800 },
  /* the coin hangs above the slot and the feet meet the bench — both clear
     the frame, with the drop in between */
  zoom: 1.15,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['vault body, roof, base and feet', 'the account as it stands — everything else builds on it'],
    ['lever, spring, trap door and counting gears', 'what processing actually is: real machinery between paying in and it counting'],
    ['screws, pins and washers', 'the small checks nobody sees — verified, matched, recorded'],
    ['the counter and its digit wheels', 'the balance, counted where you can actually read it'],
    ['the coin, mid-drop, and the slot', 'one contribution on its way to counting — a decision you made, visible the whole way down'],
    ['the door, the lock and your key', 'your money stays yours — the door only ever opens to your key'],
    ['handle and nameplate', 'the record with your name on it: what went in, and what you understood by the time it landed'],
  ],
};
