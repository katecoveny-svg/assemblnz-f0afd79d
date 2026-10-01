# Google calendar preparation — inactive

Kate selected Google. This slice adds a replaceable provider interface, strict owner-only read contracts, deterministic availability subtraction, an unwired Google `freeBusy` adapter and OAuth state/PKCE preparation. It adds no routes, UI, credential storage, database objects, environment flags or provider calls. The existing fictional coordination experience and inactive durable foundation are unchanged.

Source base: `d786a1c1f1c38970e864683720ca2ec4bbb91535`. Isolated branch: `feat/ea-calendar-consent`. Original dirty checkout preserved.

## Ownership for the DO design owner

Calendar code is confined to `apps/do/coordination/calendar/*`; documentation to `docs/do-coordination/calendar/*`. No edits to `/do`, `/do/coordination`, `/do/continue`, shared components, typography, colours, navigation, memory or continuity modules. A future owner setup route is proposed at `/do/coordination/calendar`, with presentation owned/reviewed by the DO design owner; it is not created in this slice. No heavy local build was run.

## Current integration audit

Source inspection proves implementations, not connected user accounts or deployed configuration. No user grants, credentials or private calendars were inspected.

| Existing source | Finding | Reuse decision |
| --- | --- | --- |
| `supabase/functions/google-calendar/index.ts` | Full calendar/event scopes; user ID used as OAuth state; refresh token stored in owner-readable integration configuration; calendar create/delete handlers | Do not reuse credentials, OAuth callback, permissions or writes |
| `lib/voice/clients/google-calendar.ts` | Service account calendar client, not customer OAuth | API shapes/test injection only |
| `apps/do/services/owner.ts`, `lib/connectors/pipedream.ts` | Owner-derived external IDs and connected-account framework | Useful isolation patterns; source/environment readiness does not establish a scoped calendar grant |
| `apps/do/shared/do-connector-pack.ts` | Google list-events/create-event actions | No verified minimal free/busy grant. Generic connector execution is not EA approval authority |
| `supabase/functions/oauth-initiate/index.ts` and existing callback | PKCE/state patterns but not the required atomic, browser-bound EA flow; owner-readable plaintext token storage | Patterns only, not a safe vault |
| Microsoft / Apple | No production diary adapter found in this audit | Deferred; no invented account connection |

Google's [freeBusy API](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) accepts the dedicated `calendar.freebusy` scope. First milestone uses the authenticated account's `primary` calendar only; this avoids calendar-list scope and arbitrary peer/calendar identifier queries. No event-title, description, location, attendee or reason data is requested or retained. OpenID/email scopes will identify the connected account after verified token validation. Broad full-calendar/event scopes are rejected, including inherited legacy grants.

## Authority contract

`CalendarRead` binds an exact connection revision, private calendar handles, range, working windows, timezone, expiry and request ID. Maximum one primary calendar for this adapter, seven-day range, fourteen non-overlapping working windows and one-hour read approval. Availability disclosure remains capped at eight windows; overflow requires a narrower range, never silent truncation. Review output is owner-private and expressly `peerDisclosureApproved: false`.

`GoogleCalendarAuthority` has no implementation or fallback. Before returning a lease it must freshly verify the authenticated owner/session, enforce connection ownership and selected primary calendar, atomically consume exact-content approval under locks, reject duplicate execution/replay, and enforce quota. Lease checks bind owner, connection, revision, handle, token expiry and returned scopes. Clock checks run after authority locks and after the provider response. Errors and malformed/incomplete responses never mean a calendar is free. HTTP redirects are rejected, requests timeout after ten seconds, responses are bounded to 256 KiB and 1,000 intervals. Provider fields outside minimal busy times are discarded.

OAuth preparation only generates a random one-use state, nonce, S256 challenge and ten-minute private record. It does not persist state, issue a redirect, exchange a code or validate an ID token. It is deliberately not an OAuth endpoint. Browser payload contains no verifier. State/private records and tokens must remain outside peer messages and browser-readable storage.

There is no owner-memory access. Private calendar/account names, handles, bodies, IDs, consent references and unavailable reasons cannot enter peer envelopes. Peer delivery cannot grant read authority, act as OAuth input or alter memory. Scheduling requires no generative provider.

## Review contract for the future setup UI

1. Freshly authenticated owner chooses Google and explicitly begins connection. Verify expected workspace against fresh cookie owner before any POST; replies private/no-store.
2. Dedicated Google OAuth shows only read-only free/busy plus account identity. An account switch creates a new connection revision and invalidates earlier reads, disclosures and proposals. No agent grants scopes on the user's behalf.
3. Owner reviews connected account privately, primary calendar, exact date/working range, timezone, maximum read frequency and expiry. One explicit exact-content approval precedes a free/busy read.
4. Computed free windows are shown privately, with freshness/expiry. This is not approval to disclose.
5. A separately verified named adult peer mutually accepts contact. Owner approves the exact minimal windows for this peer and task. Both owners approve the same proposal revision/digest. Receipt says proposal agreed, calendar booking created: no.
6. Disconnect/revoke expires reads and disclosures, invalidates proposals and clears private transient data. Any invitation or calendar write requires a later separate implementation and approval of exact recipients/details.

## Exact live activation gates (none executed)

No new executable SQL proposal is included here: an installable proposal must follow the reviewed UI and identity contracts, rather than pretending those missing systems exist. Therefore there is no new SQL proposal hash for the independent reviewer yet. Existing EA source SQL remains uninstalled.

The next targeted proposal must include only:

- EA calendar connection and encrypted token vault, OAuth state and exact read-approval ledger; service/default ACL explicitly revoked, no owner/browser token SELECT, narrowly scoped server operations.
- Atomic state consumption bound to verified owner, browser session, provider, nonce and expiry after locks; verified Google issuer/audience/nonce/subject and exact returned scopes. Dedicated OAuth client/callback and encryption key configured via the approved secret-management path, never copied from dot-calendar or legacy connections.
- Narrow verified-participant/pairing registry replacing fixture-only source; no guessed owner UUIDs or unnamed contacts. Mutual consent and exact owner/contact/task isolation.
- Idempotency tombstones, quotas, CAS revisions, DB statement/lock timeouts, monitored expiry cleanup, bounded retention and restore quarantine that prevents restored grants/approvals becoming active.
- Exact selected SQL bytes/hash independently reviewed, targeted install while all pilot flags/enrolment remain disabled, real cookie-owner isolation proof, then separately approved verified participant enrolment and flag activation.

No historical migration backlog, broad grant, general-purpose service executor or production adapter fallback. Provider/account preference is now resolved; remaining blockers are secure OAuth/vault implementation, review UI contract, verified pairing, targeted schema review/install and the user's interactive OAuth/read approval.

## Verification

Focused Vitest tests cover private review, changed account revision/revocation/expiry, range/timezone/working-window limits, Auckland DST, primary-only request, metadata stripping, provider errors, unexpected calendars, replay rejection before transport, broad grant rejection and PKCE randomness. Injected transports return fictional responses only; no Google API was called. Typecheck and scoped lint are recorded in the PR.

Local proof: 20 tests passed across calendar, synthetic protocol and durable contract suites; scoped calendar TypeScript and ESLint passed. Repository-wide TypeScript was attempted and failed outside this slice: missing `pdfjs-dist`, `fflate`, `zod-to-json-schema` dependencies and Deno/global/import errors in `security-proposals/nz-edge-maintenance/*`. No source outside the listed boundaries was changed to hide those failures. No browser proof is needed for this slice because it changes no visible UI. Prior production fictional browser evidence belongs to PR1450, not to a live Google integration.
