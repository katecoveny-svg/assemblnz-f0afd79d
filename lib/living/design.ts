/**
 * assembl / living — design rules
 * -------------------------------
 * Pure functions over a `SpaceDesign`: placement validation on the TURN grid,
 * the bill of materials (boards from the field, accessories from placements,
 * everything else from extras), proposed pricing, the fit check against
 * customer-confirmed measurements, and the saved configuration a print
 * partner quotes from. Deterministic on purpose: nothing here calls a model.
 */

import { AESTHETIC_PRESETS } from './system';
import { BOARD_CELLS, BOARD_MM, CAD_PACK, INTERFACE_ID, INTERFACE_SPEC, PITCH_MM, partCode, printFile, productByHandle, requireProduct } from './catalogue';
import type { Aesthetic, BillOfMaterials, BomLine, Field, FitCheck, Kit, Placement, PlacementIssue, SavedConfiguration, ShopifyCartLine, SpaceDesign, SpaceId, Surface } from './system';

/* ────────────────────────────────────────────── grid geometry */

export function gridSize(design: Pick<SpaceDesign, 'field'>): { cols: number; rows: number } {
  return { cols: design.field.columns.reduce((s, c) => s + c, 0), rows: design.field.rows * BOARD_CELLS };
}

export function fieldSizeMm(field: Field): { w: number; h: number } {
  return { w: field.columns.reduce((s, c) => s + c, 0) * PITCH_MM, h: field.rows * BOARD_MM };
}

type Rect = { c0: number; c1: number; r0: number; r1: number };

export function placementRect(p: Placement): Rect | null {
  const product = productByHandle(p.handle);
  if (!product?.footprint) return null;
  return { c0: p.col, c1: p.col + product.footprint.cols - 1, r0: p.row, r1: p.row + product.footprint.rows - 1 };
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.c0 <= b.c1 && b.c0 <= a.c1 && a.r0 <= b.r1 && b.r0 <= a.r1;
}

export function validatePlacements(design: Pick<SpaceDesign, 'field' | 'placements'>): PlacementIssue[] {
  const issues: PlacementIssue[] = [];
  const { cols, rows } = gridSize(design);
  const rects: { id: string; rect: Rect }[] = [];
  for (const p of design.placements) {
    const product = productByHandle(p.handle);
    if (!product) {
      issues.push({ kind: 'unknown_product', handle: p.handle });
      continue;
    }
    if (!product.footprint || product.mount !== 'grid') {
      issues.push({ kind: 'not_grid_mounted', handle: p.handle });
      continue;
    }
    const rect = placementRect(p)!;
    if (rect.c0 < 0 || rect.r0 < 0 || rect.c1 >= cols || rect.r1 >= rows) {
      issues.push({ kind: 'out_of_bounds', placementId: p.id });
      continue;
    }
    for (const other of rects) if (overlaps(rect, other.rect)) issues.push({ kind: 'overlap', placementId: p.id, withPlacementId: other.id });
    rects.push({ id: p.id, rect });
  }
  return issues;
}

export function canPlace(design: Pick<SpaceDesign, 'field' | 'placements'>, candidate: Placement): boolean {
  const trial = { field: design.field, placements: [...design.placements, candidate] };
  return validatePlacements(trial).every((i) => !('placementId' in i) || i.placementId !== candidate.id);
}

/* ────────────────────────────────────────────── bill of materials */

