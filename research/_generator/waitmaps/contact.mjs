/**
 * Contact Energy — every wait in a power account.
 *
 * The wedge is bill shock: the gap between using power and finding out what it
 * cost. Everything here sits in that gap. No tariff, price or percentage is
 * invented — the mechanic is legibility, not a rate promise.
 */
export default {
  title: 'Every wait in a power account',
  lede: 'Six moments between choosing a plan and opening a winter bill — the whole relationship happens in the gap between using power and finding out what it cost.',
  moments: [
    { key: 'compare', name: 'Before you switch', when: 'Comparing, none of it comparable',
      feels: 'four plans that cannot be laid side by side',
      screen: { title: 'Your house, on each plan', lines: ['Same twelve months of use, four different answers.', 'The one that suits you may not be the cheapest headline.'], chip: 'your usage' },
      delivered: 'The comparison gets made against this household’s actual use rather than an average nobody lives in.',
      funder: 'Contact. A switch that happens for the wrong reason churns back out within a year.' },
    { key: 'switching', name: 'The switch wait', when: 'Signed up, nothing visible',
      feels: 'a fortnight where nothing appears to happen',
      screen: { title: 'Nothing needs you this week', lines: ['Meter read booked. First bill lands after that.', 'You do not have to ring anyone.'], chip: 'on track' },
      delivered: 'The silence gets named, so it stops reading as something gone wrong.',
      funder: 'Contact. Every one of these silences currently produces a “has it gone through?” contact.' },
    { key: 'firstbill', name: 'The first bill', when: 'Opened, and it is higher',
      feels: 'the moment the plan stops being theoretical',
      screen: { title: 'Why this one is higher', lines: ['Part billing period, part the cold week in June.', 'Here is what next month looks like.'], chip: 'explained' },
      delivered: 'The bill explains itself in the order a person actually asks — what changed, why, and what happens next.',
      funder: 'Contact. A bill that explains itself is a bill that does not need explaining on the phone.' },
    { key: 'hold', name: 'The hold queue', when: 'On hold, position eleven',
      feels: 'eleven minutes of a recorded voice',
      screen: { title: 'While you wait, this is your account', lines: ['Your balance, your last read, your plan.', 'If this answers it, hang up and nothing is lost.'], chip: 'answered' },
      delivered: 'Most hold calls are one fact. Putting the fact in the wait ends the call before it starts.',
      funder: 'Contact. This is a contact-centre cost line before it is anything else.' },
    { key: 'outage', name: 'The dark hour', when: 'Power out, no information',
      feels: 'not knowing whether it is your house or the street',
      screen: { title: 'It is the street, not you', lines: ['Crew assigned. Estimate updates here, not on a phone tree.', 'Nothing you can do at the switchboard.'], chip: 'street-wide' },
      delivered: 'The first question in an outage is whether it is only you. Answering that stops a call and stops a worry.',
      funder: 'Contact, and honestly nobody should sponsor an outage. Nothing is sold in this moment.' },
    { key: 'winter', name: 'The winter bill', when: 'July, and it doubled',
      feels: 'the bill you were dreading arriving anyway',
      screen: { title: 'This was coming. Here are the options', lines: ['Smoothed payments, or a plan that fits winter use.', 'No credit check to look at either.'], chip: 'options first' },
      delivered: 'The hard bill arrives with the options already worked out, before anyone has to ask for help.',
      funder: 'Contact. A household that arranges something is a household that stays; the alternative is arrears.' },
  ],
};
