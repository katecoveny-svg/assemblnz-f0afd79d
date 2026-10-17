/**
 * assembl / living — design rules
 * -------------------------------
 * Pure functions over a `SpaceDesign`: placement validation, bill of
 * materials, indicative pricing, the fit check against confirmed
 * measurements, and the typed saved configuration that a manufacturer quote
 * or a future Shopify order would be built from.
 *
 * Deterministic on purpose. Nothing here calls a model.
 */

import {
  CAD_MANIFEST,
  CAD_PACK,
  INTERFACE_ID,
  INTERFACE_SPEC,
  PANEL_CELLS,
  PANEL_GAP_MM,
  PANEL_SIZE_MM,
  partById,
  requirePart,
} from './catalogue';
import { AESTHETIC_PRESETS } from './system';
import type {
  Aesthetic,
  BillOfMaterials,
  BomLine,
  FitCheck,
  Kit,
  Placement,
  PlacementIssue,
  SavedConfiguration,
  ShopifyCartLine,
  SpaceDesign,
  SpaceId,
  Surface,
} from './system';

/* ────────────────────────────────────────────── grid geometry */

export function gridSize(design: Pick<SpaceDesign, 'panels'>): { cols: number; rows: number } {
  return { cols: design.panels.cols * PANEL_CELLS, rows: design.panels.rows * PANEL_CELLS };
}

type Rect = { c0: number; c1: number; r0: number; r1: number };

export function placementRect(p: Placement): Rect | null {
  const part = partById(p.partId);
  if (!part?.footprint) return null;
  return { c0: p.col, c1: p.col + part.footprint.cols - 1, r0: p.row, r1: p.row + part.footprint.rows - 1 };
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.c0 <= b.c1 && b.c0 <= a.c1 && a.r0 <= b.r1 && b.r0 <= a.r1;
}

/** Every issue with the placements of a design. An empty list means the layout is buildable. */
export function validatePlacements(design: Pick<SpaceDesign, 'panels' | 'placements'>): PlacementIssue[] {
  const issues: PlacementIssue[] = [];
  const { cols, rows } = gridSize(design);
  const rects: { id: string; rect: Rect }[] = [];
  for (const p of design.placements) {
    const part = partById(p.partId);
    if (!part) {
      issues.push({ kind: 'unknown_part', partId: p.partId });
      continue;
    }
    if (!part.footprint || !part.mountsOn.includes('grid')) {
      issues.push({ kind: 'not_grid_mounted', partId: p.partId });
      continue;
    }
    const rect = placementRect(p)!;
    if (rect.c0 < 0 || rect.r0 < 0 || rect.c1 >= cols || rect.r1 >= rows) {
      issues.push({ kind: 'out_of_bounds', placementId: p.id });
      continue;
    }
    for (const other of rects) {
      if (overlaps(rect, other.rect)) issues.push({ kind: 'overlap', placementId: p.id, withPlacementId: other.id });
    }
    rects.push({ id: p.id, rect });
  }
  return issues;
}

/** True when a new placement would sit inside the grid without touching another part. */
export function canPlace(design: Pick<SpaceDesign, 'panels' | 'placements'>, candidate: Placement): boolean {
  const trial = { panels: design.panels, placements: [...design.placements, candidate] };
  return validatePlacements(trial).every((i) => !('placementId' in i) || i.placementId !== candidate.id);
}

/* ────────────────────────────────────────────── bill of materials */

export function billOfMaterials(design: Pick<SpaceDesign, 'panels' | 'placements' | 'extras'>): BillOfMaterials {
  const qty = new Map<string, number>();
  const add = (id: string, n: number) => qty.set(id, (qty.get(id) ?? 0) + n);

  if (design.placements.length > 0) add('grid-panel-192', design.panels.cols * design.panels.rows);
  for (const p of design.placements) add(p.partId, 1);
  for (const e of design.extras) add(e.partId, e.qty);

  const lines: BomLine[] = [];
  for (const [partId, n] of qty) {
    const part = requirePart(partId);
    const count = Math.max(n, part.minQty);
    lines.push({
      partId,
      name: part.name,
      foundation: part.foundation,
      qty: count,
      massG: Math.round(part.cad.mass_g_pla * count * 10) / 10,
      priceBand: { lowNzd: part.priceBand.lowNzd * count, highNzd: part.priceBand.highNzd * count },
      status: part.status,
    });
  }
  lines.sort((a, b) => a.foundation.localeCompare(b.foundation) || a.partId.localeCompare(b.partId));

  const lowNzd = lines.reduce((s, l) => s + l.priceBand.lowNzd, 0);
  const highNzd = lines.reduce((s, l) => s + l.priceBand.highNzd, 0);
  return {
    lines,
    totalMassG: Math.round(lines.reduce((s, l) => s + l.massG, 0) * 10) / 10,
    priceBand: { lowNzd, highNzd },
    basis: 'indicative — subject to manufacturing quotes',
  };
}

/** Bundling discount applied when parts ship as one print-and-ship order. Indicative only. */
export const BUNDLE_FACTOR = 0.85;

export function bundledPriceBand(bom: BillOfMaterials): { lowNzd: number; highNzd: number } {
  const round = (n: number) => Math.round(n);
  if (bom.lines.length < 3) return { lowNzd: round(bom.priceBand.lowNzd), highNzd: round(bom.priceBand.highNzd) };
  return { lowNzd: round(bom.priceBand.lowNzd * BUNDLE_FACTOR), highNzd: round(bom.priceBand.highNzd * BUNDLE_FACTOR) };
}

