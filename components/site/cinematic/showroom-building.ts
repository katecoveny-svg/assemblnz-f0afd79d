/**
 * The gallery hall — authored headlessly in Pascal Editor's scene engine
 * (github.com/pascalorg/editor, MIT) and converted to plain box specs.
 * Source scene: ~/pascal-editor/packages/mcp/spike-scene.json — open it in
 * their editor to redesign the building, then re-run spike-gallery.ts.
 * Plan: long hall walls x ±8.5 (z +6…−58), entry stubs, splayed apse
 * narrowing to the portal at z −66, pilaster pairs at each bay boundary.
 */
export const BUILDING_WALLS: ReadonlyArray<{
  cx: number; cy: number; cz: number; len: number; h: number; t: number; rotY: number;
}> = [
  { cx: -8.500, cy: 5.000, cz: -26.000, len: 64.000, h: 10.000, t: 0.400, rotY: 1.57080 },
  { cx: 8.500, cy: 5.000, cz: -26.000, len: 64.000, h: 10.000, t: 0.400, rotY: 1.57080 },
  { cx: -5.500, cy: 5.000, cz: 6.000, len: 6.000, h: 10.000, t: 0.400, rotY: 0.00000 },
  { cx: 5.500, cy: 5.000, cz: 6.000, len: 6.000, h: 10.000, t: 0.400, rotY: 0.00000 },
  { cx: -5.950, cy: 5.000, cz: -62.000, len: 9.487, h: 10.000, t: 0.400, rotY: 1.00326 },
  { cx: 5.950, cy: 5.000, cz: -62.000, len: 9.487, h: 10.000, t: 0.400, rotY: 2.13833 },
  { cx: -2.650, cy: 5.000, cz: -66.000, len: 1.500, h: 10.000, t: 0.400, rotY: 0.00000 },
  { cx: 2.650, cy: 5.000, cz: -66.000, len: 1.500, h: 10.000, t: 0.400, rotY: 0.00000 },
  { cx: -8.050, cy: 5.000, cz: -4.300, len: 0.900, h: 10.000, t: 0.350, rotY: 0.00000 },
  { cx: 8.050, cy: 5.000, cz: -4.300, len: 0.900, h: 10.000, t: 0.350, rotY: -3.14159 },
  { cx: -8.050, cy: 5.000, cz: -12.900, len: 0.900, h: 10.000, t: 0.350, rotY: 0.00000 },
  { cx: 8.050, cy: 5.000, cz: -12.900, len: 0.900, h: 10.000, t: 0.350, rotY: -3.14159 },
  { cx: -8.050, cy: 5.000, cz: -21.500, len: 0.900, h: 10.000, t: 0.350, rotY: 0.00000 },
  { cx: 8.050, cy: 5.000, cz: -21.500, len: 0.900, h: 10.000, t: 0.350, rotY: -3.14159 },
  { cx: -8.050, cy: 5.000, cz: -30.100, len: 0.900, h: 10.000, t: 0.350, rotY: 0.00000 },
  { cx: 8.050, cy: 5.000, cz: -30.100, len: 0.900, h: 10.000, t: 0.350, rotY: -3.14159 },
  { cx: -8.050, cy: 5.000, cz: -38.700, len: 0.900, h: 10.000, t: 0.350, rotY: 0.00000 },
  { cx: 8.050, cy: 5.000, cz: -38.700, len: 0.900, h: 10.000, t: 0.350, rotY: -3.14159 },
];
