/* Ryman · the unbroken thread — all copy lives here. No prose in markup.
   Every number is cited or labelled simulated. Build state and evidence state
   are separate labels, per the reconciled taxonomy. */

export const DATA = {
  id: 'ryman-thread',
  client: {
    name: 'Ryman Healthcare',
    sector: 'retirement villages and aged care',
    status: 'proposed',
  },

  metaphor: {
    word: 'continuity',
    sentence: 'One thread carries the family’s story through every room and every handover, and it never breaks.',
  },

  proposition: 'When a resident’s needs change, the family should not have to tell the story again — to anyone, ever.',

  disclosure: 'an independent concept for Ryman Healthcare · by assembl',

  define: {
    a: 'assembl designs and runs agentic customer journeys.',
    b: 'assembling is the wait-state layer: it turns a natural waiting moment into useful, permissioned, rewarded work that improves the customer’s next step — while a named human stays in control.',
  },

  /* ── the seven answers ─────────────────────────────────────── */
  wait: {
    moment: 'the weeks between “Dad’s needs have changed” and a care plan the whole family trusts',
    clock: {
      value: 'contact within 2 weeks of referral · 2 working days if urgent',
      source: 'Needs Assessment and Service Coordination (NASC), govt.nz',
      url: 'https://www.govt.nz/browse/health/help-in-your-home/needs-assessment/',
      simulated: false,
    },
    whyItExists: 'A change in care needs runs through real checks: a referral, an interRAI needs assessment by a qualified assessor, and — if a subsidy is sought — a means assessment. Each belongs to someone whose judgement the law protects.',
    todayItFeelsLike: 'The same story, told to the GP, the assessor, the village, and every shift change — by a family already carrying enough.',
  },

  hero: {
    headline: 'the story, told once',
    line: 'Eleven years in the village. One morning it changes. Everything the family has already said travels with them — and nothing they didn’t agree to.',
    cue: 'follow the thread',
  },

  trigger: {
    heading: 'the morning it changes',
    body: 'Bill had a stroke on a Tuesday. He and Joan have lived in their Ryman apartment for eleven years. His needs have changed; hers haven’t. What happens next involves a referral, an assessment, and decisions in rooms Joan has never seen — and today, every one of those rooms starts by asking her to tell the story again.',
    persona: 'Joan and Bill · residents for eleven years · simulated persona',
    modes: {
      heading: 'two front doors, two levels of consent',
      prospective: 'A family enquiring for the first time: the thread starts empty, and fills only with what they choose to put on it.',
      existing: 'An existing resident’s family: the thread already holds eleven years. It moves only with Bill’s own yes — or his enduring power of attorney, once activated — and the page says so before anything travels.',
    },
  },

  phone: {
    label: 'the village companion',
    status: 'needs assessment · referred to the NASC — contact due within 2 weeks',
    statusNote: 'published clock · govt.nz',
    scope: 'I can carry what your family has already said, prepare the practical side, and tell you where things are. I never see Bill’s clinical notes, and I never make a care decision — those belong to the assessor and to people.',
    choices: [
      'What happens next, in order?',
      'Keep Joan’s week unchanged',
      'Who sees Bill’s health details?',
      'I just want to talk to a person',
    ],
    answers: [
      'Referral → NASC contact (within 2 weeks — the published clock) → interRAI assessment → the transition brief → Rose’s review. Each step lands here as it happens.',
      'Kept as a hard preference: Joan’s bridge night, the garden group and Sunday’s call stay untouched in every plan the thread carries.',
      'Only the interRAI assessor and the clinical team. The family strand carries routines and practicalities — never clinical notes. That exclusion is written on the receipt.',
      'Of course. This goes straight to the village office and a person will ring you. The agent does not answer this one — by design.',
    ],
    choiceNote: 'The last one always reaches a person at the village — it is never answered by the agent.',
    connection: 'demonstration · no live connection · nothing here reaches Ryman systems',
  },

  /* ── the journey room · five chapters ──────────────────────── */
  rooms: [
    {
      id: 'change',
      title: 'the morning it changes',
      underneath: 'The GP’s referral goes to the Needs Assessment and Service Coordination service. The clock that starts is real: contact within two weeks, two working days if urgent.',
      customer: 'Joan answers one question — who is part of this decision — and chooses what the thread may carry.',
      specialist: 'The routines agent may read what the family has already told the village: visitors, meals, the garden group, the Tuesday quiz. Nothing clinical.',
      human: 'The referral itself is the GP’s. The agent cannot make one.',
      object: 'The thread begins: a consent record naming what travels, and one thing that never will.',
      proof: 'Consent, timestamped, with the exclusion stated.',
    },
    {
      id: 'story',
      title: 'the story, told once',
      underneath: 'Eleven years of the practical story already exists in fragments — the village office, the activities list, the family’s emails.',
      customer: 'Joan checks the gathered story and corrects one thing. She does not retell anything.',
      specialist: 'The routines agent assembles the routines brief: how Bill takes his tea, what calms him, which grandchild rings on Sundays.',
      human: 'Bill’s yes — or his enduring power of attorney, once activated — before the brief moves anywhere. Stronger consent is the price of an existing resident’s thread, and the page says so.',
      object: 'The routines brief — one page the family never has to say out loud again.',
      proof: 'Every source named; every correction kept.',
    },
    {
      id: 'assessment',
      title: 'the assessment',
      underneath: 'An interRAI needs assessment by a qualified assessor — the judgement the law protects. The agent cannot do it, schedule it, or see inside it.',
      customer: 'The family sees where things are — referral received, contact made, visit booked — without ringing anyone.',
      specialist: 'At handover, the GP summary travels to the assessor only. The family strand keeps the practical layer. The split is visible on the thread.',
      human: 'The interRAI-qualified needs assessor. Named on the record when the assessment is booked.',
      object: 'The assessor arrives already holding the routines brief — and starts with a better first question than “tell me about Bill”.',
      proof: 'What travelled to whom, and what was withheld from the family view.',
    },
    {
      id: 'divergence',
      title: 'the divergence',
      underneath: 'The assessment recommends the care centre for Bill. Joan stays in the apartment. One couple, two doors — the moment most systems break the story in half.',
      customer: 'Joan sees both paths on one thread: Bill’s move, her unchanged week, and the one decision waiting on a person.',
      specialist: 'While the assessment ran, the means agent drafted the Residential Care Subsidy pack — the second clock the family had not started. Joan’s partner-at-home position is prepared, not submitted.',
      human: 'Rose, the Village Care Manager · simulated persona — reads the transition brief before anything moves. The page stops here.',
      object: 'The transition brief: Bill’s routines, the family’s corrections, the drafted subsidy pack, the open questions.',
      proof: 'The hold, timestamped. What the agent did not do while it waited.',
    },
    {
      id: 'two-doors',
      title: 'one village, two doors',
      underneath: 'Bill settles in the care centre; Joan is four minutes’ walk away. The next shift change, the next nurse, the next activities coordinator — each starts from the brief, not from zero.',
      customer: 'Joan’s week is unchanged. Sunday’s call still comes. The thread holds.',
      specialist: 'The record agent writes the proof: what travelled, who read it, what was never shared.',
      human: 'Care decisions stay with the clinical team, permanently. The thread carries context; it never carries the decision.',
      object: 'One unbroken record — the story, told once, still true at every handover.',
      proof: 'The full receipt, below.',
    },
  ],

  /* ── value of the wait ─────────────────────────────────────── */
  value: {
    heading: 'what the weeks were worth',
    items: [
      { what: 'the routines brief', detail: 'assembled and family-checked before the assessor’s first visit — so the assessment starts at the assessment, not at the biography.' },
      { what: 'the subsidy pack, drafted', detail: 'the Residential Care Subsidy means assessment is its own clock. The asset thresholds are published — $300,811, or $164,731 excluding the home and car while Joan remains in it. The pack was drafted inside the first wait, not started after it.' },
      { what: 'zero retellings', detail: 'the number this journey exists to move. Today it is uncounted; the pilot counts it.' },
    ],
    thresholdSource: {
      claim: 'Residential Care Subsidy asset thresholds: $300,811, or $164,731 excluding home and car where a partner remains at home.',
      source: 'Work and Income — Residential Care Subsidy',
      url: 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-subsidy.html',
      simulated: false,
    },
  },

  /* ── the gate ──────────────────────────────────────────────── */
  gate: {
    role: 'Rose, the Village Care Manager',
    roleNote: 'simulated persona · the role is real',
    deciding: 'whether the transition brief is complete and true before Bill’s move is planned',
    rule: 'Care and clinical decisions are made by qualified people — the interRAI assessor for needs, the clinical team for care. The agent prepares; it never decides. Nothing in a sales or transition journey ever promotes a care or medical product.',
    release: 'Reviewed and signed — Rose',
  },

  /* ── proof receipt · six rows ──────────────────────────────── */
  receipt: {
    heading: 'the receipt',
    intro: 'One page a family — or an auditor — can actually read. Simulated contents, real shape.',
    rows: [
      { label: 'read log', body: 'Village activity records, the family’s three emails, Joan’s corrections — each timestamped NZT, each with the reason it was read.' },
      { label: 'the working', body: 'How the routines brief was assembled: eleven sources in, one page out, every line traceable to who said it.' },
      { label: 'held actions', body: 'Did not read Bill’s clinical notes — not permitted, ever. Did not book the assessment — the NASC owns its own diary. Did not submit the subsidy pack — drafted only, awaiting the family.' },
      { label: 'sign-off', body: 'Rose, Village Care Manager — transition brief, reviewed and signed. The assessment itself: the interRAI assessor’s alone.' },
      { label: 'indirect collection', body: 'The GP referral came from a source other than Bill. Under Information Privacy Principle 3A (in force 1 May 2026), Bill was notified of what was collected and from where.' },
      { label: 'revocation', body: 'Consent as it stood, and one link to withdraw it. Withdrawing stops the thread; it never stops Bill’s care.' },
    ],
  },

  /* ── pilot ─────────────────────────────────────────────────── */
  pilot: {
    heading: 'where this could start',
    body: 'One village. The existing-resident transition thread only — referral to assessment to transition brief — run alongside the current process, changing nothing clinical.',
    measures: [
      { metric: 'retellings per transition', note: 'how many times the family repeats the story — counted today, counted with the thread. The number this concept exists to move.' },
      { metric: 'referral-to-contact days', note: 'against the published two-week NASC clock — not to speed the NASC, but to fill the wait with preparation.' },
      { metric: 'family confidence', note: 'one question, asked twice: “do you feel the village knows Bill?” — before the transition and after it.' },
    ],
    label: 'proposed assembl concept',
  },

  /* ── boundary ──────────────────────────────────────────────── */
  boundary: {
    heading: 'what is real here, and what is proposed',
    published: [
      'NASC contact within 2 weeks of referral, 2 working days if urgent — govt.nz.',
      'Needs assessment via interRAI, by qualified assessors.',
      'Residential Care Subsidy thresholds — Work and Income.',
      'Information Privacy Principle 3A, in force 1 May 2026.',
    ],
    proposed: [
      'The thread, the routines brief, the village companion and the transition receipt are proposed assembl concepts. None of them exists at Ryman.',
      'Rose, Joan and Bill are simulated personas. Aged-care bed availability and transition timelines are not published; none are shown.',
      'Nothing here is a needs assessment, a care recommendation or financial advice.',
    ],
  },

  footer: {
    disclaimers: [
      'Nothing here is built, endorsed or run by Ryman Healthcare.',
      'No customer or resident data was used — every person on this page is simulated.',
      'No Ryman brand assets are reproduced.',
      'This page is not a needs assessment, a care recommendation or financial advice.',
    ],
    references: [
      { n: 1, text: 'Needs assessment (NASC) — govt.nz', url: 'https://www.govt.nz/browse/health/help-in-your-home/needs-assessment/' },
      { n: 2, text: 'Residential Care Subsidy — Work and Income', url: 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-subsidy.html' },
      { n: 3, text: 'Privacy Act 2020, IPP 3A — Office of the Privacy Commissioner', url: 'https://www.privacy.org.nz/privacy-act-2020/privacy-principles/' },
    ],
    mark: 'assembled by assembl · Mahi that earns its proof.',
  },
};
