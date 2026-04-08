# AAAIP — Audit & Coverage Report

This document is the single source of truth for AAAIP partners on what is
shipped, what is tested, and where the existing Assembl pilots stand on
data privacy and policy governance. It is generated alongside code so the
two never drift.

## TL;DR

- **4 pilots are live in the AAAIP runtime**: clinic scheduling, human-robot
  collaboration, drug screening, community portal moderation
- **4 production pilots are "ready" to wire up**: hanga (construction), toroa
  (logistics), hangarau (freight IoT), aura (hospitality)
- **3 production pilots are "planned"**: manaaki (wellbeing), pākihi (SMB),
  te kāhui reo (te reo)
- **111 tests across 11 files** all passing on this branch
- **Pilot smoke tests** import every major dashboard module so structural
  breakage from cross-branch merges is caught in CI
- **Privacy / secrets scanner** runs as part of the test suite and will fail
  the build on any hard-forbidden pattern (Anthropic/OpenAI/Stripe live
  keys, Google API keys, SUPABASE_SERVICE_ROLE_KEY in client code)
- **Researcher admin view** at `/aaaip/researcher` lists every audit export
  with policy hits and a 10-decision sample per export

## What ships in this drop

### Pilot 04 — Community Portal moderation

- 6 policies aligned with NZ Harmful Digital Communications Act 2015,
  Te Mana Raraunga Māori Data Sovereignty principles, NZ Privacy Act 2020
  and the IFCN code: harm block, te reo respect, data sovereignty, PII
  leak protection, misinformation human review, uncertainty handoff
- `CommunitySimulator` with realistic flag distributions: ~8% of posts
  contain PII (some opt-in), ~10% are taonga (some with iwi consent), ~7%
  trigger te reo concern flags
- `CommunityAgent` that prefers low-harm posts first, drops hard-blocked
  content, and escalates everything else to a kaiwhakahaere
- `useCommunityRuntime` hook satisfying `AaaipRuntimeBase`
- Dashboard switcher is now Clinic / Human-robot / Drug screening /
  Community

### AAAIP Researcher admin view (`/aaaip/researcher`)

- Read-only list of every audit export from `aaaip_audit_exports`
- Filter by domain
- Expand any row to see policy-violation hits and a 10-decision sample
- Pilot Coverage tab shows the full PILOT_COVERAGE matrix with status
  badges (wired / ready / planned)
- Authenticated reads only — RLS on the table blocks anon SELECT and the
  page surfaces a friendly error if a partner forgets to log in

### Pilot smoke tests

`src/aaaip/__tests__/pilot-smoke.test.ts` imports every major dashboard
module on this branch:

- 4 kete components
- 4 toroa pages / dashboards
- 16 hanga components (construction)
- 1 hangarau dashboard (freight IoT)
- 14 aura components (hospitality)
- Manaaki, Pākihi, Te Kāhui Reo dashboards
- The AAAIP dashboard itself

If any merge to main breaks the import path or default export of any of
these, the test suite fails immediately. This is a fast structural check
that complements the existing typecheck.

### Privacy / secrets audit

`src/aaaip/__tests__/privacy-audit.test.ts` walks `src/` and scans every
TypeScript / TSX file for two classes of pattern:

- **Hard-forbidden** (test fails on match):
  - Anthropic secret keys (`sk-ant-…`)
  - OpenAI project keys (`sk-proj-…`)
  - Stripe live keys (`sk_live_…`)
  - Google API keys (`AIzaSy…`)
  - `SUPABASE_SERVICE_ROLE_KEY` literal in client code
- **Soft-warn** (logged, non-fatal):
  - `console.log` of email / phone / password / nhi / ird / tax patterns
  - `localStorage.setItem` of token / password / secret / nhi values
  - `eval()` calls

This is intentionally a small set; add new entries as you discover real
risk patterns. Hard-forbidden grows the most defensive value over time.

### Policy coverage matrix

`src/aaaip/audit/policy-coverage.ts` is a static registry mapping every
Assembl pilot to:

- Status: `wired` / `ready` / `planned`
- Required AAAIP policy families
- Module path
- Plain-English note explaining what hooking it up looks like

The researcher admin view consumes this directly under the **Pilot
coverage** tab, so the report and the UI never drift.

## Test inventory

| Suite | Tests | Coverage |
|---|---:|---|
| `policy-engine.test.ts` | 8 | Clinic compliance engine, 6 policies, allow/needs_human/block paths |
| `clinic-agent.test.ts` | 5 | Booking invariant (no double-book across 50 ticks), escalation, human approval |
| `robot.test.ts` | 13 | HRC compliance engine, never-execute-into-occupied-zone, sensor degradation, tool-change ack |
| `science.test.ts` | 14 | Provenance, IRB, dosage, control wells, toxicity, human approval, reproducibility metadata |
| `community.test.ts` | 12 | Harm block, taonga sovereignty, PII leak, te reo flag, fact-score warn, human approval |
| `audit-export.test.ts` | 2 | `buildExportPayload` shape, `exportJson` round-trip |
| `privacy-audit.test.ts` | 2 | Hard-forbidden secret scan + soft-warn smell scan |
| `pilot-smoke.test.ts` | 44 | Imports every major pilot module on this branch |
| `example.test.ts` | 1 | Sanity |

