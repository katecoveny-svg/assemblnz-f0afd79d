/**
 * assembl / living — the modular interiors system · types
 * --------------------------------------------------------
 * One physical interface (IF-01), four foundations, many combinations.
 * Everything the Space Studio, the catalogue, the kits and the saved
 * configuration read comes from these schemas. Nothing here is UI.
 *
 * Honesty rule: every object carries a status. A prototype is `prototype`,
 * a recommendation is `proposed`, a kit that has not been quoted is
 * `indicative`. Nothing in this module claims a manufactured, tested or
 * purchasable product.
 */

import { z } from 'zod';

/* ────────────────────────────────────────────── foundations & spaces */

export const FOUNDATIONS = ['grid', 'tile', 'stack', 'rail'] as const;
export const FoundationSchema = z.enum(FOUNDATIONS);
export type Foundation = z.infer<typeof FoundationSchema>;

export const FOUNDATION_LABELS: Record<Foundation, { name: string; line: string }> = {
  grid: { name: 'assembl / grid', line: 'Modular wall panels, small shelves and interchangeable peg-mounted accessories.' },
  tile: { name: 'assembl / tile', line: 'Trays and inserts on one 96 mm footprint, for drawers, vanities and desks.' },
  stack: { name: 'assembl / stack', line: 'Freestanding risers whose bays are exactly one tile footprint.' },
  rail: { name: 'assembl / rail', line: 'Accessory bars that accept the same grid pegs, for under shelves and narrow walls.' },
};

export const SPACES = [
  'my-room',
  'my-space',
  'work-and-create',
  'store-and-organise',
  'pets-and-everyday',
  'plants-and-objects',
] as const;
export const SpaceSchema = z.enum(SPACES);
export type SpaceId = z.infer<typeof SpaceSchema>;

export const SURFACES = ['wall', 'desk', 'drawer', 'wardrobe', 'vanity', 'floor'] as const;
export const SurfaceSchema = z.enum(SURFACES);
export type Surface = z.infer<typeof SurfaceSchema>;

/* ────────────────────────────────────────────── colour & aesthetic */

export const COLOURWAYS = ['chalk', 'oat', 'stone', 'rose', 'plum', 'graphite'] as const;
export const ColourwaySchema = z.enum(COLOURWAYS);
export type Colourway = z.infer<typeof ColourwaySchema>;

/** Filament colourways. Muted and Scandinavian on purpose — no neon, no canary. */
export const COLOURWAY_SWATCHES: Record<Colourway, { label: string; hex: string; ink: string }> = {
  chalk: { label: 'chalk', hex: '#F5F1F2', ink: '#492B3E' },
  oat: { label: 'oat', hex: '#E6DCCB', ink: '#492B3E' },
  stone: { label: 'soft stone', hex: '#BFB8AE', ink: '#240B21' },
  rose: { label: 'muted rose', hex: '#916A70', ink: '#FFFDFB' },
  plum: { label: 'deep plum', hex: '#240B21', ink: '#FFFDFB' },
  graphite: { label: 'graphite', hex: '#4A4A4D', ink: '#FFFDFB' },
};

export const AESTHETICS = ['calm', 'warm', 'contrast', 'expressive'] as const;
export const AestheticSchema = z.enum(AESTHETICS);
export type Aesthetic = z.infer<typeof AestheticSchema>;

export const AESTHETIC_PRESETS: Record<Aesthetic, { label: string; line: string; panel: Colourway; accent: Colourway }> = {
  calm: { label: 'calm', line: 'Chalk on chalk. The system almost disappears.', panel: 'chalk', accent: 'stone' },
  warm: { label: 'warm', line: 'Oat panel, soft stone accessories. Reads like timber and linen.', panel: 'oat', accent: 'rose' },
  contrast: { label: 'contrast', line: 'Deep plum panel, chalk accessories. Graphic and tidy.', panel: 'plum', accent: 'chalk' },
  expressive: { label: 'expressive', line: 'Muted rose panel, graphite accessories. More personality, still quiet.', panel: 'rose', accent: 'graphite' },
};

