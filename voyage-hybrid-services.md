# Voyage — Hybrid Services

**Aligning Assembl with small-business professional services delivered by human + AI service operators.**

Research note for Tech Week. Maps the existing Assembl platform (kete, Mana
Trust Layer, Operator-as-platform tier, evidence packs) onto the emerging
hybrid-services thesis: smaller, cheaper, more frequent professional services
for businesses and households that were never agency clients before.

---

## 1. Thesis in one paragraph

Pre-AI, professional services were priced for crisis-only engagement. A lawyer
is consulted when the dispute is already filed; an accountant when IRD has
already written; a therapist when the breakdown has already happened.
Hybrid (AI + human) service operators can invert that — turning episodic
billing into continuous support, with AI doing the analysis, monitoring, and
drafting, and a human doing the judgement, the trust, and the follow-through.
The business problem this unlocks is enormous: most New Zealanders and most
small NZ businesses are under-served by every professional services category
because the unit price is too high for the frequency they actually need.

Assembl's existing primitives are already 80% of the governance infrastructure
a hybrid-service operator needs. The work is to package the last 20% into a
named tier and ship workflow templates for five archetype operators.

---

## 2. What Assembl already provides (no new build required)

| Primitive | What it does | Why a hybrid-service operator needs it |
|---|---|---|
| **Mana Trust Layer** — Kahu → Iho → Tā → Mana | Pre-flight PII masking, model selection, in-flight stamping, post-flight rewrite | Lets an operator hand sensitive client data (legal facts, financial position, mental-health intake) to an AI without losing Privacy Act / regulator audit posture |
| **Draft-only autonomy** | Every AI action requires a human approval step | Exactly the human-in-the-loop pattern hybrid services already operate on |
| **Evidence packs** | Every workflow ends with a branded, citable artefact | Maps directly to the deliverable a paying client expects — letter, plan, summary, return |
| **Operator-as-platform tier** ($1,490/mo + $590 setup, `/platform`) | Same price as Operator, no industry kete bundle, full Iho + AROHA/SIGNAL/SENTINEL | The existing SKU that already targets bespoke professional services |
| **46 specialist agents** + Iho intent router | Domain prompts, grounded recall, per-agent settings | Operator picks 3–5 agents per workflow instead of building from scratch |
| **AROHA / SIGNAL / SENTINEL** | Cross-cutting HR, security, uptime | Same compliance posture a one-person practice would otherwise have to assemble themselves |
| **Memory + IKB** (`memory-recall`, `ikb-ingest`, `ikb-search`) | Per-tenant grounded knowledge | Lets the operator carry the client's history across sessions without re-briefing |
| **Unified Channel Gateway** (SMS / WhatsApp / email) | Reach the client where they already are | Continuous-support cadence runs in the channel the client opens, not a portal they forget |
| **NZ compliance autoupdate** | Tracks regulatory changes | The legal/finance/care operator's biggest scaling cost is staying current |

Read against the user's thesis: *AI provides content, humans help learners
persist, choose paths, improve confidence*. That sentence is a description of
the Mana Trust Layer with a human approval step. We don't need new
architecture; we need new packaging.

---

## 3. Five hybrid-service archetypes

For each: the underserved business problem, what AI does, what the human does,
what the evidence pack looks like, and which Assembl primitives wire it up.

### 3.1 Preventative legal maintenance

- **Underserved problem.** Small businesses and households consume legal
  services only at crisis (employment dispute, contract gone wrong, family
  matter). They would consume far more if the unit was $40–150/month for
  "ongoing legal hygiene" instead of $3,500 for a single crisis engagement.
- **AI surface.** Read every new contract the client signs; monitor employment
  legislation, tenancy law, AML changes against the client's specific
  exposure; flag drift in standing agreements; draft variation letters; build
  client-specific clause libraries.
- **Human surface.** A junior lawyer or licensed paralegal as the Navigator —
  reviews the AI's flagged items weekly, makes the call on what's genuinely
  actionable, signs the letter, takes the awkward phone call.
- **Evidence pack.** Quarterly "legal posture" pack — every contract scanned,
  every regulatory change applicable, every action taken, every risk
  accepted. Citable to a regulator, sellable to the client as "you can sleep
  at night."
- **Assembl primitives.** Operator-as-platform + Iho router + `compliance-
  scanner` + `nz-compliance-autoupdate` + `esign-*` + IKB for the client's
  contract library + draft-only autonomy on every outbound document.

### 3.2 Always-on personalised learning with human pathway guidance

- **Underserved problem.** Tutoring is $60–120/hour and episodic. Most
  learners (school, adult re-skill, professional cert) need persistence
  support more than they need content — content is already free.
- **AI surface.** Personalised study plan, daily prompts, formative quizzes,
  spaced repetition, explanation generation against the learner's specific
  stuck point, progress dashboard.
- **Human surface.** A pathway guide (often not a fully credentialled
  teacher — could be a senior learner, a coach) who runs a 20-minute weekly
  check-in. Their job is confidence, choice, and persistence, not content.
