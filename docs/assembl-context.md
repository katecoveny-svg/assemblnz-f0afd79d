# assembl · context

> Canonical company and product strategy. For the latest working state, read `docs/context/CURRENT.md` first. Public website and demonstrator copy must follow `docs/assembl-copy-standard.md`. Visual work must follow `docs/assembl-brand-system.md`.

**Last strategy refresh:** 16 September 2026

## what assembl is

assembl is becoming an **intelligence-powered software factory for finding, doing and showing valuable work**.

It is not one giant assistant, a chatbot platform, a traditional automation agency or a collection of disconnected demos.

assembl combines live signals, structured business context, specialist agents, reusable software primitives and proof systems so useful work can be discovered, assembled, executed and demonstrated repeatedly.

The durable asset is not any single model. It is Assembl's context, primitives, skills, customer understanding, proof, design taste and learning loop.

## current top-level structure

### 1. Pursuit — find the work

Pursuit is the intelligence and opportunity layer.

It gathers and interprets signals such as:
- customer/business friction
- company and market changes
- tenders, awards and procurement
- buyer and intent signals
- product/service gaps
- repeated operational work
- useful model/tool capability changes
- existing Assembl capabilities that can be recombined

Pursuit should output a bounded opportunity with evidence, buyer/user, value hypothesis, urgency and a recommended next action.

Pursuit should help answer: **what is worth building or doing next?**

### 2. DO — do the work

DO is the portable execution layer.

It acts where the user already works — browser and connected tools — and turns intent into bounded action.

DO should:
- expose reusable capabilities rather than bespoke one-off flows
- understand permissions and authority
- preview meaningful risky actions
- request approval at the right boundary
- execute within granted limits
- leave receipts and traces after action
- work as both product capability and distribution surface

DO should help answer: **can Assembl actually complete the useful work?**

### 3. SHOW / Studio — show the possibility

Studio is the visual, experiential and commercial proof layer.

It turns intelligence and capability into something a person can understand, react to, buy, approve or improve:
- working demonstrators
- websites and product experiences
- agentic customer journeys
- image, video, motion and 3D creative
- before/after simulations
- pitch and business-development material
- tender/award concepts and submissions
- campaign and customer experience concepts

SHOW should help answer: **can we make the future tangible enough to evaluate and sell?**

### 4. Factory — make it compound

The Factory sits beneath Pursuit, DO and SHOW.

It owns reusable:
- context
- agent definitions
- skills and runbooks
- software primitives
- connectors and tools
- model routing
- permissions and approval patterns
- design system
- tests and evaluations
- evidence/proof capture
- deployment/release patterns
- decisions and learnings

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

Every substantial build should leave behind something reusable: a primitive, skill, test/eval, pattern, connector, piece of canonical knowledge or durable lesson.

## working shorthand

**Find it. DO it. Show it.**

- Find it → Pursuit
- DO it → execution
- Show it → Studio/proof

This is a product architecture shorthand, not a requirement that every public page use those exact words.

## proof and learning

Proof is not a separate afterthought. Every part of Assembl should create evidence.

Useful proof can include:
- work completed
- time saved
- customer effort reduced
- recommendations accepted
- approvals
- journey completion
- conversions or commercial outcomes
- screenshots/video
- traces and receipts
- eval/test results

Proof feeds the customer, Studio, Pursuit and the Factory.

The flywheel is:

`signals → Pursuit → opportunity → Factory → DO/SHOW → proof → learning → stronger Pursuit + Factory`

## the role of the Business Genome

The Business Genome remains a core **context primitive**, but it is no longer the top-level definition of Assembl.

A Business Genome is structured understanding of a specific business/client/tenant, including:
- products and services
- customer segments
- policies and rules
- terminology
- brand and voice
- workflows
- permissions
- goals
- systems and tools
- knowledge
- success metrics
- approved business-specific context

The Genome is used by Pursuit, DO, SHOW and agentic customer journeys.

