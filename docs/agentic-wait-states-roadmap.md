# agentic wait states — roadmap (locked 3 Aug 2026)

Kate's strategy, locked to memory. This is the build brief for the demonstrator
family. Full source research lives in the session record; this file carries
everything needed to build.

## the category

There is no recognised global category for this yet — that is the opportunity.
Position: **the orchestration layer for active wait states**, not "better
loading animations".

> Assembl turns a passive system delay into a useful, permissioned
> micro-journey that improves what happens next.

Umbrella wording for the suite:

> While the business works, Assembl works beside the customer.

## the three products (share one runtime)

1. **live agentic wait** — an agent appears only while a real process runs.
   "Something is happening. While it happens, Assembl helps the customer
   prepare what comes next." No sponsorship needed; value = completion,
   reassurance, reduced service workload.
2. **rewarded agentic wait** — the business rewards an optional useful
   micro-action during the wait. "Use this moment to complete something
   helpful — and receive value back." Reward is for producing something
   useful, never for watching an ad.
3. **sponsored agentic wait** — a partner funds a useful service or reward.
   "A relevant partner funds the value, but does not control the customer's
   outcome." Rule: **sponsored utility, not sponsored interruption.**
   The sponsor pays for utility, not the right to interrupt.

## capability levels

- level 1 — assist (ask one useful question, explain, record a preference)
- level 2 — assemble (prepare basket / claim pack / brief / itinerary for approval)
- level 3 — act (execute a tightly bounded action after explicit consent)

Most NZ pilots stay at levels 1–2.

## sponsorship models

- **A — business-funded reward** (e.g. Contact $5 bill credit for an energy
  profile that cuts contact-centre load) — technically rewarded, not sponsored.
- **B — partner-funded reward** (heat-pump provider funds a $10 Contact bill
  credit for a heating assessment; customer keeps the value even if they
  decline the offer).
- **C — sponsored service** (accommodation partner funds a room-comparison
  tool during Air NZ disruption; must disclose whether it compares the full
  market or only participants).
- **D — performance-funded action** (sponsor pays only when the customer
  knowingly acts: books a transfer, requests a quote, schedules a tour).
- **E — coalition reward** (Airpoints-style: brands fund fractional Airpoints
  for useful actions; 1 Airpoint = NZ$1. Requires a formal Air NZ partnership —
  prototype the experience, never claim the rewards currently exist).

## reward destinations (Kate-confirmed)

- Air NZ → **Airpoints** ("This wording is a proposed Assembl concept — not a
  current Air New Zealand offer." always attached)
- Contact Energy → **power bill credit** (or gift the credit to a household in
  hardship — already live on the Contact fleet page)
- Nectar → fee credit / lower establishment fee, **only for readiness, never
  for borrowing**; KiwiSaver opt-in variant already on fleet page
- Sharesies → Airpoints (adjacent to existing plans) or plan-fee credit for
  learning, never for trading
- My Food Bag → box/delivery/extras credit
- Summerset / Ryman → lifestyle value (family lunch, transport, moving
  consultation, prepared tour), never discounts

## per-company scope (the table)

| company | wait state alone | full agentic journey | reward | sponsorship |
|---|---|---|---|---|
| Air New Zealand | useful pilot | **yes** | Airpoints, lounge, travel value | high, strict disruption safeguards |
| Contact Energy | strong entry pilot | yes | bill credits | high (efficiency, EV, home partners) |
| Nectar Money | useful component | **yes** | fee credit / readiness benefit | low during assessment; moderate after approval |
| Instant Finance | strong component | **yes** | fee credit for completeness | low during assessment; moderate after approval |
| Sharesies | educational waits | yes | Airpoints / plan credit / education | moderate; never sponsored securities ranking |
| My Food Bag | **strong immediate pilot** | yes | box / delivery credit | very high |
| Summerset | limited alone | **definitely** | family visit + moving value | moderate–high |
| Ryman | limited alone | **definitely** | family + transition services | moderate, heightened care safeguards |

## the demonstrator family (build order per Kate's picks)

- **best sponsored pilot: My Food Bag** — "Your bag is being packed. Let's
  assemble the week." Weekly selection ("Tell me what this week looks like" →
  three busy nights / kids have activities / lighter / use what I have /
  surprise us), order-lock, packing and delivery waits. Rewards: $5 next-box
  for household preferences; delivery credit for waste feedback; $10
  reactivation credit. Sponsors: breakfast partner, school-lunch partner,
  equipment only after "I need equipment", Garden to Table as purpose-funded.