- **Evidence pack.** Monthly learner report — what was covered, what stuck,
  next month's plan, employer/parent-readable summary.
- **Assembl primitives.** **Ako** kete (Early Childhood today, but the chat +
  memory + draft surfaces generalise) + `memory-recall` + `te-reo-video-
  learn` pattern + scheduled `tick` for daily prompts + Unified Channel
  Gateway for SMS check-ins.

### 3.3 Mental-health support layer (between nothing and licensed therapy)

- **Underserved problem.** Therapy is $180–250/session and gated by wait
  times. Most people most of the time need a layer below — peer support,
  group facilitation, continuous check-ins, with a clear escalation path.
- **AI surface.** Daily check-in prompts, mood logging, journal prompts,
  pattern recognition across weeks, summarisation for the human supporter
  before each session, crisis-keyword detection.
- **Human surface.** A peer worker or group facilitator (not a licensed
  therapist) running weekly groups or 1:1 check-ins. Critically, **a
  documented escalation pathway** to a licensed clinician when the AI flags
  risk.
- **Evidence pack.** Per-client wellbeing posture — adherence, escalations
  triggered, referrals made. Crucial for funder/insurer billing.
- **Assembl primitives.** Operator-as-platform + Mana Trust Layer (PII
  masking is non-negotiable in this domain) + scheduled `tick` + `compress-
  conversation` for session prep + draft-only autonomy on every message + an
  **escalation policy node** (gap — see §6).

### 3.4 Continuous personal & small-business financial life support

- **Underserved problem.** An accountant is engaged once a year for tax.
  Insurance, KiwiSaver, debt, benefits eligibility, business cash flow are
  not. The household and the sole trader consume *one* professional financial
  service a year and would consume *twelve* if the unit price was right.
- **AI surface.** Continuous read of bank feeds (via Xero / Akahu),
  benefit/credit eligibility scanning, tax-position projection, insurance-gap
  detection, retirement trajectory, document collation for IRD/MSD.
- **Human surface.** A finance navigator who reviews the AI's flags weekly,
  calls IRD on the client's behalf, makes the judgement call on whether to
  switch KiwiSaver provider.
- **Evidence pack.** Monthly financial-life statement + actions taken +
  decisions deferred. Annual tax return falls out as a side-effect.
- **Assembl primitives.** Operator-as-platform + `xero-sync` + IKB for
  client document store + scheduled briefings (`flux-monday-briefing`
  pattern) + `compliance-scanner` for benefit/threshold changes +
  `esign-send` for engagement letters.

### 3.5 Family coordination (elder care, childcare, household)

- **Underserved problem.** Care coordination — schedules, medications,
  appointments, school logistics, in-home worker rosters — eats unpaid hours
  every week of every household with a dependent. The pieces requiring trust
  (the actual person in the room with your child or parent) won't be
  replaced. The coordination layer can be.
- **AI surface.** Calendar synthesis, medication reminders, appointment prep,
  document collation (insurance, MOH, schools), meal/grocery planning,
  multi-channel family comms.
- **Human surface.** A coordinator (often a community-based worker) who
  handles the relational and trust pieces — interviewing carers, attending
  the school meeting, sitting in the GP appointment.
- **Evidence pack.** Care-plan timeline visible to all family members, with
  audit trail of decisions and consents.
- **Assembl primitives.** **Tōro** kete is already pointed at this domain
  (consumer tier, family/household). `google-calendar` + Unified Channel
  Gateway + `memory-recall` + `compress-context` + draft-only autonomy on
  any message that leaves the household.

---

## 4. The three new role categories (Assembl should productise them)

These are the user's own labels. The work is mapping each to an Assembl role
shape with its own dashboard, agent loadout, and pricing.

### Navigator
Paid to help a person move through a system that is too complex to face
alone — court, IRD, MSD, immigration, the health system, school enrolment.
**Assembl product shape:** an agent loadout focused on `compliance-scanner` +
`memory-recall` + form generation + Unified Channel Gateway, paired with a
weekly human review session. Suits a one-person practice (ex-government
caseworker, paralegal, social worker).

### Continuous Support Worker
Paid for ongoing human contact around an AI-monitored signal. Mental-health
peer worker, financial coach, learning coach, care coordinator. **Assembl
product shape:** scheduled-tick cadence + a per-client posture dashboard +
escalation policy + draft-only message review queue.

### AI-Augmented Service Operator
A domain professional (lawyer, accountant, planner) running AI as a
force-multiplier to serve 5–10× more clients at a fraction of the unit
price. **Assembl product shape:** the existing Operator-as-platform tier,
with workflow templates per archetype above.

All three live on the same SKU. The differentiator is the workflow template
(§5) and the human role taxonomy in `user_roles`.

---

## 5. Recommended next steps for the platform

These are concrete, repo-level moves — not strategy slogans.