export function billOfMaterials(design: Pick<SpaceDesign, 'field' | 'placements' | 'extras' | 'boardColour' | 'accessoryColour'>): BillOfMaterials {
  const qty = new Map<string, number>();
  const add = (handle: string, n: number) => qty.set(handle, (qty.get(handle) ?? 0) + n);

  if (design.placements.length > 0) {
    for (const c of design.field.columns) add(c === 4 ? 'al-board-4x4' : 'al-board-2x4', design.field.rows);
  }
  const placed = new Map<string, number>();
  for (const p of design.placements) placed.set(p.handle, (placed.get(p.handle) ?? 0) + 1);
  for (const [handle, n] of placed) add(handle, Math.ceil(n / requireProduct(handle).perUnit));
  for (const e of design.extras) add(e.handle, e.qty);

  const lines: BomLine[] = [];
  for (const [handle, n] of qty) {
    const product = requireProduct(handle);
    const colour = ['board', 'half-board', 'renter-board'].includes(product.kind) ? design.boardColour : design.accessoryColour;
    lines.push({
      handle,
      title: product.title,
      foundation: product.foundation,
      qty: n,
      priceNzd: product.priceNzd === null ? null : Math.round(product.priceNzd * n * 100) / 100,
      shipG: product.ship_g * n,
      sku: product.colours === 'natural' ? partCode(product, 'natural') : partCode(product, colour),
      colour,
    });
  }
  lines.sort((a, b) => a.foundation.localeCompare(b.foundation) || a.handle.localeCompare(b.handle));
  return {
    lines,
    totalShipG: lines.reduce((s, l) => s + l.shipG, 0),
    priceNzd: Math.round(lines.reduce((s, l) => s + (l.priceNzd ?? 0), 0) * 100) / 100,
    quotedLines: lines.filter((l) => l.priceNzd === null).length,
    basis: 'proposed — pre-quote, incl. GST',
  };
}

/* ────────────────────────────────────────────── fit */

export function requiredWallSize(design: Pick<SpaceDesign, 'field' | 'placements'>): { widthMm: number; heightMm: number } {
  if (design.placements.length === 0) return { widthMm: 0, heightMm: 0 };
  return { widthMm: fieldSizeMm(design.field).w, heightMm: fieldSizeMm(design.field).h };
}

export function hangsOnDoor(design: Pick<SpaceDesign, 'extras' | 'surface'>): boolean {
  return design.extras.some((e) => e.handle === 'al-over-door' && e.qty > 0);
}

/** A photograph alone never establishes fit. The check passes only on dimensions the customer confirmed. */
export function fitCheck(design: Pick<SpaceDesign, 'field' | 'placements' | 'measurements' | 'extras' | 'surface'>): FitCheck {
  const { widthMm, heightMm } = requiredWallSize(design);
  const notes: string[] = [];
  const standoffMm = INTERFACE_SPEC.board_thickness_mm;
  const base = { requiredWidthMm: widthMm, requiredHeightMm: heightMm, standoffMm };

  if (design.placements.length === 0) {
    notes.push('No board in this design. Trays, dowel joints and the shade only need the surface or fitting they go on.');
    return { status: 'fits', ...base, notes };
  }

  const m = design.measurements;
  const door = hangsOnDoor(design);
  notes.push(`Boards are ${standoffMm} mm thick with the key chamber inside, so nothing stands further off the wall than the accessory itself.`);
  if (door) {
    notes.push('Hung over a door with two hangers in the top row. Doors up to 35 mm thick; needs a 4 mm gap above the door so it still closes. Light things only.');
  } else {
    notes.push('Each 4×4 board fixes with four anchor washers and 4 mm countersunk screws into plugs suited to the wall. Printed parts are not anchors.');
  }

  if (!m.confirmed || !m.widthMm || !m.heightMm) {
    notes.push('Confirm the width and height of the space before the fit can be checked.');
    return { status: 'unconfirmed', ...base, notes };
  }
  if (m.widthMm < widthMm) {
    notes.push(`The layout needs ${widthMm} mm of width; you confirmed ${m.widthMm} mm. Drop a board column, or swap a 4×4 for a 2×4.`);
    return { status: 'too_wide', ...base, notes };
  }
  if (m.heightMm < heightMm) {
    notes.push(`The layout needs ${heightMm} mm of height; you confirmed ${m.heightMm} mm. Drop a row of boards.`);
    return { status: 'too_tall', ...base, notes };
  }
  if (door) {
    if (m.doorMm !== undefined && m.doorMm > 35) {
      notes.push(`Your door is ${m.doorMm} mm thick; the hanger suits doors up to 35 mm.`);
      return { status: 'door_too_thick', ...base, notes };
    }
    if (m.doorGapOk === false) {
      notes.push('The 4 mm step of the door-gap gauge did not fit above your door, so the hanger would stop it closing.');
      return { status: 'door_no_gap', ...base, notes };
    }
    if (m.doorMm === undefined || m.doorGapOk === undefined) {
      notes.push('Confirm the door thickness and the gap above it (the test kit has a gauge) before this is marked as fitting.');
      return { status: 'unconfirmed', ...base, notes };
    }
  }
  notes.push(`Fits with ${m.widthMm - widthMm} mm spare width and ${m.heightMm - heightMm} mm spare height.`);
  return { status: 'fits', ...base, notes };
}

