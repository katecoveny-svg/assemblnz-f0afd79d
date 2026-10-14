# Two-function maintenance proposal — not deployed

Explicit user permission is pending. This branch changes only proposal files/tests, not `supabase/functions`, config, workflow, data, keys or credentials. It is independent of NZ evidence feature PR #1452. Do not trigger the broad edge deploy workflow or merge source replacements into its watched paths without specific release approval.

## Exact proposed effect/mechanism

After explicit approval, use the connected Supabase `deploy_edge_function` tool twice, sequentially, for project `wurwcrgxjjwqdaxqceey`: name `mcp-nz-govt` then `compliance-scanner`, each with entrypoint `index.ts`, files containing only its reviewed `proposed/{name}/index.ts`, `verify_jwt: false` preserving the existing metadata. No imports, import map or dependencies are needed. This creates a new function version; it does not delete functions or change global/project JWT policy. The existing false setting is retained solely for the no-effects maintenance response. Do not use broad CLI/workflow deployment.

Each replacement immediately returns CORS/no-store 204 for OPTIONS or JSON 503 `{error: temporarily_unavailable, source: <exact function name>}` for every other method. No body/headers parsing, environment read, database client, logging, provider request, source fetch or write occurs. Platform request telemetry may still occur outside the handler; no handler telemetry is added. No Retry-After promise is invented. Existing in-flight executions may complete; replacing the entrypoint is not proven cancellation of already-running work. Sequential deployment creates a short window where only one function is paused; report success independently and never imply both changed if one fails.

Review deployed metadata immediately before mutation: if original versions/hashes have changed, stop and re-review/capture the new source. After approved deployment use read-only metadata/source inspection to verify new version/content. Endpoint probing remains outside the current authorization. Do not claim runtime proof from metadata.

## Exact rollback preservation

`rollback-manifest.json` records original ACTIVE versions, existing verify_jwt settings, bundle hashes, original entrypoints and SHA-256 of every retrieved source file. `rollback/` contains exact UTF-8 source returned by the read-only tool, including scanner's shared model-router dependency; no environment values or credentials are included. Unit tests hash each file against the manifest.

Originals: mcp-nz-govt v115 bundle `220eb03c30b4ddd61c033c17d75604ed6357fffddba921925d842a68c419fc58`; compliance-scanner v102 bundle `07bb6055aa5036487f1b9bd8389fe06aa9ec2f4f201d98908d61b5225a46e533`. Rollback uses the same narrowly scoped tool with the manifest's exact entrypoint/files and original false JWT setting. It creates a new version rather than restoring historical version numbers. Rebundling may change the deployed bundle hash; source hashes are the content proof. Restoring unauthenticated source reintroduces the known admission gap and requires explicit approval; it is not automatic rollback. No secrets are regenerated, copied or changed.

## Caller inventory and temporary availability

- `lib/do-mcp/nz-live.ts` invokes government edge tools for PCO live-status discovery and legislation, plus NZBN paths. It currently uses a publishable/anon key as Bearer+apikey (or no key). Those are not user authorization. Its non-2xx handler returns an unavailable error; positive live-status hints can remain cached until their TTL/recheck. The pause removes fresh upstream results, not existing knowledge/data.
- `apps/do/shared/nz-live-pack.ts` declares PCO/NZBN toolkits; `do-mcp-gateway.ts` describes the legislation path. `pco-legislation.test.ts` mocks the government function. Paused calls must not be represented as successful/live.
- `legacy-vite/src/pages/AdminComplianceDashboard.tsx:67` invokes the scanner; its existing error path displays a failed scan message. Legacy source is evidence of a caller, not proof it is deployed.
- Root app hybrid-service copy/templates reference the scanner but do not establish invocation. Source searches of scripts, workflow and migrations found no scheduler definition. External cron/scheduler configuration and runtime caller population remain unknown; no customer/cron rows or logs were read.
- Existing scanners/feeds may stop refreshing and schedulers may retry 503. Existing data remains stored; repeated calls have zero handler effects after replacement. Scheduler retry load/platform costs are not controlled by this handler. No other source adapters (including adapter-pco) are paused. Disclose temporary unavailability of these two function feeds only.

## Proper authenticated replacement — separate design, unapplied

Government tools: validate access-token signature/issuer/audience/expiry/revocation and approved client plus authoritative owner/tenant/tool scopes before parsing body or log/provider actions. Pass a verified user/delegated token from the existing server boundary instead of public key authorization. Enforce exact tool allowlists, payload/response/deadline/rate caps, minimum field projection and owner-scoped non-content audit. Authenticate at handler even when gateway verification is enabled. Do not expose a service-role key or accept anon/API key as user identity.

Scanner: separate internal service/scheduler admission from admin-user admission. Require verified narrow service identity or an existing authenticated admin with explicit run permission, POST-only, durable single-run/concurrency admission and authorised cost budget before any source/model/database activity. No new secret/key is introduced by this proposal. Identify actual scheduler mechanism/callers and migrate their authorization together. Model output remains unverified draft requiring human review; replace privileged automatic low/medium knowledge upsert with a separately reviewed workflow. Validate source URLs, output schema/provenance, freshness, idempotency, time/body/cost bounds and checked persistence errors. No production migration or source ingestion is proposed here.

Replacement tests must cover anonymous/public-key/wrong-audience/client/scope/owner/service-role misuse producing zero effects, valid admin/service admission, replay and concurrent-run rejection, budget/persistence failures, provider timeouts and safe errors. Consumer tests must prove actual user/service credentials reach only the right resource without being logged. Keep maintenance active until these tests and root/security review pass with explicit release permission.

## Local proof

`node --test scripts/test-nz-edge-maintenance.cjs`: executes both exact proposed entrypoints in a VM with all effects/environment access set to throw, tests every method with body/header read traps, CORS/errors and verifies rollback source hashes. No live invocation. Deployed original source shows reachable unauthenticated provider/write paths, not observed misuse or actual cost. No deployment has occurred.
