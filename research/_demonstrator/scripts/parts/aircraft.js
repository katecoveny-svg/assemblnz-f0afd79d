/* Narrow-body airliner, side elevation — the airline object.
 *
 * The traveller's day runs through this machine, so the demonstrator assembles it:
 * keel first, frames along the keel, skins closing over, the wing taking the
 * weight, the tail standing last before the doors open. Waves inside out, the
 * order an airframe actually comes together on the line.
 *
 * Livery discipline: white over grey, the fin in the airline's near-black — and
 * no koru, no titles, no registration. The silhouette carries it; trade dress
 * stays off the drawing. The one colour on the board is the forward boarding
 * door — the part where a person decides who gets on.
 *
 * Same architecture as the motorcar: absolute elevation coordinates, recentred by
 * panel(); the packer owns the flat lay. Spec: references/knolling-assembly.md.
 */

const WHITE = '#EDEFF2';      /* upper fuselage */
const BELLY = '#B9BEC4';      /* lower fuselage and fairings */
const NEARBLACK = '#1E2126';  /* the fin — the airline's black, unbadged */
const DOOR = '#C4602A';       /* the forward door: the human's threshold */

const parts = [];
const GROUPS = [];

function group(name) {
  const items = [];
  GROUPS.push({ name, items });
  return p => { parts.push(p); items.push(p); return p; };
}

function panel(g, id, pts, opts = {}) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return g({
    id, shape: 'poly',
    points: pts.map(([x, y]) => [+(x - cx).toFixed(1), +(y - cy).toFixed(1)]),
    w: +(x1 - x0).toFixed(1), h: +(y1 - y0).toFixed(1),
    to: { x: +cx.toFixed(1), y: +cy.toFixed(1), rot: 0 },
    ...opts,
  });
}

/* The finished aeroplane. Nose at x = -560, tail cone at x = 552; the fuselage
   centreline sits at y = -6 with a radius of 52, so the crown runs at -58 and
   the belly at 46. Ground line y = 150; the gear holds the belly off it. */
const CL = -6, R = 52;

/* ── 1 · keel and frames ────────────────────────────────────────── */
const structure = group('keel and frames');

structure({ id: 'keel', shape: 'bar', w: 760, h: 14,
  to: { x: -20, y: CL + R - 14, rot: 0 }, wave: 1, z: 1, finish: 'brushed',
  label: 'keel beam' });

structure({ id: 'floor-beam', shape: 'bar', w: 720, h: 10,
  to: { x: -20, y: CL + 6, rot: 0 }, wave: 1, z: 1, finish: 'brushed' });

for (let i = 0; i < 11; i++) {
  structure({ id: `frame-${i}`, shape: 'rect', w: 10, h: 96, rad: 5, seed: 20 + i,
    to: { x: -350 + i * 68, y: CL, rot: 0 },
    wave: 1, z: 2, finish: 'brushed', small: i % 2 === 1,
    label: i === 0 ? 'fuselage frames' : undefined });
}

panel(structure, 'wing-box',
  [[-96, 8], [96, 8], [110, 46], [-110, 46]],
  { wave: 1, z: 3, finish: 'brushed', seed: 33 });

/* ── 2 · skins ──────────────────────────────────────────────────── */
const skins = group('skins');
const TOP = { finish: 'painted', colour: WHITE };
const LOW = { finish: 'painted', colour: BELLY };

panel(skins, 'radome',
  [[-560, -8], [-538, -34], [-506, -50], [-500, 30], [-522, 22], [-548, 6]],
  { wave: 2, z: 6, ...LOW, label: 'radome' });

panel(skins, 'crown',
  [[-506, -50], [-380, -58], [200, -58], [420, -50], [430, -22], [200, -30],
   [-380, -30], [-506, -22]],
  { wave: 2, z: 5, ...TOP, label: 'fuselage crown' });

panel(skins, 'side-mid',
  [[-506, -26], [420, -26], [436, 6], [420, 18], [-506, 18]],
  { wave: 2, z: 4, ...TOP });

