# DO Action Cloud — Build Brief

**Brand:** DO = safe action layer (give agents safe hands)  
**Parent:** Assembl = enterprise orchestration  
**Vertical:** Pursuit = find / assemble / submit work  
**Status:** Build brief — not a claim of live production Action Cloud  
**Locale:** NZ English

---

## 1. Product thesis

Agents can reason well enough to *propose* work. They still cannot reliably **do** consequential work: book, pay, switch, submit, claim, return, deliver, or commit under authority.

**DO** is the safe action layer between reasoning and the real world:

> **know → prepare → permit → do → verify**

Assembl makes the organisation agent-ready (policies, inventory of actions, CRM/commerce handoff). DO gives every agent (internal or external) **safe hands** with short-lived authority, argument locking, receipts, and verification. Pursuit is the first high-value vertical that consumes DO for tender find/assemble/submit.

**Hypothesis:** The scarce product is not another chat UI or SaaS connector — it is governed, receipted, undoable *actions* with a universal contract that works over REST, SDK, MCP, OpenAPI, A2A, and webhooks.

---

## 2. DO Core

DO Core is the shared runtime for Action Contracts:

| Concern | Responsibility |
|---------|----------------|
| Discovery | List available actions and schemas for a tenant / agent |
| Inspection | Read-only inspect of action metadata, risks, required permits |
| Quote / dry-run | Cost, side effects, eligibility without committing |
| Prepare | Build locked argument set + preconditions |
| Permit | Issue short-lived, scoped authority tokens |
| Execute | Perform the action under the permit |
| Wait | Async job / human / external dependency waiters |
| Verify | Post-condition checks and evidence collection |
| Receipt | Immutable (or append-only) proof of what happened |
| Undo / escalate | Compensating actions or human escalation paths |

Transport independence is mandatory: the same contract must be invokable via REST, `@assembl/do` SDK, MCP (`mcp.do.assembl.ai` — **planned**), OpenAPI, A2A, and webhooks.

---

## 3. Service catalogue

### 3.1 First six (MVP priority)

| Service | Purpose |
|---------|---------|
| **DO Permit** | Short-lived, least-authority permits; argument locking; expiry; revocation |
| **DO Wait** | Durable waits for async outcomes, humans, or external events |
| **DO Receipt** | Verifiable receipts for every consequential action |
| **DO Call** | Outbound voice/SMS/telephony under permit (Twilio et al. as adapters) |
| **DO Forms** | Structured form fill / submit with schema validation and receipts |
| **DO Agentize** | Wrap a human workflow or site into an Action Contract surface |

### 3.2 Extended catalogue (post-MVP / phased)

| Service | Purpose |
|---------|---------|
| **DO Quote** | Price / eligibility quotes without commitment |
| **DO Book** | Reservations and appointments with confirm + cancel |
| **DO Account** | Account lookup / update under scoped authority |
| **DO Switch** | Provider switches (e.g. energy ICP switch) |
| **DO Claims** | Insurance / warranty / refund claims with evidence |
| **DO Return** | Returns / RMA flows |
| **DO Delivery** | Ship / track / redirect (e.g. NZ Post adapter) |
| **DO Contract** | Contract review assist → commit under human/permit gates |
| **DO Evidence** | Collect, hash, and attach evidence packs |
| **DO Verify** | Post-action verification and Verified Action Rate inputs |
| **DO Human** | Escalate to a human with context + deadline + permit bounds |

Mark any unbuilt service **TBD** in public materials until shipped.

---

## 4. Shared Action Contract lifecycle

Canonical stages (see also `ACTION_CONTRACT_SPEC.md`):

```
discover → inspect → quote/dry-run → prepare → permit → execute → wait → verify → receipt → undo/escalate
```

| Stage | Agent may | System must |
|-------|-----------|-------------|
| discover | List actions | Return schemas + risk class |
| inspect | Read metadata | No side effects |
| quote / dry-run | Estimate | No durable side effects |
| prepare | Lock args | Persist prep id; validate schema |
| permit | Request authority | Issue short-lived permit; least privilege |
| execute | Request run | Check permit + locked args; idempotent |
| wait | Poll / subscribe | Durable waiter; timeout policy |
| verify | Request check | Evidence + pass/fail |
| receipt | Fetch proof | Immutable/append-only receipt |
| undo / escalate | Request compensate | Policy-gated; human if required |

---

## 5. Transport independence

