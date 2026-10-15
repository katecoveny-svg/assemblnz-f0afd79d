# Readiness without activation

This slice separates metadata verification from permission to read a mailbox. It
uses existing DO authentication and existing configured credentials only. No flag,
credential, grant, SQL, policy or production data change is part of this release.

## Contract

GET `/api/do/mail` is owner-bound metadata only. An effective, narrow Gmail read
grant can be verified while mailbox activation remains off. `activation_off`
means the grant was verified but reading is disabled; `gmail_read_unverified`
means evidence is missing or invalid. Neither state enables the search controls.
The mailbox gateway and underlying transport independently retain activation,
owner, exact-account, grant revision and explicit consent checks. Outlook remains
unverified. Metadata verification never calls the Gmail proxy or reads messages.

GET `/api/do/personal/readiness` accepts no query parameters. Authentication,
owner-based rate limiting, private/no-store headers, a final owner recheck and
cancellation apply. It returns no titles, notes, record IDs, counts, expiry dates,
provider errors or enrollment details. It performs no save, content load or purge.
The only database operation, when responsibility storage is enabled, is the
existing SELECT-only `do_personal_storage_ready(p_owner)` function. Its owner is
taken from the verified session, never the caller. False is `owner_not_ready`,
RPC failure is `unavailable`, disabled is `activation_off`. `owner_ready` is the
existing prerequisite result, not a save/reopen certification.

Memory and conversation status is configuration only: `activation_off` or
`configured_unverified`. `saveReopenVerified` is always false. Deliberately do not
reuse their content loaders: those loaders can invoke expiry cleanup. No new SQL
function or migration is needed. This endpoint is a diagnostic, not a session
endpoint substitute or a way around a blocked authenticated browser action.

## Bounded activation and retention proposal for Kate (not executed)

1. Keep mailbox activation off until an authorised signed-in owner can inspect
   their existing grant metadata through the normal application. If evidence is
   missing, report the specific gap; do not expand grants or reconnect by default.
   Separately approve mailbox activation and a selected-account read with explicit
   task consent. Preserve existing 10-preview / 3-message limits and no attachments,
   mailbox writes, model dispatch or persisted mail content.
2. Keep memory/conversation collection off until owner-isolation, save/reopen,
   stale revisions, export/forget and expiry enforcement are verified in the
   intended environment using synthetic content. Current choices remain 7/30/90
   days for optional memory and 30 days after the last conversation message.
   The 40-message boundary remains explicit; continuation must preserve old turns.
3. Separately review and approve permanent expiry cleanup: exact tables/content,
   retention periods, tombstone retention, batch limits, scheduling, recovery and
   audit evidence. No purge is authorised or performed by this preflight. The
   observed stale responsibility maintenance and absent memory maintenance proof
   cannot be repaired by calling a loader or weakening the readiness guard.
4. All signed-in users is the availability goal. Existing per-owner responsibility
   enrollment, retention review, expiry and maintenance guards still apply, so
   responsibility storage is not yet universally available. Do not remove these
   guards to widen access. Consumer subscription schema/configuration, provider
   memory and voice leases remain separate activation work.

## Verification limits

Synthetic tests cover two owners, caller-selected queries, unauthenticated access,
stale/cancelled results, sanitised errors, exact read-only RPC arguments, zero DB
calls when disabled, metadata checks while reading is off, and zero mailbox
transport calls when disabled. No live provider, private records, purge or write
was used. A prior authenticated `/api/do/session` browser action was blocked by
client policy; it was not retried or bypassed. These code checks do not certify
Kate's actual grant, private persistence or acoustic quality.
