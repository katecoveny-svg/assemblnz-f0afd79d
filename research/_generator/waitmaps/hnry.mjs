// Wait map — Hnry (independent concept, not an Hnry product)
// Nothing here determines deductibility, calculates tax, or files anything.

export default {
  title: 'Every waiting moment in a sole trader year',
  lede: 'Six gaps between doing the work and being square with the tax. The invoice, the charge, the return, the assessment.',
  moments: [
    {
      key: 'invoice',
      name: 'Waiting to be paid',
      when: 'From invoice sent to paid',
      feels: 'the nerve it takes to send a second reminder',
      screen: {
        title: 'Still not paid',
        lines: [
          'Sent eleven days ago. Nothing since.',
          'A polite follow-up is drafted. You send it.'
        ],
        chip: 'reminder drafted'
      },
      delivered: 'The chase gets written for you, so following up costs one tap instead of an evening of working up to it.',
      funder: 'Funded by the business — getting paid sooner is the reason a sole trader stays subscribed.'
    },
    {
      key: 'payday',
      name: 'The money landing',
      when: 'The minute a payment hits',
      feels: 'the flicker of not knowing which part is really yours',
      screen: {
        title: 'It landed, already split',
        lines: [
          'Tax, GST, ACC, student loan. Taken at source.',
          'What is left is the number that is yours.'
        ],
        chip: 'nothing owed later'
      },
      delivered: 'You see the split as it happens, so the leftover figure is one you can trust.',
      funder: 'Funded by the business, because the whole promise is that this moment feels finished.'
    },
    {
      key: 'charge',
      name: 'The unplaced charge',
      when: 'A card charge, weeks old',
      feels: 'guessing at something you knew perfectly well at the time',
      screen: {
        title: 'What was this for?',
        lines: [
          'Thursday afternoon. The hardware place.',
          'A job, or the house? One tap either way.'
        ],
        chip: 'four seconds'
      },
      delivered: 'The question gets asked while the answer is still fresh, instead of guessed at months later.',
      funder: 'Funded by the business — a guess sitting in a tax record is a risk it carries too.'
    },
    {
      key: 'gst',
      name: 'The return window',
      when: 'While the period is open',
      feels: 'a job you keep meaning to sit down and do',
      screen: {
        title: 'Your return period',
        lines: [
          'Every invoice in the period, lined up.',
          'Two charges unplaced. That is the only gap.'
        ],
        chip: '2 to place'
      },
      delivered: 'You find out what is missing during the period, not on the day something is due.',
      funder: 'Funded by the business — an unplaced charge at filing time turns into a support ticket.'
    },
    {
      key: 'eofy',
      name: 'The year end',
      when: 'The last days of March',
      feels: 'twelve months you cannot quite remember the shape of',
      screen: {
        title: 'Your year, replayed',
        lines: [
          'Twelve months of invoices, in order.',
          'Anything earned outside here still needs you.'
        ],
        chip: 'one to confirm'
      },
      delivered: 'The year gets shown back as a story, so anything missing surfaces before it is filed.',
      funder: 'Funded by the business, because a complete year is the difference between filing and re-filing.'
    },
    {
      key: 'assessment',
      name: 'Waiting on IRD',
      when: 'Filed, waiting to hear',
      feels: 'the low dread of a number you did not choose',
      screen: {
        title: 'Filed. IRD is reading it.',
        lines: [
          'Nothing needed from you today.',
          'We will tell you the moment it moves.'
        ],
        chip: 'nothing to do'
      },
      delivered: 'The silence after filing gets a position attached to it, so nobody sits refreshing a government portal at midnight.',
      funder: 'Funded by the business — answering the question before the customer asks it costs less than answering after.'
    }
  ]
}
