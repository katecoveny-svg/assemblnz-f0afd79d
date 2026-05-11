# Voyage — Surprise Moments

The set of unprompted, anticipatory, slightly-uncanny moments that turn
Assembl from "a useful tool" into "a thing I can't imagine not having."
Each one is a small surface that earns disproportionate emotional weight.

A surprise moment is not a notification. It is the system *noticing
something the operator did not ask it to notice*, surfacing it at the
right time, in the right voice, at the right size. The Assembl test for
whether a surprise moment ships:

1. **It is anticipatory.** It tells the operator something *before*
   they need it.
2. **It is specific.** Generic alerts are not surprises.
3. **It is small.** A one-line message in the right channel beats a
   dashboard widget every time.
4. **It is honest.** It cites where the observation came from and
   includes a verifier hash if it implies a record.
5. **It can be turned off.** Surprise moments live in a per-operator
   preferences table. The platform never bullies.

Below: thirty moments, grouped, with a short note on the primitive that
wires each. The ones marked **★** are the ones to ship first — highest
emotional weight per engineering hour.

---

## A. Catches — things the operator missed

### A.1 ★ The Monday catch
*Sunday night, 9pm.* "Three things to know before Monday: the FCP renewal
you have on the 14th hasn't been started, the BCA reverted on 27 King St
yesterday afternoon, and Aroha (your contractor) hasn't been paid since
April 4."
Wires on: `tick` + outcome_events query for due-dates approaching + Xero
unpaid-invoice scan. Channel: SMS. Voice: calm, second-person, no emoji.

### A.2 The deadline you set yourself last quarter
Operator wrote "review variation clause in Q2" in a casual chat in March.
Three weeks before Q2 ends, Assembl surfaces it. *You said you'd revisit
the variation clause this quarter. It's still on the books.*
Wires on: `memory-recall` over conversation history + a cron diff against
self-set commitments.

### A.3 ★ The new exposure
A regulatory change shipped overnight. By 7am the affected client list is
in the dashboard, with a draft variation letter per client and a one-line
explanation of what changed.
Wires on: `nz-compliance-autoupdate` + `compliance-scanner` + Iho draft +
escalation_policies if affected clients > threshold.

### A.4 The disappearing client
A client hasn't engaged in 17 days when they normally engage every 4–5.
"Tama hasn't checked in since the 24th. Worth a phone call?" Surfaces to
the Continuous Support Worker dashboard, not as red, but as gentle.
Wires on: `cadence_runs` diff + per-client baseline + escalation_policies
`drift` kind.

### A.5 The contract that quietly changed
A counterparty re-issued a contract with a single clause changed. Assembl
spotted it on the next IKB ingest. *Acme's MSA was re-issued yesterday.
Clause 9.4 was rewritten. Here's the diff.*
Wires on: `ikb-ingest` + content-hash compare + Iho summarisation.

---

## B. Receipts — confirmations that arrive at the right moment

### B.1 ★ The Customs accept
The moment NZ Customs accepts a lodgement, Assembl messages the broker:
*Entry MAW1234567 accepted at 14:32 NZST. Evidence pack sealed.* With a
verifier link. The pack is already generated, already sealed, already
hash-chained.
Wires on: `outcome-event` webhook from Trade Single Window + `generate-
evidence-pack` + auto-seal on positive outcome.

### B.2 ★ The BCA accept
Same shape for building consent. The instant the BCA marks the consent
issued in their system, the project lead gets a message and a sealed
posture pack. No reload, no checking.
Wires on: BCA email webhook (parsed inbound) or operator-mark + auto-seal.

### B.3 The "you're back in the green" note
A client's Xero data crossed back over a threshold after being below it
for weeks. *Cashflow back above 6-week runway as of yesterday's import.*
Wires on: `xero-sync` + outcome_events + per-client thresholds.

