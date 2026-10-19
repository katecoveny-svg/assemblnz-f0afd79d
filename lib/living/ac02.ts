/**
 * assembl / living — AC-02 digital prototypes
 * -------------------------------------------
 * The AC-02 CAD delivery (19 October 2026): 109 native parts and 18 assembled
 * views with CadQuery source, checks and hashes, bundled here as the slim
 * manifest `tools/living-cad/ac02/slim.py` derives. Everything in it is a
 * digital prototype: unprinted, not approved for manufacture, not for sale.
 * The wall parts are a *candidate* reconstruction of the TURN interface; the
 * v0.3 TURN library in `cad-manifest.json` stays canonical.
 */

import { z } from 'zod';
import slim from './ac02-manifest.json';

export const Ac02PartSchema = z.object({
  id: z.string(),
  group: z.enum(['wall', 'desk', 'objects', 'storage', 'dayrally', 'mini-bikes']),
  description: z.string(),
  revision: z.string(),
  release: z.string(),
  material: z.string(),
  bboxMm: z.array(z.number()).length(3),
  volumeCm3: z.number(),
  massG: z.number(),
  watertight: z.boolean(),
  stlSha256: z.string().length(64),
  stepSha256: z.string().length(64),
  notes: z.string(),
});
export type Ac02Part = z.infer<typeof Ac02PartSchema>;

export const Ac02AssemblySchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string(),
  notes: z.string(),
  revision: z.string(),
  release: z.string(),
  approvedForManufacture: z.literal(false),
  boundsMm: z.array(z.number()).length(3),
  glb: z.string(),
  preview: z.string(),
  components: z.array(z.object({ partId: z.string(), instance: z.string(), colour: z.string() })),
});
export type Ac02Assembly = z.infer<typeof Ac02AssemblySchema>;

export const Ac02ManifestSchema = z.object({
  schema: z.literal('assembl.living.ac02-slim/1'),
  revision: z.string(),
  release: z.string(),
  approvedForManufacture: z.literal(false),
  interfaces: z.record(z.string(), z.string()),
  labels: z.record(z.string(), z.string()),
  summary: z.record(z.string(), z.unknown()),
  parts: z.array(Ac02PartSchema),
  assemblies: z.array(Ac02AssemblySchema),
});

export const AC02 = Ac02ManifestSchema.parse(slim);
export const AC02_HANDLE_PREFIX = 'ac02-';

const PART_BY_ID = new Map(AC02.parts.map((p) => [p.id, p]));
export function ac02Part(id: string): Ac02Part | undefined {
  return PART_BY_ID.get(id);
}
export function ac02Assembly(id: string): Ac02Assembly | undefined {
  return AC02.assemblies.find((a) => a.id === id);
}

/** Parts whose geometry carries a name: the README's rebuild labels (`--name`, `--pet-name`, `--wall-label`). */
export const AC02_LETTERED: Record<string, { label: string; maxChars: number }> = {
  'wall-name-panel': { label: 'Wall label', maxChars: 14 },
  'rally-name-skin': { label: 'Name', maxChars: 14 },
  'mini-flow-display-base': { label: 'Name', maxChars: 14 },
  'mini-drop-display-base': { label: 'Name', maxChars: 14 },
  'mini-ridge-display-base': { label: 'Name', maxChars: 14 },
  'pet-name-tag': { label: 'Pet name', maxChars: 14 },
};

/** Component quantities per part for an assembled view. */
export function ac02Lines(a: Ac02Assembly): { partId: string; qty: number }[] {
  const acc = new Map<string, number>();
  for (const c of a.components) acc.set(c.partId, (acc.get(c.partId) ?? 0) + 1);
  return [...acc.entries()].map(([partId, qty]) => ({ partId, qty }));
}

/** The designed colour most components share is the body; every other component is the accent. */
export function ac02Roles(a: Ac02Assembly): { body: string; accentParts: Set<string> } {
  const count = new Map<string, number>();
  for (const c of a.components) count.set(c.colour, (count.get(c.colour) ?? 0) + 1);
  const body = [...count.entries()].sort((x, y) => y[1] - x[1])[0][0];
  return { body, accentParts: new Set(a.components.filter((c) => c.colour !== body).map((c) => c.partId)) };
}
