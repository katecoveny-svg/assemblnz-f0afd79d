# NZ evidence service: inactive review slice

Base: current remote main `71ac61ac0461d13096e5e5fa8faa23a8830e13f8`. This is a preparation module and mock-tested client contract, with no reachable route, registered tool, published plugin, credentials, grants, migration, ingestion or provider invocation. The existing founder enquiry pilot is unchanged.

## Scope and reuse

Creates `lib/nz-evidence/` as a shared Factory review module for future authenticated connected dots. Three bounded tool contracts: `inspect_nz_business(nzbn)`, `map_tender_evidence(documentId,evidenceIds,requestId)` and `get_evidence_review(reviewId)`. Inputs are strict and bounded. OAuth scopes and read/destructive/open-world hints are supplied in the inventory. It is deliberately not installed in `lib/mcp/enquiries.ts`, `/api/mcp`, DO Builder or `demo.echo`.

Uses the existing structured-tool convention and enquiry receipt semantics (owner isolation, stable retry key, input digest, versioned preparation, explicit uncertainty). Does not reuse founder authorization, shared memberships blindly, paid spend accounting or privileged source tables. Fixture receipts are bounded process memory, synchronous and cloned; they are not a durable execution/charging system and are lost on restart. Prototype requirements/evidence are supplied directly as fictional fixture records; no text extraction or similarity mapper is claimed.

Repository canon loaded: `AGENTS.md`, `START_HERE.md`, context manifest/router/CURRENT, Factory and primitive registry. Only new module paths and this document are implementation scope; a primitive index entry records the preview. DO/core coordination sent to the originating task. Shared Astra6+TypeSafe adapter owner notified; no parallel inference adapter is created.

## Exact NZBN contract

