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
   Ground line is y = 140. Nose sits at x = -422, tail at x = 414.

   Kate, 2 Aug 2026: the car is a 356 — the group's founding story, drawn as a
   side elevation in homage. Rounded wings, an upright screen, one long fastback
   line to the tail, and the flat-four where it belongs: behind the rear axle.
   No badges, no scripts, no marque trade dress — the silhouette carries it. */
const FW = { x: -258, y: 78 };   /* front wheel centre */
const RW = { x: 238, y: 78 };    /* rear wheel centre  */
const TYRE_R = 60, RIM_R = 38;

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

/* the windscreen frame — a 356 coupé has no hoop, but the screen surround is
   structure, and it is the one upright in the whole profile */
panel(chassis, 'screen-frame',
  [[-142, -34], [-136, -98], [-130, -104], [-82, -102], [-78, -94], [-124, -96],
   [-128, -34]],
  { wave: 1, z: 3, finish: 'polished' });

chassis({ id: 'torsion-tube', shape: 'bar', w: 96, h: 12,
  to: { x: RW.x - 58, y: 92, rot: 0 }, wave: 1, z: 2, finish: 'cast', small: true });

chassis({ id: 'crash-front', shape: 'trap', w: 62, h: 36, topW: 40, seed: 2,
  to: { x: -386, y: 56, rot: 0 }, wave: 1, z: 1, finish: 'cast', small: true });

chassis({ id: 'crash-rear', shape: 'trap', w: 62, h: 36, topW: 40, seed: 4,
  to: { x: 378, y: 44, rot: 0 }, wave: 1, z: 1, finish: 'cast', small: true });

for (let i = 0; i < 2; i++) {
  chassis({ id: `seat-rail-${i}`, shape: 'bar', w: 86, h: 8,
    to: { x: -20, y: 58 + i * 16, rot: 0 },
    wave: 1, z: 3, finish: 'brushed', small: true });
}

/* ── 2 · drivetrain ──────────────────────────────────────────────
   The flat-four, air-cooled, hung behind the rear axle with the gearbox ahead
   of it — the layout that makes a 356 a 356. None of it shows on the finished
   car, which is rather the point. */
const drive = group('drivetrain');

drive({ id: 'block', shape: 'rect', w: 96, h: 56, rad: 6, seed: 11,
  to: { x: 290, y: 56, rot: 0 }, wave: 2, z: 4, finish: 'cast', label: 'flat-four block' });

drive({ id: 'sump', shape: 'trap', w: 88, h: 22, topW: 96, seed: 12,
  to: { x: 290, y: 92, rot: 0 }, wave: 2, z: 3, finish: 'cast' });

for (let i = 0; i < 2; i++) {
  drive({ id: `cam-cover-${i}`, shape: 'rect', w: 40, h: 16, rad: 5, grooves: 4,
    to: { x: 252 + i * 76, y: 58, rot: 0 },
    wave: 2, z: 5, finish: 'brushed' });
}

/* the fan shroud on top — the air-cooled signature, and the bit that spins */
drive({ id: 'plenum', shape: 'ring', r: 26, r2: 18, seed: 14,
  to: { x: 290, y: 16, rot: 0 }, wave: 2, z: 6, finish: 'brushed' });

drive({ id: 'throttle', shape: 'disc', r: 10, hole: 4,
  to: { x: 322, y: 8, rot: 0 }, wave: 2, z: 6, finish: 'polished', small: true });

drive({ id: 'crank', shape: 'bar', w: 84, h: 11,
  to: { x: 290, y: 62, rot: 0 }, wave: 2, z: 5, finish: 'polished', label: 'crankshaft' });

drive({ id: 'flywheel', shape: 'gear', r: 26, teeth: 32, spokes: 5,
  to: { x: 236, y: 62, rot: 0 }, wave: 2, z: 5, finish: 'brushed', spin: 1.4 });

drive({ id: 'clutch', shape: 'disc', r: 23, hole: 6,
  to: { x: 222, y: 62, rot: 0 }, wave: 2, z: 4, finish: 'brushed' });

/* the transaxle, forward of the axle line — gears first, engine behind */
drive({ id: 'gearbox', shape: 'trap', w: 84, h: 60, topW: 54, seed: 15,
  to: { x: 158, y: 66, rot: 1.5708 }, wave: 2, z: 3, finish: 'cast', label: 'gearbox' });

for (let i = 0; i < 2; i++) {
  drive({ id: `driveshaft-${i}`, shape: 'bar', w: 46, h: 9,
    to: { x: RW.x - 44 + i * 18, y: 82 + i * 6, rot: 0.1 },
    wave: 2, z: 3, finish: 'polished', small: true });
}