panel(skins, 'belly',
  [[-506, 16], [430, 16], [402, 46], [140, 52], [-120, 52], [-460, 40]],
  { wave: 2, z: 5, ...LOW, label: 'belly skin' });

/* the tail cone lifts with the rear fuselage taper */
panel(skins, 'tail-cone',
  [[420, -50], [500, -40], [552, -22], [540, -6], [478, 6], [424, 16]],
  { wave: 2, z: 5, ...TOP });

/* ── 3 · fasteners ─────────────────────────────────────────────── */
const fasteners = group('fasteners');

for (let i = 0; i < 22; i++) {
  fasteners({ id: `rivet-${i}`, shape: 'screw', r: 2.6 + (i % 3) * 0.5, cross: i % 4 === 0,
    to: { x: -480 + i * 44, y: i % 2 ? -34 : 24, rot: (i % 5) * 0.3 },
    wave: 3, z: 7, finish: 'polished', small: true,
    label: i === 0 ? 'rivets' : undefined });
}

for (let i = 0; i < 4; i++) {
  fasteners({ id: `strap-${i}`, shape: 'ring', r: 7, r2: 3.4,
    to: { x: -300 + i * 180, y: -46, rot: 0 },
    wave: 3, z: 7, finish: 'brushed', small: true });
}

/* ── 4 · landing gear ──────────────────────────────────────────── */
const gear = group('landing gear');

gear({ id: 'nose-strut', shape: 'rect', w: 12, h: 64, rad: 5, grooves: 2,
  to: { x: -448, y: 88, rot: 0 }, wave: 4, z: 3, finish: 'polished',
  label: 'nose gear' });
gear({ id: 'nose-wheel', shape: 'tyre', r: 24, r2: 13,
  to: { x: -448, y: 126, rot: 0 }, wave: 4, z: 4, finish: 'rubber', spin: -0.6 });
gear({ id: 'nose-hub', shape: 'disc', r: 12,
  to: { x: -448, y: 126, rot: 0 }, wave: 4, z: 5, finish: 'brushed', small: true });

[[-6, 0], [30, 1]].forEach(([x, i]) => {
  gear({ id: `main-strut-${i}`, shape: 'rect', w: 14, h: 78, rad: 6, grooves: 3,
    to: { x, y: 92, rot: i ? 0.08 : 0 }, wave: 4, z: 3 - i, finish: 'polished',
    small: !!i, label: i === 0 ? 'main gear' : undefined });
  gear({ id: `main-wheel-${i}`, shape: 'tyre', r: 30, r2: 16,
    to: { x: x + (i ? 6 : 0), y: 120, rot: 0 }, wave: 4, z: 4 - i,
    finish: 'rubber', spin: -0.6, small: !!i });
  gear({ id: `main-hub-${i}`, shape: 'disc', r: 14,
    to: { x: x + (i ? 6 : 0), y: 120, rot: 0 }, wave: 4, z: 5 - i,
    finish: 'brushed', small: true });
});

panel(gear, 'gear-door',
  [[-490, 40], [-430, 42], [-432, 60], [-488, 58]],
  { wave: 4, z: 6, ...LOW, small: true });

/* ── 5 · wing and engines ──────────────────────────────────────── */
const wing = group('wing and engines');

/* the wing in elevation: a blade sweeping forward-down from the root fairing */
panel(wing, 'wing-blade',
  [[-150, 26], [-96, 20], [96, 30], [10, 44], [-96, 46], [-210, 42], [-226, 34]],
  { wave: 5, z: 8, ...LOW, label: 'wing' });

panel(wing, 'root-fairing',
  [[-130, 12], [110, 12], [150, 40], [100, 56], [-100, 56], [-150, 40]],
  { wave: 5, z: 7, ...LOW });

panel(wing, 'winglet',
  [[-226, 34], [-244, 6], [-238, 2], [-218, 26], [-212, 40]],
  { wave: 5, z: 9, ...TOP, small: true });

