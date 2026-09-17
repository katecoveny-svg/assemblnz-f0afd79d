# Meeting DO — capture → smart notes

Surface: `/do/meetings` (phone: `/do/meetings?phone=1`).

## Pipeline

1. **Capture** — MediaRecorder (mic or shared meeting audio). Local until share. No sign-in required to record or download.
2. **Whisper-class STT** — `POST /api/do/meetings/transcribe` → Deepgram nova-2 `en-NZ` with diarisation + utterances when `DEEPGRAM_API_KEY` is set. Returns speaker-labelled transcript when available. Paste-notes fallback otherwise.
3. **Granola-class smart notes** — `POST /api/do/prepare` with task `meeting-notes`. Produces clean notes, **attendees** (named or Speaker N), decisions, action items (owners/dates only if stated), open questions, suggested specialist DO drafts, optional follow-up email draft.
4. **Review** — polished notes surface; editable text; explicit review checkbox before handoff. Drafts only — never auto-send.

## Honesty gates

- Sign-in required for transcribe and smart notes.
- Deepgram configuration is checked and stated in the UI (`GET /api/do/meetings/transcribe` → `{ configured }`).
- Separate consent for audio→Deepgram and transcript→model.
- Owners and dates must appear in the source; the agent must not invent them.
- `?previewNotes=1` seeds a **layout-only** sample review surface (banner states no model was called). Fictional names only — not a generation claim.

## Ops / Vercel env

| Variable | Required for | Notes |
|---|---|---|
| `DEEPGRAM_API_KEY` | Live transcription | Server-only. Without it, Meeting DO still records/downloads/pastes; Transcribe returns honest 503. |
| Model ladder credentials used by `/api/do/prepare` | Smart notes generation | Same DO preparation ladder as other DO tasks. Without models, paste + preview path still work. |

Do **not** invent secrets. Set `DEEPGRAM_API_KEY` in Vercel project env (Production + Preview) when Deepgram credit is available.

See also: `docs/reviews/2026-09-16-meeting-do.md`, `docs/ENVIRONMENT.md`, `docs/do-templates/DO-DISTRIBUTION.md`.
