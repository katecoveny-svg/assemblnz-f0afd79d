/**
 * assembl / living — the modular interiors system · types
 * --------------------------------------------------------
 * One physical interface (the assembl TURN standard, v0.1 proposed), five
 * foundations and a go-anywhere collection (dayrally), all generated from
 * one parametric source: `tools/living-cad/cad/lib.py`.
 *
 * Honesty rule: every object carries a status. Nothing has been printed.
 * Prices are proposed, not quoted. Nothing here claims a tested or
 * purchasable product.
 */

import { z } from 'zod';

/* ────────────────────────────────────────────── foundations & spaces */

export const FOUNDATIONS = ['grid', 'tile', 'stack', 'renter', 'light'] as const;
export const FoundationSchema = z.enum(FOUNDATIONS);
export type Foundation = z.infer<typeof FoundationSchema>;

export const FOUNDATION_LABELS: Record<Foundation, { name: string; line: string }> = {
  grid: { name: 'assembl / grid', line: 'Wall boards on a 42 mm grid. Every accessory locks on with a quarter-turn key.' },
  tile: { name: 'assembl / tile', line: 'Drawer trays sized to your drawer, and cut-out trays with a pocket for each thing you own.' },
  stack: { name: 'assembl / stack', line: 'Printed joints and feet for 19 mm timber dowel. Furniture from parts that fit a print bed.' },
  renter: { name: 'assembl / renter', line: 'The same boards, hung over a door or from a wardrobe rail. Nothing to drill, nothing to patch.' },
  light: { name: 'assembl / light', line: 'A fluted pendant shade for a certified cord set. Shade only, LED only.' },
};

export const SPACES = ['my-room', 'my-space', 'work-and-create', 'store-and-organise', 'pets-and-everyday', 'plants-and-objects'] as const;
export const SpaceSchema = z.enum(SPACES);
export type SpaceId = z.infer<typeof SpaceSchema>;

export const SURFACES = ['wall', 'door', 'wardrobe', 'desk', 'drawer', 'vanity'] as const;
export const SurfaceSchema = z.enum(SURFACES);
export type Surface = z.infer<typeof SurfaceSchema>;

/* ────────────────────────────────────────────── colour & aesthetic */

/** The seven PLA Matte colourways the living line is sold in. */
export const COLOURWAYS = ['chalk', 'oat', 'sage', 'clay', 'plum', 'ash', 'ink'] as const;
export const ColourwaySchema = z.enum(COLOURWAYS);
export type Colourway = z.infer<typeof ColourwaySchema>;

export const AESTHETICS = ['calm', 'warm', 'contrast', 'expressive'] as const;
export const AestheticSchema = z.enum(AESTHETICS);
export type Aesthetic = z.infer<typeof AestheticSchema>;

export const AESTHETIC_PRESETS: Record<Aesthetic, { label: string; line: string; board: Colourway; accessory: Colourway }> = {
  calm: { label: 'calm', line: 'Chalk board, ash accessories. The system almost disappears.', board: 'chalk', accessory: 'ash' },
  warm: { label: 'warm', line: 'Oat board, clay accessories. Reads like timber and terracotta.', board: 'oat', accessory: 'clay' },
  contrast: { label: 'contrast', line: 'Ink board, chalk accessories. Graphic and tidy.', board: 'ink', accessory: 'chalk' },
  expressive: { label: 'expressive', line: 'Sage board, plum accessories. More personality, still quiet.', board: 'sage', accessory: 'plum' },
};

/* ────────────────────────────────────────────── manifest (generated) */

export const CadFileSchema = z.object({ path: z.string(), bytes: z.number().int().nonnegative(), sha256: z.string().length(64) });

export const PrintFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  group: z.string().nullable().optional(),
  revision: z.string(),
  print_orientation: z.string(),
  dims_mm: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  fits_250_cube: z.boolean(),
  volume_cm3: z.number(),
  mass_g_pla: z.number(),
  material: z.string(),
  supports: z.string(),
  watertight: z.boolean(),
  genus: z.number(),
  bodies: z.number().nullable().optional(),
  unsupported_down_area_mm2: z.number(),
  notes: z.string(),
  file: CadFileSchema.nullable(),
});
export type PrintFile = z.infer<typeof PrintFileSchema>;

export const ColourSchema = z.object({ id: z.string(), name: z.string(), hex: z.string() });
export type Colour = z.infer<typeof ColourSchema>;

export const CostingSchema = z.object({ max_cost_nzd: z.number(), max_usd_per_gram: z.number(), ship_nzd: z.number() }).nullable();