- **best rewarded pilot: Contact Energy** — bill-understanding wait ("We're
  loading the detail behind your bill… what increased? / compare with last
  winter / check my plan / find easy savings / **I just need help paying**" —
  the last routes straight to support, never a commercial surface). $5 credit
  for the home energy check, model-B $10 partner-funded heating check.
- **best live-agent demonstration: Air NZ disruption** — "We're working on
  your flight. Let's prepare your next best option." Choices: protect my
  connection / keep our group together / earliest arrival / I may need
  accommodation / just keep me updated. Reward wording: "Thank you for
  preparing your preferences. We've added 2 Airpoints to your account for
  helping us resolve your journey faster." (proposed concept disclaimer).
  Sponsored: accommodation agent, ground transport, family assistance.
  Never monetise distress; resolution stays primary.
- **best accessible financial target: Instant Finance** — "The branch
  conversation starts before the phone rings." Agent prepares customer AND
  branch adviser (staff view: purpose, channel, documents, missing pieces,
  affordability questions, vulnerability flags). Reward: $10 establishment-fee
  credit for readiness, compliance-reviewed. Human-in-the-loop is the story.
- **Nectar** — "Seven minutes should not feel like a form." Four stages:
  before application, active wait (align repayments with payday / check
  documents / show total cost / prepare questions / leave this for now),
  missing-information, decision (a decline never routes to another high-cost
  lender). No third-party ads inside credit assessment, ever.
- **Sharesies** — "When money is processing, understanding should not pause."
  Order processing, managed-fund settlement (1–3 working days), KiwiSaver
  first-home withdrawal (10–15 business days) as the big active wait. Rewards
  reward comprehension: investing confidence check → 1 Airpoint; first plan →
  month of plan-fee credit. Sponsors fund education, never recommendations:
  "This learning experience is funded by [partner]. It does not recommend
  their shares, products or services."
- **Summerset** — "A retirement decision is a family journey. Assemble it
  before the tour." Enquiry → info-pack wait → tour prep → post-tour. Staff
  output: family readiness summary. Rewards are respect: lunch, transport,
  moving consultation, printed family comparison pack.
- **Ryman** — distinct from Summerset: **continuity across changing needs**.
  "Families should not have to repeat the story as needs change." Two modes:
  prospective family and existing resident family (the latter needs stronger
  consent/security). Couples-with-different-needs journey is the signature
  interaction. Care/medical products never promoted in a sales wait state.

## guardrails (product, not afterthought)

Customer: optional participation; original task stays visible; agent never
lengthens the wait; sponsorship unmistakably disclosed with the why
("Funded by bp. Suggested because you selected fuel savings. It does not
affect your grocery recommendations."); declining never degrades service;
granular reversible consent; sensitive data never required for a reward.

Operational: written purpose and action limit per agent; every action logged;
humans own regulated/emotional outcomes; early escalation; the system
distinguishes suggestion / preparation / execution; sponsored content cannot
override customer-interest ranking. Progress is the stack, not a bar; never
show a percentage you cannot honestly compute; never spin.

## demonstrator anatomy (seven-second structure)

0–2s recognition (their exact moment) → 2–5s transformation (spinner opens
into the agent, three compact choices, never an empty chat box) → 5–7s proof
(observable output forming). Then: live context header, one-tap intents,
agent workspace, permission checkpoints ("Use my previous three orders for
this suggestion?"), transparent sponsorship, visible human handoff ("Prepared
for Moana, your lending adviser."), business view (operator dashboard), and
the implementation view (now / pilot / scale).

## market entry

Phase 1: three exceptionally polished demonstrators (finance, claims,
grocery-loyalty) + the point of view: "The spinner was designed to explain
delay. The agentic wait state is designed to use it." Phase 2: one accessible
pilot (Nectar / Instant Finance / specialist insurer / retirement operator /
automotive). Phase 3: evidence. Phase 4: ecosystem (Woolworths, bp, Air NZ,
banks) with numbers, not concepts. Goal: **one live mid-market wait state,
one measurable result, one beautifully packaged case study.**

Woolworths honesty: enough clout for a conversation, not a broad deployment.
Wedge: a four-week non-transactional prototype on one narrow moment (e.g.
rewarded 20-second substitution-preference interaction), or making the bp
partnership useful during order preparation.

## visual system (locked separately)

The blueprint-assembly design language (v2 "make it materialise") carries all
of this: photoreal chrome parts (Kate-approved 3 Aug — one material, one
light), line = proposed, material = done, the sweep converts, the title block
is the evidence pack. Proof stills logged in task 17 metadata.
