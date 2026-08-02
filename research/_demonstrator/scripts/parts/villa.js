/* Single-storey retirement villa — the Summerset object.
 *
 * A villa is what an Occupation Right Agreement is actually about. Not a contract,
 * not a brochure: a floor, four walls, a roof, and a front door you open yourself.
 * Every part of one, knolled on paper, then assembled into a side elevation.
 *
 * Flat-lay positions are art-directed by hand: axis-aligned, even gutters, grouped
 * by family, nothing overlapping. The whole appeal of knolling is that a person
 * decided where everything goes — auto-flow it and it becomes a chart.
 *
 * Waves, inside out, in the order a house actually goes up:
 * 1 foundation · 2 framing · 3 fixings · 4 cladding · 5 openings · 6 roof · 7 finishing.
 *
 * Board is 1180 × 800, origin at centre. Spec: references/knolling-assembly.md
 */

const parts = [];
const add = p => (parts.push(p), p);

/* ── the elevation, in numbers ──────────────────────────────────
   Every `to` position is measured against this side elevation. The whole object
   is lifted by LIFT at the very end so it sits centred in the frame rather than
   sagging toward the ground line. */
const PLATE_Y = 12;                  /* top plate, wall runs −222 … 222 */
const FLOOR_Y = 148;                 /* bottom plate, floor level */
const GROUND_Y = 210;                /* the line the piles land on */
const EAVE_L = -268, EAVE_R = 268, EAVE_Y = 6;
const APEX_Y = -118;
/* Roof pitch as an ANGLE OF ROTATION, which is not the same thing as the angle
   between two points and is where this went wrong the first time. Screen y grows
   downward, so a plane running up to the right is a NEGATIVE rotation. The left
   plane therefore takes -PITCH and the right plane +PITCH; getting the two the
   wrong way round splays the roof into an X instead of a gable. */
const PITCH = Math.atan2(APEX_Y - EAVE_Y, 0 - EAVE_L);
const SLOPE = Math.hypot(EAVE_R, EAVE_Y - APEX_Y);       /* ≈ 295, eave to apex */
const LIFT = -45;

/* paint for the weatherboards — a villa is painted, not raw timber */
const PAINT = '#E9E3D9', TRIM = '#F3EEE7';

/* ── 1 · foundation ─────────────────────────────────────────────
   Piles, footings, bearers, floor. The bit nobody looks at and everybody asks
   about. */

/* ground line — three slabs, so no single part is half the board wide */
[-215, 0, 215].forEach((gx, i) => add({
  id: `ground-${i}`, shape: 'rect', w: 240, h: 8, rad: 1, seed: 11 + i,
  lay: { x: -450, y: 50 + i * 24 },
  to: { x: gx, y: GROUND_Y, rot: 0 },
  wave: 1, z: 0, finish: 'cast',
  label: i === 0 ? 'ground' : undefined,
}));

/* concrete piles and their footing pads */
for (let i = 0; i < 7; i++) {
  const px = -195 + i * 65;
  add({
    id: `pile-${i}`, shape: 'rect', w: 18, h: 34, rad: 2, seed: 20 + i,
    lay: { x: 445 + (i % 4) * 34, y: 60 + Math.floor(i / 4) * 44 },
    to: { x: px, y: 190, rot: 0 },
    wave: 1, z: 2, finish: 'cast',
    label: i === 0 ? 'piles' : undefined,
  });
  add({
    id: `footing-${i}`, shape: 'rect', w: 26, h: 8, rad: 1, seed: 30 + i,
    lay: { x: 300 + (i % 4) * 34, y: -85 + Math.floor(i / 4) * 22 },
    to: { x: px, y: 208, rot: 0 },
    wave: 1, z: 1, finish: 'cast', small: true,
  });
}

/* bearers — the timber the floor sits on */
[-150, 0, 150].forEach((bx, i) => add({
  id: `bearer-${i}`, shape: 'bar', w: 150, h: 10, seed: 40 + i,
  lay: { x: 180, y: -85 + i * 22 },
  to: { x: bx, y: 176, rot: 0 },
  wave: 1, z: 3, finish: 'timber',
  label: i === 0 ? 'floor bearers' : undefined,
}));

