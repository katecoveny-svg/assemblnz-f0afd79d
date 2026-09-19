# Meeting DO follow-through

Status: review branch. This is a bounded extension of Meeting DO, not completion of DO Meet.

## Objective and authority

Turn reviewed meeting notes into specific useful outputs on `/do/meetings`, preserving the focused plum/rose interface. Reuse the existing operator action queue, local DO task store and smart-note parser. No new database schema, account permissions, provider settings or public navigation.

Canonical context: `AGENTS.md`, `START_HERE.md`, `docs/context/CURRENT.md`, `docs/context/README.md`, `docs/factory/PRIMITIVES.md`, `docs/do-meet/README.md`, `CODEX.md`, `MVP_AND_PHASES.md`, and the brand/copy standards. The older DO Meet brief mentions Jost; current company canon takes precedence: Instrument Sans and IBM Plex Mono.

## Implemented boundaries

- Reviewed notes now open email, agreed-task and next-meeting outputs instead of passing everything into the generic DO prompt and its 4,000-character handoff limit.
- The user enters the recipient, edits subject/body, then separately requests operator review. Sender is explicitly `assembl@assembl.co.nz`, not the user's mailbox.
- `/api/do/meetings/follow-up` requires same-origin POST, non-anonymous sign-in, bounded JSON, explicit review and rate checks. Identity is server-owned.
- Email preparation reuses `agent_action_requests`. Stable owner-scoped IDs and exact-payload comparison make retries safe. No send occurs in this route. Existing `/admin/approvals`, `ACTION_DISPATCH_ENABLED` and Brevo configuration retain control of dispatch.
- Receipt reads are owner-, agent- and action-kind-scoped. They omit recipient/body and provider internals. Pending, approved and provider-accepted states are distinct; none claims inbox delivery.
- Selected tasks reuse the existing browser task store. They are human tasks, not executed agent jobs or durable Office assignments.
- An editable agenda uses agreed work and open questions. The user chooses an absolute reminder time; a valid Unicode-safe ICS file can be imported into a calendar. No invitation or scheduled notification is claimed before import.
- Editing an email clears review. After attempting to queue it, the payload is locked so retries cannot silently change or duplicate the request. Queued drafts remain their submitted version if notes later change.
- Preview sample notes remain blocked from follow-through. Switching sample/live modes resets their separate state.

## Acceptance and proof

Focused unit/route tests cover parsing, absence statements, injection, timestamps, Unicode folding, authentication, ownership, body bounds, rate limits, redacted failures, retry collisions and exact-payload reuse. Existing transcription and operator approval tests must also pass.

Required before release: full typecheck, focused lint, brand/macron checks, production build, actual desktop and 375px browser proof, then signed-in preview checks against the real database and providers. Test doubles must be labelled as such.

## Customer-demo rehearsal

1. Paste a fictional meeting transcript, or record a short permitted test. Recording still has the existing 10-minute / 4 MB limits.
2. Review transcript, separately consent to preparation, and inspect notes. A missing provider must show an honest setup failure.
3. Review the notes and choose Prepare the follow-up. Enter a controlled test recipient and review the complete email and sender.
4. Request operator review; inspect the pending receipt. Retry the same request and confirm a single database record. Another account must not read its status.
5. In a separately authorised live test, an operator reviews the queued email. Dispatch stays disabled until explicitly enabled. Confirm provider result; do not equate acceptance with delivery.
6. Select an agreed next step, save and reopen it under More → Saved tasks. Export the next agenda and import the reminder into a test calendar.

## Remaining work

Real microphone/Deepgram/SSO and database/provider execution proof; recordings suitable for longer meetings; durable cross-device meeting memory and Office jobs; sending from the user's own connected mailbox; actual agent execution of meeting work; hosted calendars/notifications; native Mac and phone behaviour. Family DO and the isolated spatial hero remain separate workstreams.

Rollback: revert this change. Existing queued requests keep their existing operator-controlled lifecycle; reverting the UI does not cancel queued work.
