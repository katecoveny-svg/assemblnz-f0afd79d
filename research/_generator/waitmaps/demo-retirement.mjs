// Wait map — Rosewell Villages (invented NZ retirement operator, category demonstrator)
// Six real waits in a village decision, in journey order. Written for the adult child, not the marketer.
// No points chips here on purpose: you do not gamify a family deciding about their mother.
export default {
  title: 'Every wait in a retirement village decision',
  lede: 'Six moments in a village decision where a family is waiting. Most of them are emotional before they are administrative.',
  moments: [
    {
      key: 'before',
      name: 'Before anyone asks',
      when: 'Months of circling the subject',
      feels: 'nobody wants to raise it first',
      screen: {
        title: 'No forms. Just the questions.',
        lines: [
          'What it costs. What she gets back. Who decides.',
          'Read it without telling us who you are.'
        ],
        chip: 'no contact'
      },
      delivered: 'A family can read the honest version before anyone has to make a phone call.',
      funder: 'The operator, and only the operator. A family circling this decision is not an advertising slot.'
    },
    {
      key: 'enquiry',
      name: 'After the enquiry',
      when: 'Form sent, nothing back yet',
      feels: 'sent on Sunday, silence until Tuesday',
      screen: {
        title: 'Opened at the page you asked for',
        lines: [
          'You asked what she gets back, so that is first.',
          'An advisor reads it before you do.'
        ],
        chip: 'advisor first'
      },
      delivered: 'Their actual worry is answered on the first page, not somewhere in eighty.',
      funder: 'The operator. Eighty pages that answer everything and nothing get read by no one and asked about by everyone.'
    },
    {
      key: 'waitlist',
      name: 'Waiting for a villa',
      when: 'On a list, position unknown',
      feels: 'on a list with no visible place in it',
      screen: {
        title: 'Where things actually are',
        lines: [
          'You are on the list for the two-bedroom block.',
          'Nothing has moved yet. We will say when it does.'
        ],
        chip: 'no pressure'
      },
      delivered: 'A family stops ringing to check, because the checking comes to them.',
      funder: 'The operator. A monthly call that produces no news is a cost to both sides of it.'
    },
    {
      key: 'moving',
      name: 'The moving week',
      when: 'Keys soon, house not packed',
      feels: 'forty years of house, one week to do it',
      screen: {
        title: 'The week, laid out',
        lines: [
          'Power on Tuesday. Keys Thursday. Van Friday.',
          'Her post gets changed the same day.'
        ],
        chip: 'checklist ready'
      },
      delivered: 'Nobody in the family has to hold the whole week in their head.',
      funder: 'A downsizing or moving service could fund this one honestly. It is the week a family actually needs one.'
    },
    {
      key: 'care',
      name: 'When care changes',
      when: 'Something is different, no answer yet',
      feels: 'you noticed, and now you wait',
      screen: {
        title: 'We noticed too',
        lines: [
          'A nurse is calling you today, not next week.',
          'Nothing about her care has been decided.'
        ],
        chip: 'a person, today'
      },
      delivered: 'The family hears from a person before the worry has time to grow.',
      funder: 'The operator, out of its own budget. Nobody sponsors a health worry, and nobody should.'
    },
    {
      key: 'repayment',
      name: 'The wait for repayment',
      when: 'After she leaves, before it settles',
      feels: 'a settlement with no date on it',
      screen: {
        title: 'Where her villa is up to',
        lines: [
          'Refurbished, photographed, two viewings booked.',
          'You will get a date, not a silence.'
        ],
        chip: 'dated, not vague'
      },
      delivered: 'The family can see the villa moving instead of ringing to find out that it is not.',
      funder: 'The operator, because a family chasing a date by phone costs more than simply showing them the date.'
    }
  ]
}