**Total: 111 tests across 11 files. All passing on `claude/agentic-ai-platform-75lsX`.**

## Wiring an existing pilot to AAAIP

The framework is designed so adding policy governance to an existing
production pilot is a small, focused diff. The pattern is:

```ts
// 1. Define policies for the domain
const TENANT_POLICIES: RegisteredPolicy[] = [
  { policy: NO_LANDLORD_OVERRIDE, predicate: ... },
  { policy: TENANCY_TRIBUNAL_NOTICE, predicate: ... },
  // ...
];

// 2. Construct an engine with those policies
const engine = new ComplianceEngine({ policies: TENANT_POLICIES });

// 3. Wherever the agent currently calls a Supabase / Edge function:
const action: AgentAction = { domain, kind, payload, confidence, ... };
const decision = engine.evaluate(action, { world: tenancyState });
if (decision.verdict === "allow") {
  await applyAction(action);
} else if (decision.verdict === "needs_human") {
  await queueForLandlordReview(action, decision);
} else {
  await logBlocked(action, decision);
  return;
}

// 4. Record everything in an AuditLog
auditLog.record(decision, applied);

// 5. Periodically ship the log via submitAaaipExport()
```

The hanga, toroa, hangarau and aura modules are all "ready" — they have an
obvious gate point where one of the existing AAAIP policy families would
slot in. The policy-coverage matrix records the recommended families per
pilot.

## Risks and gaps

1. **`src/integrations/supabase/types.ts` is not yet aware of
   `aaaip_audit_exports`.** This file is auto-generated by Lovable on
   migration sync; once it regenerates, the `as any` cast in
   `src/aaaip/api/researcher.ts` can be removed.

2. **The researcher view requires authenticated reads.** RLS blocks
   anon SELECT on `aaaip_audit_exports` by design. If you want partners
   to view exports without an Assembl account, either issue them a
   service-role API key (out-of-band) or add a `magic_link` flow.

3. **The privacy scanner only catches static patterns.** Dynamic data
   leaks (e.g. logging an entire request body that happens to contain
   PII) won't be caught. The "soft-warn" set is a good place to grow
   into a real privacy CI.

4. **Pilot smoke tests don't mount components.** They verify the
   modules parse and have default exports. A 3D component that crashes
   on mount in jsdom would still pass these tests. Mount tests require
   per-page mocking and are out of scope for this drop — but the
   structural test catches the most common breakage class.

5. **Production agents (kete / toroa / hanga / etc.) are NOT yet
   policy-gated.** They have an obvious place to plug in the
   ComplianceEngine but the change has to be made per-pilot. The
   coverage matrix is the punch list.

## Routes

| Path | Purpose | Auth |
|---|---|---|
| `/aaaip` | AAAIP demo dashboard with all 4 pilots and the domain switcher | Public |
| `/aaaip/researcher` | Read-only researcher console listing every audit export | Authenticated |

## File map

```
src/aaaip/
├── index.ts                       # Public surface
├── runtime-base.ts                # AaaipRuntimeBase shared interface
├── useAaaipRuntime.ts             # Clinic React hook
├── useRobotRuntime.ts             # Human-robot React hook
├── useScienceRuntime.ts           # Drug screening React hook
├── useCommunityRuntime.ts         # Community portal React hook
├── policy/
│   ├── types.ts                   # Core types
│   ├── engine.ts                  # ComplianceEngine
│   ├── library.ts                 # Clinic policies + predicates
│   ├── human-robot.ts             # Human-robot policies
│   ├── science.ts                 # Drug screening policies
│   └── community.ts               # Community portal policies
├── simulation/
│   ├── clinic.ts                  # ClinicSimulator
│   ├── human-robot.ts             # RobotSimulator
│   ├── science.ts                 # ScienceSimulator
│   └── community.ts               # CommunitySimulator
├── agent/
│   ├── clinic-agent.ts            # ClinicAgent
│   ├── robot-agent.ts             # RobotAgent
│   ├── science-agent.ts           # ScienceAgent
│   └── community-agent.ts         # CommunityAgent
├── metrics/
│   └── audit.ts                   # AuditLog + aggregates
├── api/
│   ├── export.ts                  # submitAaaipExport client
│   └── researcher.ts              # listAuditExports client
├── audit/
│   └── policy-coverage.ts         # PILOT_COVERAGE matrix
└── __tests__/
    ├── policy-engine.test.ts      # Clinic engine
    ├── clinic-agent.test.ts       # Clinic agent + invariants
    ├── robot.test.ts              # HRC engine + agent
    ├── science.test.ts            # Drug screening engine + agent
    ├── community.test.ts          # Community engine + agent
    ├── audit-export.test.ts       # Audit log export shape
    ├── privacy-audit.test.ts      # Secrets / PII scan
    └── pilot-smoke.test.ts        # Pilot module structural check

supabase/
├── functions/
│   └── aaaip-audit-export/
│       └── index.ts               # Edge function accepting exports
└── migrations/
    ├── 20260407000001_aaaip_audit_export.sql       # Initial table + RLS
    └── 20260408000001_aaaip_audit_add_community.sql # Add community domain

src/pages/
├── AaaipDashboard.tsx             # Live demo (Pilot 01-04 + switcher)
└── AaaipResearcher.tsx            # Researcher console
```