1. **Rename the public surface.** `/platform` is currently a one-pager.
   Add `/platform/hybrid-services` with the five archetypes above and a
   "Pick your operator shape" picker (Navigator / Continuous Support /
   AI-Augmented Operator).
2. **Ship five workflow templates.** One per archetype in §3. Each is a
   pre-wired agent loadout + scheduled `tick` cadence + evidence-pack
   template. Stored under a new `supabase/functions/hybrid-template-*`
   family or as JSON in `app/data/`.
3. **Build the escalation-policy node.** Mental-health, finance, and care
   workflows all need a configurable rule: "if AI sees X, route to human Y
   within Z minutes." This is the one architectural addition. It plugs into
   the Mana Trust Layer between Tā and Mana.
4. **Per-client posture dashboards.** A continuous-support operator running
   30 clients needs a single view: who's drifted, who's escalated, what's
   overdue. Generalise the existing `/admin/dashboard` shape into an
   operator-owned `/operator/[clientId]` route.
5. **Cadence + billable-unit primitives.** Today Assembl charges per seat.
   Hybrid-service operators bill per client per month. Add a `client_seats`
   table and a `cadence_runs` table so an operator can package the unit
   their client actually pays for.
6. **Sharpen the Operator tier copy.** Current `/platform` page says "you
   don't fit a kete." That's defensive. Rewrite as "Assembl is the
   governance layer for the hybrid services economy" — same SKU, much
   sharper pitch.

None of items 1–4 require leaving the existing architecture. Items 5–6 are
copy and small schema additions.

---

## 6. Architectural gap to close

The one thing Assembl doesn't have today is a first-class **escalation
policy** primitive. Across mental-health, finance, legal, and care, the
hybrid-services thesis depends on a configurable rule of the form:

```
when (signal) detected in (client_id) and (severity >= threshold)
  → route to (human_role) within (sla)
  → log to evidence_pack as escalation_event
  → block further automated action until ack
```

This is one new edge function plus a `escalation_policies` table plus a hook
inside `ta` (Mana Trust Layer in-flight stamp). It is the only blocking
architectural item.

---

## 7. Tech Week — real business problems → AI solutions

Use these as the concrete "people are doing this right now" examples in the
talk. Each is one sentence + one line of how Assembl wires it.

1. **A paralegal in Whangārei monitors 40 small-business clients' contracts
   and employment positions for $99/month each.** Iho + `compliance-scanner`
   + draft-only autonomy on every variation letter.
2. **A NCEA tutor runs 60 learners with weekly 20-minute check-ins instead
   of $80/hour 1:1s.** Ako-pattern agent + scheduled SMS prompts +
   monthly evidence pack to parents.
3. **A peer support worker runs three weekly groups of 12 with AI-prepped
   session briefs and crisis flagging.** Operator-as-platform + escalation
   policy + Mana Trust Layer PII masking.
4. **A finance navigator does monthly KiwiSaver / insurance / IRD reviews
   for 80 households at $39/month each.** Xero sync + benefit-eligibility
   scanner + evidence-pack monthly statement.
5. **An ex-MSD caseworker helps 50 families navigate Working for Families,
   Best Start, and disability allowances.** Iho + draft-only form
   generation + Unified Channel Gateway.
6. **A care coordinator runs the calendars, medications, and family comms
   for 30 elder-care households.** Tōro kete + google-calendar + memory-
   recall + escalation policy.
7. **A solo employment lawyer takes on five times the clients by handing
   intake, document review, and first-draft letters to AI.** Operator-as-
   platform with AROHA + draft-only autonomy.
8. **An ECE centre runs personalised learning journals for 80 children
   with one staff member instead of three.** Ako kete + memory-recall +
   weekly evidence-pack export to whānau.
9. **A small accounting practice converts annual-tax-only clients into
   monthly subscribers at 1/4 the unit price and 12× the touchpoints.**
   Operator-as-platform + xero-sync + scheduled briefings.
10. **A community health navigator runs continuous mental-wellbeing
    check-ins for 100 people with two licensed clinicians on escalation.**
    The full hybrid-services stack: cadence, escalation policy, evidence
    pack, draft-only.

The pitch in one line: *Assembl is the governance infrastructure for the
hybrid services economy — sovereign, NZ-built, evidence-ready, and already
priced for a one-person practice.*

---

## 8. What this is not

- **Not a new kete.** The whole point is that hybrid-service operators don't
  fit a vertical; they fit a *role shape* that crosses verticals.
- **Not a new pricing tier.** Operator-as-platform at $1,490/mo already
  works. The change is how it's sold and what templates ship with it.
- **Not unbounded autonomy.** Every example above keeps a human signing
  off — that's the *only* way these services are saleable, insurable, and
  trusted at the price points described.
- **Not a replacement for licensed professionals.** It's a layer below
  them (peer / coach / navigator) and a force-multiplier for them
  (AI-augmented operator). Both are net-additive to the supply of
  professional help in NZ.
