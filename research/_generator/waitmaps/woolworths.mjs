// Wait map — Woolworths NZ / Everyday Rewards (independent concept, not affiliated or endorsed)
// Six real waits in a household's grocery week, in journey order: plan, delivery, aisle, queue, terminal, midweek.
// Mechanics named here are Everyday Rewards' own published ones (points, boosts, vouchers, Scan&Go).
// Nothing is bought, redeemed or substituted by the concept — every basket line stays the customer's call.
export default {
  title: 'Every wait in a week of groceries',
  lede: 'Six moments a household waits through between the Sunday list and Wednesday dinner — online and in the aisle.',
  moments: [
    {
      key: 'planning',
      name: 'Building the shop',
      when: 'App open, basket empty',
      feels: 'scrolling the same aisles you scrolled last week',
      screen: {
        title: 'Your week, ready to review',
        lines: [
          'Same as most weeks, plus Thursday netball.',
          'Nothing is bought until you say so.'
        ],
        chip: '+12 pts'
      },
      delivered: 'The shop she was going to build by hand arrives already built, and she edits it instead.',
      funder: 'Woolworths’ own budget. An abandoned online basket is a whole week of shop that goes somewhere else.'
    },
    {
      key: 'delivery',
      name: 'The delivery window',
      when: 'Paid for, van not here',
      feels: 'stuck at home for a window you did not choose',
      screen: {
        title: 'Your van, three drops away',
        lines: [
          'One thing was short. Here is the swap.',
          'Say no now and it comes off the docket.'
        ],
        chip: 'swap or skip'
      },
      delivered: 'The substitution gets decided while it can still be changed, not on the doorstep with the crate open.',
      funder: 'Woolworths’ fulfilment budget. A swap refused at the door is picked twice, driven twice and refunded once.'
    },
    {
      key: 'scango',
      name: 'Mid-shop with Scan&Go',
      when: 'Phone in hand, trolley half full',
      feels: 'one hand on the trolley, one on the phone',
      screen: {
        title: 'Two on your list are here',
        lines: [
          'Both are in this aisle, bottom shelf, left.',
          'Scan them together and aisle six is done.'
        ],
        chip: '+4 pts'
      },
      delivered: 'She stops walking the store twice for the two things she always forgets.',
      funder: 'Woolworths’ own operations. Every aisle question answered by the phone is one not asked of a person stocking a shelf.'
    },
    {
      key: 'queue',
      name: 'The checkout queue',
      when: 'Four trolleys ahead of her',
      feels: 'a full trolley and nothing to do with your hands',
      screen: {
        title: 'While you wait to pay',
        lines: [
          'Your boosts are on. Two of them end tonight.',
          'One tap adds them. Nothing else changes.'
        ],
        chip: 'boosts on'
      },
      delivered: 'The boosts she collected and forgot get switched on before the till, not after the receipt prints.',
      funder: 'Woolworths’ own budget. The queue is already staffed and already paid for. Giving it a job costs nothing extra.'
    },
    {
      key: 'terminal',
      name: 'The barcode moment',
      when: 'At the terminal, app loading',
      feels: 'everyone behind you watching a spinner',
      screen: {
        title: 'Card up. Points on the way.',
        lines: [
          'Barcode first. Everything else can wait.',
          'Your voucher is here when you want it.'
        ],
        chip: 'card first'
      },
      delivered: 'The card is on screen before the operator asks, so nobody in the line waits on a loading bar.',
      funder: 'Woolworths itself. Every second held at the terminal is a second of a checkout it is already paying for.'
    },
    {
      key: 'midweek',
      name: 'Wednesday at five',
      when: 'Bags unpacked, nobody fed',
      feels: 'a full fridge and no idea what to make',
      screen: {
        title: 'Three dinners from what you have',
        lines: [
          'Nothing extra to buy. It is all in there.',
          'Pick one and Sunday adds it back on.'
        ],
        chip: 'on the list'
      },
      delivered: 'The shop she already paid for turns into three meals instead of a fridge she has to solve at five o’clock.',
      funder: 'A supplier’s retail-media budget, the same money behind an aisle-end. It can fund the idea for dinner and never the contents of the trolley.'
    }
  ]
}
