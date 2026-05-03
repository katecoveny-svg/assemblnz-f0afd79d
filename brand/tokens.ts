export const brand = {
  colors: {
    paper: '#FAF7F2',
    ink: '#23211F',
    pounamu: '#2B6B57',
    clay: '#AC5838',
    mist: '#E8E4DE',
    shadow: '#B8B2A8',
  },
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
  font: {
    headline: 'Cormorant Garamond',
    body: 'Inter',
    mono: 'IBM Plex Mono',
  },
} as const;

export function keteAccent(kete: keyof typeof brand.keteMapping): string {
  const token = brand.keteMapping[kete];
  return brand.kete[token as keyof typeof brand.kete];
}
