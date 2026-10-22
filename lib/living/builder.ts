/**
 * assembl / living — the builder: assembl my pod, my space, my ride, my day
 * -------------------------------------------------------------------------
 * Pick and mix. The customer drops parts into a product and sees it whole: the print files placed by the same
 * matrices the renders use (lib/living/builder.json and assemblies.json, both written by
 * tools/living-cad/cad/assemblies.py), the parts list, the cost, a price and a timeline (lib/living/costing.ts).
 * Everything here is pure: state in, parts and a view out, so the page, the tests and a store can share it.
 * Nothing is sold from the builder; a build is a configuration, not an order.
 */

import raw from './builder.json';
import { assemblyViews, hasAssembly, type PlacedPart, type ResolvedView } from './assembly';
import { CAD_MANIFEST, printFile } from './catalogue';
import { estimate, type Estimate, type PartLine } from './costing';
import { widgetSpec } from './widget';

export type Mode = 'pod' | 'space' | 'ride' | 'day';
export const MODES: { id: Mode; title: string; line: string }[] = [
  { id: 'pod', title: 'my pod', line: 'a size, a lid, an insert, a mount, a charm' },
  { id: 'space', title: 'my space', line: 'boards on the wall, then shelves, cups, bins, hooks, pods' },
  { id: 'ride', title: 'my ride', line: 'drop kit on the bar, stem, frame and post of any bike' },
  { id: 'day', title: 'my day', line: 'fish, beach, school or ride: pack the day' },
];

type Builder = {
  pitch: number;
  key_matrix: number[];
  boards: Record<string, { cols: number; rows: number; matrix: number[] }>;
  pieces: { id: string; name: string; group: string; handle: string | null; parts: { id: string; matrix: number[]; role: 'body' | 'accent' }[]; keys: number[][]; bbox: number[] }[];
  mounts: Record<string, number[]>;
};
const B = raw as Builder;
export const PITCH = B.pitch;
const IDS = new Set(CAD_MANIFEST.parts.map((p) => p.id));
const has = (id: string) => IDS.has(id);
const path = (id: string) => printFile(id).file?.path ?? null;

