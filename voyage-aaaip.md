# AAAIP — Aotearoa Agentic AI Platform

A simulation-tested, policy-governed autonomous agent platform built into
Assembl. The pilot scenario is a clinic-scheduling assistant; the architecture
is designed so additional AAAIP priority domains (human-robot collaboration,
scientific discovery, community portal) plug in without rewriting the runtime.

## What ships in this drop

### Pilot 01 — Clinic scheduling

- **Policy framework** (`src/aaaip/policy/`)
  - `types.ts` — `Policy`, `AgentAction`, `ComplianceDecision`, `OversightMode`
  - `library.ts` — six clinic-scheduling policies (no double-book, triage first,
    consent, fairness, uncertainty handoff, NZ data residency)
  - `engine.ts` — `ComplianceEngine` evaluates an action against every policy
    and returns one of `allow` / `needs_human` / `block`
- **Digital twin** (`src/aaaip/simulation/clinic.ts`) — deterministic, seedable
  `ClinicSimulator` with patient arrivals, emergencies, slot grid, fairness drift
- **Agent** (`src/aaaip/agent/clinic-agent.ts`) — picks the highest-acuity
  patient, proposes a slot, runs the proposal through the compliance engine
- **Runtime hook** (`src/aaaip/useAaaipRuntime.ts`)

### Pilot 02 — Human-robot collaboration

- **Policies** (`src/aaaip/policy/human-robot.ts`) — seven HRC policies aligned
  with ISO/TS 15066 + ISO 10218-2: stop on human-in-zone, force limit, speed
  reduction near human, intent confirmation, sensor health gate, tool-change
  acknowledgement, uncertainty handoff
- **Workspace twin** (`src/aaaip/simulation/human-robot.ts`) — `RobotSimulator`
  with four zones, drifting human operator, intent classifier with confidence,
  sensor reliability noise, task queue with force/speed/tool requirements
- **Robot agent** (`src/aaaip/agent/robot-agent.ts`) — selects the safest task,
  adapts speed when humans are present, escalates on intent ambiguity or sensor
  degradation
- **Runtime hook** (`src/aaaip/useRobotRuntime.ts`)

### Shared infrastructure

- **Audit log + metrics** (`src/aaaip/metrics/audit.ts`) — in-memory store with
  subscribe/notify, aggregates, JSON export hook for Lovable / Supabase / S3
- **Runtime base interface** (`src/aaaip/runtime-base.ts`) — `AaaipRuntimeBase`
  contract that both runtime hooks satisfy, so the dashboard chrome reuses one
  approval queue, metrics view and policy viewer for every domain
- **Live demo dashboard** (`src/pages/AaaipDashboard.tsx`, route `/aaaip`) —
  domain switcher (Clinic ↔ Human-robot), live state view, decision feed,
  approval queue, verdict pie + policy-violation bar charts, policy library
- **Tests** (`src/aaaip/__tests__/*.test.ts`) — 26 unit tests across the policy
  engine, both agents, both simulators, the double-book and human-zone
  invariants, sensor degradation, intent ambiguity, and human approval flow

## Demo script for Gill Dobbie

### Clinic walkthrough

1. Open `/aaaip` (the Clinic switch is selected by default).
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

### Human-robot walkthrough

1. Click the **Human-robot** switch in the header. The chrome stays the same;
   the Live tab now shows a workspace with four zones, a robot, and an
   operator drifting between zones.
2. Press **Run sim**. The robot picks the safest queued task, adapts speed
   when the operator is in a shared zone, and writes every decision to the
   same audit feed.
3. Press **Inject human intrusion** — the operator is force-moved into the
   workbench. The agent immediately blocks any motion targeting that zone
   (Stop-on-human-in-zone policy) and reprioritises tasks elsewhere.
4. Press **Degrade sensor** — sensor reliability drops below the safety
   threshold and the engine blocks all autonomous motion until reliability
   recovers.
5. Tool-change tasks land in the **Approvals** tab waiting for an explicit
   operator acknowledgement before motion resumes.

### Common to both pilots

Press **Export** at any time to download the full audit log as JSON — this is
the seam where Lovable's Supabase / S3 / Slack connectors plug in to ship the
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

| Domain | Status | Simulator | Policies |
|---|---|---|---|
| Clinic scheduling | shipped | `simulation/clinic.ts` | `policy/library.ts` |
| Human-robot collaboration | shipped | `simulation/human-robot.ts` | `policy/human-robot.ts` |
| Scientific discovery | next | Drug-screening loop with Jupyter handoff | Data provenance, IRB consent, reproducibility seed |
| Community portal | next | Forum moderation queue | Data sovereignty, te reo respect, mod-in-loop |

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
├── runtime-base.ts                # AaaipRuntimeBase shared interface
├── useAaaipRuntime.ts             # Clinic React hook
├── useRobotRuntime.ts             # Human-robot React hook
├── policy/
│   ├── types.ts                   # Core types
│   ├── engine.ts                  # ComplianceEngine
│   ├── library.ts                 # Clinic policies + predicates
│   └── human-robot.ts             # Human-robot policies + predicates
├── simulation/
│   ├── clinic.ts                  # ClinicSimulator
│   └── human-robot.ts             # RobotSimulator
├── agent/
│   ├── clinic-agent.ts            # ClinicAgent
│   └── robot-agent.ts             # RobotAgent
├── metrics/
│   └── audit.ts                   # AuditLog + aggregates
└── __tests__/
    ├── policy-engine.test.ts      # 8 clinic-engine tests
    ├── clinic-agent.test.ts       # 5 clinic-agent tests + invariants
    └── robot.test.ts              # 13 HRC engine + agent tests
```
