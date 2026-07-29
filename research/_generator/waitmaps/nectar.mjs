// Wait map — Nectar Money (independent concept, not a Nectar product)
// Every figure quoted here comes from the client's own verified[] array.
// No rate is predicted, no outcome implied, no credit decision made.

export default {
  title: 'Every waiting moment in a personal loan',
  lede: 'Six real gaps between wanting a loan and finishing one. Each is time the customer already spends, spent on nothing.',
  moments: [
    {
      key: 'comparing',
      name: 'The comparing days',
      when: 'Before you apply at all',
      feels: 'the tab you keep open and keep not deciding',
      screen: {
        title: 'See where you stand',
        lines: [
          'A soft look. Nothing lands on your file.',
          'The published range, 7.95% to 29.95% p.a.'
        ],
        chip: 'no credit mark'
      },
      delivered: 'You find out where you stand before anything touches your credit file.',
      funder: 'Funded by the business — a shopper who understands the numbers is cheaper to win than one who leaves and comes back.'
    },
    {
      key: 'quote',
      name: 'The quote wait',
      when: 'From submit to a number',
      feels: 'staring at a progress bar you cannot hurry',
      screen: {
        title: 'We are reading it now',
        lines: [
          'Your statement, sorting itself into lanes.',
          'Essentials, spending, what you already owe.'
        ],
        chip: 'file 4 of 5'
      },
      delivered: 'The wait builds a complete file, so nobody has to chase you for the same three documents tomorrow.',
      funder: 'Funded by the business, because a file that arrives complete is an assessor hour it never has to spend.'
    },
    {
      key: 'checks',
      name: 'The paperwork wait',
      when: 'While ID and bank checks run',
      feels: 'the stretch where you are sure you have got something wrong',
      screen: {
        title: 'What is still outstanding',
        lines: [
          'Two checks green. One waiting on your bank.',
          'Nothing here needs you right now.'
        ],
        chip: 'nothing to do'
      },
      delivered: 'You can see which check is still running, so silence stops meaning something has gone wrong.',
      funder: 'Funded by the business — a call asking for an update is the cheapest call there is to prevent.'
    },
    {
      key: 'settlement',
      name: 'The settlement wait',
      when: 'Signed, waiting on the money',
      feels: 'refreshing a bank app you already know the balance of',
      screen: {
        title: 'Signed. The money moves now.',
        lines: [
          'What lands, and what leaves each payday.',
          'Your first payment date, in writing.'
        ],
        chip: 'first date set'
      },
      delivered: 'You know the day money arrives and the day the first payment leaves, before either happens.',
      funder: 'A licensed insurer could fund this one — settlement day is when cover has to exist — as a disclosed placement, never a recommendation.'
    },
    {
      key: 'term',
      name: 'The long middle',
      when: 'Every payday for years',
      feels: 'a direct debit that is the whole relationship',
      screen: {
        title: 'Payment twelve, on time',
        lines: [
          'Twelve down. Here is what that has built.',
          'Pay extra and the end date moves.'
        ],
        chip: 'no early penalty'
      },
      delivered: 'Each payment tells you something about your own record instead of just disappearing.',
      funder: 'Funded by the business — years of silence is years of paying to keep a customer and choosing not to talk to them.'
    },
    {
      key: 'payoff',
      name: 'The last payment',
      when: 'When the term finally ends',
      feels: 'the odd flatness of owing nobody anything',
      screen: {
        title: 'That was the last one',
        lines: [
          'Nothing owed. Here is your record.',
          'Yours in writing. It works anywhere.'
        ],
        chip: 'record ready'
      },
      delivered: 'You leave with written proof of how you paid, useful to any lender, not only this one.',
      funder: 'Funded by the business, and it is the cheapest marketing it has — the next loan comes from someone who finished the last one.'
    }
  ]
}