/* the floor itself, in two sheets */
[-113, 113].forEach((fx, i) => add({
  id: `floor-${i}`, shape: 'rect', w: 228, h: 15, rad: 1, seed: 50 + i,
  lay: { x: -200, y: 55 + i * 37 },
  to: { x: fx, y: 162, rot: 0 },
  wave: 1, z: 4, finish: 'timber',
  label: i === 0 ? 'floor' : undefined,
}));

/* ── 2 · framing ────────────────────────────────────────────────
   Studs, plates, truss. The shape of the house before it looks like one. */

[-114, 114].forEach((tx, i) => {
  add({
    id: `topplate-${i}`, shape: 'rect', w: 228, h: 11, rad: 1, seed: 60 + i,
    lay: { x: 50, y: 55 + i * 37 },
    to: { x: tx, y: PLATE_Y, rot: 0 },
    wave: 2, z: 6, finish: 'timber',
    label: i === 0 ? 'top plate' : undefined,
  });
  add({
    id: `botplate-${i}`, shape: 'rect', w: 228, h: 11, rad: 1, seed: 70 + i,
    lay: { x: 300, y: 55 + i * 37 },
    to: { x: tx, y: FLOOR_Y, rot: 0 },
    wave: 2, z: 5, finish: 'timber',
  });
});

for (let i = 0; i < 9; i++) {
  add({
    id: `stud-${i}`, shape: 'rect', w: 9, h: 132, rad: 1, seed: 80 + i,
    lay: { x: -560 + i * 22, y: -90 },
    to: { x: -200 + i * 50, y: 80, rot: 0 },
    wave: 2, z: 6, finish: 'timber',
    label: i === 0 ? 'wall studs' : undefined,
  });
}

/* truss — bottom chord, two rafters, king post, two web struts */
[-111, 111].forEach((cx, i) => add({
  id: `chord-${i}`, shape: 'rect', w: 222, h: 9, rad: 1, seed: 90 + i,
  lay: { x: -450, y: 185 + i * 30 },
  to: { x: cx, y: 2, rot: 0 },
  wave: 2, z: 7, finish: 'timber',
  label: i === 0 ? 'truss chord' : undefined,
}));

[-1, 1].forEach((s, i) => add({
  id: `rafter-${i}`, shape: 'bar', w: 290, h: 9, seed: 100 + i,
  lay: { x: 245, y: -140 + i * 25 },
  to: { x: s * 134, y: -56, rot: -s * PITCH },
  wave: 2, z: 7, finish: 'timber',
  label: i === 0 ? 'rafters' : undefined,
}));

add({ id: 'kingpost', shape: 'rect', w: 8, h: 114, rad: 1, seed: 110,
  lay: { x: -350, y: -90 }, to: { x: 0, y: -55, rot: 0 },
  wave: 2, z: 6, finish: 'timber' });

[-1, 1].forEach((s, i) => add({
  id: `strut-${i}`, shape: 'bar', w: 100, h: 7, seed: 112 + i,
  lay: { x: 460, y: -140 + i * 25 },
  to: { x: s * 72, y: -30, rot: s * 0.78 },
  wave: 2, z: 6, finish: 'timber', small: true,
}));

/* ── 3 · fixings ────────────────────────────────────────────────
   Bolts, brackets, nail plates. Small steel, all of it hidden once the cladding
   goes on, all of it the reason the house stays where it was put. */

for (let i = 0; i < 16; i++) {
  const onTop = i < 8, k = i % 8;
  add({
    id: `bolt-${i}`, shape: 'screw', r: 3.6, cross: k % 2 === 0,
    lay: { x: -280 + (i % 4) * 26, y: 180 + Math.floor(i / 4) * 20 },
    to: { x: -196 + k * 56, y: onTop ? PLATE_Y : FLOOR_Y, rot: k * 0.4 },
    wave: 3, z: 7, finish: 'brushed', small: true,
    label: i === 0 ? 'bolts' : undefined,
  });
}

for (let i = 0; i < 12; i++) {
  const s = i < 6 ? -1 : 1, k = i % 6;
  add({
    id: `nailplate-${i}`, shape: 'rect', w: 14, h: 9, rad: 1, grooves: 3, seed: 120 + i,
    lay: { x: -140 + (i % 4) * 32, y: 182 + Math.floor(i / 4) * 26 },
    to: { x: s * (230 - k * 40), y: -8 - k * 18.4, rot: -s * PITCH },
    wave: 3, z: 7, finish: 'brushed', small: true,
    label: i === 0 ? 'nail plates' : undefined,
  });
}

