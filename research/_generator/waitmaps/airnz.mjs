/**
 * Air New Zealand — every wait in a journey that might not go to plan.
 *
 * The wedge for this one is disruption, not booking. A flight that runs on time
 * needs nothing from us; the value is entirely in the hours when the board
 * changes and nobody can tell you what happens to your connection.
 *
 * ⚠️ Never use Airpoints, koru, or any Air NZ loyalty language — that is a
 * standing rule and it is easy to break by accident when writing about credit.
 * Funders name a category, never a company.
 */
export default {
  title: 'Every wait in a journey that might not go to plan',
  lede: 'Six moments between choosing a flight and walking out of the terminal — and the one that decides how the whole trip is remembered.',
  moments: [
    { key: 'choosing', name: 'The choosing', when: 'Twelve tabs, no decision',
      feels: 'an evening spent comparing the same four flights',
      screen: { title: 'Same trip, three shapes', lines: ['Cheapest, shortest, and the one that suits your week.', 'Nothing hidden behind a filter you did not find.'], chip: 'no pressure' },
      delivered: 'The trade-off gets made once, in plain words, instead of re-derived on every visit.',
      funder: 'Air New Zealand. An evening of comparison that ends somewhere else is the most expensive wait on this list.' },
    { key: 'queue', name: 'The check-in queue', when: 'Bag drop, twenty deep',
      feels: 'the part of the airport nobody budgets for',
      screen: { title: 'You are eleven minutes from the desk', lines: ['Your bag is under, and your seat is confirmed.', 'Nothing needs you until the gate.'], chip: 'nothing to do' },
      delivered: 'A number instead of a guess, and the confirmation that there is nothing left to sort out.',
      funder: 'Air New Zealand. A queue where nobody knows how long it is generates the questions the desk then has to answer.' },
    { key: 'gate', name: 'The gate, changing', when: 'Delayed, reason unclear',
      feels: 'watching a board update without being told anything',
      screen: { title: 'Ninety minutes late. Here is what that means', lines: ['Your Wellington connection still works. Just.', 'If it slips again, the 6:40 is held for you.'], chip: 'connection held' },
      delivered: 'The consequence, not the cause. Most people do not need the reason for the delay — they need to know whether they will make the next thing.',
      funder: 'Air New Zealand, out of the contact-centre line. This is the moment that generates the calls.' },
    { key: 'air', name: 'In the air', when: 'Three hours, no signal',
      feels: 'the only uninterrupted time in the whole trip',
      screen: { title: 'Landing at 4:15. Ready when you are', lines: ['Your ride, your first morning, the weather.', 'Prepared now, waiting for you on the ground.'], chip: 'ready on landing' },
      delivered: 'The arrival gets prepared while nothing else can be done, so the first hour on the ground is not spent on a phone.',
      funder: 'A transport or accommodation partner category could fund the ground half, clearly labelled. The rest is Air New Zealand.' },
    { key: 'belt', name: 'The baggage belt', when: 'Landed, standing still',
      feels: 'ten minutes of watching other people’s bags',
      screen: { title: 'Yours is on belt 4, eighth off', lines: ['Or if it is not, you already know and it is logged.'], chip: 'already logged' },
      delivered: 'Either the bag or the honest answer, without a form and without a queue.',
      funder: 'Air New Zealand. A mishandled bag reported by the airline costs less than one reported by a passenger at a desk.' },
    { key: 'after', name: 'The claim afterwards', when: 'Home, out of pocket',
      feels: 'the part where you have to prove your own trip',
      screen: { title: 'We already have the delay on record', lines: ['Times, flight numbers, what you were owed.', 'Drafted for a person here to approve.'], chip: 'no forms' },
      delivered: 'The airline holds every fact the claim needs, so a passenger should not have to assemble it from screenshots.',
      funder: 'Air New Zealand. A claim the airline prepares is a claim it also gets right first time.' },
  ],
};
