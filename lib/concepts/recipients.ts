/**
 * Per-recipient personalisation for private concept links.
 *
 * A private link like `/customers/everyday-rewards/assembled?for=oliver-lynch`
 * greets the named executive on arrival. Recipient names live only on these
 * gated, noindex concept surfaces (same posture as the demo_invites layer) —
 * never on a public route. An unknown or missing `for` falls back to a neutral
 * greeting so the page always works.
 */

export type Recipient = {
  slug: string;
  firstName: string;
  fullName: string;
  role: string;
  org: string;
};

/** Woolworths / Everyday Rewards outreach recipients. */
export const RECIPIENTS: Record<string, Recipient> = {
  'oliver-lynch': {
    slug: 'oliver-lynch',
    firstName: 'Oliver',
    fullName: 'Oliver Lynch',
    role: 'Everyday Rewards leadership',
    org: 'Woolworths New Zealand',
  },
};

export type ResolvedRecipient = Recipient & { personalised: boolean };

const NEUTRAL: ResolvedRecipient = {
  slug: '',
  firstName: 'there',
  fullName: '',
  role: 'Everyday Rewards leadership',
  org: 'Woolworths New Zealand',
  personalised: false,
};

/** Resolve a `?for=` slug to a recipient, or a neutral fallback. */
export function recipientFor(slug?: string | null): ResolvedRecipient {
  if (!slug) return NEUTRAL;
  const key = slug.trim().toLowerCase();
  const found = RECIPIENTS[key];
  return found ? { ...found, personalised: true } : NEUTRAL;
}
