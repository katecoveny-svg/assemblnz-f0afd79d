# Personal DO mail grants and sourced briefings — local review

Base: `bf47303b5b4a3fb6a502687bd33de6849a70714b` (task-specified production).
Local branch: `codex/personal-mail-grant`. The fetched main was
`20ee05f4aee57a155a5cc687f4521217e1d975e2`; this work deliberately targets the
requested production base. Reconcile with current main before release.

## Authority and outcome

Extends the existing Personal DO bounded mail primitive, not this assistant's mail
connections. Public documentation research, local edits and synthetic tests only.
No credentials inspected, real grants created/expanded, mail bodies read, model
requests, sends, paid API calls, database changes, push or deployment.

Canonical context: root AGENTS/START_HERE, context manifest/router/current state,
assembl strategy, Factory operating model/primitive registry and Personal mail read.
No nested AGENTS applies to these files. The older Desktop checkout instructions
were superseded by the pinned repository's root AGENTS.

## Authoritative Gmail metadata source

[Pipedream Retrieve account](https://pipedream.com/docs/connect/api-reference/retrieve-account)
documents `authorized_scopes` as scopes effectively granted to the account and
`expires_at` as credential expiry. It separately documents `healthy`, `dead`,
owner `external_id`, account `id`, app, timestamps, and optional credentials.
`include_credentials=false` explicitly excludes credentials.
[List accounts](https://pipedream.com/docs/connect/api-reference/list-accounts)
supports the same account fields and external-user filtering. This is a stronger
source than OAuth client configuration, requested scopes or app `scope_profiles`.
[Google's OAuth guidance](https://developers.google.com/identity/protocols/oauth2)
also distinguishes requested scopes from scopes actually granted.

`lib/connectors/pipedream-mail-grant.ts` reads only these endpoints through the
existing bounded server transport. It requires:

- Exact `do:user:<UUID>` owner, one matching explicit account ID, Gmail provider,
  healthy=true, dead=false, no error, and no credential object.
- Actual scope array containing gmail.readonly and only the existing identity
  allowlist. Missing/unknown/write/send/contacts/full-mail scopes deny.
- Valid unexpired credential expiry, account creation/update timestamps and a
  check no older than 60 seconds. Missing expiry is never replaced with a TTL;
  credential lifetime is not represented as a durable consent lifetime.
- Matching normalized metadata from owner-filtered list, exact retrieval and a
  second list. The SHA-256 snapshot includes owner, account, provider, timestamps,
  actual scopes and expiry; no credential or inbox data enters it.

The gateway pins this snapshot for the whole search/detail/draft transaction.
Direct transport independently checks before and after each Gmail proxy call.
Its final account list is parsed through the same complete metadata validator and
compared with the pinned snapshot immediately before proxy dispatch. Healthy=true
cannot conceal newly dead, expanded-scope or expired metadata at this boundary.
Cancellation propagates; failures return null or generic mail error codes.
Bounded requests are no-store, reject redirects and cap response bytes. There is
no grant cache, client-supplied evidence, environment bypass or fallback to default
Gmail OAuth. Existing explicit search consent and account selection remain intact.

`DO_PERSONAL_MAIL_READ_ENABLED` is a separate server-side release gate, default off.
Only exact `true` allows verification/read code to proceed; review deployments must
leave it unset or false. The production verifier, adapter configuration and direct
read entry enforce it, with another check at final dispatch. It does not supply a
grant or replace explicit user read consent. No production flag was changed.

Provider metadata is a current observation, not an atomic authorization lease.
The local revision hash only detects observed field changes; `updated_at` is not
a documented grant-generation identifier. Credential expiry is not proof of
ongoing user consent or instantaneous revocation status.
Pipedream does not document a generation-pinned proxy request or instantaneous
revocation visibility here. A provider-side reconnect between observations may
precede detection; changed snapshots discard output but cannot undo a completed
read. Verify provider update/revocation semantics before claiming stronger race
protection. Refreshes changing expiry conservatively invalidate the draft too.

Exact remaining dependency: confirm that the intended production project/account
returns these documented nonsecret fields with credentials excluded, with reliable
update/revocation semantics. If fields are absent or stale, preserve denial; do not
substitute credentials, custom-client configuration or a successful mailbox probe.
That live check was not authorized/performed in this task.

## Outlook: bounded delegated flow investigated, remains denied

[Microsoft's message API](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0)
supports delegated Mail.Read for personal and work/school accounts. Mail.ReadBasic
is insufficient for body-based briefing. A future adapter should use only fixed
GET `/v1.0/me/messages` and selected `/me/messages/{encoded-id}` paths, `$top=10`,
explicit `$select`, bounded date/search filters and three selected detail messages.
Request text bodies, validate the returned type and render escaped text; never
follow nextLink, attachments, arbitrary URLs, shared mailboxes or writes.

No reader is wired because Pipedream's documented scope/expiry fields alone do not
establish Microsoft delegated-versus-application grant type, tenant, client and
subject bindings. `Mail.Read` also exists as an application permission. A healthy
microsoft_outlook draft connector is not evidence of delegated read-only access.

[Graph oauth2PermissionGrants](https://learn.microsoft.com/en-us/graph/api/oauth2permissiongrant-list?view=graph-rest-1.0)
is not a bounded substitute: documented least permission is Directory.Read.All,
work/school delegated access requires a supported role, personal accounts are not
supported, and changes may have replication delays. Do not expand directory access
just to inspect mail authorization. Do not decode an unverified token as proof.

Required future setup: reviewed Microsoft client/tenant/account binding and a
trusted delegated-grant attestation source, exact Mail.Read with separately
justified identity/session scopes, effective expiry/revocation/reconnect proof,
then a bounded Graph reader and owner-approved synthetic-to-live acceptance.
No consent request, grant creation, new environment activation or Outlook code
path was introduced. The existing `outlook_read_unverified` denial remains.

## Feeding Kate's own Personal DO daily briefing

This change does not schedule a briefing or add a chat mail tool. The existing
`MailDraft.sources` supplies account-qualified message keys, headers, selected text,
truncation, check time and untrusted-correspondence labels. A later briefing can
consume verified results only within the same owner's permission boundary:

1. Record an explicit, expiring responsibility permission for chosen account IDs,
   provider, query/date window, message/body caps, daily schedule and timezone.
   Reconnect, owner/account change, edits, pause and expiry require renewed review.
   Existing one-request mail consent does not authorize background collection.
2. At each wake-up revalidate responsibility revision, owner and every account's
   grant before collection, after provider response and before publication. Report
   unavailable/partial/truncated sources honestly; never call denial an empty inbox.
3. Prepare a deterministic sourced digest first. For model summarization require
   separate named-provider/data-sharing consent and a bounded budget. Mail remains
   untrusted source text with no tool authority. Validate every output citation
   against the selected account+message evidence; distinguish quotations, facts,
   inferred actions and uncertainty. Nothing sends, books or executes from mail.
4. Deliver privately within that Personal DO. Start with request-local contents as
   today. Any durable briefing/source retention needs reviewed opt-in TTL, purpose,
   owner isolation, deletion/cleanup and restore tests. Keep raw bodies out of logs,
   URLs, browser storage and general memory; minimal receipts must not retain body
   text. Do not silently persist sources because a schedule exists.
5. Test two-owner isolation, sign-out, consent expiry/pause during collection/model
   response, account removal/reconnect, source deletion, stale citations, duplicate
   message IDs across accounts, failed cleanup and retries before activation.

Reuse the existing Personal DO responsibility/wake-up admission and retention
controls. Their existence does not authorize mail tools or prove hosted execution.
A review of those gates, a retention decision and owner enrollment remain necessary.

## Verification and remaining gates

Synthetic tests cover mixed Gmail/Outlook accounts, explicit second-account use,
revoked/dead/unhealthy/missing-scope/expired metadata, broad scopes, owner mismatch,
duplicate IDs, missing fields, provider errors, cancellation, late metadata,
reconnect changes during metadata and proxy reads, and changed draft publication.
The production adapter wiring test stubs fetch and asserts credentials are excluded
and no mailbox proxy is called during verification.

Run focused mail/API/connector tests, scoped ESLint, typecheck and build before
release. Full local check outcomes and any environment limitations belong in the
handoff; synthetic passes do not prove live grants. Remaining gates are code review,
current-main reconciliation, authorized live metadata proof, approved bounded live
read, Outlook delegated attestation/reader, and briefing permission/retention work.
Rollback is a code revert; there is no migration or persisted grant to unwind.

### Local check record

- 700 tests passed across 14 mail, API, connector, Gmail ownership and connector
  contract suites, using synthetic fixtures and mocked fetch only.
- Scoped TypeScript check of all eight changed TypeScript files plus their imported
  dependency graph passed. Scoped ESLint passed with zero warnings.
- Brand guard, public front-door guard and `git diff --check` passed.
- Full repository TypeScript check failed in the available older local dependency
  tree: missing `@google/genai`, `saxes`, `@modelcontextprotocol/server`, PDFs and
  other packages, plus errors elsewhere. No changed mail file appeared in that
  log. This is not a clean full-repository typecheck or a baseline equivalence claim.
- Production build was not run: the required complete pinned dependency install
  and canvas builder (`tsup`) are unavailable in that tree. Full typecheck/build
  remain review gates; no hosted CI was triggered.

Reproduce focused checks with `pnpm exec vitest run apps/do/mail app/api/do/mail
app/api/do/connections/route.test.ts lib/connectors
apps/do/services/gmail-ownership.test.ts apps/do/shared/connector-contracts.test.ts
apps/do/shared/do-connector-pack.test.ts apps/do/shared/do-connectors.test.ts` after
a complete lockfile install. Locally the equivalent Vitest CLI was invoked directly
because the saved pnpm executable returned no useful execution output.

### Independent-review correction

The final-list gap identified on `f0f2180` is fixed: full metadata validation and
snapshot comparison precede proxy dispatch. Production-wiring tests change dead,
effective scopes and credential expiry while leaving health true, and assert zero
proxy calls. Default-off/invalid flag values make zero mailbox transport requests. Metadata-only
readiness may check existing account grants independently of activation; enabling
the flag without effective scopes still denies. The server comment now describes
observed-change rejection rather than promising that all revocations are detected.
Provider consistency/atomicity unknowns and live proof gates above remain open.
