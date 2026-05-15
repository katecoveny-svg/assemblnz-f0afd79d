# Memory + Live KB Pipeline Audit - Phase 1

Date: 2026-05-15
Branch: `feat/memory-kb-activation-2026-05-15`
Scope: read-only audit. No function, migration, auth, admin, or per-kete endpoint code changed.

## Executive Summary

The memory and knowledge-base pipeline is more complete than the sketch suggested, but several pieces are present without being scheduled or called from the older per-kete agent flow.

- `kb-fetch-source` already exists as a dispatcher plus adapters: `supabase/functions/tick`, `adapter-rss`, `adapter-jsonapi`, and `adapter-html`.
- `kb-embed-worker` already exists as `supabase/functions/embed-worker`.
- `agent-context-load` exists as the shared helper `supabase/functions/_shared/live-data-context.ts`, plus retrieval endpoints `ikb-search` and `kb-context`; however `buildLiveDataContext` is not currently used by `agent-waihanga`.
- `agent-memory-extract` exists as `memory-extractor` plus `memory_extraction_queue`; web chat and `agent-router` enqueue work, but `agent-waihanga` does not.
- `reasoning-trace-writer` exists as `reasoning-trace-ingest`, but I found no call sites wiring it into chat, router, MCP chat, or `agent-waihanga`.
- Cron scheduling is the main missing connective tissue. I found comments and a `kb_cron_status()` helper, but no active migration scheduling `tick`, `embed-worker`, `memory-extractor`, `compliance-scanner`, or a `decay-memory` job.
- There is no `decay-memory` function yet.

## Mapping Kate's Five Functions

| Sketch name | Existing equivalent | Coverage | Gap |
| --- | --- | --- | --- |
| `kb-fetch-source` | `tick` plus `adapter-rss`, `adapter-jsonapi`, `adapter-html` | Reads due `kb_sources`, dispatches adapters, writes `kb_source_runs`, `kb_documents`, `kb_changes`; DB trigger enqueues embeddings. | Not scheduled. No single function named `kb-fetch-source`, but the behavior exists under these names. |
| `kb-embed-worker` | `embed-worker` | Drains `kb_embed_queue`, chunks `kb_documents.content`, embeds through `_shared/embed.ts`, writes `kb_doc_chunks`. | Not scheduled. |
| `agent-context-load` | `_shared/live-data-context.ts`, `ikb-search`, `kb-context`, MCP chat direct context injection | Live context helper can call `ikb-search`; `ikb-search` queries `industry_kb_chunks`; `kb-context` queries `match_kb_knowledge`; MCP chat injects KB plus memory context. | `buildLiveDataContext` itself is unused. `agent-waihanga` does not load KB chunks or the shared live context. |
| `agent-memory-extract` | `memory-extractor`, `compress-conversation`, `compress-context`, `mahara` | `memory-extractor` drains `memory_extraction_queue` and writes `agent_memory`; `compress-conversation` extracts structured facts to `conversation_summaries` and `shared_context`; `mahara` writes `business_memory` outcomes/preferences. | `memory-extractor` is not scheduled. `agent-waihanga` does not enqueue extraction or call `mahara.capture_outcome`. |
| `reasoning-trace-writer` | `reasoning-trace-ingest` | Writes `reasoning_traces` and `outcome_events` with hash chaining. | No call sites found. No shared helper wrapping LLM calls. |

## Function Notes

### `supabase/functions/_shared/live-data-context.ts`

- Exposes `buildLiveDataContext(req, opts)` and `KETE_SCOPES`.
- Resolves user identity from bearer token and falls back to a default tenant.
- Builds an auditable context object with typed feeds for weather, fuel, compliance, knowledge base, routes, fleet, freight, AIS, construction, agriculture, and marine.
- `feeds.knowledgeBase()` invokes `ikb-search` with `{ query, kete, limit }`.
- Writes access events to `audit_log`.
- Currently only `KETE_SCOPES` is imported by chat/tool validation. I found no usage of `buildLiveDataContext`.

### `supabase/functions/_shared/embed.ts`

- Provides `embedText(input, apiKey, dim = 768)`.
- Calls Gemini `gemini-embedding-001` directly through Google Generative Language.
- Used by `embed-worker`, `ikb-search`, `kb-context`, `memory-recall`, `mcp-chat`, `agent-router`, `ambient-agent-loop`, and related functions.

