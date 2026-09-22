/** Public navigation: current main-site product doors and existing private workspaces.
 * The 21 September public DO entry supersedes the earlier hidden-tool shelf rule
 * (docs/context/CURRENT.md): Bills and Meeting DO are allowed. Private workbench,
 * household and partner makers remain outside public promotion.
 */

import { PRODUCT_DESTINATIONS } from '@/lib/product-destinations';

/** Working Pursuit hub — external ChatGPT only. Landing story is /pursuit. */
export const PUBLIC_PURSUIT_HUB = PRODUCT_DESTINATIONS.pursuit.workspace;

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

/** Public DO entries — empty while the try-it shelf is off. */
export const PUBLIC_DO_ENTRIES = [] as const;

/** In-repo routes that must not be primary public destinations. */
export const FORBIDDEN_PUBLIC_DESTINATIONS = [
  '/pursuit/playground',
  '/studio/do-maker',
  '/do/maker/partner',
  '/do/family',
  '/do/builder',
  '/do/office',
  '/do/tasks',
  '/do/connections',
  '/do/sponsored',
  '/do/browser',
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