### B.4 The thank-you-by-proxy
A counterparty replied to one of Assembl's drafted letters with a
positive response. Assembl picks it up out of the inbox, classifies it,
and quietly logs a positive outcome against the originating trace. *Acme
agreed to the variation. Trace 7f3a recorded as positive.*
Wires on: `process-email-queue` inbound + outcome_events insert + a
celebratory but restrained Monday catch.

### B.5 The first-of-its-kind
The first time a specific outcome happens for a tenant — first BCA
accept, first paid invoice from a new debtor, first FCP passed for the
year — a slightly-warmer note ships. *Your first BCA accept this year.*
Wires on: outcome_events count over tenant lifetime.

---

## C. Coordination — moments where Assembl quietly bridges two parties

### C.1 The handover that arranged itself
For the co-parenting navigator archetype: when Friday's pickup is
approaching, Assembl pings both parents with the agreed plan, the kids'
school news for the week, and the medication that needs to travel. No
new conversation; just a calm reminder both can see.
Wires on: `agent-toro` + parenting_plan + scheduled tick.

### C.2 ★ The translated brief
An English-speaking client receives a doctor's letter in clinical jargon.
Assembl auto-translates it into a one-paragraph explanation in their
preferred plain English (or te reo Māori), with the original attached.
*Here's what this letter is saying, in plain language. The full letter
is below.* Verifiable.
Wires on: Mana voice-rewrite + bilingual primitive + draft-only autonomy.

### C.3 The shared-context warm intro
Operator is about to call a client. Assembl pre-prepares a one-line
context note for the call: *Last touchpoint: 11 May, you discussed the
Term 3 plan. Outstanding: confirm tutoring schedule for July. Mood last
session: low but engaged.* Lives on the call dialer's lock screen.
Wires on: `memory-recall` + `compress-context` + escalation_events.

### C.4 The cross-kete bridge
A Manaaki (hospitality) operator and a Pīkau (freight) operator are
working with the same SME. Assembl spots it via the IKB and notes once:
*Aroha is your client; she's also a Pīkau client of Tama's. Shared
context available with consent.*
Wires on: cross-tenant IKB lookups + consent ledger.

---

## D. Memory — anniversaries, callbacks, "you said this once"

### D.1 The promise kept
A Co-Parenting Posture pack from six months ago committed to a review.
Six months later — *Six months ago you committed to revisiting the
weekend schedule. Want me to draft the review?*
Wires on: pack memory + cron + draft on demand.

### D.2 The fact you mentioned in passing
Twelve weeks ago a learner mentioned in chat that they wanted to do a
Te Wānanga night class in the second half of the year. Enrolments just
opened. *You mentioned in March wanting to look at Te Wānanga night
class. Enrolments opened today.*
Wires on: `memory-recall` + IKB content classifier + scheduled tick.

### D.3 The first anniversary
A year after a client signed up, Assembl quietly produces an annual
posture pack and sends a single-line note to the operator. *Tama has
been a client for a year. Here is the year-in-review pack.*

### D.4 The reviewer who always edits this section
Assembl notices that the same human reviewer edits §3 of every monthly
pack to soften the tone. After the third occurrence, it pre-applies the
softening on the next draft. *I noticed you usually rewrite §3 to soften
the cashflow framing — I've pre-applied that pattern. Tell me if I
overstepped.*
Wires on: edit-distance tracking on reasoning_traces + self_critique
field.

---

## E. Quiet wins — surfaces only when it's actually a win

### E.1 The cost-saving observation
The model router noticed that for routine compliance pre-checks, the
client's quality outcomes are equivalent at a lower model tier. *I can
take this class of work down a tier without quality cost. Saves ~$210/
month. Approve?*
Wires on: reasoning_outcomes view + judge eval + model_router.ts.

### E.2 The duplicate effort caught
Two operators on the same team drafted similar work for two similar
clients within a week. *The variation you drafted for Acme on Tuesday is
~85% the same as Sina's draft for Beta on Monday. Want to make it a
template?*
Wires on: embedding similarity on reasoning_traces.

