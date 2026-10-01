# Inactive authenticated EA coordination foundation

This is an **unactivated review proposal**, following the public fictional review in PR #1447. The public `/do/coordination` experience remains synthetic and unchanged. This proposal creates no invitations, real contacts, calendar grants, calendar access, bookings, external delivery, credentials, provider requests or production migrations.

## Boundaries and source audit

Office jobs, messages and receipts are owner-scoped projections. Builder storage is not a cross-owner executor. Action Cloud `demo.echo`, null owner and opaque permits are not peer authorisation. Personal “reviewed” records acknowledge a responsibility; they do not grant action permission. No owner memory table, memory body, ID, consent reference, private notes, calendar description or reason for unavailability is selected by this module.

The additive API reuses `doOwner`, `sameDoOrigin`, bounded `readDoJson` and private/no-store headers. It uses the authenticated Supabase cookie client and `auth.uid()`, never a service-role client or caller-supplied owner. `X-DO-Workspace` must match a freshly verified authenticated owner, preventing a form transferred across a cookie-account switch. Missing storage returns `storage_unavailable` with `saved: false`; there is no process-memory fallback.

Two independent application boundaries remain closed: `DO_EA_COORDINATION_PILOT` defaults off; the `closedPairingAdapter` rejects **every owner**, even with the environment flag enabled. No pairing creation, ID guessing, enumeration, discovery or invitation endpoint exists. The SQL pairing source accepts only explicitly pre-provisioned `isolated_fixture` records. A verified live pairing integration requires a separate reviewed contract and replacement adapter, not relabelling fixture records.

## Durable model and transitions

`schema-review.sql` is outside `supabase/migrations` and must not be applied to production. It defines participant contacts, tasks, participant membership, per-owner/revision permissions, separate inbox/outbox rows, exact-digest approvals, and a bounded request tombstone ledger. Only two public RPCs exist: command and own snapshot. All tables and helpers live in a private schema with RLS enabled and **no direct privileges** for public, anon, authenticated or service_role. Explicit revokes defeat permissive inherited default ACLs. RPCs require authenticated, non-anonymous identity from the verified session.

An owner first saves explicit windows privately. The server provides a digest bound to the exact owner/contact/task/revision/recipient/windows/expiry. A separate exact-digest command approves disclosure and queues an outbox; the recipient inbox contains metadata with a null body. Recipient delivery copies only the approved allowlisted envelope. Saved, queued, delivered and proposal-approved states remain distinct. Peer envelopes are data: they have no instruction field, memory access or ability to approve on behalf of another participant.

Only both delivered current permissions allow deterministic UTC interval intersection. The shared proposal binds participants' disclosure digests, duration, timezone, task/contact, revision, slot and expiry. Each owner separately approves this exact digest. The shared receipt says `proposal_agreed` and `calendarBookingCreated: false`; no calendar adapter exists. Decline closes; no overlap creates no proposal. Plan changes clear all old window bodies, messages, proposal and receipt, invalidate approvals and increment the bounded revision. Revocation/expiry clear content and retain replay tombstones.

Sorted participant advisory locks precede contact/task locks, preventing cross-contact quota races. Expiry is checked with server `clock_timestamp()` **after all affected task locks**, then checked again before command authorisation/snapshot output. This includes a wait on a sibling task inside the expiry sweep. Expiry returns a committed failure instead of raising after erasure and rolling back its tombstone. Idempotency binds owner + UUID + canonical JSONB command hash. Exact active retries are harmless; changed content, revision, expired scope and revoked scope cannot replay authority.

Bounds are five lifetime verified fixture contacts per owner, 20 lifetime tasks per participant, three plan revisions, eight windows per disclosure, 120 lifetime sender messages and 200 lifetime request IDs per owner. Tombstones are never deleted to free quota. The pilot needs a separately reviewed retention/purge model before any live use; deleting tombstones or reopening closed IDs would weaken replay protection.

## Local proof

Run the focused Vitest contract/API/protocol tests and repo typecheck/scoped lint. The real PostgreSQL runner is `scripts/test-do-ea-sql.cjs`. It accepts only a fixed loopback test endpoint and synthetic credentials, using separate authenticated sessions for two synthetic adult owner fixtures and a stranger, anon, anonymous JWT and service_role. It intentionally seeds hostile default ACLs before applying this proposal. It is not a live Supabase identity verification or production transport test.

```sh
docker run -d --name do-ea-isolated-proof -p 127.0.0.1:55439:5432 \
  -e POSTGRES_PASSWORD=fictional-ea-test-only -e POSTGRES_DB=ea_proof postgres:17
# Install pg locally outside the repo if unavailable; no application secrets needed.
DO_EA_PG_MODULE=/path/to/local/node_modules/pg node scripts/test-do-ea-sql.cjs
docker stop do-ea-isolated-proof
```

The runner destroys/recreates **only its own** `ea_proof` test schema. Do not point it at any shared or application database. It checks real durable reopen, participant isolation, missing/extra/null/type fields, exact dual consent, queue/delivery distinction, duplicate and stale replay, no overlap, CAS races, quota races, revocation, expiry and waits crossing expiry including sibling task locks. UTC arithmetic and explicit offset input preserve Auckland DST transitions; ambiguous local wall-clock input is rejected by the contracts.

## Live-pilot gates

Before live use: independently reviewed exact schema/source; verified adult participants and closed verified pairing; mutual contact consent; a real owner review interface for exact task-specific disclosure and proposal; scoped provider/data permissions separately approved by each owner; participant-isolated durable transport and delivery/recovery policy; reviewed quotas, tombstone retention and operational monitoring; deployment/RPC privileges explicitly gated; approval bound to exact content; separately approved calendar actions. This proposal implements none of those external grants.

The internal delivery operation is a synthetic authenticated database handoff, not proof of external EA delivery. The transport adapter must remain replaceable for later A2A; do not add a public social feed or treat peer messages as instructions. Scheduling is deterministic and calls no model. Any future generative adapter must use the shared Astra 6 + TypeSafe contract owned by the DO owner thread, with separate same-owner context consent. It must never pass private owner memory to peers.
