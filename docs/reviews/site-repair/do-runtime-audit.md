# DO runtime, connectors, portability and auth audit

**Baseline:** `hermes/site-runtime-repair`, starting at `4bda9aaf5` from `origin/main` in `katecoveny-svg/assemblnz-f0afd79d`.  
**Scope:** source audit, bounded local route/unit probes and native compile check. No application code changed. No live provider calls, OAuth grants, customer-account reads, external actions, deployment or native-app launch performed.

## Outcome

There is a useful, tested preparation and permission foundation. It is **not yet one durable, portable execution runtime**. Credentials alone cannot make it one.

The release-blocking finding is an unowned Browser Runtime store/API that can expose captured page context to an anonymous caller. The next issues are false durability/storage claims and a browser-extension capture path that does not authenticate the owner or reliably attach a receipt. Keep the live-conversation production guard and retired v0 agent routes closed; neither should be reopened as a shortcut.

Evidence:

- **21 existing test files / 123 tests passed**, in two focused runs below.
- **8 deliberate out-of-tree regression probes failed**, each exposing the specific behaviour recorded below. These are audit tests against desired safe behaviour, not failures in the existing test suite.
- The native Swift companion passed a compiler typecheck. This is not signing/notarisation, permission, login or cross-device proof.
- `.env.local` exists. Its **variable names only** were inspected; no secret values were reported or copied. Several required capability variables are absent from this local file. Deployment configuration and connected-account health were not inspected.

## Context and precedence

Loaded: `START_HERE.md`, `AGENTS.md`, `config/context-manifest.json`, `docs/context/CURRENT.md`, `docs/context/README.md`, relevant DO sections of `docs/assembl-context.md` and `docs/factory/PRIMITIVES.md`, `docs/ENVIRONMENT.md`, `docs/do-action-cloud/README.md`, `docs/do-templates/DO-PORTABLE-AGENT.md`, native README, and the source/tests cited here.

The current shape is **Pursuit finds, DO does, Studio shows, Factory underneath**. The Action Cloud package's older enterprise/vertical framing does not override current company canon. Its Phase 1 implementation and broader build briefs are distinct. Browser/Sponsored previews are not live provider integrations. Historical material in the Assembl skill was not used as current brand/product truth.

## Ranked findings

### 1. P0 — Browser Runtime has no owner boundary around real captured context

**Reproduced locally, no provider or database needed.**

- `app/api/do/browser-runtime/route.ts:58–73`: GET returns `listBrowserRuntimeJobs()` to any caller; there is no authentication or owner filter. `?job_id=` returns the full packed job.
- `app/api/do/browser-runtime/route.ts:76–151`: POST only checks Origin when present, then permits create, context capture, proposal, permit approval and artifact creation by job ID. No authenticated owner is established.
- `apps/do/shared/browser-runtime.ts:103–125`: one process-global map; jobs have no owner field. `:158–165` retains the source URL, title and first 280 characters of page text.
- `apps/do/extension/sidepanel.js:326–354` offers capture of the actual user's current page into this API. A preview label does not make that real context safe to share.

**Probe:** create a synthetic job, lock the marker `AUDIT_PRIVATE_CONTEXT_NOT_REAL_USER_DATA`, then call GET without cookies. Actual result:

```text
browser-runtime anonymous {"status":200,"leakedMarker":true}
```

A caller does not need to guess the ID because the list enumerates it. The same instance allows mutation by returned ID. This is not a claim that production private data was accessed; the probe used only synthetic data in the local process.

**Narrow fix candidate:** make the preview fixture-only/client-local immediately, or require `doOwner()` and enforce owner binding for every list/get/mutate operation. Do not accept a caller's `ownerId` as identity. Use the existing owner-scoped repository/RLS pattern, not a second anonymous store. Add denial tests for anonymous list/get, owner B reading/mutating owner A's job, and changed/replayed context after permit.

**Tests to extend/add:** `apps/do/shared/browser-runtime.test.ts` currently covers three happy-path/state behaviours; add `app/api/do/browser-runtime/route.test.ts` with the ownership cases. The out-of-tree P0 test is an exact starting point.

