# assembl — Agentic Operating System: Architecture Audit & Roadmap

_Master-brief audit · 2026-07-13 · produced per the "Business Genome and
Agentic Operating System" brief, section 20. This is the current-state
report, target architecture, gap analysis, phased roadmap and first-slice
recommendation. Read `docs/LIVING-SITE-HANDOVER.md` and
`docs/DESIGN-SYSTEM-VNEXT.md` alongside this._

---

## A. Current-state architecture report

### Stack & structure
- Next.js 16 App Router, React 19, TypeScript, Tailwind; pnpm workspace with
  `packages/canvas` (`@assembl/canvas`, direction-locked design tokens +
  motion) and `packages/dash-sdk`.
- AI: Vercel AI SDK (`ai@6`, `@ai-sdk/anthropic`, `@ai-sdk/openai`).
- Data: Supabase (`wurwcrgxjjwqdaxqceey`), ~330 migrations, RLS deny-all on
  product tables, service-role access only via `lib/supabase/service.ts`.
- Payments: Stripe (billing checkout, portal, webhooks, Connect under
  `/api/dash`). Voice: ElevenLabs TTS (`lib/voice/platform-voice.ts`),
  browser SpeechRecognition/speechSynthesis for the Fred desk. Telephony:
  Twilio routes under `/api/voice`.
- **Two architectural generations coexist**: the live Next.js app (Living
  Business OS, Fred, Living Sites) and ~185 legacy Supabase edge functions
  from the marketplace/kete era (mostly dormant; `iho-router`,
  `family-inbox-sync`, `morning-briefing` still used).

### Tenancy
- `lib/customers/tenants.ts` (12 hosted-pilot tenants) +
  `lib/living-site/verticals.ts` (9 fictional sample verticals mapping URL
  slug → `living_site_genome` tenant key). Install flow mints real tenants
  (`lib/living-site/install-store.ts`).
- `middleware.ts` is the routing brain: apex splash gate, demo-host
  basic-auth, HMAC magic-link invites, host→tenant rewrites, legacy 308s.
- **Hard-wired flagship**: `app/page.tsx` and several surfaces import the
  `auckland-dog-trainer` genome directly rather than resolving a tenant.

### Authentication
- `/admin` operator hub: Supabase Auth + `lib/admin/ensureAdmin.ts`
  (founder allowlist, `designated_admins`).
- `/customers/*`: HTTP Basic (shared demo credential) or signed invite
  cookie, enforced in middleware. Anonymous usage gating for free tools in
  `lib/gating/`.

### The genome today
- `living_site_genome`: one row per fact per tenant —
  `(tenant, fact_id, section, label, value, read_by[], updated_at)`.
  Six sections (`identity, services, team, knowledge, proof, operations`),
  ten consuming surfaces, ripple via `read_by`.
- Consumed by: sample sites, ops console (`BusinessGenome` editable grid),
  homepage, `/genome`, desk agent (`lib/living-site/desk.ts` answers only
  from facts, citation-enforced), installer (`factsFromAnswers`).
- **No provenance**: no source, confidence, verified-state, or edit history.
  Confirmed vs inferred vs stale is not representable.

### Agents & AI
- Agent registry: `lib/marketplace/agents.ts` (2.5k lines, ~40 real
  prompt-backed agents) + locked prompts in `agent-prompts.ts`, capability
  profiles in `agent-capabilities.ts`, connector catalogue in
  `agent-connectors.ts` (all actions `needs_setup`, `requiresHumanApproval`).
- Model routing: `lib/ai/router.ts` — Claude-primary ladder → Gemini → Groq
  → Ollama, real failover for non-streaming (`generateWithFallback`),
  fallback disclosure. Edge layer has two MORE routers with contradictory
  policy (`_shared/model-router.ts` silently downgrades Claude→Gemini;
  `iho-router` has its own tiering).
- Orchestration: none unified. Live chat = single-shot streaming with tool
  round-trips (`stepCountIs(4)`). Handoffs are prompt hints
  (`lib/agents/handoffs.ts`), not programmatic.
