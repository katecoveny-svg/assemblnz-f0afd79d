# assembl — current operating state

**Last verified:** 16 September 2026  
**Status:** current working context  
**Update rule:** refresh from merged work and accepted decisions; do not rewrite stable canon casually.

This file answers: **where is assembl at right now?**

It is intentionally shorter and more changeable than the long-term strategy documents.

## current shape

assembl is becoming an **intelligence-powered software factory** for finding, doing and showing valuable work.

The current top-level structure is:

### PURSUIT — find the work
Pursuit gathers live and accumulated signals and turns them into evidence-backed opportunities.

It should understand:
- companies and markets
- customer/business friction
- tenders, awards and procurement
- buyer signals
- product/market changes
- useful model/tool capability changes
- client-specific opportunities
- what assembl has already built that can be reused

Output: a bounded opportunity with evidence, buyer/user, value hypothesis, urgency and next action.

### DO — do the work
DO is the portable execution layer.

It should work where the user already is — browser, native desktop and connected tools — rather than forcing every job into a new standalone application.

DO capabilities should be reusable, permission-aware and composable. Risky actions are previewed and approved; completed actions leave receipts.

DO can also be a distribution/lead surface: useful small tools can be tried with limited free usage and upgraded into paid capability.

#### current DO shape

Treat DO as **one portable runtime with multiple surfaces**, not a collection of unrelated apps.

Current shared spine:

`context + intent → AgentSpec → tools → permissions → outcome/evidence`

Current/active surfaces include:
- hosted DO workspace/widget
- browser extension / side-panel companion
- native Mac floating companion
- mobile/share surfaces
- voice as an interaction channel

The native Mac companion is the intended persistent cross-app surface for **“do this here, now.”** It now has a floating orb, explicit accessibility-based selected-text/review-first paste controls, persisted orb position/visibility, and an opt-in launch-at-login path. It must not silently read secure fields, record the screen, or turn context access into authority to act.

**DO Office** is the coordination surface for **“show me my DO team and what is happening.”** It sits above the same AgentSpec runtime and should make these visible:
- personal / work / client workspaces
- needs-you approvals/questions
- active work
- completed work + receipts
- structured handoffs/inbox
- actual provisioned identities/mailboxes where available

DO Office is not a second agent runtime and should not become a hidden group chat of bots. Agent-to-agent coordination should use structured, inspectable handoffs carrying minimal task context, requested action and evidence references.

A DO may have a human-readable identity and eventually a real email address, but the product must distinguish proposed identity from an actually provisioned mailbox. Reuse the existing agent-email infrastructure rather than fabricating addresses or creating a second mail system.

Durable DO Office schema has been added to source for owner-scoped workspaces, DO AgentSpec records, structured handoffs and receipts. Treat deployment/runtime availability as unverified until the migration is deliberately confirmed against the live Supabase project and app repository methods are wired.

Gemini Live voice work is currently an active integration effort. The intended boundary is: voice can converse, prepare/compile DO work and query/coordinate the same DO state, but it must use the same context, tool permission, approval and evidence rules as every other surface. Voice is a channel into DO, not a privileged bypass around DO policy.

For visual/system details, see `docs/DO-OFFICE-ARCHITECTURE.md` and the DO shared primitives under `apps/do/shared/`.

### SHOW / STUDIO — show the possibility
Studio is the visual, experiential and commercial proof layer.

It turns opportunities and software capability into:
- interactive demonstrators
- product/customer journeys
- websites and campaign experiences
- image, video and 3D creative
- pitches and business-development artefacts
- tender/award concepts and submissions
- before/after simulations
- proof that a proposed change is understandable and valuable

SHOW is not just presentation. It is how assembl makes invisible future work tangible enough to sell, test and improve.

### FACTORY — build once, reuse repeatedly
The factory sits beneath Pursuit, DO and SHOW.

It owns:
- canonical context
- agent definitions
- skills/runbooks
- reusable primitives
- connectors/tools
- model routing
- permissions/approvals
- tests and evals
- proof/evidence capture
- deployment patterns
- durable decisions and learnings

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

### PROOF + LEARNING — close the loop
Every useful build should produce evidence and learning.

That evidence feeds:
- the next customer decision
- the next Pursuit opportunity
- the primitive registry
- agent/eval improvements
- future Studio demonstrations
- product and commercial strategy

The intended flywheel is:

`signals → Pursuit → opportunity → Factory → DO/SHOW → proof → learning → stronger Pursuit + Factory`

## the role of the Business Genome

The **Business Genome remains important, but it is not the top-level description of assembl**.

Use “Business Genome” for structured, reusable understanding of a specific business/client/tenant, including:
- products/services
- customers/segments
- policies/rules
- terminology
- brand and voice
- workflows
- permissions
- systems/tools
- knowledge
- success metrics
- approved company-specific context

The Genome is a **context substrate** used by Pursuit, DO, SHOW and customer journeys.

Do not confuse:
- **assembl company memory** — the canonical repo context that describes assembl itself
with
- **a Business Genome** — structured context for a customer/business being served.

assembl company memory is routed through `config/context-manifest.json` and `docs/context/*`.

## customer journey foundation

Agentic customer journeys remain a major product primitive, not discarded strategy.

The reusable journey system should continue to support:
- intent
- context gathering
- recommendation
- approval
- action
- productive wait states
- fulfilment/resolution
- continuation/loyalty
- proof

Pursuit can discover which journeys are worth building; the Factory assembles them; DO performs work inside them; SHOW demonstrates and sells them.

## current product language

Working company-level shorthand:

**Find it. DO it. Show it.**

Interpretation:
- **Find it** → Pursuit/intelligence
- **DO it** → execution
- **Show it** → Studio/proof/creative/commercialisation

The exact public homepage wording can evolve, but product architecture should not be independently reinvented by each agent.

## brand state — do not drift

Canonical company brand remains `docs/assembl-brand-system.md`.

Use:
- Deep plum `#240B21`
- Muted plum `#654A4E`
- Dusty rose `#916A70`
- Chalk `#F5F1F2`
- Paper `#FFFDFB`
- Instrument Sans for normal company UI/type
- IBM Plex Mono for evidence/proof/wait-state metadata
- lowercase `assembl`

Do **not** use old Cormorant/champagne/gold/brass/pounamu/canary company directions as precedent simply because they still exist in older code, screenshots or research.

Client-specific verified branding is allowed inside named client work.

## persistent memory model

All agents should share the same layers:

1. **manifest** — `config/context-manifest.json`
2. **current state** — this file
3. **stable company/product canon** — `docs/assembl-context.md`
4. **brand/copy canon** — brand and copy standards
5. **factory memory** — decisions, primitives, learnings
6. **task-specific product docs**
7. **runtime truth** — current code/schema/tests

Chat history is useful working memory, but it is not company canon.

If a chat discovers a durable truth, promote it into the repo rather than relying on that chat to be found again.

## end-of-day update rule

At the end of a meaningful workday:

1. inspect merged PRs/accepted decisions since the last update
2. identify changes to product direction, brand, architecture, primitives or operating rules
3. append raw/day-specific facts to a daily state note if useful
4. update this file only when the *current operating state* genuinely changed
5. update a stable canonical document only when a durable decision changed
6. add new reusable capability to `docs/factory/PRIMITIVES.md`
7. add decisions to `docs/factory/DECISIONS.md`
8. add repeated lessons/failures to `docs/factory/LEARNINGS.md`
9. never let an automated nightly process silently rewrite brand/product canon

This creates persistent memory without turning every day's experiments into permanent truth.
