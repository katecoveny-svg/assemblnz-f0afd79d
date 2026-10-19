import { describe, expect, it } from 'vitest';
import {
  AESTHETICS,
  CAD_MANIFEST,
  DAYRALLY_KITS,
  DAYRALLY_PRODUCTS,
  KITS,
  PRODUCTS,
  SPACES,
  SPACE_ENTRIES,
  SavedConfigurationSchema,
  TEST_KIT,
  applyKit,
  billOfMaterials,
  canPlace,
  checkChar,
  fitCheck,
  gridAccessories,
  kitById,
  newDesign,
  partCode,
  printFile,
  recommend,
  requireProduct,
  savedConfiguration,
  spaceAssembledJourney,
  toShopifyCartLines,
  understand,
  validatePlacements,
} from './index';

describe('assembl / living · manifest', () => {
  it('every print file is watertight and fits the 250 mm cube; served files carry checksums', () => {
    expect(CAD_MANIFEST.parts.length).toBeGreaterThan(100);
    for (const p of CAD_MANIFEST.parts) {
      expect(p.watertight, p.id).toBe(true);
      expect(p.fits_250_cube, p.id).toBe(true);
      if (p.file) expect(p.file.sha256, p.id).toHaveLength(64);
    }
    for (const fam of ['grid', 'tile', 'stack', 'renter']) {
      for (const p of CAD_MANIFEST.parts.filter((x) => x.family === fam)) expect(p.file, p.id).not.toBeNull();
    }
    expect(CAD_MANIFEST.status).toContain('nothing printed yet');
  });

  it('every product resolves its print files and its SKUs carry a valid check letter', () => {
    for (const p of PRODUCTS) {
      for (const pp of p.parts) expect(() => printFile(pp.id), `${p.handle} → ${pp.id}`).not.toThrow();
      for (const s of p.skus) {
        const m = s.sku.match(/^AL-(.+)-([A-Z0-9])$/)!;
        expect(checkChar(m[1]), s.sku).toBe(m[2]);
      }
    }
    expect(partCode(requireProduct('al-hook'), 'oat')).toBe('AL-HK-OAT-8');
    expect(partCode(requireProduct('al-board-4x4'), 'chalk')).toBe('AL-B44-CHA-A');
    expect(partCode(requireProduct('al-tray-custom'), 'chalk')).toMatch(/^AL-TRY-CHA-[A-Z2-9]$/);
  });

  it('keeps the TURN interface: 42 mm pitch, 168 mm boards, keys included with accessories', () => {
    expect(CAD_MANIFEST.interface_spec.pitch_mm).toBe(42);
    expect(printFile('grid-board-4x4').dims_mm.x).toBe(168);
    expect(printFile('grid-board-2x4').dims_mm.x).toBe(84);
    for (const p of gridAccessories()) expect(p.parts.some((pp) => pp.id === 'grid-turn-key'), p.handle).toBe(true);
    expect(requireProduct('al-board-4x4').parts.find((pp) => pp.id === 'grid-anchor-washer')?.qty).toBe(4);
  });

  it('carries the test-print kit and the dayrally collection', () => {
    expect(TEST_KIT.files).toHaveLength(8);
    expect(TEST_KIT.total_g).toBeGreaterThan(150);
    expect(DAYRALLY_PRODUCTS.length).toBeGreaterThan(15);
    expect(DAYRALLY_KITS.length).toBe(10);
    expect(CAD_MANIFEST.fit_tests.grid.hook_vs_board_overlap_mm3).toBe(0);
    expect(CAD_MANIFEST.fit_tests.grid.open_pull_0p5mm_overlap_board_mm3).toBe(0);
    expect(Number(CAD_MANIFEST.fit_tests.grid.locked_pull_0p5mm_overlap_board_mm3)).toBeGreaterThan(0);
  });
});

describe('assembl / living · kits and spaces', () => {
  it('every wall kit is laid out legally and its contents match the launch catalogue', () => {
    expect(KITS).toHaveLength(7);
    for (const kit of KITS) {
      const design = applyKit(newDesign({ space: kit.space, surface: 'wall', aesthetic: kit.aesthetic }), kit);
      expect(validatePlacements(design), kit.id).toEqual([]);
      const bom = billOfMaterials(design);
      const manifestKit = CAD_MANIFEST.kits.find((k) => k.handle === kit.handle)!;
      const counted = Object.fromEntries(bom.lines.map((l) => [l.handle, l.qty]));
      const expected = Object.fromEntries(manifestKit.lines.map((l) => [l.handle, l.qty]));
      expect(counted, kit.id).toEqual(expected);
      expect(bom.priceNzd, kit.id).toBe(kit.priceNzd);
    }
  });

  it('every space door points at kits that exist', () => {
    expect(SPACE_ENTRIES.map((s) => s.id)).toEqual([...SPACES]);
    for (const entry of SPACE_ENTRIES) for (const kitId of entry.kits) expect(kitById(kitId), `${entry.id} → ${kitId}`).toBeDefined();
  });
});