**Related legacy risk:** `app/do/office/page.tsx:73–76` calls unscoped `listAgents()` before auth, from the global/file-backed v0 store (`apps/do/shared/store.ts:26–85`). Retired writes limit current exposure, and this audit did not seed that store. Remove it from user-specific Office projection or explicitly restrict it to labelled public fixtures; do not reactivate the old agent API against it.

### 2. P1 — “Durable” and “stored” are response labels, not persistence guarantees

**Reproduced locally.**

**Household Floor is always process memory on its server path:**

- `apps/do/shared/household-floor-store.ts:9–76` contains only maps, including the route singleton.
- `app/api/do/household/route.ts:210–215` writes that map and sets `durable: Boolean(owner)`.
- A signed-in install returned `durable:true`; after resetting the process-memory repo the floor was gone.

```text
household durability {"status":200,"claimedDurable":true,"presentAfterMemoryReset":false}
```

**Builder uses real Supabase operations, but its fallback is hidden:**

- `apps/do/services/office-jobs.ts:143–146,221–224` falls back to process memory for recognised missing-storage errors.
- `app/api/do/builder/jobs/route.ts:70–78,136–144` always emits `durable:true`, regardless of which repository served the operation.
- The out-of-tree probe mocked an authenticated owner and a missing-client configuration error at the persistence seam. It returned `200`, `durable:true`, and a `job_accepted` receipt. In an entirely unconfigured real app, `doOwner()` normally blocks this earlier; the probe isolates the erroneous storage contract rather than claiming that auth succeeds without Supabase.

```text
builder fallback {"status":200,"durable":true,"receiptKind":"job_accepted"}
```

**The normal structured database-error path misses that fallback entirely:**

- `useMemoryFallback()` turns a plain PostgREST error object into `[object Object]`, losing `code`/`message`.
- Supplying a structured `PGRST205` missing-table error through the mocked Supabase query chain returned generic HTTP 500, not an explicit storage-unavailable result.

```text
builder schema error {"status":500,"error":"save_failed","message":"Could not save Builder job."}
```

**Narrow fix candidate:** return explicit storage provenance (`durable`, `process-memory`, `device-local`, or unavailable) from the repository, propagate it to every response/card, and fail closed with a useful 503 where the user requested durable save. Recognise typed database errors without copying raw server detail to the browser. Do not silently downgrade a production durable write.

**Extend:** `apps/do/shared/office-jobs.ts` and `apps/do/services/office-jobs.ts`, with existing `do_workspaces`, `do_agents`, `do_receipts`, `do_job_events` migrations. Add service tests that run the real adapter against mocked Supabase errors, plus restart/cross-instance persistence tests. Existing `app/api/do/builder/jobs/route.test.ts:27–32` replaces the service with `MemoryOfficeJobsRepo`, then asserts `durable:true` at `:88`; that test currently encodes the misleading contract. Household needs the same owner/storage contract, not another parallel persistence system.

### 3. P1 — Extension browser-seat capture can say “stored” while attaching nothing

**Unattached response reproduced; transport gap established from code. Native/extension login in a real browser was not exercised.**

- `apps/do/extension/sidepanel.js:283–287` calls the site from a `chrome-extension://` origin without an explicit credential mode or bearer handoff. Fetch defaults to `same-origin`, so this cross-origin request does not carry the site session.
- `app/api/do/browser-seat/route.ts:93–118` only attaches a receipt if `doOwner()` resolves and an in-memory floor for that owner/ID already exists. Otherwise it quietly continues.
- `:120–130` responds 200 with `floor:null` and **“Capture stored for review”** even when there was no attached floor and `learnMode:false` stored no playbook either.
- The `do-browser-seat:<uuid>` string at `:65–71` is a correlation key, not authentication or a secret. Do not elevate it into a credential.

```text
browser-seat unattached {"status":200,"floor":null,"honesty":"Capture stored for review. No form was submitted and no payment was made."}
```

