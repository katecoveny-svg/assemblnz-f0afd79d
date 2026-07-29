/**
 * Tower — the 92-day claim acceleration tracker.
 *
 * Kate's sector brief, 30 July 2026: "in assembl intuitive agentic customer
 * journeys, the wait state is the product surface." For a house claim the wait is
 * the product problem — so the mechanic is the wait itself, collapsing.
 *
 * The number is Consumer NZ's, not Tower's: an average of 92 days to fully settle
 * a house claim, claims settled Sept 2022 – Aug 2023. The brief attributed it to
 * Tower; it is corrected here and on the page.
 *
 * ⚠️ The commerce layer names a CATEGORY, never a company. The brief proposed
 * Mitre 10 and Airbnb funding a Tower claim — that asserts a commercial
 * relationship about third parties who have not agreed to it, on a page going to
 * a named buyer. Category plus an explicit "no partner engaged" label keeps the
 * commercial argument and drops the false implication.
 */
export default {
  kind: 'tracker',
  title: 'Ninety-two days, out loud.',
  lede: 'Most of those days are real work — assessors, schedules, the Natural Hazards portion. The customer sees none of it, so it all reads as silence. Press it and watch the same claim run with the work shown.',
  runLabel: 'Run the claim',
  resetLabel: 'Back to day one',

  /* Left column: the days as they are actually spent. Right: what the customer
     currently receives. The gap between the two columns IS the concept. */
  from: { n: 92, unit: 'days', cap: 'Consumer NZ average to fully settle' },
  to: { n: 11, unit: 'days', cap: 'the same work, with the waiting designed' },

  steps: [
    { d: 'Day 1', t: 'Lodged', now: 'A reference number and a promise to be in touch.',
      with: 'Photographed room by room while the damage is still exactly as it happened. The evidence an assessor will ask for in three weeks is already attached.', shave: 6 },
    { d: 'Day 2–9', t: 'Triage', now: 'Silence. The urgent claims and the simple ones wait in the same queue.',
      with: 'Read against the flood overlay and the policy wording, and sorted by what it actually needs — make-safe today, assessor next week, or nothing at all.', shave: 14 },
    { d: 'Day 10–34', t: 'Make-safe and assessment', now: 'A booking window and a wait with nothing in it.',
      with: 'A time from a real diary, what the assessor will look at, and what the household can do this week that counts.', shave: 21 },
    { d: 'Day 35–61', t: 'The cover question', now: 'The longest silence, and the one that generates the most calls.',
      with: 'The cover position drafted the day the assessment lands, with the wording it rests on — held for a person to approve, never sent by a machine.', shave: 18 },
    { d: 'Day 62–84', t: 'Repair or cash', now: 'A number arrives with no working.',
      with: 'Both options side by side with what each means for this house, and where the excess comes off.', shave: 14 },
    { d: 'Day 85–92', t: 'Settled', now: 'Settled, and nobody remembers the middle.',
      with: 'A record of every decision and what it rested on, which is also the audit trail.', shave: 8 },
  ],

  layers: [
    { n: 'Layer 1', k: 'The interface',
      t: 'The claim, rendered',
      b: 'A live panel showing this property against Tower’s own published flood-risk view, the assessment progressing, and which portion is Natural Hazards Commission rather than Tower. The customer stops guessing which queue they are in.' },
    { n: 'Layer 2', k: 'The co-pilot',
      t: 'A labelled line, not a chatbot',
      b: 'It answers what stage the claim is at and what happens next, from the claim record rather than a script. It says when it does not know and hands to a person. Every answer is marked as prepared by a machine.' },
    { n: 'Layer 3', k: 'The commerce',
      t: 'The wait pays for itself',
      b: 'While the assessment completes, one funded slot: temporary accommodation, drying and make-safe, or replacement essentials. It is relevant because the claim says the house is wet — not because someone bid highest.',
      slot: { category: 'a national hardware and trade chain, or an accommodation platform',
              offer: 'Somewhere dry this week, and the make-safe already booked — credited against the excess rather than charged on top.' } },
    { n: 'Layer 4', k: 'The exchange',
      t: 'One question, answered once',
      b: 'Inside the wait: is the house safe to sleep in tonight? An answer to that changes the triage immediately, and it is the one question a survey three weeks later never gets.' },
  ],

  /* Every figure that appears on the mechanic, with where it came from. */
  sources: [
    { fact: 'An average of 92 days to fully settle a house claim',
      pub: 'Consumer NZ insurance research, claims settled Sept 2022 – Aug 2023' },
    { fact: 'Every other number on this panel',
      pub: 'illustrative — a concept timeline, not a Tower measurement or a promise' },
  ],
};
