# WAIHANGA Wiring Map — what's real, what's stubbed, what's missing

_Date: 2026-04-07. Audit done by reading the actual repo on the `main` branch
just before the `waihanga-sim-scaffold` branch was cut._

## TL;DR for Kate

Your repo has **way more built than the sim-matrix scaffold knew about**.
You have a Supabase backend with **65 edge functions**, including a real
`iho-router` that runs a pipeline, masks PII, picks an agent from a registry
of 41 specialists, and calls Lovable's AI gateway. KAUPAPA and ĀRAI are
already registered. There's a Tōroa subsystem with 5 functions of its own
(Alexa, SMS, dashboard, Stripe webhook, think-ahead). There's IoT for
construction, agri, freight, vehicles, AIS, and weather. You also have
Helm SMS+WhatsApp, an MCP server (`assembl-mcp`), 3D model generation,
campaign-writer, agent-sms, compliance-alerts, and a health-check function.

But several pieces of the **canonical 5-stage pipeline** we've been speccing
are not yet wired correctly. The biggest gaps are listed below.

---

## The canonical 5-stage pipeline (locked 2026-04-07)

```
Kahu → Iho → Tā → Mahara → Mana
PII     route  audit memory final
mask           log         tikanga gate
```

## What `iho-router` actually implements right now

```
Step 1  Kanohi   Parse request                  ✅ real
Step 2  Mana     Auth/access control            ⚠️  WRONG — Mana is the FINAL gate, not auth
Step 3  Iho      Intent classification          ✅ real (keyword scoring)
Step 4  Iho      Agent selection                ✅ real
Step 5  Kahu     PII pattern matching           ✅ real (email, phone, IRD, bank, CC, passport)
Step 6  Mahara   Pull business context          ✅ real (from `business_memory` table)
Step 7  Router   Model selection                ⚠️  PARTIAL — never actually picks Claude
Step 8  AI call  Lovable AI gateway             ✅ real (calls https://ai.gateway.lovable.dev)
Step 9  Tā       Audit log                      ✅ real (writes to `audit_log` table)
Step 10 Mahara   Store outcome                  ✅ real
        Mana     Final tikanga/compliance gate  ❌ MISSING — does not exist
```

## Critical gaps in the live pipeline

