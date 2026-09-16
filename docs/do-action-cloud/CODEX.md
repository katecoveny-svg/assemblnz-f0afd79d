# CODEX.md — Agent continuation brief

Short instructions for coding agents continuing Assembl / DO / Pursuit work **without chat history**.

---

## Product distinctions (never blur)

| Brand | Meaning |
|-------|---------|
| **Assembl** | Enterprise orchestration — make the organisation agent-ready |
| **DO** | Safe action layer — know → prepare → permit → do → verify |
| **Pursuit** | First vertical — find / assemble / submit work (tenders) |

---

## Non-goals

- Do **not** build commodity SaaS connector sprawl (Composio/Pipedream territory)  
- Do **not** make generic browse the core product (Browserbase territory)  
- Do **not** build on OpenAI Ads API (none public) — WATCH only  
- Do **not** invent auth/payment protocols  
- Do **not** claim live production Action Cloud or unverified NZ gov integrations  
- Do **not** skip Permit/Receipt on consequential actions  

---

## Auth & interop (mandatory)

**Do not invent auth protocols.** Interoperate with, as applicable:

- OAuth agent delegation  
- AuthZEN  
- Verifiable Credentials (VCs)  
- AP2 / related agent payment-commerce protocols  
- Visa TAP  

Prefer **PROTOCOL SUPPORT** / adapters over bespoke crypto.

---

## First build order

1. Action Contract + universal response (`ACTION_CONTRACT_SPEC.md`)  
2. **Permit · Wait · Receipt**  
3. **Call · Forms · Agentize**  
4. Flagship **car-service** demo  
5. NZ spikes only after **endpoint verification**  
6. Pursuit tender path + Assembl Sponsored Journeys (not OpenAI Ads)  

Details: `IMPLEMENTATION_ROADMAP.md`, `DO_ACTION_CLOUD.md`.

---

## Where files live

Documentation package (this set):

```text
/workspace/do-action-cloud-package/
  README.md
  DO_ACTION_CLOUD.md
  NZ_ACTION_CLOUD.md
  AGENT_READY_API_OPPORTUNITY_MAP.md
  ACTION_CONTRACT_SPEC.md
  SPONSORED_AGENT_JOURNEYS.md
  DO_BROWSER_RUNTIME.md
  DO_RADAR.md
  IMPLEMENTATION_ROADMAP.md
  DEMOS.md
  CODEX.md
```

Suggested code layout (host repo):

```text
docs/do-action-cloud/
app/api/do/action/              # Phase 1 — not yet; stubs live under action-stub
app/api/do/sponsored/           # Sponsored Journeys prototype API
app/api/do/browser-runtime/     # Browser Runtime prototype API
app/do/sponsored/               # Sponsored Journeys UI
app/do/browser/                 # Browser Runtime UI
lib/do/action-stub/             # Local prepare/permit/execute/receipt (TODO → /api/do/action/*)
lib/do/sponsored-journeys/
apps/do/shared/browser-runtime.ts
lib/do/action-contract/         # planned
lib/do/permits|receipts|waits|adapters/  # planned
supabase/migrations/
```

---

## Engineering rules of thumb

- Lifecycle: `discover → inspect → quote/dry-run → prepare → permit → execute → wait → verify → receipt → undo/escalate`  
- Lock args at prepare; enforce `args_hash` at execute  
- Short-lived permits; least authority; idempotency keys  
- Separate **reasoning** (LLM) from **authority** (DO)  
- Mark TBD/hypothesis anything unverified  
- NZ English in docs and user-facing strings when targeting NZ  

---

## Read next

1. `ACTION_CONTRACT_SPEC.md`  
2. `DO_ACTION_CLOUD.md`  
3. `IMPLEMENTATION_ROADMAP.md`  
4. Domain docs as needed (`NZ_ACTION_CLOUD.md`, `DEMOS.md`, radar/watch briefs)  
