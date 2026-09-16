# DO Meet — Demos

**Status:** Demo scripts for product/engineering  
**Locale:** NZ English  
**Rule:** Prefer fixture transcripts if live Capture is unavailable. Do not fake vendor claims in the demo narrative.

---

## Demo principles

1. Lead with **work assembled**, not “AI summary”.  
2. Show **evidence** (quote/span) on every job card.  
3. Show **REVIEW** gating at least once.  
4. End on **receipt / memory**, not on a markdown dump.  
5. If Capture is stubbed, say so once — then run the real work engine.

---

## Demo 1 — End of meeting: “Meeting assembled” + DO ALL

**Story:** External Zoom pursuit call ends; DO Meet turns talk into governed work.

### Setup

- Fixture: 12–15 min transcript (client + Kate), speakers labelled  
- Prior Memory: one open promise from last meeting  
- Connectors: mock or sandbox email + calendar + Pursuit  

### Script

1. **Before** — DO Home shows the open promise (“Send capability outline”).  
2. **During** (optional sped-up) — thin note window; no focus on transcript wall.  
3. **End** — **Meeting assembled** screen:  
   - What changed (includes prior promise status)  
   - Decisions (2–3 explicit)  
   - Jobs (5): email draft, Pursuit update, calendar hold, Studio brief trigger, task  
4. Expand one job → evidence quote visible.  
5. Risk badges: mix of SAFE and REVIEW.  
6. Click **DO ALL** (SAFE auto; REVIEW confirms in-sheet).  
7. Watch states: prepared → permitted → executing → verifying → completed.  
8. Open a **Receipt**; show Memory: prior promise marked kept / still open correctly.

### Pass criteria

- [ ] Summary is not the hero UI  
- [ ] DO ALL does not execute a RESTRICTED job if one is planted  
- [ ] Receipt IDs exist for consequential jobs  
- [ ] Memory reflects outcomes  

### Failure demo (60s)

Deny one REVIEW permit → job stays `awaiting_permit`; others complete. Trust > magic.

---

## Demo 2 — Live DO mid-call: “Build that”

**Story:** In-call intent becomes a prepared Studio/brief job without breaking conversation.

### Setup

- Live or recorded call clip where client says “Can you build that page?”  
- Live DO listener armed (Mode B overlay or Mode A when available)  

### Script

1. Join / play call; overlay visible but quiet.  
2. Utterance: **“Build that.”** (or full sentence about the capability page).  
3. Live DO card appears: **Brief / Studio trigger** — REVIEW — evidence span attached.  
4. Kate taps **Prepare**; context pack shows meeting title, client name, quoted ask.  
5. Does **not** auto-run Studio until permit.  
6. Approve → execute → Studio/brief queued → receipt links back to meeting.

### Pass criteria

- [ ] Mid-call prepare works without ending the meeting  
- [ ] No silent external side effects pre-permit  
- [ ] Job appears later on Meeting assembled if call continues  

### Narration cue

“Live DO prepares work. DO still permits it.”

---

## Demo 3 — Cross-meeting: “What did I promise?”

**Story:** Mode D Memory is operational, not a chat log.

### Setup

- ≥2 meetings in series with same counterparty  
- Mix of open / completed promises; one completed via receipt from Demo 1  

### Script

1. DO Home or Memory view → query: **“What did I promise?”** (filter: counterparty / this week).  
2. List shows owners, due dates, source meeting titles.  
3. Click one open promise → jump to transcript span + related DO Job.  
4. Click one kept promise → receipt proof.  
5. Optional: “What changed since last meeting?” pulls deltas into prep for the next call.

### Pass criteria

- [ ] Answers cite meetings and spans  
- [ ] Kept vs open is receipt-aware  
- [ ] No hallucinated promises not in Memory store  

---

## Fixture pack (engineering)

Ship under `demos/do-meet/` when implementing:

| Fixture | Purpose |
|---------|---------|
| `transcripts/pursuit-zoom-01.json` | Demo 1 segments |
| `memory/prior-promises.json` | Seed Memory |
| `jobs/expected-jobsmith.json` | Golden Jobsmith output |
| `policies/risk-map.json` | SAFE/REVIEW/RESTRICTED mapping |

Mock SpeechProvider replays segments with realistic timing.

---

## Audience variants

| Audience | Emphasise |
|----------|-----------|
| Engineering | Lifecycle + idempotency + deny path |
| Design | Assembled screen, typography, non-cliché UI |
| Pursuit GTM | Client call → Pursuit update + brief → receipt |
| Security | Permit, args hash, no LLM-held tokens |

---

## Anti-demos (do not show as success)

- Wall of transcript with no jobs  
- “Summary looks nice” as the closer  
- Auto-sending email without REVIEW  
- Claiming Granola/Wispr/LiveKit as already embedded when using fixtures only  
