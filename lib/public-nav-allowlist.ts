/**
 * Public site link allowlist — Kate nav lock 2026-09-17; DO shelf paused same day.
 *
 * ALLOWED primary destinations only:
 *   1. Home (/) — WorldScene fly-through
 *   2. Studio (/creative-studio) — real Studio door
 *   3. Pursuit (/pursuit) — public story; working hub remains external ChatGPT
 *   4. Public /do holding page (no Meeting/Household shelf)
 *
 * FORBIDDEN as public CTAs: in-repo Pursuit maker/playground, partner Mode A/B,
 * Personal/Inbox/Bills/Writing shelves, purple DO branding, private household install,
 * Meeting DO / Household DO as the public product face.
 */

import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';

/** Working Pursuit hub — external ChatGPT only. Landing story is /pursuit. */
export const PUBLIC_PURSUIT_HUB = PURSUIT_SITE_ORIGIN;

export const PUBLIC_NAV_ALLOWLIST = [
  { id: 'home', label: 'assembl', href: '/', external: false },
  {
    id: 'pursuit',
    label: 'Pursuit',
    href: '/pursuit',
    external: false,
  },
  { id: 'studio', label: 'Studio', href: '/creative-studio', external: false },
  { id: 'do', label: 'DO', href: '/do', external: false },
] as const;

/** Public DO entries — empty while the try-it shelf is paused. */
export const PUBLIC_DO_ENTRIES = [] as const;

/** In-repo routes that must not be primary public destinations. */
export const FORBIDDEN_PUBLIC_DESTINATIONS = [
  '/pursuit/playground',
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
  '/do/meetings',
  '/do/household',
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
  // Catch relative playground / maker CTA strings without full path attribute forms.
  if (/href=["']\/pursuit\/playground/.test(source)) {
    errors.push(`${label}: forbidden /pursuit/playground CTA`);
  }
  if (/href=["']\/studio\/do-maker/.test(source) || /partnerMakerHref\(/.test(source)) {
    errors.push(`${label}: forbidden Task DO Maker / partner maker CTA`);
  }
  return errors;
}
