# Meeting DO — capture → smart notes

Surface: `/do/meetings` (phone: `/do/meetings?phone=1`).

## Pipeline

1. **Capture** — MediaRecorder (mic or shared meeting audio). Local until share. No sign-in required to record or download.
2. **Whisper-class STT** — `POST /api/do/meetings/transcribe` → Deepgram nova-2 `en-NZ` when `DEEPGRAM_API_KEY` is set. Paste-notes fallback otherwise.
3. **Granola-class smart notes** — `POST /api/do/prepare` with task `meeting-notes`. Produces clean notes, decisions, action items (owners/dates only if stated), open questions, suggested specialist DO drafts, optional follow-up email draft.
4. **Review** — polished notes surface; editable text; explicit review checkbox before handoff. Drafts only — never auto-send.

## Honesty gates

- Sign-in required for transcribe and smart notes.
- Deepgram configuration is checked and stated in the UI.
- Separate consent for audio→Deepgram and transcript→model.
- Owners and dates must appear in the source; the agent must not invent them.
- `?previewNotes=1` seeds a **layout-only** sample review surface (banner states no model was called). For visual QA when preparation is unavailable — not a generation claim.

See also: `docs/reviews/2026-09-16-meeting-do.md`, `docs/do-templates/DO-DISTRIBUTION.md`.