// ---------- 4 × 4, column-major, as three.js reads them ----------
type M4 = number[];
function mul(a: M4, b: M4): M4 {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
const T = (x: number, y: number, z: number): M4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

function placedPart(id: string, matrix: M4, role: PlacedPart['role'], explode: number[] = [0, 0, 0]): PlacedPart | null {
  const p = path(id);
  return p ? { partId: id, path: p, matrix, role, explode } : null;
}
const withInlay = (id: string) => [id, ...(has(`${id}-inlay`) ? [`${id}-inlay`] : [])];

// =====================================================================================================
// my pod
// =====================================================================================================
export type PodSize = 'mini' | 'standard' | 'tall' | 'long' | 'wide';
export const POD_SIZES: { id: PodSize; label: string; mm: string; art: string | null }[] = [
  { id: 'mini', label: 'mini', mm: '108 × 60', art: 'pod-mini-butter-name' },
  { id: 'standard', label: 'standard', mm: '144 × 72', art: 'pod-standard-sky-waves' },
  { id: 'tall', label: 'tall', mm: '144 × 72, deep', art: 'pods-cards' },
  { id: 'long', label: 'long', mm: '192 × 72', art: 'pods-pens' },
  { id: 'wide', label: 'wide', mm: '176 × 100', art: 'pocket-emergency-open' },
];
const podBase = (s: PodSize) => (s === 'wide' ? 'pk-pod-wide' : `dr2-pod-${s}`);
const lidPrefix = (s: PodSize) => (s === 'wide' ? 'pk-lid-wide-' : `dr2-lid-${s}-`);
const insertPrefix = (s: PodSize) => (s === 'wide' ? 'pk-insert-wide-' : `dr2-insert-${s}-`);
const podHandle = (s: PodSize) => (s === 'wide' ? 'lab-emergency-pack' : `al-pod-${s}`);

const nice = (slug: string) => slug.replace(/-/g, ' ');
const optionsFor = (prefix: string) =>
  CAD_MANIFEST.parts.filter((p) => p.id.startsWith(prefix) && !/-(inlay|pattern|text)$/.test(p.id)).map((p) => ({ id: p.id, label: nice(p.id.slice(prefix.length)) }));

export const lidOptions = (s: PodSize) => optionsFor(lidPrefix(s));
export const insertOptions = (s: PodSize) => optionsFor(insertPrefix(s));

export const MOUNT_OPTIONS: { id: string; label: string; line: string; extras: PartLine[] }[] = [
  { id: 'dr2-mount-bar-saddle', label: 'bar saddle', line: '31.8 mm bars', extras: [] },
  { id: 'tk-universal-saddle', label: 'universal saddle', line: 'any tube 22–45 mm', extras: [{ id: 'tk-ladder-strap', qty: 2 }, { id: 'tk-strap-buckle', qty: 2 }] },
  { id: 'dr2-mount-frame-saddle', label: 'frame saddle', line: 'top tube', extras: [] },
  { id: 'dr2-mount-strap-clip', label: 'strap clip', line: 'bag straps', extras: [] },
  { id: 'dr2-mount-belt-clip', label: 'belt clip', line: 'belts to 40 mm', extras: [] },
  { id: 'dr2-mount-carabiner-loop', label: 'carabiner loop', line: 'clip it on', extras: [] },
  { id: 'dr2-mount-home-dock', label: 'home dock', line: 'by the door', extras: [] },
].filter((m) => has(m.id));

export const CHARM_OPTIONS = CAD_MANIFEST.parts
  .filter((p) => /^(dr2-charm-|pk-charm-|pk-id-charm-)/.test(p.id) && !p.id.endsWith('-inlay'))
  .map((p) => ({ id: p.id, label: p.id.startsWith('pk-id-charm-') ? `id code, ${nice(p.id.slice(12))}` : nice(p.id.replace(/^(dr2|pk)-charm-/, '')) }));

export type PodState = { size: PodSize; lid: string; insert: string | null; mount: string | null; charm: string | null };

export function defaultPod(size: PodSize = 'standard'): PodState {
  const lids = lidOptions(size);
  return { size, lid: lids.find((l) => l.id.endsWith('-plain'))?.id ?? lids[0].id, insert: insertOptions(size)[0]?.id ?? null, mount: null, charm: null };
}

/** A size change keeps the lid style and insert where the new size has them. */
export function resizePod(s: PodState, size: PodSize): PodState {
  const style = s.lid.slice(lidPrefix(s.size).length);
  const lid = lidOptions(size).find((l) => l.id === lidPrefix(size) + style)?.id ?? defaultPod(size).lid;
  const ins = s.insert ? s.insert.slice(insertPrefix(s.size).length) : null;
  const insert = insertOptions(size).find((o) => o.id === insertPrefix(size) + ins)?.id ?? defaultPod(size).insert;
  return { ...s, size, lid, insert };
}

export function podParts(s: PodState): PartLine[] {
  const lines: PartLine[] = [{ id: podBase(s.size), qty: 1 }, ...withInlay(s.lid).map((id) => ({ id, qty: 1 })), { id: 'grid-turn-key', qty: 2 }];
  if (s.insert) lines.push({ id: s.insert, qty: 1 });
  const mount = MOUNT_OPTIONS.find((m) => m.id === s.mount);
  if (mount) lines.push({ id: mount.id, qty: 1 }, ...mount.extras);
  if (s.charm) lines.push(...withInlay(s.charm).map((id) => ({ id, qty: 1 })));
  return lines;
}

export const podNeedsName = (s: PodState) => /-name$/.test(s.lid);

export function podView(s: PodState): ResolvedView | null {
  const ids = [...withInlay(s.lid), ...(s.insert ? [s.insert] : [])];
  const v = assemblyViews(podHandle(s.size), ids)[0];
  if (!v) return null;
  const parts = [...v.parts];
  if (s.mount && B.mounts[s.mount]) {
    const m = placedPart(s.mount, B.mounts[s.mount], 'accent', [0, 0, -50]);
    if (m) parts.push(m);
  }
  return { ...v, name: 'your pod', parts, reach: v.reach * (s.mount ? 1.25 : 1) };
}

// =====================================================================================================
// my space: boards side by side, pieces keyed to cells
// =====================================================================================================
export type BoardKind = '4x4' | '2x4';
export type Placement = { uid: string; piece: string; i: number; j: number };
export type SpaceState = { boards: BoardKind[]; placed: Placement[] };
export const SPACE_PIECES = B.pieces;
export const MAX_BOARDS = 3;
export const ROWS = 4;

export const wallCols = (boards: BoardKind[]) => boards.reduce((n, b) => n + B.boards[`grid-board-${b}`].cols, 0);
export const defaultSpace = (): SpaceState => ({ boards: ['4x4', '4x4'], placed: [] });

/** Where a piece's origin lands when its first key sits on cell (i, j). */
function origin(piece: Builder['pieces'][number], i: number, j: number): [number, number] {
  const [kx, ky] = piece.keys[0];
  return [(i + 0.5) * PITCH - kx, (j + 0.5) * PITCH - ky];
}

/** The cells a piece covers on the wall (its keys and its body), or null if a key misses the boards or it runs off the side. */
export function coveredCells(pieceId: string, i: number, j: number, cols: number): [number, number][] | null {
  const piece = B.pieces.find((p) => p.id === pieceId);
  if (!piece) return null;
  const [ox, oy] = origin(piece, i, j);
  const [x0, y0, x1, y1] = piece.bbox;
  const i0 = Math.floor((ox + x0 + 2) / PITCH), i1 = Math.floor((ox + x1 - 2) / PITCH);
  const j0 = Math.floor((oy + y0 + 2) / PITCH), j1 = Math.floor((oy + y1 - 2) / PITCH);
  if (i0 < 0 || i1 >= cols) return null;                                  // sideways it stays on the boards
  if (j0 < -1 || j1 > ROWS) return null;                                   // up and down it may hang over the edge by a cell, as on a real wall
  for (const [kx, ky] of piece.keys) {
    const ki = Math.floor((ox + kx) / PITCH), kj = Math.floor((oy + ky) / PITCH);
    if (ki < 0 || kj < 0 || ki >= cols || kj >= ROWS) return null;
  }
  const cells: [number, number][] = [];
  for (let a = i0; a <= i1; a++) for (let b = Math.max(0, j0); b <= Math.min(ROWS - 1, j1); b++) cells.push([a, b]);
  return cells;
}

/** Can `pieceId` go with its first key on (i, j)? Not off the wall, not over another piece (`ignore` is the one being moved). */
export function canPlace(s: SpaceState, pieceId: string, i: number, j: number, ignore?: string): boolean {
  const cols = wallCols(s.boards);
  const cells = coveredCells(pieceId, i, j, cols);
  if (!cells) return false;
  const taken = new Set<string>();
  for (const p of s.placed) {
    if (p.uid === ignore) continue;
    for (const [a, b] of coveredCells(p.piece, p.i, p.j, cols) ?? []) taken.add(`${a},${b}`);
  }
  return cells.every(([a, b]) => !taken.has(`${a},${b}`));
}

/** The first free spot for a piece, scanning from the top row down, left to right. */
export function firstFree(s: SpaceState, pieceId: string): [number, number] | null {
  const cols = wallCols(s.boards);
  for (let j = ROWS - 1; j >= 0; j--) for (let i = 0; i < cols; i++) if (canPlace(s, pieceId, i, j)) return [i, j];
  return null;
}

/** Drop the pieces that no longer fit (after a board is removed). */
export function prune(s: SpaceState): SpaceState {
  const kept: Placement[] = [];
  for (const p of s.placed) if (canPlace({ ...s, placed: kept }, p.piece, p.i, p.j)) kept.push(p);
  return { ...s, placed: kept };
}

export function pieceRect(pieceId: string, i: number, j: number): { x: number; y: number; w: number; h: number } | null {
  const piece = B.pieces.find((p) => p.id === pieceId);
  if (!piece) return null;
  const [ox, oy] = origin(piece, i, j);
  const [x0, y0, x1, y1] = piece.bbox;
  return { x: ox + x0, y: oy + y0, w: x1 - x0, h: y1 - y0 };
}

export function spaceParts(s: SpaceState): PartLine[] {
  const lines: PartLine[] = s.boards.map((b) => ({ id: `grid-board-${b}`, qty: 1 }));
  lines.push({ id: 'grid-anchor-washer', qty: s.boards.reduce((n, b) => n + (b === '4x4' ? 4 : 2), 0) });
  for (const pl of s.placed) {
    const piece = B.pieces.find((p) => p.id === pl.piece);
    if (!piece) continue;
    for (const part of piece.parts) lines.push({ id: part.id, qty: 1 });
    if (piece.id.startsWith('pod-')) lines.push({ id: `dr2-insert-${piece.id.slice(4)}-${piece.id === 'pod-mini' ? 'split' : 'everyday'}`, qty: 1 });
    lines.push({ id: 'grid-turn-key', qty: piece.keys.length });
  }
  return lines.filter((l) => has(l.id));
}

export function spaceView(s: SpaceState): ResolvedView {
  const parts: PlacedPart[] = [];
  let x = 0;
  for (const b of s.boards) {
    const board = B.boards[`grid-board-${b}`];
    const p = placedPart(`grid-board-${b}`, mul(T(x, 0, 0), board.matrix), 'accent');
    if (p) parts.push(p);
    x += board.cols * PITCH;
  }
  for (const pl of s.placed) {
    const piece = B.pieces.find((p) => p.id === pl.piece);
    if (!piece) continue;
    const [ox, oy] = origin(piece, pl.i, pl.j);
    for (const part of piece.parts) {
      const p = placedPart(part.id, mul(T(ox, oy, 0), part.matrix), part.role === 'accent' ? 'accent' : 'body', [0, 0, 60]);
      if (p) parts.push(p);
    }
    for (const [kx, ky] of piece.keys) {
      const k = placedPart('grid-turn-key', mul(T(ox + kx, oy + ky, 0), B.key_matrix), 'fixed', [0, 0, 90]);
      if (k) parts.push(k);
    }
  }
  return { name: 'your wall', reach: Math.max(x, ROWS * PITCH) * 1.05, parts, texts: [] };
}

// =====================================================================================================
// my ride: zones on any bike
// =====================================================================================================
export type Zone = 'bar' | 'stem' | 'top-tube' | 'seat-post' | 'down-tube';
export const ZONES: { id: Zone; label: string; tube: string }[] = [
  { id: 'bar', label: 'handlebar', tube: '22.2–35 mm' },
  { id: 'stem', label: 'stem', tube: '31.8–35 mm' },
  { id: 'top-tube', label: 'top tube', tube: '25–45 mm' },
  { id: 'down-tube', label: 'down tube', tube: '28–45 mm' },
  { id: 'seat-post', label: 'seat post', tube: '25.4–34.9 mm' },
];
export type RideKit = { id: string; label: string; zones: Zone[]; mount: string | null; pod: PodSize | null; lines: PartLine[]; art: string | null };
const strap = [{ id: 'tk-ladder-strap', qty: 2 }, { id: 'tk-strap-buckle', qty: 2 }];
export const RIDE_KITS: RideKit[] = ([
  { id: 'bar-pod-mini', label: 'mini pod on a bar saddle', zones: ['bar'], mount: 'dr2-mount-bar-saddle', pod: 'mini', lines: [], art: 'pod-mini-butter-name' },
  { id: 'any-pod-standard', label: 'standard pod, universal saddle', zones: ['bar', 'top-tube', 'down-tube', 'seat-post'], mount: 'tk-universal-saddle', pod: 'standard', lines: strap, art: 'tackle-universal' },
  { id: 'stem-pod-mini', label: 'mini pod, universal saddle', zones: ['stem', 'bar', 'seat-post'], mount: 'tk-universal-saddle', pod: 'mini', lines: strap, art: 'pods-mini-earbuds' },
  { id: 'top-pod-long', label: 'long pod on a frame saddle', zones: ['top-tube'], mount: 'dr2-mount-frame-saddle', pod: 'long', lines: [], art: 'pods-pens' },
  { id: 'grips', label: 'grips, a pair', zones: ['bar'], mount: null, pod: null, lines: [{ id: 'ride-grip-waves', qty: 2 }], art: 'ride-grips-lime' },
  { id: 'bottle', label: 'bottle cup', zones: ['down-tube', 'seat-post'], mount: 'tk-universal-saddle', pod: null, lines: [{ id: 'ride-bottle-cup', qty: 1 }, ...strap], art: 'ride-bottle-tangerine' },
  { id: 'phone', label: 'phone mount', zones: ['stem', 'bar'], mount: null, pod: null, lines: [{ id: 'ride-phone-plate', qty: 1 }, { id: 'ride-phone-slider', qty: 1 }], art: 'ride-phone-ink' },
  { id: 'watch', label: 'watch mount', zones: ['bar', 'stem'], mount: null, pod: null, lines: [{ id: 'ride-watch-46', qty: 1 }], art: 'ride-watch-sky' },
] as RideKit[]).filter((k) => [...k.lines.map((l) => l.id), ...(k.mount ? [k.mount] : [])].every(has));

export type RideState = { zones: Partial<Record<Zone, string>> };
export const defaultRide = (): RideState => ({ zones: {} });
export const fits = (kitId: string, zone: Zone) => Boolean(RIDE_KITS.find((k) => k.id === kitId)?.zones.includes(zone));

export function rideParts(s: RideState): PartLine[] {
  const lines: PartLine[] = [];
  for (const kitId of Object.values(s.zones)) {
    const k = RIDE_KITS.find((x) => x.id === kitId);
    if (!k) continue;
    if (k.mount) lines.push({ id: k.mount, qty: 1 });
    lines.push(...k.lines);
    if (k.pod) lines.push(...podParts(defaultPod(k.pod)).filter((l) => !l.id.startsWith('dr2-mount') && l.id !== 'tk-universal-saddle'));
  }
  return lines;
}

/** The 3D for one zone: the pod on its mount, or the mount alone. */
export function rideView(s: RideState, zone: Zone): ResolvedView | null {
  const k = RIDE_KITS.find((x) => x.id === s.zones[zone]);
  if (!k) return null;
  if (k.pod) return podView({ ...defaultPod(k.pod), mount: k.mount });
  const parts = k.lines.slice(0, 2).map((l, n) => placedPart(l.id, T(n * 70, 0, 0), n ? 'accent' : 'body', [0, 0, 40])).filter((p): p is PlacedPart => Boolean(p));
  return parts.length ? { name: k.label, reach: 180, parts, texts: [] } : null;
}

// =====================================================================================================
// my day: pick the day, pack the things
// =====================================================================================================
export type DayItem = { handle: string; label: string; art: string | null };
export const DAY_ITEMS: DayItem[] = ([
  { handle: 'al-pod-standard', label: 'standard pod', art: 'pod-standard-sky-waves' },
  { handle: 'al-pod-mini', label: 'mini pod', art: 'pod-mini-butter-name' },
  { handle: 'al-pod-long', label: 'long pod', art: 'pods-pens' },
  { handle: 'lab-emergency-pack', label: 'emergency pack', art: 'pocket-emergency-open' },
  { handle: 'lab-mini-emergency', label: 'mini emergency kit', art: 'pocket-mini-emergency' },
  { handle: 'lab-dayrally-rod', label: 'pack rod', art: 'rod-packed-lime' },
  { handle: 'lab-fish-ruler', label: 'fish ruler pod', art: 'ruler-fish-sky' },
  { handle: 'al-handline-winder', label: 'handline winder', art: null },
  { handle: 'lab-pack-case', label: 'soft-bait case', art: 'tackle-wall' },
  { handle: 'lab-lip-sleeve', label: 'lip sleeve', art: 'pocket-lip-sleeve' },
  { handle: 'lab-id-charm', label: 'id charm', art: 'pocket-id-charms' },
  { handle: 'al-bag-charm', label: 'bag charm', art: 'charm-star-tangerine' },
  { handle: 'al-strap-clip', label: 'strap clip', art: null },
  { handle: 'al-carabiner-loop', label: 'carabiner loop', art: null },
  { handle: 'lab-universal-saddle', label: 'universal saddle', art: 'tackle-universal' },
  { handle: 'lab-pen-g2', label: 'pen', art: 'pocket-stationery' },
  { handle: 'al-cable-winder', label: 'cable winders', art: null },
] as DayItem[]).filter((d) => widgetSpec(d.handle));

export type DayId = 'fish' | 'beach' | 'school' | 'ride' | 'out';
export const DAYS: { id: DayId; label: string; line: string; items: string[] }[] = ([
  { id: 'fish', label: 'fish day', line: 'wharf, rod, bait, a ruler for the catch', items: ['lab-dayrally-rod', 'lab-fish-ruler', 'lab-pack-case', 'al-handline-winder'] },
  { id: 'beach', label: 'beach day', line: 'sun balm, snacks, the keys, a charm', items: ['al-pod-standard', 'al-bag-charm', 'al-carabiner-loop'] },
  { id: 'school', label: 'school day', line: 'pens, the lip sleeve, a mini kit', items: ['al-pod-long', 'lab-lip-sleeve', 'lab-mini-emergency', 'lab-pen-g2'] },
  { id: 'ride', label: 'ride day', line: 'a pod on the bike and the id code', items: ['al-pod-standard', 'lab-universal-saddle', 'lab-id-charm'] },
  { id: 'out', label: 'out all day', line: 'the emergency pack and the strap clip', items: ['lab-emergency-pack', 'al-strap-clip', 'lab-id-charm'] },
] as { id: DayId; label: string; line: string; items: string[] }[]).map((d) => ({ ...d, items: d.items.filter((h) => DAY_ITEMS.some((x) => x.handle === h)) }));

export type DayState = { day: DayId; items: string[] };
export const defaultDay = (day: DayId = 'fish'): DayState => ({ day, items: [...(DAYS.find((d) => d.id === day)?.items ?? [])] });

export function dayParts(s: DayState): PartLine[] {
  return s.items.flatMap((h) => widgetSpec(h)?.partsFor({}) ?? []);
}

export function dayView(handle: string): ResolvedView | null {
  if (!hasAssembly(handle)) return null;
  const spec = widgetSpec(handle);
  return spec ? assemblyViews(handle, spec.partsFor({}).map((p) => p.id))[0] ?? null : null;
}

// =====================================================================================================
// totals, names, the saved build
// =====================================================================================================
export function partsFor(mode: Mode, state: { pod: PodState; space: SpaceState; ride: RideState; day: DayState }): PartLine[] {
  return mode === 'pod' ? podParts(state.pod) : mode === 'space' ? spaceParts(state.space) : mode === 'ride' ? rideParts(state.ride) : dayParts(state.day);
}

export function totals(lines: PartLine[]): Estimate {
  return estimate(lines);
}

export function partName(id: string): string {
  try {
    return printFile(id).name.replace(/\s*\(sample[^)]*\)/i, '');
  } catch {
    return id;
  }
}