### `supabase/functions/agent-waihanga/index.ts`

- Calls `mahara` only in `retrieveMemory()` with action `get_context`.
- Passes `projectId` as `userId`, which is likely not the same as authenticated user or tenant identity.
- Counts Mahara context rows but does not inject the returned memory content into the reasoning layer.
- Does not write to `agent_memory`.
- Does not call `memory-extractor`, `memory_extraction_queue`, or `mahara.capture_outcome`.
- Does not call `buildLiveDataContext`, `ikb-search`, `kb-context`, `kb_doc_chunks`, or `industry_kb_chunks`.
- Writes audit-style events to `pipeline_audit_logs`, not `reasoning_traces`.

### `supabase/functions/mahara/index.ts`

- Supports three actions:
  - `capture_outcome` writes to `business_memory`.
  - `get_context` reads `business_memory` for a `userId` and kete category.
  - `store_preference` writes preference memories to `business_memory`.
- Includes response-time relevance decay using 30-day exponential decay.
- Does not implement the requested 90-day decay/writeback behavior.
- Does not currently require or write `tenant_id` even though `business_memory` has a `tenant_id` column.

### `supabase/functions/compress-context/index.ts`

- Compresses a message array with Lovable AI Gateway and returns summary/facts/decisions/pending actions.
- Does not write memory or context rows itself.

### `supabase/functions/compress-conversation/index.ts`

- Compresses conversation history with industry-specific extraction schemas.
- Writes conversation summaries to `conversation_summaries`.
- Upserts extracted facts to `shared_context`.
- Does not write `agent_memory` or `business_memory`.

### `supabase/functions/memory-extractor/index.ts`

- Drains `memory_extraction_queue`.
- Reads `conversations.messages`, extracts durable facts with OpenRouter Claude Haiku, embeds them with OpenRouter `text-embedding-3-small`, and writes `agent_memory`.
- Web chat and `agent-router` enqueue rows, but no cron schedule was found.
- Important risk: `agent_memory.embedding` and `match_agent_memory` are `vector(1536)`, but `memory-recall` and MCP chat currently call `_shared/embedText` with Gemini 768-dimension embeddings before calling `match_agent_memory`. That likely makes semantic memory recall fail unless a later migration or runtime cast exists outside the files audited.

### `supabase/functions/memory-recall/index.ts`

- Called by `agent-router`.
- Embeds the query with Gemini 768 dimensions and calls `match_agent_memory`.
- Updates `last_accessed_at` for returned rows.
- The dimension mismatch above should be resolved before relying on this in production.

### `supabase/functions/reasoning-trace-ingest/index.ts`

- Implements the reasoning/outcome ledger writer.
- `POST /reasoning-trace-ingest` writes `reasoning_traces`.
- `POST /reasoning-trace-ingest?action=outcome` writes `outcome_events`.
- Includes tenant-scoped hash chaining.
- I found no caller outside this function.

### `supabase/functions/compliance-scanner/index.ts`

- Scans a hardcoded `SOURCES` array of NZ government and industry URLs.
- Writes `compliance_updates`, `admin_notifications`, `agent_knowledge_base`, and `compliance_scan_log`.
- Does not read `kb_sources`.
- Does not write `kb_source_runs`, `kb_documents`, `kb_embed_queue`, or `kb_doc_chunks`.
- Config marks it `verify_jwt = false`, but no cron schedule was found.

### `supabase/functions/tick/index.ts` and adapters

- `tick` reads active `kb_sources` and dispatches due sources to adapters by source type.
- `adapter-rss`, `adapter-jsonapi`, and `adapter-html` fetch content, hash it, write run telemetry, and insert/update `kb_documents`.
- Migration `20260419022904_...` adds the trigger `kb_enqueue_embedding`, so new or changed `kb_documents` automatically enqueue `kb_embed_queue`.
- This is the best existing equivalent to a `kb-fetch-source` job.

### `supabase/functions/embed-worker/index.ts`

- Processes pending `kb_embed_queue` rows.
- Reads `kb_documents`, chunks content, embeds with `_shared/embed.ts`, replaces rows in `kb_doc_chunks`, and marks the queue row done/error.
- No cron schedule found.

### `supabase/functions/ikb-search/index.ts`, `kb-context`, and `ikb-ingest`

