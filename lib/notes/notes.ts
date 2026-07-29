/**
 * Notes from assembl — the writing that earns search and citation.
 *
 * Kate, 29 July 2026: a newsletter/blog whose content helps both Google and AI
 * assistants find assembl.
 *
 * The structure is deliberate, because the two audiences reward different
 * things and this shape serves both:
 *
 *  - **Answer-shaped headings.** Every `sections[].q` is a question a person
 *    actually types or asks an assistant. Assistants lift a heading and the
 *    paragraph under it almost verbatim, so each answer is written to stand
 *    alone if it is quoted with nothing around it.
 *  - **A one-paragraph answer first.** `answer` is the extractable summary —
 *    the bit a model quotes. Everything after it is for the human who stayed.
 *  - **Sourced facts only.** `sources` is not decoration: it is the reason an
 *    assistant will prefer this page over a competitor's confident guess, and
 *    the reason a journalist can use it.
 *  - **One idea per note.** A page about one question outranks a page about six.
 *
 * Adding a note: append to NOTES. Newest first. `slug` never changes once
 * published — it is the citation address.
 */

export type NoteSection = {
  /** A real question, phrased the way someone would ask it. */
  q: string;
  /** The answer. First sentence must stand alone if quoted in isolation. */
  a: string[];
};

export type Note = {
  slug: string;
  title: string;
  /** The one-paragraph answer engines will lift. Keep under 60 words. */
  answer: string;
  /** ISO date. */
  published: string;
  updated?: string;
  /** 3–6 words, shown as the kicker. */
  kicker: string;
  readMinutes: number;
  sections: NoteSection[];
  /** Every claim that carries a number needs a line here. */
  sources: { fact: string; source: string; url?: string }[];
  /** Where to send someone who finished it. */
  next?: { label: string; href: string };
};

