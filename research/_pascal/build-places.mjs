/**
 * build-places.mjs — author a real place per concept demo in Pascal, headlessly,
 * then flatten it to plain box specs the demos' own three.js already renders.
 *
 * Kate, 30 July 2026: "can we use the pascal function for the demos as well and
 * start building out tower woolworths and summerset and ryman with the pascal
 * wow and the others too".
 *
 * WHY THIS SHAPE
 * Every demo's hero object was a primitive: a knot, a filament, a faceted ball.
 * A primitive says nothing about a house claim or a supermarket shop. Pascal
 * gives us real architecture authored in code, validated against its own
 * schemas, and openable in its editor afterwards. We keep our renderer, so
 * nothing about the demos' lighting, materials or scroll behaviour changes.
 *
 * TWO OUTPUTS PER PLACE
 *   places/<slug>.pascal.json   Pascal's own scene graph. Open it in the editor
 *                               at localhost:3002 to edit the building by hand.
 *   places/<slug>.boxes.json    Flat box specs for the demos. Metres, y-up,
 *                               centred on the origin so the existing camera
 *                               framing needs no changes.
 *
 * RUNNING IT
 * Pascal's built dist uses extensionless relative imports, which node ESM
 * rejects, so this needs the resolve hook beside it:
 *
 *   node --import ./pascal-register.mjs build-places.mjs
 *
 * bun is not required. The @pascal-app/core and /nodes packages have to be built
 * first (`tsc --build` in each) because they ship no dist.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PASCAL = '/Users/kateharland/pascal-editor/packages/core/dist/index.js';
const core = await import(PASCAL);
const { WallNode, SlabNode, LevelNode } = core;

/* ── authoring helpers ─────────────────────────────────────────────────────
   Plan coordinates are [x, y] in metres, where y becomes the renderer's z.
   Walls are validated by Pascal on the way in, so a bad number fails here
   rather than showing up as a hole in a screenshot. */