describe('assembl / living · design rules', () => {
  it('rejects out-of-bounds and overlapping placements on the 42 mm grid', () => {
    const design = newDesign({ space: 'my-room', surface: 'wall', aesthetic: 'calm' });
    design.placements = [
      { id: 'a', handle: 'al-shelf-3', col: 2, row: 0 }, // 3 wide at col 2 on a 4-wide board
      { id: 'b', handle: 'al-hook', col: 0, row: 0 },
      { id: 'c', handle: 'al-hook', col: 0, row: 1 }, // hooks are 2 tall → overlaps b
      { id: 'd', handle: 'al-tray-custom', col: 0, row: 2 }, // not grid-mounted
    ];
    const issues = validatePlacements(design);
    expect(issues).toContainEqual({ kind: 'out_of_bounds', placementId: 'a' });
    expect(issues).toContainEqual({ kind: 'overlap', placementId: 'c', withPlacementId: 'b' });
    expect(issues).toContainEqual({ kind: 'not_grid_mounted', handle: 'al-tray-custom' });
    expect(canPlace({ field: design.field, placements: [] }, { id: 'x', handle: 'al-cup', col: 3, row: 1 })).toBe(true);
    expect(canPlace({ field: design.field, placements: [] }, { id: 'x', handle: 'al-cup', col: 3, row: 2 })).toBe(false);
    // a half board widens the grid by two cells
    expect(canPlace({ field: { columns: [4, 2], rows: 1 }, placements: [] }, { id: 'x', handle: 'al-shelf-2', col: 4, row: 0 })).toBe(true);
  });

  it('bills boards from the field, pairs from placements, and prices as proposed pre-quote', () => {
    const design = newDesign({ space: 'work-and-create', surface: 'wall', aesthetic: 'calm' });
    design.field = { columns: [4, 2], rows: 2 };
    design.placements = [
      { id: 'a', handle: 'al-rod-cradle', col: 0, row: 0 },
      { id: 'b', handle: 'al-rod-cradle', col: 3, row: 0 },
      { id: 'c', handle: 'al-rod-cradle', col: 5, row: 0 },
    ];
    design.extras = [{ handle: 'al-tray-custom', qty: 1 }, { handle: 'al-keys-6', qty: 1 }];
    const bom = billOfMaterials(design);
    const q = Object.fromEntries(bom.lines.map((l) => [l.handle, l.qty]));
    expect(q).toEqual({ 'al-board-4x4': 2, 'al-board-2x4': 2, 'al-rod-cradle': 2, 'al-tray-custom': 1, 'al-keys-6': 1 });
    expect(bom.quotedLines).toBe(1);
    expect(bom.priceNzd).toBe(39 * 2 + 24 * 2 + 19 * 2 + 6);
    expect(bom.lines.find((l) => l.handle === 'al-board-4x4')?.sku).toBe('AL-B44-CHA-A');
    expect(bom.lines.find((l) => l.handle === 'al-rod-cradle')?.sku).toBe(requireProduct('al-rod-cradle').skus.find((s) => s.colour === 'Ash')?.sku);
    expect(bom.basis).toContain('pre-quote');
  });

  it('never passes a wall layout without confirmed measurements, and checks the door for hangers', () => {
    const design = applyKit(newDesign({ space: 'work-and-create', surface: 'wall', aesthetic: 'calm' }), kitById('gear-wall')!);
    expect(fitCheck(design).status).toBe('unconfirmed');
    expect(fitCheck(design).requiredWidthMm).toBe(336);
    expect(fitCheck(design).requiredHeightMm).toBe(168);
    design.measurements = { method: 'tape-measure', widthMm: 300, heightMm: 300, confirmed: true };
    expect(fitCheck(design).status).toBe('too_wide');
    design.measurements = { method: 'tape-measure', widthMm: 400, heightMm: 100, confirmed: true };
    expect(fitCheck(design).status).toBe('too_tall');
    design.measurements = { method: 'a4-reference', widthMm: 400, heightMm: 300, confirmed: true };
    expect(fitCheck(design).status).toBe('fits');
    expect(fitCheck(design).notes.join(' ')).toContain('anchor washers');

    const door = applyKit(newDesign({ space: 'store-and-organise', surface: 'door', aesthetic: 'calm' }), kitById('no-drill-door-wall')!);
    door.measurements = { method: 'tape-measure', widthMm: 700, heightMm: 2000, confirmed: true };
    expect(fitCheck(door).status).toBe('unconfirmed');
    door.measurements = { ...door.measurements, doorMm: 40, doorGapOk: true };
    expect(fitCheck(door).status).toBe('door_too_thick');
    door.measurements = { ...door.measurements, doorMm: 35, doorGapOk: false };
    expect(fitCheck(door).status).toBe('door_no_gap');
    door.measurements = { ...door.measurements, doorMm: 35, doorGapOk: true, method: 'door-gap-gauge' };
    expect(fitCheck(door).status).toBe('fits');
  });

  it('a design with nothing on a board fits without measurements', () => {
    const design = newDesign({ space: 'my-space', surface: 'drawer', aesthetic: 'warm' });
    design.extras = [{ handle: 'al-tray-cutout', qty: 1 }];
    expect(fitCheck(design).status).toBe('fits');
    expect(billOfMaterials(design).lines.some((l) => l.handle.startsWith('al-board'))).toBe(false);
  });
});

