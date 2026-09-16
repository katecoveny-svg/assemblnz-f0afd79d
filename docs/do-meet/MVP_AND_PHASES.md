# DO Meet — MVP and Phases

**Status:** Scope plan for build agents  
**Locale:** NZ English  
**Rule:** Native hosted video is **not** an MVP blocker. The work engine is.

---

## Guiding cut

| Build first | Defer |
|-------------|-------|
| Understand → Jobs → Approve → Verify → Remember | Polished Mode A rooms |
| Capture good enough to feed the engine | Commodity summary race |
| Desktop Capture + thin Voice | Full mobile suite |
| Action Contract alignment | Parallel “job runtime” that ignores Permit/Receipt |

---

## Phase 1 — MVP (work engine)

**Goal:** A user can leave an external meeting (or paste/voice input) and get **typed DO Jobs** that prepare, wait for approval when needed, execute, verify, and receipt — with Memory write-back.

### 1.1 Capture

| Capability | MVP requirement |
|------------|-----------------|
| Calendar | List upcoming events; detect Meet / Zoom / Teams links |
| External meetings | Capture path for Google Meet, Zoom, Teams (desktop detector) |
| In-person / no link | Mic / voice capture or paste transcript fallback |
| Transcript | Durable transcript store with timestamps |
| Speakers | Best-effort diarisation; allow manual rename |
| Bot-free preferred | Recall.ai Desktop SDK path when available (**reference** vendor) |
| Bot fallback | Join-bot when desktop capture fails or policy requires |
| Consent | Explicit start/stop; visible recording state |

**Out of MVP:** LiveKit-hosted rooms as the only path; perfect diarisation; mobile-first capture.

### 1.2 Understand

| Capability | MVP requirement |
|------------|-----------------|
| Decisions | Extract explicit decisions |
| Promises | “I will / they will” with owner |
| Deltas | What changed vs prior meeting when Memory exists; else vs empty baseline |
| Blockers | Named blockers / waits |
| Job candidates | Ranked list with evidence spans (quotes) |

Summaries may exist as a **view**, not the primary artefact.

### 1.3 Remember

| Capability | MVP requirement |
|------------|-----------------|
| Per-meeting write | Decisions, promises, job IDs, receipt links |
| Query | “Open promises for person X / meeting series Y” |
| Provenance | Link memory items to transcript spans + receipts |

### 1.4 DO Jobs (must ship)

| Job type | Behaviour |
|----------|-----------|
| Email draft | Prepare draft with context pack; REVIEW to send |
| Calendar | Propose/create event |
| Task | Create Assembl (or stub) task |
| Pursuit update | Update opportunity fields / notes (**tenant-scoped**) |
| Brief / Studio trigger | Queue generation with meeting context |
| Approval queue | Human REVIEW / RESTRICTED surface |
| Receipts | Emit/link receipt on consequential completion |

Wire to Action Cloud Phase 1 (`prepare` / `permit` / `execute` / `wait` / `verify` / `receipt`) when present; otherwise implement thin compatible stubs and migrate — do not invent a divergent lifecycle.

### 1.5 Experience (MVP UI)

| Surface | Requirement |
|---------|-------------|
| Desktop detector | Know when a conferencing app/call is active |
| Note window | Thin during-call overlay |
| Post-meeting DO screen | “Meeting assembled” + job cards + DO ALL / selective |
| Approval queue | DO Home slice for REVIEW / RESTRICTED |
| Voice | Thin DO Voice → job draft (desktop) |

### 1.6 MVP non-goals

- Replacing Zoom/Meet as a video platform  
- Winning on summary quality alone  
- Full mobile apps  
- Ambient always-on enterprise capture  
- Unbounded SaaS connector sprawl  

### 1.7 MVP exit criteria

- [ ] External meeting (or paste transcript) → Understanding with evidence spans  
- [ ] ≥3 job types prepare successfully with locked args  
- [ ] REVIEW path blocks execute until permit  
- [ ] SAFE path can auto-permit under policy  
- [ ] Receipt (or stub receipt row) on success  
- [ ] Memory query returns promises from ≥2 meetings  
- [ ] No claim of LiveKit-hosted Mode A required to demo  

---

## Phase 2 — Hosted meetings & depth

**Goal:** Mode A + richer Experience + shared Memory.

| Workstream | Outcome |
|------------|---------|
| LiveKit-hosted DO Meet | Assembl-owned rooms; native Live DO |
| Mobile | Capture / approve / voice on iOS/Android (**TBD** stack) |
| Briefs | First-class brief artefacts from meetings |
| Shared Memory | Team-visible promises/decisions with ACL |
| Better diarisation / speakers | Higher quality Understand inputs |
| Connector hardening | Gmail send-under-permit, Calendar write, Pursuit deep link |
| Studio loop | Meeting → brief → Studio → receipt back to Memory |
| Consent & retention | Policy console; retention TTLs (**legal TBD**) |

### Phase 2 exit criteria (draft)

- [ ] Host a Mode A meeting end-to-end  
- [ ] Live DO mid-call prepares ≥2 job types  
- [ ] Shared Memory ACL respected in tests  
- [ ] Mobile approve path for REVIEW jobs  

---

## Phase 3 — Ambient enterprise DO

**Goal:** Meetings and voice are continuous sensors for the organisational work graph.

| Workstream | Outcome |
|------------|---------|
| Ambient enterprise | Policy-gated continuous / scheduled capture norms |
| Org work graph | Cross-team jobs, SLAs, escalation |
| Agent fleets | More specialists; A2A where useful |
| NZ / vertical rails | Pursuit + DO Action Cloud NZ adapters as they verify |
| Compliance packs | Exportable evidence for audit |
| VAR feedback | Meeting-originated actions contribute to Verified Action Rate |

Mark ambient features carefully in GTM — consent and trust are product, not afterthoughts.

---

## Quality bar checklist

Use before calling any build “demo-ready” or “shipped”.

### Product

- [ ] Jobs are primary; summary is secondary  
- [ ] Every proposed job shows evidence (span/quote)  
- [ ] SAFE / REVIEW / RESTRICTED behaviour matches policy table  
- [ ] DO ALL never silently executes RESTRICTED  
- [ ] NZ English in user-facing copy  
- [ ] No purple AI cliché UI; Assembl plum/rose/off-white  

### Engineering

- [ ] SpeechProvider behind an interface (vendor-swappable)  
- [ ] Job lifecycle aligns with Action Contract stages  
- [ ] Idempotency keys on execute  
- [ ] Permits short-lived; args hashed  
- [ ] Receipts append-only (or explicit stub labelled)  
- [ ] No long-lived LLM-held secrets  
- [ ] Transcript/PII retention hooks present even if policy TBD  

### Honesty

- [ ] Docs/UI do not claim live vendors we have not wired  
- [ ] Mode A clearly Phase 2 if not built  
- [ ] Hui/Hapai legacy not marketed as DO Meet until ported  

### Demo

- [ ] `DEMOS.md` scripts runnable with fixtures if live capture unavailable  
- [ ] Failure path shown (deny permit / verify fail)  

---

## Suggested sequencing for coding agents

1. Schema: Meeting, Transcript, Understanding, DO Job, Memory item  
2. Understand + Jobsmith offline on fixture transcripts  
3. Approval queue UI + permit stubs  
4. Email draft + Calendar + Task executors (mock then real)  
5. Desktop detector + Capture integration spike  
6. Post-meeting “assembled” screen  
7. Memory queries  
8. Only then LiveKit Mode A  

Details: `ARCHITECTURE.md`, `CODEX.md`.
