import { describe, expect, it } from 'vitest';
import {
  CHARM_OPTIONS, DAYS, DAY_ITEMS, MOUNT_OPTIONS, POD_SIZES, RIDE_KITS, SPACE_PIECES, canPlace, coveredCells, dayParts, defaultDay, defaultPod,
  defaultRide, defaultSpace, firstFree, insertOptions, lidOptions, podParts, podView, prune, resizePod, rideParts, rideView, spaceParts, spaceView, totals, wallCols,
} from './builder';
import { CAD_MANIFEST } from './catalogue';

const IDS = new Set(CAD_MANIFEST.parts.map((p) => p.id));

describe('builder · my pod', () => {
  it('has lids and inserts for every size', () => {
    for (const s of POD_SIZES) {
      expect(lidOptions(s.id).length).toBeGreaterThan(0);
      expect(insertOptions(s.id).length).toBeGreaterThan(0);
    }
  });

  it('assembles a pod with its mount and only real print files', () => {
    const s = { ...defaultPod('standard'), mount: 'tk-universal-saddle', charm: CHARM_OPTIONS[0].id };
    const lines = podParts(s);
    expect(lines.every((l) => IDS.has(l.id))).toBe(true);
    expect(lines.find((l) => l.id === 'tk-ladder-strap')?.qty).toBe(2);
    const v = podView(s)!;
    expect(v.parts.some((p) => p.partId === 'tk-universal-saddle')).toBe(true);
    expect(v.parts.some((p) => p.partId === 'dr2-pod-standard')).toBe(true);
  });

  it('keeps the lid style across a size change where it exists', () => {
    const s = { ...defaultPod('standard'), lid: 'dr2-lid-standard-name' };
    expect(resizePod(s, 'long').lid).toBe('dr2-lid-long-name');
    expect(resizePod({ ...s, lid: 'dr2-lid-standard-waves' }, 'mini').lid).toBe('dr2-lid-mini-plain');
  });

  it('never shows the sample name: a name lid becomes the plain file plus a text area', () => {
    const v = podView({ ...defaultPod('standard'), lid: 'dr2-lid-standard-name' })!;
    expect(v.parts.some((p) => p.partId.endsWith('-name'))).toBe(false);
    expect(v.texts.length).toBe(1);
  });

  it('offers mounts that exist', () => {
    expect(MOUNT_OPTIONS.length).toBeGreaterThan(4);
  });
});

describe('builder · my space', () => {
  it('places a piece with its keys on cell centres and refuses overlaps and edges', () => {
    let s = defaultSpace();
    expect(wallCols(s.boards)).toBe(8);
    expect(canPlace(s, 'grid-shelf-3', 0, 2)).toBe(true);
    s = { ...s, placed: [{ uid: 'a', piece: 'grid-shelf-3', i: 0, j: 2 }] };
    expect(canPlace(s, 'grid-shelf-2', 1, 2)).toBe(false);
    expect(canPlace(s, 'grid-shelf-3', 6, 2)).toBe(false);          // runs off the right edge
    expect(coveredCells('grid-hook', 0, -1, 8)).toBeNull();           // a key below the board
  });

  it('finds a free spot for every piece on an empty wall', () => {
    for (const p of SPACE_PIECES) expect(firstFree(defaultSpace(), p.id)).not.toBeNull();
  });

  it('drops what no longer fits when a board goes', () => {
    const s = { boards: ['4x4', '4x4'] as ('4x4' | '2x4')[], placed: [{ uid: 'a', piece: 'grid-shelf-2', i: 6, j: 2 }] };
    expect(prune({ ...s, boards: ['4x4'] }).placed).toHaveLength(0);
  });

  it('counts boards, washers, pieces and one key per keyway', () => {
    const s = { boards: ['4x4'] as ('4x4' | '2x4')[], placed: [{ uid: 'a', piece: 'grid-shelf-3', i: 0, j: 2 }] };
    const lines = spaceParts(s);
    expect(lines).toContainEqual({ id: 'grid-board-4x4', qty: 1 });
    expect(lines).toContainEqual({ id: 'grid-anchor-washer', qty: 4 });
    expect(lines).toContainEqual({ id: 'grid-turn-key', qty: 3 });
    const v = spaceView(s);
    expect(v.parts.filter((p) => p.partId === 'grid-turn-key')).toHaveLength(3);
  });
});

describe('builder · my ride and my day', () => {
  it('ride kits use real files and the pod view shows the mount', () => {
    for (const k of RIDE_KITS) {
      const s = { zones: { [k.zones[0]]: k.id } };
      expect(rideParts(s).every((l) => IDS.has(l.id))).toBe(true);
    }
    expect(rideView({ zones: { bar: 'any-pod-standard' } }, 'bar')?.parts.some((p) => p.partId === 'tk-universal-saddle')).toBe(true);
    expect(rideParts(defaultRide())).toHaveLength(0);
  });

  it('each day starts with things that exist, and costs something', () => {
    expect(DAY_ITEMS.length).toBeGreaterThan(8);
    for (const d of DAYS) {
      expect(d.items.length).toBeGreaterThan(0);
      const t = totals(dayParts(defaultDay(d.id)));
      expect(t.priceNzd).toBeGreaterThan(0);
      expect(t.unknown).toHaveLength(0);
    }
  });
});
