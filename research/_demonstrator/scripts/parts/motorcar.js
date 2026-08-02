/* Sports car, side elevation — the automotive retail object.
 *
 * The prospect sells the object, so nothing else will do. Every part of one car,
 * knolled on paper, then assembled into a profile you could pick out of a car park.
 *
 * Two things are load-bearing here, and both are easy to get wrong.
 *
 * The first is the flat lay. Knolling is only knolling because a person decided where
 * everything goes — axis-aligned, even gutters, grouped by family, nothing touching.
 * With 172 parts, hand-typing 172 coordinates and hoping is how you end up with a
 * gearbox sitting on top of a door. So the art direction here is the *order* of the
 * families and the shelf each one breaks onto; the packer guarantees the gutters.
 * Even gutters are a stronger knolling signal than hand-placed jitter anyway.
 *
 * The second is the silhouette. Three things make a car read as a sports car from
 * across the room: a long bonnet, a cabin set well back, and a low sill running
 * between two wheels on the ground line. Everything else is detail. So the body
 * panels are drawn in absolute assembled coordinates — the elevation is far easier
 * to reason about as one drawing than as sixteen local ones — then recentred.
 *
 * Waves, inside out, in the order a car is actually built:
 * 1 chassis · 2 drivetrain · 3 fixings · 4 suspension and brakes · 5 wheels
 * · 6 body · 7 finishing.
 *
 * Colour discipline: every painted panel is Giltrap charcoal. Exactly one part is
 * Giltrap's house steel blue — the front brake caliper, the part that stops the car.
 * Giltrap Group's identity is deliberately marque-neutral so it does not compete with
 * the brands it represents, so there is no marque trade dress anywhere in this
 * manifest, and there must never be.
 *
 * Spec: references/knolling-assembly.md
 */

const CHARCOAL = '#2C3037';   /* Giltrap charcoal — every painted panel */
const STEEL_BLUE = '#76A6BD'; /* Giltrap house blue — the caliper, and nothing else */

const parts = [];
const GROUPS = [];

/* A family is both a visual group in the flat lay and a shelf boundary for the
   packer. Declaring the families in order is the art direction. */
function group(name) {
  const items = [];
  GROUPS.push({ name, items });
  return p => { parts.push(p); items.push(p); return p; };
}

/* Body panels arrive as absolute points on the finished elevation. Recentre them on
   their own origin, because the engine translates a part to `to` and then draws its
   points around that. `w`/`h` must be set for every poly — the sprite canvas is sized
   from them, and a poly without them is silently cropped to 10 × 10. */
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

/* Two arch helpers, because a guard is two different things.
   `archNotch` returns the arc that gets bitten out of the bottom of a body panel —
   traversed right to left over the top of the wheel, so the panel stays a simple
   polygon. Cutting the opening this way is what stops the front of the car reading
   as a thin blade floating above a tyre, which is exactly what happens if you draw
   the guard as a band and leave the panel behind it empty.
   `archBand` returns the flared lip that sits proud of that opening. */
function archNotch(cx, cy, r, steps = 18) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI * 2.07 - (Math.PI * 1.14 * i) / steps;
    pts.push([+(cx + Math.cos(a) * r).toFixed(1), +(cy + Math.sin(a) * r).toFixed(1)]);
  }
  return pts;
}
function archBand(cx, cy, rIn, rOut, a0, a1, steps = 16) {
  const out = [], back = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push([cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut]);
    back.unshift([cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn]);
  }
  return out.concat(back);
}

/* The finished car, set once so the panels and the running gear cannot drift apart.
   Ground line is y = 140. Nose sits at x = -422, tail at x = 414. */
const FW = { x: -268, y: 78 };   /* front wheel centre */
const RW = { x: 256, y: 78 };    /* rear wheel centre  */
const TYRE_R = 62, RIM_R = 40;

/* ── 1 · chassis ─────────────────────────────────────────────────
   The floorpan, the firewall and the roll hoop. What everything else bolts to, and
   the parts that have to hold if the day goes badly. */
const chassis = group('chassis');

chassis({ id: 'floorpan', shape: 'rect', w: 380, h: 44, rad: 8, seed: 3,
  to: { x: 10, y: 76, rot: 0 }, wave: 1, z: 1, finish: 'cast', label: 'floorpan' });

