/**
 * Everyday Rewards × assembl — concept editorial copy manifest.
 *
 * The private concept surface is NOT governed by the homepage `COPY.md`
 * manifest (that file is the source of truth for public homepage strings only).
 * To keep the concept components from authoring copy inline, the editorial
 * strings for the "assembled" concept live here in one place. Strings adapted
 * from the reviewed concept page; naming stays lowercase `assembl`, NZ English,
 * draft-only ("prepared, never bought without approval").
 *
 * ILLUSTRATIVE concept copy — no live system is connected and no order is
 * placed. Figures are simulated / estimated for the concept, never measured.
 */

/** Top signed-url strip — who the private link was prepared for. */
export const SIGNED_URL_COPY = {
  eyebrow: 'signed url · prepared for →',
  suffix: 'rewarded wait-state product · concept 001',
} as const;

/** The single hero statement — begin with purpose (design constitution §21). */
export const HERO_COPY = {
  eyebrow: 'everyday rewards × assembl · private concept',
  heading: 'The wait, assembled.',
  line:
    'One optional moment in the Everyday Rewards app — the weekly-shop planning wait — ' +
    'turned into a prepared week the household approves. Watch it take shape.',
  customerMode: 'customer',
  journeyMode: 'inside the journey',
} as const;

/** "01 · the mirror" — the customer surface and the operations surface, together. */
export const TWO_TRUTHS_COPY = {
  sectionLabel: '01 · the mirror · customer app + operations view',
  heading: 'One moment. Two truths.',
  body:
    'The customer sees a reward and a useful result. Woolworths operations sees the ' +
    'same event — with consent, cost, action boundary and audit trail. Same moment, ' +
    'two surfaces, one run.',
  customerLabel: 'customer surface · everyday rewards',
  customerNote:
    'Woolworths and Everyday Rewards own the relationship, the interaction and the approval.',
  opsLabel: 'operations surface · woolworths view',
  opsNote:
    'Woolworths sets eligibility, approved actions, measurement and review.',
} as const;

/** The five-screen phone story (the "great phone demo"). */
export const PHONE_DEMO_COPY = {
  eyebrow: 'the customer experience · scroll the phone',
  heading: 'The whole story, inside the app',
  intro:
    'What the shopper sees in Everyday Rewards — from an ordinary wait to a prepared ' +
    'week they approve. Change a lever above and every screen reassembles from the ' +
    'same run.',
  screens: {
    home: {
      tag: 'everyday rewards · home',
      greeting: 'Kia ora, Aroha',
      hook: 'Double Points Week',
      hookDates: 'two weeks · 20 Jul – 2 Aug',
      boosts: 'Featured boosts',
      toReward: 'more points to your next reward',
    },
    wait: {
      tag: 'weekly online shop · planning',
      title: 'The wait, today',
      state: 'browsing categories, adding items, searching',
      nothing: 'no signal · no value · no memory',
      ends: 'the wait ends when the shop is done',
    },
    prompt: {
      badge: 'optional · rewarded',
      title: 'Your week, ready to review.',
      body:
        'assembl can prepare this week’s shop around the household in about 40 seconds. ' +
        'You review before anything is bought.',
      cta: 'Show me my week →',
      foot: 'assembl · optional · 40 sec',
    },
    basket: {
      tag: 'draft basket',
      returned: 'minutes returned',
      totalLabel: 'draft total',
    },
    review: {
      title: 'Basket ready to review.',
      body: 'Nothing bought yet. Tap through when you’re ready — approve, edit, or skip.',
      badge: 'completed wait · +12 pts',
    },
  },
} as const;

/** "06 · the reply" — three reply verbs instead of "book a demo". */
export const REPLY_VERBS_COPY = {
  sectionLabel: '06 · the reply',
  heading: 'Not “book a demo”. Three ways to reply.',
  body:
    'Each of these opens a pre-filled email to Kate at assembl — no form, no ' +
    'scheduler. Or ask the in-app agent anything you want to know first.',
  email: 'assembl@assembl.co.nz',
  verbs: [
    {
      key: 'household',
      label: 'verb one',
      line: 'Tell us which household we got wrong.',
      subject: 'Everyday Rewards concept — the household we got wrong',
    },
    {
      key: 'constraint',
      label: 'verb two',
      line: 'Send us one constraint we haven’t accounted for.',
      subject: 'Everyday Rewards concept — a constraint to account for',
    },
    {
      key: 'sceptic',
      label: 'verb three',
      line: 'Share this with the sharpest sceptic on your team — we want their read.',
      subject: 'Everyday Rewards concept — a sceptic’s read',
    },
  ],
  footer: 'no cookies · no tracking pixels · no analytics · this link is a gift, not a trap',
} as const;