/* galvanised angle brackets — pile head to bearer */
const BRACKET = [[-9, -9], [-2, -9], [-2, 2], [9, 2], [9, 9], [-9, 9]];
for (let i = 0; i < 8; i++) {
  add({
    id: `bracket-${i}`, shape: 'poly', points: BRACKET, w: 18, h: 18, seed: 130 + i,
    lay: { x: 20 + (i % 4) * 34, y: 186 + Math.floor(i / 4) * 34 },
    to: { x: -175 + i * 50, y: 170, rot: i % 2 ? 0 : Math.PI / 2 },
    wave: 3, z: 7, finish: 'brushed', small: true,
    label: i === 0 ? 'brackets' : undefined,
  });
}

/* ── 4 · cladding ───────────────────────────────────────────────
   Twelve courses of weatherboard, each in two lengths, the way they are actually
   run and butt-joined. Plus the soffits and corner boards that finish the edges. */

const WB_COLS = [-455, -212, 31];
for (let j = 0; j < 24; j++) {
  const course = Math.floor(j / 2), side = j % 2;
  add({
    id: `board-${j}`, shape: 'rect', w: 226, h: 14, rad: 1, seed: 140 + j,
    lay: { x: WB_COLS[j % 3], y: -368 + Math.floor(j / 3) * 26 },
    to: { x: side ? 111 : -111, y: 20 + course * 11.5, rot: 0 },
    wave: 4, z: 10, finish: 'painted', colour: PAINT,
    label: j === 0 ? 'weatherboards' : undefined,
  });
}

[-1, 1].forEach((s, i) => add({
  id: `soffit-${i}`, shape: 'rect', w: 48, h: 9, rad: 1, seed: 170 + i,
  lay: { x: 545, y: -140 + i * 25 },
  to: { x: s * 245, y: PLATE_Y, rot: 0 },
  wave: 4, z: 11, finish: 'painted', colour: TRIM,
  label: i === 0 ? 'soffits' : undefined,
}));

[-1, 1].forEach((s, i) => add({
  id: `cornerboard-${i}`, shape: 'rect', w: 12, h: 142, rad: 1, seed: 172 + i,
  lay: { x: -315 + i * 25, y: -90 },
  to: { x: s * 217, y: 80, rot: 0 },
  wave: 4, z: 11, finish: 'painted', colour: TRIM,
}));

/* ── 5 · openings ───────────────────────────────────────────────
   Windows, joinery, and the front door. The door is the only colour on the
   board, because it is the one part the resident opens. */

const WIN_X = [-158, -72, 118];
WIN_X.forEach((wx, i) => {
  add({
    id: `window-${i}`, shape: 'rect', w: 64, h: 86, rad: 2, mullions: [2, 3],
    lay: { x: -130 + i * 78, y: -90 },
    to: { x: wx, y: 62, rot: 0 },
    wave: 5, z: 14, finish: 'glass',
    label: i === 0 ? 'windows' : undefined,
  });
  add({
    id: `sill-${i}`, shape: 'rect', w: 72, h: 7, rad: 1, seed: 180 + i,
    lay: { x: 490, y: -268 + i * 18 },
    to: { x: wx, y: 109, rot: 0 },
    wave: 5, z: 15, finish: 'painted', colour: TRIM, small: true,
    label: i === 0 ? 'sills' : undefined,
  });
  add({
    id: `head-${i}`, shape: 'rect', w: 72, h: 7, rad: 1, seed: 190 + i,
    lay: { x: 490, y: -210 + i * 18 },
    to: { x: wx, y: 15, rot: 0 },
    wave: 5, z: 15, finish: 'painted', colour: TRIM, small: true,
  });
});

add({ id: 'window-bath', shape: 'rect', w: 40, h: 44, rad: 2, mullions: [2, 2],
  lay: { x: 310, y: -252 }, to: { x: 186, y: 44, rot: 0 },
  wave: 5, z: 14, finish: 'glass' });

/* the one accent in the composition */
add({ id: 'front-door', shape: 'rect', w: 46, h: 106, rad: 2, grooves: 3, seed: 200,
  lay: { x: -210, y: -90 }, to: { x: 16, y: 95, rot: 0 },
  wave: 5, z: 15, finish: 'anodised', colour: '#E4002B', label: 'front door' });

