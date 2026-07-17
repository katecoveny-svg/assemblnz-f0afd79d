/**
 * Family Genome — the Family OS household's single source of truth.
 *
 * The same Business Genome shape the flagship tenants use (one row per fact
 * in `living_site_genome`, tenant 'family'), read by the gated family
 * console. Edit a fact once and every reader renders the new value.
 *
 * SAMPLE only — this is the FICTIONAL demo household (the placeholder
 * roster the console shows prospects). No real names, schools, homes or
 * medical details belong here; the private lib/family profile data stays
 * out of the genome by design.
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

export const FAMILY_TENANT = 'family';

export const FAMILY_GENOME_FACTS: GenomeFact[] = [
  // ── Identity ─────────────────────────────────────────────────────────
  {
    id: 'g-name',
    section: 'identity',
    label: 'Household',
    value: 'Family OS household · Tāmaki Makaurau — sample family, details fictional',
    readBy: ['voice', 'email', 'support'],
  },
  {
    id: 'g-approver',
    section: 'identity',
    label: 'Who says yes',
    value: 'A parent approves everything — the agents draft and suggest; nothing books, pays or sends on its own',
    readBy: ['voice', 'email', 'support', 'crm'],
  },

  // ── The whānau (fictional demo roster) ───────────────────────────────
  {
    id: 'g-parents',
    section: 'team',
    label: 'Parents',
    value: 'Mum runs the family week · her partner is the second pair of hands for pickups and logistics',
    readBy: ['voice', 'email', 'crm'],
  },
  {
    id: 'g-kids',
    section: 'team',
    label: 'Kids',
    value: 'Tama — Year 9 (NZ Curriculum L5) · Aria — Year 7 (NZ Curriculum L4) · local colleges',
    readBy: ['voice', 'support', 'email'],
  },
  {
    id: 'g-coparent',
    section: 'team',
    label: 'Co-parent',
    value: 'Week-about care — has the kids on alternate weeks; one shared calendar keeps both weeks lined up',
    readBy: ['voice', 'email', 'crm'],
  },
  {
    id: 'g-dog',
    section: 'team',
    label: 'The dog',
    value: 'One family dog · a monthly vet reminder sits on the calendar',
    readBy: ['voice', 'email'],
  },

  // ── What the OS does (the agents) ────────────────────────────────────
  {
    id: 'g-newsletter',
    section: 'services',
    label: 'Newsletter parsing',
    value: 'A school newsletter becomes the family week — events, tasks, pickups, shopping lists and approvals, all proposed first',
    readBy: ['email', 'voice', 'crm'],
  },
  {
    id: 'g-echo',
    section: 'services',
    label: 'Inbox · Echo',
    value: 'Reads forwarded school mail and bills into the week — proposes only; connecting an inbox is a one-time authorise',
    readBy: ['email', 'support'],
  },
  {
    id: 'g-toro',
    section: 'services',
    label: 'Kids’ money · Tōro',
    value: 'Chores → allowance → savings · each release is drafted for a parent’s yes — no money moves on its own',
    readBy: ['voice', 'email', 'crm'],
  },
  {
    id: 'g-homework',
    section: 'services',
    label: 'Homework help',
    value: 'Answers at each kid’s NZ Curriculum level, grounded to their year — it explains, it never does the homework',
    readBy: ['voice', 'support'],
  },
  {
    id: 'g-pack',
    section: 'services',
    label: 'Dog training · PACK',
    value: 'Calm, cited training guidance for reactivity and jumping — biting or aggression goes to a certified behaviourist',
    readBy: ['voice', 'support', 'faq'],
  },
  {
    id: 'g-moana',
    section: 'services',
    label: 'On the water · Moana',
    value: 'Boating questions grounded in NZ safety guidance — weather and tides come first, the skipper makes every call',
    readBy: ['voice', 'support'],
  },

  // ── Knowledge the household holds ────────────────────────────────────
  {
    id: 'g-nutfree',
    section: 'knowledge',
    label: 'Shared lunches',
    value: 'Class shared plates are always nut-free — there are allergies in the class, so labels get checked',
    readBy: ['voice', 'support', 'faq'],
  },
  {
    id: 'g-homework-grounding',
    section: 'knowledge',
    label: 'Homework grounding',
    value: 'Each kid’s year level and curriculum stage live here so help never pitches above their level',
    readBy: ['voice', 'support'],
  },

  // ── Proof ────────────────────────────────────────────────────────────
  {
    id: 'g-proof',
    section: 'proof',
    label: 'How trust is kept',
    value: 'Every action is draft-only and leaves a record — approvals show who said yes and when',
    readBy: ['email', 'support'],
  },

  // ── Rhythms & handoffs ───────────────────────────────────────────────
  {
    id: 'g-custody',
    section: 'operations',
    label: 'Custody rhythm',
    value: 'Week-about from a reference Monday — the console shows whose week it is and which home is base',
    readBy: ['voice', 'email', 'crm'],
  },
  {
    id: 'g-pickups',
    section: 'operations',
    label: 'Pickup board',
    value: 'Who collects whom, from where, when — an assigned adult plus a backup, with maps and ride links as handoffs',
    readBy: ['voice', 'booking', 'email'],
  },
  {
    id: 'g-approvals',
    section: 'operations',
    label: 'Approvals queue',
    value: 'Anything with money, transport, messaging or shopping waits in the queue for a parent’s yes',
    readBy: ['voice', 'email', 'crm'],
  },
  {
    id: 'g-digest',
    section: 'operations',
    label: 'Weekly brief',
    value: 'The week can be emailed as a drafted brief — it queues for approval like everything else',
    readBy: ['email'],
  },
];