**Narrow fix candidate:** first return an explicit attachment/persistence state and never claim storage on the detached path. Then route consented capture through the authenticated hosted surface or an approved bounded extension-session mechanism. If using credentialed CORS, align the client, Origin allowlist, response headers and cookie policy; changing only `credentials` is not the whole design. Require owner-bound floor lookup before storing a playbook. Preserve one-click consent and review boundaries.

`allowedDoOrigin()` currently accepts **any** syntactically valid Chrome-extension ID (`apps/do/shared/http.ts:8`). Do not attach privileged credentialed access to that broad rule without a deliberate extension trust policy.

**Tests to extend:** `app/api/do/browser-seat/route.test.ts` mocks auth to null and expects a successful receipt (`:63–110`), but never proves Office/Household attachment. Add signed-in owner A/owner B, missing-floor, no-credentials and process-reset cases. `apps/do/shared/sidepanel.test.ts` is useful source/shape coverage, not an actual browser login round trip.

### 4. P1 — Public preparation readiness omits the mandatory trial-store dependency

**Reproduced with the service-role variable absent; directly relevant to current local configuration.**

- `apps/do/shared/preparation-server.ts:9–16` advertises `extraction:'available'` and either “Ready to prepare” or “Text extraction available”.
- `app/api/do/prepare/route.ts:30–33` always reserves an anonymous trial, **including deterministic extraction**.
- `apps/do/shared/trial.ts:39–42,55–88` requires `SUPABASE_SERVICE_ROLE_KEY`, an identified client IP and the `agent_chat_sessions` store for an anonymous call.
- The current local `.env.local` declares public Supabase and Anthropic names, but **does not declare `SUPABASE_SERVICE_ROLE_KEY`**. No value validity is implied by name presence.

```text
extraction readiness {"advertised":"available","status":503,"error":"trial_unavailable"}
```

**Narrow fix candidate:** either make provider-free extraction genuinely independent of the provider trial allocation (retain abuse limits), or make availability include allowance/storage health and show the specific blocked state before asking for consent. Do not fabricate quota data or insert placeholder secrets. Public generated tasks still need the real protected trial store. Signed-in tasks bypass this network quota, but require a real Supabase session and are still rate-limited.

**Extend:** `getDoAvailability()`, `readDoTrial()`, `reserveDoTrial()`, runtime/prepare route tests. Existing preparation and trial tests pass individually; add the no-config integration test crossing both seams.

### 5. P1 delivery gap — Connectors, AgentSpec and action services are not wired into one portable worker

**Source-verified boundary, not a fabricated failing upstream integration.**

- The current hosted path is `DoWorkspace → DoBuilder → DoTextWorkspace → /api/do/prepare`. The preparation service explicitly has **no external tools**, never fetches source links, and returns a reviewed draft (`apps/do/shared/preparation-server.ts:53–86`). This is useful functionality; it is not background execution.
- Production `DoBuilder.tsx:553–565` deliberately disables the local web-search/specialist conversation branch. `/api/do/live` is explicitly development/loopback-only (`app/api/do/live/route.ts:53–65`), with a production-denial test. **Do not remove this guard** to make hosted conversation appear enabled.
- `apps/do/shared/types.ts:50–99` supplies AgentSpec/policy/connector declarations, but the v0 agent CRUD/compile/activate/tick/approve routes, `/api/do/message`, `/api/do/clear`, `/api/do/share`, `/api/do/templates` and `/api/do/surfaces` now return 410 via `retiredDoResponse()`.
- `/api/do/live-compile` makes a prepare-only spec (`active:false`), not an activated durable worker.
- Browser Runtime and Sponsored Journeys use `lib/do/action-stub`; they have not been moved to the Action Cloud lifecycle. Action Cloud itself only accepts `demo.echo`, sets `owner_id:null`, and `getActionCloudStore()` always returns memory (`lib/do/action-cloud/store.ts:101–107`). A migration being present is not proof that runtime storage is wired.
- `/api/do/mcp` chooses a **global spike or household allowlist** from client `scope`; it does not load an owner's saved AgentSpec. It accepts `approved:true` rather than a prepared, payload-bound permit (`app/api/do/mcp/route.ts:27–30,93–125`). Keep this narrow/draft-first before extending writes/spend. Receipts are returned, not appended to Office's durable audit trail.
- `lib/do-mcp/runtime.ts` is called by the MCP route, not the hosted preparation runner. Pipedream execution is reached through the separate existing `lib/agents/action-requests.ts` operator-approved dispatch path; declaring a connector on a DO does not automatically expose it to a worker.
- Zapier execution is explicitly `not_implemented`; Hub discovery has no wired public catalogue API. Configured keys do not remove these code gaps. `lib/do-mcp/providers.ts:69–87` nevertheless marks Zapier/Treg “ready” from key presence; refine this to distinguish configured, connected, implemented and exercised.