add({ id: 'fanlight', shape: 'rect', w: 46, h: 16, rad: 1, mullions: [3, 1],
  lay: { x: 390, y: -262 }, to: { x: 16, y: 30, rot: 0 },
  wave: 5, z: 14, finish: 'glass', small: true });

add({ id: 'door-handle', shape: 'disc', r: 5,
  lay: { x: 490, y: -296 }, to: { x: 33, y: 100, rot: 0 },
  wave: 5, z: 16, finish: 'brushed', small: true });

add({ id: 'door-step', shape: 'rect', w: 56, h: 9, rad: 1, seed: 202,
  lay: { x: 230, y: -268 }, to: { x: 16, y: 154, rot: 0 },
  wave: 5, z: 13, finish: 'cast', small: true });

/* ── 6 · roof ───────────────────────────────────────────────────
   Six sheets of long-run per plane, laid up the pitch, then the ridge, the
   spouting and the chimney. */

const UX = Math.cos(PITCH), UY = Math.sin(PITCH);   /* unit vector up the left slope */
for (let i = 0; i < 12; i++) {
  const s = i < 6 ? -1 : 1, k = i % 6;
  const d = (k + 0.5) * (SLOPE / 6);                /* how far up the pitch this sheet lands */
  add({
    id: `roofsheet-${i}`, shape: 'rect', w: 52, h: 22, rad: 1, grooves: 5, seed: 210 + i,
    lay: { x: 220 + (i % 4) * 66, y: -368 + Math.floor(i / 4) * 36 },
    to: { x: s * (EAVE_R - d * UX), y: EAVE_Y + d * UY, rot: -s * PITCH },
    wave: 6, z: 18, finish: 'dark',
    label: i === 0 ? 'roofing' : undefined,
  });
}

add({ id: 'ridge', shape: 'rect', w: 44, h: 12, rad: 2, seed: 230,
  lay: { x: 545, y: -345 }, to: { x: 0, y: -124, rot: 0 },
  wave: 6, z: 19, finish: 'dark', label: 'ridge' });

[-1, 1].forEach((s, i) => add({
  id: `spouting-${i}`, shape: 'bar', w: 54, h: 11, seed: 232 + i,
  lay: { x: 545, y: -320 + i * 22 },
  to: { x: s * 243, y: 20, rot: 0 },
  wave: 6, z: 17, finish: 'brushed',
  label: i === 0 ? 'spouting' : undefined,
}));

add({ id: 'downpipe', shape: 'rect', w: 9, h: 134, rad: 4, seed: 234,
  lay: { x: -255, y: -90 }, to: { x: -228, y: 82, rot: 0 },
  wave: 6, z: 17, finish: 'brushed' });

add({ id: 'chimney', shape: 'rect', w: 30, h: 64, rad: 1, seed: 236,
  lay: { x: 490, y: -345 }, to: { x: -120, y: -94, rot: 0 },
  wave: 6, z: 20, finish: 'cast', label: 'chimney' });

add({ id: 'chimney-cap', shape: 'rect', w: 38, h: 10, rad: 1, seed: 238,
  lay: { x: 545, y: -370 }, to: { x: -120, y: -131, rot: 0 },
  wave: 6, z: 21, finish: 'cast', small: true });

/* ── 7 · finishing ──────────────────────────────────────────────
   Deck, handrail, path, planter, letterbox. None of it structural. All of it the
   difference between a building and somewhere a person lives. */

add({ id: 'deck', shape: 'rect', w: 112, h: 12, rad: 1, seed: 240,
  lay: { x: 230, y: 185 }, to: { x: 278, y: 152, rot: 0 },
  wave: 7, z: 9, finish: 'timber', label: 'deck' });

add({ id: 'deck-joist', shape: 'rect', w: 112, h: 8, rad: 1, seed: 242,
  lay: { x: 230, y: 207 }, to: { x: 278, y: 166, rot: 0 },
  wave: 7, z: 8, finish: 'timber' });

[232, 278, 324].forEach((dx, i) => add({
  id: `deckpile-${i}`, shape: 'rect', w: 12, h: 36, rad: 1, seed: 244 + i,
  lay: { x: 330 + i * 30, y: 200 },
  to: { x: dx, y: 188, rot: 0 },
  wave: 7, z: 7, finish: 'cast', small: true,
}));

