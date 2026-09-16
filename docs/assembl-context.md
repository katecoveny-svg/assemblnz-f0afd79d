# assembl · context

> Canonical company and product strategy. For the latest working state, read `docs/context/CURRENT.md` first. Public copy follows `docs/assembl-copy-standard.md`. Visual work follows `docs/assembl-brand-system.md` and root `DESIGN.md`.

**Last strategy refresh:** 17 September 2026

## what assembl is

assembl is an **intelligence-powered software factory for finding, doing and showing valuable work**.

It combines live signals, structured business context, specialist agents, reusable software primitives, safe action patterns and proof systems so useful work can be discovered, prepared, executed and demonstrated repeatedly.

assembl is not one giant assistant, a chatbot platform, a traditional automation agency or a collection of disconnected demos.

The durable asset is not any single model. It is Assembl's context, reusable capabilities, customer understanding, design taste, evidence and learning loop.

## working company structure

> **assembl the work.**
>
> **find it. DO it. show it.**

The three customer-facing products are **Pursuit, DO and Studio**. Each can stand alone. Together they connect opportunity, execution and proof.

> **use one. connect two. run the whole loop.**

### 1. Pursuit — find the work

Pursuit is the intelligence and opportunity layer.

It gathers and interprets signals such as:

- customer/business friction;
- company and market changes;
- tenders, awards and procurement;
- buyer and relationship signals;
- product/service gaps;
- repeated operational work;
- useful model/tool/API changes;
- existing Assembl capabilities that can be recombined.

A good Pursuit output is a bounded opportunity with evidence, provenance, buyer/user, value hypothesis, urgency, smallest useful proof and a recommended next action.

Pursuit should answer:

> **what is worth doing next?**

Tender and procurement work is a high-value vertical for Pursuit, but Pursuit is broader than tenders.

### 2. DO — do the work

DO is the portable execution and safe-action layer.

It starts from an outcome: **what do you need done?**

DO should work where the user already is — browser, hosted workspace, native desktop, PWA/mobile/share surfaces and connected tools — rather than forcing every job into a new standalone app.

Shared runtime spine:

`context + intent → AgentSpec → tools → permissions → outcome + evidence`

Safe-action lifecycle:

`know → prepare → permit → do → verify → receipt`

DO should:

- retrieve the smallest useful current context;
- expose reusable capabilities rather than one-off flows;
- understand the user's authority and the action's risk;
- preview meaningful external actions before they happen;
- request approval at the correct boundary;
- execute within granted limits;
- verify results where possible;
- leave receipts, traces and evidence;
- distinguish context access from authority to act.

DO should answer:

> **can Assembl actually complete the useful work?**

#### DO Action Cloud

The Action Cloud is the shared safe-action contract beneath DO.

It is the direction for reusable primitives such as:

- action contract;
- Permit;
- Wait;
- Receipt;
- browser runtime;
- forms;
- calls;
- booking;
- quote preparation;
- agent-ready tools/APIs;
- verification.

Phase 1 contract/API work exists in the repository, but the full Action Cloud remains staged. Do not describe the whole platform as production-live because individual contracts, schemas, demos or endpoints exist.

Start at `docs/do-action-cloud/README.md` for current build detail.

#### DO surfaces

Treat DO as one portable runtime with multiple surfaces, not unrelated products.

Active surfaces and directions include:

- hosted DO workspace/widget;
- browser extension and side panel;
- native Mac floating companion;
- PWA/mobile/share surfaces;
- DO Office;
- task-specific DOs generated from the same AgentSpec model;
- Meeting DO / DO Meet;
- Household and personal DO patterns;
- Builder DO;
- voice as a channel into the same DO state and policy model;
- partner/client-specific DO experiences where boundaries remain explicit.

No surface gets a privileged bypass around permission, evidence or approval rules.

### 3. Studio / SHOW — show the possibility

Studio is the visual, experiential and commercial proof layer.

It turns a Pursuit opportunity, a DO result or an independent brief into something a person can see, experience, approve, buy, test or improve:

