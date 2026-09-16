# DO Meet — Architecture

**Status:** Engineering shape for implementers (v0 draft)  
**Locale:** NZ English  
**Constraint:** Prefer Action Cloud Phase 1 primitives when present; do not fork authority.

---

## 1. Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Web app | **Next.js + React + TypeScript** | Align with Assembl monorepo |
| Desktop | **Electron + Recall Desktop SDK** | Bot-free Capture (Recall.ai = reference vendor) |
| Hosted media (Phase 2) | **LiveKit Cloud** | Mode A rooms |
| Speech | **SpeechProvider** abstraction | STT/diarisation vendor behind interface |
| Data | **Supabase** (Postgres + Auth + storage as needed) | Tables below |
| Action layer | **DO Action Cloud** | Permit / Wait / Receipt / Contract |
| Agents | Assembl agent runtime / edge functions | Propose only; DO executes |

Adjust package names to the host monorepo; keep interfaces stable.

---

## 2. Suggested repo layout

```text
docs/do-meet/                     # this package
docs/do-action-cloud/             # sibling — Contract, Permit, Wait, Receipt
app/(do-meet)/                    # routes: home, meeting, queue
app/api/do/meet/                  # meet-specific APIs
app/api/do/action/                # shared Action Cloud stages (if not already)
lib/do/meet/
  types.ts
  meeting.ts
  understand.ts
  jobs.ts
  memory.ts
  speech/provider.ts              # SpeechProvider interface
  speech/adapters/                # deepgram | whisper | recall | mock
  capture/desktop.ts
  capture/bot.ts
  livekit/                        # Phase 2
lib/do/action-contract/           # shared with Action Cloud
packages/do-meet-desktop/         # Electron shell
supabase/migrations/
  YYYYMMDD_do_meet_meetings.sql
  YYYYMMDD_do_meet_transcripts.sql
  YYYYMMDD_do_meet_jobs.sql
  YYYYMMDD_do_meet_memory.sql
demos/do-meet/
```

---

## 3. SpeechProvider abstraction

```ts
export interface SpeechProvider {
  name: string
  startSession(opts: SpeechSessionOpts): Promise<SpeechSession>
}

export interface SpeechSession {
  pushAudio?(chunk: Uint8Array): void
  /** For file / vendor-managed streams */
  attachExternalTranscript?(stream: AsyncIterable<TranscriptSegment>): void
  stop(): Promise<TranscriptResult>
}

export interface TranscriptSegment {
  seg_id: string
  start_ms: number
  end_ms: number
  speaker_label: string | null
  text: string
  confidence?: number
}
```

Rules:

- Work engine depends on `TranscriptSegment[]`, never on a vendor SDK  
- Desktop Capture and bot fallback both normalise into the same shape  
- LiveKit media (Phase 2) feeds the same provider or a LiveKit-aware adapter  

---

## 4. Tool interface (aligned with Action Contract)

Every consequential executor implements:

```ts
interface DoTool {
  discover?(): Promise<ActionContractMeta>
  prepare(input: unknown, idempotencyKey: string): Promise<{ prep_id: string; args_hash: string }>
  execute(prep_id: string, permit_id: string): Promise<ExecuteResult>
  verify(action_id: string): Promise<{ passed: boolean; evidence_ids: string[] }>
  undo?(action_id: string): Promise<UndoResult>
}
```

Map onto Action Cloud lifecycle:

```
discover → inspect → quote/dry-run → prepare → permit → execute → wait → verify → receipt → undo/escalate
```

| Tool method | Contract stage |
|-------------|----------------|
| discover | discover / inspect |
| prepare | prepare (lock args) |
| (DO Core) | permit |
| execute | execute |
| (DO Core / tool) | wait |
| verify | verify |
| (DO Core) | receipt |
| undo | undo / escalate |

**Do not** let Meet tools call third-party APIs with user OAuth tokens outside prepare→permit→execute.

---

## 5. Mapping DO Jobs → Action Cloud Phase 1

If Action Cloud Phase 1 exists (`docs/do-action-cloud/IMPLEMENTATION_ROADMAP.md`):

| DO Meet concept | Action Cloud artefact |
|-----------------|----------------------|
| DO Job row | Action run + Meet metadata (`meeting_id`, `span_refs`) |
| Job `prepared` | `prep_id` + `args_hash` |
| Approval SAFE/REVIEW/RESTRICTED | Permit policy + risk_class bridge |
| Human queue | Wait (`kind: human_approval`) |
| Completion | verify + receipt |
| Memory write | Post-receipt hook (not a substitute for receipt) |

If Phase 1 is **not** present yet:

1. Implement Meet job table with columns reserved for `prep_id`, `permit_id`, `receipt_id`, `wait_id`  
2. Stub permit as explicit user click storing `permit_id`  
3. Migrate stubs to DO Core without rewriting UX  

---

## 6. Supabase tables (v0)

Names illustrative; use migrations + RLS per tenant.

