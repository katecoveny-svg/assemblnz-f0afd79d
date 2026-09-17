# Portable DO: smallest connected vertical

**Status:** read-only discovery and implementation recommendation, 17 September 2026. No source edits, migration application, deployment, private API calls or account mutations. This is not release approval.

## Decision

Build **“read my selected calendar window → keep a next-day brief / unsent follow-up draft → reopen it with evidence”** inside the existing hosted workspace/widget. One explicit, owner-approved `list_calendar_events` call is enough to make this genuinely connected work. The first draft stays in DO; do not describe it as a Gmail/Outlook draft. A provider-side unsent email draft is the next small increment, behind a second exact-content approval and verified write scope.

Use **Office identity/persistence + Action Contract hashes/ledger schema + existing Pipedream connector transport**. Extend those primitives; do not create another per-agent app, revive the retired v0 store, connect models directly to arbitrary actions, or enable the generic Action Cloud routes for production as a shortcut.

The smallest useful cut needs no frontier inference, background scheduler, new OAuth system, new provider subscription or browser-extension auth bridge. A deterministic agenda/brief from validated event fields is acceptable. Optional model polish is a separately labelled draft operation, never authority to read another account or send anything.

## Current runtime, not intended product copy

| Area | Observed code | Consequence |
|---|---|---|
| Hosted widget | `components/site/assembl-the-work/GlowDoWidget.tsx:22-24,134-145` opens `app/do/DoWorkspace.tsx`, which only renders `DoBuilder`. `/do/widget/page.tsx:39` uses that same workspace. | Wire one reusable connected-job panel into `DoBuilder`; both surfaces inherit it. |
| Recipes | `app/do/DoBuilder.tsx:44-52,187-227,637-663`: `Recipe` is name/skill/direction/appearance/modules/search/template, in localStorage. Text work runs `DoTextWorkspace` or `LiveDo`. | A saved recipe is not an `AgentSpec`, durable job, approval, or connector execution. Add an explicit shared conversion/binding; do not claim the present Save button provisions an agent. |
| Existing `AgentSpec` | `apps/do/shared/types.ts:50-100` contains portable definition, textual policies, `ToolPlan`, connector requirements, runtime status/evidence. `pipeline.ts` supplies channel-neutral context/intent/outcome. | Keep this type. Add a versioned structured executable-task binding, not another agent type per provider. Treat imported runtime fields as untrusted. |
| Compiler/runtime | `compile.ts:138-199` always creates `demo:true`; calendar keywords can select a school-notice demo. `router.ts:23-45` returns descriptive local/Astra tool names. `runtime.ts:124-163` compiles/refines; `spine/orchestrator.ts` uses process-memory sessions and explicit demo HITL. | Compile/name polish is not execution. Do not infer real connector authority from brief text, `demo:false`, model availability, a tool-name string, or an interruption approval. |
| Retired path | `app/api/do/agents/compile/route.ts` returns `retiredDoResponse()` (410). `apps/do/shared/store.ts` is unowned file/global-memory demo storage. | Never reopen `/agents/*` simply to make activation work. |
| Connections | `app/api/do/connections/route.ts:16-86` derives the owner, filters provider accounts, exposes availability and healthy status, mints Connect links. `apps/do/services/owner.ts` uses `auth.getUser()`, rejects anonymous users, derives `do:user:<uuid>`. | Reuse this identity and OAuth path. A connected badge is not an executed action or proof of a particular OAuth scope. |
| Connector transport | `lib/connectors/pipedream.ts:314-354` verifies mapped action + owner + healthy app, overwrites the correct auth prop, calls Connect actions/run. | Reuse transport after strengthening its execution contract. It currently selects the first matching account, accepts arbitrary `data`, has no idempotency/approval/job linkage, and reports `ok:true` for any successful HTTP response without action-specific result verification. |
| Only current live-action caller | `lib/agents/action-requests.ts:188-200` calls that transport behind the admin request path. | Do not route personal DO through admin tenant requests. That payload carries `externalUserId`; it is not a signed-in DO owner boundary. Its `email_draft` branch actually sends via Brevo (`218-234`), unlike `connector_action/create_email_draft`. |
| Durable Office | `apps/do/services/office-jobs.ts:146-225` saves Builder plans in `do_agents.spec`, then events/acceptance receipts. It fails closed when storage is unavailable. Shared `office-jobs.ts:153-185` parses only `kind:'builder_job'`. | Extend the owner repository to a discriminated portable-job payload. Existing save is not an atomic execute/permit/receipt transaction and acceptance does not mean execution. |
| Office projection | `app/do/office/page.tsx:73-84` explicitly leaves unowned legacy agents empty and lists only owner Builder jobs. | Add owner portable-job listing and exact job reopen links, rather than populating from the legacy store. |
| Action Cloud | `lib/do/action-cloud/store.ts:101-107` always returns a process-memory store. `service.ts:60-159` prepares only `demo.echo` and sets `owner_id:null`; permission/execute functions have no authenticated-owner parameter. | Reuse contract/hash/schema concepts, **not these unscoped lifecycle functions** for live work. The SQL tables are not evidence of a durable runtime. |

