// Wait map — power retail. Category demonstrator by assembl.
// Tidewatt Energy is invented. No real retailer, plan or tariff is described.
export default {
  title: 'Every wait on a power account',
  lede: 'Six moments where a household is waiting on a retailer, and what each wait could hand back instead.',
  moments: [
    {
      key: 'movein',
      name: 'The move-in wait',
      when: 'New house, is the power on?',
      feels: 'a settlement day and an unlit hallway',
      screen: {
        title: 'Power on before you arrive',
        lines: [
          'Address matched. Meter found. Read booked.',
          'On the day you get the keys, not after.'
        ],
        chip: 'connection set'
      },
      delivered: 'The lights are on the night you move in, without a phone call made from a driveway.',
      funder: 'Funded by the retailer, because the move is when households change supplier without meaning to.'
    },
    {
      key: 'first-bill',
      name: 'The first bill',
      when: 'A month with no news',
      feels: 'four weeks of using something you cannot see',
      screen: {
        title: 'Where this month is heading',
        lines: [
          'A fortnight in, tracking near last month.',
          'Nothing odd. We will say if that changes.'
        ],
        chip: 'no action needed'
      },
      delivered: 'You find out where the month is going while there is still month left to change it.',
      funder: 'Funded by the retailer, because a bill that lands without warning is the one that gets disputed.'
    },
    {
      key: 'hold',
      name: 'The hold queue',
      when: 'On hold, asking why',
      feels: 'hold music and an explanation you have to ask for',
      screen: {
        title: 'Why your bill went up',
        lines: [
          'Colder fortnight, heater running longer.',
          'One spike on a Sunday — worth a look.'
        ],
        chip: 'assembled for you'
      },
      delivered: 'The reason for the number is ready before the call is answered, and usually instead of it.',
      funder: 'Funded by the retailer, because the same explanation costs far more when a person has to build it live.'
    },
    {
      key: 'hour',
      name: 'The free hour',
      when: 'Every day, at your hour',
      feels: 'a good hour spent on nothing in particular',
      screen: {
        title: 'Where your hour should sit',
        lines: [
          'This home draws hardest between five and eight.',
          'The car, the dryer, the dishes — run them then.'
        ],
        chip: 'you choose it'
      },
      delivered: 'The best hour on the plan gets used, without anyone rearranging their evening to catch it.',
      funder: 'Funded by the retailer, alongside appliance and EV-charger sellers who want to be useful inside that hour.'
    },
    {
      key: 'winter',
      name: 'The winter spike',
      when: 'The first cold week',
      feels: 'a bill you can see coming and cannot guess',
      screen: {
        title: 'This week is running hot',
        lines: [
          'Coldest week so far. The heater shows it.',
          'Told now, not in three weeks with a total.'
        ],
        chip: 'early warning'
      },
      delivered: 'The winter bill arrives as something expected rather than something done to you.',
      funder: 'Funded by the retailer, alongside insulation and heat-pump installers who would rather reach a household now.'
    },
    {
      key: 'hardship',
      name: 'The payment plan',
      when: 'When it gets hard',
      feels: 'an unanswered email and a growing balance',
      screen: {
        title: 'Your plan, where it stands',
        lines: [
          'Request received. A person is reading it.',
          'You will hear from them, not from a system.'
        ],
        chip: 'a person decides'
      },
      delivered: 'The most frightening wait in the category gets a truthful account, and a person still makes the call.',
      funder: 'Funded by the retailer, because a household that stays on a plan is worth more than one written off.'
    }
  ]
}
