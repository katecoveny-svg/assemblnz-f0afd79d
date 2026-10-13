# Personal DO mail read — review build

Extends verified DO ownership, Pipedream account ownership, bounded JSON/rate
backstops, Gmail decoding and writing-owner invalidation. Creates a shared mail
read contract and in-memory review destination. No production activation, account
linking, OAuth grant/configuration change or mailbox write was performed.

## Working slice

`/do/connections` → **Find correspondence and prepare a task draft** → `/do/mail`.
Choose one account by its label and distinct ID; no default wins. Enter literal
search words or a correspondent address and 7, 14 or 30 days. Review the disclosure
and permit the read. Search returns at most ten previews; select up to three to
read. Prepare an editable unsent task with account-qualified evidence. It makes no
clinical interpretation or inferred appointment/action. Device dictation can feed
the same input if enabled by the user; physical dictation is not verified here.

The independent Gemini integration is coordinated with PR1563 and must be applied
after its settled shared-file changes. `createMailHandoffReceiver` accepts short,
one-use, owner-bound reviewed text in memory only. No selected account, grant or
consent crosses that boundary. Caller ends voice/releases audio and clears provider
consent before handoff; the destination requires fresh mail account/task review.

## Boundaries

- GET `/api/do/mail` checks only connected-account metadata: no mailbox probe,
  credentials or raw errors. `scopeVerified: false` is deliberate. Configured and
  healthy are distinct from actual grant verification.
- POST: authenticated `getUser`, same origin, strict 4 KB JSON, owner comparison,
  owner-based per-process rate backstop, 45-second total deadline. Request IDs
  correlate drafts; they do not authorise access.
- Server-only transport: fixed GETs to Gmail `users/me/messages`; literal quoted
  words, no caller URLs/methods, next-page following, attachments, contacts or
  writes. Before detail reads, the gateway re-searches and verifies membership.
- Provider responses: 16 KB list, 256 KB message, 128 KB account metadata limits.
  Output: at most 10 × 500 preview characters or 3 × 3,000 detail characters plus
  bounded headers. Oversized mail fails closed; truncation/unread attachments and
  additional pages are labelled.
- Owner and account health are rechecked before each read and publication.
  Duplicate account IDs and conflicting owner fields fail closed. Cancellation
  reaches fetches and invalidates late publication. Owner revalidation unmounts
  review and clears state; this conservative slice can discard work on refocus.
- Mail is untrusted data rendered as escaped text; sender headers are unverified.
  No model or executor receives it. Message instructions cannot change authority,
  account, search or destination. No regex claims complete injection protection.
- No mail in URLs, browser storage, logs or cloud persistence. Message duplicates
  deduplicate within an account; evidence keys include account ID. Duplicate UI
  submissions are synchronously blocked. Server retries are new bounded reads,
  not durable jobs; there is no shared content/replay cache.

## Exact setup for later owner approval — not performed

1. Confirm the intended signed-in DO UUID. Pipedream external owner must be
   `do:user:<UUID>`, never a developer, demo or shared tenant account.
2. Verify existing server `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`,
   `PIPEDREAM_PROJECT_ID`, `PIPEDREAM_PROJECT_ENVIRONMENT` in the intended environment
   without displaying values. Preview verification is separate from production.
3. Inspect the custom Google client referenced by `DO_GMAIL_OAUTH_APP_ID`.
   Required mail scope: `https://www.googleapis.com/auth/gmail.readonly`, plus
   only separately justified identity scopes. Do not substitute default broad
   Gmail OAuth, `gmail.modify`, `gmail.compose`, `gmail.send`, full
   `mail.google.com` or contacts access.
4. After approval the owner can choose **Add another Gmail account**, review the
   actual Google consent screen and select each intended account. This UI reuses
   the existing custom-client flow; this task starts no link. Verify every returned
   account ID belongs to the same DO UUID. Healthy status alone proves no scope.
5. Outlook remains unavailable even with a healthy draft connector. A separately
   approved setup must verify delegated Microsoft Graph `Mail.Read`, the Entra
   app/tenant and account-specific grant for the intended personal/work account.
   `Mail.ReadBasic` omits bodies; draft capability or `Mail.ReadWrite` is not proof
   of a read-only grant. Do not add application-wide, `Mail.Send`, contacts or
   shared-mailbox permissions. Identity/session scopes such as `openid`, `profile`
   and `offline_access` need their own documented purpose in that approval.
6. Outlook also needs a reviewed grant-metadata verifier and bounded Graph
   `/me/messages` adapter. No environment switch assumes this is verified or
   activates reading from the existing draft action mapping.
7. Signed-in GET `/api/do/mail` is the metadata-only readiness check. Inspect
   owner/account/state flags privately. No live provider call was made while
   implementing/testing this change; don't copy private account metadata into PRs.
8. A later owner-approved small read must verify actual scopes/account, expiry
   behaviour and provider response shape. Mail model use additionally requires
   named-provider disclosure/consent and source validation. Existing Personal DO
   “no tools” policy is unchanged.

## Proof and remaining gates

Tests: `apps/do/mail/*.test.ts`, `app/api/do/mail/route.test.ts`,
`lib/connectors/personal-mail.test.ts` and existing Gmail/connection regressions.
Only Example Clinic and `example.invalid` synthetic fixtures; no real health data.
`scripts/review-do-mail.cjs` exercises actual components at desktop/375px with
mocked accounts, owner switch, second Gmail, cancellation, injection and drafts.
The hosted **Personal DO mail review** workflow runs typecheck, scoped lint,
focused tests, guarded build and browser proof without provider secrets.

Remaining gates: live Gmail scopes/account proof, Outlook grant verifier/reader,
physical voice/dictation proof, review of separate shared-file voice integration,
and production approval. No merge, SQL/security change or persistent grant.
Rollback: revert feature and independent integration commits; no data migration.

## Primary references checked

- [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Gmail message listing](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)
- [Graph messages/permissions](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0)
- [Pipedream custom OAuth](https://pipedream.com/docs/connect/managed-auth/oauth-clients)
- [Supabase authenticated getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