chassis({ id: 'tunnel', shape: 'rect', w: 300, h: 24, rad: 6, grooves: 9,
  to: { x: 30, y: 52, rot: 0 }, wave: 1, z: 2, finish: 'brushed' });

panel(chassis, 'subframe-front',
  [[-306, 32], [-192, 28], [-182, 64], [-200, 92], [-292, 92], [-308, 62]],
  { wave: 1, z: 1, finish: 'cast', seed: 5 });

panel(chassis, 'subframe-rear',
  [[192, 30], [312, 26], [326, 62], [310, 94], [202, 94], [186, 64]],
  { wave: 1, z: 1, finish: 'cast', seed: 6 });

chassis({ id: 'bulkhead', shape: 'rect', w: 88, h: 78, rad: 5, seed: 8,
  to: { x: 10, y: 24, rot: 0 }, wave: 1, z: 2, finish: 'brushed' });

panel(chassis, 'roll-hoop',
  [[164, -84], [170, -104], [186, -112], [214, -108], [226, -84], [226, -24],
   [210, -24], [210, -80], [198, -94], [184, -92], [180, -24], [164, -24]],
  { wave: 1, z: 3, finish: 'polished' });

chassis({ id: 'crash-front', shape: 'trap', w: 62, h: 36, topW: 40, seed: 2,
  to: { x: -386, y: 56, rot: 0 }, wave: 1, z: 1, finish: 'cast', small: true });

chassis({ id: 'crash-rear', shape: 'trap', w: 62, h: 36, topW: 40, seed: 4,
  to: { x: 378, y: 30, rot: 0 }, wave: 1, z: 1, finish: 'cast', small: true });

for (let i = 0; i < 2; i++) {
  chassis({ id: `seat-rail-${i}`, shape: 'bar', w: 86, h: 8,
    to: { x: 124, y: 58 + i * 16, rot: 0 },
    wave: 1, z: 3, finish: 'brushed', small: true });
}

/* ── 2 · drivetrain ──────────────────────────────────────────────
   Flat-six under the long bonnet, driving the rear wheels through a shaft in the
   tunnel. None of it shows on the finished car, which is rather the point. */
const drive = group('drivetrain');

drive({ id: 'block', shape: 'rect', w: 128, h: 74, rad: 6, seed: 11,
  to: { x: -190, y: 40, rot: 0 }, wave: 2, z: 4, finish: 'cast', label: 'flat-six block' });

drive({ id: 'sump', shape: 'trap', w: 116, h: 30, topW: 128, seed: 12,
  to: { x: -190, y: 88, rot: 0 }, wave: 2, z: 3, finish: 'cast' });

for (let i = 0; i < 2; i++) {
  drive({ id: `cam-cover-${i}`, shape: 'rect', w: 60, h: 20, rad: 5, grooves: 5,
    to: { x: -240 + i * 100, y: 12, rot: 0 },
    wave: 2, z: 5, finish: 'brushed' });
}

drive({ id: 'plenum', shape: 'rect', w: 82, h: 26, rad: 8, seed: 14,
  to: { x: -190, y: -4, rot: 0 }, wave: 2, z: 6, finish: 'brushed' });

drive({ id: 'throttle', shape: 'disc', r: 12, hole: 5,
  to: { x: -138, y: -2, rot: 0 }, wave: 2, z: 6, finish: 'polished', small: true });

drive({ id: 'crank', shape: 'bar', w: 124, h: 12,
  to: { x: -190, y: 54, rot: 0 }, wave: 2, z: 5, finish: 'polished', label: 'crankshaft' });

drive({ id: 'flywheel', shape: 'gear', r: 29, teeth: 36, spokes: 5,
  to: { x: -98, y: 54, rot: 0 }, wave: 2, z: 5, finish: 'brushed', spin: 1.4 });

drive({ id: 'clutch', shape: 'disc', r: 26, hole: 7,
  to: { x: -84, y: 54, rot: 0 }, wave: 2, z: 4, finish: 'brushed' });

