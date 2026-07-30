/**
 * Bayleys — the six waits on the VENDOR side, which is the harder side and the
 * one nobody builds for.
 *
 * Their own line is "We bring greater energy to everything we do", and they run
 * residential, commercial and rural. Commercial is where the appraisal question
 * bites hardest, because rule 10.2(c) requires comparable information and a
 * vacant tenancy in a thin market often has none — which rule 10.3 says you must
 * then explain in writing.
 */
export default {
  title: 'Every wait a vendor sits through, from appraisal to settlement',
  lede: 'Six gaps where the person who has trusted you with their largest asset hears nothing. Each one is already yours; none of them is currently worth anything to them.',
  moments: [
    {
      key: 'appraise', name: 'The Appraisal', when: 'Before they will sign anything',
      feels: 'being sold a number',
      screen: {
        title: 'The number, and what stands behind it',
        lines: ['Every comparable sale it used, named and dated.',
                'Where none exist, it says so in writing instead.'],
        chip: 'Rule 10.2(c) · rule 10.3',
      },
      delivered: 'The vendor gets an appraisal they can interrogate, and the licensee gets a written record that already satisfies the rule they are most often complained about under.',
      funder: 'Funded by the office. An appraisal that shows its comparables wins the listing against one that does not.',
    },
    {
      key: 'market', name: 'The Campaign Build', when: 'Between signing and going live',
      feels: 'a week of guessing',
      screen: {
        title: 'Your listing, drafted from the photographs',
        lines: ['Copy that describes what is in the frame and nothing else.',
                'Known defects included, because leaving them out is the breach.'],
        chip: 'Rule 6.4 · rule 10.7',
      },
      delivered: 'Advertising drafted in an hour instead of a week, and drafted by something that cannot be tempted to describe a room it has not seen.',
      funder: 'Funded by the office. This is the single largest time saving in the whole journey.',
    },
    {
      key: 'live', name: 'The First Fortnight', when: 'Views climbing, phone quiet',
      feels: 'watching a number and learning nothing',
      screen: {
        title: 'What the traffic is actually telling you',
        lines: ['Which photograph they stop on and which they skip.',
                'The question three separate buyers asked.'],
        chip: 'No buyer is identified',
      },
      delivered: 'The vendor learns what the market is reacting to while there is still time to change the campaign, rather than at the price conversation in week four.',
      funder: 'Funded by the office. The alternative is a vendor who only ever hears “good interest”.',
    },
    {
      key: 'talk', name: 'The Price Conversation', when: 'Week four, no offers',
      feels: 'the call they have been dreading',
      screen: {
        title: 'Before the conversation, the evidence',
        lines: ['What has sold since the appraisal, and for what.',
                'What changed in the market, not in your opinion of it.'],
        chip: 'Drafted for a licensee',
      },
      delivered: 'The hardest conversation in the job, walked into with a written record rather than a feeling. The licensee still has it, and still decides what to say.',
      funder: 'Funded by the office, and by the listings that stop expiring.',
    },
    {
      key: 'offers', name: 'The Multi-Offer', when: 'Two offers, one afternoon',
      feels: 'the fastest, most consequential hour',
      screen: {
        title: 'Both offers, side by side, in plain words',
        lines: ['Price, conditions, dates, and what each one risks.',
                'It never ranks them for you.'],
        chip: 'Rule 10.12 · retained 12 months',
      },
      delivered: 'A vendor who can actually compare two offers, and a file that already holds what the Code requires you to keep.',
      funder: 'Funded by the office. A vendor who understood the choice does not complain about it afterwards.',
    },
    {
      key: 'settle', name: 'The Unconditional Gap', when: 'Sold, then weeks of silence',
      feels: 'sold and forgotten',
      screen: {
        title: 'Between sold and settled',
        lines: ['Every date, every party, what is outstanding.',
                'Nothing moves money and nothing signs.'],
        chip: 'A person holds every step',
      },
      delivered: 'The stretch where a vendor usually hears nothing becomes the stretch that earns the next listing from them, and from everyone they talk to.',
      funder: 'Funded by the office. This is where repeat business is either made or quietly lost.',
    },
  ],
};