panel(wing, 'pylon',
  [[-190, 42], [-142, 42], [-136, 62], [-186, 64]],
  { wave: 5, z: 9, finish: 'brushed', small: true });

/* the engine: inlet ring, core, fan — the fan spins on the prepare beat */
wing({ id: 'nacelle', shape: 'ring', r: 40, r2: 30, seed: 41,
  to: { x: -196, y: 86, rot: 0 }, wave: 5, z: 10, finish: 'polished',
  label: 'engine' });
wing({ id: 'fan', shape: 'gear', r: 27, teeth: 22, spokes: 8,
  to: { x: -196, y: 86, rot: 0 }, wave: 5, z: 9, finish: 'brushed', spin: 2.4 });
wing({ id: 'core', shape: 'trap', w: 34, h: 26, topW: 22,
  to: { x: -152, y: 90, rot: -1.5708 }, wave: 5, z: 8, finish: 'brushed', small: true });

/* ── 6 · empennage ─────────────────────────────────────────────── */
const tail = group('empennage');

panel(tail, 'fin',
  [[428, -46], [472, -160], [516, -186], [536, -182], [520, -120], [492, -40]],
  { wave: 6, z: 6, finish: 'painted', colour: NEARBLACK, label: 'fin' });

panel(tail, 'rudder',
  [[518, -180], [540, -184], [548, -120], [536, -50], [516, -48], [520, -120]],
  { wave: 6, z: 5, finish: 'painted', colour: NEARBLACK, small: true });

panel(tail, 'tailplane',
  [[430, -30], [548, -18], [552, -8], [502, -2], [430, -10]],
  { wave: 6, z: 7, ...TOP });

panel(tail, 'elevator',
  [[500, -4], [552, -8], [554, 0], [506, 6]],
  { wave: 6, z: 6, ...TOP, small: true });

/* ── 7 · doors, windows and lights ─────────────────────────────── */
const finish = group('doors, windows and lights');

/* the cabin window line — one row, evenly set, the airliner signature */
for (let i = 0; i < 16; i++) {
  finish({ id: `window-${i}`, shape: 'rect', w: 10, h: 14, rad: 5, seed: 60 + i,
    to: { x: -380 + i * 46, y: -20, rot: 0 },
    wave: 7, z: 11, finish: 'dark', small: true,
    label: i === 0 ? 'cabin windows' : undefined });
}

panel(finish, 'windscreen',
  [[-520, -34], [-484, -42], [-460, -40], [-462, -26], [-516, -24]],
  { wave: 7, z: 12, finish: 'dark', label: 'flight deck' });

/* the forward boarding door — the one colour on the aeroplane */
finish({ id: 'door-fwd', shape: 'rect', w: 22, h: 44, rad: 8, seed: 71,
  to: { x: -430, y: -8, rot: 0 }, wave: 7, z: 12,
  finish: 'anodised', colour: DOOR, label: 'forward door' });

finish({ id: 'door-aft', shape: 'rect', w: 20, h: 40, rad: 8, seed: 72,
  to: { x: 396, y: -10, rot: 0 }, wave: 7, z: 12, finish: 'dark', small: true });

finish({ id: 'beacon', shape: 'disc', r: 4,
  to: { x: -40, y: -62, rot: 0 }, wave: 7, z: 12, finish: 'polished', small: true });

finish({ id: 'nav-light', shape: 'disc', r: 4,
  to: { x: -242, y: 2, rot: 0 }, wave: 7, z: 12, finish: 'glass', small: true });

for (let i = 0; i < 3; i++) {
  finish({ id: `antenna-${i}`, shape: 'hand', w: 16, h: 3,
    to: { x: -120 + i * 160, y: -62, rot: -1.2 },
    wave: 7, z: 12, finish: 'dark', small: true });
}

finish({ id: 'pitot', shape: 'hand', w: 14, h: 3,
  to: { x: -540, y: -18, rot: 0 }, wave: 7, z: 12, finish: 'polished', small: true });