- Draft-only is enforced **structurally**: tools file
  `agent_action_requests` rows (`pending` → operator decision at
  `/admin/approvals` → dispatch env-gated behind `ACTION_DISPATCH_ENABLED`,
  default off). Family inbox writes `proposed` items only. Bookings start
  `requested`; documents start `draft`.

### Tasks, evidence, observability
- No first-class task model. Closest primitives: `family_items`
  (kind/status state machine), `agent_action_requests`, bookings/documents
  status columns. `workflow_runs` is telemetry, not orchestration.
- Evidence foundations are real: `mana_receipts` (chat/action custody),
  `assembl_audit_log` (append-only, org-scoped RLS, 7-year retention),
  `kpi_evidence_summary` matview, `mana_receipt` voice hash-chain.
- Cost/token logging: `agent_cost_log` (edge, opt-in per call),
  `agent_analytics`, `model_fallback_events`, `routing_log`. Not unified.

### Interface (against brief §11)
- **Today**: exists — `PearlToday` in the flagship ops console.
- **Business Genome**: exists — editable grid + ripple + kinetic sculpture.
- **Agent Team**: partial — `/agents/pick` fleet browser (gated), agent
  cards exist; no per-agent work/cost/permissions view.
- **Work**: missing (no task system).
- **Proof**: partial — `/admin/receipts`, evidence pack surfaces; not
  tenant-facing, not attached to tasks.
- **Connections**: partial — connector catalogue UI; no health/auth state.
- **Intelligence**: missing (morning brief is the seed).

### Obsolete / risk areas
- Marketplace routes 308-redirected but orphaned pages remain
  (`app/agents`, `app/bundles`, `app/kete`, `components/marketplace/*`).
  The registry libs under `lib/marketplace/` are load-bearing and misnamed.
