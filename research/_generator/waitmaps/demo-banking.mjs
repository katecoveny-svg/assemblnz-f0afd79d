// Wait map — consumer lending. Category demonstrator by assembl.
// Ledgerline is invented. No real bank, product, rate or credit policy is described.
// No moment here makes or implies a lending decision.
export default {
  title: 'Every wait in a home loan',
  lede: 'Six moments where an applicant is waiting on a decision they cannot see, and what each wait could hand back.',
  moments: [
    {
      key: 'preapproval',
      name: 'The pre-approval wait',
      when: 'Before you look at houses',
      feels: 'walking open homes without knowing if you can',
      screen: {
        title: 'Where your pre-approval sits',
        lines: [
          'Documents in. Nothing missing so far.',
          'An assessor decides this, not this screen.'
        ],
        chip: 'no decision here'
      },
      delivered: 'You know whether to keep going to open homes this weekend or hold off for another one.',
      funder: 'Funded by the bank, because an applicant left guessing applies to two other banks the same week.'
    },
    {
      key: 'applied',
      name: 'The application wait',
      when: 'Submitted, then silence',
      feels: 'three days of nothing after an acknowledgement',
      screen: {
        title: 'Your application, day three',
        lines: [
          'Everything you sent has been read.',
          'One payslip is still outstanding.'
        ],
        chip: 'one thing needed'
      },
      delivered: 'You learn the one thing actually holding it up, while you can still go and fix it.',
      funder: 'Funded by the bank, out of the budget it already spends winning back applicants who gave up waiting.'
    },
    {
      key: 'valuation',
      name: 'The valuation wait',
      when: 'Waiting on a valuer’s diary',
      feels: 'a stranger’s calendar deciding your week',
      screen: {
        title: 'The valuation, where it is',
        lines: [
          'Ordered. The valuer has the address.',
          'A visit, then a report. That is the wait.'
        ],
        chip: 'ordered, not late'
      },
      delivered: 'The delay has a name and a shape, so it stops reading as a bad sign.',
      funder: 'Funded by the bank, because the call it prevents is one that tells the applicant nothing new.'
    },
    {
      key: 'desk',
      name: 'The assessor’s desk',
      when: 'With a person, waiting',
      feels: 'a file on somebody’s desk with no queue position',
      screen: {
        title: 'With a named assessor',
        lines: [
          'Your file is with a person, not a queue.',
          'What they are checking, and in what order.'
        ],
        chip: 'human decision'
      },
      delivered: 'The wait has a person attached to it, and the decision stays entirely theirs.',
      funder: 'Funded by the bank — no sponsor belongs anywhere near this moment, and saying so out loud is the point.'
    },
    {
      key: 'settlement',
      name: 'The settlement wait',
      when: 'Approved, waiting on drawdown',
      feels: 'a truck booked against a date nobody confirms',
      screen: {
        title: 'Settlement, from here',
        lines: [
          'Solicitor, insurance, funds — in order.',
          'You will hear the moment the money moves.'
        ],
        chip: 'moving day set'
      },
      delivered: 'The last fortnight becomes something you can organise a move around.',
      funder: 'Funded by the bank, with moving and utility-connection partners labelled as such — never an insurer sold inside a lending journey.'
    },
    {
      key: 'rollover',
      name: 'The rate rollover',
      when: 'A fixed term ending',
      feels: 'a letter, a deadline and a choice you did not ask for',
      screen: {
        title: 'Your fixed term is ending',
        lines: [
          'What is ending, and the date you choose by.',
          'The options, side by side. No recommendation.'
        ],
        chip: 'your call'
      },
      delivered: 'You choose the next term with the options in front of you, not on the morning it expires.',
      funder: 'Funded by the bank, because the household that understood the choice does not move the loan elsewhere.'
    }
  ]
}
