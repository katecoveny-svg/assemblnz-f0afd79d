# Audit log diagnosis — production compliance pipeline is bypassed

**Date:** 2026-05-13
**Investigator:** Kaihanga + Explore sub-agent
**Severity:** P0 for any commercial pilot in regulated industries (Privacy Act 2020, education, customs, finance)
**Production data risk:** None today (assembl is pre-revenue, no real customer outputs yet to audit)
**Forward-looking risk:** Material — assembl's regulatory promise ("draft-only posture, every output staged for human sign-off, audit trail with hash chain") cannot currently be demonstrated under audit.

---

## What's true today (2026-05-13)

| Table on `wurwcrgxjjwqdaxqceey` | Rows | What it's supposed to record | Current write path |
|---|---|---|---|
| `audit_log` | **0** | Agent invocations (tokens, cost, compliance, PII) | None — dead schema |
| `pipeline_audit_logs` | **0** | 5-stage compliance pipeline (Kahu→Iho→Tā→Mahara→Mana) | Only `ta/index.ts` writes, but nothing calls it |
| `agent_cost_log` | 5 | Agent costs | `_shared/llm-call.ts::logCost()` (the ONLY active audit-adjacent write) |
| `routing_log` | 3 | Routing decisions | Unknown writer; minimal usage |
| `mcp_tool_calls` | 0 | MCP tool invocations | None |
| `assembl_audit_log` | **doesn't exist** | Canonical replacement for `audit_log` | Migration held back — header says "NOT auto-applied... when canon Day 7 is unblocked" |

Five additional audit-adjacent tables exist on prod (`aaaip_audit_exports`, `esign_audit_events`, `safety_audits`, `sovereignty_audit_log`, `waihanga_compliance_audit`) — separate workstreams not investigated here.

---

## Root cause (confirmed empirically)

**Production chat traffic bypasses the entire compliance pipeline.**

- `supabase/functions/chat/index.ts` — the 599 KB monolith that the web app actually invokes — contains **zero references** to `iho-router`. It calls LLMs directly via `_shared/llm-call.ts`, which writes `agent_cost_log` only.
- `iho-router/index.ts` exists but is unreachable from the chat pipeline.
- `ta/index.ts` exists and correctly writes `pipeline_audit_logs` on every step, but no caller invokes it from the chat path.
- The `assembl_audit_log` migration was deliberately withheld from production application. Its file header reads: *"NOT auto-applied... apply via Supabase migration workflow when canon Day 7 is unblocked for production."*
- `assembl_log_agent_interaction` (RPC, 12 args) is deployed and callable — but only `iho-router/analytics.ts` invokes it, and that path is dead.

---

## Why this matters

Assembl's regulatory positioning makes specific claims:

| Claim in canon | Reality on prod today |
|---|---|
| "Tamper-evident hash chain on every agent interaction" | No chain (table empty) |
| "5-stage compliance pipeline runs before any output reaches a user" | Bypassed entirely |
| "Privacy Act 2020 IPP 3A notification on cross-context data use" | Not logged |
| "Every output staged for human sign-off" | True at the UX level (drafts), but the audit row proving it was drafted is missing |
| "PII masked by Kahu engine" | Kahu function exists; not on the active call path |

For pilots that don't touch regulated data (Hudson household = consumer family use), this is acceptable risk. For Sacred Heart (student data + minors), Aironaut Customs (NZ Customs Act 2018), or any waihanga construction H&S scenario, **this is a P0 — assembl currently cannot produce its own audit trail to defend an enforcement query.**

---

## Recommended fix order

Three discrete pieces of work. They can be done independently or chained. Estimated total: ~4-6 hours of focused work + a careful test.

### Fix 1 — Apply the held-back migrations to prod (~10 min)

- Apply `supabase/migrations/20260508000000_assembl_audit_log.sql`
- Apply `supabase/migrations/20260509140000_assembl_audit_log_hardening.sql`

These create `public.assembl_audit_log` with RLS policies, indexes, the hash-chain function, and the trigger that maintains `hash_prev` / `hash_current` per row.

**Risk:** Low. Pure DDL, idempotent, no data impact. Read the migration body before applying to confirm no destructive changes (DROPs, ALTERs to existing tables).

### Fix 2 — Wire `chat/index.ts` to call `ta` (~2-3 hours)

After the LLM response is obtained in `chat/index.ts`, add a non-blocking fetch to `/functions/v1/ta`:

```ts
// Fire-and-forget. Don't block the user response on audit logging.
ctx.waitUntil(
  fetch(`${supabaseUrl}/functions/v1/ta`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${serviceRoleKey}` },
    body: JSON.stringify({ requestId, userId, kete, actionType: 'chat_response', payload: { ... } })
  }).catch(() => {}) // never let audit failure break the user flow
);
```

This populates `pipeline_audit_logs` for every chat turn. Tā then invokes the other pipeline stages internally.

**Risk:** Medium. Adds latency budget (small if fire-and-forget). Service role key handling needs care. Add a feature flag (`ENABLE_AUDIT_PIPELINE=true`) so it can be rolled back fast.

### Fix 3 — Add `writeAuditRow()` to `_shared/tool-executor.ts` (~1-2 hours)

Per the hardening migration's "Day 8 canon" note. On every tool call, INSERT into `public.assembl_audit_log` with: agent_code, tool_called, input, output, duration_ms, compliance_passed, pii_detected, cost_nzd, request_id (joins to pipeline_audit_logs.request_id).

Use service-role key for the INSERT (bypass RLS — these rows must always land).

**Risk:** Low. Add-only INSERT, no impact on existing flows.

---

## Sequencing recommendation

**Don't apply tonight.** This is too important to rush at the end of a long session. Suggested path:

1. Hold this diagnosis in `docs/runbooks/2026-05-13-lovable-port-forward/analysis/AUDIT-LOG-DIAGNOSIS.md` for visibility
2. Tomorrow (or next session): start Fix 1 only. Apply migrations, query the new table to confirm shape. ~15 minutes total. No active call path changes.
3. Day after: Fix 2. Wire `chat/index.ts` to Tā with feature flag. Test in preview. Promote to prod once `pipeline_audit_logs` shows rows growing.
4. Day three: Fix 3. Add tool-executor writes. Verify hash chain integrity with a test query.

Each fix is independently shippable and independently rollback-able. Don't chain them in a single PR.

---

## Open questions / runtime tests needed

1. Are the existing 5 `agent_cost_log` rows from production traffic or from test/seed? Quick `SELECT created_at, user_id, model_used FROM agent_cost_log` would clarify.
2. Are the 3 `routing_log` rows similar (test vs prod)?
3. Does the held-back migration include the `assembl_log_audit_event` trigger function, or is it referenced but not defined?

These don't block the fix path. They inform priority.

---

## What NOT to do

- ❌ Don't claim "Three Gates PASS" in customer-facing language until the audit rows are flowing
- ❌ Don't pitch Sacred Heart, Aironaut, or any regulated-industry pilot until Fix 1+2 are live
- ❌ Don't make the chat slower or block on audit writes — fire-and-forget only
- ❌ Don't try to land all three fixes in one PR

---

Filed for tomorrow's queue. Logged.