**Production guard caveat:** task context says Action Cloud is production-guarded. In this checkout `app/api/do/action/prepare/route.ts:13-30` itself has no auth/origin/production gate, and `lib/supabase/middleware.ts` only protects `/app`, `/account`, `/dashboard`, `/internal`. The inspected root middleware contains no Action Cloud-specific gate. An external/release guard may exist, but was not verified here. Parent must reconcile that before enabling any real adapter; do not rely on this report as confirmation of that guard.

## Exact reuse and proposed seams

Existing files are reused/extended; the proposed new files/routes below do not yet exist.

1. **Portable definition:** extend `apps/do/shared/types.ts` and `pipeline.ts`; add pure `apps/do/shared/connector-jobs.ts` for strict schemas, recipe-to-definition conversion, task binding, coarse Office projection, and immutable snapshots. Preserve `AgentSpec.primitive='prepare'` or `'extract'`; no new primitive is needed for the first job.
2. **Pack:** extend `apps/do/shared/do-connector-pack.ts` with versioned executable contracts. Each entry needs input schema, server-owned provider prop mapper, result parser, verification rules, required grant/capability, side-effect class, and retry semantics. `DO_PIPEDREAM_ACTION_ENTRIES` is metadata today, not an executable input contract. `PIPEDREAM_ACTION_MAP` currently duplicates it; converge on one source only after the separate connector-schema audit establishes correct props.
3. **Owner persistence:** extend `apps/do/services/office-jobs.ts` and `shared/office-jobs.ts` with `portable_job` parsing/list/get. Do not cast a connector job into `BuilderJob` or call the Builder status-based success guard for it.
4. **Authority/execution:** add `apps/do/services/connector-jobs.ts`, using `lib/do/action-contract/hash.ts` and a new **owner-explicit, atomic** `lib/do/action-cloud/owner-store.ts` over the existing SQL tables. Do not globally replace `getActionCloudStore()` and thereby expose old unowned handlers to live rows. Reuse the UniversalResponse envelope where useful, with explicit domain state/verification truth; do not reuse its demo verifier.
5. **Provider seam:** extend `runConnectorAction` (or its internal approved-operation variant in the same module) to require the exact prepared account reference and a typed registered operation; re-resolve and verify owner/app/health at execution. Return a classified result, not arbitrary provider errors/bodies to the widget. No caller-controlled URL, component id, OAuth prop, project, external owner, or generic configured_props.
6. **HTTP surface:** proposed `/api/do/jobs` POST/GET and `/api/do/jobs/[id]` GET/POST. Mutations discriminate `prepare`, `decide`, `execute`, `cancel`; every operation validates its own required payload. Use `doOwner`, `sameDoOrigin`, `privateDoHeaders`, and bounded JSON parsing (`readDoJson`). For the first hosted-only cut, do not use broad extension-origin acceptance as authorization. Responses fail closed without storage or session.
7. **UI:** new `components/do/DoConnectorJobPanel.tsx` mounted in `app/do/DoBuilder.tsx`; adapt the existing connection-state functions in `shared/do-connectors.ts`. Extend `app/do/office/page.tsx` to load the same owner-bounded job; `/do/widget?job=<uuid>` reopens it. A query parameter is a locator, never credentials.

The connector audit is separate. No primary-source connector research was duplicated here. The exact production `configured_props`, output schemas, component versions and scopes must come from that audit, not guessed from component names.

