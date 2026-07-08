/**
 * lib/home-copy.ts — EVERY word on the homepage lives here.
 *
 * Kate: edit any string in this file and the homepage updates — no component
 * code involved. Rules from DIRECTION-LOCKED-2026-07-01:
 *   - lowercase display copy (the CSS lowercases headings automatically)
 *   - hero: never more than 2 lines, sentences under 8 words
 *   - no bare "AI", no fabricated numbers, macrons correct (Tōro, Pīkau…)
 *
 * Locked copy (howItWorksHeadline, evidencePackHeadline, trustStrip,
 * footerDisclaimer, pipeline stages) stays in lib/site-config.ts — the
 * homepage reads it from there so the locked lines are never forked.
 */

import type { KeteSlug } from './kete';

export const homeCopy = {
  hero: {
    eyebrow: 'built in aotearoa',
    // Two lines, rendered word by word. Keep each line short.
    headlineLine1: ['purpose-built', 'agents.'],
    headlineLine2: ['limitless', 'potential'],
    lede: 'Agents draft the work. Your people sign it off. Proof ships with every output.',
    ctaPrimary: { label: 'browse agents', href: '/agents' },
    ctaSecondary: { label: 'how it works', href: '/how-it-works' },
    // Text-only trust line (locked direction: no client logos until earned).
    trustLine: 'trusted by teams across aotearoa',
    stats: {
      agents: 'agents live',
      collections: 'collections',
      tools: 'free tools',
    },
  },

  collections: {
    eyebrow: 'collections',
    headline: 'one front door per industry',
    lede: 'Pick a collection. The right specialists come with it.',
    link: { label: 'explore the marketplace', href: '/agents' },
  },

  pipeline: {
    eyebrow: 'how it works',
    // Headline itself is the locked reo.howItWorksHeadline from site-config.
    link: { label: 'see the full pipeline', href: '/how-it-works' },
  },

  evidence: {
    eyebrow: 'the evidence pack',
    // Headline is the locked reo.evidencePackHeadline from site-config.
    lede: 'Every job ends in a signed, sealed record. File it, forward it, footnote it.',
    link: { label: 'how we earn trust', href: '/trust' },
  },

  workflows: {
    eyebrow: 'live today',
    headline: 'one job in. minutes back',
    lede: 'Real workflows, built on NZ legislation. Each one ends in a record you can file.',
    link: { label: 'browse all workflows', href: '/workflows' },
    savesLabel: (min: number) => `saves ~${min} min`,
  },

  kete: {
    eyebrow: 'the nine kete',
    headline: 'nine kete. one standard of proof',
    lede: 'Every pack runs on the same rails — Privacy Act 2020 controls, audit trails, signed receipts.',
    link: { label: 'see every kete', href: '/kete' },
  },

  closing: {
    headlineLine1: 'bring one workflow.',
    headlineLine2: 'leave with proof',
    ctaPrimary: { label: 'browse agents', href: '/agents' },
    ctaSecondary: { label: 'book a demo', href: '/contact' },
  },
} as const;

/**
 * Homepage one-liners per kete — short and concrete (the full taglines in
 * lib/kete.ts stay on the kete pages). Lowercase on purpose: card copy is
 * lowercase across the marketplace surfaces.
 */
export const keteOneLiners: Record<KeteSlug, string> = {
  waihanga: 'consents, RFIs, variations — council-ready.',
  manaaki: 'licences, food safety, incident logs.',
  pikau: 'tariff codes and clean customs entries.',
  arataki: 'WoF, CoF and fleet governance.',
  auaha: 'brand-safe copy, captions, campaigns.',
  ako: 'licensing, ratios, whānau notices.',
  matauranga: 'NCEA tracking and source checks.',
  hoko: 'CGA-safe returns and disclosures.',
  toro: 'school, money, routines — sorted.',
};
