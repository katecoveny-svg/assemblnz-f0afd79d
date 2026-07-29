// Wait map — power retail. Independent concept by assembl. Not commissioned by,
// endorsed by, or affiliated with Electric Kiwi. Every claim about them is drawn
// from the `verified` array on the electrickiwi client record.
export default {
  title: 'Every wait in a power switch',
  lede: 'Six moments where a power customer is left waiting on someone else, and what each wait could hand back instead.',
  moments: [
    {
      key: 'compare',
      name: 'The compare wait',
      when: 'Before you sign anything',
      feels: 'a week of open tabs and no decision',
      screen: {
        title: 'Would you be better off?',
        lines: [
          'We read your last bill, not a national average.',
          'Off-peak, the free hour, your real week.'
        ],
        chip: 'no contract'
      },
      delivered: 'A straight answer to the only question that matters, before anyone signs anything.',
      funder: 'Funded by the business — an answer here costs less than winning the same household back later.'
    },
    {
      key: 'switch',
      name: 'The switch wait',
      when: 'From sign-up to power on',
      feels: 'a fortnight where nothing visibly happens',
      screen: {
        title: 'Your switch is under way',
        lines: [
          'Lodged with your old retailer. Dated.',
          'Final read requested. No gap, no overlap.'
        ],
        chip: 'day one set'
      },
      delivered: 'You can watch the switch move instead of assuming it has stalled.',
      funder: 'Funded by the business, because a switch nobody can see is a switch people ring about.'
    },
    {
      key: 'final-bill',
      name: 'The final bill',
      when: 'Waiting on your old retailer',
      feels: 'one last invoice from a company you have already left',
      screen: {
        title: 'One bill still to come',
        lines: [
          'Your old retailer owes you a closing read.',
          'We will tell you when it lands, and what for.'
        ],
        chip: 'one bill left'
      },
      delivered: 'The last loose end of the old plan gets closed off without you chasing it.',
      funder: 'Funded by the business, because the chase call lands on your contact centre either way.'
    },
    {
      key: 'hour',
      name: 'The free hour',
      when: 'Every day, at your hour',
      feels: 'a good hour spent on a phone charger',
      screen: {
        title: 'Where your hour should sit',
        lines: [
          'This house draws hardest after six.',
          'Dishes, dryer, the car — worth running then.'
        ],
        chip: 'you set the hour'
      },
      delivered: 'The best hour of the day gets used, without anyone having to remember it.',
      funder: 'Funded by the business — a free hour is judged on the version people actually get.'
    },
    {
      key: 'outage',
      name: 'The dark hour',
      when: 'When the power goes out',
      feels: 'a dark house and a busy phone line',
      screen: {
        title: 'The street is out, not you',
        lines: [
          'Reported. The lines company has it.',
          'We will tell you the moment that changes.'
        ],
        chip: 'no need to ring'
      },
      delivered: 'You know it is not your fuse box, and you know someone already has it in hand.',
      funder: 'Funded by the business, because every call during an outage costs more than the message that prevents it.'
    },
    {
      key: 'winter',
      name: 'The winter bill',
      when: 'After the first cold week',
      feels: 'a fortnight of dread before a number arrives',
      screen: {
        title: 'This week is running hot',
        lines: [
          'Colder week, heater on longer. It shows.',
          'Told now, while there is still month left.'
        ],
        chip: 'early warning'
      },
      delivered: 'The bill stops being a surprise, because you were told while you could still do something.',
      funder: 'Funded by the business — a bill nobody explained is the one people ring about, then leave over.'
    }
  ]
}
