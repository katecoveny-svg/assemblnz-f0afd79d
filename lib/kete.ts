export type KeteSlug =
  | 'waihanga'
  | 'manaaki'
  | 'pikau'
  | 'arataki'
  | 'auaha'
  | 'hoko'
  | 'ako'
  | 'toro';

export type Kete = {
  slug: KeteSlug;
  name: string;
  industry: string;
  tagline: string;
  accent: string;
  accentName: string;
  /**
   * "industry" — industry kete (sold via Operator / Leader / Enterprise
   *   Subscribe sub-plans, or à la carte via Pay per output / Pay per resolution).
   * "whanau" — Tōro, sold standalone on the Family Subscribe sub-plan.
   */
  type: 'industry' | 'whanau';
  status: 'active' | 'coming-soon' | 'mothballed';
};

export const KETES: Kete[] = [
  {
    slug: 'waihanga',
    name: 'Waihanga',
    industry: 'Construction',
    tagline: 'Fewer reworked consents. Faster council sign-off. Stronger audit trails.',
    accent: '#2B6B57',
    accentName: 'Pounamu',
    type: 'industry',
    status: 'active',
  },
  {
    slug: 'manaaki',
    name: 'Manaaki',
    industry: 'Hospitality',
    tagline: 'From liquor licensing to food safety — compliance that does not slow your kitchen down.',
    accent: '#AC5838',
    accentName: 'Kōkōwai',
    type: 'industry',
    status: 'coming-soon',
  },
  {
    slug: 'pikau',
    name: 'Pīkau',
    industry: 'Freight & Customs',
    tagline: 'The audit trail your broker needs.',
    accent: '#3B7CB5',
    accentName: 'Kikorangi',
    type: 'industry',
    status: 'active',
  },
  {
    slug: 'arataki',
    name: 'Arataki',
    industry: 'Tourism & Visitor Experience',
    tagline: 'Manaakitanga at scale — for visitor experience operators across Aotearoa.',
    accent: '#D4842A',
    accentName: 'Karaka',
    type: 'industry',
    status: 'coming-soon',
  },
  {
    slug: 'auaha',
    name: 'Auaha',
    industry: 'Creative',
    tagline: 'Brand work that is compliant by default.',
    accent: '#5B4FA0',
    accentName: 'Kahurangi',
    type: 'industry',
    status: 'coming-soon',
  },
  {
    slug: 'hoko',
    name: 'Hoko',
    industry: 'Retail',
    tagline: 'Consumer protection compliance for NZ retailers.',
    accent: '#7B3F8F',
    accentName: 'Waiporoporo',
    type: 'industry',
    status: 'mothballed',
  },
  {
    slug: 'ako',
    name: 'Ako',
    industry: 'Early Childhood Education',
    tagline: 'Compliance that protects tamariki — Te Whāriki, ratios, kaiako, ERO.',
    accent: '#6B5843',
    accentName: 'Parauri',
    type: 'industry',
    status: 'coming-soon',
  },
  {
    slug: 'toro',
    name: 'Tōro',
    industry: 'Whānau',
    tagline: 'Your family\'s quiet assistant.',
    accent: '#23211F',
    accentName: 'Mangū',
    type: 'whanau',
    status: 'active',
  },
];

export const INDUSTRY_KETES = KETES.filter((k) => k.type === 'industry');
export const WHANAU_KETE = KETES.find((k) => k.type === 'whanau')!;

export function getKete(slug: KeteSlug): Kete {
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) throw new Error(`Unknown kete: ${slug}`);
  return kete;
}
