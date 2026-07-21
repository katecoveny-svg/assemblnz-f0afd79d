/**
 * The chrome family — one material language for every part in the assembly.
 *
 * Kate's call (2026-07-20): five different materials read as a junk drawer.
 * Every satellite part is now the SAME polished metal, differentiated only by
 * silhouette and a tint. That's what makes them look like a kit that belongs
 * to one machine rather than objects that happened to land together.
 *
 * The obsidian core is deliberately NOT in this family — it's the one thing
 * that should look different, because it's the thing everything else serves.
 */
export const CHROME = {
  /** Cool blue-silver — memory. */
  memory: '#C4D2DB',
  /** Warm champagne — knowledge (ties the assembly to the brand accent). */
  knowledge: '#D8C5A6',
  /** Bright neutral — abilities. */
  abilities: '#E6EAED',
  /** Gunmetal — voice. */
  voice: '#8E959B',
} as const;

/** Shared PBR values so every part catches the studio light identically. */
export const CHROME_MATERIAL = {
  metalness: 0.97,
  roughness: 0.09,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  envMapIntensity: 2.0,
} as const;