## Bounded lifecycle

### A. Prepare: explicit user intent, no private read yet

User chooses **Calendar brief**, account, calendar and absolute date window. Convert “tomorrow” to visible absolute instants plus the chosen timezone once; never silently reinterpret it on retry. Domain fields can be `calendarId`, `timeMin`, `timeMax`, `timeZone`, `maxResults` (proposed application contract, **not claimed provider prop names**). Enforce a small window/result cap and a compact field allowlist. Define incomplete/paginated results explicitly; never call a truncated result a complete day.

An existing/imported `AgentSpec` is input to validation, not authority. Server recreates/normalises identity/status/policy, removes client evidence/approval claims, and binds only an explicitly selected registered action. A compile/model result may propose this selection but cannot approve it. Imported recipes receive a new owner-bounded identity; approval/result/run identifiers never travel in an export.

Persist `do_agents.spec` as a versioned envelope, for example:

```ts
{ kind: 'portable_job', schemaVersion: 1,
  agentSpec: /* validated current AgentSpec */,
  taskBinding: { packVersion, action: 'list_calendar_events', app: 'google_calendar' },
  currentReview: { generation, actionId, prepId, permitId },
  state: 'awaiting_approval' }
```

The envelope is the Office/job projection. Each prepared `do_action_runs` child retains the immutable AgentSpec snapshot and executable input contract. Do not hash the mutable status/projection as the approved spec after execution.

Canonical prepared args bind **job id + review generation + AgentSpec snapshot hash + task/pack/schema version + exact account binding + provider component/version + exact normalised provider inputs + retained context/source references + limits**. Use `argsHash` over JSON-safe values (it rejects `undefined`); retain the exact hashed snapshot. Never hash only the displayed prefix. Secrets/tokens are not retained. Account reference is server-owned/non-secret and revalidated; a display label is insufficient.

GET connections currently strips account IDs. Either safely expose an owner-filtered opaque account reference for selection, or resolve one server-side and require a new preparation when it changes. Do not silently switch to the first remaining healthy account after approval.

A save/prepare retry with the same owner + idempotency key + exact content returns the same job/preparation/pending permit. A reused key with changed content returns 409. Creating a new review increments a persisted generation even if the visible text and timestamp are identical. Preserve old snapshots, invalidate old pending authority, and never overwrite a prior outcome.

### B. Approve and execute

Show: connected account, calendar, exact time range, fields read/retained, “read only; draft remains in DO”, and the approval expiry. Use one affirmative **Read this calendar window** decision. Although the current pack says read/draft do not require approval, this vertical deliberately requires an explicit initial read grant and later external draft-write approval; stricter policy is permitted. Decline does not invoke a connector.

Decision payload must contain `jobId`, `expectedGeneration`, `prepId`, `permitId`, `argsHash`, `decision`, and an idempotency key. Missing/malformed/stale values fail; never substitute the current permit for an old tab's decision. On 409, show the conflict and refresh without automatically approving the replacement. Auth loss clears private job content.

Execution receives those same expected identities, **not new inputs**. The server reloads the owner-bound preparation, rechecks policy/registered action/current review/account/grant, then atomically claims the approved operation and consumes its single permit use. Only the winner calls the connector. Ownership and exact-chain checks precede cache hits. Provider execution is outside the DB transaction; the durable claim makes this honest across crashes.

### C. Verify, retain and reopen

Parse the real provider action result, distinguish HTTP success from component success, and validate calendar events/timezone/window/limits. An empty verified list is a legitimate empty result; missing/malformed data is not. Do not use Action Cloud's current `result_present` or arbitrary client-supplied verification checks as provider verification.

Retain only the agreed compact calendar data and deterministic draft, with capture time, source/event references, completeness flag, and verification method. Treat returned event text as untrusted data, never new instructions. Derive `result_digest` with `resultDigest` from exactly the retained outcome, and use a separate digest if proving a transient raw response without retaining it. A hash alone is not enough to reconstruct the output.

Finalise the action result, append-only `do_action_receipts` proof, Office `do_receipts` summary/reference, event and job projection in one transaction. `do_receipts.kind='event'` is sufficient for the first outcome; do not mint `build_succeeded` or claim provider writes. Success is visible only after the final durable readback. Store a precise state for provider outcome known but persistence incomplete; never invent a receipt or redispatch because the response was lost.