/* ────────────────────────────────────────────── parts */

export const PART_KINDS = ['panel', 'hook', 'ledge', 'cup', 'tray', 'clip', 'riser', 'rail'] as const;
export const PartKindSchema = z.enum(PART_KINDS);
export type PartKind = z.infer<typeof PartKindSchema>;

export const PART_STATUSES = ['prototype', 'proposed'] as const;
export const PartStatusSchema = z.enum(PART_STATUSES);
export type PartStatus = z.infer<typeof PartStatusSchema>;

export const LOAD_CLASSES = ['light', 'medium', 'structural'] as const;
export const LoadClassSchema = z.enum(LOAD_CLASSES);
export type LoadClass = z.infer<typeof LoadClassSchema>;

export const CadFileSchema = z.object({
  path: z.string(),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().length(64),
});

export const CadPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  foundation: FoundationSchema,
  revision: z.string(),
  dims_mm: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  volume_cm3: z.number(),
  mass_g_pla: z.number(),
  print: z.object({
    orientation: z.string(),
    supports: z.string(),
    material: z.string(),
    layer_mm: z.number(),
    infill: z.string(),
    walls: z.number(),
  }),
  load: z.object({ class: LoadClassSchema, note: z.string() }),
  validation: z.object({
    brep_valid: z.boolean(),
    single_solid: z.boolean(),
    watertight: z.boolean().optional(),
    triangles: z.number().optional(),
  }),
  files: z.object({ stl: CadFileSchema.optional(), step: CadFileSchema.optional() }),
});
export type CadPart = z.infer<typeof CadPartSchema>;

export const CadManifestSchema = z.object({
  pack: z.string(),
  interface: z.string(),
  interface_spec: z.object({
    pitch_mm: z.number(),
    hole_mm: z.number(),
    peg_mm: z.number(),
    peg_length_mm: z.number(),
    panel_thickness_mm: z.number(),
    standoff_mm: z.number(),
    tile_footprint_mm: z.number(),
    tray_wall_mm: z.number(),
  }),
  status: z.string(),
  source: z.string(),
  parts: z.array(CadPartSchema),
});
export type CadManifest = z.infer<typeof CadManifestSchema>;

/** Indicative NZD band. Always subject to a manufacturing quote. */
export const PriceBandSchema = z.object({ lowNzd: z.number(), highNzd: z.number() });
export type PriceBand = z.infer<typeof PriceBandSchema>;

export const PartSchema = z.object({
  id: z.string(),
  name: z.string(),
  foundation: FoundationSchema,
  kind: PartKindSchema,
  status: PartStatusSchema,
  description: z.string(),
  /** Grid cells an accessory occupies when placed on a panel (cols × rows). Absent for parts that are not placed on a panel. */
  footprint: z.object({ cols: z.number().int().positive(), rows: z.number().int().positive() }).optional(),
  /** Which foundations this part can attach to. A panel attaches to a wall, so it lists none. */
  mountsOn: z.array(FoundationSchema),
  /** Entry points this part is suggested for. */
  spaces: z.array(SpaceSchema),
  /** Words a customer might use that make this part relevant. */
  cues: z.array(z.string()),
  priceBand: PriceBandSchema,
  /** Smallest quantity it makes sense to print and ship. */
  minQty: z.number().int().positive(),
  cad: CadPartSchema,
});
export type Part = z.infer<typeof PartSchema>;

/* ────────────────────────────────────────────── kits */

export const KitSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  space: SpaceSchema,
  aesthetic: AestheticSchema,
  /** Panel arrangement the kit is merchandised on. */
  panels: z.object({ cols: z.number().int().min(1).max(2), rows: z.number().int().min(1).max(2) }),
  /** Accessories placed on the panel grid, in order. */
  placements: z.array(z.object({ partId: z.string(), col: z.number().int().nonnegative(), row: z.number().int().nonnegative() })),
  /** Parts included alongside the panel (trays, risers, rails, clips). */
  extras: z.array(z.object({ partId: z.string(), qty: z.number().int().positive() })),
  status: z.literal('indicative'),
});
export type Kit = z.infer<typeof KitSchema>;