/* ────────────────────────────────────────────── construction */

let counter = 0;
export function placementId(): string {
  counter += 1;
  return `pl-${counter.toString(36)}`;
}

export function newDesign(input: { space: SpaceId; surface: Surface; need?: string; keep?: string[]; aesthetic: Aesthetic; origin?: SpaceDesign['origin']; now?: string }): SpaceDesign {
  const preset = AESTHETIC_PRESETS[input.aesthetic];
  return {
    id: `ld-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: input.now ?? new Date().toISOString(),
    space: input.space,
    surface: input.surface,
    need: input.need ?? '',
    keep: input.keep ?? [],
    aesthetic: input.aesthetic,
    boardColour: preset.board,
    accessoryColour: preset.accessory,
    field: { columns: [4], rows: 1 },
    placements: [],
    extras: [],
    measurements: { method: 'unconfirmed', confirmed: false },
    photo: { provided: false, analysis: 'not_available' },
    origin: input.origin ?? 'customer',
  };
}

export function applyKit(design: SpaceDesign, kit: Kit): SpaceDesign {
  const preset = AESTHETIC_PRESETS[kit.aesthetic];
  return {
    ...design,
    aesthetic: kit.aesthetic,
    boardColour: preset.board,
    accessoryColour: preset.accessory,
    field: { columns: [...kit.field.columns], rows: kit.field.rows },
    placements: kit.placements.map((p) => ({ ...p, id: placementId() })),
    extras: kit.extras.map((e) => ({ ...e })),
    surface: kit.extras.some((e) => e.handle === 'al-over-door') ? 'door' : design.surface,
    origin: 'kit',
  };
}

/* ────────────────────────────────────────────── saved configuration */

export function savedConfiguration(design: SpaceDesign, now = new Date().toISOString()): SavedConfiguration {
  const bom = billOfMaterials(design);
  const fit = fitCheck(design);
  return {
    schema: 'assembl.living.configuration/2',
    status: 'proposed',
    savedAt: now,
    design,
    lines: bom.lines.map((l) => {
      const product = requireProduct(l.handle);
      return {
        handle: l.handle,
        sku: l.sku,
        qty: l.qty,
        colour: l.colour,
        printFiles: product.parts.map((pp) => {
          const f = printFile(pp.id);
          return { id: pp.id, qty: pp.qty * l.qty, revision: f.revision, sha256: f.file?.sha256 };
        }),
      };
    }),
    interface: { id: INTERFACE_ID, pack: CAD_PACK, pitchMm: PITCH_MM },
    fit: { status: fit.status, requiredWidthMm: fit.requiredWidthMm, requiredHeightMm: fit.requiredHeightMm },
    price: { nzd: bom.priceNzd, quotedLines: bom.quotedLines, basis: bom.basis },
    purchasing: {
      channel: 'shopify',
      status: 'not_enabled',
      reason: 'Purchasing opens only once the test-print kit has been run with the print partner and they have accepted the files, pricing and fulfilment for this pack.',
    },
  };
}

/** The shape a Shopify cart would receive once purchasing is enabled. Typed and tested; no surface may send it while purchasing is not enabled. */
export function toShopifyCartLines(config: SavedConfiguration): ShopifyCartLine[] {
  return config.lines.map((l) => ({
    handle: l.handle,
    sku: l.sku,
    quantity: l.qty,
    attributes: {
      design_id: config.design.id,
      pack: config.interface.pack,
      interface: config.interface.id,
      colour: l.colour,
      ...(config.design.name ? { name: config.design.name } : {}),
    },
  }));
}
