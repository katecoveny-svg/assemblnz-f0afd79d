// Wait map — Fernmarket (invented NZ supermarket, category demonstrator)
// Six real waits in a week of groceries, in journey order. No statistics, no real retailer language.
export default {
  title: 'Every wait in the weekly shop',
  lede: 'Six moments a household waits through every week, from the Sunday list to the thing that runs out on Thursday.',
  moments: [
    {
      key: 'list',
      name: 'The Sunday list',
      when: 'Bench, fridge open, planning',
      feels: 'staring into a fridge, writing nothing',
      screen: {
        title: 'Next week, already drafted',
        lines: [
          'Same as most weeks, plus the Thursday gap.',
          'Nothing is bought. Every line can go.'
        ],
        chip: '+3 pts'
      },
      delivered: 'The list writes itself from what this house already buys, so she edits instead of remembering.',
      funder: 'The supermarket itself. A household that plans the week with you does the week with you.'
    },
    {
      key: 'aisle',
      name: 'The aisle hunt',
      when: 'In store, one thing missing',
      feels: 'it moved aisles and nobody said',
      screen: {
        title: 'It moved. Aisle 6, low shelf.',
        lines: [
          'Two things on your list are both back there.',
          'Grab them together and you are done.'
        ],
        chip: '+3 pts'
      },
      delivered: 'She finds the thing that moved without walking the store twice.',
      funder: 'The store’s own operations budget — the same money that pays the staff member she is currently trying to flag down.'
    },
    {
      key: 'checkout',
      name: 'The checkout queue',
      when: 'Trolley loaded, four ahead',
      feels: 'loaded trolley, nothing to do',
      screen: {
        title: 'While you wait to pay',
        lines: [
          'Tonight is covered. Thursday is not.',
          'One item would fix it. Your call.'
        ],
        chip: '+4 pts'
      },
      delivered: 'The queue answers the question she would have got home and asked herself.',
      funder: 'The store, because a queue that gives something back is cheaper than another checkout lane.'
    },
    {
      key: 'pick',
      name: 'The pick',
      when: 'Order placed, someone shopping',
      feels: 'paid for it, no idea what is happening',
      screen: {
        title: 'Aisle 4, into your crate',
        lines: [
          'One thing is out of stock. Here is the swap.',
          'Say no and it comes off. No surprise at the door.'
        ],
        chip: 'swap, your call'
      },
      delivered: 'She sees the substitution while it can still be changed, instead of at the door.',
      funder: 'The store’s fulfilment budget. A customer watching the pick does not ring to ask where the order is.'
    },
    {
      key: 'window',
      name: 'The delivery window',
      when: 'At home, waiting on a van',
      feels: 'a wide window and no van yet',
      screen: {
        title: 'Your van, on the way',
        lines: [
          'Two drops ahead of you. Chilled goes in last.',
          'Nobody needs to sit by the window.'
        ],
        chip: '+5 pts'
      },
      delivered: 'She gets her afternoon back instead of guarding the front door.',
      funder: 'The store, because a delivery nobody is home for gets paid for twice.'
    },
    {
      key: 'midweek',
      name: 'The midweek gap',
      when: 'Thursday, something has run out',
      feels: 'out of the one thing again',
      screen: {
        title: 'The Thursday thing, again',
        lines: [
          'You keep running out of it on a Thursday.',
          'Next week it is on the list before you ask.'
        ],
        chip: 'added next week'
      },
      delivered: 'The gap that repeats every week stops repeating.',
      funder: 'A supplier could fund the reminder, but never the basket. Nothing gets added because someone paid for it.'
    }
  ]
}