export const ManifestProductSchema = z.object({
  handle: z.string(),
  short: z.string().nullable(),
  title: z.string(),
  blurb: z.string(),
  size: z.string(),
  material: z.string(),
  type: z.string(),
  personalised: z.boolean(),
  colours: z.enum(['living', 'dayrally', 'natural']),
  price_nzd: z.number(),
  ship_g: z.number(),
  parts: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })),
  costing: CostingSchema,
  skus: z.array(z.object({ colour: z.string(), sku: z.string() })),
});
export type ManifestProduct = z.infer<typeof ManifestProductSchema>;

export const ManifestKitSchema = z.object({
  handle: z.string(),
  short: z.string().nullable(),
  title: z.string(),
  note: z.string(),
  collection: z.enum(['living', 'dayrally']),
  price_nzd: z.number(),
  ship_g: z.number(),
  lines: z.array(z.object({ handle: z.string(), qty: z.number().int().positive() })),
  costing: CostingSchema,
});
export type ManifestKit = z.infer<typeof ManifestKitSchema>;

export const CadManifestSchema = z.object({
  pack: z.string(),
  interface: z.string(),
  interface_spec: z.object({
    pitch_mm: z.number(),
    board_thickness_mm: z.number(),
    standoff_mm: z.number(),
    plate_mm: z.number(),
    keyway_bore_mm: z.number(),
    lug_slot_mm: z.number(),
    chamber_mm: z.number(),
    flange_mm: z.number(),
    nub_mm: z.number(),
    detent_mm: z.number(),
    clamp_mm: z.number(),
    key_action: z.string(),
    max_part_mm: z.number(),
  }),
  status: z.string(),
  source: z.string(),
  built_at: z.string(),
  colours: z.object({ living: z.array(ColourSchema), dayrally: z.array(ColourSchema), natural: z.array(ColourSchema) }),
  parts: z.array(PrintFileSchema),
  products: z.array(ManifestProductSchema),
  kits: z.array(ManifestKitSchema),
  test_kit: z.object({
    instructions: z.string(),
    files: z.array(z.object({ file: z.string(), name: z.string(), material: z.string(), qty: z.number(), print_bbox_mm: z.array(z.number()), est_grams_pla: z.number(), watertight: z.boolean(), check: z.string(), path: z.string() })),
    total_g: z.number(),
  }),
  fit_tests: z.record(z.string(), z.record(z.string(), z.union([z.number(), z.boolean(), z.string()]))),
  part_code_alphabet: z.string(),
});
export type CadManifest = z.infer<typeof CadManifestSchema>;

/* ────────────────────────────────────────────── products (manifest + semantics) */

export const PRODUCT_KINDS = ['board', 'half-board', 'renter-board', 'hook', 'cradle', 'shelf', 'bin', 'cup', 'garage', 'plate', 'keys', 'door-hanger', 'rail-hanger', 'node', 'foot', 'shade', 'tray', 'cutout'] as const;
export const ProductKindSchema = z.enum(PRODUCT_KINDS);
export type ProductKind = z.infer<typeof ProductKindSchema>;

export const MOUNTS = ['grid', 'door', 'rail', 'wall', 'surface', 'dowel', 'cord-set'] as const;
export type Mount = (typeof MOUNTS)[number];

export type Product = ManifestProduct & {
  foundation: Foundation;
  kind: ProductKind;
  /** Grid cells an accessory occupies on a board (cols × rows), keyed on the TURN grid. Absent for parts not placed on a board. */
  footprint?: { cols: number; rows: number };
  /** Items per sold unit (rod cradles and hangers are pairs). */
  perUnit: number;
  mount: Mount;
  spaces: SpaceId[];
  cues: string[];
  /** Price is proposed and pre-quote; null when the item is made to measure and quoted per order. */
  priceNzd: number | null;
};

/* ────────────────────────────────────────────── kits */

export const FieldSchema = z.object({
  /** Board columns left to right: 4 = a 4×4 board, 2 = a 2×4 half board. */
  columns: z.array(z.union([z.literal(2), z.literal(4)])).min(1).max(3),
  rows: z.union([z.literal(1), z.literal(2)]),
});
export type Field = z.infer<typeof FieldSchema>;

