/**
 * The concept-demo catalogue — one canonical entry per lead.
 *
 * Kate, 30 July 2026: "research every demo concept you can find that has been
 * made for each of these leads and then combine the best of all into one sharp
 * cohesive demo concept that I can easily find and access to stop the double ups."
 *
 * The double-ups were real and undocumented. An audit of research/assembling-*
 * found four Woolworths builds, two Air NZ, two Ryman and two Contact URLs, with
 * nothing anywhere recording which was current. Nothing listed them either —
 * /assembling links its own sub-pages, not the concepts — so the only way to find
 * a demo was to already know its URL.
 *
 * So: `canonical` is the one to send. `superseded` records what it replaced and
 * why, kept rather than deleted because old links are already in inboxes.
 */

export type Demo = {
  slug: string;                 // the pages.dev subdomain
  company: string;
  sector: string;
  kind: 'named' | 'demonstrator';
  /** The one line that opens the conversation. */
  wedge: string;
  /** What is genuinely worth looking at on this page. */
  showpiece: string;
  /** Anything that must be checked before sending. */
  caution?: string;
  /** Older builds this replaces, and what happened to them. */
  superseded?: { slug: string; note: string }[];
  /** Does it carry the current fleet standard? */
  has: { waits: boolean; accept: boolean; scratch: boolean; agent: boolean };
  /** 1 Aug 2026 demo-framework stack: now = send this week; next = this month;
   *  exhibit = evidence only, no further build; parked = not for outreach. */
  tier: 'now' | 'next' | 'exhibit' | 'parked';
};

export const url = (slug: string) => `https://assembling-${slug}.pages.dev`;

