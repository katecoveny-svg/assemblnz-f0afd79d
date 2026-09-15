/**
 * Assembl company brand tokens.
 *
 * Canonical human-readable source: docs/assembl-brand-system.md
 * Machine routing source: config/context-manifest.json
 *
 * IMPORTANT: older kete colours remain below for compatibility with legacy
 * surfaces. They are not the Assembl company master palette and must not be
 * used as precedent for new company/product work.
 */
export const brand = {
  colors: {
    deepPlum: '#240B21',
    mutedPlum: '#654A4E',
    dustyRose: '#916A70',
    chalk: '#F5F1F2',
    paper: '#FFFDFB',
    ink: '#240B21',

    // Legacy compatibility tokens — do not use for new Assembl company work.
    pounamu: '#2B6B57',
    clay: '#AC5838',
    mist: '#E8E4DE',
    shadow: '#B8B2A8',
  },
  font: {
    headline: 'Instrument Sans',
    body: 'Instrument Sans',
    mono: 'IBM Plex Mono',
  },
  // Historical kete accents. These are scoped product/legacy accents, not
  // the master company palette.
  kete: {
    pounamu: '#2B6B57',
    kokowai: '#AC5838',
    karaka: '#D4842A',
    kikorangi: '#3B7CB5',
    kahurangi: '#5B4FA0',
    waiporoporo: '#7B3F8F',
    parauri: '#6B5843',
    mangu: '#23211F',
  },
  keteMapping: {
    waihanga: 'pounamu',
    manaaki: 'kokowai',
    auaha: 'kahurangi',
    arataki: 'karaka',
    pikau: 'kikorangi',
    hoko: 'waiporoporo',
    ako: 'parauri',
    toro: 'mangu',
  },
} as const;

export function keteAccent(kete: keyof typeof brand.keteMapping): string {
  const token = brand.keteMapping[kete];
  return brand.kete[token as keyof typeof brand.kete];
}