**Narrow next vertical slice:** use one owner-scoped persisted AgentSpec/job; resolve a server-side allowlist from it; execute **one bounded read or reviewed draft** with the existing connector adapter; persist a result receipt; reopen that same job from hosted DO and the companion. Prove two-owner isolation and repeat/restart behaviour. Reuse existing policy/permit/receipt primitives instead of making another general agent runtime. Keep schedules, long-running work, external sends and broader provider rails explicitly out of the first slice.

**Primitives worth preserving:**

- `AgentSpec`, `compileAgent`, `enforceApprovalPolicy`, preparation evidence hashes and review invalidation.
- `doOwner()` and authenticated Supabase RLS owner pattern.
- `MemoryOfficeJobsRepo` as a clearly labelled test/local adapter, not a durability assertion.
- `lib/connectors/pipedream.ts` account ownership checks and bounded Gmail reader.
- `lib/agents/action-requests.ts:135–173` atomic claim of a pending approval, operator identity and `ACTION_DISPATCH_ENABLED` gate; adapt authority carefully rather than bypassing it.
- Action Contract's argument hash, permit expiry, idempotency and receipt-before-execute protection. Add ownership and durable storage **before** adding real provider actions.

### 6. P2 — Origin checks diverge across preparation and auth/connection routes

**Reproduced with a documented local host alias.**

`apps/do/shared/http.ts:9–16` permits a request whose validated Origin matches the actual Host when Next's request URL uses `localhost`. `apps/do/services/owner.ts:11` only compares Origin to `new URL(req.url).origin`.

For `request.url=http://localhost:3000/...`, `Host:127.0.0.1:3000`, `Origin:http://127.0.0.1:3000`:

```text
origin policy {"allowed":"http://127.0.0.1:3000","same":false}
```

This can make preparation accept a local origin while `/api/do/session`, connections, voice or MCP refuse it. It is not proof that production forwarding uses this mismatch.

**Narrow fix candidate:** one validated web-origin primitive, with separate explicit policy for extensions. Do not simply replace every web-only check with the current all-extension helper. Add localhost/loopback, apex/www, foreign origin, missing origin and forwarded-host tests at the request boundary. For immediate local QA, keep browser and server origin consistently on `localhost` or consistently on the same loopback host/port.

### 7. P2 — Composio execution treats HTTP 200 as action success without checking its body

**Defensive response-contract probe, not a live Composio failure claim.**

`lib/do-mcp/composio.ts:107–120` returns `ok:true` for any 2xx response, even parsed JSON saying `successful:false` or non-JSON returned as `raw`. `lib/do-mcp/runtime.ts:155–162` then makes an `ok` receipt saying the tool ran.

A mocked HTTP-200 payload with `successful:false`, an error and `data:null` returned `ok:true`. The exact currently documented upstream response schema must be checked before implementation; this audit did not call Composio or validate its live API version.

**Narrow fix candidate:** validate the current provider success/error envelope, reject malformed payloads, and only issue an execution-success receipt when both transport and action succeeded. Add adapter tests using documented success, error-in-200, malformed JSON, timeout and missing-owner fixtures; keep receipt text independent of raw upstream error bodies.

## Portability and distribution truth

