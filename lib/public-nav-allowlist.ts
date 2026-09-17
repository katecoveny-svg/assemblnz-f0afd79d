/**
 * Public site link allowlist — Kate nav lock 2026-09-17 (+ live inventory).
 *
 * ALLOWED primary destinations only:
 *   1. Home (/) — WorldScene fly-through
 *   2. Studio (/creative-studio) — real Studio door
 *   3. Pursuit — ChatGPT hub only (never playground / maker)
 *   4. Meeting DO (/do/meetings)
 *   5. Household DO (/do/household) — generic DEMO
 *   6. Public /do hub (Meeting + Household cards only)
 *
 * FORBIDDEN: office/tasks/family/builder shelves, Personal/Inbox/Writing,
 * playground, partner maker, floating purple-D as public promo.
 */

import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';

/** Canonical Pursuit hub — external ChatGPT workspace (never playground). */
export const PUBLIC_PURSUIT_HUB = PURSUIT_SITE_ORIGIN;

export const PUBLIC_NAV_ALLOWLIST = [
  { id: 'home', label: 'assembl', href: '/', external: false },
  {
    id: 'pursuit',
    label: 'Pursuit',
    href: PUBLIC_PURSUIT_HUB,
    external: true,
  },
  { id: 'studio', label: 'Studio', href: '/creative-studio', external: false },
  { id: 'do', label: 'DO', href: '/do', external: false },
] as const;

export const PUBLIC_DO_ENTRIES = [
  { id: 'meeting', label: 'Meeting DO', href: '/do/meetings' },
  { id: 'household', label: 'Household DO', href: '/do/household' },
] as const;

/** In-repo routes that must not be primary public destinations. */
export const FORBIDDEN_PUBLIC_DESTINATIONS = [
  '/pursuit',
  '/pursuit/playground',
  '/studio',
  '/studio/do-maker',
  '/do/maker/partner',
  '/do/family',
  '/do/bills',
  '/do/builder',
  '/do/office',
  '/do/tasks',
  '/do/connections',
  '/do/sponsored',
  '/do/browser',
] as const;

export function isExternalPublicHref(href: string): boolean {
  return href.startsWith('https://') || href.startsWith('http://');
}

export function assertNoForbiddenPublicHref(source: string, label: string): string[] {
  const errors: string[] = [];
  for (const dest of FORBIDDEN_PUBLIC_DESTINATIONS) {
    if (
      source.includes(`href="${dest}"`) ||
      source.includes(`href={'${dest}'}`) ||
      source.includes(`href={"${dest}"}`)
    ) {
      errors.push(`${label}: forbidden public href ${dest}`);
    }
  }
  if (/href=["']\/pursuit\/playground/.test(source)) {
    errors.push(`${label}: forbidden /pursuit/playground CTA`);
  }
  if (/href=["']\/studio\/do-maker/.test(source) || /partnerMakerHref\(/.test(source)) {
    errors.push(`${label}: forbidden Task DO Maker / partner maker CTA`);
  }
  return errors;
}
