// Wait map — residential property. Independent concept by assembl. Not commissioned
// by, endorsed by, or affiliated with Trade Me. Every claim about them is drawn from
// the `verified` array on the trademe client record.
export default {
  title: 'Every wait in a property campaign',
  lede: 'Six moments where a buyer or a vendor is waiting on somebody else, and what each wait could hand back instead.',
  moments: [
    {
      key: 'search',
      name: 'The search wait',
      when: 'Saved search, nothing yet',
      feels: 'months of scrolling the same suburb',
      screen: {
        title: 'Nothing new fits this week',
        lines: [
          'Same suburb, same budget, nothing that suits.',
          'One street over does — worth a look?'
        ],
        chip: 'weekly, not daily'
      },
      delivered: 'The search keeps working while you are not looking, and only speaks up when something genuinely fits.',
      funder: 'Funded by the marketplace itself — a buyer who is still watching is the audience every listing is sold on.'
    },
    {
      key: 'appraisal',
      name: 'The appraisal wait',
      when: 'Before you decide to list',
      feels: 'a number in your head with nothing behind it',
      screen: {
        title: 'What yours might do',
        lines: [
          'What sold near you, and what did not.',
          'What buyers in your street are watching.'
        ],
        chip: 'no agent yet'
      },
      delivered: 'You walk into the first agent conversation already knowing what the street is doing.',
      funder: 'Funded by the agencies who want that first call, and labelled plainly as theirs.'
    },
    {
      key: 'launch',
      name: 'The launch week',
      when: 'Live, and the first weekend',
      feels: 'a busy Sunday, then a very flat Monday',
      screen: {
        title: 'How the weekend went',
        lines: [
          'Who came through, and who came back twice.',
          'The questions the room kept asking.'
        ],
        chip: 'vendor update'
      },
      delivered: 'The vendor hears how the first open home actually went on Sunday night, not the following Thursday.',
      funder: 'Funded by the agency, out of the campaign budget it already spends building the same update by hand.'
    },
    {
      key: 'middle',
      name: 'The middle weeks',
      when: 'Week three, still on market',
      feels: 'a listing going quiet with no explanation',
      screen: {
        title: 'Six weeks on market',
        lines: [
          'Watching, not enquiring. Here is the pattern.',
          'Price, presentation, or the wrong buyers?'
        ],
        chip: 'ready to send'
      },
      delivered: 'The agent walks into the hard vendor conversation with the story already assembled.',
      funder: 'Funded by the agency, because the vendor who got a straight answer lists with them again.'
    },
    {
      key: 'conditional',
      name: 'The conditional wait',
      when: 'Accepted, not yet unconditional',
      feels: 'a fortnight of other people’s deadlines',
      screen: {
        title: 'What is still outstanding',
        lines: [
          'Finance, builder’s report, LIM — where each sits.',
          'Nothing has gone wrong. Some of it is slow.'
        ],
        chip: 'both sides see it'
      },
      delivered: 'Both sides can see which condition is actually holding things up, instead of guessing at each other.',
      funder: 'Funded by the agency and the conveyancing side, who field the same status call from both parties.'
    },
    {
      key: 'settlement',
      name: 'The settlement wait',
      when: 'Unconditional, waiting on keys',
      feels: 'a date on a calendar and no updates',
      screen: {
        title: 'Settlement day, from here',
        lines: [
          'Solicitors, bank, keys — in the order they happen.',
          'You will hear the moment funds move.'
        ],
        chip: 'moving day set'
      },
      delivered: 'The last weeks stop being a black box, so the move can be organised around something real.',
      funder: 'Funded by movers, insurers and utility-connection services, who all want that week and can pay to be useful in it.'
    }
  ]
}
