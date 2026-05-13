# 🌅 Welcome Back, Kate — 13 May afternoon handoff

**Session start:** 13 May 2026, ~11:50 NZST (you stepped out)
**Session end:** 13 May 2026, ~12:30 NZST
**Mode:** Autonomous prep, full Lovable bundle in hand
**Spend:** <$1 NZD
**Touched on prod:** Read-only queries only. Zero writes. Zero pushes to GitHub.

---

## TL;DR — what to click first

1. **Read `analysis/THREE-BUCKET-DIFF.md`** (5 min) — the full picture of what came from Lovable vs what's on prod
2. **Merge PR #122 + apply migration** (2 min) — drops 4 agent prompts in inactive state, unblocks Phase 5
3. **Decide:** authorise Kaihanga to push the next 4 PRs (Phases 5, 4a, 4b, 2) — or land each yourself manually
4. **Greenlight Reo** to start the 13-prompt editorial merge brief once Phase 2 is live

Total click-time to land everything in this runbook: **~10-12 minutes of your time**, plus Reo's autonomous merge work.

---

## What landed from Lovable (full bundle)

| File | Rows | Purpose | Where |
|---|---|---|---|
| `agent_prompts_full.json` | 49 active | Full system_prompt text — Phase 2 + 3 unblocker | `lovable-export-2026-05-13/` |
| `tool_registry_full.json` | 72 | Full tool definitions — Phase 4 unblocker | `lovable-export-2026-05-13/` |
| `agent_toolsets.csv/json` | 254 wirings, 64 tools | Already had from earlier batch | `lovable-export-2026-05-13/` |
| `agent_memory_full.json` | 45 | Stricter filter; **DO NOT IMPORT** | `lovable-export-2026-05-13/` |
| `agent_knowledge_base.csv/json` | 110 | Re-export, mostly low-value | `lovable-export-2026-05-13/` |
| `casing_audit.md` | ~165 rows | Lovable's view — cross-checked with my derived | `lovable-export-2026-05-13/` |
| `PORT-FORWARD-NOTES.md` | — | Lovable's recommendations + sample SQL | `lovable-export-2026-05-13/` |
| `_export_failures.md` | — | Schema drift documented | `lovable-export-2026-05-13/` |

Skipped: `edge_functions_source/` (empty per Lovable; use repo) and `tool_calls_observed.csv` (mcp_tool_calls is empty on Lovable side).

---

## What I built while you were out

All artefacts in `/agent/workspace/runbook-2026-05-13/`:

```
runbook-2026-05-13/
├── 00_WELCOME_BACK.md          ← THIS FILE
├── RUNBOOK.md                  ← Consolidated 5-PR runbook
├── analysis/
│   └── THREE-BUCKET-DIFF.md    ← Port verbatim / merge / skip analysis
├── briefs/
│   └── REO-EDITORIAL-MERGE-BRIEF.md  ← 13 prompts for Reo's merge pass
└── sql/
    ├── 00_phase5_casing_normalisation.sql   ← Run FIRST after PR #122
    ├── 01_phase2_toro_subagents_port.sql    ← 8 Tōro sub-agents (inactive)
    ├── 02_phase4a_tool_registry_port.sql    ← 50 missing tools
    └── 03_phase4b_agent_toolsets_fill.sql   ← 218 agent-tool wirings
```

**Total: 4 SQL migrations + 1 runbook + 1 analysis + 1 Reo brief = 7 artefacts, ~120 KB.**

---

## Queued actions, ordered by priority

### 🟢 Priority 1 — Land PR #122 (Phase 1)

**Why first:** Already open, already reviewed, simplest merge.

- Branch: `kaihanga/phase1-port-lovable-masters-2026-05-13`
- Commit: `7e3ab461`
- Action: Mark Ready for review → green Merge → Confirm → run migration via `SUPABASE_BETA_RUN_SQL_QUERY`
- Time: **~2 min total**
- Effect: 4 new agent_prompts rows (hui, manaaki, arataki, toro — all is_active=FALSE on toro)

### 🟡 Priority 2 — Authorise next 4 PRs (Phases 5 → 4a → 4b → 2)

**Why second:** Order-dependent. Phase 5 (casing) must run before Phase 4b (toolsets fill).

- I need per-thread GitHub toolkit access (toggle in the sidebar) to push these
- Alternative: you apply them manually via Supabase SQL Editor — they're ready in `runbook-2026-05-13/sql/`
- Each migration is in BEGIN/COMMIT and idempotent (ON CONFLICT semantics)
- Time: **~6 min total** for all 4 PR cycles, plus 4 SQL applies

| Phase | File | Size | What it does |
|---|---|---|---|
| 5 | `sql/00_phase5_casing_normalisation.sql` | ~3 KB | `AKO→ako`, `HOKO→hoko` on agent_prompts; merge `ECHO/PRISM` toolsets |
| 4a | `sql/02_phase4a_tool_registry_port.sql` | 52 KB | Insert 50 tools with full tool_schema jsonb |
| 4b | `sql/03_phase4b_agent_toolsets_fill.sql` | 34 KB | 218 INSERT statements for agent-tool wirings |
| 2 | `sql/01_phase2_toro_subagents_port.sql` | 20 KB | 8 Tōro sub-agents inserted as is_active=FALSE |

### 🟠 Priority 3 — Greenlight Reo for Phase 3 (after Phase 2 lands)