- working demonstrators;
- interactive pitches;
- websites and microsites;
- product/customer-experience prototypes;
- agentic customer journeys;
- image generation and art direction;
- video, film, motion and 3D;
- advertising and campaign concepts;
- sales and business-development artefacts;
- tender and award concepts/submissions;
- before/after simulations;
- evidence-rich proof of a proposed change.

Studio is not decorative presentation around an unproven claim and should not present as a text-only file library.

Studio should answer:

> **can we make the possibility tangible enough to evaluate, sell or improve?**

### 4. Factory — make it compound

The Factory sits beneath Pursuit, DO and Studio.

It owns reusable:

- context;
- agent definitions;
- skills and runbooks;
- software primitives;
- connectors and tools;
- model routing;
- permissions and approval patterns;
- design and motion primitives;
- tests and evaluations;
- evidence/proof capture;
- deployment/release patterns;
- decisions and learnings.

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

Every substantial build should leave behind something reusable: a primitive, skill, test/eval, connector, design pattern, piece of canonical knowledge or durable lesson.

## proof and learning

Proof is part of the product.

Useful proof can include:

- work completed;
- time saved;
- customer effort reduced;
- recommendations accepted;
- approvals;
- journey completion;
- commercial outcomes;
- screenshots/video;
- traces and receipts;
- tests and evaluation results.

Flywheel:

`signals → Pursuit → opportunity → Factory → DO/Studio → proof → learning → stronger Pursuit + Factory`

## current product directions inside the architecture

These directions are important, but they do not replace the top-level company structure.

### agentic customer journeys

Agentic customer journeys remain a major reusable product foundation.

A journey may include:

- entry and intent;
- context gathering;
- recommendation;
- commitment/approval;
- action;
- productive wait;
- fulfilment;
- resolution;
- continuation and loyalty;
- proof.

Pursuit can identify which journeys are valuable. The Factory supplies reusable runtime components. DO completes work inside them. Studio demonstrates and commercialises them.

The reusable foundation lives in `lib/journey/` and is documented in `docs/agentic-customer-journey.md`.

### wait states

Waiting is a first-class journey moment, not the definition of the whole company.

A productive wait can:

- reduce uncertainty;
- gather missing context;
- prepare the next step;
- explain progress;
- educate;
- recommend;
- reward;
- improve a handoff.

Principle:

> **utility first. reward second. interruption never.**

Loyalty, rewards and sponsorship are optional capabilities inside appropriate journeys. Never create artificial waiting or pressure a customer into disclosure to manufacture engagement.

### sponsored journeys

Sponsored Journeys are a provider-neutral pattern.

Useful shape:

`branded agent → user intent → useful work → contextual offer/reward where relevant → explicit permission → action/handoff → receipt`

The sponsor must be named. Utility remains primary. Sharing is optional. The sponsor must not control the underlying customer outcome.

Current Sponsored Journey surfaces must be described according to their actual runtime status: preview/prototype unless a specific live integration has been verified.

### DO Meet / Meeting DO

Meeting DO is the conversation-to-work expression of DO.

> **Talk. Decide. DO.**

Intended flow:

`conversation → transcript/notes → decisions → work graph → agents/tools → approvals → completed work + receipts`

Recording/transcription and smart-note product work exists. Broader DO Meet hosted-video, meeting-bot and production-integration work remains staged unless specifically verified. Read `docs/do-meet/` before making capability claims.

### agent-ready tools

Assembl can expose small, bounded tools that other agents can call.

The direction is sandbox-first capability with:

- explicit inputs and outputs;
- provider/operator identity where relevant;
- source and privacy boundaries;
- keys/caps where appropriate;
- test mode;
- receipts;
- metered/paid usage only where the underlying utility is real.

These tools should strengthen Pursuit and DO rather than become a random API marketplace.

## the role of the Business Genome

The Business Genome remains a core context primitive, but it is not the top-level definition of assembl.

A Business Genome is structured understanding of a specific business/client/tenant, including:

- products and services;
- customer segments;
- policies and rules;
- terminology;
- brand and voice;
- workflows;
- permissions;
- goals;
- systems and tools;
- knowledge;
- success metrics;
- approved business-specific context.

