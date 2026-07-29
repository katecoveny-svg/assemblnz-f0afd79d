export default {
  title: 'Every waiting moment in a health claim',
  lede: 'Six gaps between a referral and the last invoice, and what a member could be told in each one.',
  moments: [
    {
      key: 'covered',
      name: 'The Covered Question',
      when: 'Before you book anything',
      feels: 'an evening spent reading a policy',
      screen: {
        title: 'What your cover says here',
        lines: [
          'Your policy, read against this referral.',
          'The parts that need a person, flagged.'
        ],
        chip: '+5 min back'
      },
      delivered: 'They work out what to ask the specialist before the appointment, not after it.',
      funder: 'Funded by the business, because "am I covered for this" is the cheapest question to answer early.'
    },
    {
      key: 'approval',
      name: 'The Approval Wait',
      when: 'Prior approval, sent and waiting',
      feels: 'the week your surgery date depends on',
      screen: {
        title: 'Your approval, in progress',
        lines: [
          'What has arrived from your specialist.',
          'What is still needed, and who has it.'
        ],
        chip: '+6 min back'
      },
      delivered: 'They can see whether the hold-up sits with them or with the clinic.',
      funder: 'Funded by the business — a member who can see the hold-up does not ring to ask about it.'
    },
    {
      key: 'booked',
      name: 'The Booked Gap',
      when: 'Approved, waiting on a date',
      feels: 'weeks of arranging life around a maybe',
      screen: {
        title: 'Before the day itself',
        lines: [
          'What to organise, in the order it matters.',
          'Time off, transport, someone to drive you.'
        ],
        chip: 'Checklist saved'
      },
      delivered: 'The practical list arrives in time to act on, not the night before.',
      funder: 'The hospital or clinic doing the procedure — a patient who turns up ready is a theatre list that runs on time.'
    },
    {
      key: 'invoice',
      name: 'The Invoice Wait',
      when: 'After the day, before the bill',
      feels: 'a fortnight braced for a number',
      screen: {
        title: 'What is paid, and by whom',
        lines: [
          'Invoices in, matched to your approval.',
          'Anything you may be asked for, early.'
        ],
        chip: '+4 min back'
      },
      delivered: 'Nobody gets surprised by an envelope six weeks after they went home.',
      funder: 'Funded by the business — a cost explained in advance is not a complaint later.'
    },
    {
      key: 'shortfall',
      name: 'The Shortfall',
      when: 'When the claim is part-paid',
      feels: 'an hour comparing two documents',
      screen: {
        title: 'Why there is a shortfall',
        lines: [
          'The charge, and the part your cover met.',
          'Where the difference came from, in plain words.'
        ],
        chip: '+7 min back'
      },
      delivered: 'The gap between two numbers gets a reason, not a reference number.',
      funder: 'Funded by the business, because an unexplained shortfall is the thing members tell other people about.'
    },
    {
      key: 'letter',
      name: 'The Letter Home',
      when: 'A decision you did not expect',
      feels: 'the afternoon that ruins a week',
      screen: {
        title: 'What this letter means',
        lines: [
          'What happened, and what it changes for you.',
          'What you do next, if anything.',
          'A named reviewer reads this first.'
        ],
        chip: 'Named reviewer'
      },
      delivered: 'Three questions get answered in the same envelope, instead of one.',
      funder: 'Funded by the business, because the contact centre absorbs whatever the letter leaves out.'
    }
  ]
}
