# School/calendar private-pilot staging

This draft builds on current main `a513dc1aa`. PRs #1530 and #1532 were merged externally; their school files have no functional difference. This work neither merged nor deployed them. PR #1527 was still draft at `780f77b98eb2761040b725e5132594a8a09d94a4` when inspected. Its owner/session/browser-draft files are untouched; its owning thread was contacted to coordinate. This branch disables its automatic Vercel deployment in `vercel.json`.

## Honest capability matrix

| Layer | Working evidence | Remaining gap |
|---|---|---|
| Fictional school briefing | Existing PDF-byte extraction and old/new source-backed cards in Family DO | Explicit timetable rows only; no general prose/OCR |
| Daily/weekly agenda | Same interface; Auckland civil-day windows including DST; all-day exclusive ends; retained moved-out dates; explicit fixture event links; start-time clashes | Views only, not recurring delivery; no duration inferred; fixture matches are not real calendar matches |
| Calendar draft review | Exact owner/revision/snapshot digest, 15-minute expiry, event ID/etag; cancellation draft can be reviewed; changes with unknown duration remain blocked | No action executor or calendar write; a future writer must re-read etag, scope and consent |
| Server orchestration | `staging.ts`: bounded owner/approval/source/calendar/retention test port; verifies read-only scope attestations, rechecks owner/approval between reads, stages candidate evidence through atomic CAS contract | No production ports are bound; the API returns 423 after auth/origin/workspace checks without reading a request body |
| Private state | Synthetic tests cover wrong tenant, account switch/expiry, connection revision, delete/revoke races, retention expiry, stale CAS and storage failure | Synthetic transactional adapter only. No deployed RLS or durable school-history implementation is proven |
| Integration reuse | Existing selected-sender schema, school parser/review model, owner/no-store/origin conventions, Google list-events input contract, coordination digest/window | Existing Family Gmail reader skips attachments. Pipedream calendar list output normalizer and verified per-owner narrow scope path are missing |
| Background, model, notification, external writes | None registered or enabled | Separate specific approval and implementation required |

## What was actually inspected

No credentials, private inbox or calendar contents were read. Dot-chat Gmail access is not DO access. An identity-only Google sign-in grants no school-mail/calendar access.

DO Gmail uses an authenticated Supabase user mapped to Pipedream `do:user:<uuid>`. Family connection checks use healthy owned account records, but these records do not establish actual granted scopes. The custom Gmail OAuth app configuration and Google's displayed grant must be independently verified. Existing `collectFamilyMail` reads bounded message text and skips attachments; `collectSchoolPilotMail` remains unconditionally closed. The separate live digest invokes Pipedream, TypeSafe and OpenAI GPT-6 Astra under its own consent and must not be used as a pilot shortcut.

The coordination Google calendar adapter is **free/busy only** (`calendar.freebusy`, plus identity), using owner/revision/expiry-bound handles. It cannot provide agenda titles, event IDs, locations or etags. Generic DO connector contracts/catalogue contain `list_calendar_events` with bounded ranges and maximum 50, but the result normalizer lacks a verified list-events case. Generic connection health does not prove a narrow read grant. The older portable-calendar job document describes a plan, not an implemented job store/API.