/* ── the flat lay ──────────────────────────────────────────────── */
const BOARD_W = 1460, MARGIN = 22, GUTTER = 13, SHELF_GAP = 14;
const size = p => [p.w ?? (p.r || 5) * 2, p.h ?? (p.r || 5) * 2];

function packFlatLay() {
  const run = BOARD_W - MARGIN * 2;
  const shelves = [];
  let cur = { items: [], w: 0, h: 0 };
  const close = () => { if (cur.items.length) shelves.push(cur); cur = { items: [], w: 0, h: 0 }; };
  GROUPS.forEach(g => {
    g.items.slice().sort((a, b) => size(b)[1] - size(a)[1]).forEach(p => {
      const [w, h] = size(p);
      if (cur.w + (cur.items.length ? GUTTER + w : w) > run) close();
      cur.w += cur.items.length ? GUTTER + w : w;
      cur.h = Math.max(cur.h, h);
      cur.items.push(p);
    });
  });
  close();
  const total = shelves.reduce((s, sh) => s + sh.h, 0) + (shelves.length - 1) * SHELF_GAP;
  let y = -total / 2;
  shelves.forEach(sh => {
    let x = -sh.w / 2;
    sh.items.forEach(p => {
      const [w, h] = size(p);
      p.lay = { x: +(x + w / 2).toFixed(1), y: +(y + sh.h / 2).toFixed(1) };
      x += w + GUTTER;
    });
    y += sh.h + SHELF_GAP;
  });
  return total + MARGIN * 2;
}

const BOARD_H = Math.ceil(packFlatLay() / 10) * 10;

export const aircraft = {
  name: 'narrow-body airliner, side elevation',
  board: { w: BOARD_W, h: BOARD_H },
  zoom: 1.45,
  parts,
  /* the general-arrangement ghost: the finished aeroplane and its gear line,
     dimensioned between the wheels, fading as the parts lift */
  underlay(c, ink) {
    c.strokeStyle = ink; c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = 1.1; c.globalAlpha *= 0.9;
    c.beginPath();
    c.moveTo(-560, -8);
    c.quadraticCurveTo(-540, -46, -480, -54);
    c.lineTo(300, -56);
    c.quadraticCurveTo(430, -52, 470, -158);   /* up the fin */
    c.lineTo(538, -184);
    c.lineTo(496, -40);
    c.quadraticCurveTo(540, -24, 552, -12);
    c.lineTo(430, 18);
    c.lineTo(140, 50);
    c.lineTo(-120, 50);
    c.quadraticCurveTo(-460, 40, -522, 20);
    c.closePath();
    c.stroke();
    /* wing chord and nacelle */
    c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-226, 34); c.lineTo(96, 30); c.stroke();
    c.beginPath(); c.arc(-196, 86, 40, 0, 6.2832); c.stroke();
    /* ground line, gear ticks, wheel-to-wheel dimension */
    c.beginPath(); c.moveTo(-580, 150); c.lineTo(580, 150); c.stroke();
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(-448, 158); c.lineTo(-6, 158);
    c.moveTo(-448, 152); c.lineTo(-448, 164);
    c.moveTo(-6, 152); c.lineTo(-6, 164);
    c.stroke();
  },
  families: [
    ['keel and frames',
     'the structure the whole day hangs off — nothing else fits until this is true'],
    ['skins',
     'the pressure vessel: the part of the machine the traveller actually touches'],
    ['rivets and straps',
     'thousands of small holds nobody boasts about, doing all of the holding'],
    ['landing gear',
     'the only parts that ever meet the ground, and the first to know the plan changed'],
    ['wing and engines',
     'the reason it flies, hung on one pylon each side — precision on a schedule'],
    ['empennage',
     'the tail that keeps everything pointed where the plan says'],
    ['doors, windows and lights',
     'the last parts on — and the forward door is where a person decides who boards'],
  ],
};
