// Wait map — Summerset (independent concept, not affiliated with or endorsed by Summerset)
// Six real waits in her move, in journey order: the pack, the sums, the family, the lawyer,
// the settlement gap, the first ninety days.
// Deliberately NOT Ryman's map. Ryman's is the adult child waiting on the family; this one is the
// woman moving, waiting on paperwork, money and her own mind. Emphasis: certainty and what comes back.
// Verified facts only: the deferred management fee is 25% over four years in an independent living home,
// and Summerset Sure is their published 90-day money-back guarantee. Nothing about the weekly fee is claimed.
// No points chips. This is a person's home and her money, not a loyalty programme.
export default {
  title: 'Every wait in deciding, signing and settling in',
  lede: 'Six moments where the person moving is the one waiting — on a pack, on her family, on a lawyer, on herself.',
  moments: [
    {
      key: 'pack',
      name: 'Waiting on the pack',
      when: 'Details given, nothing arrived',
      feels: 'you handed over your details and got a form letter',
      screen: {
        title: 'The pack, about your town',
        lines: [
          'Hawke’s Bay villages first, not every village.',
          'Opened at what you get back, because you asked.'
        ],
        chip: 'your town'
      },
      delivered: 'The information pack arrives about her region and her question instead of about everywhere at once.',
      funder: 'Summerset itself. The identical pack is cheap to send and expensive to follow up.'
    },
    {
      key: 'sums',
      name: 'The kitchen table sums',
      when: 'Pack open, calculator out',
      feels: 'arithmetic you have never had to do before',
      screen: {
        title: 'What you get back, plainly',
        lines: [
          'The deferred fee, worked on your number.',
          'Not an example. Not a range. Yours.'
        ],
        chip: 'plain numbers'
      },
      delivered: 'She sees the deferred management fee against her own figure — 25% over four years in an independent living home — rather than someone else’s example.',
      funder: 'Summerset itself. This is explanation, never selling. No sponsor goes anywhere near a person’s money.'
    },
    {
      key: 'family',
      name: 'Waiting on the family',
      when: 'She has decided, they have not',
      feels: 'wanting your children to be pleased for you',
      screen: {
        title: 'Send them what convinced you',
        lines: [
          'The same pages, in your words, not a pitch.',
          'You choose who sees it. Nobody else does.'
        ],
        chip: 'she decides'
      },
      delivered: 'She hands her family the reasoning instead of defending the decision at Sunday lunch.',
      funder: 'Summerset itself. A family that has not seen the numbers is why a settled decision goes quiet again.'
    },
    {
      key: 'lawyer',
      name: 'With the lawyer',
      when: 'Agreement sent, advice pending',
      feels: 'a document your solicitor has and you do not',
      screen: {
        title: 'What your lawyer is reading',
        lines: [
          'Every clause in plain words, side by side.',
          'Ask us anything. Sign nothing today.'
        ],
        chip: 'sign nothing'
      },
      delivered: 'She can follow her own agreement while it is being checked, instead of waiting to be told what it says.',
      funder: 'Summerset itself. Explaining the agreement early is cheaper than a signing that stalls at the solicitor.'
    },
    {
      key: 'gap',
      name: 'Between two houses',
      when: 'Sold, keys not yet',
      feels: 'two settlement dates that do not line up',
      screen: {
        title: 'Both dates, on one page',
        lines: [
          'Your sale, your keys, and the days between.',
          'What moves if either date moves.'
        ],
        chip: 'one page'
      },
      delivered: 'The gap between selling one home and getting the keys to the next stops being a guess.',
      funder: 'A conveyancer or a moving service could fund this one honestly. It is the fortnight she actually needs both.'
    },
    {
      key: 'ninety',
      name: 'The first ninety days',
      when: 'Moved in, still deciding',
      feels: 'settling in while still allowed to change your mind',
      screen: {
        title: 'You can still say no',
        lines: [
          'Summerset Sure runs for ninety days.',
          'Nobody here is going to pretend it does not.'
        ],
        chip: 'still your choice'
      },
      delivered: 'The published ninety-day money-back guarantee gets said out loud during the ninety days, not buried in the pack.',
      funder: 'Summerset itself. A guarantee nobody mentions after move-in is a guarantee doing none of its job.'
    }
  ]
}
