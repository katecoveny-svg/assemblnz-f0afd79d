export default {
  title: 'Every waiting moment in a commercial claim',
  lede: 'Six gaps between the incident and the money, and what a business could be told in each one.',
  moments: [
    {
      key: 'incident',
      name: 'The First Night',
      when: 'Before the claim is lodged',
      feels: 'the hours when nobody is at a desk',
      screen: {
        title: 'What to do before you lodge',
        lines: [
          'Photograph it now, while it is untouched.',
          'Keep every invoice from tonight, small ones too.'
        ],
        chip: 'Saved for morning'
      },
      delivered: 'The evidence gets captured while it still exists, before anyone opens a file.',
      funder: 'Funded by the business, because a claim documented on night one is a claim assessed once.'
    },
    {
      key: 'lodged',
      name: 'The Acknowledgement Gap',
      when: 'From lodgement to first contact',
      feels: 'a week of not knowing who has it',
      screen: {
        title: 'Your claim has a handler',
        lines: [
          'Name, direct line, and what they do next.',
          'Your broker can see this same page.'
        ],
        chip: '+6 min back'
      },
      delivered: 'The file stops being a reference number and becomes a person with a phone.',
      funder: 'Funded by the business — the broker chase call is the most expensive contact in the chain.'
    },
    {
      key: 'documents',
      name: 'The Document Loop',
      when: 'Sending things, then sending more',
      feels: 'three rounds of almost-there',
      screen: {
        title: 'What is still missing',
        lines: [
          'Two items landed. One is unreadable.',
          'Reshoot that page and the file moves today.'
        ],
        chip: '+4 min back'
      },
      delivered: 'They find out a document failed on the day they sent it, not a fortnight later.',
      funder: 'Funded by the business, because every avoidable round trip is another touch on an open file.'
    },
    {
      key: 'assessor',
      name: 'The Assessor Wait',
      when: 'Between assignment and site visit',
      feels: 'a diary you cannot see',
      screen: {
        title: 'Your assessor, and when',
        lines: [
          'Assigned, with the windows they can offer.',
          'Choose a time that suits the site.'
        ],
        chip: 'Slot confirmed'
      },
      delivered: 'A site visit gets booked around the business, instead of landing on it.',
      funder: 'Funded by the business — an agreed time beats a failed visit and a second trip.'
    },
    {
      key: 'decision',
      name: 'The Cover Question',
      when: 'Waiting on a cover position',
      feels: 'the part you cannot plan around',
      screen: {
        title: 'Where the decision sits',
        lines: [
          'What is settled, and what is still open.',
          'A person signs this. Not a model.'
        ],
        chip: 'Human sign-off'
      },
      delivered: 'They can tell their board something true, before the answer is final.',
      funder: 'Funded by the business — an update the customer trusts costs less than a complaint about silence.'
    },
    {
      key: 'payment',
      name: 'The Settlement Wait',
      when: 'Decision made, money not yet',
      feels: 'the stretch your cashflow notices',
      screen: {
        title: 'Payment, and when it lands',
        lines: [
          'The approved amount, the account, the date.',
          'An interim payment first if you are stood down.'
        ],
        chip: 'Tracked to bank'
      },
      delivered: 'The finance manager gets a date they can put in a forecast.',
      funder: 'Funded by the business — this is the moment the next renewal is actually won or lost.'
    }
  ]
}
