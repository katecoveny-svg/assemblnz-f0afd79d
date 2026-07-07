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
 * POI anchors, in world space, tuned to the REAL 16C model (villa-16a.glb) after
 * it is recentred to the origin in WalkCanvas (group at [-5.4, 0, 3.0], scale 1,
 * so the building runs X ≈ -5.3…+5.3 east–west, Z ≈ -2.9 north to +2.9 south,
 * ridge at y ≈ 3.2). Each ARC insight floats at the spatial moment it belongs
 * to — the boundary, the side setback, the north roofline, an interior corner,
 * the living wall, the south cladding face, the entry deck. Kept just off the
 * surface so the eye markers read as a layer hovering *over* the architecture.
 */
export const POI_ANCHORS = {
  teAranga: [-6.9, 1.0, 1.7], // outside the west boundary, before the building
  zoneRules: [6.3, 2.5, -1.3], // the east side setback line, up high
  h1Energy: [0.2, 2.7, -3.3], // the north roofline / clerestory glazing
  consentMemo: [-3.7, 1.2, -1.1], // the office corner, inside
  precedent: [3.3, 1.4, -0.9], // the interior living wall / mantel
  materials: [-1.9, 1.5, 3.1], // the south cladding face
  rfi: [0.9, 0.6, 4.4], // the entry deck / site-meeting scene
} as const;

export type PoiId = keyof typeof POI_ANCHORS;

export const PHASES = ['consent', 'concept', 'construction', 'complete'] as const;
export type Phase = (typeof PHASES)[number];