- **Web / widget:** same hosted preparation UI, not shared durable agent state. Recipes, memory, task lists and prepared drafts use browser storage. `apps/do/shared/do-tasks.ts:1–7` correctly distinguishes local human to-do lists from durable Office execution jobs. Keep that distinction.
- **Chrome:** existing consented capture/sidepanel/postMessage structure is worth extending. The manifest only allows the production `www` host and local port 3000 for host access; arbitrary preview deployments/ports are not configured (`apps/do/extension/manifest.json:21–25`). Distribution is a load-unpacked zip, not a store installation.
- **Mac:** the Swift companion embeds the production widget, captures explicit selected text through Accessibility, refuses secure fields and only pastes reviewed text without Send/Return. It is hard-bound to `https://www.assembl.co.nz` (`DOCompanion.swift:25,107–122,146–180`); there is no preview base-URL setting. External/new-window links open in the system browser. Header sign-in therefore opens outside the WKWebView cookie store; a same-WebView password route may be possible elsewhere, but a complete native login return/session handoff was not proven. Require an actual approved login test rather than assuming browser cookies transfer.
- **Native proof:** Swift typecheck passed. No app was launched, no permission prompt was accepted and no credential was typed. `apps/do/macos/README.md` correctly calls this an ad-hoc local development companion. `app/api/do/download/route.ts:90–115` returns source for Mac, not a notarised public installer. Apple Developer ID, notarisation, release/update process, Intel/universal build and on-device approval/login tests remain separate work.
- **Mobile/PWA/share:** source stubs and local share ingress do not demonstrate portable durable execution. `apps/do/shared/surfaces.ts` labels keyboard/share/WhatsApp demo and SMS/Messenger stub, while its endpoint is retired; do not publish that old “live” surface catalogue as a current status source.

## Access and configuration blockers

Inspection was names-only. No conclusion here implies a credential is valid, a migration is applied or an upstream account is connected.

| Capability | What is needed | Local audit observation / authority boundary |
|---|---|---|
| Sign-in and durable owner jobs | Public Supabase URL/key, real account session, applied Office migrations/RLS | Public names are declared in `.env.local`; account/login and deployed schema not exercised. |
| Public anonymous prepare, including current extraction path | Service-role trial store and required `agent_chat_sessions` unique identity indexes | `SUPABASE_SERVICE_ROLE_KEY` is not declared locally or exported to this audit shell. Do not copy it from the old dirty checkout. Use approved secret tooling. |
| Hosted text generation | A working provider supported by the preparation ladder | `ANTHROPIC_API_KEY` name is declared locally; no paid generation was run and key validity is unknown. |
| Pipedream / Gmail | Project/client credentials, correct environment, enabled custom Gmail OAuth app/scopes, owner-specific healthy grant | Required Pipedream and `DO_GMAIL_OAUTH_APP_ID` names are declared; no Connect link, grant, mailbox read or upstream health check performed. Existing ownership tests pass. |
| Gemini voice | `DO_GEMINI_LIVE_ENABLED=true`, Gemini provider key, authenticated owner, service-role persistent allowance | Flag/key names are absent locally. Auth/flag/quota tests pass; no token issued. |
| Local OpenAI conversation | OpenAI key, loopback development server | `OPENAI_API_KEY` absent locally; endpoint intentionally rejects production. Hosted delivery needs a persistent authenticated session worker, not merely a Vercel env change. |
| General MCP | Provider configuration, verified API contract, per-owner connection, server-resolved allowlist and receipt path | Composio/Zapier/Treg names absent locally. Zapier/Hub code also has implementation gaps, so keys alone are insufficient. |
| Office storage | `20260916090000_do_office_persistence.sql`, `20260916120000_do_job_events_and_receipt_kinds.sql` | Files exist; migration application, RLS and cross-instance operations require approved database access/proof. |
| Action Cloud | Owner/auth and durable adapter, then staged provider rails | `20260917090000_do_action_cloud.sql` exists; runtime still uses memory and demo.echo only. |
| Public native release | Apple release credentials, signing/notarisation/update tooling and user-approved platform tests | Compiler typecheck only; no notarised install proof. |