- Three agent registries drift (Next.js registry, `iho-router`'s 46,
  `agent-router`'s 78).
- Edge `model-router` PREFIX_MAP contradicts the Claude-primary policy.
- `ensureAdmin.ts` still redirects non-operators to `/agents` (now 308s on).
- `living_site_enquiries.dog` column is legacy-named (carries the generic
  detail line).

---

## B. Target architecture

The brief's ten systems, mapped onto what this codebase should become. New
domain code lives under `lib/os/` (the operating-system core), keeping
`lib/living-site/` as the funnel and `lib/marketplace/` scheduled for
rehoming.

1. **Business genome** — keep `living_site_genome` as the spine; add
   provenance columns (`source`, `source_ref`, `confidence`,
   `verification` = confirmed|inferred|suggested|stale|conflicting,
   `discovered_at`, `verified_at`) plus `living_site_genome_history`
   (append-only edit log). Extend `section` toward the brief's eight
   categories as tenants need them (identity, people, customers,
   operations, commercial, knowledge, systems, goals) — additive, not a
   rewrite; industry modules = per-vertical fact packs (the installer
   already does this).
2. **Agent registry** — `lib/os/agents/registry.ts`: rehomed from
   `lib/marketplace/agents.ts`, each agent gaining `genomeDomains`,
   `permissions`, `memoryPolicy`, `escalation`, `approvalRequirements`,
   `costLimits`, `evidenceRequirements`. Recommend a small starting team
   from the genome (installer answer → 3-agent team).
3. **Capability registry** — evolve `agent-connectors.ts` into
   `lib/os/capabilities/`: agents request `send_customer_email`,
   `create_calendar_event`… and a resolver maps to the connected tool,
   its auth state and risk class. Health/auth state persisted per tenant.
4. **Provider abstraction** — `lib/ai/router.ts` IS this; make it the only
   router: route `iho-router`/edge callers through the same policy, delete
   the Gemini-downgrade PREFIX_MAP, and persist every call (provider,
   model, latency, tokens, cost, fallback, outcome) to one `model_calls`
   ledger (unifying `agent_cost_log` + `agent_analytics` +
   `model_fallback_events`).
5. **Orchestration engine** — `lib/os/orchestrator.ts`: classify task →
   read genome context → resolve capability + permission + risk → select
   agent + model → plan → execute → evidence → update task + memory →
   report + suggest next. Explicit handoff records, no free agent-to-agent
   loops. Single-agent first; multi-agent later.
6. **Permission policies** — `lib/os/policy.ts`: risk classes low/medium/
   high per brief §8; tenant-configurable overrides stored per tenant;
   `agent_action_requests` stays the high-risk gate; medium-risk =
   auto-with-record where policy allows; low-risk = automatic.
7. **Task system** — new `os_tasks` table (brief §9 fields; states
   proposed → awaiting_context → awaiting_approval → ready → running →
   blocked → completed | failed | cancelled | requires_review) +
   `os_task_events` activity log. Tasks link genome entities, customers,
   action requests and evidence.
8. **Workflow system** — opinionated templates (enquiry-to-reply,
   booking-confirm, invoice-chase) triggered by events/schedules — NOT a
   generic node graph. Reuse `invoke_edge_function` cron pattern.
9. **Evidence ledger** — `os_evidence` rows attached to tasks (kind, refs,
   before/after, approval, tool log, timestamps), superseding scattered
   receipts; `mana_receipts`/audit log keep feeding it.
10. **Memory & events** — task outcomes update genome facts as `inferred`
    suggestions (never silently as confirmed); `os_events` append-only
    stream drives Today/Intelligence.

Interface target: the ops console grows the brief's seven areas — Today
(exists), Genome (exists), Agent Team, Work, Proof, Connections,
Intelligence — one primary action per screen, per the design canon.

---

## C. Gap analysis

| Brief system | Verdict | Evidence / what's needed |
|---|---|---|
| Genome core (§2) | **Exists, needs refactoring** | `living_site_genome` + 6 sections + ripple; needs the 8 brief categories as additive sections; homepage hard-wired to flagship tenant (quick win: parameterise) |
| Genome provenance (§3) | **Missing** | No source/confidence/verified/history columns — net-new schema (quick win, Phase 1) |
| Ingestion: installer, manual edit, templates | **Exists** | `InstallerFlow` → `factsFromAnswers`; ops-console editing; vertical seed packs |
| Ingestion: email/calendar/CRM/drive/website | **Partial → later** | `family-inbox-sync` proves the OAuth+cron pattern (Gmail/Graph, dry-mode, dedupe); generalise per-tenant in Phase 4 |
| Agent registry (§4) | **Exists, needs refactoring** | `lib/marketplace/agents.ts` is real but misnamed/mislocated; missing permissions, genome domains, memory policy, cost limits; three registries drift (edge ones obsolete) |
| Recommended starting team | **Missing** | Installer knows the vertical — derive a 3-agent team (quick win) |
| Orchestration (§5) | **Missing** | Live chat is single-shot + tools; handoffs are prompt hints; `iho-router` pipeline is legacy-path only |
| Model abstraction (§6) | **Exists, needs consolidation** | `lib/ai/router.ts` ladder is production-grade; edge `model-router` PREFIX_MAP contradicts it (**high risk**: silently downgrades Claude→Gemini); per-call persistence fragmented |
| Capability registry (§7) | **Exists as UI-truth, needs runtime** | `TOOL_ACTION_CATALOGUE` + capability profiles; every action `needs_setup`; no resolver, no health state |
| Approvals & risk classes (§8) | **Exists, needs risk model** | `agent_action_requests` + `/admin/approvals` + `ACTION_DISPATCH_ENABLED` is the high-risk gate, structurally enforced; low/medium/high classification + tenant policy missing |
| Task system (§9) | **Missing** | `family_items` is the nearest state machine; no tenant task table, no execution states, no linked evidence |
| Workflow templates (§9) | **Partial** | Cron + edge pattern proven (`invoke_edge_function`); no reusable, inspectable templates |
| Evidence (§10) | **Exists, needs unification** | `mana_receipts`, `assembl_audit_log` (7-yr, org-RLS), KPI matviews, voice hash-chain; not attached to tasks, not tenant-facing |
| Today (§11) | **Exists** | `PearlToday` flagship console |
| Business Genome UI (§11) | **Exists** | Editable grid + ripple + kinetic sculpture (`hero-particles`) |
| Agent Team UI (§11) | **Partial** | `/agents/pick` + cards; no work/cost/permission per agent |
| Work UI (§11) | **Missing** | Depends on task system |
| Proof UI (§11) | **Partial** | `/admin/receipts` operator-only; tenant-facing proof missing |
| Connections UI (§11) | **Partial** | Catalogue exists; health/auth state missing |
| Intelligence UI (§11) | **Missing** | Morning brief (sample + hourly edge fn) is the seed |
| Visual direction (§12) | **Exists** | Design canon locked; hero already uses kōtuku/school/Matariki/rivers/genome formations; reduced-motion supported everywhere |
| Marketplace retirement (§13) | **Obsolete remnants** | Routes 308'd; orphaned pages/components to delete; `ensureAdmin` stale `/agents` redirect |
| Observability (§17) | **Partial** | Cost logs, fallback events, receipts exist but opt-in and fragmented |

**High-risk items**: edge `model-router` downgrade map; three drifting agent
registries; 185 dormant edge functions (attack/maintenance surface);
genome writes with no history.

**Quick wins**: provenance columns + history table; parameterise the
homepage genome read; risk-class enum on `agent_action_requests`; delete
orphaned marketplace pages; fix `ensureAdmin` redirect; starting-team
recommendation in the installer.

---

## D. Phased roadmap

**Phase 1 — Foundation** (schema, no UI risk)
1. Genome provenance migration: add `source`, `source_ref`, `confidence`,
   `verification`, `discovered_at`, `verified_at` to `living_site_genome`
   (defaults keep every existing row valid: `source='seed'`,
   `verification='confirmed'`) + `living_site_genome_history` append-only
   log written by `updateGenomeFactAction` and `install-store`.
2. `os_tasks` + `os_task_events` + `os_evidence` migrations (brief §9/§10
   fields), RLS deny-all, service-role stores in `lib/os/`.
3. Risk classes: `risk` column on `agent_action_requests`; `lib/os/policy.ts`
   with the low/medium/high classification and tenant policy hook.
4. Rehome the agent registry to `lib/os/agents/` (re-export from the old
   path; no behaviour change) and extend the type with the brief's fields.
5. Capability registry: `lib/os/capabilities/` with the request-a-capability
   interface over `agent-connectors.ts` data.

**Phase 2 — Orchestration**
Task classification → agent + model selection (via `lib/ai/router.ts`) →
capability + permission resolution → execution states → evidence capture →
handoff records; unify per-call persistence into `model_calls`; route
`public-chat` off the legacy `iho-router` policy; retries/fallbacks
(non-streaming first).

**Phase 3 — Product interface**
Work (task list + task detail with plan/log/evidence), Proof (tenant-facing
ledger), Agent Team (role cards with current work/cost/permissions),
Connections (auth + health), Intelligence (morning brief → live signals),
all inside the existing ops console shell, one primary action per screen.

**Phase 4 — Vertical operating systems**
Generalise `family-inbox-sync` into per-tenant ingestion (email/calendar);
per-vertical genome modules + workflow templates for the existing nine
verticals; starting-team recommendation in the installer.

**Phase 5 — Learning system**
Outcome evaluation on completed tasks; confidence calibration on inferred
facts; proactive recommendations into Today/Intelligence; reusable genome
patterns across tenants.

**Cleanup track (any phase)**: delete orphaned marketplace pages/components;
fix `ensureAdmin` `/agents` redirect; align or retire edge `model-router`
PREFIX_MAP; rename `living_site_enquiries.dog` → `detail` (view/alias
first).

---

## E. First vertical slice (recommended)

**"An enquiry becomes a proven piece of work."** Matches the brief's §16
example, uses only existing rails, low-risk, end-to-end:

1. A visitor sends an enquiry on a sample/installed Living Site
   (`app/api/living-site/enquiry/route.ts` → `living_site_enquiries`) —
   already live.
2. A new `lib/os/orchestrator.ts` intake step creates an `os_tasks` row
   (`proposed`), classifies it (customer-communications), selects the
   desk agent + model via `lib/ai/router.ts`, and records the plan.
3. The agent reads genome context (`getLiveGenomeFacts`, ranked by
   `lib/living-site/desk.ts`) — confirmed facts only for commitments —
   and drafts a reply. Task → `awaiting_approval`.
4. The draft is filed as an `agent_action_requests` row (existing gate),
   `risk='high'` (external communication). The proposed action, reason,
   affected systems and risk are shown in the ops console Today/Work.
5. Owner approves (existing decide flow). Dispatch stays env-gated;
   evidence (`os_evidence`: draft text, approval, timestamps, model call,
   genome facts cited) is written either way; task → `completed`.
6. Work + Proof surfaces show the task, its states, and its evidence;
   the enquiry's outcome updates operating memory (a `suggested` genome
   fact if a new recurring question was detected — never auto-confirmed).

