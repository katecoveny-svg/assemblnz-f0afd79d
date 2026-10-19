import { describe, expect, it } from 'vitest';
import {
  AESTHETICS,
  CAD_MANIFEST,
  KITS,
  PARTS,
  SPACES,
  SPACE_ENTRIES,
  SavedConfigurationSchema,
  applyKit,
  billOfMaterials,
  bundledPriceBand,
  canPlace,
  fitCheck,
  gridAccessories,
  kitById,
  newDesign,
  recommend,
  savedConfiguration,
  spaceAssembledJourney,
  toShopifyCartLines,
  understand,
  validatePlacements,
} from './index';

describe('assembl / living · CAD manifest', () => {
  it('every catalogue part has a validated, watertight CAD export on the current pack', () => {
    for (const part of PARTS) {
      expect(part.cad.validation.brep_valid, part.id).toBe(true);
      expect(part.cad.validation.single_solid, part.id).toBe(true);
      expect(part.cad.validation.watertight, part.id).toBe(true);
      expect(part.cad.files.stl?.sha256, part.id).toHaveLength(64);
      expect(part.cad.files.step?.sha256, part.id).toHaveLength(64);
      expect(part.cad.revision.startsWith(CAD_MANIFEST.pack)).toBe(true);
    }
  });

  it('is prototype-only and never claims a load rating', () => {
    expect(CAD_MANIFEST.status).toContain('not physically validated');
    for (const part of PARTS) {
      expect(part.status).toBe('prototype');
      expect(part.cad.load.class).toBe('light');
    }
  });

  it('keeps the shared interface: panel is 8 × pitch, tile footprint is 4 × pitch', () => {
    const spec = CAD_MANIFEST.interface_spec;
    const panel = PARTS.find((p) => p.id === 'grid-panel-192')!;
    expect(panel.cad.dims_mm.x).toBe(spec.pitch_mm * 8);
    expect(spec.tile_footprint_mm).toBe(spec.pitch_mm * 4);
    expect(spec.hole_mm).toBeGreaterThan(spec.peg_mm);
  });
});

describe('assembl / living · kits and spaces', () => {
  it('every kit places parts legally on its panel field', () => {
    for (const kit of KITS) {
      const design = applyKit(newDesign({ space: kit.space, surface: 'wall', aesthetic: kit.aesthetic }), kit);
      expect(validatePlacements(design), kit.id).toEqual([]);
      expect(kit.status).toBe('indicative');
    }
  });

  it('every space door points at kits that exist', () => {
    expect(SPACE_ENTRIES.map((s) => s.id)).toEqual([...SPACES]);
    for (const entry of SPACE_ENTRIES) {
      for (const kitId of entry.kits) expect(kitById(kitId), `${entry.id} → ${kitId}`).toBeDefined();
    }
  });
});

describe('assembl / living · design rules', () => {
  it('rejects out-of-bounds and overlapping placements', () => {
    const design = newDesign({ space: 'my-room', surface: 'wall', aesthetic: 'calm' });
    design.placements = [
      { id: 'a', partId: 'grid-ledge-96', col: 6, row: 0 }, // 4 wide at col 6 on an 8-wide panel
      { id: 'b', partId: 'grid-hook-single', col: 0, row: 0 },
      { id: 'c', partId: 'grid-hook-single', col: 0, row: 1 }, // hooks are 2 tall → overlaps b
      { id: 'd', partId: 'tile-tray-96x96', col: 0, row: 4 }, // not grid-mounted
    ];
    const issues = validatePlacements(design);
    expect(issues).toContainEqual({ kind: 'out_of_bounds', placementId: 'a' });
    expect(issues).toContainEqual({ kind: 'overlap', placementId: 'c', withPlacementId: 'b' });
    expect(issues).toContainEqual({ kind: 'not_grid_mounted', partId: 'tile-tray-96x96' });
    expect(canPlace({ panels: design.panels, placements: [] }, { id: 'x', partId: 'grid-cup-48', col: 6, row: 5 })).toBe(true);
    expect(canPlace({ panels: design.panels, placements: [] }, { id: 'x', partId: 'grid-cup-48', col: 7, row: 5 })).toBe(false);
  });

  it('bills panels only when something is on the wall, honours minimum quantities and bundles', () => {
    const design = newDesign({ space: 'my-space', surface: 'drawer', aesthetic: 'warm' });
    design.extras = [{ partId: 'tile-clip', qty: 1 }];
    const drawerOnly = billOfMaterials(design);
    expect(drawerOnly.lines.map((l) => l.partId)).toEqual(['tile-clip']);
    expect(drawerOnly.lines[0].qty).toBe(4);
    expect(drawerOnly.basis).toContain('subject to manufacturing quotes');

    const kit = applyKit(design, kitById('get-ready-wall')!);
    const bom = billOfMaterials(kit);
    expect(bom.lines.find((l) => l.partId === 'grid-panel-192')?.qty).toBe(2);
    expect(bom.lines.find((l) => l.partId === 'grid-hook-single')?.qty).toBe(3);
    const bundled = bundledPriceBand(bom);
    expect(bundled.lowNzd).toBeLessThan(bom.priceBand.lowNzd);
    expect(bundled.highNzd).toBeGreaterThan(bundled.lowNzd);
  });

  it('never passes a wall layout without confirmed measurements', () => {
    const design = applyKit(newDesign({ space: 'work-and-create', surface: 'wall', aesthetic: 'calm' }), kitById('maker-wall')!);
    expect(fitCheck(design).status).toBe('unconfirmed');
    expect(fitCheck(design).requiredWidthMm).toBe(392);
    expect(fitCheck(design).requiredHeightMm).toBe(392);

    design.measurements = { method: 'tape-measure', widthMm: 390, heightMm: 600, confirmed: true };
    expect(fitCheck(design).status).toBe('too_wide');
    design.measurements = { method: 'tape-measure', widthMm: 600, heightMm: 300, confirmed: true };
    expect(fitCheck(design).status).toBe('too_tall');
    design.measurements = { method: 'a4-reference', widthMm: 600, heightMm: 600, confirmed: true };
    const ok = fitCheck(design);
    expect(ok.status).toBe('fits');
    expect(ok.notes.join(' ')).toContain('anchors');
  });

  it('a freestanding design fits without measurements', () => {
    const design = applyKit(newDesign({ space: 'work-and-create', surface: 'desk', aesthetic: 'calm' }), kitById('quiet-desk')!);
    expect(fitCheck(design).status).toBe('fits');
    expect(billOfMaterials(design).lines.some((l) => l.partId === 'grid-panel-192')).toBe(false);
  });
});