### 6.1 `do_meet_meetings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | `meeting_id` |
| tenant_id | uuid | RLS |
| title | text | |
| mode | text | `hosted` \| `capture` \| `voice` \| `hybrid` |
| calendar_event_id | text null | |
| external_platform | text null | `meet` \| `zoom` \| `teams` \| … |
| scheduled_start | timestamptz | |
| scheduled_end | timestamptz | |
| actual_start | timestamptz null | |
| actual_end | timestamptz null | |
| consent_captured | boolean | |
| status | text | `scheduled` \| `live` \| `processing` \| `assembled` \| `closed` |
| created_by | uuid | |
| created_at / updated_at | timestamptz | |

### 6.2 `do_meet_participants`

| Column | Type |
|--------|------|
| id | uuid PK |
| meeting_id | uuid FK |
| user_id | uuid null |
| display_name | text |
| email | text null |
| speaker_label | text null |
| role | text null |

### 6.3 `do_meet_transcripts`

| Column | Type |
|--------|------|
| id | uuid PK |
| meeting_id | uuid FK |
| provider | text |
| full_text | text null |
| created_at | timestamptz |

### 6.4 `do_meet_transcript_segments`

| Column | Type |
|--------|------|
| id | uuid PK |
| transcript_id | uuid FK |
| start_ms | int |
| end_ms | int |
| speaker_label | text null |
| text | text |
| confidence | real null |

### 6.5 `do_meet_understandings`

| Column | Type |
|--------|------|
| id | uuid PK |
| meeting_id | uuid FK |
| decisions | jsonb |
| promises | jsonb |
| deltas | jsonb |
| blockers | jsonb |
| model_meta | jsonb |
| created_at | timestamptz |

### 6.6 `do_meet_jobs`

| Column | Type |
|--------|------|
| id | uuid PK |
| meeting_id | uuid null |
| tenant_id | uuid |
| title | text |
| type | text |
| risk_tier | text | `safe` \| `review` \| `restricted` |
| state | text |
| source | jsonb |
| context_pack | jsonb |
| assignee_agent | text null |
| prep_id | text null |
| permit_id | text null |
| wait_id | text null |
| action_id | text null |
| receipt_id | text null |
| evidence_ids | jsonb |
| created_at / updated_at | timestamptz |

### 6.7 `do_meet_memory_items`

| Column | Type |
|--------|------|
| id | uuid PK |
| tenant_id | uuid |
| kind | text | `promise` \| `decision` \| `blocker` \| `note` |
| body | text |
| owner_user_id | uuid null |
| counterparty | text null |
| meeting_id | uuid null |
| job_id | uuid null |
| span_refs | jsonb |
| receipt_id | text null |
| status | text | `open` \| `kept` \| `broken` \| `superseded` |
| due_at | timestamptz null |
| created_at / updated_at | timestamptz |

### 6.8 Reuse Action Cloud tables when present

Prefer existing:

- `do_permits` / `do_receipts` / `do_waits` / `do_action_runs`  

Meet jobs store foreign keys rather than duplicating permit rows.

---

## 7. Realtime & processing flow

1. **Capture session** starts (desktop / bot / voice / Phase 2 LiveKit)  
2. Audio → SpeechProvider → segments appended  
3. On end (or Live DO trigger): Understand agent runs (async job)  
4. Jobsmith emits `do_meet_jobs` in `proposed`  
5. UI “Meeting assembled” / Live DO card  
6. User DO ALL / selective → `prepare` each tool  
7. Policy → auto permit (SAFE) or Wait human (REVIEW/RESTRICTED)  
8. `execute` → optional `wait` → `verify` → `receipt`  
9. Memory items upserted; promises close when receipts say so  

Idempotency: client supplies keys per job execute; retries safe.

---

## 8. Desktop (Electron) notes

| Concern | Approach |
|---------|----------|
| Detector | Watch known Meet/Zoom/Teams processes / window titles (**OS-specific; TBD precision**) |
| Overlay | Note window; does not steal focus aggressively |
| Capture | Recall Desktop SDK when licensed; else degraded paste/upload path for dev |
| Auth | Device code / existing Assembl session — no embed of refresh tokens in renderer |
| Updates | Standard Electron update channel (**TBD**) |

Dev without vendor SDK: fixture WAV + mock SpeechProvider must unlock the full work-engine demo.

---

## 9. Security & privacy

| Rule | Practice |
|------|----------|
| Least authority | Tools only run under permit |
| Separation | LLM proposes jobs; DO executes |
| PII | Transcripts tenant-scoped; retention policy hooks |
| Consent | `consent_captured` required before durable media store (**policy TBD**) |
| Export / delete | Plan GDPR/Privacy Act deletion paths early |
| No invented auth | OAuth agent delegation / AuthZEN interop via Action Cloud |

---

## 10. Observability

- Per-meeting pipeline stages with timings  
- Job state transitions  
- VAR inputs for meeting-originated actions (when Action Cloud metric exists)  
- Capture failure reasons (detector miss, bot denied, STT error)  

---

## 11. Non-architecture (do not build)

- Hard-coding a single STT vendor into job code  
- Executing Gmail/Calendar from the Understand prompt directly  
- Storing only summaries without segment-level evidence  
- A second permit system beside Action Cloud  
- Claiming LiveKit/Recall production wiring in docs before code exists  
