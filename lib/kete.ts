export type KeteSlug =
  | 'waihanga'
  | 'manaaki'
  | 'pikau'
  | 'arataki'
  | 'auaha'
  | 'ako'
  | 'matauranga'
  | 'hoko'
  | 'toro';

export type Kete = {
  slug: KeteSlug;
  name: string;
  englishName: string;
  meaning: string;
  industry: string;
  tagline: string;
  accent: string;
  accentName: string;
  /**
   * "industry" — one of the eight industry kete available in the
   *   Industry Pack flat-rate offer.
   * "whanau" — Tōro, sold standalone on the Tōro Family plan.
   */
  type: 'industry' | 'whanau';
  status: 'active' | 'coming-soon' | 'mothballed';
  heroImage: string;
};

export const KETES: Kete[] = [
  {
    slug: 'waihanga',
    name: 'Waihanga',
    englishName: 'Construction pack',
    meaning: 'to build or create',
    industry: 'Construction',
    tagline: 'Fewer reworked consents. Faster council sign-off. Stronger audit trails.',
    accent: '#2B6B57',
    accentName: 'Pounamu',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg',
  },
  {
    slug: 'manaaki',
    name: 'Manaaki',
    englishName: 'Hospitality pack',
    meaning: 'to care for or host',
    industry: 'Hospitality',
    tagline: 'From liquor licensing to food safety — compliance that does not slow your kitchen down.',
    accent: '#AC5838',
    accentName: 'Kōkōwai',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/manaaki-hero-vessel.jpg',
  },
  {
    slug: 'pikau',
    name: 'Pīkau',
    englishName: 'Freight and customs pack',
    meaning: 'to carry or bear a load',
    industry: 'Logistics',
    tagline: 'The audit trail your broker needs.',
    accent: '#255F94',
    accentName: 'Kikorangi',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/pikau-hero-vessel.jpg',
  },
  {
    slug: 'arataki',
    name: 'Arataki',
    englishName: 'Automotive and fleet pack',
    meaning: 'to guide or lead',
    industry: 'Automotive & Fleet',
    tagline: 'Workshop floor, fleet office, dealer governance — WoF, CoF, CGA, and IPP 3A in one trail.',
    accent: '#8F4F13',
    accentName: 'Karaka',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/arataki-hero-vessel.jpg',
  },
  {
    slug: 'auaha',
    name: 'Auaha',
    englishName: 'Creative workflow pack',
    meaning: 'to create or innovate',
    industry: 'Creative',
    tagline: 'Brand work that is compliant by default.',
    accent: '#5B4FA0',
    accentName: 'Kahurangi',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/auaha-hero-vessel.jpg',
  },
  {
    slug: 'ako',
    name: 'Ako',
    englishName: 'Education pack',
    meaning: 'to learn and teach',
    industry: 'Education',
    tagline: 'Compliance that protects tamariki — Te Whāriki, ratios, kaiako, ERO.',
    accent: '#6B5843',
    accentName: 'Parauri',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/ako-hero-vessel.jpg',
  },
  {
    slug: 'matauranga',
    name: 'Mātauranga',
    englishName: 'Knowledge and research pack',
    meaning: 'knowledge or understanding',
    industry: 'Knowledge',
    tagline: 'NCEA L1–3 weekly reporting and Achievement Standards tracking for school operators.',
    accent: '#3D5A7A',
    accentName: 'Pōuriuri',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/matauranga-hero-vessel.jpg',
  },
  {
    slug: 'hoko',
    name: 'Hoko',
    englishName: 'Commerce pack',
    meaning: 'to trade, buy, or sell',
    industry: 'Commerce',
    tagline: 'Consumer protection compliance for NZ retailers.',
    accent: '#7B3F8F',
    accentName: 'Waiporoporo',
    type: 'industry',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/hoko-hero-vessel.jpg',
  },
  {
    slug: 'toro',
    name: 'Tōro',
    englishName: 'Family organiser',
    meaning: 'to reach out or explore',
    industry: 'Family',
    tagline: 'The family assistant for school, money, routines, and the week ahead.',
    accent: '#23211F',
    accentName: 'Mangū',
    type: 'whanau',
    status: 'active',
    heroImage: '/img/kete/heroes-vessel/toro-hero-vessel.jpg',
  },
];

export const INDUSTRY_KETES = KETES.filter((k) => k.type === 'industry');
export const WHANAU_KETE = KETES.find((k) => k.type === 'whanau')!;

export function getKete(slug: KeteSlug): Kete {
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) throw new Error(`Unknown kete: ${slug}`);
  return kete;
}
