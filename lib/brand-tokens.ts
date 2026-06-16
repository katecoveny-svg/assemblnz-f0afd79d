import type { KeteSlug } from './kete';

export const BRAND_COLORS = {
  pounamu: '#2B6B57',
  goldThread: '#D4A853',
  paper: '#FAF7F2',
  ink: '#23211F',
  clay: '#AC5838',
  cloud: '#E8E4DE',
  sand: '#B8B2A8',
} as const;

export const KETE_ACCENTS: Record<KeteSlug, string> = {
  waihanga: '#2B6B57',
  manaaki: '#AC5838',
  pikau: '#255F94',
  arataki: '#8F4F13',
  auaha: '#5B4FA0',
  ako: '#6B5843',
  matauranga: '#3D5A7A',
  hoko: '#7B3F8F',
  toro: '#23211F',
};

// On-brand vessel renders — the locked cream/sage/gold stacked-disc form in a
// brass wire frame, with only a subtle per-kete tonal hint. This is the
// `heroes-vessel` set used on the kete detail pages; the grid, command palette,
// and marketplace rail all share it so every kete card reads as one brand.
export const KETE_VESSEL_IMAGES: Record<KeteSlug, string> = {
  waihanga: '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg',
  manaaki: '/img/kete/heroes-vessel/manaaki-hero-vessel.jpg',
  pikau: '/img/kete/heroes-vessel/pikau-hero-vessel.jpg',
  arataki: '/img/kete/heroes-vessel/arataki-hero-vessel.jpg',
  auaha: '/img/kete/heroes-vessel/auaha-hero-vessel.jpg',
  ako: '/img/kete/heroes-vessel/ako-hero-vessel.jpg',
  matauranga: '/img/kete/heroes-vessel/matauranga-hero-vessel.jpg',
  hoko: '/img/kete/heroes-vessel/hoko-hero-vessel.jpg',
  toro: '/img/kete/heroes-vessel/toro-hero-vessel.jpg',
};