drive({ id: 'gearbox', shape: 'trap', w: 92, h: 70, topW: 60, seed: 15,
  to: { x: -30, y: 60, rot: 0 }, wave: 2, z: 3, finish: 'cast', label: 'gearbox' });

for (let i = 0; i < 2; i++) {
  drive({ id: `driveshaft-${i}`, shape: 'bar', w: 88, h: 9,
    to: { x: 66 + i * 92, y: 84, rot: 0 },
    wave: 2, z: 3, finish: 'polished', small: true });
}

drive({ id: 'radiator', shape: 'rect', w: 84, h: 50, rad: 3, grooves: 12,
  to: { x: -376, y: 44, rot: 0 }, wave: 2, z: 2, finish: 'brushed' });

drive({ id: 'oil-cooler', shape: 'rect', w: 50, h: 30, rad: 3, grooves: 8,
  to: { x: -334, y: 66, rot: 0 }, wave: 2, z: 2, finish: 'brushed', small: true });

drive({ id: 'alternator', shape: 'disc', r: 16, hole: 5,
  to: { x: -138, y: 70, rot: 0 }, wave: 2, z: 6, finish: 'brushed', spin: -1.8, small: true });

drive({ id: 'starter', shape: 'disc', r: 12,
  to: { x: -108, y: 78, rot: 0 }, wave: 2, z: 5, finish: 'brushed', small: true });

drive({ id: 'water-pump', shape: 'disc', r: 13, hole: 4,
  to: { x: -244, y: 68, rot: 0 }, wave: 2, z: 6, finish: 'brushed', spin: 2.2, small: true });

/* six pistons and six rods — two opposed banks of three, as a flat-six is */
const ROD = [[-22, -3], [-12, -5], [12, -4], [21, -6], [24, 0],
             [21, 6], [12, 4], [-12, 5], [-22, 3]];
for (let i = 0; i < 6; i++) {
  const bank = i < 3 ? 0 : 1, n = i % 3;
  drive({ id: `piston-${i}`, shape: 'rect', w: 22, h: 24, rad: 3, grooves: 4,
    to: { x: -228 + n * 38, y: bank ? 68 : 16, rot: 0 },
    wave: 2, z: 5, finish: 'polished', small: true });
  drive({ id: `conrod-${i}`, shape: 'poly', points: ROD, w: 46, h: 12,
    to: { x: -228 + n * 38, y: bank ? 58 : 30, rot: bank ? -1.35 : 1.35 },
    wave: 2, z: 4, finish: 'polished', small: true });
}

/* six exhaust primaries, gathering into one collector under the floor */
for (let i = 0; i < 6; i++) {
  drive({ id: `primary-${i}`, shape: 'bar', w: 96 - (i % 3) * 8, h: 11,
    to: { x: -128 + (i % 3) * 6, y: 46 + i * 8, rot: 0.14 + i * 0.03 },
    wave: 2, z: 2, finish: 'brushed', small: true,
    label: i === 0 ? 'exhaust primaries' : undefined });
}

drive({ id: 'collector', shape: 'trap', w: 48, h: 36, topW: 24, seed: 17,
  to: { x: -34, y: 94, rot: 0 }, wave: 2, z: 3, finish: 'brushed', small: true });

drive({ id: 'muffler', shape: 'rect', w: 92, h: 32, rad: 15, seed: 18,
  to: { x: 354, y: 72, rot: 0 }, wave: 2, z: 3, finish: 'brushed' });

/* ── 3 · fixings ─────────────────────────────────────────────────
   The parts nobody photographs, and the line on the invoice people query. Many,
   small, fast — and dropped entirely on mobile rather than shrunk. */
const fixings = group('fixings');

for (let i = 0; i < 24; i++) {
  let x, y;
  if (i < 8) {                       /* around the front arch */
    const a = Math.PI + (i / 7) * Math.PI;
    x = FW.x + Math.cos(a) * 84; y = FW.y + Math.sin(a) * 84;
  } else if (i < 16) {               /* around the rear arch */
    const a = Math.PI + ((i - 8) / 7) * Math.PI;
    x = RW.x + Math.cos(a) * 92; y = RW.y + Math.sin(a) * 92;
  } else {                           /* along the sill */
    x = -120 + (i - 16) * 38; y = 96;
  }
  fixings({ id: `bolt-${i}`, shape: 'screw', r: 3.4 + (i % 4) * 0.6, cross: i % 3 === 0,
    to: { x: +x.toFixed(1), y: +y.toFixed(1), rot: (i % 5) * 0.4 },
    wave: 3, z: 7, finish: 'polished', small: true,
    label: i === 0 ? 'bolts' : undefined });
}

