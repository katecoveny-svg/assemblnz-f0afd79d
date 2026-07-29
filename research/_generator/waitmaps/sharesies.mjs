// Wait map — Sharesies (independent concept, not a Sharesies product)
// Nothing here is financial advice. No order is placed, changed or recommended.

export default {
  title: 'Every waiting moment in an investing journey',
  lede: 'Six waits between opening an account and holding for decades. The ID check, the transfer, the queued order, the red week.',
  moments: [
    {
      key: 'joining',
      name: 'The sign-up check',
      when: 'While your ID is verified',
      feels: 'the pause where you wonder if you have been turned down',
      screen: {
        title: 'We are checking your ID',
        lines: [
          'Standard for everyone opening an account.',
          'Nothing you can do to make it faster.'
        ],
        chip: 'no action needed'
      },
      delivered: 'The pause gets named as routine, so a new customer does not read silence as a problem.',
      funder: 'Funded by the business, because a half-finished sign-up is one it already paid for and did not get.'
    },
    {
      key: 'transfer',
      name: 'The money in transit',
      when: 'From your bank or old fund',
      feels: 'days where it exists nowhere you can actually see',
      screen: {
        title: 'Where your money is today',
        lines: [
          'Sold down at your old provider.',
          'Middle leg now. We will show each step.'
        ],
        chip: 'step 2 of 3'
      },
      delivered: 'The dark days of a transfer get a position, so nobody assumes their money has gone missing.',
      funder: 'Funded by the business — a customer who cannot see their money rings someone about it.'
    },
    {
      key: 'queued',
      name: 'The queued order',
      when: 'Placed, market not open',
      feels: 'refreshing at 9pm for a number that cannot exist yet',
      screen: {
        title: 'Your order is queued',
        lines: [
          'Nothing happens until this market opens.',
          'Why the price is not known yet.',
          'How to change your mind, and until when.'
        ],
        chip: 'no order placed'
      },
      delivered: 'The customer learns why a price cannot exist yet, so uncertainty stops looking like a fault.',
      funder: 'Funded by the business — a first investment cancelled out of confusion is the worst one to lose.'
    },
    {
      key: 'filled',
      name: 'After it fills',
      when: 'Done, and still settling',
      feels: 'a number on the screen you cannot yet explain',
      screen: {
        title: 'Filled. Here is the price.',
        lines: [
          'What you paid, and why it differed.',
          'Settling now. Normal, and not instant.'
        ],
        chip: 'price explained'
      },
      delivered: 'The gap between what they expected and what they got is explained, rather than left to be discovered.',
      funder: 'Funded by the business, because an unexplained price is where a complaint starts.'
    },
    {
      key: 'dip',
      name: 'The red week',
      when: 'When the number goes down',
      feels: 'the specific 11pm urge to press sell',
      screen: {
        title: 'It is down. Here is why.',
        lines: [
          'What moved, in plain words.',
          'Nothing here tells you what to do.'
        ],
        chip: 'not advice'
      },
      delivered: 'A fall gets an explanation instead of a silence, and the concept refuses to say what anyone should do about it.',
      funder: 'Funded by the business, because the alternative is a customer deciding at 11pm with nothing but a red number.'
    },
    {
      key: 'decades',
      name: 'The long horizon',
      when: 'KiwiSaver, for thirty years',
      feels: 'a balance you check twice a year and never understand',
      screen: {
        title: 'Nothing needs you today',
        lines: [
          'Contributions in. Nothing to decide.',
          'Here is what changed since you last looked.'
        ],
        chip: 'set and left'
      },
      delivered: 'The longest wait in the journey gets a short, honest update instead of decades of nothing.',
      funder: 'Funded by the business — a member who understands their own account does not switch on a whim.'
    }
  ]
}