describe('assembl / living · recommendations', () => {
  it('is deterministic and every proposal is buildable', () => {
    const input = { space: 'my-room' as const, surface: 'wall' as const, need: 'My desk is covered in cables and my headset has nowhere to go', keep: ['a small speaker'], aesthetic: 'contrast' as const, now: '2026-10-17T00:00:00.000Z' };
    const a = recommend(input);
    const b = recommend(input);
    expect(a.map((p) => p.id)).toEqual(['minimal', 'system', 'expressive']);
    expect(a.map((p) => ({ panels: p.design.panels, parts: p.design.placements.map((x) => [x.partId, x.col, x.row]), extras: p.design.extras })))
      .toEqual(b.map((p) => ({ panels: p.design.panels, parts: p.design.placements.map((x) => [x.partId, x.col, x.row]), extras: p.design.extras })));
    for (const p of a) {
      expect(validatePlacements(p.design), p.id).toEqual([]);
      expect(p.design.origin).toBe('proposal');
      expect(p.design.photo.analysis).toBe('not_available');
    }
    const u = understand(input);
    expect(u.needs[0]).toContain('Cables');
    expect(u.matchedParts[0].id).toBe('grid-hook-single');
    expect(u.photoAnalysisAvailable).toBe(false);
  });

  it('keeps renters off the wall', () => {
    const [minimal, system, expressive] = recommend({ space: 'my-room', surface: 'desk', need: 'I am renting and cannot drill holes', keep: [], aesthetic: 'calm' });
    for (const p of [minimal, system, expressive]) {
      expect(p.design.placements, p.id).toEqual([]);
      expect(p.design.extras.some((e) => e.partId === 'rail-bar-192'), p.id).toBe(false);
    }
  });

  it('works for every space, surface and aesthetic combination', () => {
    for (const space of SPACES) {
      for (const surface of ['wall', 'desk', 'drawer', 'wardrobe', 'vanity', 'floor'] as const) {
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
  it('is proposed, revisioned, and purchasing is not enabled', () => {
    const design = applyKit(newDesign({ space: 'my-space', surface: 'wall', aesthetic: 'warm' }), kitById('get-ready-wall')!);
    design.measurements = { method: 'tape-measure', widthMm: 500, heightMm: 300, confirmed: true };
    const config = savedConfiguration(design, '2026-10-17T00:00:00.000Z');
    expect(SavedConfigurationSchema.safeParse(config).success).toBe(true);
    expect(config.status).toBe('proposed');
    expect(config.purchasing.status).toBe('not_enabled');
    expect(config.fit.status).toBe('fits');
    expect(config.interface.pitchMm).toBe(24);
    for (const p of config.parts) {
      expect(p.cadRevision).toMatch(/^AL-\d+\.\d+$/);
      expect(p.stlSha256).toHaveLength(64);
    }
    const lines = toShopifyCartLines(config);
    expect(lines.length).toBe(config.parts.length);
    expect(lines[0].handle.startsWith('assembl-living-')).toBe(true);
    expect(lines[0].attributes.cad_revision).toBe(config.parts[0].cadRevision);
  });
});

describe('assembl / living · journey configuration', () => {
  it('is a draft that never claims photo analysis or purchasing', () => {
    expect(spaceAssembledJourney.status).toBe('draft');
    expect(spaceAssembledJourney.stages.map((s) => s.type)).toEqual([
      'entry', 'intent', 'context', 'recommendation', 'commitment', 'action', 'wait', 'fulfilment', 'resolution', 'continuation',
    ]);
    const perm = Object.fromEntries(spaceAssembledJourney.toolPermissions.map((p) => [p.capabilityKey, p.status]));
    expect(perm.analyse_photo).toBe('unavailable');
    expect(perm.connector_action).toBe('unavailable');
    expect(perm.assemble_design).toBe('simulated');
    expect(gridAccessories().length).toBeGreaterThanOrEqual(3);
  });
});