for (let i = 0; i < 6; i++) {
  fixings({ id: `washer-${i}`, shape: 'ring', r: 7, r2: 3.6,
    to: { x: -330 + i * 60, y: 8 + i * 2, rot: 0 },
    wave: 3, z: 7, finish: 'brushed', small: true });
}

/* ── 4 · suspension and brakes ───────────────────────────────────
   The family that wears out. Everything a workshop finds during an inspection, and
   everything that turns into a number on an estimate, is in here. */
const running = group('suspension and brakes');

const WISHBONE = [[-44, -20], [-26, -22], [40, -6], [46, 0], [40, 6], [-26, 22],
                  [-44, 20], [-40, 12], [22, 0], [-40, -12]];
[[FW.x, 44, 0], [FW.x, 96, 1], [RW.x, 44, 2], [RW.x, 96, 3]].forEach(([x, y, i]) => {
  running({ id: `wishbone-${i}`, shape: 'poly', points: WISHBONE, w: 90, h: 44,
    to: { x, y, rot: i % 2 ? 0.12 : -0.12 },
    wave: 4, z: 4, finish: 'brushed' });
});

[[-192, 0], [204, 1]].forEach(([x, i]) => {
  running({ id: `toe-link-${i}`, shape: 'bar', w: 74, h: 7,
    to: { x, y: 88, rot: 0 }, wave: 4, z: 4, finish: 'polished', small: true });
});

/* springs and dampers — near side, then the far pair sunk behind the body */
[[FW.x, 0, 5], [RW.x, 1, 5], [FW.x - 8, 2, 1], [RW.x + 8, 3, 1]].forEach(([x, i, z]) => {
  running({ id: `spring-${i}`, shape: 'coil', r: 21, turns: 5,
    to: { x, y: i > 1 ? 46 : 52, rot: 0 },
    wave: 4, z, finish: 'brushed', small: i > 1,
    label: i === 0 ? 'springs' : undefined });
  running({ id: `damper-${i}`, shape: 'rect', w: 14, h: 68, rad: 6, grooves: 3,
    to: { x, y: i > 1 ? 40 : 46, rot: 0 },
    wave: 4, z: z - 1, finish: 'polished', small: true });
});

/* brake discs — the near pair sit over the rim so they read through the spokes */
[[FW.x, FW.y, 0, 10], [RW.x, RW.y, 1, 10], [FW.x - 10, 72, 2, -4], [RW.x + 10, 72, 3, -4]]
  .forEach(([x, y, i, z]) => {
    running({ id: `disc-${i}`, shape: 'ring', r: 35, r2: 12,
      to: { x, y, rot: 0 }, wave: 4, z, finish: 'brushed', spin: 0.6,
      label: i === 0 ? 'brake discs' : undefined });
  });

/* drillings — six per visible disc */
for (let i = 0; i < 12; i++) {
  const c = i < 6 ? FW : RW, a = ((i % 6) / 6) * Math.PI * 2;
  running({ id: `drilling-${i}`, shape: 'disc', r: 3,
    to: { x: +(c.x + Math.cos(a) * 25).toFixed(1), y: +(c.y + Math.sin(a) * 25).toFixed(1), rot: 0 },
    wave: 4, z: 11, finish: 'dark', small: true });
}

/* The caliper. It clamps the top of the disc, so it lies along the circumference —
   hence the quarter turn. The only colour on the whole board. */
const CALIPER = [[-13, -24], [7, -22], [11, -8], [11, 8], [7, 22], [-13, 24],
                 [-15, 10], [-15, -10]];
running({ id: 'caliper-front', shape: 'poly', points: CALIPER, w: 26, h: 48,
  to: { x: FW.x + 2, y: FW.y - 38, rot: Math.PI / 2 },
  wave: 4, z: 14, finish: 'anodised', colour: STEEL_BLUE, label: 'brake caliper' });
