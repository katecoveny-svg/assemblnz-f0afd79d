## Scope

The user's rule: only touch embeddings calls hitting the **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1/embeddings`) that use an **unsupported** model. Leave everything else alone.

### Audit of every embedding call in the repo

| File | Endpoint | Model | Verdict |
|---|---|---|---|
| `legacy-vite/src/lib/knowledgeBrain.ts` (line 25-29) | **Lovable Gateway** | `google/text-embedding-004` | **Unsupported — fix + disable** |
| `supabase/functions/ikb-ingest/index.ts` (lines 32, 73-84) | **Lovable Gateway** | `google/text-embedding-004` | **Unsupported — fix + disable** |
| `supabase/functions/_shared/embed.ts` | Google native `generativelanguage.googleapis.com` | `gemini-embedding-001:embedContent` | Direct provider, NOT Gateway — leave alone |
| `supabase/functions/haven-ai/index.ts`, `odyssey-travel/index.ts` | Google native API | `gemini-embedding-001:embedContent` | Direct provider, NOT Gateway — leave alone |
| `supabase/functions/memory-backfill-embeddings/index.ts` | `openrouter.ai/api/v1/embeddings` | `openai/text-embedding-3-small` | OpenRouter direct, NOT Gateway — leave alone |
| `supabase/functions/memory-extractor/index.ts` | `openrouter.ai/api/v1/embeddings` | `openai/text-embedding-3-small` | OpenRouter direct, NOT Gateway — leave alone |
| `supabase/functions/ikb-search/kb-context/memory-recall/embed-worker` | All route through `_shared/embed.ts` | (Google native) | Not Gateway — leave alone |

Only the first two are in scope.

## Why `openai/text-embedding-3-small` with `dimensions: 768`

- pgvector columns on both call paths are `vector(768)` (the existing schema and the comments in `_shared/embed.ts` / `embed-worker` confirm 768-dim).
- Per the AI-Gateway knowledge: `google/gemini-embedding-001` defaults to 3072 and **rejects** the `dimensions` field — cannot truncate to 768.
- `openai/text-embedding-3-small` is a supported Gateway model and accepts `"dimensions": 768`, keeping the existing `vector(768)` column shape intact. This is the documented escape hatch for non-default dimensions.
- No DB migrations needed — column shape preserved.

## Disabling convention

Per the user's instruction, the corrected call stays in the file but is commented out with the marker `// Disabled by Lovable - model fixed; uncomment to re-enable`. The function still exists and returns a safe failure (`null` for the browser helper, `throw` for the ingest worker) so callers behave predictably — both call sites already handle the null/throw paths today (knowledgeBrain returns `[]` on null; ikb-ingest wraps each doc in a try/catch and writes status `error`).

## Changes

### 1. `legacy-vite/src/lib/knowledgeBrain.ts` (function `embedQuery`, ~lines 22-34)

- Replace the model in the corrected body with `openai/text-embedding-3-small` and add `dimensions: 768`.
- Comment out the entire `fetch` → `r.json()` → `embedding` block with the marker.
- Make the function return `null` while disabled. `getLiveContextServer` already handles `null` by returning `[]`, so the UI silently degrades to "no fresh sources matched this query".

### 2. `supabase/functions/ikb-ingest/index.ts`

- Change `EMBED_MODEL` constant (line 32) to `openai/text-embedding-3-small` and add a sibling `EMBED_DIMENSIONS = 768` constant.
- In `embedBatch` (lines 73-84): leave the corrected `fetch` body in place (with `dimensions: EMBED_DIMENSIONS` in the JSON), but comment out the `fetch` call + response parsing with the marker, and `throw new Error("ikb-ingest embedBatch disabled by Lovable - uncomment in supabase/functions/ikb-ingest/index.ts to re-enable")` from the active code path.
- Each per-doc ingest already runs in a try/catch and records `status: "error"`, so the function continues to respond without crashing the batch loop.

## Out of scope / explicitly NOT touched

- `_shared/embed.ts` and every function that uses it (`ikb-search`, `kb-context`, `memory-recall`, `embed-worker`, `haven-ai`, `odyssey-travel`) — these are direct Google API calls, not Gateway calls.
- `memory-backfill-embeddings/index.ts` and `memory-extractor/index.ts` — direct OpenRouter calls with a supported model.
- pgvector schema, RPCs (`match_kb_knowledge`, `search_industry_kb`, `match_agent_memory`), and any UI.
- No new edge-function deploys are triggered by editing the source — code change only.

## Verification after build mode

- `grep -n "google/text-embedding-004" -r .` → returns no matches outside `.next/` build cache and `.md` docs.
- `grep -rn "Disabled by Lovable - model fixed" -r .` → returns the two expected hits.
- TypeScript compile of both files (`tsgo` is run automatically by harness).