[232, 278, 324].forEach((rx, i) => add({
  id: `railpost-${i}`, shape: 'rect', w: 9, h: 54, rad: 1, seed: 248 + i,
  lay: { x: 440 + i * 24, y: 205 },
  to: { x: rx, y: 120, rot: 0 },
  wave: 7, z: 9, finish: 'timber',
}));

add({ id: 'handrail', shape: 'bar', w: 116, h: 9, seed: 252,
  lay: { x: 230, y: 229 }, to: { x: 278, y: 92, rot: 0 },
  wave: 7, z: 10, finish: 'timber', label: 'handrail' });

for (let i = 0; i < 6; i++) {
  add({
    id: `baluster-${i}`, shape: 'rect', w: 5, h: 44, rad: 1, seed: 254 + i,
    lay: { x: -280 + i * 18, y: 300 },
    to: { x: 243 + i * 14, y: 124, rot: 0 },
    wave: 7, z: 9, finish: 'timber', small: true,
  });
}

add({ id: 'letterbox-post', shape: 'rect', w: 8, h: 54, rad: 1, seed: 260,
  lay: { x: 530, y: 205 }, to: { x: -306, y: 178, rot: 0 },
  wave: 7, z: 9, finish: 'timber' });

add({ id: 'letterbox', shape: 'rect', w: 34, h: 22, rad: 2, seed: 262,
  lay: { x: 530, y: -75 }, to: { x: -306, y: 140, rot: 0 },
  wave: 7, z: 10, finish: 'brushed', label: 'letterbox' });

add({ id: 'planter', shape: 'trap', w: 56, topW: 42, h: 30, seed: 264,
  lay: { x: 460, y: -75 }, to: { x: -250, y: 194, rot: 0 },
  wave: 7, z: 9, finish: 'cast', label: 'planter' });

add({ id: 'path', shape: 'rect', w: 200, h: 9, rad: 1, seed: 266,
  lay: { x: -450, y: 290 }, to: { x: -180, y: 222, rot: 0 },
  wave: 7, z: 1, finish: 'cast', label: 'path' });

add({ id: 'number-plate', shape: 'rect', w: 14, h: 22, rad: 1, seed: 268,
  lay: { x: 562, y: 205 }, to: { x: -16, y: 62, rot: 0 },
  wave: 7, z: 16, finish: 'brass', small: true });

/* ── two housekeeping passes ────────────────────────────────────
   The elevation above is measured off the ground line, which leaves the finished
   house sitting low in the frame; LIFT raises it so the push-in centres on the
   building rather than the lawn. The flat lay is art-directed relative to itself,
   so it is slid as one piece until its margins match. Neither pass moves any part
   relative to another. */
parts.forEach(p => { p.to.y += LIFT; });

(() => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  parts.forEach(p => {
    const w = p.w ?? (p.r ?? 5) * 2, h = p.h ?? (p.r ?? 5) * 2;
    x0 = Math.min(x0, p.lay.x - w / 2); x1 = Math.max(x1, p.lay.x + w / 2);
    y0 = Math.min(y0, p.lay.y - h / 2); y1 = Math.max(y1, p.lay.y + h / 2);
  });
  const dx = -(x0 + x1) / 2, dy = -(y0 + y1) / 2;
  parts.forEach(p => { p.lay.x += dx; p.lay.y += dy; });
})();

export const villa = {
  name: 'single-storey retirement villa',
  board: { w: 1180, h: 800 },
  zoom: 1.55,
  parts,
  /* the text equivalent — the canvas is aria-hidden, so this carries the meaning */
  families: [
    ['piles, footings, bearers and floor', 'what the house stands on — the part a buyer never sees and always asks about'],
    ['studs, plates, rafters and the truss', 'the frame: the shape of the house before it looks like one'],
    ['bolts, brackets and nail plates', 'the small steel at every joint, hidden the moment the cladding goes on'],
    ['weatherboards, soffits and corner boards', 'the skin that keeps the weather out and the warmth in'],
    ['windows, sills and the front door', 'the openings — and the door is the one the resident opens themselves'],
    ['roofing, ridge, spouting and chimney', 'the lid, and where the rain goes when it comes off it'],
    ['deck, handrail, path, planter and letterbox', 'the parts that turn a building into somewhere someone lives'],
  ],
};