function scene(name) {
  const nodes = [];
  const level = LevelNode.parse({ name: 'Ground', elevation: 0 });
  nodes.push(level);

  const api = {
    name,
    wall(start, end, height = 2.4, thickness = 0.19, meta = {}) {
      const n = WallNode.parse({ start, end, height, thickness });
      n.parentId = level.id;
      n.metadata = meta;
      nodes.push(n);
      return n;
    },
    /** A closed run of walls from a list of corners. */
    room(corners, height = 2.4, thickness = 0.19, meta = {}) {
      for (let i = 0; i < corners.length; i++) {
        api.wall(corners[i], corners[(i + 1) % corners.length], height, thickness, meta);
      }
    },
    slab(polygon, thickness = 0.12, elevation = 0, meta = {}) {
      const n = SlabNode.parse({ polygon, thickness, elevation });
      n.parentId = level.id;
      n.metadata = meta;
      nodes.push(n);
      return n;
    },
    /** A rectangle, given a corner and a size. Most of these places are rects. */
    rect(x, y, w, d) {
      return [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
    },
    /**
     * A whole small building: floor, walls, roof plate. At village scale four
     * 0.22 m walls scale down to hairlines and eight villas read as scattered
     * slivers rather than houses, so anything meant to read as a mass gets a
     * roof plate closing the top.
     */
    mass(x, y, w, d, h = 2.7, k = 'villa', meta = {}) {
      api.slab(api.rect(x, y, w, d), 0.1, 0.02, { k: 'floor', ...meta });
      api.room(api.rect(x, y, w, d), h, 0.26, { k, ...meta });
      api.slab(api.rect(x, y, w, d), 0.14, h, { k, ...meta });
    },
    nodes,
    levelId: level.id,
  };
  return api;
}

/* ── flatten to boxes ──────────────────────────────────────────────────────
   A wall becomes one box: its midpoint, its length, its height, its thickness,
   and a y-rotation. A slab becomes a flat box from its bounding rectangle,
   which is enough for a floor plate seen from above. Everything is recentred so
   the demos' existing camera framing keeps working. */
function toBoxes(api) {
  const boxes = [];
  for (const n of api.nodes) {
    if (n.type === 'wall') {
      const [x1, y1] = n.start, [x2, y2] = n.end;
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.01) continue;
      boxes.push({
        k: n.metadata?.k || 'wall',
        p: [(x1 + x2) / 2, n.height / 2, (y1 + y2) / 2],
        s: [len, n.height, n.thickness],
        ry: Math.atan2(y2 - y1, x2 - x1),
        ...(n.metadata?.lit ? { lit: 1 } : {}),
        ...(n.metadata?.label ? { label: n.metadata.label } : {}),
      });
    } else if (n.type === 'slab') {
      const xs = n.polygon.map((p) => p[0]), ys = n.polygon.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      const y0 = Math.min(...ys), y1 = Math.max(...ys);
      boxes.push({
        k: n.metadata?.k || 'slab',
        p: [(x0 + x1) / 2, n.elevation - n.thickness / 2, (y0 + y1) / 2],
        s: [x1 - x0, n.thickness, y1 - y0],
        ry: 0,
        ...(n.metadata?.lit ? { lit: 1 } : {}),
        ...(n.metadata?.label ? { label: n.metadata.label } : {}),
      });
    }
  }
  /* Recentre on the footprint and scale to a 5-unit span. The demo scenes are
     framed and lit for an object about the size of the torus knot they used to
     carry (radius ~2), so 9 put a wall through the headline. */
  const xs = boxes.flatMap((b) => [b.p[0] - b.s[0] / 2, b.p[0] + b.s[0] / 2]);
  const zs = boxes.flatMap((b) => [b.p[2] - b.s[2] / 2, b.p[2] + b.s[2] / 2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
  const k = span > 0 ? 4.2 / span : 1;
  for (const b of boxes) {
    b.p = [(b.p[0] - cx) * k, b.p[1] * k, (b.p[2] - cz) * k];
    b.s = [b.s[0] * k, b.s[1] * k, b.s[2] * k];
    b.p = b.p.map((v) => Math.round(v * 1000) / 1000);
    b.s = b.s.map((v) => Math.round(v * 1000) / 1000);
    b.ry = Math.round(b.ry * 10000) / 10000;
  }
  return boxes;
}

/* ══ THE PLACES ══════════════════════════════════════════════════════════ */
const PLACES = {};

/* TOWER — a house on the night of the claim, with the damaged room lit.
   A four-room plan at real domestic dimensions. The lounge carries lit:1, so
   the renderer picks it out in the brand colour: the room the claim is about. */
PLACES['tower'] = () => {
  const s = scene('A house, 2am');
  s.slab(s.rect(0, 0, 12.6, 9.4), 0.12, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 12.6, 9.4), 2.5, 0.24, { k: 'shell' });      // exterior
  s.wall([7.2, 0], [7.2, 5.6], 2.5, 0.12, { k: 'inner' });          // hall side
  s.wall([0, 5.6], [12.6, 5.6], 2.5, 0.12, { k: 'inner' });         // front/back split
  s.wall([3.6, 5.6], [3.6, 9.4], 2.5, 0.12, { k: 'inner' });        // bed 1 / bed 2
  s.wall([8.4, 5.6], [8.4, 9.4], 2.5, 0.12, { k: 'inner' });        // bed 3 / bath
  // the lounge: front-left, and the room the water came through
  s.slab(s.rect(0.2, 0.2, 6.8, 5.2), 0.04, 0.02, { k: 'lit', lit: true, label: 'the lounge' });
  return s;
};

/* WOOLWORTHS — a supermarket floor. Perimeter, six aisle gondolas, a chiller
   run down one wall, and the collect bay lit, because the collect bay is where
   the concept's draft basket actually lands. */
PLACES['woolworths'] = () => {
  const s = scene('A store floor');
  s.slab(s.rect(0, 0, 34, 22), 0.15, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 34, 22), 4.2, 0.3, { k: 'shell' });
  for (let i = 0; i < 6; i++) {                                     // aisles
    const x = 5 + i * 4.2;
    s.wall([x, 3], [x, 16], 1.7, 1.1, { k: 'aisle' });
  }
  s.wall([0.4, 19.6], [33.6, 19.6], 2.2, 0.9, { k: 'chiller' });    // chiller run
  s.wall([0.4, 1.2], [3.4, 1.2], 1.2, 0.7, { k: 'checkout' });      // checkouts
  s.wall([0.4, 2.4], [3.4, 2.4], 1.2, 0.7, { k: 'checkout' });
  s.slab(s.rect(29, 0.6, 4.6, 4.4), 0.05, 0.03, { k: 'lit', lit: true, label: 'collect' });
  return s;
};

