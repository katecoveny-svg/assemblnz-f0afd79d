// Wait map — Southerly Air (invented NZ carrier, category demonstrator)
// Six real waits in one trip, in journey order. No statistics, no real carrier language.
export default {
  title: 'Every wait between booking and bags',
  lede: 'Six moments in one trip where a passenger has nothing to do but wait. Here is what could arrive instead.',
  moments: [
    {
      key: 'booking',
      name: 'The booking wait',
      when: 'Comparing fares, tabs open',
      feels: 'too many tabs, no decision',
      screen: {
        title: 'Two dates, one honest answer',
        lines: [
          'Tuesday is cheaper. Friday gives you a whole day.',
          'Neither is held. Nothing is booked.'
        ],
        chip: '+20 pts'
      },
      delivered: 'She stops guessing which day is the good day.',
      funder: 'A regional tourism organisation, which would rather fund the reason to come than another ad nobody asked for.'
    },
    {
      key: 'checkin',
      name: 'The check-in queue',
      when: 'Bag drop, early, shuffling',
      feels: 'a line that moves for everyone but you',
      screen: {
        title: 'Your bag, before the desk',
        lines: [
          'Your allowance covers it. No repack at the scale.',
          'Row 14 window is still free if you want it.'
        ],
        chip: '+25 pts'
      },
      delivered: 'She reaches the desk already knowing the bag is fine and the seat is sorted.',
      funder: 'The airline itself, because a bag repacked on the scale holds up everyone standing behind it.'
    },
    {
      key: 'gate',
      name: 'The gate wait',
      when: 'Boarding time, board changing',
      feels: 'the board changed and nobody said why',
      screen: {
        title: 'What actually changed',
        lines: [
          'Fog down south. Your aircraft is still up north.',
          'Three ways home are being prepared. Nothing booked.'
        ],
        chip: '+100 pts'
      },
      delivered: 'She hears the reason before the board shows it, and has options before she has queued.',
      funder: 'Funded by the airline, because the call it prevents costs more than the wait it fills.'
    },
    {
      key: 'air',
      name: 'In the air',
      when: 'Cruising, no signal',
      feels: 'hours of it, and nothing useful to do with them',
      screen: {
        title: 'Ready for when you land',
        lines: [
          'Your hire car desk shuts before you get there.',
          'A later pick-up is drafted. You confirm it.'
        ],
        chip: '+40 pts'
      },
      delivered: 'She lands with the next problem already solved instead of standing at a closed counter.',
      funder: 'A hire car or accommodation partner, paying to be useful at the moment it is needed rather than two weeks before.'
    },
    {
      key: 'bags',
      name: 'The baggage belt',
      when: 'Carousel, bags not out',
      feels: 'watching the same suitcase go past again',
      screen: {
        title: 'Your bag is on belt three',
        lines: [
          'Loaded late, so it comes out near the end.',
          'Sit down. We will tell you when to stand up.'
        ],
        chip: '+30 pts'
      },
      delivered: 'She knows whether to stand at the belt or sit down with the kids.',
      funder: 'The airline itself, because a mishandled bag reported at the belt is a smaller problem than one reported the next day.'
    },
    {
      key: 'connection',
      name: 'The connection wait',
      when: 'Between flights, onward at risk',
      feels: 'doing arithmetic in a corridor',
      screen: {
        title: 'Your onward flight, honestly',
        lines: [
          'It is tight. Right now it still holds.',
          'If it goes, a seat on the next one is held.'
        ],
        chip: 'seat held'
      },
      delivered: 'She stops running the numbers herself, because someone already has.',
      funder: 'The airline, and nobody else. This is the moment the relationship is kept or lost, and it should be paid for like it.'
    }
  ]
}
