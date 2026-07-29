// Wait map — Ryman Healthcare (independent concept, not affiliated with or endorsed by Ryman)
// Six real waits in a family's move, in journey order: the guides, the visit, the drive home,
// the siblings, the first fortnight, the first small job.
// Emphasis: the family waiting on each other. The waits here are relational before they are administrative.
// Only Ryman's own published things are named — the free guides, "It's all taken care of", myRyman Care.
// No points chips. You do not gamify a family deciding about their mother.
export default {
  title: 'Every wait a family sits through',
  lede: 'Six moments where a family is waiting on this decision. Most of them are about each other, not about the village.',
  moments: [
    {
      key: 'guides',
      name: 'Waiting on the guides',
      when: 'Form sent, inbox empty',
      feels: 'you asked at ten at night and now you wait',
      screen: {
        title: 'Opened where you asked',
        lines: [
          'You said the money worried you. Start there.',
          'Nobody rings you about this. Read it first.'
        ],
        chip: 'nobody rings'
      },
      delivered: 'The guides Ryman already gives away open on this family’s worry instead of on page one.',
      funder: 'Ryman itself. A guide that answers nothing is followed by a phone call that has to answer everything.'
    },
    {
      key: 'visit',
      name: 'Before the visit',
      when: 'Booked for Saturday, weeks away',
      feels: 'three weeks to build it up in your head',
      screen: {
        title: 'What to ask on Saturday',
        lines: [
          'Six questions, from what you already told us.',
          'Take them or leave them. Nothing is sent.'
        ],
        chip: 'yours to keep'
      },
      delivered: 'The family walks in with their own questions written down instead of nodding through a tour.',
      funder: 'Ryman itself. A visit where nobody asks the real question ends in a second visit.'
    },
    {
      key: 'drive',
      name: 'The drive home',
      when: 'Tour over, nobody talking',
      feels: 'three people who saw three different places',
      screen: {
        title: 'What each of you noticed',
        lines: [
          'You wrote the garden. He wrote the stairs.',
          'Neither of you has to raise it first.'
        ],
        chip: 'her words too'
      },
      delivered: 'The thing nobody wanted to say in the car is already written down, in everyone’s own words.',
      funder: 'Ryman itself, out of its own budget. Nothing about this drive should be sponsored, and nothing here is.'
    },
    {
      key: 'siblings',
      name: 'Between the siblings',
      when: 'Group chat, two time zones',
      feels: 'the one who lives closest decides by default',
      screen: {
        title: 'Everyone on the same page',
        lines: [
          'Perth gets this when Papakura gets it.',
          'Nobody hears it third-hand on Sunday.'
        ],
        chip: 'all of you'
      },
      delivered: 'The brother overseas stops finding things out three days late and second-hand.',
      funder: 'Ryman itself. A decision one sibling carries alone is the one that stalls, and a stalled decision costs everybody.'
    },
    {
      key: 'settling',
      name: 'The first fortnight',
      when: 'Moved in, phone silent',
      feels: 'you do not want to ring and check every day',
      screen: {
        title: 'She had a good week',
        lines: [
          'Bowls on Tuesday. Her sister came Thursday.',
          'Sent because she said you could see it.'
        ],
        chip: 'she said yes'
      },
      delivered: 'The family hears how her week went without ringing to ask whether her week went well.',
      funder: 'Ryman itself. This runs on her consent or it does not run, and no sponsor belongs anywhere near it.'
    },
    {
      key: 'small-job',
      name: 'The dripping tap',
      when: 'Reported Monday, still dripping',
      feels: 'you mentioned it once and now you are counting days',
      screen: {
        title: 'Someone is coming Friday',
        lines: [
          'Your tap is on the list, with a name on it.',
          'You will not have to mention it again.'
        ],
        chip: 'it has a name'
      },
      delivered: '“It’s all taken care of” is a promise about small jobs like this one, and this is where it gets kept.',
      funder: 'Ryman itself. A job chased three times by phone costs more than a job that reports its own progress.'
    }
  ]
}