/* air-cooled: no radiator anywhere — the heater boxes and the oil cooler
   do the thermal work */
drive({ id: 'radiator', shape: 'rect', w: 54, h: 26, rad: 3, grooves: 8,
  to: { x: 336, y: 90, rot: 0 }, wave: 2, z: 2, finish: 'brushed' });

drive({ id: 'oil-cooler', shape: 'rect', w: 34, h: 26, rad: 3, grooves: 6,
  to: { x: 254, y: 26, rot: 0 }, wave: 2, z: 2, finish: 'brushed', small: true });

drive({ id: 'alternator', shape: 'disc', r: 13, hole: 4,
  to: { x: 290, y: 2, rot: 0 }, wave: 2, z: 7, finish: 'brushed', spin: -1.8, small: true });

drive({ id: 'starter', shape: 'disc', r: 10,
  to: { x: 196, y: 74, rot: 0 }, wave: 2, z: 5, finish: 'brushed', small: true });

drive({ id: 'water-pump', shape: 'disc', r: 10, hole: 3,
  to: { x: 318, y: 22, rot: 0 }, wave: 2, z: 6, finish: 'brushed', spin: 2.2, small: true });

/* four pistons and four rods — two opposed pairs, laid flat, as a flat-four is */
const ROD = [[-22, -3], [-12, -5], [12, -4], [21, -6], [24, 0],
             [21, 6], [12, 4], [-12, 5], [-22, 3]];
for (let i = 0; i < 4; i++) {
  const bank = i < 2 ? 0 : 1, n = i % 2;
  drive({ id: `piston-${i}`, shape: 'rect', w: 20, h: 22, rad: 3, grooves: 4,
    to: { x: 266 + n * 48, y: bank ? 78 : 36, rot: 1.5708 },
    wave: 2, z: 5, finish: 'polished', small: true });
  drive({ id: `conrod-${i}`, shape: 'poly', points: ROD, w: 46, h: 12,
    to: { x: 276 + n * 34, y: bank ? 70 : 46, rot: bank ? -0.3 : 0.3 },
    wave: 2, z: 4, finish: 'polished', small: true });
}

/* four exhaust primaries into the heater boxes, then one quiet transverse box */
for (let i = 0; i < 4; i++) {
  drive({ id: `primary-${i}`, shape: 'bar', w: 60 - (i % 2) * 8, h: 10,
    to: { x: 262 + (i % 2) * 40, y: 96 + i * 4, rot: 0.1 + i * 0.04 },
    wave: 2, z: 2, finish: 'brushed', small: true,
    label: i === 0 ? 'exhaust primaries' : undefined });
}

drive({ id: 'collector', shape: 'trap', w: 40, h: 28, topW: 20, seed: 17,
  to: { x: 322, y: 104, rot: 0 }, wave: 2, z: 3, finish: 'brushed', small: true });

drive({ id: 'muffler', shape: 'rect', w: 78, h: 26, rad: 13, seed: 18,
  to: { x: 348, y: 92, rot: 0 }, wave: 2, z: 2, finish: 'brushed' });

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

/* the front valance under the bumper — 356s carry their chin low and round */
panel(body, 'splitter',
  [[-408, 76], [-336, 72], [-326, 82], [-330, 98], [-402, 98], [-410, 86]],
  { wave: 6, z: 19, ...PAINT, small: true });

/* the blade bumper, riding clear of the body on its brackets */
panel(body, 'bumper-front',
  [[-420, 42], [-402, 36], [-336, 34], [-324, 44], [-326, 58], [-344, 64],
   [-406, 62], [-420, 54]],
  { wave: 6, z: 21, finish: 'polished' });

/* the front lid — luggage under it, engine at the other end */
panel(body, 'bonnet',
  [[-398, 8], [-340, -16], [-260, -32], [-186, -40], [-150, -42], [-148, -26],
   [-188, -24], [-262, -16], [-340, 0], [-394, 24]],
  { wave: 6, z: 17, ...PAINT, label: 'front lid' });

/* The front guard is a filled panel with the wheel opening bitten out of it —
   the 356 wing crowns high over the wheel and carries the headlight. */
panel(body, 'front-wing',
  [[-414, 12], [-360, -14], [-310, -22], [-266, -20], [-222, -14], [-190, -18],
   [-152, -22], [-148, -32], [-146, 96], [-192, 96]]
    .concat(archNotch(FW.x, FW.y, 62))
    .concat([[-368, 96], [-412, 60]]),
  { wave: 6, z: 16, ...PAINT });

