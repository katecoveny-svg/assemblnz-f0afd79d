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
  pikau: '#3B7CB5',
  arataki: '#D4842A',
  auaha: '#5B4FA0',
  ako: '#6B5843',
  matauranga: '#3D5A7A',
  hoko: '#7B3F8F',
  toro: '#23211F',
};

export const KETE_VESSEL_IMAGES: Record<KeteSlug, string> = {
  waihanga: '/img/kete/waihanga-vessel.jpg',
  manaaki: '/img/kete/manaaki-vessel-warm.jpg',
  pikau: '/img/kete/pikau-vessel-blue.jpg',
  arataki: '/img/kete/arataki-vessel-amber.jpg',
  auaha: '/img/kete/auaha-vessel-purple.jpg',
  ako: '/img/kete/ako-vessel-amber.jpg',
  matauranga: '/img/kete/matauranga-vessel-tall.jpg',
  hoko: '/img/kete/hoko-vessel-violet.jpg',
  toro: '/img/kete/toro-vessel-charcoal.jpg',
};