running({ id: 'caliper-rear', shape: 'poly', points: CALIPER, w: 26, h: 48,
  to: { x: RW.x - 2, y: RW.y - 38, rot: Math.PI / 2, scale: 0.8 },
  wave: 4, z: 14, finish: 'cast', small: true });

[[FW.x, 0], [RW.x, 1]].forEach(([x, i]) => {
  running({ id: `upright-${i}`, shape: 'plate', r: 24, seed: 20 + i,
    holes: [[-8, -6, 4], [9, 8, 5]],
    to: { x, y: 78, rot: 0 }, wave: 4, z: 5, finish: 'cast', small: true });
  running({ id: `anti-roll-${i}`, shape: 'bar', w: 116, h: 8,
    to: { x, y: 110, rot: 0 }, wave: 4, z: 3, finish: 'polished', small: true });
});

running({ id: 'steering-rack', shape: 'bar', w: 126, h: 10,
  to: { x: FW.x, y: 62, rot: 0 }, wave: 4, z: 3, finish: 'brushed', small: true });

/* ── 5 · wheels ──────────────────────────────────────────────────
   Four of everything. But this is a side elevation, so two of them sit behind the
   car on a lower z and are never properly seen. True of the real thing as well. */
const wheels = group('wheels');

const WHEEL_POS = [
  { id: 'nf', x: FW.x, y: FW.y, z: 8, near: true },
  { id: 'nr', x: RW.x, y: RW.y, z: 8, near: true },
  { id: 'ff', x: FW.x - 10, y: 72, z: -3, near: false },
  { id: 'fr', x: RW.x + 10, y: 72, z: -3, near: false },
];

WHEEL_POS.forEach((w, i) => {
  wheels({ id: `tyre-${w.id}`, shape: 'tyre', r: TYRE_R, r2: RIM_R,
    to: { x: w.x, y: w.y, rot: 0 },
    wave: 5, z: w.z, finish: 'rubber', spin: -0.5, small: !w.near,
    label: i === 0 ? 'tyres' : undefined });

  wheels({ id: `rim-${w.id}`, shape: 'disc', r: RIM_R,
    to: { x: w.x, y: w.y, rot: 0 },
    wave: 5, z: w.z + 1, finish: 'polished', spin: -0.5, small: !w.near });

  if (!w.near) return;
  for (let s = 0; s < 8; s++) {
    const a = (s / 8) * Math.PI * 2;
    wheels({ id: `spoke-${w.id}-${s}`, shape: 'bar', w: 32, h: 6,
      to: { x: +(w.x + Math.cos(a) * 21).toFixed(1), y: +(w.y + Math.sin(a) * 21).toFixed(1), rot: a },
      wave: 5, z: w.z + 4, finish: 'polished', spin: -0.5, small: true });
  }
  wheels({ id: `hub-${w.id}`, shape: 'disc', r: 10,
    to: { x: w.x, y: w.y, rot: 0 },
    wave: 5, z: w.z + 7, finish: 'brushed', small: true });
});

/* ── 6 · body ────────────────────────────────────────────────────
   Sixteen panels, all Giltrap charcoal. The bonnet runs from the nose almost to the
   middle of the car; the cabin sits over the back axle; the sill joins the two
   arches. Panels overlap at every shut line on purpose — a gap between two panels
   in a side elevation reads instantly as a hole in the car, and the wheel openings
   are cut out of solid panels for the same reason. */
const body = group('body');
const PAINT = { finish: 'painted', colour: CHARCOAL };

panel(body, 'splitter',
  [[-418, 80], [-346, 74], [-334, 84], [-336, 98], [-412, 98]],
  { wave: 6, z: 19, ...PAINT, small: true });

panel(body, 'bumper-front',
  [[-422, 40], [-410, 16], [-386, 4], [-344, 2], [-330, 26], [-332, 70],
   [-352, 86], [-414, 88], [-422, 64]],
  { wave: 6, z: 18, ...PAINT });

panel(body, 'bonnet',
  [[-390, 16], [-330, -2], [-236, -16], [-120, -26], [-20, -32], [26, -34],
   [28, -6], [-30, -2], [-130, 4], [-240, 14], [-334, 26], [-390, 42]],
  { wave: 6, z: 17, ...PAINT, label: 'bonnet' });