export const DEMOS: Demo[] = [
  {
    slug: 'everyday-rewards', tier: 'now',
    company: 'Everyday Rewards (flagship)',
    sector: 'loyalty · grocery',
    kind: 'named',
    wedge:
      'One connected journey: photograph the fridge, the wait drafts the week, a person signs the send — every spinner a place to earn.',
    showpiece:
      'The interactive phone. Use the demo fridge (real opus-5 vision on a bundled photo) or your own; the 3D fridge hands items to the basket as the app reads; remove a basket row and it flies back; sign and the Mana Receipt itemises the visit.',
    has: { waits: true, accept: true, scratch: false, agent: true },
  },
  {
    slug: 'woolworths-rewards', tier: 'next',
    company: 'Woolworths NZ · Everyday Rewards',
    sector: 'Grocery + loyalty',
    kind: 'named',
    wedge:
      'Woolworths shipped Olive, Snap & Shop and Smart Baskets in Australia on 29 June 2026 — and the release never mentions Everyday Rewards. New Zealand has neither. The agent and the loyalty programme are separate builds.',
    showpiece:
      'The shop assembles itself when you press play: the list arrives already written from purchase history, the missing weekly item is flagged, a substitution is asked rather than decided, a supplier-funded slot appears labelled as funded, and then it stops with nothing ordered. Plus an honest split between what can start Monday and what has to be built.',
    superseded: [
      { slug: 'concept', note: 'the "concept for Oliver" build — richer chrome, but no tier split and no researched concepts' },
      { slug: 'woolworths-cine', note: 'the earliest single-screen version' },
    ],
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'ryman-family', tier: 'next',
    company: 'Ryman Healthcare',
    sector: 'Retirement villages',
    kind: 'named',
    wedge:
      'The answers a family actually wants are already published — in a 42-page statutory disclosure statement on the Companies Office register that no family has ever opened. Nothing needs inventing; it needs reading.',
    showpiece:
      'The sibling table. The one decision aid ever trialled for this decision cut a carer’s own conflict significantly and left disagreements between family members unresolved. This takes three siblings’ answers and sorts them into the arguments more information can settle and the arguments it never will.',
    caution:
      // door order updated 1 Aug 2026 —
      'Ryman’s standard deferred management fee is now 30%, and current residents keep the terms they signed — so there are two cohorts. Never quote a percentage without asking which agreement first.',
    superseded: [
      { slug: 'ryman', note: 'the "minute one" build — its agent and wait-phone have since been ported across, so this one supersedes it outright' },
    ],
    // scratch is false on purpose, not by omission: you do not gamify a family
    // deciding about their mother. The wait counts minutes of reading instead.
    has: { waits: true, accept: true, scratch: false, agent: true },
  },
  {
    slug: 'raywhite', tier: 'parked',
    company: 'Ray White New Zealand',
    sector: 'Real estate · buyer enquiry',
    kind: 'named',
    wedge:
      'A buyer enquires on Sunday night after an open home and hears nothing until Tuesday. Ray White’s own headline is “We bring the whole team” — and a buyer cannot tell the difference between a big team and a slow one.',
    showpiece:
      'The boundary panel. Five things a real estate agent gets asked to do, each answered against the Real Estate Agents Act (Professional Conduct and Client Care) Rules 2012 with the rule quoted. Three come back as a refusal, including generating an appraisal: rule 10.2(a) puts that in a licensee’s hand.',
    caution:
      'Palette verified in a real browser on 30 July 2026 (#FFE512, Lato + Playfair Display) because CloudFront 403s headless Chrome, so palette.mjs cannot read this site. Never state a price expectation the vendor has not agreed in writing — rule 9.4.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'bayleys', tier: 'parked',
    company: 'Bayleys Realty Group',
    sector: 'Real estate · the vendor side',
    kind: 'named',
    wedge:
      'A vendor hands over their largest asset and then sits through six separate silences. The sharpest is the appraisal: rule 10.2(c) requires comparable sales behind the number, and in a thin commercial market there often are none — which rule 10.3 says you must then explain in writing. Almost nobody does.',
    showpiece:
      'The boundary panel, and the one switch that comes back “yes” where everyone expects a refusal: producing the written explanation for when nothing is comparable. It is the most valuable thing on the list and the one the industry skips.',
    caution:
      'Gotham is a licensed typeface and is not served by the page; the nearest geometric is used and no match is claimed. Palette verified via palette.mjs on 30 July 2026 (#00234B / #275077).',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'tower', tier: 'parked',
    company: 'Tower Limited',
    sector: 'Insurance · house claims',
    kind: 'named',
    wedge:
      'An average of 92 days to fully settle a house claim (Consumer NZ). Most of those days are real work — assessors, schedules, the Natural Hazards portion — and the customer sees none of it, so all of it reads as silence.',
    showpiece:
      'The claim runs twice at once. Left column is what a customer receives today; right is the same work with the waiting designed. The headline number counts down stage by stage as the days are earned back.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'summerset', tier: 'next',
    company: 'Summerset',
    sector: 'Retirement villages',
    kind: 'named',
    wedge:
      'Summerset publishes what families need — to investors, and in statutory disclosure statements. Never to families. Its weekly-fee cap against after-tax NZ Super is in the disclosure statement, not on the website.',
    showpiece:
      'The money, in plain words: the licence payment, the deferred management fee at 25% over four years, and fees stopping the day she permanently vacates.',
    caution:
      // door order updated 1 Aug 2026 —
      'Summerset Sure is tiered — 90 days for independent living or a serviced apartment, 30 days for a memory care apartment or premium room, and it does not apply on transfer, health-driven exit or death. The DMF is 25% (27.5% for a Care Suite), never 30%.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'airnz', tier: 'exhibit',
    company: 'Air New Zealand',
    sector: 'Aviation · disruption',
    kind: 'named',
    wedge:
      'A flight that runs on time needs nothing from us. The value is entirely in the hours when the board changes and nobody can say what happens to your connection.',
    showpiece:
      'Six waits in a journey that might not go to plan — and the gate moment shows the consequence rather than the cause, because people do not need the reason for a delay, they need to know whether they will make the next thing.',
    caution: 'Never write “koru points”. Airpoints and Koru are real names; that coinage is not.',
    superseded: [{ slug: 'airnz-cine', note: 'the earliest single-screen version' }],
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'contact', tier: 'parked',
    company: 'Contact Energy',
    sector: 'Energy retail',
    kind: 'named',
    wedge:
      'The whole relationship happens in the gap between using power and finding out what it cost.',
    showpiece:
      'Six waits in a power account, ending on the winter bill that arrives with the options already worked out. The outage moment says plainly that nobody should sponsor an outage.',
    superseded: [{ slug: 'contact-cine', note: 'same build, second URL — deployed twice historically' }],
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'nzpost', tier: 'parked', company: 'NZ Post', sector: 'Logistics', kind: 'named',
    wedge: 'The most repeated question in New Zealand logistics: where is my parcel. The tracking page routes the enquiry rather than answering it.',
    showpiece: 'Order wait through to the enquiry wait — six moments, including the delivered-but-not-in-hand gap.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'aig', tier: 'parked', company: 'AIG New Zealand', sector: 'Commercial insurance', kind: 'named',
    wedge: 'A commercial claim starts on the worst day a business has had in years, and everything after it is a wait they cannot see into.',
    showpiece: 'The first night before the claim is even lodged, through to the settlement wait.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'southern-cross', tier: 'exhibit', company: 'Southern Cross Health Society', sector: 'Health insurance', kind: 'named',
    wedge: 'The covered question, asked before anyone books anything — and the pre-approval silence that follows it.',
    showpiece: 'Six waits from “is this covered” to the letter home nobody expected.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'trademe', tier: 'parked', company: 'Trade Me Property', sector: 'Property', kind: 'named',
    wedge: 'The listing that has been up for six weeks, and the buyer waiting on a LIM.',
    showpiece: 'Search wait through to settlement — both sides of the same six weeks.',
    caution: 'Palette still UNVERIFIED — confirm before sending.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'nectar', tier: 'now', company: 'Nectar Money', sector: 'Personal lending', kind: 'named',
    wedge: 'Get paid for the wait — the seven minutes shown working, without breaking the law with finance incentives.',
    showpiece:
      'The application wait shown working, the FMA-ready evidence pane (CCCFA consumer-credit supervision moved to the FMA on 1 July 2026), and the receipt. No scratch cards in lending — the reward is certainty, and the page now says so.',
    has: { waits: true, accept: true, scratch: false, agent: true },
  },
  {
    slug: 'instant-finance', tier: 'parked', company: 'Instant Finance', sector: 'Branch lending', kind: 'named',
    wedge: 'Fifty-five years and a branch network is not something you automate your way out of. It is the gap before someone sits down with one of your people.',
    showpiece: 'Before you walk in, through to coming back in.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'myfoodbag', tier: 'next', company: 'My Food Bag', sector: 'Meal kits', kind: 'named',
    wedge:
      'You told the market your FY26 result was retention and order frequency. Both are decided in one moment — the Sunday night the customer skips. Here is that moment, assembled.',
    showpiece:
      'The skip moment, inverted: tap skip and the adjusted week (smaller box, cheaper week, one fewer meal) is offered before the exit — skip itself always honoured first tap. Plus the Sunday scroll, and the two refusals as switches: no health inference, nothing charged unconfirmed. Door: Mark Winter.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'electrickiwi', tier: 'parked', company: 'Electric Kiwi', sector: 'Energy retail', kind: 'named',
    wedge: 'The Hour of Power is the best idea in NZ energy retail, and the one thing that asks the customer to do the work.',
    showpiece: 'The compare wait through to the winter bill.',
    caution: 'Palette still UNVERIFIED — confirm before sending.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'hnry', tier: 'next', company: 'Hnry', sector: 'Sole-trader tax', kind: 'named',
    wedge: 'Waiting to be paid, then waiting on IRD. A sole trader’s year is mostly waiting.',
    showpiece: 'Waiting to be paid through to waiting on IRD.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'sharesies', tier: 'now', company: 'Sharesies', sector: 'Retail investing', kind: 'named',
    wedge:
      'Your published KiwiSaver transfer window is ten business days out of market — the exact window a losing provider uses to win the customer back. Here is what those ten days could do instead.',
    showpiece:
      'Rebuilt 2 Aug to the framework spec: play the five-beat transfer machine (stages from their published help centre), three moments in the wait — allocation held for confirmation — and the receipt vs the published window. Verified #E50072. Door: Sonya Williams; precedent: they shipped AI Search with Telescope AI.',
    has: { waits: false, accept: true, scratch: false, agent: true },
  },
  {
    slug: 'giltrap', tier: 'next', company: 'Giltrap Group', sector: 'Automotive retail', kind: 'named',
    wedge: 'Not a car-buyer journey — a retail marketing operating system for a dealer group. The waits are inside the marketing operation.',
    showpiece: 'The stock wait through to the group meeting, all six experienced by Giltrap’s own people.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  {
    slug: 'construction', tier: 'exhibit', company: 'An architecture + construction practice', sector: 'Construction', kind: 'demonstrator',
    wedge: 'Concept, consent, pricing, coordination, site, handover — the waits that decide whether a build runs.',
    showpiece: 'IFC in the browser with no BIM authoring licence.',
    has: { waits: true, accept: true, scratch: true, agent: true },
  },
  { slug: 'demo-retirement', tier: 'next', company: 'Rosewell Villages', sector: 'Retirement villages', kind: 'demonstrator',
    wedge: 'The category shape, with an invented operator so no real brand is borrowed.',
    showpiece: 'Before anyone asks, through to the wait for repayment. Label chips rather than points — you do not gamify a family deciding about their mother.',
    has: { waits: true, accept: true, scratch: true, agent: true } },
  { slug: 'demo-airline', tier: 'parked', company: 'Southerly Air', sector: 'Aviation', kind: 'demonstrator',
    wedge: 'The category shape, with an invented carrier.',
    showpiece: 'Booking wait through to the connection wait.',
    has: { waits: true, accept: true, scratch: true, agent: true } },
  { slug: 'demo-grocery', tier: 'exhibit', company: 'Fernmarket', sector: 'Grocery', kind: 'demonstrator',
    wedge: 'The category shape, with an invented supermarket.',
    showpiece: 'The Sunday list through to the midweek gap.',
    has: { waits: true, accept: true, scratch: true, agent: true } },
  { slug: 'demo-energy', tier: 'parked', company: 'Tidewatt Energy', sector: 'Energy', kind: 'demonstrator',
    wedge: 'The category shape, with an invented retailer.',
    showpiece: 'Move-in wait through to the payment plan.',
    has: { waits: true, accept: true, scratch: true, agent: true } },
  { slug: 'demo-banking', tier: 'exhibit', company: 'Ledgerline', sector: 'Banking', kind: 'demonstrator',
    wedge: 'The category shape, with an invented bank.',
    showpiece: 'Pre-approval through to the rate rollover. No personalised financial advice anywhere.',
    has: { waits: true, accept: true, scratch: true, agent: true } },
];

/** Every superseded slug, so the page can list what NOT to send. */
export const SUPERSEDED = DEMOS.flatMap((d) =>
  (d.superseded ?? []).map((s) => ({ ...s, replacedBy: d.slug, company: d.company })),
);