describe('assembl / living · recommendations', () => {
  it('is deterministic and every proposal is buildable', () => {
    const input = { space: 'my-room' as const, surface: 'wall' as const, need: 'My desk is covered in cables and my headphones have nowhere to go', keep: ['a small speaker'], aesthetic: 'contrast' as const, now: '2026-10-19T00:00:00.000Z' };
    const a = recommend(input);
    const b = recommend(input);
    const shape = (ps: ReturnType<typeof recommend>) => ps.map((p) => ({ field: p.design.field, parts: p.design.placements.map((x) => [x.handle, x.col, x.row]), extras: p.design.extras }));
    expect(a.map((p) => p.id)).toEqual(['minimal', 'system', 'expressive']);
    expect(shape(a)).toEqual(shape(b));
    for (const p of a) {
      expect(validatePlacements(p.design), p.id).toEqual([]);
      expect(p.design.origin).toBe('proposal');
      expect(p.design.photo.analysis).toBe('not_available');
    }
    const u = understand(input);
    expect(u.needs[0]).toContain('Cables');
    expect(u.matchedProducts[0].handle).toBe('al-hook');
    expect(u.photoAnalysisAvailable).toBe(false);
  });

  it('keeps renters off the drill', () => {
    for (const p of recommend({ space: 'my-room', surface: 'wall', need: 'I am renting and cannot drill holes', keep: [], aesthetic: 'calm' })) {
      expect(p.design.extras.some((e) => e.handle === 'al-over-door'), p.id).toBe(true);
    }
    for (const p of recommend({ space: 'store-and-organise', surface: 'wardrobe', need: 'belts and scarves', keep: [], aesthetic: 'calm' })) {
      expect(p.design.extras.some((e) => e.handle === 'al-rail-hanger'), p.id).toBe(true);
    }
  });

  it('works for every space, surface and aesthetic combination', () => {
    for (const space of SPACES) {
      for (const surface of ['wall', 'door', 'wardrobe', 'desk', 'drawer', 'vanity'] as const) {
        for (const aesthetic of AESTHETICS) {
          const proposals = recommend({ space, surface, need: '', keep: [], aesthetic });
          expect(proposals).toHaveLength(3);
          for (const p of proposals) expect(validatePlacements(p.design), `${space}/${surface}/${p.id}`).toEqual([]);
        }
      }
    }
  });
});

describe('assembl / living · saved configuration', () => {
  it('is proposed, revisioned, coded, and purchasing is not enabled', () => {
    const design = applyKit(newDesign({ space: 'my-room', surface: 'wall', aesthetic: 'contrast' }), kitById('teen-room-starter')!);
    design.name = 'MILA';
    design.measurements = { method: 'tape-measure', widthMm: 500, heightMm: 300, confirmed: true };
    const config = savedConfiguration(design, '2026-10-19T00:00:00.000Z');
    expect(SavedConfigurationSchema.safeParse(config).success).toBe(true);
    expect(config.status).toBe('proposed');
    expect(config.purchasing.status).toBe('not_enabled');
    expect(config.fit.status).toBe('fits');
    expect(config.interface.pitchMm).toBe(42);
    expect(config.price.nzd).toBe(168);
    for (const l of config.lines) {
      expect(l.sku).toMatch(/^AL-[A-Z0-9]+-[A-Z]{3}-[A-Z2-9]$/);
      for (const f of l.printFiles) expect(f.revision).toBe('v0.3');
    }
    const plate = config.lines.find((l) => l.handle === 'al-name-plate')!;
    expect(plate.printFiles.map((f) => f.id)).toContain('grid-name-plate-text');
    const lines = toShopifyCartLines(config);
    expect(lines.length).toBe(config.lines.length);
    expect(lines[0].attributes.name).toBe('MILA');
  });
});

describe('assembl / living · journey configuration', () => {
  it('is a draft that never claims photo analysis or purchasing', () => {
    expect(spaceAssembledJourney.status).toBe('draft');
    const perm = Object.fromEntries(spaceAssembledJourney.toolPermissions.map((p) => [p.capabilityKey, p.status]));
    expect(perm.analyse_photo).toBe('unavailable');
    expect(perm.connector_action).toBe('unavailable');
    expect(spaceAssembledJourney.waitStateModules[0].steps.some((s) => s.detail.includes('42 mm'))).toBe(true);
  });
});