### E.3 The capacity heads-up
"Your cadence has been pushing your weekly hours; this week looks
heavier than usual. If you want, I can defer the lower-priority check-ins
to next week and ping the affected clients."
Wires on: cadence_runs schedule projection + operator workload model.

---

## F. Closing the loop — surprises that confirm the system is honest

### F.1 ★ The "I got this wrong" note
The eval harness detected that a draft from last month produced a
negative outcome. Assembl says so, by name. *On 12 April I drafted a
variation letter that you sent; on 8 May it triggered a counter-offer
that we hadn't anticipated. Trace 9a2c. Worth a debrief.*
Wires on: reasoning_outcomes view + scheduled regression scan +
proactive note.

### F.2 The "I'm getting better at this" note
Quarterly, Assembl ships a one-page report on its own performance for
the tenant: how many drafts produced positive outcomes vs negative, the
delta on the previous quarter, the agents that improved most. Honest,
not boastful.
Wires on: reasoning_outcomes aggregate + scheduled posture pack.

### F.3 The deprecation note
A model the tenant relies on for a specific workflow is being deprecated
by its provider. Assembl flags it weeks ahead with a side-by-side
quality comparison of the proposed replacement.
Wires on: model_router.ts + reasoning_outcomes A/B harness.

---

## G. Voice — moments where Assembl's restraint becomes the surprise

### G.1 The day-off respect
If the operator's calendar shows a holiday or a tangihanga, Assembl
holds non-urgent surprises until they're back. The dashboard says *Held
3 notes until Wednesday. Tap to see anyway.*
Wires on: `google-calendar` + per-operator pause table.

### G.2 The night-mode note
After 8pm, surprises switch to a single, quiet, end-of-day summary
unless something is severity 5. The summary lands at 8:15pm. *One thing
worth knowing before you stop tonight.* Then silence.

### G.3 ★ The te reo touch
On Māori Language Week, Matariki, and Waitangi Day, the Monday catch
ships in te reo first (with English second). No fanfare. Just the order
of the lines changes. Operators who don't use te reo can opt out per
the preferences table; default is on.
Wires on: NZ calendar + bilingual primitive in voice-rewrite.

### G.4 The "we noticed you" moment
First time an operator hits a milestone (50 clients, 100 evidence packs
sealed, a full year), Assembl ships a single small artefact: a tiny
print-quality certificate. Just the wordmark, the milestone, the date,
the hash. No CTA.
Wires on: aggregate counters + pack-spec verifier primitive.

---

## H. Shipping order

Highest emotional weight per engineering hour, in order:

1. **A.1 The Monday catch** — uses everything you already have.
2. **B.1 + B.2 The Customs / BCA accept** — auto-seal the pack on
   positive outcome. Single hook into `outcome_events`.
3. **G.3 The te reo touch** — pure voice change; days, not weeks.
4. **A.3 The new exposure** — already half-wired in compliance-scanner.
5. **C.2 The translated brief** — high felt-value for low effort.
6. **F.1 The "I got this wrong" note** — requires the reasoning ledger
   (now shipped). Cements the honest-platform posture.
7. **G.1 The day-off respect** — small surface, large signal that the
   platform respects the operator's life.

Everything below the line is roadmap; everything above the line earns
its place in the first eight weeks of the hybrid-services launch.

---

## I. The two stubs in this commit

To anchor the pattern, two of the above land as edge-function stubs in
this commit:

- `supabase/functions/monday-catch/index.ts` — A.1, scheduled by the
  existing `tick` function each Sunday 21:00 NZST. Queries
  `outcome_events`, `cadence_runs`, and `escalation_events` for the
  tenant's operator and composes one SMS message per operator.
- `supabase/functions/outcome-pack-auto-seal/index.ts` — B.1/B.2, called
  by the outcome webhook handlers. When a positive outcome lands and
  the associated traces are part of a Workflow pack, auto-seal the pack
  with the reviewer marked as the named operator. Idempotent.

Both functions ship in stub form — handlers + types + the data-shape
contract. The voice-rewrite and notification fan-out paths are noted
as TODOs to be filled in once the operator preferences table lands.
