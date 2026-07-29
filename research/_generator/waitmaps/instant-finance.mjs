// Wait map — Instant Finance (independent concept, not an Instant Finance product)
// Branch-led lending. No rate, outcome or credit decision is implied anywhere here.

export default {
  title: 'Every waiting moment in a branch lending journey',
  lede: 'Six gaps a branch network already owns, from the decision to walk in to the loan you come back for.',
  moments: [
    {
      key: 'looking',
      name: 'Before you walk in',
      when: 'Deciding to go in at all',
      feels: 'the reluctance of asking a stranger for money',
      screen: {
        title: 'What happens in the room',
        lines: [
          'Who you sit with, and what they ask.',
          'Bring these, and you will not come back twice.'
        ],
        chip: 'no obligation'
      },
      delivered: 'You know what the appointment is actually like before you agree to have one.',
      funder: 'Funded by the business — a branch visit that never happens is the most expensive outcome it has.'
    },
    {
      key: 'booked',
      name: 'Before your slot',
      when: 'From booking to the appointment',
      feels: 'knowing you will tell the same story a third time',
      screen: {
        title: 'Your appointment, started',
        lines: [
          'What you typed online is already there.',
          'You start at minute five, not minute one.'
        ],
        chip: 'brief sent ahead'
      },
      delivered: 'The person you meet has read your file before you sit down, so the first ten minutes are their judgement, not your admin.',
      funder: 'Funded by the business, because a trained lender in a room is the scarcest thing a branch network owns.'
    },
    {
      key: 'waiting',
      name: 'The waiting room',
      when: 'Arrived, waiting to be seen',
      feels: 'ten minutes with nothing to look at but a poster',
      screen: {
        title: 'While you wait',
        lines: [
          'Your documents, checked and ticked off.',
          'One thing missing. Grab it on your phone.'
        ],
        chip: 'one to fix'
      },
      delivered: 'The gap before you are called gets used to catch the missing document, while you can still fix it.',
      funder: 'Funded by the business — a second trip costs the customer a morning and the branch a whole slot.'
    },
    {
      key: 'desk',
      name: 'The desk pause',
      when: 'While they check something',
      feels: 'watching someone read a screen you cannot see',
      screen: {
        title: 'What they are looking at',
        lines: [
          'The same screen, on your phone.',
          'Fees and repayments, in words you would use.'
        ],
        chip: 'nothing hidden'
      },
      delivered: 'The customer sees the same working the lender sees, so questions get asked in the room instead of at home.',
      funder: 'Funded by the business — a question answered across the desk is a complaint that never gets written.'
    },
    {
      key: 'answer',
      name: 'Waiting on the answer',
      when: 'After you leave the branch',
      feels: 'checking your phone on the bus for no reason',
      screen: {
        title: 'Where your file is up to',
        lines: [
          'With an assessor. Nothing needed from you.',
          'We will tell you the moment it moves.'
        ],
        chip: 'no need to ring'
      },
      delivered: 'Silence gets replaced with a position, so nobody has to ring the branch to ask.',
      funder: 'Funded by the business, because answering before the customer asks costs less than answering after.'
    },
    {
      key: 'back',
      name: 'Coming back in',
      when: 'Months later, next time',
      feels: 'hoping they remember you and assuming they will not',
      screen: {
        title: 'Second time, same branch',
        lines: [
          'You finished the last one. That is on file.',
          'Short version of the paperwork this time.'
        ],
        chip: 'same person, if in'
      },
      delivered: 'A returning customer gets treated as one, instead of starting again at a blank form.',
      funder: 'Funded by the business — the branch relationship is the one thing an online-only lender cannot copy.'
    }
  ]
}