- There are two KB tracks:
  - `kb_sources` -> `kb_documents` -> `kb_doc_chunks` -> `match_kb_knowledge`.
  - `industry_knowledge_base` -> `industry_kb_chunks` -> `search_industry_kb`.
- `ikb-search` searches `industry_kb_chunks`, not `kb_doc_chunks`.
- `kb-context` searches `kb_doc_chunks` through `match_kb_knowledge`.
- `live-data-context` calls `ikb-search`, so it currently lands on the industry KB track.

## Schema Findings

Relevant migrations:

- `20260322120432_...` creates legacy `agent_memory`.
- `20260331025828_...` creates `business_memory` with `user_id`, `tenant_id`, `category`, `tags`, `content`, `metadata`, `relevance_score`, `ttl_days`, `is_archived`, `expires_at`.
- `20260419022743_...` creates `kb_sources`, `kb_documents`, `kb_doc_chunks`, `kb_changes`, `kb_source_runs`, `kb_sentinel_alerts`, `kb_embed_queue`, `match_kb_knowledge`, and RLS.
- `20260419022904_...` creates `kb_enqueue_embedding` trigger and seeds priority `kb_sources`.
- `20260420020250_...` extends `agent_memory`, creates `memory_extraction_queue`, and creates `match_agent_memory`.
- `20260511150200_...` creates `reasoning_traces`, `outcome_events`, and `reasoning_outcomes`.

Notable schema risks:

- `agent_memory.embedding` and `match_agent_memory` are `vector(1536)`.
- Newer recall callers use Gemini 768-dimension embeddings.
- `business_memory` has `tenant_id`, but `mahara` currently writes only `user_id`.
- There is no obvious 90-day reconfirmation/decay schedule for `business_memory`.

## Wired But Not Scheduled

I found no `cron.schedule` migration for these jobs:

- `tick` / KB source dispatcher.
- `embed-worker`.
- `memory-extractor`.
- `compliance-scanner`.
- `decay-memory`.

There is a `kb_cron_status()` helper that looks for job names such as `tick-every-minute`, `embed-worker-every-5min`, and `health-check-hourly`, but it only reports status. It does not create schedules.

## Per-Tenant `business_memory` Write Point

In the existing `agent-waihanga` flow, the natural write point is in `handleWaihangaRequest` after `executeAction()` returns and before or alongside `auditLog()`.

At that point the function has:

- the interpreted user action,
- the reasoning decision,
- the compliance status,
- the evidence pack metadata,
- the action result,
- the request timestamp.

The write should call `mahara` action `capture_outcome` with authenticated `userId`, resolved `tenantId`, `kete: "WAIHANGA"`, the request id, and a compact outcome payload. The current implementation does not resolve tenant/user identity and instead uses `projectId` as Mahara `userId` during recall, so identity wiring should be corrected before writing tenant-scoped memory.

## Missing Or Ambiguous Items For Phase 2

Genuinely missing:

- Cron schedules for the existing KB, memory, and scanner jobs.
- `decay-memory` function and weekly schedule.
- A shared reasoning trace helper or direct call sites from agent/chat LLM invocations.
- `agent-waihanga` integration with live KB context and business-memory writes.

Ambiguous and should be confirmed before code:

- Whether to standardize semantic `agent_memory` embeddings on 1536 dimensions (OpenRouter/OpenAI style) or migrate recall to a 768-dimension function/table path.
- Whether `live-data-context` should keep using `ikb-search` over `industry_kb_chunks`, or switch its knowledge feed to `kb-context` / `match_kb_knowledge` over `kb_doc_chunks`.
- Whether the requested Building Act 2004 Phase 4 verification should target the seeded `Legislation NZ - Acts` source or a new exact Building Act source row. The current `kb_sources` seed has a broad legislation feed, not a clearly named "Building Act 2004" source.

## Phase 1 Stop Point

Per the mission brief, this report is the stop point. Phase 2 should wait for Kate confirmation on:

- Use existing `tick`/adapter functions rather than creating a new `kb-fetch-source`.
- Schedule the existing `embed-worker`.
- Add or schedule `memory-extractor`.
- Add `decay-memory`.
- Decide the memory embedding dimension fix before relying on `memory-recall`.
- Decide whether `agent-waihanga` should use `live-data-context` as-is or switch to the `kb_doc_chunks` track.
