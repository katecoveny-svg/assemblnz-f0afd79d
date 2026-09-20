/**
 * Legacy specialist metadata retained for existing consumers.
 * The 20 September access correction makes /do a task entry point.
 * Meeting and the hosted workspace may be linked; unfinished operator and
 * private-family surfaces stay out of public promotion.
 */

export const PUBLIC_DO_SPECIALISTS = [
  {
    id: 'meeting',
    name: 'Meeting DO',
    href: '/do/meetings',
    glyph: '◎',
    description: 'Record → notes you can use. Actions, decisions, who said what.',
    note: 'Capture audio or paste notes. Turn them into a transcript, then review before any handoff. Drafts only — nothing is sent for you.',
    scope: 'work' as const,
  },
  {
    id: 'household',
    name: 'Household DO',
    href: '/do/household',
    glyph: '⌂',
    description: 'Simple chores board (demo). Not your real household.',
    note: 'Install the public demo template. Fictional names only. Private family installs stay closed here.',
    scope: 'personal' as const,
  },
] as const;

export type PublicDoSpecialist = (typeof PUBLIC_DO_SPECIALISTS)[number];
export type PublicDoSpecialistId = PublicDoSpecialist['id'];

/** Labels that must never appear as public shelf / Glow / home promo cards. */
export const BANNED_PUBLIC_DO_PROMOS = [
  'Personal DO',
  'Inbox DO',
  'Bills DO',
  'Writing DO',
  'Creative DO',
  'Detail DO',
  'Builder DO',
] as const;

/** Destinations that must not be promoted from public shelf/Glow/home CTAs. */
export const BANNED_PUBLIC_DO_HREFS = [
  '/do/family',
  '/do/bills',
  '/do/builder',
  '/do/office',
  '/do/tasks',
  '/do/connections',
  '/do/sponsored',
  '/do/browser',
  '/do/household',
] as const;

/** Reviewed public entry routes. This list grants no authentication or action authority. */
export function isAllowedPublicDoHref(href: string): boolean {
  return ['/do', '/do/widget', '/do/widget?task=plan', '/do/meetings', '/do/install#chrome'].includes(href);
}

/** Scan a public surface source file for banned shelf promos and hrefs. */
export function assertPublicShelfText(source: string, label: string): string[] {
  const errors: string[] = [];
  for (const banned of BANNED_PUBLIC_DO_PROMOS) {
    if (source.includes(banned)) {
      errors.push(`${label}: banned public promo "${banned}"`);
    }
  }
  for (const href of BANNED_PUBLIC_DO_HREFS) {
    if (
      source.includes(`href="${href}"`) ||
      source.includes(`href={'${href}'}`) ||
      source.includes(`href={"${href}"}`)
    ) {
      errors.push(`${label}: banned public href ${href}`);
    }
  }
  return errors;
}