/* SUMMERSET — a village from above. Eight villas around a green, a community
   centre, and the care wing. The point of the shape: care sits on the same
   site, which is the answer to the deepest family fear on that page. */
PLACES['summerset'] = () => {
  /* Four villas rather than eight, on a 30 x 22 m site rather than 46 x 34.
     The first version had a real village footprint, and at a 4.2-unit frame
     eight 2.9 m villas on 46 m of ground scaled down to pale slivers that
     disappeared into the lawn. Fewer and bigger reads as buildings, and the
     argument does not need eight of them: it needs the care wing to be visibly
     on the same ground. */
  const s = scene('A village');
  s.slab(s.rect(0, 0, 30, 22), 0.1, 0, { k: 'ground' });
  const villa = (x, y) => s.mass(x, y, 8.6, 6.8, 3.4, 'villa');
  villa(1.6, 1.4); villa(11.6, 1.4);
  villa(1.6, 14);  villa(11.6, 14);
  // the community centre, on the green, taller so it reads as the shared building
  s.mass(21.4, 7.6, 7.4, 7.4, 5.2, 'centre');
  // the care wing, on the same ground, lit because that IS the argument
  s.mass(1.6, 8, 12, 4.6, 4.4, 'care', { lit: true, label: 'care, same site' });
  return s;
};

/* RYMAN — one villa, at real dimensions, because the Ryman page is the
   family's side of the decision and the question there is whether her things
   fit. The living room is lit and the plan is measurable, which is the point:
   these are metres, not an impression of a house. */
PLACES['ryman'] = () => {
  const s = scene('One villa');
  s.slab(s.rect(0, 0, 11.2, 8.4), 0.12, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 11.2, 8.4), 2.55, 0.22, { k: 'shell' });
  s.wall([6.4, 0], [6.4, 8.4], 2.55, 0.11, { k: 'inner' });         // living | beds
  s.wall([6.4, 4.2], [11.2, 4.2], 2.55, 0.11, { k: 'inner' });      // bed | bath
  s.wall([0, 5.8], [6.4, 5.8], 2.55, 0.11, { k: 'inner' });         // living | kitchen
  s.slab(s.rect(0.2, 0.2, 6.0, 5.4), 0.04, 0.02, { k: 'lit', lit: true, label: '6.0 × 5.4 m' });
  return s;
};

/* NZ POST — a depot. Two dock walls, a sorting spine, and the outbound bay
   lit. Kate's sector spec asked for an isometric depot assembling itself. */
PLACES['nzpost'] = () => {
  const s = scene('A depot');
  s.slab(s.rect(0, 0, 44, 26), 0.18, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 44, 26), 8.5, 0.35, { k: 'shell' });
  for (let i = 0; i < 8; i++) s.wall([2 + i * 5, 0.4], [4.4 + i * 5, 0.4], 3.2, 0.5, { k: 'dock' });
  s.wall([2, 12], [42, 12], 1.6, 2.2, { k: 'spine' });
  s.wall([2, 17], [42, 17], 1.6, 2.2, { k: 'spine' });
  s.slab(s.rect(36, 20, 7, 5), 0.05, 0.03, { k: 'lit', lit: true, label: 'outbound' });
  return s;
};

/* GILTRAP — a showroom. A glass frontage, a service wall, and the delivery bay
   lit, which is the wait that page is about. */
PLACES['giltrap'] = () => {
  const s = scene('A showroom');
  s.slab(s.rect(0, 0, 30, 20), 0.15, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 30, 20), 6.2, 0.28, { k: 'shell' });
  s.wall([0.3, 0.3], [29.7, 0.3], 6.2, 0.08, { k: 'glass' });
  s.wall([20, 0.3], [20, 19.7], 4.2, 0.24, { k: 'inner' });
  for (let i = 0; i < 4; i++) s.slab(s.rect(2 + i * 4.4, 6, 3.4, 6.2), 0.03, 0.02, { k: 'plinth' });
  s.slab(s.rect(22, 14, 7, 5.4), 0.05, 0.03, { k: 'lit', lit: true, label: 'delivery bay' });
  return s;
};

/* AIR NZ — a gate. The pier, the gate lounge, the airbridge, and the
   connection gate lit, because the connection is the whole question. */
