import type { KeteSlug } from './kete';

export const KETE_COMPLIANCE: Record<KeteSlug, string[]> = {
  waihanga: ['Building Act 2004', 'H&S at Work Act 2015', 'LBP Licensing', 'Consenting Authority Rules'],
  manaaki: ['Sale & Supply of Alcohol Act 2012', 'Food Act 2014', 'H&S at Work Act 2015', 'Privacy Act 2020'],
  pikau: ['Customs & Excise Act 2018', 'Biosecurity Act 1993', 'IMO IMDG', 'Maritime NZ'],
  arataki: ['LTSA', 'WoF/CoF', 'RUC', 'Driver Hours'],
  auaha: ['Copyright Act 1994', 'Privacy Act 2020', 'Te Tiriti o Waitangi'],
  ako: ['Education & Training Act 2020', 'MOE Funding Rules', 'Privacy Act 2020', 'Vulnerable Children Act'],
  matauranga: ['NCEA Rules', 'Education & Training Act 2020', 'Privacy Act 2020'],
  hoko: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986', 'Privacy Act 2020'],
  toro: ['Privacy Act 2020', 'Te Tiriti o Waitangi'],
};