The parent owns live browser/deployment validation. This sub-audit did not use the shared browser session or change configuration. The parent was making unrelated site edits concurrently; they are not audit-authored changes.

## Reproduction and proof commands

Run from `/Users/kateharland/assembl-site-repair`.

### Existing focused suite — both runs passed

```sh
pnpm exec vitest run \
  apps/do/shared/policy.test.ts \
  apps/do/shared/do-connectors.test.ts \
  apps/do/shared/do-connector-pack.test.ts \
  apps/do/shared/do-mcp-gateway.test.ts \
  apps/do/shared/browser-runtime.test.ts \
  apps/do/shared/office-jobs.test.ts \
  app/api/do/connections/route.test.ts \
  app/api/do/browser-seat/route.test.ts \
  app/api/do/builder/jobs/route.test.ts \
  lib/do/action-cloud/action-cloud.test.ts \
  app/api/do/action/action.route.test.ts
# Actual: 11 files passed; 56 tests passed.

pnpm exec vitest run \
  app/api/do/prepare/route.test.ts \
  app/api/do/live/route.test.ts \
  app/api/do/live-token/route.test.ts \
  app/api/do/download/route.test.ts \
  apps/do/services/gmail-ownership.test.ts \
  apps/do/shared/sidepanel.test.ts \
  apps/do/shared/preparation.test.ts \
  apps/do/shared/trial.test.ts \
  lib/connectors/pipedream.test.ts \
  lib/agents/action-requests.test.ts
# Actual: 10 files passed; 67 tests passed.
```

### Exact out-of-tree regression harness

The audit created these temporary local files, not tracked application tests:

- `/tmp/assembl-do-runtime-audit/runtime-audit.test.ts`
- `/tmp/assembl-do-runtime-audit/vitest.config.mjs`

They import the real route/services with narrow owner/database/provider-boundary mocks. Global fetch throws unless the final explicit Composio synthetic-response probe replaces it. No external network/provider operation is needed. They remain available to the parent for narrowing and promotion into the existing suites.

```sh
pnpm exec vitest run \
  --config /tmp/assembl-do-runtime-audit/vitest.config.mjs \
  --reporter verbose
# Actual: 1 file failed; 8 deliberately red regression tests failed.

# Fast highest-priority probe only:
pnpm exec vitest run \
  --config /tmp/assembl-do-runtime-audit/vitest.config.mjs \
  -t 'P0 requires an owner'
```

The `/tmp` harness is transient and not a shipped test artefact. Promote the relevant probes into repository tests when implementing a fix. Its standalone write-time TypeScript checker could not resolve repo aliases from `/tmp`; Vitest's explicit repository aliases resolved them and executed all eight tests successfully as test runs (red assertions as intended).

### Native compile check

```sh
xcrun swiftc -typecheck \
  -target "$(uname -m)-apple-macos13.0" \
  -swift-version 5 \
  -module-cache-path /tmp/assembl-do-runtime-audit/swift-cache \
  -framework Cocoa -framework SwiftUI -framework WebKit \
  -framework ApplicationServices -framework ServiceManagement \
  apps/do/macos/DOCompanion.swift
# Actual: exit 0, no compiler diagnostics.
```

## Recommended implementation order

1. Close the unowned Browser Runtime context path; prove two-owner isolation before allowing real page capture.
2. Make storage/receipt status truthful and repair the extension attachment contract.
3. Surface missing allowance/storage configuration before running public preparation; provision only through the authorised path.
4. Ship one bounded, durable, owner-scoped cross-surface read/draft job using existing primitives.
5. Validate real owner login + connector grants + result receipt + reopen from another surface. Keep paid/live calls behind explicit approval and a defined fixture account.
6. Only then extend provider actions, long-running workers and notarised/native distribution.

**Files changed by this audit:** this report only inside the repository. Temporary repro/config/compiler-cache files are under `/tmp/assembl-do-runtime-audit/`. No product/runtime code was changed.
