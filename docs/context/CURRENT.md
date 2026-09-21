# assembl — current operating state

**Last verified:** 17 September 2026  
**Status:** current working context  
**Update rule:** refresh from merged work and accepted decisions; do not rewrite stable canon casually.

This file answers: **where is assembl at right now?**

It is intentionally shorter and more changeable than the long-term strategy documents.

## current shape

**Public positioning (21 Sep 2026):** Kate supplied the homepage/outreach explanation: “assembl is a platform that turns live business signals into governed agentic work.” Pursuit finds meaningful changes and opportunities; DO assembles context, agents, tools and permissions with human approval for consequential steps and evidence; Studio creates demonstrations, proposals and customer experiences. Exact approved wording is in `docs/assembl-copy-standard.md`. This updates the public explanation, not the runtime status of every capability below.

assembl is becoming an **intelligence-powered software factory for finding, doing and showing valuable work**.

Working company shorthand:

> **assembl the work.**
>
> **find it. DO it. show it.**

Commercially, Pursuit, DO and Studio can stand alone or connect:

> **use one. connect two. run the whole loop.**

### PURSUIT — find the work

Pursuit gathers live and accumulated signals and turns them into evidence-backed opportunities.

It should understand:

- companies and markets;
- customer/business friction;
- tenders, awards and procurement;
- buyer and relationship signals;
- product/market changes;
- useful model/tool capability changes;
- client-specific opportunities;
- what assembl has already built that can be reused.

Output: a bounded opportunity with evidence, provenance, buyer/user, value hypothesis, urgency, smallest useful proof and next action.

#### Pursuit state — 17 Sep

A flexible Pursuit journey builder and public NZBN playground were merged as **PREVIEW** work. Current preview capabilities include freeform clients, uploadable brand imagery, editable journey steps, a Sponsored Agent module and draft-only outreach gating.

Do not describe these preview surfaces as live client integrations or live advertising/commerce infrastructure.

Pursuit remains broader than tenders, although tender/procurement work is a high-value vertical and commercial wedge.

### DO — do the work

**Accepted Bills task (21 Sep 2026):** Kate requested the job-specific DO / Redbark proposal be built into the existing product. The first review build extends /do/bills with a clearly fictional demonstration, local NZD CSV analysis, checked invoice dates, editable enquiries and local evidence/review records. /do/bills/compare retains the existing bill reader and sourced research. Bills may now be linked from DO home and shared navigation; this supersedes the earlier Bills promotion restriction only. Live Redbark OAuth, durable banking records, financial writes, full Money/Business/Tradie/LockedIn products and production deployment are not established by this change. Details: docs/do-bills/FINANCIAL-FOUNDATION.md.


DO is the portable execution and safe-action layer.

It should work where the user already is — browser, hosted workspace, native desktop, PWA/mobile/share surfaces and connected tools — rather than forcing every job into a new standalone application.

Shared spine:

`context + intent → AgentSpec → tools → permissions → outcome + evidence`

Safe-action lifecycle:

`know → prepare → permit → do → verify → receipt`

Risky actions are previewed and approved at meaningful boundaries. Completed actions should leave receipts.

#### DO Action Cloud — Phase 1 merged

Phase 1 source work is now present for the shared safe-action layer, including:

- Action Contract schema;
- Permit / Wait / Receipt data structures;
- `/api/do/action` stage routes;
- action-run and receipt persistence schema;
- a bounded `demo.echo` lifecycle;
- verification/VAR scaffolding;
- OpenAPI draft and acceptance tests.

This is meaningful implementation progress, but it does **not** make the entire Action Cloud a live production platform. Treat wider provider rails, commercial integrations and autonomous action as staged until specifically verified.

Canonical build package: `docs/do-action-cloud/`.

#### DO Browser + Sponsored Journeys

A Sponsored Journeys and DO Browser Runtime prototype is merged.

Current prototype direction includes:

- `/do/sponsored` grocery/loyalty demonstration;
- `/do/browser` persistent-job concepts;
- browser widget/side-panel hooks;
- permit/receipt UX moving toward the shared Action Cloud contract.

These surfaces are explicitly prototypes/previews. They are not evidence of a live OpenAI Ads, Meta, CRM, commerce or partner integration.

Sponsored Journeys should stay provider-neutral and utility-led.

#### DO surfaces

Treat DO as **one portable runtime with multiple surfaces**, not a collection of unrelated apps.