Do not confuse a customer's Business Genome with **Assembl company memory**.

Assembl company memory lives in the repository and is routed through:
- `config/context-manifest.json`
- `START_HERE.md`
- `AGENTS.md`
- `docs/context/CURRENT.md`
- canonical strategy/brand/factory documents

## agentic customer journeys

Agentic customer journeys remain a major reusable product foundation.

A journey may include:
- entry and intent
- context gathering
- recommendation
- commitment/approval
- action
- productive wait
- fulfilment
- resolution
- continuation and loyalty
- proof

Pursuit can identify which journeys are valuable. The Factory provides the reusable runtime. DO completes work inside them. SHOW demonstrates and commercialises them.

The reusable foundation lives in `lib/journey/` and is documented in `docs/agentic-customer-journey.md`.

## specialist agents

assembl should not rely on one giant assistant for all work.

Every durable agent should define:
- Purpose
- Inputs
- Outputs
- Authority
- Tools
- Skills
- Limitations
- Evaluations
- Owner
- Version

Agents should collaborate through shared context and runtime contracts rather than inventing responsibilities per conversation.

## authority

Actions should have explicit authority levels:

`observe → draft → recommend → act with approval → act within limits → autonomous with audit`

Humans remain in control of consequential actions.

Never claim an action is completed if it is simulated, proposed, sandboxed or waiting for approval.

## context philosophy

Context selection is a product capability.

Do not load an entire Business Genome, entire repo, all prior chats or all company history into every request.

Retrieve the smallest useful current context for the stage/task.

For Assembl's own agents, use `config/context-manifest.json` and `docs/context/README.md` to route context consistently.

Chat history is working memory, not company canon. Durable truths discovered in chats should be promoted into the repository.

## customer experience philosophy

Customers should not need to understand the underlying agent team.

They should feel:
- I do not have to explain myself twice.
- I understand what is happening.
- I know what happens next.
- useful work is being completed for me.
- I stayed in control.

Ask only the smallest useful next question.

## wait states

Waiting is a first-class journey moment.

A productive wait state can:
- reduce uncertainty
- gather missing context
- prepare the next step
- explain progress
- educate
- recommend
- reward
- increase confidence

Waiting should not be a meaningless spinner.

Wait-state strategy remains documented in `docs/agentic-wait-states-roadmap.md`.

## technical principles

- Prefer deterministic software where reasoning is unnecessary.
- Use models where reasoning, interpretation or generation adds genuine value.
- Use structured inputs/outputs for machine-to-machine work.
- Make important actions traceable.
- Keep side effects bounded and reversible where possible.
- Use approval gates at meaningful risk boundaries.
- Reuse existing primitives before creating parallel infrastructure.
- Prove runtime behaviour rather than assuming generated code works.
- Treat models and harnesses as replaceable; keep company memory and capability portable.

## design and brand

The canonical company visual system is `docs/assembl-brand-system.md`.

Current company direction:
- deep plum `#240B21`
- muted plum `#654A4E`
- dusty rose `#916A70`
- chalk `#F5F1F2`
- paper `#FFFDFB`
- Instrument Sans
- IBM Plex Mono for evidence/proof metadata
- lowercase `assembl`

Old Cormorant/champagne/gold/brass/pounamu/canary company directions are legacy and must not be treated as current precedent merely because they remain in old code or assets.

Verified client branding remains scoped to the named client work.

## long-term goal

assembl should make valuable software and customer work cheaper and faster to produce **without losing taste, trust or proof**.

The long-term system is not a single linear architecture. It is a compounding loop:

```text
live signals + business context
        ↓
      Pursuit
        ↓
 opportunity / specification
        ↓
      Factory
     ↙      ↘
    DO      SHOW
     ↘      ↙
      proof
        ↓
 learning + reusable primitives
        ↓
 stronger Pursuit + Factory
```

That is assembl.
