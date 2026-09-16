# CODEX.md — DO Meet agent continuation brief

Short instructions for coding agents continuing **DO Meet** work **without chat history**.

**Locale:** NZ English  
**Working name:** DO Meet  
**One-liner:** Talk. Decide. DO.

---

## Product distinctions (never blur)

| Brand | Meaning |
|-------|---------|
| **Assembl** | Enterprise orchestration — make the organisation agent-ready |
| **DO** | Safe action layer — know → prepare → permit → do → verify |
| **Pursuit** | First vertical — find / assemble / submit work (tenders) |
| **DO Meet** | Meeting-to-execution system **under DO** — not a standalone note-taker |

---

## Build this first

**Work engine first.**

Transcription and conferencing are **infrastructure**.  
Summaries are **commodity**.

Proprietary layer:

> **understand what changed → identify → assemble context → route → do → approve → verify → remember**

Order:

1. Meeting / transcript / understanding / job / memory schemas  
2. Understand + Jobsmith on **fixture** transcripts  
3. Tool interface `prepare / execute / verify / undo` aligned with Action Contract  
4. SAFE / REVIEW / RESTRICTED → Permit / Wait  
5. Email draft, Calendar, Task, Pursuit update, Brief/Studio trigger, Receipts  
6. Post-meeting “Meeting assembled” + approval queue UI  
7. Desktop detector + Capture spike (Recall Desktop SDK = reference)  
8. Thin DO Voice  
9. **Only then** LiveKit-hosted Mode A  

Native video is **not** an MVP blocker (`MVP_AND_PHASES.md`).

---

## Action Cloud coupling

Read sibling package when present:

```text
docs/do-action-cloud/
  README.md
  DO_ACTION_CLOUD.md
  ACTION_CONTRACT_SPEC.md
  IMPLEMENTATION_ROADMAP.md
  CODEX.md
```

Lifecycle to honour:

```
discover → inspect → quote/dry-run → prepare → permit → execute → wait → verify → receipt → undo/escalate
```

If Phase 1 tables/APIs exist, **map DO Jobs onto them**. Do not invent a second authority model.

---

## Non-goals

- Do **not** treat better summaries as the product  
- Do **not** block MVP on LiveKit-hosted meetings  
- Do **not** build commodity SaaS connector sprawl  
- Do **not** execute side effects from the LLM without prepare → permit  
- Do **not** invent auth protocols  
- Do **not** claim live Recall.ai / LiveKit / Granola / Wispr integrations without code  
- Do **not** ship purple “AI notes” cliché UI — Assembl plum/rose/off-white, Jost/Assembl type  
- Do **not** confuse Hui/Hapai legacy with shipped DO Meet (reuse code carefully; rebrand intentionally)  
- Do **not** assert production DO Meet in copy from this brief alone  

---

## Vendor references (wording)

Say: “reference / planned adapter for LiveKit, Recall.ai, …”  
Do **not** say: “we use Granola/Wispr” unless a real integration exists.  
Plain names only — no fake footnotes or cite tokens.

---

## Read order

1. **This file** (`CODEX.md`)  
2. `README.md` — thesis + four modes + Action Cloud link  
3. `MVP_AND_PHASES.md` — scope cuts + quality bar  
4. `DO_MEET_PRODUCT.md` — full product behaviour  
5. `ARCHITECTURE.md` — stack, tables, tool interface  
6. `DEMOS.md` — acceptance demos  
7. `docs/do-action-cloud/*` — Contract / Permit / Wait / Receipt  

---

## Where files live

Documentation package (this set):

```text
/workspace/do-meet-package/
  README.md
  DO_MEET_PRODUCT.md
  MVP_AND_PHASES.md
  ARCHITECTURE.md
  CODEX.md
  DEMOS.md
```

Suggested host path:

```text
docs/do-meet/
```

---

## Definition of progress

A useful PR moves the **work engine** forward (schema, understand→jobs, permit path, one real or mock executor, assembled UI, or memory query).  
A PR that only tweaks summary prose without jobs is **not** progress on DO Meet.