A receipt needs owner/job/action/preparation/permit identities, generation, AgentSpec hash, approved args hash, result digest, pack/adapter version, captured/executed/verified timestamps, provider execution/resource reference where returned, decision actor, verification checks, and the truth boundary. `AgentSpec.evidence` is a display projection of that proof. Extend `DoEvidenceSource.kind` with a connector source rather than labelling it fixture/page; keep authoritative hashes in the ledger.

### Retry/crash contract

- Complete same-operation retries return the same result/receipt; no second connector dispatch or timestamp churn.
- Concurrent requests see the existing claim/in-progress job; uniqueness plus row-lock/CAS, not an in-process map, serialises authority.
- An expired claim for a **read-only** operation can be recovered under a bounded retry policy. If no successful snapshot was committed, it may read again; record its new capture time. Do not promise exactly-once external reads across crashes.
- A future **write** that times out after dispatch is `indeterminate`, not safely failed. Reconcile using the provider's documented idempotency/execution/resource reference; without that capability, do not automatically repeat it. A newly issued permit must not conceal an unresolved prior write and cause a duplicate.
- Cancellation/review replacement racing execution is resolved by the same atomic authority transition. Once dispatch is claimed, cancellation cannot promise the external effect was prevented. No new review may create another write until the in-flight result is resolved.
- Storage failure before claim => no provider action. Storage failure after provider response => no fabricated success and no blind write retry. Reopening on another worker sees the durable pending/indeterminate record.

## Actual schema present vs schema required

**Applied status is unknown for every migration below.** Only local SQL and source were inspected; no database/project/schema-history query was made.

| Local migration | Existing usable shape | Missing for live authority |
|---|---|---|
| `20260916090000_do_office_persistence.sql` | `do_workspaces`; `do_agents(owner_id,workspace_id,primitive,status,spec)`; handoffs; `do_receipts(evidence)`. Owner RLS also checks parent workspace/agent. | No persisted review/CAS version; Office receipts are owner-mutable (`FOR ALL`); personal workspace creation has lookup-then-insert without uniqueness. |
| `20260916120000_do_job_events_and_receipt_kinds.sql` | Adds `build` primitive; receipt kinds and unique `(owner_id,idempotency_key)`; `do_job_events`, unique `(owner_id,event_id)`, parent-aware RLS. | These keys deduplicate records, not connector dispatch or changed-content retries. Events remain owner-mutable. Saves/events/receipts are separate calls. |
| `20260917090000_do_action_cloud.sql` | `do_action_runs` with args/hash/result/verify/stage log; tenant idempotency; `do_permits` with expiry/revocation/uses; `do_action_receipts` with args/result hashes and one receipt/action; `do_waits`. | Runtime adapter is absent. Owner can be null; relationships are unbound text, no composite parent-owner FKs; run/permit owner policies allow direct owner mutation; receipt owner insert is not proof of server execution. No job FK/review/CAS/claim/recovery identity. |

Recommended **one additive portable-execution migration** (proposed, not applied), not a new generic jobs database:

