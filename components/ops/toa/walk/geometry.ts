/**
 * Shared geometry for the 16A walk-through — one source of truth so the villa
 * model and the POI anchors never drift. Units are metres; the 16C two-bed unit
 * is a ~65 m² single-storey infill with a gable, a living-end deck, and piles
 * that pick up the 380 mm cross-fall on the site.
 *
 * Stand-in typology — NOT Nick's actual drawings. The proportions follow the
 * draft-RC GA plan (two beds + living/kitchen + bath + deck), nothing more.
 */

/** Overall wall envelope (interior floor plate). */
export const FOOTPRINT = { x: 7, z: 9.3 } as const; // 7.0 × 9.3 ≈ 65 m²
export const WALL_H = 2.7; // stud height
export const RIDGE_RISE = 1.7; // gable ridge above the top plate
export const SLOPE_DROP = 0.38; // 380 mm cross-fall, downhill toward -X

/** The living-end deck, cantilevered off +Z (the sunny, downhill corner). */
export const DECK = { x: 3.4, z: 2.6, y: WALL_H * 0 } as const;

/**
 * POI anchors, in world space. Each ARC insight floats at the spatial moment it
 * belongs to — on the boundary, the setback line, the north wall, the desk, the
 * mantel, the cladding, the site-meeting scene. Kept just off the surface so the
 * eye markers read as a layer hovering *over* the architecture, in every phase.
 */
export const POI_ANCHORS = {
  teAranga: [-(FOOTPRINT.x / 2) - 2.6, 0.9, FOOTPRINT.z / 2 + 1.2], // outside, on the boundary
  zoneRules: [FOOTPRINT.x / 2 + 1.9, 2.4, -FOOTPRINT.z / 2 + 1.5], // the side setback line
  h1Energy: [0.6, 1.8, FOOTPRINT.z / 2 + 0.15], // the north (+Z) wall
  consentMemo: [-FOOTPRINT.x / 2 + 1.1, 1.15, -FOOTPRINT.z / 2 + 1.1], // desk, office corner
  precedent: [FOOTPRINT.x / 2 - 0.35, 1.35, -1.4], // interior living wall / mantel
  materials: [-FOOTPRINT.x / 2 - 0.15, 1.5, 1.0], // exterior cladding face
  rfi: [1.4, 0.5, FOOTPRINT.z / 2 + 2.2], // the deck / site-meeting scene
} as const;

export type PoiId = keyof typeof POI_ANCHORS;

export const PHASES = ['consent', 'concept', 'construction', 'complete'] as const;
export type Phase = (typeof PHASES)[number];