**Exact files/systems that change first**
- `supabase/migrations/…_genome_provenance.sql`,
  `…_os_tasks_evidence.sql`, `…_action_request_risk.sql` (Phase 1 items 1–3)
- `lib/os/{tasks.ts,evidence.ts,policy.ts,orchestrator.ts}` (new)
- `lib/customers/auckland-dog-trainer/genome-store.ts` +
  `app/customers/auckland-dog-trainer/ops/genome-actions.ts` (history +
  provenance writes)
- `app/api/living-site/enquiry/route.ts` (call orchestrator intake)
- `components/ops/fred/` Today tile + new Work/Proof panels (Phase 3 seed)
- Tests for policy classification, task state transitions, provenance
  defaults.

No hard-coded outputs: real rows, real model calls through the existing
router, real approval gate, evidence for every step.

---

## F. Standards & decision notes

Per brief §17–18: tenant isolation via tenant-keyed tables + service-role
stores (established pattern); strict typing + zod validation at API edges;
migrations idempotent and fail-soft like existing ones; feature flags for
incomplete surfaces (`ACTION_DISPATCH_ENABLED` precedent); structured logs
via the receipts/audit pattern; no new provider-specific code outside
`lib/ai/`; nothing sends without a human yes — the slice keeps that
invariant load-bearing, not decorative.