/* a 356 door is small and upright, cut high over the sill */
panel(body, 'door',
  [[-126, -36], [-40, -40], [34, -38], [40, 84], [-30, 92], [-120, 90], [-128, 30]],
  { wave: 6, z: 15, ...PAINT, label: 'door' });

/* One panel from the door shut to the tail: the haunch over the rear wheel and
   the long fastback surface, with the wheel opening bitten out. */
panel(body, 'rear-quarter',
  [[38, -32], [104, -36], [114, -66], [176, -56], [230, -32], [290, -8], [340, 12],
   [382, 34], [398, 52], [394, 76], [366, 92]]
    .concat(archNotch(RW.x, RW.y, 62))
    .concat([[44, 92]]),
  { wave: 6, z: 16, ...PAINT });

panel(body, 'rear-haunch',
  archBand(RW.x, RW.y, 62, 84, Math.PI * 0.98, Math.PI * 2.02),
  { wave: 6, z: 17, ...PAINT });

panel(body, 'a-pillar',
  [[-138, -34], [-128, -40], [-86, -98], [-98, -100], [-142, -40]],
  { wave: 6, z: 25, ...PAINT });

/* the roofline is the whole car: one arc from the screen header, over the peak,
   down the fastback to the engine lid */
panel(body, 'roof-skin',
  [[-96, -100], [-52, -112], [8, -116], [64, -108], [122, -88], [176, -62],
   [228, -36], [222, -24], [172, -50], [112, -70], [58, -92], [8, -102],
   [-48, -98], [-90, -88]],
  { wave: 6, z: 25, ...PAINT, label: 'roof' });

panel(body, 'sill',
  [[-148, 80], [168, 78], [170, 104], [-146, 106]],
  { wave: 6, z: 14, ...PAINT, label: 'sill' });

/* the rear blade bumper, matching the front */
panel(body, 'bumper-rear',
  [[330, 40], [400, 44], [412, 54], [408, 68], [388, 72], [328, 62], [322, 50]],
  { wave: 6, z: 21, finish: 'polished' });

panel(body, 'diffuser',
  [[330, 76], [396, 78], [400, 96], [332, 98]],
  { wave: 6, z: 19, finish: 'dark', small: true });

/* the engine lid, set into the fastback, with its louvred grille */
panel(body, 'rear-wing',
  [[228, -34], [290, -14], [344, 8], [352, 22], [292, 2], [230, -20]],
  { wave: 6, z: 20, ...PAINT, label: 'engine lid' });

body({ id: 'side-intake', shape: 'rect', w: 36, h: 12, rad: 5, grooves: 7,
  to: { x: 296, y: -4, rot: 0.36 }, wave: 6, z: 22, finish: 'dark', small: true });

body({ id: 'front-vent', shape: 'rect', w: 26, h: 10, rad: 5, grooves: 4,
  to: { x: -354, y: 34, rot: 0 }, wave: 6, z: 19, finish: 'dark', small: true });

/* ── 7 · finishing ───────────────────────────────────────────────
   Glass, lights, mirrors, and the seats you can see through the side window. Last
   parts on, first parts anyone notices. */
const finish = group('finishing');

/* the upright vee screen — early 356s split it down the middle, so it gets a
   visible centre join rather than one clean sheet */
panel(finish, 'windscreen',
  [[-136, -38], [-128, -44], [-88, -96], [-100, -96], [-138, -44]],
  { wave: 7, z: 23, finish: 'glass', label: 'windscreen' });

panel(finish, 'side-glass',
  [[-84, -94], [-30, -104], [30, -98], [26, -38], [-40, -36], [-78, -40]],
  { wave: 7, z: 23, finish: 'glass' });

panel(finish, 'quarter-glass',
  [[36, -96], [86, -84], [112, -68], [106, -40], [40, -38]],
  { wave: 7, z: 23, finish: 'glass', small: true });

/* round headlights, standing high and proud on the wing crowns */
finish({ id: 'headlight', shape: 'disc', r: 16,
  to: { x: -356, y: -2, rot: 0 }, wave: 7, z: 20, finish: 'glass', label: 'headlight' });
finish({ id: 'headlight-ring', shape: 'ring', r: 18, r2: 15,
  to: { x: -356, y: -2, rot: 0 }, wave: 7, z: 21, finish: 'polished', small: true });

finish({ id: 'tail-light', shape: 'disc', r: 7,
  to: { x: 388, y: 26, rot: 0 }, wave: 7, z: 22, finish: 'glass', small: true });

/* the little round door mirror on its stalk */
finish({ id: 'mirror', shape: 'disc', r: 8,
  to: { x: -134, y: -52, rot: 0 }, wave: 7, z: 26, finish: 'polished', small: true });