- `do_agents`: persisted `revision bigint NOT NULL DEFAULT 0` for compare-and-swap. Keep the portable envelope in `spec`; retain original Builder payloads unchanged.
- `do_action_runs`: nullable-for-legacy `do_agent_id uuid`, `workspace_id uuid`, `review_generation bigint`, `agent_spec_snapshot jsonb`, `agent_spec_hash text`, `execution_state text`, `claim_id uuid`, `claimed_at timestamptz`, `lease_expires_at timestamptz`, `attempt_count integer`, `provider_execution_id text`. Require the relevant fields/owner and valid states for `namespace='connector'`; keep exact executable inputs in existing `args`, output in existing `result`, checks in existing `verify`.
- `do_permits`: `review_generation bigint`, `decision` (`pending|approved|rejected`), `reviewed_by uuid`, `decided_at timestamptz`; connector permits require approved decision, fixed server scopes/expiry/max_uses=1 before claim. Existing revocation/uses remain useful.
- Add ownership/job consistency FKs and uniqueness: runs → `(do_agents.id,owner_id,workspace_id)`; permits → exact run/preparation/owner/tenant; action receipts → the matching owner/run/permit chain. Add the referenced composite unique indexes as required. Connector tenant identity is derived by the server, not supplied by the widget. Receipt/run indexes already exist, but validate their scope and conflict handling.
- Enforce connector prepared snapshots as immutable; final execution/verification/receipt facts are server-only. Existing owner RLS is necessary for privacy but insufficient for trustworthy authority. Remove direct authenticated INSERT/UPDATE/DELETE authority for connector lifecycle rows and proof projections; keep owner SELECT. Preserve unrelated legacy/Builder behaviour with explicit scoped policies/guards. Any service-role write bypasses RLS, so its repository must independently constrain every query to the authenticated owner and parent chain.
- Implement narrow server-only transactional operations: `prepare_owner_connector_job`, `decide_owner_connector_job`, `claim_owner_connector_action`, `finalize_owner_connector_action`. These are proposed RPC names, not existing functions. Each validates expected versions/content, locks the correct owner rows, and handles unique-conflict retries. Harden grants/search_path; do not expose a generic update/claim RPC or trust caller-supplied execution results. The service identity is obtained server-side after `doOwner`, never accepted from request JSON.
- Prepare atomically creates job + immutable run + pending permit + `job_accepted` receipt/event. Finalise atomically records outcome + authoritative receipt + Office reference + status. Do not turn `recordOwnerReceipt` into an arbitrary client success endpoint.
- If creating a personal workspace automatically, enforce one personal workspace per owner atomically (inspect existing duplicates before a partial unique index). Reuse owner read/error handling from Office; missing schema is a safe 503, never process-memory fallback.
- `do_waits` and a scheduler are **not required** for this first bounded synchronous read. Persisted claims/status plus owner reopen are sufficient; longer/background work requires a separately verified durable worker later.

These are prerequisites, not a suggestion to apply the existing Action Cloud migration and flip a feature flag. Applying a migration, fixing RLS/grants and proving its real behaviour remain parent/release-owned.

## Second increment: provider-side unsent draft

Reuse the same job/prepare/permit/claim/result/receipt flow for `create_email_draft`, referencing the verified calendar outcome digest. The user reviews the **exact recipients, subject, body and account**. Any edit needs a new prepared review and approval; no send action exists in this vertical. Keep attachments and CC/BCC out initially.

`gmail-create-draft` and `microsoft_outlook-create-draft-email` are present in local mappings, not proof of runtime correctness. Gmail's DO connection flow is documented in-code as `gmail.readonly`; do not silently broaden it or imply it authorises draft creation. Verify the separate audit's real write scope and component/output schema first; user reconnect/reconsent is an explicit step. Outlook may be the first draft provider if its verified grant already supports the operation. A returned draft/resource id and documented draft-state check are the success contract. Without verified write-idempotency/reconciliation, keep timeout results indeterminate and automatic retries disabled.

**A created calendar event is not an unsent draft.** The pack calls it “draft-style” in one description, but it is a real external write and could affect invitees. Exclude it from the first cut.

## Acceptance tests required before “working”

Proposed test files: `apps/do/shared/connector-jobs.test.ts`, `apps/do/services/connector-jobs.test.ts`, actual `/api/do/jobs` and `/api/do/jobs/[id]` route tests; provider tests in `lib/connectors/pipedream.test.ts`; real local-DB/RLS integration tests plus a browser test of the hosted panel. Use synthetic data and fail network closed for unit tests.

