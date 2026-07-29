export default {
  title: 'Every waiting moment in a parcel journey',
  lede: 'Six real gaps between ordering and holding the box, and what each one could say instead of a status code.',
  moments: [
    {
      key: 'ordered',
      name: 'The Order Wait',
      when: 'From checkout to first scan',
      feels: 'about a day of nothing',
      screen: {
        title: 'Your parcel has a number',
        lines: [
          'The seller has printed the label.',
          'No scan yet. That is normal at this stage.'
        ],
        chip: '+2 min back'
      },
      delivered: 'They stop refreshing, because the page finally says what the silence means.',
      funder: 'The retailer who sold it — these are the "where is my order" emails they answer anyway.'
    },
    {
      key: 'network',
      name: 'The Depot Silence',
      when: 'Between scans, across the country',
      feels: 'a few days that all look the same',
      screen: {
        title: 'Moving, just not scanning',
        lines: [
          'Scanned twice since it left the sender.',
          'Long gaps between scans are normal here.'
        ],
        chip: '+3 min back'
      },
      delivered: 'The gap gets a reason, so a quiet week stops looking like a lost parcel.',
      funder: 'Funded by the business, because a tracking check that answers itself never becomes a call.'
    },
    {
      key: 'out-for-delivery',
      name: 'The Delivery Window',
      when: 'Out for delivery, all day',
      feels: 'the day you cannot leave the house',
      screen: {
        title: 'On a van near you',
        lines: [
          'Your street is later in the run today.',
          'Tell us a safe place and stop waiting.'
        ],
        chip: 'Safe place saved'
      },
      delivered: 'They get their afternoon back, and the driver gets somewhere to leave it.',
      funder: 'Funded by the business — a safe place agreed up front is one delivery attempt, not two.'
    },
    {
      key: 'missed',
      name: 'The Missed Knock',
      when: 'Card left, parcel redirected',
      feels: 'a detour you did not plan',
      screen: {
        title: 'Nobody home, so it moved',
        lines: [
          'Here is where it went, and what to bring.',
          'Sending someone else? Give us their name.'
        ],
        chip: '+4 min back'
      },
      delivered: 'A card in the letterbox turns into an address, a time and a plan.',
      funder: 'The shop hosting the counter — the pick-up is foot traffic they already want.'
    },
    {
      key: 'delivered',
      name: 'The Delivered Gap',
      when: 'Marked delivered, not in hand',
      feels: 'ten minutes of low panic',
      screen: {
        title: 'Delivered — here is where',
        lines: [
          'Photo of the spot it was left in.',
          'Not there? Say so now, not in three days.'
        ],
        chip: 'Report in 1 tap'
      },
      delivered: 'The photo settles it, or the problem starts on the day it happened.',
      funder: 'Funded by the business, because a same-day report is far easier to resolve than a week-old one.'
    },
    {
      key: 'gone-wrong',
      name: 'The Enquiry Wait',
      when: 'After you report it missing',
      feels: 'most of a week with no name attached',
      screen: {
        title: 'Someone is looking for it',
        lines: [
          'Last scan, last handler, next check.',
          'You will hear from a person, not a form.'
        ],
        chip: 'Named handler'
      },
      delivered: 'The search stops being invisible, so they stop ringing to check it is happening.',
      funder: 'Funded by the business — a chase call about an open enquiry costs more than the update does.'
    }
  ]
}