Official MBIE docs inspected 1 October 2026 show `GET https://api.business.govt.nz/gateway/nzbn/v5/entities/{nzbn}` and `Ocp-Apim-Subscription-Key`, with JSON Accept. [MBIE NZBN API](https://portal.api.business.govt.nz/api/nzbn), [subscription-key authentication](https://support.api.business.govt.nz/s/article/cloud-authentication-subscription-key).

Existing Next and stdio clients use `/services/v5/nzbn` with the subscription header; edge `mcp-nz-govt` uses `/gateway/nzbn/v5` with an Authorization header. The new module consolidates a reusable correct wire contract for a separately reviewed migration of those consumers. Existing consumers are unchanged because altering their live behavior requires separate review. There is no arbitrary base URL, name search, silent first result, env/key resolution, private-business OAuth or raw upstream field return.

`createNzbnInspector()` is unavailable by default. Tests explicitly inject a fake transport and fictional key. Only an exact 13-digit GLN with valid check digit is accepted. Requests disallow redirects and ambient credentials, have a two-second total deadline including streamed body, abort/cancel on expiry and cap decoded input at 128 KiB. Upstream errors/bodies are suppressed. Arrays, identity mismatch and missing legal identity/status fields yield `ambiguous`. A successful projection includes only NZBN, legal name, entity type code and status code, official entity endpoint citation, observation time and expiry. All person/address/contact/GST/role fields are discarded.

Freshness is a 24-hour **local pilot policy**, not proof of registry accuracy or an MBIE publication/update timestamp. No cache is present. An unavailable response has no observation timestamp. MBIE notes source-register limitations and disclaims accuracy; preserve this distinction in any UI. Business identities may themselves describe natural-person businesses: even the minimal projection requires privacy review and terms approval before release.

## Authority contract

Proposed dedicated resource audience: `https://www.assembl.co.nz/api/nz-evidence/mcp` (no endpoint or registration exists). Separate scopes are `nz.business.read`, `nz.evidence.prepare`, `nz.evidence.read`. Preparation currently requires both prepare/read because it returns the review.

`authenticateNzRequest` is permanently closed without an explicitly supplied reviewed adapter. The pure factory permits mock verification only in tests. The adapter must verify access-token signature/approved algorithm, trusted issuer/JWKS or introspection, token type, expiry/not-before and revocation/session validity; decoded JWTs, ID tokens, user-editable metadata and `getUser` alone are insufficient. The module independently rejects wrong resource audience, missing/unapproved client ID, time failure, wrong scope, inactive or mismatched authoritative owner membership and absent tenant. Scope is the intersection of verified grant and membership; owner/tenant are never tool inputs. Unexpected failures collapse to `unavailable`.

The existing `lib/mcp/auth.ts` checks Supabase user/membership but does not enforce resource audience/scopes and accepts null clientId. It remains unchanged and is not accepted as the NZ adapter. Founder-only `requireEnquiryOwner` is not multi-customer authorization. Completed ChatGPT linking is not established by repository code or this work.

Before exposing any endpoint, implement protected-resource metadata, trusted authorization-server discovery, PKCE/client policy and per-request verification with explicit token scopes; HTTP 401 and tool-level `mcp/www_authenticate` challenges must point to the resource metadata and request correct scopes. No clients are registered here. [OpenAI authentication](https://developers.openai.com/plugins/build/auth), [tool definitions](https://developers.openai.com/plugins/plan/tools).

## Tender preparation contract

Only records with `fictional: true` and `consent: fixture-only` are admitted by the fixture schema. A source carries owner, tenant, immutable version, observation and expiry. Each requirement/claim cites its exact source ID/version/page. Constructor rejects inconsistent citations, duplicate source/requirement IDs and non-fixture consent. References must be owner AND tenant isolated; inaccessible and absent IDs produce the same `not_found` error.

Mapping uses **explicit supplied requirement associations**, never inferred legal meaning or first-name matches. It returns per-requirement `matched`, `missing` or `unclear`, source/version/page citations, questions and a preparation limitation. Supplied text is untrusted data, never executed, fetched, or passed to a model. Common instruction-like text gets an unclear flag; this heuristic is not an injection-security boundary. The security boundary is deterministic structured mapping with no tool/model execution and no returned raw source prose. Stale/future observations cannot match; later receipt reads remove matches once evidence expires.

Request keys bind owner+tenant+requestId to a digest of the sorted evidence and full document/version snapshot. Exact duplicates return the same review; changed inputs conflict. Public review data omits owner IDs, source prose and document bodies. Mutating a returned object cannot mutate stored receipts. A 100-receipt fixture cap prevents unbounded prototype growth.

This prepares evidence for human review. It is not legal interpretation, tender eligibility, H&S certification, customs advice/submission, or a claim that an evidence association substantively satisfies a requirement. No licensed standards or private shared corpus are included. Future custom sources require independent explicit source consent, ownership/licence validation, retention/deletion/revocation and bounded page extraction. Generative mapping must use the shared Astra6+TypeSafe adapter owned by task `01a0f443-feac-7558-be4b-cfcf837e2030`, separate consent and cost admission; runtime contract/integration remains a gate.

## Read-only prospective security finding

Checked 1 October 2026 13:06 UTC. Source `supabase/config.toml` sets `verify_jwt=false` for both `compliance-scanner` and `mcp-nz-govt`. Current source handlers have no equivalent incoming request authentication. The scanner can invoke a provider and write knowledge/audit records using privileged runtime context; the government handler can make upstream requests and write logs. This is a prospective unauthenticated invocation/cost/write risk.

Read-only Supabase `list_edge_functions` metadata for project `wurwcrgxjjwqdaxqceey` reports:

| Function | Status | Version | Deployed verify_jwt | Bundle SHA-256 |
|---|---|---|---|---|
| mcp-nz-govt | ACTIVE | 115 | false | `220eb03c30b4ddd61c033c17d75604ed6357fffddba921925d842a68c419fc58` |
| compliance-scanner | ACTIVE | 102 | false | `07bb6055aa5036487f1b9bd8389fe06aa9ec2f4f201d98908d61b5225a46e533` |

After the coordinating task explicitly authorised retrieval, read-only `get_edge_function` returned these same active versions and bundle hashes. Inspected only their returned handler source; no environment values, tokens, logs, customer rows or endpoint invocations were requested.

Proven deployed-code behavior:

- `mcp-nz-govt/index.ts` v115 (274 lines): entry at line 224 handles OPTIONS, requires POST at 226, parses JSON at 230 and checks action, with no caller identity/auth check. At 241 it inserts caller query/action into `mcp_data_log` through a service-role client configured at lines 29–32. The switch can execute public Companies/WorkSafe fetches; PCO and NZBN fetches are conditional on configured provider keys. Provider responses are broadly returned. No evidence of arbitrary URL targeting or customer-record read is established by this handler.
- `functions/compliance-scanner/index.ts` v102 (299 lines): entry at 152 only excludes OPTIONS; every other method enters scanning without request auth, body or method admission. If a model key is configured (158–159), it constructs a service-role client (161–164), resolves a model (173), fetches fixed source URLs and can call the Google OpenAI-compatible inference endpoint (82) for each successful source fetch. Provider-produced changes can lead to `compliance_updates` insert (212), `admin_notifications` insert for high impact (235), `agent_knowledge_base` upsert for non-high impact (247), and a `compliance_scan_log` insert (268). Non-high changes are marked verified/auto-applied without human review. Incoming body does not supply change content, so arbitrary caller-authored data mutation is **not** proven. Mutation success and costs depend on configured secrets, upstream responses/schema and database state; none were tested or read.

Together deployed source plus metadata establish no JWT/caller authentication at the inspected handler boundary and reachable provider/write code paths. Gateway/network restrictions, secret presence, successful execution, exploitation and actual incurred cost remain unverified. This is a confirmed deployed-code admission gap, not an exploit test. No production settings changed. [Supabase function auth](https://supabase.com/docs/guides/functions/auth).

Minimal separate remediation/compatibility proposal (unapplied): inventory exact callers before release, especially `lib/do-mcp/nz-live.ts` government invocations and any scanner cron/service callers; require valid user+scope/tenant policy for government tools and narrowly authenticated scheduler/service admission for scanner **before** any provider/log/write action. Restrict scanner to POST, deny anonymous/legacy/public-key-only admission, add concurrency/rate/cost reservations and stop model output automatically becoming verified knowledge. Migrate legitimate consumers and scheduler authorization together, test auth failures produce no upstream/write calls, then explicitly approve staged deployment/rollback. Simply toggling verify_jwt may break callers or fail to provide proper authorization; it requires consumer proof. Do not reuse founder or NZ fixture auth as a production shortcut.

## Paid rails: do not reuse for charging

`lib/tools/cap.ts` separates read/check from `recordSuccessfulSpend`. `lib/tools/store.ts#getSpend` drops the query error and can return zero; `addSpend` reads then upserts a new total and ignores the mutation error. Concurrent requests can exceed caps/overwrite increments and failed persistence can be reported as recorded. Receipt insert errors are also unchecked. No price, payment product, entitlement change or charging is introduced.

Unapplied transactional admission requirements:

1. Authenticate owner/tenant/client and check current entitlement, consent and approved price/currency version before execution. A database error denies admission.
2. In one transaction, lock the owner budget period, check spent+reserved+maximum authorised cost against both per-request and period caps, reserve that amount and insert a unique owner/tenant/request key with canonical input/version digest. Identical retry returns the existing job; mismatched input conflicts. No execution before reservation commits.
3. Persist durable job state, provider operation identity and lease/fencing token before provider work. Stable provider idempotency is required; uncertain timeout/crash enters reconciliation and must never be automatically charged or executed twice.
4. Settle actual authorised usage once by compare-and-set terminal transition in the same transaction as ledger/receipt update; release unused reservations. Store unique settlement IDs, prohibit negative/over-cap amounts and propagate every persistence error. Failed/cancelled work releases reservation only when non-execution is proven. Concurrent retries, crashes and replay require database integration tests.
5. Keep billing separate from source access and inference consent. Fixture receipts are free simulation, not ledger proof. Only an existing paid entitlement may be checked later; commerce remains on assembl's own site. No in-plugin digital sale, checkout or upsell. Recheck current [OpenAI plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines) before any monetised release.

## Exact live-pilot gates

- Root reviews this draft PR; any security-sensitive live change is a separate proposal requiring explicit release approval. Merging an inactive module does not authorize release.
- MBIE account terms, actual NZBN product entitlement and privacy/licence approval are recorded without copying keys; authorised sandbox then runtime proof verifies exact endpoint/header/status projection under bounded transport. No paid provider invocation before permission/admission.
- Reviewed dedicated OAuth adapter/resource metadata/client policy and linking proof demonstrate wrong-audience/client/scope/owner/tenant/revoked-token rejection. Client registration and customer access need separate authority; no legacy token fallback.
- Owner-isolated durable source storage, consent, immutable versions, extraction/citations, freshness/revocation, deletion/retention and non-disclosing errors are independently proven. No shared private corpus by implication.
- Generative mode stays disabled until shared Astra6+TypeSafe adapter, independent source/inference consent, transactional admission/settlement and cost approval are proven. Deterministic fixture associations do not prove substantive mapping quality.
- Transactional budget/receipt guarantees above pass real database concurrency/crash tests before charging. No reuse of current non-atomic caps.
- Named edge-function risks receive a separate deployed-source/auth review and explicit approved remediation. No production setting or access change belongs to this draft.
- Only after those gates: separately approved private pilot routing/registration, end-to-end ChatGPT linking, sanitized audit/monitoring, limits, rollback and provider proof. Public plugin submission/publication remains separately authorised.

## Proof

Focused Vitest suite: `node_modules/.bin/vitest run lib/nz-evidence/service.test.ts apps/do/enquiries/service.test.ts app/api/mcp/route.test.ts lib/tools/__tests__/agent-paid-tools.test.ts`: **58 tests passed across 4 files**, including 28 new cases covering authority, strict schemas, minimal projection, exact NZBN, ambiguity, status errors, body/deadline bounds, stale evidence, injection text, owner/tenant isolation, duplicates/conflicts and receipt mutation.

Focused strict TypeScript check (`tsc --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck lib/nz-evidence/{auth,nzbn,review,tools,service.test}.ts`) and `eslint lib/nz-evidence --max-warnings=0`: **passed**. `git diff --check`: passed. Uses existing installed dependencies via an ignored local node_modules symlink; no package/lockfile changes.

Full `tsc --noEmit` was attempted: blocked by existing `packages/canvas/tsup.config.ts` missing `tsup` and two implicit-any `format` errors. No new-module type errors were reported. This checkout is not claimed fully green. No heavy app build, deployment or live provider check was run; heavy build requires coordination of the serial build slot. The draft remains review-only.