This test port requires `gmail.readonly` and `calendar.events.owned.readonly`, plus only identity scopes, with connection IDs/revisions. These are server-verified receipt fields, not client assertions. It deliberately rejects free/busy-only, broad calendar/write scopes and shared-calendar scope for the first owned-calendar pilot. [Google's scope reference](https://developers.google.com/workspace/calendar/api/auth) distinguishes owned read-only events from `calendar.events.readonly` for calendars accessible to the user. A later shared-school-calendar pilot needs its own specifically reviewed scope/contract. A picker may separately need `calendar.calendarlist.readonly`; this first port uses an explicitly selected calendar ID and does not request it.

## The school-history adapter gap

Do not put school data in self-memory: its purpose is owner-review/self-only and excludes other people's information. Do not squeeze school history into strict `LifeAdminPlan` checklist JSON. Reuse the existing authenticated-owner, expected-revision/CAS and deletion-tombstone design when extending approved persistence, coordinated with #1527. No second localStorage/IndexedDB store has been added.

The missing server adapter must support these operations as one purpose-bound owner store:

1. Resolve a stored adult approval into the exact scope, confirmed child mappings and explicitly selected event links. Bind the SHA-256 digest of those values, the completed processing terms (`termsDigest`), approval revision and both connection revisions. Issue a maximum 15-minute one-off lease. Client booleans are not authority.
2. Load only that owner's selected, unexpired, reviewed baseline evidence. Revalidate source access and mark stale/unavailable evidence; do not change its original received time or claim a fresh source check without doing one.
3. Stage candidate evidence using atomic expected revision, current owner/session, approval and connection checks, server time and deletion/revocation tombstones. **Do not silently promote new evidence over the reviewed baseline.** Candidate staging and later explicit baseline adoption are distinct transitions. Failure must not fall back to browser/global state.
4. Enforce the selected retention deadline on baseline, candidate source text, PDF excerpts, child mappings and derived agenda. Do not extend the baseline's original expiry just because a new run occurred. Expired rows must not be served; purge jobs/backups/log expiry and restoration rules require verified operational evidence before activation.
5. Delete/revoke atomically, retain only content-free anti-resurrection metadata, and suppress late reads/commits/publication. Delete derived artifacts too. A response already delivered cannot be remotely erased: the UI must clear on sign-out/account change, and private no-store responses must never enter shared caches.
6. Prove these properties with two actual fixture accounts, separate browser contexts/devices, cookie expiry and real RLS/CAS on a specifically approved isolated fixture backend. Preview deployments may share production services; a preview URL is not proof of isolation. Existing checklist SQL tests are reusable patterns, not school-storage proof.

`staging.test.ts` implements this boundary in an in-memory synthetic fixture only. Its receipt, scopes and retention manifest are fictional. Production activation requires an approved durable adapter, owner-bound Gmail/PDF reader, calendar output normalizer, real grant verification, completed processor terms and independent review. There is no feature flag that opens the live route. It must stay closed until those gates are demonstrated.

## Exact next consent for Kate

The smallest first live pilot should be one **manual** run for one explicitly selected school sender and one owned calendar, with a chosen lookback and agenda window. These are proposed limits, not permissions already granted. Before any real read:

- Kate signs into her own DO account, confirms the intended Google accounts, then reviews the actual Assembl/Pipedream OAuth clients and read-only grants above. Chat credentials must not be transferred. Operator evidence must verify granted scopes, account ownership, healthy status, expiry and disconnect behavior.
- Kate chooses exact sender addresses, 7/14/30-day lookback, the calendar ID and 1/7-day Auckland agenda window. Confirm child-to-school/audience mappings; leave class options/transport unknown unless supplied. Explain that Gmail read-only is a broad provider grant even though DO's application query is restricted to these senders/window. Forwarded mail from another address needs separate explicit sender selection.
- Before fetching PDF bodies, disclose and approve attachment types/limits: selected PDF only, up to 2 MiB/20 pages, no OCR; unsupported, unavailable or partial sources stop trustworthy comparison. A future reader must enforce owner-bound message/attachment IDs and never fetch arbitrary user URLs.
- Show a completed, versioned data-flow notice: **Google** stores the source mail/calendar; **Pipedream** proxies the chosen API reads; **Assembl's application hosting (Vercel)** processes deterministic rows and agenda evidence; **Supabase** would store purpose-bound private history only after the adapter is approved. Verify each actual processor/subprocessor, hosting location, access controls, logs, retention/deletion and backup-restoration policy. Those operational facts are not established by this PR, so do not present a consent checkbox as complete until they are. Bind that exact completed notice with `termsDigest`.
- Kate explicitly chooses **1, 7 or 30 days** of history retention, what child labels/source excerpts/calendar fields may be retained, deletion and disconnect behavior. No default retention is accepted by the port. Approve the exact scope and terms revision before issuing the lease; show selected source IDs, dates/pages and omitted/truncated material before draft adoption.
- This deterministic first pilot uses **no AI model**. If model understanding is later needed, disclose the exact excerpts/PDF text/child fields and separately name and approve **OpenAI (model specified)** and **TypeSafe**, with verified terms, before any transmission. General access permission and volunteering to test do not supply this consent.

After the isolated backend and read adapters are proven, Kate's next action is that specific connection + bounded one-off processing/retention approval, followed by review of the source-backed agenda. Until then, the UI is a fictional rehearsal and the authenticated pilot route deliberately refuses ingestion.

Daily/weekly delivery would additionally need a local time/day, Pacific/Auckland DST rule, grant duration, destination, revoke/cleanup behavior and explicit scheduling approval. Calendar writes need exact event IDs/etags, proposed old/new fields and separate write-scope/action approval. Neither is authorized or implemented here.
