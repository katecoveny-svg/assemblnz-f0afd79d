// Wait map — Giltrap Group (independent concept, not affiliated with, endorsed by or commissioned by Giltrap)
// ⚠️ This is NOT a car-buyer map. The concept is a retail marketing operating system for a dealer group,
// so the six waits belong to Giltrap's own people: the group marketing function and its dealer principals.
// Nobody in this strip is shopping for a car.
// Order = the operating rhythm, shortest cycle to longest: the day's stock, a principal's ask,
// the rulebook, the money already in market, the week after an event, the quarter's review.
// Brand is monochrome — no colour language anywhere. The car appears only as inventory, never as romance.
// Only figures from the page's own sourced material are reused: the Fair Trading Act penalty, with its
// Motor Trade Association attribution kept attached. Everything else in `feels` is qualitative.
// Co-op marketing funds are named as a category only. No marque is ever named as a sponsor.
export default {
  title: 'Every wait inside a group marketing operation',
  lede: 'Six waits inside the group’s own marketing operation. Not a car buyer’s waits — the ones Giltrap’s own people sit through.',
  moments: [
    {
      key: 'stock',
      name: 'The stock wait',
      when: 'Stock moved, marketing last to know',
      feels: 'a fortnight where the car sits and nobody writes a word',
      screen: {
        title: 'Today, from your own stock list',
        lines: [
          'Six ideas. Each one names the actual car.',
          'When it sells, the idea retires itself.'
        ],
        chip: 'from this morning'
      },
      delivered: 'The day opens with campaign ideas tied to real vehicles, instead of a calendar somebody wrote in March.',
      funder: 'Giltrap itself. A prestige car discounted because nobody wrote about it in time costs the group far more than the writing would have.'
    },
    {
      key: 'ask',
      name: 'After a principal asks',
      when: 'Asked Tuesday, nothing back yet',
      feels: 'ringing someone to find out where your own job sits',
      screen: {
        title: 'Your Tuesday ask, already a brief',
        lines: [
          'Marque rules, deadline and the CI notes in it.',
          'Three assets in the library can be adapted.',
          'Third in a queue that clears Thursday.'
        ],
        chip: 'you can see it'
      },
      delivered: 'A dealer principal can see where his job actually sits without ringing anyone, and the brief reaches the team with the detail already in it.',
      funder: 'Giltrap itself. No sponsor belongs anywhere near this one — it is the group paying once for a brief instead of three times for chasing it.'
    },
    {
      key: 'rulebook',
      name: 'The rulebook wait',
      when: 'Draft done, pack unclear',
      feels: 'nobody being certain which distributor pack is the current one',
      screen: {
        title: 'Held, and here is the clause',
        lines: [
          'Nine marques pass. Two are held.',
          'Each names the rule, not a risk score.'
        ],
        chip: 'rule named'
      },
      delivered: 'A held draft comes back with the clause attached, so the fix takes a minute instead of an email chain and a guess.',
      funder: 'Giltrap itself. The Fair Trading Act carries penalties of up to $600,000 per breach (Motor Trade Association dealer guidance) — naming the rule before a draft leaves is the cheap version of that.'
    },
    {
      key: 'market',
      name: 'Spend running blind',
      when: 'Live since Monday, reported at month-end',
      feels: 'learning at month-end what Tuesday already knew',
      screen: {
        title: 'A variant sold out on Friday',
        lines: [
          'Spend is still running behind it.',
          'Here is what that costs, and the source.'
        ],
        chip: 'never spends'
      },
      delivered: 'The person who runs media hears it on Monday, in their own platform, while the move is still worth making.',
      funder: 'Distributor co-op marketing funds already set aside for that marque’s retail activity can carry this, because the reconciliation is exactly what a co-op claim needs. A person still files it, and no marque is named as a sponsor here.'
    },
    {
      key: 'event',
      name: 'After the room empties',
      when: 'Event over, follow-up unsent',
      feels: 'a good night going cold before anyone follows it up',
      screen: {
        title: 'The follow-up was written first',
        lines: [
          'Who came, who did not, who is not a customer.',
          'Drafted before the doors opened. Still unsent.'
        ],
        chip: 'waiting on you'
      },
      delivered: 'The follow-up exists before the event does, so the week after an event stops being the week it goes quiet.',
      funder: 'Mostly Giltrap itself — the run sheet and the follow-up are the group’s own work. Where a distributor already co-funds that activation, its co-op budget reasonably covers this part too.'
    },
    {
      key: 'review',
      name: 'Before the group meeting',
      when: 'Quarter done, opinions differ',
      feels: 'arguing about attention with nobody holding the record',
      screen: {
        title: 'Where the attention went',
        lines: [
          'Eleven pieces here, two there, reasons attached.',
          'Both principals read the same screen.'
        ],
        chip: 'not a ranking'
      },
      delivered: 'The uncomfortable difference is on the table with its reasons, before it arrives at a group meeting as a grievance.',
      funder: 'Giltrap itself. A fairness record should never be sponsored and this one is not. It costs less than the relationship it protects.'
    }
  ]
}
