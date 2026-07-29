// Wait map — My Food Bag (independent concept, not a My Food Bag product)
// Nothing is ordered, swapped or cancelled without the customer choosing it.

export default {
  title: 'Every waiting moment in a meal kit week',
  lede: 'Six waits in a household week. Choosing, the days before, the van, the bench, and the week you nearly pause.',
  moments: [
    {
      key: 'choosing',
      name: 'The Sunday scroll',
      when: 'Choosing next week',
      feels: 'the tiredness of choosing dinner for other people',
      screen: {
        title: 'Five from thirty, and why',
        lines: [
          'Netball Tuesday. Someone home late Wednesday.',
          'One gluten free every week, without asking.'
        ],
        chip: 'you still choose'
      },
      delivered: 'Thirty options get narrowed to five against what this household actually said, and the choice stays theirs.',
      funder: 'Funded by the business — the week that felt like homework is the week before someone pauses.'
    },
    {
      key: 'between',
      name: 'The days before',
      when: 'From cut-off to the van',
      feels: 'the low hum of hoping you chose right',
      screen: {
        title: 'Packed for Thursday',
        lines: [
          'Your five, confirmed. Nothing to do.',
          'One swap coming. Hail hit the courgettes.'
        ],
        chip: 'one swap, told'
      },
      delivered: 'A substitution gets explained before it turns up in the box, with the reason attached.',
      funder: 'Funded by the business — a surprise in the box becomes a credit request, and an explained swap does not.'
    },
    {
      key: 'window',
      name: 'The delivery window',
      when: 'Waiting on the van',
      feels: 'an afternoon you cannot properly leave the house',
      screen: {
        title: 'Your window, tightened',
        lines: [
          'Two stops away. Roughly forty minutes.',
          'Chilled since it left. Here is the van.'
        ],
        chip: 'two stops away'
      },
      delivered: 'An afternoon spent waiting turns into forty minutes you can plan around.',
      funder: 'Funded by the business and its courier partner together, because a failed delivery costs them both the box.'
    },
    {
      key: 'unpacked',
      name: 'Box on the bench',
      when: 'Landed, not yet unpacked',
      feels: 'a chilled box and no plan for tonight',
      screen: {
        title: 'Tonight is the ragù',
        lines: [
          'Everything for it is in the top layer.',
          'The quickest one is Tuesday. Fridge the rest.'
        ],
        chip: 'tonight sorted'
      },
      delivered: 'The box arrives already sequenced against the week, so nobody stands in front of a fridge deciding.',
      funder: 'Funded by the business — the meal that never gets cooked is the one that ends the subscription.'
    },
    {
      key: 'cooking',
      name: 'At the bench',
      when: 'Cooking, waiting on the pan',
      feels: 'one hand stirring, one child asking how long',
      screen: {
        title: 'Eight minutes on this step',
        lines: [
          'Next step lands when this one is done.',
          'Hands free? Thursday is one tap away.'
        ],
        chip: 'hands-free step'
      },
      delivered: 'The dead minutes at the stove get used for the next decision, while the customer is already in the kitchen.',
      funder: 'A New Zealand food or appliance brand could fund this one, as a disclosed placement in a moment it genuinely fits.'
    },
    {
      key: 'skip',
      name: 'The skip week',
      when: 'The week you nearly pause',
      feels: 'the creeping sense that this has become a bill',
      screen: {
        title: 'Skip this week?',
        lines: [
          'One tap. Nobody talks you out of it.',
          'Here is what you would miss. Then decide.'
        ],
        chip: 'skip, not cancel'
      },
      delivered: 'Pausing is made easy and honest, which is the difference between a skipped week and a cancelled subscription.',
      funder: 'Funded by the business, because the cheapest customer to keep is the one who was allowed to skip.'
    }
  ]
}