export const KitSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  note: z.string(),
  space: SpaceSchema,
  aesthetic: AestheticSchema,
  field: FieldSchema,
  placements: z.array(z.object({ handle: z.string(), col: z.number().int().nonnegative(), row: z.number().int().nonnegative() })),
  extras: z.array(z.object({ handle: z.string(), qty: z.number().int().positive() })),
  priceNzd: z.number(),
  status: z.literal('proposed'),
});
export type Kit = z.infer<typeof KitSchema>;

/* ────────────────────────────────────────────── a design */

export const MEASUREMENT_METHODS = ['unconfirmed', 'tape-measure', 'a4-reference', 'phone-depth-scan', 'door-gap-gauge'] as const;
export const MeasurementMethodSchema = z.enum(MEASUREMENT_METHODS);
export type MeasurementMethod = z.infer<typeof MeasurementMethodSchema>;

export const PlacementSchema = z.object({ id: z.string(), handle: z.string(), col: z.number().int().nonnegative(), row: z.number().int().nonnegative() });
export type Placement = z.infer<typeof PlacementSchema>;

export const SpaceDesignSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  space: SpaceSchema,
  surface: SurfaceSchema,
  need: z.string(),
  keep: z.array(z.string()),
  aesthetic: AestheticSchema,
  boardColour: ColourwaySchema,
  accessoryColour: ColourwaySchema,
  /** Name for personalised parts (name plate). Rendered later from the same font the CAD uses. */
  name: z.string().max(12).optional(),
  field: FieldSchema,
  placements: z.array(PlacementSchema),
  extras: z.array(z.object({ handle: z.string(), qty: z.number().int().positive() })),
  measurements: z.object({
    method: MeasurementMethodSchema,
    widthMm: z.number().positive().optional(),
    heightMm: z.number().positive().optional(),
    /** Door thickness for the over-door hanger (needs ≤ 35 mm and a 4 mm gap above the door). */
    doorMm: z.number().positive().optional(),
    doorGapOk: z.boolean().optional(),
    confirmed: z.boolean(),
  }),
  photo: z.object({ provided: z.boolean(), analysis: z.literal('not_available') }),
  origin: z.enum(['proposal', 'kit', 'customer']),
});
export type SpaceDesign = z.infer<typeof SpaceDesignSchema>;

/* ────────────────────────────────────────────── derived outputs */

export type BomLine = {
  handle: string;
  title: string;
  foundation: Foundation;
  qty: number;
  /** Proposed NZD for this line, or null when quoted per order. */
  priceNzd: number | null;
  shipG: number;
  sku: string | null;
  colour: Colourway;
};

export type BillOfMaterials = {
  lines: BomLine[];
  totalShipG: number;
  /** Sum of proposed prices; null lines are excluded and flagged. */
  priceNzd: number;
  quotedLines: number;
  basis: 'proposed — pre-quote, incl. GST';
};

export type FitStatus = 'unconfirmed' | 'fits' | 'too_wide' | 'too_tall' | 'door_too_thick' | 'door_no_gap';

export type FitCheck = {
  status: FitStatus;
  requiredWidthMm: number;
  requiredHeightMm: number;
  standoffMm: number;
  notes: string[];
};

export type PlacementIssue =
  | { kind: 'unknown_product'; handle: string }
  | { kind: 'not_grid_mounted'; handle: string }
  | { kind: 'out_of_bounds'; placementId: string }
  | { kind: 'overlap'; placementId: string; withPlacementId: string };

export const SavedConfigurationSchema = z.object({
  schema: z.literal('assembl.living.configuration/2'),
  status: z.literal('proposed'),
  savedAt: z.string(),
  design: SpaceDesignSchema,
  lines: z.array(
    z.object({
      handle: z.string(),
      sku: z.string().nullable(),
      qty: z.number().int().positive(),
      colour: z.string(),
      printFiles: z.array(z.object({ id: z.string(), qty: z.number().int().positive(), revision: z.string(), sha256: z.string().optional() })),
    }),
  ),
  interface: z.object({ id: z.string(), pack: z.string(), pitchMm: z.number() }),
  fit: z.object({ status: z.string(), requiredWidthMm: z.number(), requiredHeightMm: z.number() }),
  price: z.object({ nzd: z.number(), quotedLines: z.number(), basis: z.string() }),
  purchasing: z.object({ channel: z.literal('shopify'), status: z.literal('not_enabled'), reason: z.string() }),
});
export type SavedConfiguration = z.infer<typeof SavedConfigurationSchema>;

/** Future Shopify handoff shape. Typed now so nothing improvises it later. */
export type ShopifyCartLine = { handle: string; sku: string | null; quantity: number; attributes: Record<string, string> };
