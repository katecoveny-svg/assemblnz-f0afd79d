/**
 * Concept-demo client configs.
 *
 * Every string in `verified` must trace to something the company published.
 * `paletteConfidence:'low'` means the extraction was unreliable and a human
 * must confirm the colours before the link is sent.
 *
 * Used by build.mjs. See ~/.claude/skills/assembling-concept-microsite/SKILL.md.
 */

export const CLIENTS = [
  {
    slug: 'southern-cross',
    object: 'shelter',
    company: 'Southern Cross Health Society',
    short: 'Southern Cross',
    primary: '#009ADE',
    secondary: '#FC6014',
    paletteConfidence: 'high',
    buyerTitle: 'Customer Engagement — Remediation',
    buyerLine: 'Southern Cross Health Society · Auckland',
    execs: {
      remediation: 'Customer Engagement Manager — Remediation',
      cco: 'Chief Customer Officer',
      ceo: 'Chief Executive',
    },
    eyebrow: 'Remediation · a concept',
    h1: ['A hard letter.', 'Prepared properly.', 'Sent by a person.'],
    h1Accent: 1,
    lede: 'You are hiring a Customer Engagement Manager for remediation. That job is a description of one moment done well: a member finds out something went wrong, and everything after that either rebuilds trust or spends it. This is a concept for the preparation, not the decision.',
    quote: '94c of every dollar received in premiums was paid out in claims.',
    quoteCite: 'Southern Cross Health Society · year ended 30 June 2025',
    whyNow: 'Your own job ad, posted this month, asks for remediation communications delivered with “accuracy, empathy and integrity”, driving “fair, ethical and compliant customer outcomes” under the Conduct of Financial Institutions regime.',
    waitTitle: 'The moment the letter lands',
    waitWhen: 'A Tuesday, 8:40am',
    waitBody: 'A member opens an envelope that says something was charged wrongly, or a claim was assessed on the wrong basis. In that moment they have three questions — what happened, what does it mean for me, and what do I have to do — and the letter usually answers the first one only.',
    waitCards: [
      ['What happens now', 'A template goes to thousands. The contact centre absorbs the questions the letter did not answer, one call at a time.'],
      ['What it costs', 'For a not-for-profit that returns 94c in the dollar, a remediation handled coldly costs more in trust than it ever does in redress.'],
      ['What the concept does', 'Prepares each member’s letter against their actual circumstances, flags the ones a person must read, and stops.'],
    ],
    /* The wait, live. The credit is TIME — Southern Cross returns 94c of every
       premium dollar in claims, so a cash sweetener would be the wrong
       instrument entirely. What the member gets back is the call they no longer
       have to make. Note the redress step invents no figure: none was supplied. */
    waitPhone: {
      chrome: 'phone',
      note: 'Illustrative concept screen · not a Southern Cross product · no member data was used',
      skipLabel: 'rather not say',
      scenarios: [{
        id: 'letter', label: 'The letter',
        app: 'About your claim',
        unit: ['', ' min'],
        earning: 'on hold, not spent',
        yours: 'the call they skip',
        told: 'they told you:',
        declined: 'they would rather not say. The letter still gets prepared.',
        steps: [
          { agent: 'Error', doing: 'What went wrong, in two sentences', credit: 6 },
          { agent: 'Yours', doing: 'The claim of theirs it touched', credit: 8 },
          { agent: 'Ask', doing: 'One question', ask: {
            q: 'Would you rather talk than read?',
            options: ['Please call me', 'Writing is fine'],
            learn: ['wants a call before a calculation', 'happy in writing, so send the full working'],
          } },
          { agent: 'Redress', doing: 'Left blank for a person to confirm', credit: 5 },
          { agent: 'Held', doing: 'Waiting on a named reviewer', credit: 9 },
        ],
      }],
    },
    mirrorTitle: 'One remediation. Every member’s version.',
    mirrorKicker: 'The same underlying error, prepared for four different situations. Every draft stops before it sends, and the ones that need a human say so.',
    variants: [
      {
        key: 'simple', label: 'Straightforward',
        chan: 'Remediation letter · member with a single affected claim',
        body: "Kia ora,\n\nWe have found an error in how one of your claims was assessed, and we are putting it right.\n\nWhat happened: between March and August, a small number of claims were assessed using an out-of-date benefit limit. One of yours was affected.\n\nWhat it means for you: you were out of pocket by an amount we have now calculated. It will be paid back to your nominated account within ten working days. You do not need to do anything.\n\nIf you would like to talk it through, you can call us and we will have your file open before you finish explaining.",
        rules: [
          'Names what happened before it names the remedy',
          'States plainly that the member does not need to act',
          'No apology-shaped sentence that avoids saying what went wrong',
          'The redress figure is left for a person to confirm — it was not supplied to this concept',
        ],
      },
      {
        key: 'complex', label: 'Multiple claims',
        chan: 'Remediation letter · member with several affected claims over two years',
        body: "Kia ora,\n\nWe have found an error affecting more than one of your claims, and we want to explain it properly rather than briefly.\n\nWhat happened: an out-of-date benefit limit was applied to claims assessed between March and August. Several of yours fall inside that period.\n\nWhat it means for you: each affected claim has been recalculated individually. We have listed them on the enclosed page so you can check them against your own records — please tell us if anything is missing.\n\nWhat we are doing: the total will be paid back to your nominated account. If you would prefer it applied against your premium instead, call us and we will arrange that.",
        rules: [
          'Longer, because the situation is more complicated — length follows the member, not the template',
          'Invites the member to check the working rather than asking them to trust it',
          'Offers a genuine choice about how redress is applied',
          'Flagged for a person: multi-claim cases are never sent unreviewed',
        ],
      },
      {
        key: 'sensitive', label: 'Sensitive claim',
        chan: 'Remediation letter · claim relates to a serious health event',
        body: "Kia ora,\n\nWe are writing about a claim from a time that we know was not an easy one for you.\n\nWe have found that it was assessed using an out-of-date benefit limit, and that you were left out of pocket as a result. That should not have happened, and we are sorry.\n\nWe have recalculated it. Rather than set out the detail in a letter, we would like to talk it through with you at a time that suits — one person, who will have read your file first.\n\nIf you would rather have it in writing, tell us and we will send the full working instead.",
        rules: [
          'Held back from the bulk send entirely — routed to a named person first',
          'Does not lead with the mechanics of the error',
          'Offers a conversation before it offers a calculation',
          'Never assumes which format the member wants',
        ],
      },
      {
        key: 'deceased', label: 'Member has died',
        chan: 'Held — not sent · estate contact required',
        body: "This letter was not drafted.\n\nThe member record carries a date of death. A remediation letter addressed to someone who has died, arriving at a family home, is the kind of harm that no amount of redress repairs.\n\nHeld for a named person to decide the right approach — which may be the estate’s nominated contact, or may be nothing at all.\n\nNo draft has been prepared, because the right first step here is a decision, not a letter.",
        rules: [
          'The most important output is the one that refuses to produce a letter',
          'Deceased-member records are checked before any draft is written, not after',
          'Escalated with the reason attached, not silently dropped from the run',
          'A person decides whether anything is sent at all',
        ],
      },
    ],
    guardTitle: 'The check that runs before a person ever reads it',
    guardLede: 'Remediation is where a well-meaning template does the most damage. These are the checks that catch it — and the ones that block are the point.',
    guardBtn: 'Run the checks on the batch',
    guard: [
      { ok: true, t: 'Plain language, no hedging', d: 'The draft says what went wrong in the first two sentences. Passive constructions that avoid naming the error were rewritten.', law: 'Fair Trading Act 1986 · CoFI fair-conduct principle' },
      { ok: true, t: 'The member is told whether they must act', d: 'Every draft answers “what do I have to do” explicitly, including when the answer is nothing.', law: 'CoFI · fair, ethical and compliant outcomes' },
      { ok: false, t: 'Held — 41 records carry a date of death', d: 'No letter was drafted for any of them. Routed to a named person to decide the approach, which may be no contact at all.', law: 'Privacy Act 2020 · harm prevention' },
      { ok: false, t: 'Held — 12 members flagged as vulnerable', d: 'Removed from the bulk run. A conversation is offered before a calculation, and a person chooses who makes the call.', law: 'CoFI · vulnerable-customer obligations' },
      { ok: true, t: 'No redress figure invented', d: 'Every draft leaves the amount for a person to confirm. No figure was supplied to this concept and none was guessed.', law: 'Fair Trading Act 1986' },
    ],
    opsTitle: 'The batch, before anything sends',
    opsCols: ['Cohort', 'Affected', 'Prepared', 'Waiting on', 'Status'],
    ops: [
      ['Single claim, straightforward', '—', 'Letter drafted, redress left blank', 'Remediation lead sign-off', 'wait', 'Awaiting approval'],
      ['Multiple claims over two years', '—', 'Letter plus itemised working', 'Remediation lead sign-off', 'wait', 'Awaiting approval'],
      ['Claim relates to a serious event', '—', 'Conversation offered first', 'Named person per member', 'hot', 'Held from bulk send'],
      ['Member record shows date of death', '—', 'Nothing drafted', 'A decision, not a letter', 'hot', 'Held — no draft'],
      ['Flagged vulnerable', '—', 'Nothing drafted', 'Named person to choose approach', 'hot', 'Held — no draft'],
      ['Contact details incomplete', '—', 'Draft held', 'Address verification', 'ok', 'Parked'],
    ],
    opsNote: 'Cohort sizes are deliberately blank. This concept has no Southern Cross data and does not estimate how many members anything affects.',
    receiptArtefact: 'Remediation letter — single affected claim',
    receiptRead: 'Remediation scope note (placeholder) · benefit schedule (placeholder) · member record fields: affected claims, date of death, vulnerability flag',
    receiptRules: 'Conduct of Financial Institutions regime · Fair Trading Act 1986 · Privacy Act 2020 · Health Information Privacy Code 2020',
    receiptRefused: 'No redress amount was calculated or stated. No letter was drafted for a deceased or flagged-vulnerable member.',
    pilotScope: 'One remediation cohort, start to finish. Six weeks. Not the whole programme, not the contact centre, not the underlying assessment.',
    pilotAccess: 'The remediation scope note, your letter templates, and the field names that mark a deceased or vulnerable member. No member records. No health information. No claims data.',
    pilotScorecard: 'Drafts accepted without rewrite. Held cases a person agreed should have been held. Contact-centre calls that the letter would have caused. One remediation lead’s honest answer to “would you send this?”',
    verified: [
      'Southern Cross Health Society describes itself as “NZ owned and not-for-profit”.',
      'It reported more than 951,000 members as at 30 June 2025.',
      'For the year ended 30 June 2025, “94c of every dollar received in premiums” was paid out in claims.',
      'It paid 68% of the value of all health insurance claims in the New Zealand market.',
      'Its stated purpose is to provide “peace of mind so you and your family can get back to feeling good, faster”.',
    ],
    laws: 'Conduct of Financial Institutions (CoFI) regime, Fair Trading Act 1986, Privacy Act 2020, and the Health Information Privacy Code 2020.',
    verbNoun: 'remediation concept',
  },

  {
    slug: 'nzpost',
    object: 'parcel',
    company: 'NZ Post',
    short: 'NZ Post',
    primary: '#0068FF',
    secondary: '#32A465',
    paletteConfidence: 'high',
    buyerTitle: 'Customer Experience',
    buyerLine: 'NZ Post · Aotearoa New Zealand',
    execs: { cx: 'Customer Experience', ops: 'Delivery Operations', digital: 'Digital' },
    eyebrow: 'The parcel wait · a concept',
    h1: ['“Where is', 'my parcel?”', 'Answered before they ask.'],
    h1Accent: 2,
    lede: 'The single most repeated question in New Zealand logistics. Your tracking page today is a gateway — it takes the enquiry and routes it. This is a concept for the ninety seconds before someone gives up on tracking and picks up the phone.',
    quote: 'A tracking number that says “in transit” answers none of the three things the customer actually wants to know.',
    quoteCite: 'What we found reading nzpost.co.nz',
    whyNow: 'We read your own tracking page. It offers a parcel enquiry and a link to FAQs, and it does not state a delivery timeframe, when a parcel is considered lost, how an investigation works, or what compensation applies.',
    waitTitle: 'The parcel that has not moved since Thursday',
    waitWhen: 'Monday, 7:15pm',
    waitBody: 'Someone refreshes a tracking page for the fourth time. The status has not changed. They do not know whether that is normal, whether it is lost, whether anyone is looking, or whether they should buy another one. So they ring you — and the person who answers has to start from nothing.',
    waitCards: [
      ['What happens now', 'A status code, a link to an enquiry form, and a call that begins with “can I take your tracking number”.'],
      ['What it costs', 'Every unanswered tracking check becomes a contact. The cheapest contact is the one the tracking page prevented.'],
      ['What the concept does', 'Turns the status into an answer, in the wait, and hands the hard ones to a person with the file already open.'],
    ],
    /* Two of these steps deliberately name a rule NZ Post has not published
       rather than inventing one. That gap is the pitch — the concept cannot
       answer "is it lost yet" until someone hands over the threshold. */
    waitPhone: {
      chrome: 'phone',
      note: 'Illustrative concept screen · not an NZ Post product · no tracking data was used',
      skipLabel: 'rather not say',
      scenarios: [{
        id: 'parcel', label: 'The parcel',
        app: 'Where is my parcel?',
        unit: ['', ' min'],
        earning: 'on the phone, not spent',
        yours: 'the call they skip',
        told: 'they told you:',
        declined: 'they would rather not say. Tracking still gets assembled.',
        steps: [
          { agent: 'Scan', doing: 'Last movement, and where', credit: 4 },
          { agent: 'Lane', doing: 'How this lane usually runs', credit: 7 },
          { agent: 'Ask', doing: 'One question', ask: {
            q: 'Is there somewhere safe to leave it?',
            options: ['Yes, behind the gate', 'I need to sign'],
            learn: ['safe place behind the gate, so no second attempt', 'signature required, so book a window'],
          } },
          { agent: 'Rule', doing: 'Your lost-parcel threshold — once you give us it', credit: 6 },
          { agent: 'Draft', doing: 'Ready for a person to send', credit: 8 },
        ],
      }],
    },
    mirrorTitle: 'One tracking number. Four honest answers.',
    mirrorKicker: 'The same “in transit” status means four different things. Choose a situation and see what the customer could be told instead of a status code.',
    variants: [
      {
        key: 'normal', label: 'Running normally',
        chan: 'Tracking view · parcel moving as expected',
        body: "Your parcel is on track.\n\nIt was scanned this morning at the Auckland processing centre and is on the network for delivery. Nothing here needs your attention.\n\nIf it has not arrived by the end of the day after the estimated date, we will start looking without you having to ask, and we will tell you we have.",
        rules: [
          'Says plainly that no action is needed — most people just want permission to stop worrying',
          'Commits to a next step and a date rather than leaving it open',
          'No estimated delivery date is invented here — a pilot would read your real network data',
        ],
      },
      {
        key: 'stalled', label: 'Not scanned for three days',
        chan: 'Tracking view · no movement, no exception raised',
        body: "Your parcel has not been scanned since Thursday.\n\nThat is longer than we would expect, and we have not raised an exception on it — so this is us telling you before you had to chase it.\n\nWe have asked the last site that handled it to look. You do not need to do anything yet. If we have not found it by Wednesday we will contact you about what happens next, including what you are covered for.",
        rules: [
          'Volunteers the bad news rather than waiting for the enquiry',
          'Distinguishes “we have not looked yet” from “we have looked and cannot find it” — those are very different to a customer',
          'Names a date for the next contact',
          'Cover is mentioned but no amount is stated — that was not published',
        ],
      },
      {
        key: 'failed', label: 'Delivery attempted, nobody home',
        chan: 'Tracking view · card left, parcel at a collection point',
        body: "We tried to deliver on Friday afternoon and nobody was home, so your parcel is waiting at a collection point near you.\n\nYou will need photo ID that matches the name on the parcel. It will be held for a set period before it is returned to sender — we will tell you the exact date rather than leave you guessing.\n\nIf getting there is difficult, you can redirect it. That is a two-minute job and it is free.",
        rules: [
          'Leads with what happened, not with an instruction',
          'States the requirement (ID) before the customer arrives without it',
          'Holding period is referenced but the exact number is left for real data — store hours and hold periods were not published on the page we read',
        ],
      },
      {
        key: 'damaged', label: 'Arrived damaged',
        chan: 'Held — routed to a person',
        body: "This one is not answered automatically.\n\nA damaged parcel is a claim, and a claim decision belongs to a person with the policy in front of them. What this concept does is prepare the file — the scan history, where the damage most likely occurred, the sender’s cover, and the photographs the customer has already sent.\n\nSo the person who picks it up starts at the decision instead of starting at “can I take your tracking number”.",
        rules: [
          'Refuses to decide a claim — that is a person’s job',
          'Prepares the file so the person starts further along',
          'No cover amount, excess or eligibility is stated; your own page does not publish them and this concept does not guess',
        ],
      },
    ],
    guardTitle: 'What it refuses to say',
    guardLede: 'Most of the harm in delivery communications comes from confident answers. These checks exist to stop them.',
    guardBtn: 'Run the checks on the tracking answers',
    guard: [
      { ok: true, t: 'No delivery promise beyond the network data', d: 'Where an estimated date exists it is quoted; where it does not, the draft says so instead of producing a comforting guess.', law: 'Fair Trading Act 1986' },
      { ok: false, t: 'Blocked — “your parcel will arrive tomorrow”', d: 'The source status did not support it. A missed promise costs more than a vague answer, and generates the call it was meant to prevent.', law: 'Fair Trading Act 1986' },
      { ok: false, t: 'Blocked — compensation amount', d: 'A cover figure was drafted from an old template. Your published tracking page does not state what damage cover includes, so nothing was asserted.', law: 'Fair Trading Act 1986 · CGA 1993' },
      { ok: true, t: 'Claim decisions routed to a person', d: 'Damage and loss are prepared, never decided. The file is assembled; the judgement is not.', law: 'Consumer Guarantees Act 1993' },
      { ok: true, t: 'No personal detail beyond the tracking holder', d: 'Nothing about the sender, the contents, or the address is surfaced to anyone but the person entitled to it.', law: 'Privacy Act 2020' },
    ],
    opsTitle: 'The parcels that need a person today',
    opsCols: ['Situation', 'Volume', 'Prepared', 'Waiting on', 'Status'],
    ops: [
      ['Running normally', '—', 'Reassurance, no action needed', 'Nobody — closes itself', 'ok', 'Answered'],
      ['No scan for 3+ days', '—', 'Proactive note, site asked to look', 'Depot response', 'wait', 'Looking'],
      ['Delivery attempted, card left', '—', 'Collection point, ID needed, redirect offered', 'Nobody — closes itself', 'ok', 'Answered'],
      ['Arrived damaged', '—', 'File assembled for a claims decision', 'A person', 'hot', 'Held — decision'],
      ['Address looks wrong', '—', 'Draft held', 'Customer confirmation', 'wait', 'Awaiting reply'],
      ['Returned to sender', '—', 'Explanation plus options', 'Sender contact', 'wait', 'Awaiting approval'],
    ],
    opsNote: 'Volumes are deliberately blank. This concept has no NZ Post data and does not estimate parcel numbers.',
    receiptArtefact: 'Tracking answer — no scan for three days',
    receiptRead: 'Scan history (placeholder) · network expectations (placeholder) · published delivery information from nzpost.co.nz',
    receiptRules: 'Fair Trading Act 1986 · Consumer Guarantees Act 1993 · Privacy Act 2020',
    receiptRefused: 'No delivery date, compensation amount, hold period or claim outcome was stated — none of these were published on the pages we read.',
    pilotScope: 'One parcel situation — the parcel that has stopped moving. Six weeks. Not claims, not the contact centre, not the app.',
    pilotAccess: 'Your published delivery information and the status codes themselves. No customer records. No addresses. No parcel contents.',
    pilotScorecard: 'Tracking checks that did not become a phone call. Answers a person agreed with. Proactive notes sent before the customer chased. One CX lead’s honest answer to “is this better than the status code?”',
    verified: [
      'NZ Post’s tracking page offers a parcel enquiry and links to FAQs at support.nzpost.co.nz.',
      'That page does not state a standard delivery timeframe.',
      'It does not state when a parcel is considered lost, or how an investigation proceeds.',
      'It does not state what damage cover includes or how to claim.',
    ],
    laws: 'Fair Trading Act 1986, Consumer Guarantees Act 1993, and the Privacy Act 2020.',
    verbNoun: 'parcel-wait concept',
  },

  {
    slug: 'aig',
    object: 'shelter',
    company: 'AIG New Zealand',
    short: 'AIG',
    primary: '#1352DE',
    secondary: '#FF8200',
    paletteConfidence: 'high',
    buyerTitle: 'Customer & Lifecycle',
    buyerLine: 'AIG New Zealand · Auckland',
    execs: { customer: 'Customer & Lifecycle', claims: 'Claims', dist: 'Distribution' },
    eyebrow: 'The claim wait · a concept',
    h1: ['The worst week', 'of their year.', 'Prepared for.'],
    h1Accent: 2,
    lede: 'A commercial claim starts on the worst day a business has had in years. Everything after that is a wait they cannot see into. This is a concept for making that wait legible — without a machine ever deciding a claim.',
    quote: 'Nobody buys insurance for the policy. They buy it for the week they have to use it.',
    quoteCite: 'The premise of this concept',
    whyNow: 'You are advertising for a customer lifecycle role. We also read your own site: of the five things a customer most wants to know before they buy, it answers two.',
    waitTitle: 'The claim that has been open eleven days',
    waitWhen: 'Any Wednesday',
    waitBody: 'A business has lodged a claim and heard nothing since the acknowledgement. They do not know whether an assessor has been assigned, whether their documents were enough, or whether they should be arranging their own repairs. The information exists. It has just never been assembled into an answer.',
    waitCards: [
      ['What happens now', 'The broker chases. The claims handler is across six files. The customer learns things by asking twice.'],
      ['What it costs', 'A commercial claim handled opaquely is a renewal lost eleven months later, for reasons nobody writes down.'],
      ['What the concept does', 'Assembles the state of the claim into something a person can send, and flags what is actually blocking it.'],
    ],
    /* "Are you trading in the meantime?" is the whole argument in one line: it
       is the single most useful thing an insurer could ask a business on day
       eleven, and nobody asks it, because nothing is listening during the wait. */
    waitPhone: {
      chrome: 'phone',
      note: 'Illustrative concept screen · not an AIG product · no claim data was used',
      skipLabel: 'rather not say',
      scenarios: [{
        id: 'claim', label: 'The claim',
        app: 'Claim, day eleven',
        unit: ['', ' min'],
        earning: 'chasing, not spent',
        yours: 'the chase they skip',
        told: 'they told you:',
        declined: 'they would rather not say. The update still gets prepared.',
        steps: [
          { agent: 'State', doing: 'Where the claim actually sits today', credit: 7 },
          { agent: 'Docs', doing: 'What landed, what is still missing', credit: 6 },
          { agent: 'Ask', doing: 'One question', ask: {
            q: 'Are you trading in the meantime?',
            options: ['Reduced capacity', 'Fully stood down'],
            learn: ['trading at reduced capacity, so cashflow is the pressure', 'fully stood down — this is now urgent'],
          } },
          { agent: 'Assessor', doing: 'Assigned, and when they will call', credit: 9 },
          { agent: 'Draft', doing: 'Ready for a person to send', credit: 8 },
        ],
      }],
    },
    mirrorTitle: 'One claim. Four states of the same wait.',
    mirrorKicker: 'The status is “open” in every case. What the customer needs to hear is different every time.',
    variants: [
      {
        key: 'moving', label: 'Progressing',
        chan: 'Claim update · nothing required from the customer',
        body: "Your claim is moving and there is nothing you need to do.\n\nAn assessor has been assigned and has what they need from you. The next step sits with us, not with you.\n\nWe will come back to you when there is a decision or if anything changes — you should not have to chase us to find out where it is.",
        rules: [
          'Leads with “nothing you need to do” — the most valuable sentence in a claim update',
          'Says where the work currently sits',
          'No settlement figure, no date, no outcome is implied',
        ],
      },
      {
        key: 'blocked', label: 'Waiting on the customer',
        chan: 'Claim update · one specific thing is missing',
        body: "Your claim is waiting on one thing.\n\nWe need the repairer’s written quote — not the invoice, the quote before the work. That is the only item outstanding, and once it arrives the file goes straight to assessment.\n\nIf getting it is difficult, tell us and we will work out another way rather than leaving the claim sitting.",
        rules: [
          'Names exactly one thing, and distinguishes it from the thing people usually send by mistake',
          'Says what happens the moment it arrives',
          'Offers a route out if the requirement is hard to meet',
        ],
      },
      {
        key: 'complex', label: 'Complex, genuinely slow',
        chan: 'Claim update · honest about the delay',
        body: "Your claim is taking longer than either of us would like, and it is worth explaining why rather than sending another holding note.\n\nIt involves a specialist assessment that only a small number of people in New Zealand can do, and we are in their queue. We are not waiting on you.\n\nWe would rather tell you that plainly than keep saying “still in progress”. If the timing creates a problem for your business, tell us and we will look at what can be done in the meantime.",
        rules: [
          'Explains the delay instead of restating the status',
          'Explicitly says the customer is not the blocker',
          'Opens a door for interim help without promising any',
        ],
      },
      {
        key: 'declined', label: 'Heading toward decline',
        chan: 'Held — not sent · a person must make this call',
        body: "No update was drafted.\n\nThis claim is heading toward a decline, and a decline is not a status update. It is a decision with consequences for a business, and it belongs to a person who can explain it, answer for it, and hear the response.\n\nWhat this concept prepared instead is the file — the policy wording that applies, the evidence on both sides, and the questions the customer is most likely to ask.\n\nThe conversation is not ours to have.",
        rules: [
          'The concept refuses to communicate a decline at all',
          'Prepares the person for the conversation rather than replacing it',
          'No coverage position is asserted anywhere in this concept',
          'Escalated with the reason attached',
        ],
      },
    ],
    guardTitle: 'The line this never crosses',
    guardLede: 'The whole risk in claims automation is a machine appearing to decide something. These checks exist to make that impossible.',
    guardBtn: 'Run the checks on the claim updates',
    guard: [
      { ok: true, t: 'No coverage position stated', d: 'Every draft describes where the claim is, never whether it is covered. Coverage is a person’s call, made against the policy.', law: 'Fair Trading Act 1986 · FMCA fair-dealing' },
      { ok: false, t: 'Blocked — settlement figure', d: 'A number appeared in a draft from the file notes. No amount is ever communicated by this concept, at any stage.', law: 'Fair Trading Act 1986' },
      { ok: false, t: 'Blocked — decline communication', d: 'The draft was suppressed entirely and the file routed to a named person. A decline is a conversation, not a notification.', law: 'FMCA fair-dealing · CoFI' },
      { ok: true, t: 'No settlement date promised', d: 'Where a timeframe is genuinely known it is given; where it is not, the draft says so rather than reassuring.', law: 'Fair Trading Act 1986' },
      { ok: true, t: 'Commercially sensitive detail contained', d: 'Nothing about the insured’s business, the assessment, or third parties leaves the file.', law: 'Privacy Act 2020' },
    ],
    opsTitle: 'Where the open claims actually are',
    opsCols: ['Claim state', 'Volume', 'Prepared', 'Waiting on', 'Status'],
    ops: [
      ['Progressing, nothing needed', '—', 'Update, no action required', 'Nobody — closes itself', 'ok', 'Ready to send'],
      ['One document outstanding', '—', 'Named the exact item', 'Customer', 'wait', 'Awaiting approval'],
      ['Specialist assessment queue', '—', 'Honest explanation of the delay', 'Claims handler sign-off', 'wait', 'Awaiting approval'],
      ['Heading toward decline', '—', 'Nothing drafted — file prepared', 'A person', 'hot', 'Held — no draft'],
      ['Assessor not yet assigned', '—', 'Draft held', 'Internal allocation', 'hot', 'Blocked internally'],
      ['Broker-managed', '—', 'Update prepared for the broker', 'Broker relationship owner', 'wait', 'Awaiting approval'],
    ],
    opsNote: 'Volumes are deliberately blank. This concept has no AIG data and does not estimate claim numbers.',
    receiptArtefact: 'Claim update — one document outstanding',
    receiptRead: 'Claim state fields (placeholder) · outstanding-items list (placeholder) · published product information',
    receiptRules: 'Financial Markets Conduct Act fair-dealing provisions · CoFI regime · Fair Trading Act 1986 · Privacy Act 2020',
    receiptRefused: 'No coverage position, settlement figure, settlement date or decline was communicated. Declines are never drafted.',
    pilotScope: 'One claim type, one segment. Six weeks. Not assessment, not coverage, not declines.',
    pilotAccess: 'Claim state fields and your outstanding-items taxonomy. No policy documents. No customer records. No assessment reports.',
    pilotScorecard: 'Updates sent without rewrite. Chase calls and broker chases that did not happen. Claims where a person agreed the concept correctly refused to draft. One claims lead’s answer to “would you put your name on this?”',
    verified: [
      'AIG New Zealand is a commercial and specialty insurer serving New Zealand businesses.',
      'Reading aig.co.nz with assembl’s own tool, it answers two of the five questions its customers most want answered before buying.',
      'AIG New Zealand is advertising for a customer lifecycle role.',
    ],
    laws: 'the Financial Markets Conduct Act fair-dealing provisions, the Conduct of Financial Institutions regime, the Fair Trading Act 1986, and the Privacy Act 2020.',
    verbNoun: 'claim-wait concept',
  },

  {
    slug: 'trademe',
    object: 'lattice',
    company: 'Trade Me Property',
    short: 'Trade Me',
    primary: '#006EBD',
    secondary: '#F9AF2C',
    paletteConfidence: 'low',
    buyerTitle: 'Customer Lifecycle Lead — Property',
    buyerLine: 'Trade Me · Wellington',
    execs: {
      lifecycle: 'Customer Lifecycle Lead — Property',
      property: 'Head of Property',
      crm: 'CRM & Lifecycle',
    },
    eyebrow: 'Property lifecycle · a concept',
    h1: ['The listing ends.', 'The relationship', 'does not.'],
    h1Accent: 1,
    lede: 'You are hiring a Customer Lifecycle Lead for Property, to own acquisition, activation, retention and win-back, and the ad says you want someone AI-forward. This is a concept for the part of that lifecycle that is hardest to staff: the long, quiet middle.',
    quote: 'Acquisition is a campaign. Retention is a thousand small moments nobody has time for.',
    quoteCite: 'The premise of this concept',
    whyNow: 'Your own job ad, posted this month, names the lifecycle stages and says the team is AI-forward. That is unusually direct — most companies we build concepts for have not said it out loud.',
    waitTitle: 'The listing that has been up for six weeks',
    waitWhen: 'A Sunday night',
    waitBody: 'An agent has a property that is not moving, a vendor asking why, and a renewal decision coming. The data that would answer the vendor’s question already exists — views, watchlists, enquiry rate against comparable listings. It has just never been assembled into something the agent can put in front of someone.',
    waitCards: [
      ['What happens now', 'The agent builds the story by hand on a Sunday, or has the conversation without it.'],
      ['What it costs', 'Not the listing — the next one. An agent who could not answer the vendor lists elsewhere next time.'],
      ['What the concept does', 'Prepares the vendor conversation from data you already hold, and stops before it sends.'],
    ],
    /* The only one of these four where the person waiting is the CUSTOMER of the
       business (the agent), not a consumer — so the credit is the agent's Sunday
       night back, and the question is the one the vendor is about to ask anyway. */
    waitPhone: {
      chrome: 'phone',
      note: 'Illustrative concept screen · not a Trade Me product · no listing data was used',
      skipLabel: 'rather not say',
      scenarios: [{
        id: 'listing', label: 'The listing',
        app: 'Six weeks on market',
        unit: ['', ' min'],
        earning: 'of Sunday night, back',
        yours: 'their Sunday night',
        told: 'the agent told you:',
        declined: 'the agent would rather not say. The vendor note still gets drafted.',
        steps: [
          { agent: 'Views', doing: 'This listing against comparable ones', credit: 8 },
          { agent: 'Watchers', doing: 'Who is circling but not enquiring', credit: 7 },
          { agent: 'Ask', doing: 'One question', ask: {
            q: 'Has the vendor moved on price yet?',
            options: ['Not yet', 'Once already'],
            learn: ['price untested, so lead with the comparables', 'already moved once — so the note leads with presentation, not price'],
          } },
          { agent: 'Renewal', doing: 'What the decision costs either way', credit: 6 },
          { agent: 'Draft', doing: 'A vendor note, ready for the agent to send', credit: 9 },
        ],
      }],
    },
    mirrorTitle: 'One agent. Four moments in the lifecycle.',
    mirrorKicker: 'Acquisition, activation, retention, win-back — the stages named in your own ad. Same agent, four very different conversations.',
    variants: [
      {
        key: 'activation', label: 'Activation',
        chan: 'Agent prompt · first listing not performing',
        body: "Your first listing has been live a week.\n\nIt is getting views but very few watchlist adds, which usually points at the photography or the price rather than the audience. Listings in this bracket that added a floor plan saw more enquiries.\n\nThis is the kind of thing worth fixing in week one rather than week six. Want us to show you what the comparable listings did differently?",
        rules: [
          'Diagnoses rather than reports — a number without an interpretation is not help',
          'Specific and early, while it can still change the outcome',
          'Comparative claims are placeholders; a pilot would compute them from your real data',
        ],
      },
      {
        key: 'retention', label: 'Retention',
        chan: 'Agent prompt · the vendor conversation, prepared',
        body: "Your Karori listing is at six weeks, and the vendor will be asking why.\n\nHere is the conversation, prepared: views are holding steady, watchlist adds have flattened, and enquiries have dropped since week three. Against comparable listings the pattern points at price rather than exposure.\n\nThat is a hard conversation and it is yours to have — but you should not have to build the evidence for it on a Sunday night.",
        rules: [
          'Prepares a hard conversation instead of avoiding it',
          'Explicitly leaves the conversation with the agent',
          'Names the likely cause rather than presenting neutral charts',
        ],
      },
      {
        key: 'winback', label: 'Win-back',
        chan: 'Held — not sent · timing check failed',
        body: "No win-back was drafted.\n\nThis agent’s last listing did not sell. A message that opens with “we noticed you have not listed recently” lands as a reminder of that, not as an invitation.\n\nHeld for a person to decide whether there is anything worth saying, and when. Sometimes the right lifecycle action is to leave someone alone for another month.\n\nThe restraint is the feature.",
        rules: [
          'Refuses to send a technically-correct message at the wrong moment',
          'Checks the outcome of the last listing before any win-back is written',
          'Doing nothing is treated as a valid lifecycle action',
          'Routed to a person with the reason attached',
        ],
      },
      {
        key: 'acquisition', label: 'Acquisition',
        chan: 'Agent prompt · a new office, no history',
        body: "A new office has listed for the first time.\n\nThere is no behavioural history to work from, so nothing here is personalised — and pretending otherwise is how first impressions get wasted.\n\nWhat is prepared instead is genuinely useful without being personal: what listings in their area typically do in the first fortnight, and the two setup steps most new offices miss.\n\nPersonalisation starts when there is something real to personalise from.",
        rules: [
          'Says plainly when there is not enough data to personalise',
          'Refuses to fake familiarity — the most common lifecycle mistake',
          'Offers general value rather than hollow specificity',
        ],
      },
    ],
    guardTitle: 'When not to send is the answer',
    guardLede: 'Lifecycle tooling fails by sending the right message at the wrong moment. These checks are mostly about restraint.',
    guardBtn: 'Run the checks on the lifecycle sends',
    guard: [
      { ok: true, t: 'Frequency cap respected', d: 'No agent receives more than the agreed number of prompts in a week, regardless of how many triggers fire.', law: 'Unsolicited Electronic Messages Act 2007' },
      { ok: false, t: 'Held — win-back after an unsuccessful listing', d: 'Technically eligible, humanly wrong. Suppressed and routed to a person to decide whether anything should be said at all.', law: 'Fair Trading Act 1986 · judgement' },
      { ok: false, t: 'Blocked — personalisation without data', d: 'A draft implied familiarity with a brand-new office. Rewritten to say plainly that there is no history yet.', law: 'Fair Trading Act 1986' },
      { ok: true, t: 'No performance claim without the comparison', d: 'Every “listings like yours” statement carries what it was compared against, or it does not ship.', law: 'Fair Trading Act 1986' },
      { ok: true, t: 'Vendor data stays with the agent', d: 'Nothing about a specific vendor or enquirer is surfaced to anyone other than the agent entitled to it.', law: 'Privacy Act 2020' },
    ],
    opsTitle: 'The lifecycle, on one screen',
    opsCols: ['Stage', 'Agents', 'Prepared', 'Waiting on', 'Status'],
    ops: [
      ['Activation — first listing live', '—', 'Diagnosis, week one', 'Lifecycle owner sign-off', 'wait', 'Awaiting approval'],
      ['Retention — vendor conversation due', '—', 'Evidence assembled for the agent', 'Lifecycle owner sign-off', 'wait', 'Awaiting approval'],
      ['Win-back — last listing unsuccessful', '—', 'Nothing drafted', 'A person, or nobody', 'hot', 'Held — no draft'],
      ['Acquisition — no history yet', '—', 'General value, no false personalisation', 'Lifecycle owner sign-off', 'wait', 'Awaiting approval'],
      ['Frequency cap reached', '—', 'Suppressed', 'Next week', 'ok', 'Held by design'],
      ['Renewal approaching', '—', 'Performance summary prepared', 'Account manager', 'wait', 'Awaiting approval'],
    ],
    opsNote: 'Agent counts are deliberately blank. This concept has no Trade Me data and does not estimate them.',
    receiptArtefact: 'Agent prompt — retention, vendor conversation',
    receiptRead: 'Listing performance fields (placeholder) · comparable-set definition (placeholder) · lifecycle stage definitions from your job ad',
    receiptRules: 'Fair Trading Act 1986 · Privacy Act 2020 · Unsolicited Electronic Messages Act 2007',
    receiptRefused: 'No win-back was drafted for an agent whose last listing did not sell. No personalisation was written without behavioural history.',
    pilotScope: 'One lifecycle stage — retention, the vendor conversation. Six weeks. Not acquisition campaigns, not the consumer side, not pricing.',
    pilotAccess: 'Listing performance fields and your comparable-set definition. No vendor records. No enquirer details. No Braze connection.',
    pilotScorecard: 'Prompts agents acted on. Suppressions a person agreed with. Vendor conversations agents said were better prepared. One lifecycle lead’s answer to “would you put this in front of an agent?”',
    verified: [
      'Trade Me is advertising for a Customer Lifecycle Lead in its Property vertical.',
      'The ad names acquisition, activation, retention and win-back as the stages the role owns.',
      'The ad describes the team as AI-forward and names Braze as the CRM platform.',
    ],
    laws: 'the Fair Trading Act 1986, the Privacy Act 2020, and the Unsolicited Electronic Messages Act 2007.',
    verbNoun: 'lifecycle concept',
  },

  /* ══════════════════════════════════════════════════════════════════════════
     NECTAR MONEY × INSTANT FINANCE — for Symon Nausbaum.
     Warm intro: Kate knows him. He is Founder and CEO of Nectar NZ Limited AND
     was a director of Instant Finance Limited for fifteen years; public records
     name him a significant beneficial owner of Instant Finance (with Sharlene
     Mitchell). So one person owns both a 1971 branch lender with 25 locations
     and a 2016 digital lender that quotes in seven minutes.

     The concept is built on that single fact. Nectar's own tagline is "Fast like
     a fintech. Fair like a human." — which is a description of his two
     companies, and right now they are two separate funnels. The unassembled
     moment is the DECLINE: someone who does not fit the digital credit box at
     9pm gets a no, when a branch two suburbs away might have said yes after a
     conversation. Nobody carries them across, so they start again somewhere
     else, or they go to a truck shop.

     🔴 HARD BOUNDARY, and it is the whole reason this is sendable: consumer
     lending is CCCFA territory. This concept NEVER makes a credit decision,
     never assesses affordability, never quotes a rate and never suggests one
     brand is cheaper for a given person. It prepares a handover. A lender
     decides. Every number below is published on their own websites.
     ══════════════════════════════════════════════════════════════════════════ */
  {
    slug: 'nectar',
    object: 'filament',
    company: 'Nectar Money and Instant Finance',
    short: 'Nectar × Instant Finance',
    /* Verified by reading computed styles on both live sites, July 2026:
       Nectar navy #002A42 (315 uses) / teal #056268 (141) / mint #73BBA5 /
       blush #DFA092; Instant Finance teal #47A1A3 (109) / #60C7C1 / rust
       #CF442D. Nectar's navy leads because the group story starts with it. */
    primary: '#056268',
    secondary: '#DFA092',
    paletteConfidence: 'high',
    buyerTitle: 'Founder and Chief Executive',
    buyerLine: 'Nectar NZ Limited · and Instant Finance · Tāmaki Makaurau',
    execs: {
      symon: 'Founder and Chief Executive, Nectar NZ Limited',
      group: 'Group — Nectar Money and Instant Finance',
      ops: 'Head of Lending Operations',
    },
    eyebrow: 'The decline · a concept',
    h1: ['Fast like a fintech.', 'Fair like a human.', 'Currently two funnels.'],
    h1Accent: 2,
    lede: 'That first line is yours — it is on the front of nectar.co.nz. It also happens to describe the two companies you own: a digital lender that quotes in seven minutes, and a 1971 branch lender with twenty-five locations and people in them. This is a concept for the one moment where those two halves should meet and currently do not.',
    quote: 'Fast like a fintech. Fair like a human.',
    quoteCite: 'Nectar Money · nectar.co.nz, July 2026',
    whyNow: 'Both sites publish their own numbers, and the gap between them is the opportunity: Nectar starts at 7.95% p.a. and is 100% online; Instant Finance starts at 9.95% p.a. and has twenty-five branches. A person who does not fit the first one is not told about the second. They just get a no.',

    waitTitle: 'The nine-o’clock no',
    waitWhen: 'A Tuesday, 9:12pm',
    waitBody: 'Someone starts an application because something has already gone wrong — a car that failed its warrant, a vet bill, a bond. They are seven minutes in when the answer comes back as a decline, or as silence. In that moment they do not learn what would have changed the answer, and they are not told that the same owner runs twenty-five branches where a person could have talked it through. So they close the tab and try a worse lender.',
    waitCards: [
      ['What happens now', 'A decline is an endpoint. The applicant learns nothing they could act on, and the group loses someone it had already paid to acquire.'],
      ['What it costs', 'Two acquisition budgets competing for the same person, and the ones who fall between the brands walk to whoever answers next.'],
      ['What the concept does', 'Prepares a handover — their situation carried across so they never start again — and stops. A lender decides everything that matters.'],
    ],

    /* Time, not money. A credit toward a loan would be an inducement to borrow,
       which is precisely what a responsible lender must not do. What the wait
       returns is the re-typing they never have to do, and one useful answer. */
    waitPhone: {
      chrome: 'phone',
      note: 'Illustrative concept screen · not a Nectar or Instant Finance product · no credit decision is made here',
      startLabel: 'tap to wait',
      skipLabel: 'rather not say',
      scenarios: [{
        id: 'handover', label: 'The handover',
        app: 'While we look at this',
        unit: ['', ' min'],
        earning: 'of re-typing, skipped',
        yours: 'never start again',
        told: 'they told you:',
        declined: 'they would rather not say. The handover still gets prepared.',
        steps: [
          { agent: 'Purpose', doing: 'What the money is actually for', credit: 4 },
          { agent: 'Told us', doing: 'Everything they already typed, kept', credit: 7 },
          { agent: 'Ask', doing: 'One question', ask: {
            q: 'Would it help to talk to someone in person?',
            options: ['Yes, near me', 'Online is fine'],
            learn: ['a branch conversation, so hand them to one', 'online only, so keep it in one channel'],
          } },
          { agent: 'Options', doing: 'Which channels are open to them at all', credit: 6 },
          { agent: 'Person', doing: 'Waiting on a lender — no decision made here', credit: 9 },
        ],
      }],
    },

    mirrorTitle: 'One applicant. Four honest endings.',
    mirrorKicker: 'The same person, four situations. Not one of these drafts approves, declines, prices or assesses anything — that is a lender’s job under the CCCFA, and this concept does not touch it. What it does is make sure nobody is dropped without a next step.',
    variants: [
      {
        key: 'branch', label: 'Better with a person',
        chan: 'Handover · digital application → branch conversation',
        body: "Kia ora,\n\nWe have not finished looking at your application, and we are not going to leave you guessing while we do.\n\nOne thing we noticed: what you have told us is the kind of thing that is much easier to sort out in a conversation than in a form. Instant Finance — same owners as Nectar — has branches with people in them, and there is one near you.\n\nIf you would like, we can pass everything you have already typed straight across so you do not start again. You would be talking to a person, not re-filling a form.\n\nNothing has been decided, and nothing has been declined. Say the word and we will make the introduction.",
        rules: [
          'Never says approved, declined, or likely — no credit decision is made or implied',
          'Names the ownership link plainly rather than pretending it is a coincidence',
          'The handover is offered, never performed automatically — the applicant consents first',
          'Everything they typed moves with them, because re-typing is where people give up',
        ],
      },
      {
        key: 'notyet', label: 'Not yet, and why',
        chan: 'Held · applicant told what would change the answer',
        body: "Kia ora,\n\nWe are not able to go ahead with this application right now.\n\nWe would rather tell you what that actually means than leave it at no. The reason sits with one part of your application, and it is the kind of thing that changes — sometimes within a few months.\n\nWhat we are not going to do is guess at your circumstances or tell you what to do about them. A lender will set out the specific reason, in writing, and what would need to be different.\n\nWe have not passed your details to anyone else, and we will not without you asking us to.",
        rules: [
          'The reason is left for a lender to state — this concept does not know it and does not invent it',
          'Says plainly that the decline is not permanent, without promising a future yes',
          'No third-party referral, and no data sharing, without the applicant asking',
          'Refuses to give financial advice, because that is a licensed activity',
        ],
      },
      {
        key: 'hardship', label: 'Signs of hardship',
        chan: 'Held — not sent · routed to a person immediately',
        body: "This message was not drafted.\n\nThe application contains language that reads as financial hardship, or as borrowing to service existing borrowing. Sending an automated anything into that moment is how a lender does real harm — and it is exactly the situation the responsible lending rules exist for.\n\nHeld and routed to a named person, with the words that triggered it attached so they can judge for themselves.\n\nWhat that person may decide is that the right outcome is not a loan at all — a budgeting service, a hardship process, or simply a conversation. This concept will never make that call.",
        rules: [
          'The most important output is the one that refuses to produce a message',
          'Hardship language is checked before anything is drafted, never after',
          'Escalated with the trigger words attached, not silently dropped from the run',
          'A person decides — and “not a loan” is an outcome this concept must allow for',
        ],
      },
      {
        key: 'topup', label: 'Existing customer',
        chan: 'Handover · already a customer of the other brand',
        body: "Kia ora,\n\nYou are already a customer of ours — under our other name.\n\nRather than run you through a new application as though we had never met, we have pulled together what we already hold, so you can check it is still right before anything goes further.\n\nWhat has changed since we last spoke is the part we cannot see, and it is the part that matters. So that is the only thing we are asking you about.\n\nAny new lending is a fresh decision by a lender, made properly. Being an existing customer does not change that, and we are not going to imply that it does.",
        rules: [
          'Recognises the person across both brands instead of treating them as a stranger',
          'Shows what is already held so they can correct it — provenance visible',
          'States explicitly that history does not pre-approve anything',
          'Asks only about the gap, not about everything again',
        ],
      },
    ],

    guardTitle: 'The checks that run before a lender ever reads it',
    guardLede: 'Consumer lending is the most heavily boundaried thing assembl has built a concept for, and that is the point of showing the guards first. The ones that block are the ones worth looking at.',
    guardBtn: 'Run the checks on the batch',
    guard: [
      { ok: true, t: 'No credit decision, anywhere', d: 'No draft says approved, declined, pre-approved, eligible or likely. Every one of them ends with a named person, not an outcome.', law: 'Credit Contracts and Consumer Finance Act 2003' },
      { ok: true, t: 'No rate, no amount, no term quoted', d: 'Published rate ranges are shown as published ranges. Nothing is personalised to an applicant, because personalising a price is a lending decision.', law: 'CCCFA · Responsible Lending Code' },
      { ok: false, t: 'Held — 3 applications read as hardship', d: 'Nothing was drafted for any of them. Routed to a named person with the triggering words attached. One possible right answer is no loan at all.', law: 'CCCFA · Responsible Lending Code, lender responsibility principles' },
      { ok: false, t: 'Held — cross-brand handover without consent', d: 'A Nectar applicant’s details are never moved to Instant Finance, or the reverse, until they ask for it. The draft offers; it does not transfer.', law: 'Privacy Act 2020 · IPP 10 and IPP 11' },
      { ok: true, t: 'No inducement to borrow', d: 'The wait returns time and a straight answer, never a credit, discount or bonus toward taking a loan. A sweetener here would be the wrong instrument.', law: 'CCCFA · Responsible Lending Code' },
      { ok: true, t: 'No financial advice', d: 'Drafts never recommend a product, a brand or a course of action. “Talk to a person” is an offer, not advice.', law: 'Financial Markets Conduct Act 2013 · advice regime' },
    ],

    opsTitle: 'The queue, before anything sends',
    opsCols: ['Situation', 'Volume', 'Prepared', 'Waiting on', 'Status'],
    ops: [
      ['Better with a person — branch offered', '—', 'Handover drafted, consent not yet asked', 'Applicant to say yes', 'wait', 'Awaiting consent'],
      ['Not yet — reason to come from a lender', '—', 'Message drafted, reason left blank', 'Lender to state the reason', 'wait', 'Awaiting approval'],
      ['Existing customer of the other brand', '—', 'What we already hold, for them to check', 'Lending operations sign-off', 'wait', 'Awaiting approval'],
      ['Language reads as hardship', '—', 'Nothing drafted', 'A named person, urgently', 'hot', 'Held — no draft'],
      ['Borrowing to service borrowing', '—', 'Nothing drafted', 'A named person, urgently', 'hot', 'Held — no draft'],
      ['Identity not yet verified', '—', 'Draft held', 'ID verification', 'ok', 'Parked'],
    ],
    opsNote: 'Volumes are deliberately blank. This concept has no Nectar or Instant Finance data of any kind and does not estimate how many applications anything affects.',

    receiptArtefact: 'Handover message — digital application to branch conversation',
    receiptRead: 'Published rate ranges, fees and channel facts from nectar.co.nz and instantfinance.co.nz · application fields: stated purpose, preferred channel, hardship-language flag. No credit file. No bank transactions. No affordability data.',
    receiptRules: 'Credit Contracts and Consumer Finance Act 2003 · Responsible Lending Code · Privacy Act 2020 · Financial Markets Conduct Act 2013 advice regime · Fair Trading Act 1986',
    receiptRefused: 'No credit decision was made or implied. No rate, amount or term was personalised. No details were moved between brands. Nothing was drafted for an application reading as hardship.',

    pilotScope: 'One moment, one direction: Nectar applications that do not complete, offered a branch conversation. Six weeks. Not the credit model, not pricing, not affordability, not the Instant Finance branch systems.',
    pilotAccess: 'Your published rate and fee tables, your branch list, and the field names that mark a stalled or declined application plus a hardship flag. No credit files. No bank statements. No affordability assessments. No applicant records leave your systems.',
    pilotScorecard: 'Handover drafts accepted without rewrite. Applicants who said yes to a conversation. Held cases a person agreed should have been held. And the honest one: whether a branch manager would put their name to the message that arrived ahead of the customer.',

    verified: [
      'Nectar Money’s own homepage leads with “Fast like a fintech. Fair like a human.” and “We combine smart technology with real human judgement to find a loan that works for you.”',
      'Nectar publishes personal loans of $2,000–$50,000, fixed personalised rates from 7.95% to 29.95% p.a., a $240 establishment fee, a $1.75 admin fee per repayment, terms of six months to five years, a seven-minute quote and 97% same-day funding.',
      'Nectar states the personalised rate is fixed for the life of the loan, that there are no early repayment penalties, and that it is 100% online.',
      'Instant Finance leads with “Makers Of Possible”, states “100% Kiwi owned Est. 1971” and “25 Locations across the country & online everywhere”, and describes itself as making “personal loans and access to finance easy for everyday Kiwis”.',
      'Instant Finance publishes rates of 9.95% to 29.95% per annum, establishment fees of $100 to $220, a $3 administration fee per instalment, a $7.70 ID verification processing fee, a $25 minimum weekly repayment, and “same day response”. It states it is a “Proud member of Financial Services Federation”.',
      'Symon Nausbaum is named as Founder and Chief Executive of Nectar NZ Limited, and as a director of Instant Finance Limited for fifteen years; company records list him among the significant beneficial owners of Instant Finance Limited.',
    ],
    laws: 'the Credit Contracts and Consumer Finance Act 2003 and the Responsible Lending Code, the Privacy Act 2020, the Financial Markets Conduct Act 2013 advice regime, and the Fair Trading Act 1986.',
    verbNoun: 'handover concept',
  },
];