finish({ id: 'mirror-stem', shape: 'bar', w: 16, h: 4,
  to: { x: -128, y: -42, rot: -0.9 }, wave: 7, z: 25, finish: 'polished', small: true });

finish({ id: 'door-handle', shape: 'bar', w: 26, h: 7,
  to: { x: -18, y: -12, rot: 0 }, wave: 7, z: 21, finish: 'polished', small: true });

finish({ id: 'badge', shape: 'disc', r: 7,
  to: { x: -406, y: 22, rot: 0 }, wave: 7, z: 21, finish: 'polished', small: true });

/* seats, read through the side glass — the near one, and the one behind it */
const SEAT = [[-24, -36], [-8, -40], [6, -34], [10, 0], [16, 26], [24, 34],
              [-6, 36], [-22, 30], [-26, 0]];
finish({ id: 'seat-near', shape: 'poly', points: SEAT, w: 50, h: 76,
  to: { x: -14, y: -56, rot: 0 }, wave: 7, z: 19, finish: 'dark', label: 'seats' });
finish({ id: 'seat-far', shape: 'poly', points: SEAT, w: 50, h: 76,
  to: { x: 14, y: -52, rot: 0 }, wave: 7, z: 18, finish: 'dark', small: true });

/* the big thin-rimmed wheel a 356 actually has */
finish({ id: 'steering-wheel', shape: 'ring', r: 22, r2: 19,
  to: { x: -76, y: -52, rot: 0 }, wave: 7, z: 19, finish: 'dark', small: true });

finish({ id: 'dash', shape: 'poly',
  points: [[-36, -8], [22, -11], [36, -4], [34, 9], [-18, 11], [-36, 6]], w: 72, h: 22,
  to: { x: -96, y: -34, rot: 0 }, wave: 7, z: 19, finish: 'dark', small: true });

finish({ id: 'wiper', shape: 'hand', w: 20, h: 4,
  to: { x: -118, y: -46, rot: -0.55 }, wave: 7, z: 24, finish: 'dark', small: true });

/* twin tailpipes, small and low under the rear valance */
for (let i = 0; i < 2; i++) {
  finish({ id: `exhaust-tip-${i}`, shape: 'disc', r: 8, hole: 5,
    to: { x: 372 + i * 22, y: 92, rot: 0 },
    wave: 7, z: 22, finish: 'polished', small: true });
}

/* the fuel filler sits on the cowl, ahead of the screen */
finish({ id: 'fuel-cap', shape: 'disc', r: 9,
  to: { x: -170, y: -34, rot: 0 }, wave: 7, z: 21, finish: 'brushed', small: true });

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
  /* the finished elevation, ghosted on the sheet the way a general-arrangement
     drawing sits behind a parts plate — with the wheelbase dimensioned. It fades
     as the parts leave the paper. Board units, centred on the assembled car. */
  underlay(c, ink) {
    c.strokeStyle = ink; c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = 1.2; c.globalAlpha *= 0.9;
    /* the one continuous 356 line: nose, screen, peak, fastback, tail */
    c.beginPath();
    c.moveTo(-414, 44);
    c.quadraticCurveTo(-420, 8, -366, -12);
    c.quadraticCurveTo(-300, -30, -190, -40);
    c.quadraticCurveTo(-160, -44, -138, -38);
    c.lineTo(-92, -98);
    c.quadraticCurveTo(-40, -118, 20, -114);
    c.quadraticCurveTo(90, -102, 176, -60);
    c.quadraticCurveTo(300, -6, 392, 46);
    c.quadraticCurveTo(410, 58, 402, 76);
    c.stroke();
    /* wheels and their centres */
    [[-258, 78, 60], [238, 78, 60]].forEach(([x, y, r]) => {
      c.lineWidth = 0.9;
      c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke();
      c.beginPath(); c.arc(x, y, r * 0.63, 0, 6.2832); c.stroke();
      c.lineWidth = 0.55;
      c.beginPath();
      c.moveTo(x - r - 8, y); c.lineTo(x + r + 8, y);
      c.moveTo(x, y - r - 8); c.lineTo(x, y + r + 8);
      c.stroke();
    });
    /* ground line and the wheelbase dimension */
    c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-430, 140); c.lineTo(430, 140); c.stroke();
    c.lineWidth = 0.65;
    c.beginPath();
    c.moveTo(-258, 150); c.lineTo(238, 150);
    c.moveTo(-258, 144); c.lineTo(-258, 156);
    c.moveTo(238, 144); c.lineTo(238, 156);
    c.stroke();
  },
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['floorpan, subframes and roll hoop',
     'the structure everything else bolts to, and the parts that have to hold if the day goes badly'],
    ['flat-four block, crank, pistons and gearbox',
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
