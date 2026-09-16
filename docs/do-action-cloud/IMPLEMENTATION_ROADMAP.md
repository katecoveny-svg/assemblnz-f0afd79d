# Implementation Roadmap

**Status:** Engineering plan for Assembl / DO / Pursuit Action Cloud  
**Locale:** NZ English  
**Constraint:** Do not claim live production Action Cloud until Phase exit criteria are met in a deployed environment.

---

## Suggested repo folder structure

```text
docs/do-action-cloud/          # this package (or symlink/copy)
app/api/do/action/              # REST stage handlers
  discover/
  inspect/
  quote/
  prepare/
  permit/
  execute/
  wait/
  verify/
  receipt/
  undo/
lib/do/action-contract/         # schema, hash, validate, VAR
lib/do/permits/
lib/do/receipts/
lib/do/waits/
lib/do/adapters/                # call, forms, agentize, nz/*, demo/*
packages/assembl-do/            # @assembl/do SDK (planned)
supabase/migrations/            # permits, receipts, waits, actions
  YYYYMMDD_do_permits.sql
  YYYYMMDD_do_receipts.sql
  YYYYMMDD_do_waits.sql
  YYYYMMDD_do_action_runs.sql
demos/
  car-service/
  pursuit-tender/
  sponsored-grocery/
  energy-switch/
tools/nz-who-runs-it/           # early paid endpoint pattern (if present in monorepo)
```

Adjust names to the host monorepo; keep Action Contract as the stable centre.

---

## Phase 1 — Contract core

**Goal:** Action Contract + Permit + Receipt + Wait + universal response.

### Epics

| Epic | Outcome |
|------|---------|
| E1.1 Schema | JSON Schema for contract + universal response |
| E1.2 Prepare | prep_id + args_hash persistence |
| E1.3 Permit | Short-lived permits, revoke, max_uses |
| E1.4 Execute stub | Idempotent execute against mock adapter |
| E1.5 Wait | Durable waiter + timeout + resolve API |
| E1.6 Receipt | Append-only receipt rows |
| E1.7 VAR | Metric computation job (basic) |

### Milestones

- M1: OpenAPI draft for stages  
- M2: Supabase migrations applied in dev  
- M3: Mock `demo.echo` action passes full lifecycle  

### Acceptance criteria

- [ ] Prepare locks args; execute rejects hash mismatch  
- [ ] Expired permit cannot execute  
- [ ] Idempotency key returns same action_id/result  
- [ ] Receipt emitted only after execute (or explicit policy)  
- [ ] Universal response schema validated in CI  

---

## Phase 2 — First six + flagship demo

**Services:** Permit · Wait · Receipt · Call · Forms · Agentize  

### Epics

| Epic | Outcome |
|------|---------|
| E2.1 DO Call | Twilio (or mock) adapter under permit |
| E2.2 DO Forms | Schema-validated submit + receipt |
| E2.3 DO Agentize | Thin wrapper: site/workflow → Action Contract |
| E2.4 Car-service demo | End-to-end booking path |
| E2.5 SDK spike | `@assembl/do` minimal client |

### Acceptance criteria

- [ ] Car-service demo completes discover→receipt in staging  
- [ ] Call + Forms each have one happy-path + one deny-path test  
- [ ] Agentize demo documents Human gate for high risk  
- [ ] No commodity SaaS connector sprawl merged  

---

## Phase 3 — Expand services + NZ spikes

### Epics

| Epic | Outcome |
|------|---------|
| E3.1 Quote / Book / Verify / Human | Shared patterns on contract |
| E3.2 NZBN / MBIE spike | Read adapter after endpoint verify |
| E3.3 EA ICP spike | Resolve + switch dry-run only until partner clear |
| E3.4 NZ Post spike | Track or label in sandbox |
| E3.5 Auckland property spike | One council read path |

### Acceptance criteria

- [ ] Each NZ spike has verified endpoint notes + Agentability Score  
- [ ] Switch/payment paths remain blocked without Human/Permit policy  
- [ ] Verify stage feeds VAR dashboard  

---

## Phase 4 — Pursuit + Sponsored Journeys + adapters

### Epics

| Epic | Outcome |
|------|---------|
| E4.1 Pursuit tender path | Find → assemble → Human → Permit → submit → Receipt |
| E4.2 Sponsored Journeys | Assembl-owned journey schema + grocery demo |
| E4.3 MCP surface | `mcp.do.assembl.ai` planned hosting |
| E4.4 Radar adapters | Stripe/Twilio/Visa TAP as maturity allows |
| E4.5 OpenAI Ads | Explicit non-build; WATCH only |

### Acceptance criteria

- [ ] Pursuit demo uses DO receipts for submit  
- [ ] Sponsored Journey never fires action without Permit  
- [ ] Protocol interop spikes documented; no invented auth  

---

## Backlog tickets — first six services

Use as ticket titles/descriptions in the tracker:

| ID | Title | Description |
|----|-------|-------------|
| DO-1 | Permit service | Issue/revoke/validate short-lived permits; args_hash constraints; TTL |
| DO-2 | Wait service | Create/resolve/timeout waiters; webhook + poll |
| DO-3 | Receipt service | Immutable receipt write + fetch by action_id |
| DO-4 | Call adapter | Permitted outbound call/SMS; record SID on receipt |
| DO-5 | Forms adapter | Validate input_schema; submit; map errors to universal schema |
| DO-6 | Agentize adapter | Register external workflow as Action Contract; risk_class required |
| DO-7 | Universal response middleware | Enforce schema on all `/api/do/action/*` |
| DO-8 | Car-service demo | Flagship path in `demos/car-service` |
| DO-9 | Migrations | permits, receipts, waits, action_runs |
| DO-10 | VAR job | Nightly compute per tenant |

---

## Early paid endpoint pattern

Treat **nz-who-runs-it** (or equivalent NZ read tool) as the pattern for early monetisable endpoints:

- Clear OpenAPI / Action Contract inspect  
- Metered read; Permit only when escalating to write  
- Receipt optional for pure reads; mandatory for writes  

Wire path when the tool exists in-repo: `tools/nz-who-runs-it/` → later `lib/do/adapters/nz/who-runs-it`.

---

## Dependencies & non-goals

- Auth: interop OAuth agent delegation / AuthZEN / VCs / AP2 / Visa TAP — **do not invent**  
- No OpenAI Ads API dependency  
- No claim of nationwide NZ gov integration in Phase 1–2  

---

## Related

- `DO_ACTION_CLOUD.md`  
- `ACTION_CONTRACT_SPEC.md`  
- `DEMOS.md`  
- `CODEX.md`  
