# AAAIP — Aotearoa Agentic AI Platform

A simulation-tested, policy-governed autonomous agent platform built into
Assembl. The pilot scenario is a clinic-scheduling assistant; the architecture
is designed so additional AAAIP priority domains (human-robot collaboration,
scientific discovery, community portal) plug in without rewriting the runtime.

## What ships in this drop

- **Policy framework** (`src/aaaip/policy/`)
  - `types.ts` — `Policy`, `AgentAction`, `ComplianceDecision`, `OversightMode`
  - `library.ts` — six clinic-scheduling policies (no double-book, triage first,
    consent, fairness, uncertainty handoff, NZ data residency)
  - `engine.ts` — `ComplianceEngine` evaluates an action against every policy
    and returns one of `allow` / `needs_human` / `block`
- **Digital twin** (`src/aaaip/simulation/clinic.ts`)
  - Deterministic, seedable `ClinicSimulator` with patient arrivals,
    emergencies, slot grid, fairness drift score, audit-friendly bookings
- **Agent** (`src/aaaip/agent/clinic-agent.ts`)
  - Picks the highest-acuity patient, proposes a slot, runs the proposal
    through the compliance engine, escalates on uncertainty, applies on allow
- **Audit log + metrics** (`src/aaaip/metrics/audit.ts`)
  - In-memory store with subscribe/notify, aggregates, JSON export
- **React runtime hook** (`src/aaaip/useAaaipRuntime.ts`)
  - Owns one instance of each module and exposes `start / pause / step / reset
    / approve / reject / injectEmergency / exportJson`
- **Live demo dashboard** (`src/pages/AaaipDashboard.tsx`, route `/aaaip`)
  - Sim controls, slot grid, patient inbox, decision feed, human approval
    queue, verdict pie + policy-violation bar charts, full policy library view
- **Tests** (`src/aaaip/__tests__/*.test.ts`)
  - 14 unit tests covering the policy engine, agent, double-book invariant,
    escalation paths, fairness drift, and human approval flow

## Demo script for Gill Dobbie

1. Open `/aaaip`.
2. Press **Run sim**. Watch the agent auto-approve routine bookings and the
   slot grid fill up.
3. Press **Inject emergency**. The agent immediately reprioritises, blocks
   routine bookings (Triage First policy), and books the critical patient.
4. Open the **Approvals** tab — when fairness drift creeps past 0.25 the
   agent stops auto-approving and asks a clinician for sign-off.
5. Open the **Metrics** tab to see compliance rate, verdict mix, and which
   policies are firing most often.
6. Open the **Policies** tab to see every rule in plain English with its
   legal/ethical source.
7. Press **Export** to download the full audit log as JSON — this is the
   seam where Lovable's Supabase / S3 / Slack connectors plug in to ship the
   data to AAAIP researchers.

## How to add a new domain

Each AAAIP priority is a self-contained slice with the same shape:

```
src/aaaip/
  policy/<domain>.ts       # Policy[] + PolicyPredicate[]
  simulation/<domain>.ts   # Deterministic simulator class
  agent/<domain>-agent.ts  # Decision logic that consumes the simulator
```

Then re-export from `src/aaaip/index.ts` and add a tab/route to the dashboard.

### Suggested next slices

| Domain | Simulator | Policies |
|---|---|---|
| Human-robot collaboration | Robot/operator co-task with sensor noise | Stop-on-human-in-zone, force limits, intent confirmation |
| Scientific discovery | Drug-screening loop with Jupyter handoff | Data provenance, IRB consent, reproducibility seed |
| Community portal | Forum moderation queue | Data sovereignty, te reo respect, mod-in-loop |

## Lovable / Supabase integration points

The runtime is intentionally side-effect-free. To wire it into your Lovable
build:

1. **Persistence** — `AuditLog.exportJson()` produces a single payload that
   can be POSTed to a Supabase edge function for the `aaaip_audit` table.
2. **Notifications** — pending approvals can be pushed to Slack via Lovable's
   Slack connector by wrapping `AuditLog.subscribe()`.
3. **Models** — the `ClinicAgent.estimateConfidence()` method is the seam
   where Gemini 3 Flash (default) or GPT-5.2 (deeper reasoning) calls plug in.
4. **Permissions** — every `Policy.oversight` value (`always_allow`,
   `ask_each_time`, `never_allow`) maps 1:1 to Lovable's permission preferences.

## Why this is "simulation-tested" and "policy-governed"

- **Simulation-tested**: every agent decision in the demo is exercised against
  a deterministic digital twin with reproducible seeds, so safety tests can be
  re-run on every commit.
- **Policy-governed**: the agent cannot apply an action without going through
  `ComplianceEngine.evaluate()`. The verdict is immutable and recorded in the
  audit log alongside the action.

## File map

```
src/aaaip/
├── index.ts                       # Public surface
├── useAaaipRuntime.ts             # React hook glueing everything together
├── policy/
│   ├── types.ts                   # Core types
│   ├── library.ts                 # Clinic policies + predicates
│   └── engine.ts                  # ComplianceEngine
├── simulation/
│   └── clinic.ts                  # ClinicSimulator (digital twin)
├── agent/
│   └── clinic-agent.ts            # ClinicAgent decision logic
├── metrics/
│   └── audit.ts                   # AuditLog + aggregates
└── __tests__/
    ├── policy-engine.test.ts      # 8 tests
    └── clinic-agent.test.ts       # 5 tests + invariants
```