PLACES['airnz'] = () => {
  const s = scene('A gate');
  s.slab(s.rect(0, 0, 40, 16), 0.15, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 40, 16), 5.4, 0.3, { k: 'shell' });
  s.wall([0.4, 8], [39.6, 8], 1.2, 0.4, { k: 'inner' });
  for (let i = 0; i < 5; i++) s.slab(s.rect(2 + i * 7.6, 1.5, 6, 5), 0.03, 0.02, { k: 'plinth' });
  s.wall([32, 15.7], [38, 15.7], 3, 1.4, { k: 'bridge' });
  s.slab(s.rect(30, 9.5, 9, 5.6), 0.05, 0.03, { k: 'lit', lit: true, label: 'your connection' });
  return s;
};


/* RAY WHITE — a listing, the way a buyer walks it. A three-bedroom house with
   the deck lit, because the deck is what the photographs sell and what the
   floorplan never explains. Real domestic dimensions so the measurements the
   page quotes are the model's own. */
PLACES['raywhite'] = () => {
  const s = scene('A listing');
  s.slab(s.rect(0, 0, 22, 16), 0.1, 0, { k: 'ground' });          // the section
  s.slab(s.rect(3, 3.5, 13.4, 9.6), 0.12, 0.05, { k: 'floor' });  // the house pad
  s.room(s.rect(3, 3.5, 13.4, 9.6), 2.55, 0.24, { k: 'shell' });
  s.wall([10.2, 3.5], [10.2, 9.4], 2.55, 0.11, { k: 'inner' });    // living | beds
  s.wall([10.2, 9.4], [16.4, 9.4], 2.55, 0.11, { k: 'inner' });    // bed | bath
  s.wall([3, 9.4], [10.2, 9.4], 2.55, 0.11, { k: 'inner' });       // living | kitchen
  s.wall([13.4, 3.5], [13.4, 9.4], 2.55, 0.11, { k: 'inner' });    // bed 1 | bed 2
  // the deck, off the living room, lit
  s.slab(s.rect(3.4, 0.8, 9.2, 2.5), 0.1, 0.5, { k: 'lit', lit: true, label: 'the deck' });
  return s;
};

/* BAYLEYS — a commercial floor plate, since Bayleys is residential, commercial
   AND rural and the commercial side is where the appraisal question is hardest.
   A core, a lettable floor, and the vacant tenancy lit. */
PLACES['bayleys'] = () => {
  const s = scene('A floor plate');
  s.slab(s.rect(0, 0, 34, 24), 0.16, 0, { k: 'floor' });
  s.room(s.rect(0, 0, 34, 24), 3.6, 0.3, { k: 'shell' });
  s.mass(14.6, 9.4, 5.4, 5.4, 3.6, 'centre');                     // the core
  s.wall([9, 0.4], [9, 23.6], 3.6, 0.14, { k: 'inner' });
  s.wall([25, 0.4], [25, 23.6], 3.6, 0.14, { k: 'inner' });
  // the vacant tenancy, lit: the thing an appraisal has to price
  s.slab(s.rect(25.4, 0.8, 8.2, 22.4), 0.06, 0.04, { k: 'lit', lit: true, label: 'vacant tenancy' });
  return s;
};

/* ── run ──────────────────────────────────────────────────────────────────── */
mkdirSync(resolve(HERE, 'places'), { recursive: true });
let total = 0;
for (const [slug, make] of Object.entries(PLACES)) {
  const api = make();
  const boxes = toBoxes(api);
  const graph = {
    object: 'scene',
    name: api.name,
    nodes: Object.fromEntries(api.nodes.map((n) => [n.id, n])),
  };
  writeFileSync(resolve(HERE, 'places', `${slug}.pascal.json`), JSON.stringify(graph, null, 2));
  writeFileSync(resolve(HERE, 'places', `${slug}.boxes.json`), JSON.stringify(boxes));
  const walls = api.nodes.filter((n) => n.type === 'wall').length;
  const slabs = api.nodes.filter((n) => n.type === 'slab').length;
  const lit = boxes.filter((b) => b.lit).length;
  console.log(
    `  ✓ ${slug.padEnd(12)} ${String(walls).padStart(3)} walls  ${String(slabs).padStart(2)} slabs  ` +
    `→ ${String(boxes.length).padStart(3)} boxes, ${lit} lit   "${api.name}"`,
  );
  total++;
}
console.log(`\n${total} places authored in Pascal and flattened for the demos.`);
console.log('Pascal graphs open in the editor at localhost:3002 via Load Build.');
