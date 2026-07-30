/**
 * Ray White — the six waits on the BUYER side of an enquiry.
 *
 * Their brand line is "We bring the whole team" and they are the largest network
 * in the country, so the wedge is what happens between a buyer pressing enquire
 * and a person from that team calling back. Every screen below stays inside the
 * REA Code of Conduct: no price expectation is stated without the vendor's
 * agreement (rule 9.4), and no defect is airbrushed (rule 10.7).
 */
export default {
  title: 'Every wait between “enquire” and a person calling back',
  lede: 'Six gaps in a buyer’s week. Each one is a moment they already spend on your listing, and each one currently holds a form receipt.',
  moments: [
    {
      key: 'enquire', name: 'The Enquiry', when: 'Sunday night, after the open home',
      feels: 'having sent something into a void',
      screen: {
        title: 'Your enquiry, already read',
        lines: ['The three things you asked about, answered from the listing.',
                'What the vendor has agreed can be said about price.'],
        chip: 'A salesperson has it',
      },
      delivered: 'The buyer gets the answers that exist in the file tonight, and the salesperson gets a lead that has already told them what it cares about.',
      funder: 'Funded by the office, because the enquiry that goes unanswered until Tuesday is the one that buys somewhere else.',
    },
    {
      key: 'price', name: 'The Price Question', when: 'Before they will book a viewing',
      feels: 'being managed',
      screen: {
        title: 'What we can and cannot tell you',
        lines: ['The vendor’s agreed expectation, in their words.',
                'Where no comparable sales exist, it says so.'],
        chip: 'Rule 9.4 · rule 10.3',
      },
      delivered: 'A straight answer about what is known, and an equally straight one about what is not. Buyers forgive the second and never forgive a dodge.',
      funder: 'Funded by the office. This is compliance work that happens to build trust.',
    },
    {
      key: 'view', name: 'The Viewing Gap', when: 'Between booking and Saturday',
      feels: 'four days of nothing',
      screen: {
        title: 'Before you drive out there',
        lines: ['The floorplan, measured, with the room they always ask about.',
                'Known defects, disclosed now rather than at the door.'],
        chip: 'Rule 10.7',
      },
      delivered: 'Fewer wasted Saturdays for the buyer and fewer wasted Saturdays for the salesperson. The disclosure is not a risk here, it is the reason they trust the rest.',
      funder: 'Funded by the office. A viewing that was never going to work costs both sides an afternoon.',
    },
    {
      key: 'offer', name: 'The Offer Wait', when: 'After the offer goes in',
      feels: 'the longest 24 hours of the month',
      screen: {
        title: 'Where your offer actually is',
        lines: ['Presented. Under consideration. Countered.',
                'Not “we will be in touch”.'],
        chip: 'Every offer, on the record',
      },
      delivered: 'The buyer stops phoning to ask, and the record the Code already requires becomes the thing the buyer can see.',
      funder: 'Funded by the office. Rule 10.12 already requires every written offer to be retained for twelve months.',
    },
    {
      key: 'cond', name: 'The Conditions', when: 'Ten working days of due diligence',
      feels: 'chasing four people at once',
      screen: {
        title: 'Your conditions, tracked',
        lines: ['Finance, LIM, builder, insurance — who has what.',
                'What is late, and who to ring about it.'],
        chip: 'Drafted, never sent for you',
      },
      delivered: 'The buyer runs their own due diligence with a list that updates itself, instead of a diary note and four unanswered emails.',
      funder: 'Funded by the office, and by the salesperson getting their week back.',
    },
    {
      key: 'settle', name: 'The Run To Settlement', when: 'Unconditional, then silence',
      feels: 'waiting on strangers',
      screen: {
        title: 'What happens between now and the keys',
        lines: ['The dates that matter, in order, with names against them.',
                'Nothing here moves money or signs anything.'],
        chip: 'A person holds every step',
      },
      delivered: 'The gap where a buyer usually hears nothing becomes the gap where they hear the plan. It is also where the referral is won.',
      funder: 'Funded by the office. This is the stretch that decides whether the buyer recommends the salesperson.',
    },
  ],
};
