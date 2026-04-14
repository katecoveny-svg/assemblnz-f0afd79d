import type { KeteType, HeroVariant, TimeOfDay, DEFAULT_KETE_ORDER } from './types';

const HERO_VARIANTS: Record<KeteType, HeroVariant> = {
  waihanga: {
    eyebrow: 'CONSTRUCTION · AOTEAROA',
    headline: 'Your construction compliance team, always on.',
    subheadline: 'Payment claims, site safety, consent tracking — handled before you ask.',
    cta: 'See Waihanga in action',
    ctaLink: '/waihanga/about',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
  manaaki: {
    eyebrow: 'HOSPITALITY · AOTEAROA',
    headline: 'Your hospitality ops team, always on.',
    subheadline: 'Food safety, liquor licensing, staff scheduling — handled before you ask.',
    cta: 'See Manaaki in action',
    ctaLink: '/manaaki',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
  auaha: {
    eyebrow: 'CREATIVE & MEDIA · AOTEAROA',
    headline: 'Your creative studio, always producing.',
    subheadline: 'Content, campaigns, brand compliance — brief to published without the bottleneck.',
    cta: 'See Auaha in action',
    ctaLink: '/auaha/about',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
  arataki: {
    eyebrow: 'AUTOMOTIVE · AOTEAROA',
    headline: 'Your dealership ops, always moving.',
    subheadline: 'Enquiry to delivery to service — no handoff dropped across the customer journey.',
    cta: 'See Arataki in action',
    ctaLink: '/arataki',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
  pikau: {
    eyebrow: 'FREIGHT & CUSTOMS · AOTEAROA',
    headline: 'Your customs desk, always compliant.',
    subheadline: 'Declarations, tariff codes, biosecurity clearance — border compliance without the scramble.',
    cta: 'See Pikau in action',
    ctaLink: '/pikau',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
  toro: {
    eyebrow: 'WHĀNAU · AOTEAROA',
    headline: 'Your family command centre, always ready.',
    subheadline: 'School notices, kai plans, appointments, budgets — just text.',
    cta: 'See Toro in action',
    ctaLink: '/toroa',
    secondaryCta: 'See pricing',
    secondaryCtaLink: '/pricing',
  },
};

const DEFAULT_HERO: HeroVariant = {
  eyebrow: 'GOVERNED WORKFLOWS · AOTEAROA',
  headline: 'The operating system for NZ business.',
  subheadline: 'Quoting, payroll, compliance, marketing — connected and intelligent. One platform instead of twelve.',
  cta: 'See it in action',
  ctaLink: '/contact',
  secondaryCta: 'See pricing',
  secondaryCtaLink: '/pricing',
};

export function getHeroVariant(industry: KeteType | null): HeroVariant {
  if (!industry) return DEFAULT_HERO;
  return HERO_VARIANTS[industry] || DEFAULT_HERO;
}

export function getKeteOrder(industry: KeteType | null): KeteType[] {
  const defaultOrder: KeteType[] = ['manaaki', 'waihanga', 'auaha', 'arataki', 'pikau', 'toro'];
  if (!industry) return defaultOrder;

  // Move detected industry to front, related industries next
  const RELATED: Record<KeteType, KeteType[]> = {
    waihanga: ['pikau', 'arataki'],
    manaaki: ['auaha', 'toro'],
    auaha: ['manaaki', 'arataki'],
    arataki: ['waihanga', 'auaha'],
    pikau: ['waihanga', 'arataki'],
    toro: ['manaaki', 'auaha'],
  };

  const related = RELATED[industry] || [];
  const rest = defaultOrder.filter(k => k !== industry && !related.includes(k));
  return [industry, ...related, ...rest];
}

export function getCtaVariant(timeOfDay: TimeOfDay, industry: KeteType | null): string {
  if (timeOfDay === 'dawn') return 'Book a walkthrough';
  if ((timeOfDay === 'evening' || timeOfDay === 'night') && industry === 'toro') return 'Try Toro free';
  return 'See it in action';
}