**Public `/do` access correction (merged in #1404; live entry verified 21 Sep 2026):** Kate asked for a visible DO entry point and working core actions. This supersedes the 17 Sep explanation-only / hidden-tool direction. The homepage should say Open DO; `/do` should offer the hosted writing workspace, Meeting DO with its sign-in requirement, and school/family notice preparation before the preserved atelier story. The browser companion is a setup guide. Do not imply a full family Today feed, automatic meeting join, live bus tracking, cross-tab execution or autonomous work exists. Private operator and fictional household surfaces remain outside public promotion. Authentication, source consent and external-action approvals remain intact.

Current/active surfaces include:

- hosted DO workspace/widget;
- Chrome/browser extension and side-panel companion;
- native Mac floating companion;
- scoped PWA and install flow;
- DO Office;
- Household DO;
- Meeting DO;
- Builder DO;
- Task DO Maker;
- voice as an interaction channel;
- partner/client-specific DO skins where clearly labelled.

The native Mac companion is the persistent cross-app surface for **“do this here, now.”** Context access does not imply authority to act.

**DO Office** is the coordination surface for **“show me my DO team and what is happening.”** It should expose workspaces, needs-you approvals/questions, active work, completed work/receipts and structured handoffs without becoming a hidden group chat of bots.

**Task DO Maker** supports white-label task-specific DO creation from Pursuit/Studio and partner-facing modes. Preview/export state must remain distinct from durable Office provisioning.

#### Meeting DO / DO Meet

Meeting DO currently includes recording/transcription-oriented product work and Granola-style smart-note preparation with explicit truth boundaries around model/transcription availability.

The wider **DO Meet** direction is:

> **Talk. Decide. DO.**

`conversation → transcript/notes → decisions → work graph → agents/tools → approvals → completed work + receipts`

The DO Meet package under `docs/do-meet/` is a **build brief**, not a claim that all hosted video, bot-provider or production meeting integrations are live.

#### agent-ready tools

Sandbox-first agent tools have expanded, including trade-finder, meeting-enhance and compliance-ping patterns alongside NZ business/operator lookup work.

The product principle is small, bounded tools with clear source/privacy limits, keys/caps where relevant and receipts. Do not turn this into a random API marketplace.

### SHOW / STUDIO — show the possibility

Studio is the visual, experiential and commercial proof layer.

It turns opportunities and software capability into:

- interactive demonstrators;
- product/customer journeys;
- websites and microsites;
- image, video, film, motion and 3D;
- advertising and campaign concepts;
- pitches and business-development artefacts;
- tender/award concepts and submissions;
- before/after simulations;
- proof that a proposed change is understandable and valuable.

SHOW is not just presentation. It is how assembl makes invisible future work tangible enough to sell, test and improve.

Studio must remain genuinely visual and experiential. Do not reduce it to a text-only file library.

### FACTORY — build once, reuse repeatedly

The Factory sits beneath Pursuit, DO and Studio.

It owns:

- canonical context;
- agent definitions;
- skills/runbooks;
- reusable primitives;
- connectors/tools;
- model routing;
- permissions/approvals;
- design/motion primitives;
- tests and evals;
- proof/evidence capture;
- deployment patterns;
- durable decisions and learnings.

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

### PROOF + LEARNING — close the loop

Every useful build should produce evidence and learning.

Flywheel:

`signals → Pursuit → opportunity → Factory → DO/Studio → proof → learning → stronger Pursuit + Factory`

## Business Genome

The **Business Genome remains important, but it is not the top-level description of assembl**.

Use “Business Genome” for structured, reusable understanding of a specific business/client/tenant: products, customers, policies, terminology, brand, workflows, permissions, systems, knowledge, goals and success metrics.

Do not confuse:

- **assembl company memory** — canonical repository context describing assembl itself;
- **Business Genome** — context for a customer/business being served.

## customer journeys and wait states

Agentic customer journeys remain a major product primitive.

The reusable journey system can support intent, context gathering, recommendation, approval, action, productive waits, fulfilment/resolution, continuation/loyalty and proof.

Wait states, rewards and sponsorship are **capabilities inside appropriate journeys**, not the top-level definition of assembl.

Principle:

> **utility first. reward second. interruption never.**

## brand state — do not drift

Canonical company brand: `docs/assembl-brand-system.md`.
Operational design guide: `DESIGN.md`.

Use:

- Deep plum `#240B21`;
- Muted plum `#654A4E`;
- Dusty rose `#916A70`;
- Chalk `#F5F1F2`;
- Paper `#FFFDFB`;
- Instrument Sans for normal company UI/type;
- IBM Plex Mono for evidence/proof/permission metadata;
- lowercase `assembl`.

Visual grammar:

> **things gather, organise and move with purpose until a useful whole is visible.**

Two approved visual modes:

1. brand/narrative assembly — premium aerial/top-down fine-art collective motion, often with an Aotearoa sensibility;
2. product/proof assembly — recognisable inputs becoming a reviewable output, permission boundary and receipt.

Do not use old Cormorant/champagne/gold/brass/pounamu/canary/grape-purple company directions as precedent because they remain in legacy code.

## persistent memory model

All agents should share the same context layers:

1. `config/context-manifest.json`;
2. this current state file;
3. `docs/assembl-context.md`;
4. brand/copy/design canon;
5. factory decisions/primitives/learnings;
6. task-specific product docs;
7. current code/schema/tests as runtime truth.

Chat history is useful working memory, not company canon.

## truth labels

Agents must distinguish:

- **canonical** — durable intended truth;
- **current state** — today's operating state;
- **runtime truth** — what current code/schema/tests actually do;
- **preview** — implemented for demonstration/evaluation, not production proof;
- **build brief** — defined work that may not be implemented;
- **proposal** — not yet accepted;
- **simulated** — no real external effect;
- **legacy/historical** — retained reference, not current instruction.

Never promote a preview, credential, generated output or merged document into a stronger capability claim without runtime evidence.

## end-of-day update rule

At the end of a meaningful workday:

1. inspect merged PRs and accepted decisions;
2. identify real changes to product direction, brand, architecture, primitives or operating rules;
3. update this file only when the current operating state genuinely changed;
4. update stable canon only when a durable decision changed;
5. register reusable capabilities, decisions and learnings in the Factory docs;
6. never let an automated process silently rewrite brand or product canon.
