# EA diary coordination · fictional review foundation

## Scope and source audit

Built from main `41a3d075b4394c05f394a00c54ee68f8c24bbe03` in an isolated clone and `feat/ea-peer-coordination`. Original checkouts were not edited.

Creates `apps/do/coordination/protocol.ts` and `/do/coordination`, a session-only fictional two-adult review. Uses canonical DoMark, Instrument Sans/Plex Mono and DO app frame. No provider calls, storage, real contacts, calendar access or sending. This is an additive bounded protocol, not a public feed.

Audit: `apps/do/shared/office.ts` exposes internal AgentSpec projections/messages, not verified cross-owner identities. `office-jobs.ts` and `services/office-jobs.ts` hold owner-scoped Builder records; do not reuse them as a generic peer executor. `lib/do/action-cloud/service.ts` is demo.echo with null owner and opaque permits, not production peer authorisation. `apps/do/personal/service.ts` sets reviewed as acknowledgement, not external-action consent. No existing authority is broadened.

## Review and privacy contract

Both fictional adults accept the contact. Each local owner approves the exact disclosed future free window. Only strict typed windows enter shared records; private notes, calendar descriptions, memory bodies/IDs/consent references and unavailability reasons are forbidden. Deterministic UTC-instant overlap produces a proposal shown in Pacific/Auckland. Both owners approve the same revision and SHA-256 digest. Receipt means **proposal agreed; calendar booking created: false**.

Envelope binds version, synthetic transport, task/contact, sender/recipient, revision, expiry, UUID delivery ID and digest. Unknown fields are rejected. Local disclosure must precede synthetic delivery. Peer data cannot grant authority, approve, execute or modify memory. Identical delivery is a no-op; tamper, scope mismatch, expired and old revisions are rejected. Changing duration invalidates disclosures/approvals/receipt. Maximum three rounds, eight windows per owner, 15–120 minute duration. Decline/revoke/expiry close the task and clear shared working windows. No text generation is needed.

The two-owner in-memory fixture is deliberately **not production identity isolation**. The fixed review clock makes screenshots reproducible. Refresh clears state; no claim of durable delivery or calendar booking.

## Replaceable live adapter contract and gates

`CoordinationTransport` is intentionally synthetic-only. A future A2A implementation must implement a separate verified transport, not change the synthetic flag or trust envelope sender fields. Requirements before live activation:

1. Verified adult participant identities and owner-to-EA bindings, authenticated sender and recipient sessions; never accept identity from payload alone.
2. Mutual revocable contact consent with per-owner/contact/task scope and expiry. Each owner explicitly approves exact window disclosure; preparation/memory consent is separate.
3. Scoped provider/data permission: read only permitted diary availability locally; never share titles/descriptions/notes/reasons. Separate exact-content calendar-write approval from proposal agreement. No invitation, discovery or calendar grants currently exist.
4. Participant-isolated durable inbox/outbox and receipts, tenant RLS, atomic CAS revision/approval checks, bounded retention, tombstones, revocation and expiry checks at enqueue/claim/commit. Durable idempotency stores bind key to content and scope; authenticated delivery retries cannot resurrect stale grants. Define uncertainty handling before external writes.
5. Proposal digest binds participants, contact/task, timezone, exact instants, duration, expiry and revision. Both approvals bind the same full content. A changed plan or data invalidates all approvals before execution. Booking requires additional authorisation and provider evidence; provider acceptance is not confirmed attendance.
6. Fail-closed validation, rate limits, bounded rounds/windows/message sizes, replay protection and audit evidence. Peer text is untrusted data with no instruction or memory authority. No public feed.

A later generative adapter is optional and may return inert suggestions only. Use the DO owner thread's shared Astra 6 + TypeSafe policy, not a new provider route. Contract requested from thread `01a0f443-feac-7558-be4b-cfcf837e2030`; its files are unchanged. Private owner-memory context bundles remain same-owner assistant/responsibility only and never enter peer scheduling. Pending verified shared import is a live-generation gate.

## Proof

Focused tests: `apps/do/coordination/protocol.test.ts` exercise mutual contact/disclosure, exact agreement, duplicate/tamper/scope/injection rejection, changed-plan replay invalidation, three-round cap, decline/revocation/expiry, no overlap, private-field rejection and Auckland spring/fall offset handling.

Review URL: `/do/coordination`. No public home navigation promotion or production activation. Full build is serialised behind the hub migration slot. Browser evidence and actual check results are recorded in the task handoff; incomplete checks are not release proof.

Actual checks: Node 24.21.0 typecheck passed after the canvas prerequisite build. Fourteen focused coordination/Office/Personal contract tests passed; scoped ESLint, brand guard and macron guard passed. Fictional browser exercised full dual approval, duplicate delivery, changed-plan replay rejection, decline, no overlap, expiry and revocation. 375px DOM width equalled viewport width with no overflow; full-page desktop/phone screenshots captured. Companion capture launcher is hidden only while this fictional review is mounted to avoid covering phone review controls. Production build remains pending the shared slot.
