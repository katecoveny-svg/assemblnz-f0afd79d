

# Memory · Symbiotic · Ambient — what's actually working, what isn't

You asked a direct question. Here's the direct answer with evidence pulled live from the database and edge logs, then the smallest plan to make all three demonstrable for tomorrow.

---

## 1. Status — measured, not assumed

| Layer | Wired in code | Has live data | Verdict |
|---|---|---|---|
| **Memory recall** (semantic, per user) | ✅ `memory-recall` edge fn + `match_agent_memory` RPC + `MemoryPanel` UI | ❌ `agent_memory` has **2 rows total**, **0 with embeddings** | **Plumbed but cold.** Recall returns nothing because nothing was extracted + embedded. |
| **Memory persistence** (conversation → summary) | ✅ `compress-context` + `memory-extractor` edge fns; `contextCompression.ts` calls them | ❌ `conversation_summaries` has **0 rows**; `memory_extraction_queue` has **0 pending / 0 failed** | **Never fired.** The compressor is only invoked from a few legacy components, not from the live `chat` / `agent-router` / `tnz-inbound` flows. |
| **Shared context** (cross-agent facts) | ✅ `shared_context` table + injected by `agent-router` as `sharedContextBlock` | ⚠️ **2 rows**, last update 2026-04-20 | **Working but thin.** The reader works, the writer (memory-extractor) isn't running, so it never grows. |
| **Business memory** (tenant-level facts) | ✅ Read by every agent via `kete-default-handler` | ✅ **5 rows**, last update 2026-04-11 | **Working.** This is what the agents currently "remember" about a business. |
| **Symbiotic agent triggers** (Manaaki booking → Pikau invoice etc.) | ✅ `symbioticBlock` injected into `agent-router` system prompt; `workflow_templates` table has **13 templates** | ❌ `workflow_executions` has **0 rows** | **Prompt-level only.** Agents are *told* about symbiotic peers but **no template has ever executed end-to-end.** No automation is firing. |
| **Ambient / proactive** (daily 7am alerts per kete) | ✅ `generate-proactive-alerts` + `run-scheduled-task` + cron `process-agent-tasks` every 15 min | ⚠️ **19 active scheduled tasks**, last_run **2026-04-20 07:00 UTC**, run_count **2** each | **Cron is firing, but `proactive_alerts` table has 0 rows** — meaning the function runs but writes nothing. Likely failing silently. |
| **Embedding worker** (turns memory → vectors) | ✅ `embed-worker` + `kb-embed-worker-5min` cron | ✅ Cron active, **0 pending in queue** | **Working** for KB; but `agent_memory` has no embeddings because nothing is enqueued for it. |

**Honest one-liner:** the scaffolding is in. The flywheel has never spun. For a pitch tomorrow, this means if a prospect asks "show me memory" or "show me a symbiotic chain," the UI will say *here it is* but the data behind it is empty.

---

## 2. Root causes (three small bugs, not three big ones)

1. **Memory write path is orphaned.** `compressAndLearn` exists but isn't called from `chat/index.ts`, `agent-router/index.ts`, or `tnz-inbound/index.ts` — the three entry points that actually serve traffic. So conversations finish, nothing gets summarised, nothing gets embedded, recall returns nothing.

2. **`generate-proactive-alerts` writes to wrong table or errors silently.** Cron is calling it (run_count = 2 yesterday), but `proactive_alerts` is empty. Either it inserts into `toroa_proactive_alerts` only (TŌRO-scoped), or it's throwing and the runner catches the error.

3. **Symbiotic triggers are advisory, not executed.** The system prompt tells agents *"if X happens, hand off to Y"* — but there is no listener that watches `manaaki_workflow_records` for new bookings and writes a corresponding row to `pikau` / `auaha`. Nothing inserts into `workflow_executions`.

---

## 3. Plan — get all three demonstrable in one short pass

### Fix A — turn memory persistence on (the biggest unlock)
- Add a single `compressAndLearn` call at the end of every successful agent response in `agent-router/index.ts` and `tnz-inbound/index.ts` (gated to fire after every 6th message in a conversation, async, fire-and-forget so it never blocks the user reply).
- Backfill once for the demo: run `memory-extractor` against the last 50 inbound/outbound SMS in `messaging_messages` for the admin tenant. This populates `conversation_summaries` + `agent_memory` so MemoryPanel shows real entries.
- Trigger `memory-backfill-embeddings` once to vectorise the 2 existing rows + the new ones so `match_agent_memory` actually returns hits.

### Fix B — make proactive alerts visible
- Manually invoke `generate-proactive-alerts` once via `supabase--curl_edge_functions` and read the response + edge logs to find why it isn't writing to `proactive_alerts`.
- Either point it at the right table or add the missing insert. Seed 3 demo alerts (one per Pikau, Manaaki, Waihanga) so the dashboard ambient ribbon has content.

### Fix C — wire one symbiotic chain end-to-end (proof, not the whole grid)
- Pick the cleanest pair: **Manaaki booking → Auaha thank-you draft.**
- Add a Postgres trigger on `manaaki_workflow_records` that inserts a row into `workflow_executions` with `workflow_id = <auaha-thank-you-template>` and a `pending_human_approval` status (Draft-Only mode is locked).
- Surface those pending workflows on `/admin/dashboard` so you can demo: *"a booking just landed, here's the draft Auaha already prepared, one click to approve."*
- The other 12 templates remain dormant — we ship one working chain, not twelve broken ones.

### Fix D — pitch-day script update
- Add a 60-second Memory + Symbiotic beat to `/mnt/documents/pikau-demo-script.md`:
  - Open MemoryPanel on `/pikau`, search "shipment" → see real summaries pulled from yesterday's SMS.
  - On `/admin/dashboard`, show the Manaaki→Auaha draft sitting in the queue.
  - Say: *"Memory persists. Agents hand off. Nothing sends without you."*

---

## Files I'll touch

| File | Change |
|---|---|
| `supabase/functions/agent-router/index.ts` | Add async `compress-context` call after final response |
| `supabase/functions/tnz-inbound/index.ts` | Same |
| `supabase/functions/generate-proactive-alerts/index.ts` | Fix the table-write bug, return diagnostics |
| New migration | Trigger on `manaaki_workflow_records` → `workflow_executions` (draft) |
| `src/pages/AdminDashboardPage.tsx` (or nearest equivalent) | Show pending symbiotic drafts panel |
| Manual one-shot | Seed `conversation_summaries` from last 50 SMS + run embedding backfill |
| `/mnt/documents/pikau-demo-script.md` | Add Memory + Symbiotic demo beat |

## What I will NOT touch
- No new image assets.
- No re-skin work — Pricing/About drift stays flagged for post-pitch.
- No rewriting the 13 workflow templates — only the Manaaki→Auaha pair gets a live trigger.
- No autonomy escalation — every symbiotic action stays in Draft-Only with human approval, per the platform-wide hard lock.

## Risk
- The `generate-proactive-alerts` fix is blind until I see the actual edge log on a fresh invoke. If it's a deeper schema mismatch I'll seed `proactive_alerts` directly so the demo isn't blocked, and queue the proper fix post-pitch.
- The Manaaki→Auaha trigger writes to a draft queue only — zero risk of an actual customer-facing send.