| Transport | Role | Note |
|-----------|------|------|
| REST | Primary HTTP API | `/api/do/action/...` pattern |
| SDK | `@assembl/do` | Typed client; same contract |
| MCP | `mcp.do.assembl.ai` | Tool surface for agents (**planned**) |
| OpenAPI | Machine-readable API | Generate clients / agents |
| A2A | Agent-to-agent | Interop when standard stabilises |
| Webhooks | Async callbacks | Wait / receipt / verify events |

**DX targets (planned, not claimed live):**

- npm package: `@assembl/do`
- MCP endpoint: `mcp.do.assembl.ai`
- Docs: this package + OpenAPI when generated

---

## 6. Universal response schema (summary)

Every DO response should include (see full shape in `ACTION_CONTRACT_SPEC.md`):

```json
{
  "ok": true,
  "action_id": "act_...",
  "stage": "execute",
  "status": "succeeded",
  "permit_id": "prm_...",
  "receipt_id": "rcp_...",
  "wait_id": null,
  "result": {},
  "errors": [],
  "risk": { "class": "medium", "flags": [] },
  "meta": { "idempotency_key": "...", "request_id": "..." }
}
```

---

## 7. Security model

| Principle | Practice |
|-----------|----------|
| Least authority | Permits scoped to action, args, tenant, time |
| Short-lived permits | Minutes–hours, not days; revocable |
| Argument locking | Execute only with prepared, hashed args |
| Idempotency | Client-supplied keys; safe retries |
| Separation of reasoning vs authority | LLM proposes; DO authorises and executes |
| Auditability | Receipts + evidence for every consequential step |
| Human gates | High-risk classes require DO Human / dual control (**policy TBD**) |

**Do not invent** new auth protocols. Interoperate with OAuth agent delegation, AuthZEN, verifiable credentials, AP2, Visa TAP as they mature.

---

## 8. Risk model

| Class | Examples | Default gates |
|-------|----------|---------------|
| low | Read-only inspect, public quote | Auto-permit within tenant policy |
| medium | Book, form submit, non-payment call | Permit + receipt + verify |
| high | Payment, switch, tender submit, contract commit | Permit + human/dual + evidence + receipt |
| critical | Irreversible legal/financial | Human required; undo path mandatory or blocked |

Exact thresholds are **tenant-configurable** (TBD defaults per vertical).

---

## 9. Business model (hypothesis)

| Lever | Hypothesis |
|-------|------------|
| Usage | Per successful permitted action / receipt |
| Seat / org | Assembl orchestration + policy console |
| Vertical | Pursuit tender workflows |
| Premium rails | NZ Action Cloud adapters (banking, energy, property) |
| Sponsored Journeys | Provider-paid approved actions (see `SPONSORED_AGENT_JOURNEYS.md`) |

Pricing numbers: **TBD**. Do not publish invented rates.

---

## 10. What NOT to build

- Generic SaaS connector sprawl (Composio / Pipedream already cover commodity SaaS)
- Generic browser automation as the core product (Browserbase et al.)
- Chat-first UI as the product (chat is a client; DO is the action layer)
- Competing with OpenAI Ads API (none public yet) — treat as future distribution adapter only
- Invented auth / payment protocols when standards exist or are emerging
- Claims of live nationwide NZ government integrations without verified endpoints

---

## 11. MVP phases (summary)

See `IMPLEMENTATION_ROADMAP.md` for epics and acceptance criteria.

| Phase | Focus |
|-------|--------|
| 1 | Action Contract + Permit + Receipt + Wait + universal response |
| 2 | Call + Forms + Agentize; car-service flagship demo |
| 3 | Quote / Book / Verify / Human; NZ rails spikes |
| 4 | Pursuit tender path; Sponsored Journeys (Assembl-owned); radar adapters |

**First six services:** Permit · Wait · Receipt · Call · Forms · Agentize

---

## 12. Flagship demo: car service booking

End-to-end story (details in `DEMOS.md`):

1. Agent discovers `book.car_service` action  
2. Quote availability / price (dry-run)  
3. Prepare locked args (vehicle, time, workshop)  
4. Permit issued (medium risk)  
5. Execute booking via adapter  
6. Wait for confirmation SMS/email if async  
7. Verify booking exists  
8. Emit receipt; optional undo/cancel within policy  

This demo proves the lifecycle without requiring NZ government rails.

---

## 13. Related docs

- `ACTION_CONTRACT_SPEC.md` — JSON shapes and VAR metric  
- `NZ_ACTION_CLOUD.md` — Aotearoa rails  
- `AGENT_READY_API_OPPORTUNITY_MAP.md` — prioritisation  
- `IMPLEMENTATION_ROADMAP.md` — build order  
- `CODEX.md` — agent continuation brief  