export const NOTES: Note[] = [
  {
    slug: 'what-is-a-rewarded-wait-state',
    title: 'What is a rewarded wait state?',
    kicker: 'the idea, defined',
    answer:
      'A rewarded wait state is a moment where a customer is waiting on a business, redesigned so the wait shows the work being done, gives the customer something they keep, and asks one useful question — instead of showing a spinner.',
    published: '2026-07-29',
    readMinutes: 4,
    sections: [
      {
        q: 'What is a rewarded wait state?',
        a: [
          'A rewarded wait state is a moment where a customer is waiting on a business — for a quote, a claim decision, an application, a delivery — redesigned so that three things happen instead of nothing.',
          'First, the work becomes visible: the customer watches the actual steps complete rather than staring at a progress bar that means nothing. Second, the wait pays: the customer earns something they keep, funded by the business running the journey. Third, one optional question is asked inside the wait, and the answer changes what happens next.',
          'The test is simple. If the wait were removed, would the customer have lost something? In a rewarded wait state, yes.',
        ],
      },
      {
        q: 'Why do waits matter more now than they used to?',
        a: [
          'Because AI agents have made waits longer and more common, not shorter.',
          'When software fetches a record, the wait is a second. When an agent researches, drafts, checks and prepares work, the wait is minutes — sometimes days, once a human approval sits in the middle. The pause is not a defect to engineer away; it is where the work happens.',
          'That creates a moment no business had before: the customer is idle, their attention is on you, and they are waiting on something they care about. Most businesses spend that moment on a spinner.',
        ],
      },
      {
        q: 'Is this just a loading screen with ads on it?',
        a: [
          'No — and the difference is the whole idea.',
          'An ad interrupts the wait with something unrelated. A rewarded wait state uses the wait to show the customer their own work in progress, and gives them value for the minutes. Where a partner appears, it is labelled, relevant to what is actually being prepared, and skippable.',
          'There are three lines that must not be crossed: never stretch a wait to show more; never blend sponsored content into the agent’s own output; never use what you learn to charge that person more. Cross any of them and the trust that made the wait valuable is gone.',
        ],
      },
      {
        q: 'What does the customer actually earn?',
        a: [
          'Whatever the business can afford that the customer genuinely values — and it should come out of the business, never out of selling the person waiting.',
          'In practice that has looked like credit against an excess for an insurance claim, loyalty points toward an existing voucher scheme, free-hour minutes for a power customer, a fee reduction where the customer’s own completeness reduced the cost of processing, or a donation the customer chooses.',
          'The unit matters less than the honesty of it. A number counting up that the customer cannot spend is worse than no number at all.',
        ],
      },
      {
        q: 'What is the one question for?',
        a: [
          'It is the only part of a customer journey that sends something back the other way.',
          'A wait is the rare moment when a customer is both idle and invested, which makes it the highest-yield place in the whole journey to ask one thing. Not a survey — one question, optional, that visibly changes the outcome.',
          'In a storm claim, the question is whether the home is safe to live in tonight, and the answer reorders the queue. In lending, it is whether they are shopping around. In retirement living, it is whether the family needs some of the money sooner for care. Each one changes what the business does next, which is why people answer it.',
        ],
      },
      {
        q: 'How do you know it worked?',
        a: [
          'You measure four things, and you do not claim anything you did not measure.',
          'Waits completed versus abandoned, against your current spinner. Value earned and then actually redeemed. Questions answered versus declined. And whether every output that followed the wait was approved by a named person.',
          'Anyone quoting you a projected percentage for this has modelled it, not measured it. The honest version of this pitch is: we instrument it, and the numbers you quote afterwards are your own.',
        ],
      },
    ],
    sources: [
      {
        fact: 'assembl builds rewarded wait states as working concepts across sixteen New Zealand sectors, each on that sector’s own published facts.',
        source: 'assembl — the concept estate',
        url: 'https://www.assembl.co.nz/industries',
      },
    ],
    next: { label: 'See the three tiers, and try one', href: '/assembling' },
  },
  {
    slug: 'ninety-two-days-nobody-can-see',
    title: 'The ninety-two days nobody can see',
    kicker: 'insurance · the wait that reads as neglect',
    answer:
      'Consumer NZ found an average of 92 days to fully settle a house claim in New Zealand. Most of those days are real work — assessors, schedules, trades — but the customer sees none of it, so genuine progress reads to them as neglect.',
    published: '2026-07-29',
    readMinutes: 5,
    sections: [
      {
        q: 'How long does a house insurance claim take in New Zealand?',
        a: [
          'Consumer NZ, looking at claims settled between September 2022 and August 2023, found an average of 92 days to fully settle a house claim and 61 days for contents.',
          'That average hides the shape of it. A straightforward claim can close quickly; a claim caught in a weather event queues behind a whole suburb. In 2023, the Auckland floods and Cyclone Gabrielle brought one insurer around 8,900 claims — described by its own chief claims officer as five years’ worth of large-loss claims in about two weeks.',
        ],
      },
      {
        q: 'Why does a claim take that long?',
        a: [
          'Because most of the elapsed time is genuine work by people who are booked out.',
          'An assessor has to visit. A schedule of rates has to be applied. Where natural hazard cover is involved, a second set of rules applies to the same damage. Trades in the affected area are quoting for everyone at once. None of this is idleness.',
          'The problem is not the duration. It is that the customer cannot see any of it happening.',
        ],
      },
      {
        q: 'What does the silence actually cost an insurer?',
        a: [
          'It converts real work into perceived neglect, and it fills the contact centre.',
          'During the 2023 surge, delays made up around 35% of enquiries reaching the Insurance & Financial Services Ombudsman — against a norm nearer 9%. The work was being done. The customers could not tell.',
          'Every one of those enquiries is a phone call that exists only because a status page said the same thing for three weeks.',
        ],
      },
      {
        q: 'Can insurers just make claims faster?',
        a: [
          'Some of it, yes — and the industry is already trying.',
          'Online lodgement helps: one insurer says claiming in its app saves an average of five minutes, and that photo uploads help validate a claim about twice as fast. Straight-through processing closes simple claims quickly.',
          'But the assessor’s diary and the trades’ availability are physical constraints. Speed alone will not close a 92-day average, which is why the more useful question is what the customer experiences during days that cannot be removed.',
        ],
      },
      {
        q: 'What would a visible claim wait look like?',
        a: [
          'The customer watches the claim being prepared, earns something for the wait, and answers one question that changes their triage.',
          'Concretely: photos read and matched, the address’s flood-risk rating applied, an assessor booked from a diary rather than a queue, a decision drafted for a person to approve. Each of those is a real step an insurer already takes. Showing them costs nothing and changes everything about how the wait feels.',
          'The question worth asking mid-claim is whether the home is safe to live in tonight. That answer should decide whether someone gets accommodation today or joins a repair queue — and today it usually arrives too late to matter.',
        ],
      },
      {
        q: 'Does an AI decide the claim?',
        a: [
          'No. Nothing about this is a machine deciding cover.',
          'The agents prepare: they read, sort, match, draft. Every output stops at a named person, and the drafts that carry the most risk — a possible total loss, a displaced family — are deliberately held back from any automated run so that a senior person makes the first contact.',
          'An insurer that automated the decision would be solving a different, worse problem.',
        ],
      },
    ],
    sources: [
      {
        fact: '92 days average to fully settle a house claim; 61 days for contents (claims settled September 2022 – August 2023).',
        source: 'Consumer NZ',
        url: 'https://www.consumer.org.nz/articles/cyclone-gabrielle-floods-insurers-leave-customers-dissatisfied',
      },
      {
        fact: 'Around 8,900 claims from the 2023 Auckland floods and Cyclone Gabrielle — "five years’ worth of large loss claims" in about two weeks.',
        source: 'Tower chief claims officer, via Insurance Business, August 2023',
      },
      {
        fact: 'Delays made up about 35% of enquiries to the Insurance & Financial Services Ombudsman during the 2023 surge, against a norm nearer 9%.',
        source: 'IFSO, via Insurance Business',
      },
      {
        fact: 'Online claim lodgement "saves an average of five minutes"; photo uploads help validate claims "twice as fast".',
        source: 'tower.co.nz/claims',
      },
    ],
    next: { label: 'Walk the claims concept', href: 'https://assembling-tower.pages.dev' },
  },
];

export function getNote(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug);
}