1. **Real caller path:** widget → same DoBuilder panel → durable prepare → exact approval → registered connector → final ledger. Assert no legacy store, admin request dispatcher, generic demo lifecycle or direct model tool call is used.
2. **Strict input:** no owner/tenant/account/component/auth prop/provider URL injection; unknown fields/actions rejected; explicit valid `AgentSpec` retained; recipe import cannot import approval/evidence or auto-run; calendar window/timezone/result cap enforced.
3. **Auth/privacy:** anonymous auth (including Supabase anonymous users), cross-owner list/get/prepare/decide/execute/receipt, missing/foreign origin, guessed ids and child-parent mismatches fail before provider use. Same ids/idempotency keys across owners cannot adopt/leak work. Private/no-store headers throughout; logout clears UI content.
4. **Review binding:** changed account/calendar/window/context/full draft after preparation, identical regeneration at frozen time, old-tab approve/execute, same generation with replaced permit, each omitted/malformed expected identity => rejection without state/proof mutation. Current exact review works. UI never automatically resends stale approval after refresh.
5. **DB concurrency:** independent DB connections/processes race create, approve, execute, cancel and finalise; one authorised dispatch winner; owner cannot mutate their own permit uses/scope/args or insert forged executed receipts directly. Reuse-key/different-input conflict leaves old snapshot unchanged. Test real policies/constraints/RPC grants, not only mocked Supabase query chains.
6. **Retry/durability:** double-click and response-loss reuse one job/prep/permit/receipt. Restart application/store between prepare/approve/execute/reopen; no data loss. Read claim recovery is bounded. Draft timeout never repeats automatically, including after permit replacement.
7. **Storage failure matrix:** fail before prepare, during claim, after provider response, on receipt insertion and on reload. No external call without durable claim, no hidden memory save, no completed UI state without committed proof; finalisation retry does not re-execute.
8. **Provider honesty:** exact selected owner/account only; grant revoked/unhealthy/switched/missing scope fails closed; 200 with component error, malformed events/draft result, timeout, 429/5xx are distinct; no speculative field names; pagination/empty-result and timezone boundaries tested. No send/create-event component call at all in first cut.
9. **Proof chain:** recompute retained snapshot/args/outcome hashes; job/run/prep/permit/reviewer/generation all match; original snapshots remain unchanged after later reviews; retries return original receipt. Unknown verification checks cannot pass. `job_accepted` never becomes execution evidence.
10. **Hosted proof with authorised signed-in user:** connect or select an already connected test account; display the exact calendar window; approve a read; see actual events (or verified empty list), retained draft and provider-linked receipt; hard refresh/new browser session/Office reopen shows the same job and hashes. Confirm no provider writes. Only after separate consent, test the external unsent draft and confirm it is not sent. Capture redacted UI/API/DB evidence; do not export private calendar content to public logs/screenshots.
11. **Portability:** same shared definition/contract serialises for widget and another surface without copying private results, tokens or permits. A different signed-in owner importing it must connect/select their own account and explicitly approve new work. Hosted success is not proof extension/Mac auth works.
12. **Regression/brand:** existing Builder saves still mean plan acceptance, all retired routes remain retired, existing production gates remain closed; mobile 375px, keyboard, pending/denied/unavailable states and current plum/Instrument Sans/IBM Plex Mono styles verified in the parent UI pass.

## Checks actually run

Local, mocked/pure tests only:

```sh
pnpm test lib/connectors/pipedream.test.ts app/api/do/connections/route.test.ts apps/do/services/office-jobs.test.ts apps/do/shared/office-jobs.test.ts apps/do/shared/do-connector-pack.test.ts apps/do/shared/policy.test.ts lib/do/action-cloud/action-cloud.test.ts
```

**Observed:** exit 0, 7 files passed, 52 tests passed. Scoped source/test SHA-256 aggregate before and after the run matched: `0c5721a00dc45805ddeb42c6ad1d8a2bee5584017acdc21deb517b2cbd93555c`. This checks the existing building blocks; it does **not** prove a connected DO job, real database persistence, authenticated browser session, OAuth scope, provider action schema or production deployment. Full build/release/auth UI remain parent-owned.

## Release blockers and broader pack

- No confirmed signed-in test session, no verified migration application, no durable connector lifecycle implementation.
- Exact provider schemas/scopes/results remain the separate audit's dependency. Existing pack tests validate local strings, not real API execution.
- Action Cloud production-gate location needs reconciliation with inspected source before any adapter expansion.
- Current mutable/unowned demo authority paths and owner-mutable SQL authority records are not safe live execution foundations as-is.

Generalise by adding **validated pack operations**, not apps: the same job state machine, identity, approval panel, adapter boundary and receipts serve calendar, mail, documents, sheets, CRM and tasks. Each operation carries verified schemas, scope, risk, verification and retry contracts; mark unsupported/unverified operations unavailable. Read, prepare-in-DO, external-draft-write and consequential-write are distinct capability states. Do not turn a catalogue entry or green Connect badge into “all connectors working”. No spend or recurring purchase was made for this discovery.