/* ────────────────────────────────────────────── a design */

export const MEASUREMENT_METHODS = ['unconfirmed', 'a4-reference', 'tape-measure', 'phone-depth-scan'] as const;
export const MeasurementMethodSchema = z.enum(MEASUREMENT_METHODS);
export type MeasurementMethod = z.infer<typeof MeasurementMethodSchema>;

export const PlacementSchema = z.object({
  id: z.string(),
  partId: z.string(),
  col: z.number().int().nonnegative(),
  row: z.number().int().nonnegative(),
});
export type Placement = z.infer<typeof PlacementSchema>;

export const SpaceDesignSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  space: SpaceSchema,
  surface: SurfaceSchema,
  need: z.string(),
  keep: z.array(z.string()),
  aesthetic: AestheticSchema,
  panelColour: ColourwaySchema,
  accentColour: ColourwaySchema,
  panels: z.object({ cols: z.number().int().min(1).max(2), rows: z.number().int().min(1).max(2) }),
  placements: z.array(PlacementSchema),
  extras: z.array(z.object({ partId: z.string(), qty: z.number().int().positive() })),
  measurements: z.object({
    method: MeasurementMethodSchema,
    widthMm: z.number().positive().optional(),
    heightMm: z.number().positive().optional(),
    confirmed: z.boolean(),
  }),
  photo: z.object({
    provided: z.boolean(),
    /** Photo understanding is not built. The studio never claims it read a photo. */
    analysis: z.literal('not_available'),
  }),
  /** Where this design came from. */
  origin: z.enum(['proposal', 'kit', 'customer']),
});
export type SpaceDesign = z.infer<typeof SpaceDesignSchema>;

/* ────────────────────────────────────────────── derived outputs */

export type BomLine = {
  partId: string;
  name: string;
  foundation: Foundation;
  qty: number;
  massG: number;
  priceBand: PriceBand;
  status: PartStatus;
};

export type BillOfMaterials = {
  lines: BomLine[];
  totalMassG: number;
  priceBand: PriceBand;
  /** Always present. The number is a band, not a price. */
  basis: 'indicative — subject to manufacturing quotes';
};

export type FitStatus = 'unconfirmed' | 'fits' | 'too_wide' | 'too_tall';

export type FitCheck = {
  status: FitStatus;
  requiredWidthMm: number;
  requiredHeightMm: number;
  standoffMm: number;
  notes: string[];
};

export type PlacementIssue =
  | { kind: 'unknown_part'; partId: string }
  | { kind: 'not_grid_mounted'; partId: string }
  | { kind: 'out_of_bounds'; placementId: string }
  | { kind: 'overlap'; placementId: string; withPlacementId: string };

export const SavedConfigurationSchema = z.object({
  schema: z.literal('assembl.living.configuration/1'),
  status: z.literal('proposed'),
  savedAt: z.string(),
  design: SpaceDesignSchema,
  parts: z.array(
    z.object({
      partId: z.string(),
      qty: z.number().int().positive(),
      cadRevision: z.string(),
      stlSha256: z.string().optional(),
      stepSha256: z.string().optional(),
    }),
  ),
  interface: z.object({ id: z.string(), pack: z.string(), pitchMm: z.number() }),
  fit: z.object({ status: z.string(), requiredWidthMm: z.number(), requiredHeightMm: z.number() }),
  price: z.object({ lowNzd: z.number(), highNzd: z.number(), basis: z.string() }),
  purchasing: z.object({
    channel: z.literal('shopify'),
    status: z.literal('not_enabled'),
    reason: z.string(),
  }),
});
export type SavedConfiguration = z.infer<typeof SavedConfigurationSchema>;

/** Future Shopify handoff shape. Typed now so nothing improvises it later. */
export type ShopifyCartLine = {
  /** Product handle the manufacturer-accepted SKU will carry. */
  handle: string;
  quantity: number;
  attributes: Record<string, string>;
};