/* ────────────────────────────────────────────── fit */

export function requiredWallSize(design: Pick<SpaceDesign, 'panels' | 'placements'>): { widthMm: number; heightMm: number } {
  if (design.placements.length === 0) return { widthMm: 0, heightMm: 0 };
  const { cols, rows } = design.panels;
  return {
    widthMm: cols * PANEL_SIZE_MM + (cols - 1) * PANEL_GAP_MM,
    heightMm: rows * PANEL_SIZE_MM + (rows - 1) * PANEL_GAP_MM,
  };
}

/**
 * A photograph alone never establishes fit. The check only passes once the
 * customer has confirmed the dimensions that decide it.
 */
export function fitCheck(design: Pick<SpaceDesign, 'panels' | 'placements' | 'measurements' | 'extras'>): FitCheck {
  const { widthMm, heightMm } = requiredWallSize(design);
  const notes: string[] = [];
  const standoffMm = INTERFACE_SPEC.standoff_mm + INTERFACE_SPEC.panel_thickness_mm;
  const base = { requiredWidthMm: widthMm, requiredHeightMm: heightMm, standoffMm };

  if (design.placements.length === 0) {
    notes.push('No wall panel in this design. Freestanding and drawer parts only need the surface they sit on.');
    return { status: 'fits', ...base, notes };
  }

  notes.push(`Panels stand ${standoffMm} mm off the wall so hooks can seat behind them.`);
  notes.push('Fix every panel with four screws into anchors suited to your wall. Printed parts are not wall anchors.');

  const m = design.measurements;
  if (!m.confirmed || !m.widthMm || !m.heightMm) {
    notes.push('Confirm the width and height of the space before the fit can be checked.');
    return { status: 'unconfirmed', ...base, notes };
  }
  if (m.widthMm < widthMm) {
    notes.push(`The layout needs ${widthMm} mm of width; you confirmed ${m.widthMm} mm. Drop a column of panels or choose a rail.`);
    return { status: 'too_wide', ...base, notes };
  }
  if (m.heightMm < heightMm) {
    notes.push(`The layout needs ${heightMm} mm of height; you confirmed ${m.heightMm} mm. Drop a row of panels.`);
    return { status: 'too_tall', ...base, notes };
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

export function newDesign(input: {
  space: SpaceId;
  surface: Surface;
  need?: string;
  keep?: string[];
  aesthetic: Aesthetic;
  origin?: SpaceDesign['origin'];
  now?: string;
}): SpaceDesign {
  const preset = AESTHETIC_PRESETS[input.aesthetic];
  return {
    id: `ld-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: input.now ?? new Date().toISOString(),
    space: input.space,
    surface: input.surface,
    need: input.need ?? '',
    keep: input.keep ?? [],
    aesthetic: input.aesthetic,
    panelColour: preset.panel,
    accentColour: preset.accent,
    panels: { cols: 1, rows: 1 },
    placements: [],
    extras: [],
    measurements: { method: 'unconfirmed', confirmed: false },
    photo: { provided: false, analysis: 'not_available' },
    origin: input.origin ?? 'customer',
  };
}

/** Load a kit into a design, keeping the customer's space, need and measurements. */
export function applyKit(design: SpaceDesign, kit: Kit): SpaceDesign {
  const preset = AESTHETIC_PRESETS[kit.aesthetic];
  return {
    ...design,
    aesthetic: kit.aesthetic,
    panelColour: preset.panel,
    accentColour: preset.accent,
    panels: { ...kit.panels },
    placements: kit.placements.map((p) => ({ ...p, id: placementId() })),
    extras: kit.extras.map((e) => ({ ...e })),
    origin: 'kit',
  };
}

/* ────────────────────────────────────────────── saved configuration */

export function savedConfiguration(design: SpaceDesign, now = new Date().toISOString()): SavedConfiguration {
  const bom = billOfMaterials(design);
  const fit = fitCheck(design);
  const price = bundledPriceBand(bom);
  return {
    schema: 'assembl.living.configuration/1',
    status: 'proposed',
    savedAt: now,
    design,
    parts: bom.lines.map((l) => {
      const part = requirePart(l.partId);
      return {
        partId: l.partId,
        qty: l.qty,
        cadRevision: part.cad.revision,
        stlSha256: part.cad.files.stl?.sha256,
        stepSha256: part.cad.files.step?.sha256,
      };
    }),
    interface: { id: INTERFACE_ID, pack: CAD_PACK, pitchMm: INTERFACE_SPEC.pitch_mm },
    fit: { status: fit.status, requiredWidthMm: fit.requiredWidthMm, requiredHeightMm: fit.requiredHeightMm },
    price: { ...price, basis: bom.basis },
    purchasing: {
      channel: 'shopify',
      status: 'not_enabled',
      reason: 'Purchasing opens only once a manufacturer has accepted the files, pricing and fulfilment for this revision.',
    },
  };
}

/**
 * The shape a Shopify cart would receive once purchasing is enabled. It is
 * returned for typing and tests only; no surface may send it while
 * `purchasing.status` is `not_enabled`.
 */
export function toShopifyCartLines(config: SavedConfiguration): ShopifyCartLine[] {
  return config.parts.map((p) => ({
    handle: `assembl-living-${p.partId}`,
    quantity: p.qty,
    attributes: {
      design_id: config.design.id,
      cad_revision: p.cadRevision,
      interface: config.interface.id,
      colour_panel: config.design.panelColour,
      colour_accent: config.design.accentColour,
    },
  }));
}

export { CAD_MANIFEST };