---

## G. Model & Capability Router (added 2026-07-13, Kate's routing brief)

Every task declares `TaskRequirements` (capabilities, risk, latency and
quality preference, data classification, estimated value, independent-
verification flag — `lib/os/routing.ts`). The router scores the candidate
registry on capability fit, tenant policy, privacy ceiling, price,
provider availability, **measured performance on real Assembl workflows**
(`model_workflow_stats`, written by `scripts/run-os-evals.ts` over the
Assembl evaluation set in `lib/os/evals/cases.ts` — newsletter parsing,
enquiry analysis and drafting, task/date extraction, genome population,
risk identification, tool choice, approval decisions) and recent failure
rates from the `model_calls` ledger. Never published benchmarks alone.

Rules that bite: unknown/experimental providers earn production traffic
only by beating a production model on that workflow's measurements;
restricted data never routes to providers without the contractual
ceiling; `requiresIndependentVerification` forces a second provider into
the ladder; every routing decision's rationale is recorded on the task.

Adopted sequence: Claude Sonnet 5 primary with Opus 4.8 selective →
provider-neutral interface (done) → GPT-5.6 Terra as second production
provider (key-gated, ready) → Gemini 3.5 Flash for Workspace/media-heavy
work → GPT-Live spoken Chief of Staff prototype (experimental) →
per-workflow evaluation + automatic fallback (done) → Grok experimental
until it clearly wins a defined workflow (enforced in the router).