/* The front guard is a filled panel with the wheel opening bitten out of it, not a
   strip. Everything between the bonnet shut line and the sill is metal. */
panel(body, 'front-wing',
  [[-338, 18], [-240, 6], [-148, -6], [-144, 96], [-198, 96]]
    .concat(archNotch(FW.x, FW.y, 64))
    .concat([[-338, 96]]),
  { wave: 6, z: 17, ...PAINT });

panel(body, 'door',
  [[-150, -6], [-60, -20], [40, -30], [140, -36], [162, -34], [166, 86],
   [80, 98], [-40, 102], [-130, 98], [-152, 86]],
  { wave: 6, z: 16, ...PAINT, label: 'door' });

/* Same treatment at the back: one quarter panel from the door shut to the tail,
   with the rear opening cut out of it. */
panel(body, 'rear-quarter',
  [[158, -32], [240, -94], [300, -58], [368, -42], [372, 20], [358, 74], [338, 96]]
    .concat(archNotch(RW.x, RW.y, 64))
    .concat([[172, 96], [160, 60]]),
  { wave: 6, z: 16, ...PAINT });

panel(body, 'rear-haunch',
  archBand(RW.x, RW.y, 62, 86, Math.PI * 0.95, Math.PI * 2.05),
  { wave: 6, z: 17, ...PAINT });

panel(body, 'a-pillar',
  [[24, -30], [42, -40], [124, -114], [104, -112], [32, -24]],
  { wave: 6, z: 25, ...PAINT });

panel(body, 'roof-skin',
  [[102, -112], [140, -120], [210, -120], [252, -108], [244, -94],
   [206, -106], [140, -106], [96, -98]],
  { wave: 6, z: 25, ...PAINT, label: 'roof' });

panel(body, 'c-pillar',
  [[246, -110], [266, -104], [340, -62], [392, -42], [390, -26],
   [330, -46], [268, -78], [238, -94]],
  { wave: 6, z: 25, ...PAINT });

panel(body, 'sill',
  [[-160, 80], [174, 76], [176, 104], [-158, 108]],
  { wave: 6, z: 15, ...PAINT, label: 'sill' });

panel(body, 'bumper-rear',
  [[356, -42], [396, -30], [414, 2], [410, 46], [390, 74], [356, 76],
   [348, 28], [352, -12]],
  { wave: 6, z: 18, ...PAINT });

panel(body, 'diffuser',
  [[346, 72], [404, 68], [408, 94], [344, 98]],
  { wave: 6, z: 19, finish: 'dark', small: true });

panel(body, 'rear-wing',
  [[300, -52], [376, -40], [378, -54], [306, -66]],
  { wave: 6, z: 20, ...PAINT });

panel(body, 'side-intake',
  [[176, 10], [202, 15], [205, 52], [178, 47]],
  { wave: 6, z: 19, finish: 'dark', small: true });

body({ id: 'front-vent', shape: 'rect', w: 40, h: 16, rad: 4, grooves: 5,
  to: { x: -190, y: -14, rot: 0 }, wave: 6, z: 19, finish: 'dark', small: true });

/* ── 7 · finishing ───────────────────────────────────────────────
   Glass, lights, mirrors, and the seats you can see through the side window. Last
   parts on, first parts anyone notices. */
const finish = group('finishing');

panel(finish, 'windscreen',
  [[36, -24], [54, -36], [126, -112], [110, -108], [46, -20], [34, -14]],
  { wave: 7, z: 23, finish: 'glass', label: 'windscreen' });

panel(finish, 'side-glass',
  [[50, -34], [134, -104], [208, -106], [240, -96], [238, -42], [150, -36], [62, -30]],
  { wave: 7, z: 23, finish: 'glass' });

panel(finish, 'quarter-glass',
  [[238, -44], [242, -96], [290, -62], [288, -44]],
  { wave: 7, z: 23, finish: 'glass', small: true });

panel(finish, 'headlight',
  [[-380, 0], [-342, -6], [-334, 12], [-348, 24], [-382, 22]],
  { wave: 7, z: 20, finish: 'glass', label: 'headlight' });

