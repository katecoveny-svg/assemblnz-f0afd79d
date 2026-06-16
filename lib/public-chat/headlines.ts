import type { KeteSlug } from '@/lib/kete';

export const KETE_C_HEADLINES: Partial<Record<KeteSlug, string>> = {
  toro: 'Whānau life sorted before the week starts.',
  ako: 'Tamariki centred. Compliance covered.',
  arataki: 'Workshop and fleet docs that hold up to audit.',
  auaha: 'Creative briefs your team can actually use.',
  hoko: 'Retail returns and CGA replies, drafted right.',
  matauranga: 'NCEA reporting, attendance, board minutes — drafted from your records.',
};

export function keteHeadline(kete: string): string {
  return KETE_C_HEADLINES[kete as KeteSlug] ?? '';
}