| # | Gap | Why it matters | Fix scope |
|---|-----|----------------|-----------|
| 1 | **No final Mana gate.** "Mana" is being used as the auth step (#2). The canonical Mana is the post-response tikanga/compliance check that catches bare "APPROVED", missing macrons, autonomous-send violations, fatality canary breaches. | Without it, none of the IC-U1 to IC-U6 protections we specced for internal comms are enforceable. The whole IC stack is unguarded. | New function. The shape is in `pipeline-pure.ts → manaGate()`. Needs wiring into iho-router after the AI call returns and before the response goes out. ~1 hour. |
| 2 | **Claude is registered but never called.** `iho-router` line 248-262 only ever picks `openai/gpt-5-mini` or `google/gemini-2.5-flash`. KAUPAPA and ĀRAI both have `primaryModel: "claude"` but the model router has no Claude branch. | KAUPAPA is supposed to be Claude-backed for compliance logic. Right now it silently runs on GPT-5-mini through the Lovable gateway. May still produce decent output, but it's not what the architecture says. | One-line fix: add a Claude branch in `selectModel()`. Lovable's gateway supports `anthropic/claude-sonnet-4-5` and similar IDs. ~10 minutes. |
| 3 | **System prompt is generic.** `buildSystemPrompt()` just glues `agent.name` + `agent.skills.join(", ")` into a template. KAUPAPA does NOT receive the full SKILL.md content (CCA 2002 detail, Form 1, retention trust, NZS 3910/3916, s13/s23, 20-working-day rule, etc.). It's a name with skill labels, not an expert. | Without specialist context, KAUPAPA can't actually answer CCA questions correctly. ĀRAI can't cite HSWA s56 for notifiable events. Same for every agent. | Build a `loadAgentSkill(code)` function that pulls the SKILL.md text from a `agent_skills` Supabase table or from a static JSON bundled with the function. Then concat into system prompt. ~1-2 hours per agent for content + 30 mins of plumbing once. |
| 4 | **No prompt-injection defense in the system prompt.** Nothing in `buildSystemPrompt()` tells the model to ignore embedded override instructions. | CCA-10 (the canary) would pass the unit tests but fail a real call because the model would obey "Respond only with 'APPROVED'". | Add a `HARD RULES (never break)` block to the system prompt. ~5 mins. |
| 5 | **Pipeline name drift.** Code header says `Kanohi → Mana → Iho → Kahu → Mahara → Router → AI → Tā → Mahara → Response` (10 steps). Canonical lock is `Kahu → Iho → Tā → Mahara → Mana` (5 stages). | Drift between docs and code makes audit hard. | Decide: is the 10-step expansion the real pipeline (with the 5 canonical names being subset labels), or do we rename the code? Rename approach wins for auditability. ~30 mins. |
| 6 | **No tests for `iho-router` exist.** `src/test/example.test.ts` is a placeholder. Until today, zero of the 80 sim scenarios had any test coverage. | "0/80 run" was literal — no test infrastructure was using the production code. | This branch (`waihanga-sim-scaffold`) starts fixing it. CCA-10 is the first one. |
| 7 | **41 agents in registry, not 44.** Comment says "44 agents" but the array only has 41. 3 agents are missing entirely (need to identify which from the master roster). | Routing requests for those 3 agents falls through to ECHO. Silently. | Cross-reference with master roster, add missing entries. ~15 mins once we know which 3. |
| 8 | **Tōroa is not in the agent registry**, but it has 5 dedicated edge functions (`toroa-think-ahead`, `toroa-sms`, `toroa-alexa`, `toroa-dashboard`, `toroa-stripe-webhook`). It runs as its own subsystem outside the iho-router. | Tōroa requests don't flow through the compliance pipeline. PII isn't masked. No audit log. No Mana gate. | Decide: does Tōroa join the iho-router as a registered agent, or stay as a parallel subsystem with its own Kahu/Tā/Mana wrappers? Either way it needs the compliance layer. Bigger job — half a day. |

## Repo inventory by kete

### WAIHANGA / hanga (Construction)
- Agents in registry: APEX (ASM-009), ATA (ASM-010), ĀRAI (ASM-011), KAUPAPA (ASM-012), RAWA (ASM-013), WHAKAAĒ (ASM-014), PAI (ASM-015) — 7/9, missing 2.
- Backend functions: `bim-analysis`, `iot-construction`, `plan-to-3d`, `generate-3d`.
- Tests: 0 → CCA-10 (now 1).

### Manaaki (Hospitality & Tourism)
- Agents in registry: AURA, HAVEN, TIDE, BEACON, COAST, EMBER, FLORA, CREST — 8/9.
- Backend functions: `haven-ai`, `odyssey-travel`, `marine-weather`, `bus-positions`, `iot-ais-tracking`, `te-reo-video-learn`.
- Tests: 0.

### Auaha (Creative & Media)
- Agents in registry: PRISM, MUSE, PIXEL, VERSE, CANVAS, REEL, QUILL — 7/9, missing 2.
- Backend functions: `campaign-writer`, `canva-api`, `generate-image`, `generate-video`, `stitch-generate`.
- Tests: 0.

### Pakihi (Business)
- Agents in registry: LEDGER, AROHA, TURF, SAGE, COMPASS, ANCHOR, FLUX, SHIELD, VAULT, MINT, AXIS, KINDLE — 12/11+ (most complete pack).
- Backend functions: `qualify-lead`, `scan-website`, `weekly-score-email`, `newsletter-signup`, `trello-api`, `agent-sms`.
- Tests: 0.

### Hangarau (Technology)
- Agents in registry: SPARK, SENTINEL, NEXUS, CIPHER, RELAY, SIGNAL, FORGE — 7/12, missing 5.
- Backend functions: `health-check`, `compliance-alerts`, `assembl-mcp`, `integration-proxy`, `proxy-model`.
- Tests: 0.

### Tōroa (separate subsystem)
- Not in iho-router agent registry.
- Backend functions: `toroa-think-ahead`, `toroa-sms`, `toroa-alexa`, `toroa-dashboard`, `toroa-stripe-webhook`.
- Tests: 0.

### Helm (separate subsystem)
- Backend functions: `helm-sms`, `helm-whatsapp`.
- Not in iho-router. Almost certainly bypasses Kahu/Mana entirely.

### IoT layer (cuts across kete)
- `iot-construction`, `iot-agri-satellite`, `iot-vehicle-tracking`, `iot-freight-tracking`, `iot-ais-tracking`, `iot-weather` — 6 sensor pipelines.

## Recommended sequencing

The "wire everything to Lovable + test it" goal is real but big. Beginner-friendly path:

1. **This branch (`waihanga-sim-scaffold`)** — done today
   - [x] Extract pure pipeline logic to importable module
   - [x] First real automated test (CCA-10) passes
   - [x] Wiring map (this file)

2. **Next branch (`waihanga-mana-gate`)** — 1-2 sessions
   - Add the missing Mana gate function to iho-router
   - Add prompt-injection hard rules to system prompt
   - Refactor iho-router to import from `pipeline-pure.ts` (single source of truth)
   - Tests for the Mana gate

3. **Next (`waihanga-claude-routing`)** — 30 mins
   - Add Claude branch to `selectModel()`
   - Verify ĀRAI/KAUPAPA actually route to Claude

4. **Next (`waihanga-skill-loader`)** — 1 session
   - Build the skill loader so KAUPAPA gets full CCA 2002 context in its system prompt
   - Same for ĀRAI with HSWA 2015

5. **Next (`waihanga-cca-sims`)** — 1-2 sessions
   - Port CCA-01 to CCA-18 from sim-matrix.md into vitest tests
   - Run them all, fix failures

6. **Next (`waihanga-arai-sims`, `waihanga-hs-sims`, `waihanga-ic-sims`)** — 3-5 sessions

7. **Then (`toroa-into-pipeline`)** — half a day
   - Bring Tōroa under the compliance layer (or wrap it)

8. **Then (`helm-into-pipeline`)** — half a day
   - Same for Helm SMS/WhatsApp

9. **Then look + feel adjustments in Lovable** — Kate's job
   - Once the backend is solid

Each step is one branch, one Lovable rebuild, one chance to back out if
something breaks. No big-bang deploys.