panel(finish, 'tail-light',
  [[356, -30], [402, -22], [404, -4], [354, -12]],
  { wave: 7, z: 20, finish: 'glass' });

panel(finish, 'mirror',
  [[-2, -42], [22, -48], [28, -36], [6, -32]],
  { wave: 7, z: 26, ...PAINT, small: true });

finish({ id: 'door-handle', shape: 'bar', w: 32, h: 8,
  to: { x: 96, y: -18, rot: 0 }, wave: 7, z: 21, finish: 'polished', small: true });

finish({ id: 'badge', shape: 'disc', r: 8,
  to: { x: -404, y: 34, rot: 0 }, wave: 7, z: 21, finish: 'polished', small: true });

/* seats, read through the side glass — the near one, and the one behind it */
const SEAT = [[-24, -36], [-8, -40], [6, -34], [10, 0], [16, 26], [24, 34],
              [-6, 36], [-22, 30], [-26, 0]];
finish({ id: 'seat-near', shape: 'poly', points: SEAT, w: 50, h: 76,
  to: { x: 126, y: -62, rot: 0 }, wave: 7, z: 19, finish: 'dark', label: 'seats' });
finish({ id: 'seat-far', shape: 'poly', points: SEAT, w: 50, h: 76,
  to: { x: 156, y: -58, rot: 0 }, wave: 7, z: 18, finish: 'dark', small: true });

finish({ id: 'steering-wheel', shape: 'ring', r: 19, r2: 15,
  to: { x: 64, y: -52, rot: 0 }, wave: 7, z: 19, finish: 'dark', small: true });

finish({ id: 'dash', shape: 'poly',
  points: [[-40, -8], [24, -12], [40, -4], [38, 10], [-20, 12], [-40, 6]], w: 80, h: 24,
  to: { x: 78, y: -38, rot: 0 }, wave: 7, z: 19, finish: 'dark', small: true });

finish({ id: 'wiper', shape: 'hand', w: 22, h: 4,
  to: { x: 14, y: -24, rot: -0.34 }, wave: 7, z: 22, finish: 'dark', small: true });

for (let i = 0; i < 2; i++) {
  finish({ id: `exhaust-tip-${i}`, shape: 'disc', r: 10, hole: 6,
    to: { x: 366 + i * 28, y: 86, rot: 0 },
    wave: 7, z: 22, finish: 'polished', small: true });
}

finish({ id: 'fuel-cap', shape: 'disc', r: 10,
  to: { x: 286, y: -54, rot: 0 }, wave: 7, z: 21, finish: 'brushed', small: true });

/* ── the flat lay ────────────────────────────────────────────────
   Shelves, left to right, families in the order declared above. Within a family the
   tallest part goes first, so a shelf stays roughly one height and the gutters read
   as even rather than ragged. Each shelf is centred on the board. Nothing overlaps —
   guaranteed by construction here, and checked again by the test script.

   The board lands at 1460 × 960. That is bigger than the watch's, because a car has
   bigger parts, but the proportion is the same as the rest of the system and the
   engine scales whatever board it is handed to fit the canvas. */
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

export const motorcar = {
  name: 'sports car, side elevation',
  board: { w: BOARD_W, h: BOARD_H },
  zoom: 1.55,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['floorpan, subframes and roll hoop',
     'the structure everything else bolts to, and the parts that have to hold if the day goes badly'],
    ['flat-six block, crank, pistons and gearbox',
     'the machinery that does the work — the reason someone bought this car and not a cheaper one'],
    ['bolts, washers and clips',
     'the small parts nobody photographs, and the line on the invoice people query'],
    ['wishbones, springs, dampers, discs and calipers',
     'the parts that wear out — almost everything an inspection finds comes from this family'],
    ['tyres, rims, spokes and hubs',
     'the four things touching the road, though from the side you only ever see two of them'],
    ['bonnet, wings, door, sill, roof and bumpers',
     'the panels the owner looks at every day, and the ones a workshop has to hand back unmarked'],
    ['glass, lights, mirrors and seats',
     'the last parts on and the first anyone notices — the finish the car gets judged on'],
  ],
};