**Why third:** Reo needs the canon Tōro sub-agents in place + needs to read prod's current AKO/auaha/waihanga prompts side-by-side.

- Open `briefs/REO-EDITORIAL-MERGE-BRIEF.md` and forward to Reo (or @ her in this thread)
- She'll produce `04_phase3_reo_editorial_merges.sql` — a single migration with 13 UPDATE statements
- Time: **2-3 hours of Reo's autonomous work**, then ~5 min of your review

After Reo lands her PR, flip `is_active=TRUE` on the 9 Tōro agents (toro parent + 8 sub-agents) in a small follow-up migration.

### ⚪ Priority 4 — Deferred / out of scope

Not in this runbook:

- **agent_memory import** — DO NOT IMPORT. The 45 rows are test-account contamination (Huka-Lodge-style luxury accommodation + Fonterra dairy strategy from a different user). See `analysis/THREE-BUCKET-DIFF.md` agent_memory section.
- **agent_knowledge_base port** — Defer until after Phase 3. Most rows are low-value boilerplate.
- **audit_log = 0 production bug** — Separate workstream. Biggest functional gap but unrelated to Lovable port.
- **subbie-compliance-scanner edge function** — Only audit-named function missing from prod's 163. Deploy separately.
- **Edge function diff** — Skipped per Lovable's failures.md — requires Functions Admin API access not in their sandbox.

---

## What I deliberately did NOT do

Per autonomous prep mode rules and my Plan Tasks scope:

- ❌ Did NOT push any code to GitHub (no per-thread toolkit access this session)
- ❌ Did NOT apply any migration to prod (only read-only queries)
- ❌ Did NOT modify ssaxxdkxzrvkdjsanhei in any way
- ❌ Did NOT accept any credentials, API keys, or rotatable secrets in chat
- ❌ Did NOT import the 45 agent_memory rows (test-account contamination)
- ❌ Did NOT spawn subagents (one-pass autonomous work, kept your credit ceiling tight)

---

## Critical findings worth your attention

### 1. The waihanga six are stubs on prod

The single biggest finding in this analysis: **prod is running construction kete on 1.4-2.7 KB stub prompts**. Lovable has the full ~10-11 KB versions:

| Agent | Prod | Lovable | Ratio |
|---|---|---|---|
| pai | 1.4 KB | 10.9 KB | **7.88x** |
| rawa | 1.4 KB | 11.5 KB | **8.32x** |
| ata | 1.6 KB | 10.7 KB | **6.85x** |
| whakaae | 2.3 KB | 11.7 KB | **5.00x** |
| kaupapa | 2.7 KB | 11.7 KB | **4.32x** |
| arai | 2.8 KB | 11.5 KB | **4.14x** |

This is Phase 3 work for Reo — but until that lands, the Waihanga (construction) kete is operating on minimal prompts. **High-priority for Reo's queue.**

### 2. Prod has its own casing drift

Not just Lovable. Prod has 6 agents under `pack='AKO'` (uppercase) and 4 under `pack='HOKO'`. Phase 5 fixes both.

### 3. Tōro is 80% incomplete on prod

Prod has only `toro` (the parent, inactive after PR #122), `holiday-ideas`, `kid-money`, `term-planner` (new from PR #117). Missing: 8 sub-agents (education, email, family, health, home, homework, logistics, money) — Phase 2 ports these.

### 4. The Bucket A prompts all have brand drift

Every single one has capital-A "Assembl". The Tōro parent has 3 instances of "SMS-first" (violates email-first canon post PR #117). **This is why everything lands as `is_active=FALSE`** — Reo's editorial pass cleans it all in Phase 3 before flipping live.

---

## Open questions for when you're back

1. **Phase 3 timing** — Want Reo to start the moment Phase 2 merges, or wait for a specific time window?
2. **GitHub toolkit access** — Authorise me to push the 4 new PRs, or do you want to land them manually from `sql/`?
3. **Cowork's 3 audit decisions** — Q1 Arataki (Tourism vs Automotive), Q2 Ako (Education vs Early Childhood), Q3 Tōro page positioning — still queued from this morning. These affect what Reo writes in Phase 3 for `ako` and `arataki`. Decide before Reo starts.
4. **Reactivating Tōro sub-agents** — After Reo's pass, flip 9 toro agents to is_active=TRUE in one go, or stagger?

---

## Thread Context Doc

Working doc updated with full session state. See `[[DOCUMENT_3ohj09bl]]` for plan progress and the running findings list.

---

## File list summary (everything I produced)

```
/agent/workspace/runbook-2026-05-13/
├── 00_WELCOME_BACK.md                       (this file, ~10 KB)
├── RUNBOOK.md                               (consolidated 5-PR plan, ~9 KB)
├── analysis/
│   └── THREE-BUCKET-DIFF.md                 (port/merge/skip analysis, ~8 KB)
├── briefs/
│   └── REO-EDITORIAL-MERGE-BRIEF.md         (13-prompt merge brief, ~13 KB)
└── sql/
    ├── 00_phase5_casing_normalisation.sql   (~3 KB)
    ├── 01_phase2_toro_subagents_port.sql    (~20 KB)
    ├── 02_phase4a_tool_registry_port.sql    (~52 KB)
    └── 03_phase4b_agent_toolsets_fill.sql   (~34 KB)
```

Plus all Lovable export staged at `/agent/workspace/lovable-export-2026-05-13/`.
