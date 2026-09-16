# Action Contract Specification

**Status:** Canonical shape for implementers (v0 draft)  
**Brand:** DO — safe action layer  
**Locale:** NZ English

This spec defines the shared Action Contract JSON, lifecycle, universal response schema, and the **Verified Action Rate (VAR)** metric. It does not claim a live production deployment.

---

## 1. Lifecycle

```
discover → inspect → quote/dry-run → prepare → permit → execute → wait → verify → receipt → undo/escalate
```

Stages may be skipped only when policy explicitly allows (e.g. low-risk read-only inspect without permit). High/critical risk must not skip permit, verify, or receipt.

---

## 2. Canonical Action Contract (request / definition)

```json
{
  "contract_version": "0.1.0",
  "action": {
    "name": "book.car_service",
    "namespace": "demo.auto",
    "version": "1",
    "title": "Book car service",
    "description": "Reserve a workshop slot for vehicle service",
    "risk_class": "medium",
    "idempotent": false,
    "undoable": true,
    "transports": ["rest", "sdk", "mcp", "webhook"]
  },
  "input_schema": {
    "type": "object",
    "required": ["vehicle_rego", "slot_id", "workshop_id"],
    "properties": {
      "vehicle_rego": { "type": "string" },
      "slot_id": { "type": "string" },
      "workshop_id": { "type": "string" },
      "notes": { "type": "string" }
    }
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "booking_id": { "type": "string" },
      "confirmed_at": { "type": "string", "format": "date-time" }
    }
  },
  "permissions": {
    "scopes": ["book:car_service"],
    "max_amount": null,
    "requires_human": false
  },
  "adapters": {
    "primary": "demo.workshop.v1"
  },
  "policy_refs": ["tenant.default.v1"]
}
```

### Field notes

| Field | Rule |
|-------|------|
| `contract_version` | Semver of this spec |
| `risk_class` | `low` \| `medium` \| `high` \| `critical` |
| `idempotent` | If true, execute must be safe with same idempotency key |
| `undoable` | If true, undo stage must be implemented or explicitly stubbed |
| `input_schema` | JSON Schema; prepare locks a concrete instance |

---

## 3. Stage payloads (examples)

### 3.1 Prepare

```json
{
  "action_name": "book.car_service",
  "args": {
    "vehicle_rego": "ABC123",
    "slot_id": "slot_981",
    "workshop_id": "ws_42"
  },
  "idempotency_key": "idem_7f3a...",
  "tenant_id": "ten_...",
  "agent_id": "agt_..."
}
```

**Prepare result** includes `prep_id` and `args_hash` (SHA-256 of canonical JSON args).

### 3.2 Permit

```json
{
  "prep_id": "prep_...",
  "scopes": ["book:car_service"],
  "ttl_seconds": 900,
  "constraints": {
    "args_hash": "sha256:...",
    "max_uses": 1
  }
}
```

**Permit result:** `permit_id`, `expires_at`, signature/token (**token format TBD** — interop with OAuth agent delegation / AuthZEN; do not invent a parallel crypto protocol lightly).

### 3.3 Execute

```json
{
  "permit_id": "prm_...",
  "prep_id": "prep_...",
  "idempotency_key": "idem_7f3a..."
}
```

Server must reject if permit expired, revoked, args_hash mismatch, or max_uses exceeded.

### 3.4 Wait

```json
{
  "wait_id": "wait_...",
  "kind": "external_confirmation",
  "timeout_seconds": 3600,
  "poll_url": "/api/do/action/wait/wait_..."
}
```

### 3.5 Verify

```json
{
  "action_id": "act_...",
  "checks": ["booking_exists", "slot_still_held"],
  "evidence_ids": ["ev_..."]
}
```

### 3.6 Receipt

```json
{
  "receipt_id": "rcp_...",
  "action_id": "act_...",
  "permit_id": "prm_...",
  "stage_log": [
    { "stage": "prepare", "at": "2026-09-17T08:00:00+12:00" },
    { "stage": "permit", "at": "2026-09-17T08:00:05+12:00" },
    { "stage": "execute", "at": "2026-09-17T08:00:12+12:00" },
    { "stage": "verify", "at": "2026-09-17T08:00:20+12:00", "ok": true }
  ],
  "args_hash": "sha256:...",
  "result_digest": "sha256:...",
  "actor": { "agent_id": "agt_...", "tenant_id": "ten_..." }
}
```

---

## 4. Universal response schema

```json
{
  "ok": true,
  "action_id": "act_...",
  "action_name": "book.car_service",
  "stage": "execute",
  "status": "succeeded",
  "prep_id": "prep_...",
  "permit_id": "prm_...",
  "receipt_id": "rcp_...",
  "wait_id": null,
  "verify": { "passed": true, "checks": ["booking_exists"] },
  "result": { "booking_id": "bk_991" },
  "errors": [],
  "risk": {
    "class": "medium",
    "flags": []
  },
  "meta": {
    "contract_version": "0.1.0",
    "idempotency_key": "idem_7f3a...",
    "request_id": "req_...",
    "server_time": "2026-09-17T08:00:12+12:00"
  }
}
```

### Status enum

`accepted` · `in_progress` · `waiting` · `succeeded` · `failed` · `cancelled` · `escalated` · `undone`

### Error object

```json
{
  "code": "permit_expired",
  "message": "Permit prm_... expired before execute",
  "retryable": false,
  "details": {}
}
```

---

## 5. Verified Action Rate (VAR)

**Definition (v0):**

\[
\mathrm{VAR} = \frac{\text{actions with verify passed AND receipt issued}}{\text{actions that reached execute}}
\]

| Rule | Detail |
|------|--------|
| Window | Rolling 7 / 30 days per tenant (configurable) |
| Exclude | Dry-runs, discover/inspect only |
| Failed verify | Counts in denominator, not numerator |
| Target | **TBD** per risk class (hypothesis: ≥95% medium after MVP) |

VAR is the north-star reliability metric for DO — not chat quality, not tool count.

---

## 6. Transport binding (sketch)

| Transport | Binding |
|-----------|---------|
| REST | `POST /api/do/action/{stage}` with universal response |
| SDK | `@assembl/do` methods mirror stages |
| MCP | Tools named `do_discover`, `do_prepare`, `do_permit`, … |
| Webhook | Signed events: `do.wait.resolved`, `do.receipt.issued` |

Exact paths live in OpenAPI when generated (`IMPLEMENTATION_ROADMAP.md`).

---

## 7. Non-goals for this spec

- Defining a new global auth standard  
- Replacing A2A / AP2 / Visa TAP  
- Guaranteeing legal enforceability of receipts without counsel review  

---

## Related

- `DO_ACTION_CLOUD.md`  
- `CODEX.md`  
- `IMPLEMENTATION_ROADMAP.md`  