The Genome is used by Pursuit, DO, Studio and customer journeys.

Do not confuse a customer's Business Genome with Assembl company memory.

Assembl company memory is routed through:

- `START_HERE.md`;
- `AGENTS.md`;
- `config/context-manifest.json`;
- `docs/context/CURRENT.md`;
- this file;
- canonical brand/copy/factory documents.

## specialist agents

assembl should not rely on one giant assistant for all work.

Every durable agent should define:

- purpose;
- inputs;
- outputs;
- authority;
- tools;
- skills;
- limitations;
- evaluations;
- owner;
- version.

Agents collaborate through shared context and runtime contracts rather than inventing responsibilities per conversation.

## authority

Actions should have explicit authority levels:

`observe → draft → recommend → act with approval → act within limits → autonomous with audit`

Humans remain in control of consequential actions unless bounded authority is explicitly granted.

Never claim an action is completed if it is simulated, proposed, sandboxed, draft-only or waiting for approval.

Preferred pattern for meaningful side effects:

1. show what will happen;
2. show the relevant context/source;
3. obtain permission at the right boundary;
4. execute through the approved path;
5. verify where possible;
6. leave a receipt.

## context philosophy

Context selection is a product capability.

Do not load an entire Business Genome, repository, all prior chats or all company history into every request.

Retrieve the smallest useful current context for the stage/task.

For Assembl agents, use `config/context-manifest.json` and `docs/context/README.md` to route context consistently.

Chat history is working memory, not company canon. Durable truths discovered in chats should be deliberately promoted into the repository.

## customer experience philosophy

Customers should not need to understand the underlying agent team.

They should feel:

- I do not have to explain myself twice.
- I understand what is happening.
- I know what happens next.
- useful work is being completed or prepared for me.
- I stayed in control.

Ask only the smallest useful next question.

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
- Separate canonical intent, runtime truth, preview, proposal and build-brief states.
- A credential or connected account does not itself grant authority to send, publish, submit, spend or approve.

## design and brand

Canonical visual system: `docs/assembl-brand-system.md`. Operational agent guide: root `DESIGN.md`.

Current palette:

- deep plum `#240B21`;
- muted plum `#654A4E`;
- dusty rose `#916A70`;
- chalk `#F5F1F2`;
- paper `#FFFDFB`.

Typography:

- Instrument Sans for headlines, body, navigation and controls;
- IBM Plex Mono for evidence, timestamps, permissions and proof metadata.

Wordmark: lowercase `assembl`.

Master visual idea:

> **things gather, organise and move with purpose until a useful whole is visible.**

Use two complementary modes:

1. **brand/narrative assembly** — premium aerial/top-down fine-art collective movement, often with an Aotearoa sensibility;
2. **product/proof assembly** — recognisable inputs becoming a reviewable output with permission, reviewer and evidence visible.

Do not use generic AI gradients, robots, chatbot imagery, black-heavy SaaS dashboards or decorative particle clouds as a substitute for showing the product.

Old Cormorant/champagne/gold/brass/pounamu/canary/grape-purple company directions are legacy unless deliberately scoped to historical/client work.

## public communication

Company-level messaging should explain the connected work system before narrower wait-state capabilities.

Preferred hierarchy:

1. what Assembl helps get done;
2. Pursuit / DO / Studio;
3. how the products connect;
4. proof and relevant capabilities;
5. customer journeys, waits, rewards or sponsorship when they solve the specific problem.

Never invent prices, customer logos, partnerships, testimonials, performance metrics, live integrations or autonomous capability.

Use short, concrete New Zealand English. Keep `assembl` lowercase. Avoid generic AI language and inflated transformation claims.

## long-term goal

assembl should make valuable software and customer work cheaper and faster to produce **without losing taste, trust or proof**.

```text
live signals + business context
        ↓
      Pursuit
        ↓
 opportunity / specification
        ↓
      Factory
     ↙      ↘
    DO      Studio
     ↘      ↙
      proof
        ↓
 learning + reusable primitives
        ↓
 stronger Pursuit + Factory
```

That is assembl.
