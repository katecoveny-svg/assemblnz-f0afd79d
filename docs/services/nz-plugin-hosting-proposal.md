# NZ public plugin hosting — inactive proposal

Prepared from main `70ce219e14e8483301bc00bb0d25237be6a679b1` on 2 October 2026. This is a reviewable deployment plan and closed contracts, not an active host, budget approval or submission-ready package. No route, DNS, firewall, environment, database, grant, challenge token or publisher setting has been changed. Personal publisher account identifiers remain internal.

## Existing facilities and reuse decision

**Uses:** the existing Next.js 16 / Node-compatible Vercel project and Git integration. PR1462 preview and its exact merged production deployment reached READY. The existing deployed region was `iad1`; the proposed service retains it until a regional privacy/cost decision. `vercel.json` contains existing crons and the reviewed build-ignore script. No plugin cron is required.

**Extends:** the reviewed stateless MCP SDK2 factory and strict source/tool contracts. It currently lives under `plugins/`, which `.vercelignore` excludes. Activating a route cannot simply import excluded source and assume deployment tracing will find it. A later reviewed implementation should move only the shared reviewed server/HTTP/output modules into `lib/nz-evidence/mcp/`, preserve tool definitions, and use that shared source from the development bundler. Do not expose the whole plugin subtree or alter the founder endpoint.

**Creates, inactive:** `security-proposals/nz-plugin-hosting/policy.ts` defines exact host/request limits, a default closed distributed-admission port, bounded lease-response validation and a narrow operational metric allowlist. Only tests import it. It does not execute a tool, fetch a source, resolve env, connect a database or implement distributed enforcement.

Repository rate-limit audit: `lib/creative/ratelimit.ts` counts then inserts, falling back to per-process memory; `lib/agents/chat-rate-limit.ts` counts then best-effort inserts and fails open; `lib/vessel/rate-limit.ts` reads counts and fails open. Existing paid-tool read/upsert caps are also unsuitable. These paths remain unchanged. `supabase/migrations/20260930220845_do_consumer_usage_billing.sql` provides a useful transaction/advisory-lock pattern, but its owner/subscription/billing semantics must not be reused for anonymous plugins. There is no Redis/Upstash dependency in the current root package. This audit does not prove that external account facilities are absent or that existing WAF/retention settings meet the proposal.

**Decision:** propose the existing Vercel project first, with host/path-specific isolation and the existing Supabase Postgres infrastructure for new, narrow quota metadata. No new hosting provider, paid dependency, model, queue, source-ingestion job or persistent content store is needed for this design. Sharing the project still shares its operational and billing blast radius. If adequate route isolation, least-privilege admission, resource control and log disclosure cannot be proved, keep the service closed and ask Kate to choose a separate project on the existing platform. No account/project purchase is implied.

## Exact proposed routes and settings

| Surface | Proposed public URL / behaviour |
|---|---|
| Freight MCP | `https://nz-freight.assembl.co.nz/mcp`, POST JSON only |
| RFI MCP | `https://nz-rfi.assembl.co.nz/mcp`, POST JSON only; staged after freight |
| Freight challenge | `https://nz-freight.assembl.co.nz/.well-known/openai-apps-challenge` |
| RFI challenge | `https://nz-rfi.assembl.co.nz/.well-known/openai-apps-challenge` |

These hostnames are proposed, not provisioned or verified. Both can alias the existing Vercel project. A later exact-host middleware rewrite would map `/mcp` to `/api/nz-plugins/freight/mcp` or `/api/nz-plugins/architecture/mcp`; those handlers must additionally verify the original public URL/host. Direct internal paths on other aliases must return404. The current HTTP factory already checks `/mcp` and the configured origin. Preserve that public path when adapting the Next route; do not broaden origin/path matching to make routing work. Host aliases, TLS and rewrite preservation require actual preview proof.

The challenge would use a future exact-host `app/.well-known/openai-apps-challenge/route.ts`, returning only that host's portal-supplied token as plain text with no-store/nosniff, or503 while unconfigured. No token is present in this proposal. Never concatenate tokens or replace another plugin's token. OpenAI requires the exact root challenge path, ignores endpoint paths for this purpose, and recommends an eligible parent origin or distinct hostname when a challenge URL is already occupied. Distinct hostnames avoid that collision. This is HTTP verification, not a DNS TXT challenge. [OpenAI submission contract](https://developers.openai.com/plugins/deploy/submission)

Future route settings: `runtime='nodejs'`, `preferredRegion='iad1'`, `maxDuration=15`, `dynamic='force-dynamic'`, `revalidate=0`. Pin the already tested Node24 runtime through reviewed project configuration. Keep current project-wide memory/CPU settings unchanged; measure actual deployed limits and peak RSS before enabling. Vercel memory/CPU is a project setting, and current docs explicitly disallow setting memory via vercel.json. A dedicated 2GiB ceiling therefore cannot be claimed from this proposal. Require measured peak RSS below512MiB for each plugin worker under admitted load, with enough project headroom; if it fails, lower concurrency or obtain an explicit isolation decision. [Vercel duration](https://vercel.com/docs/functions/configuring-functions/duration), [memory/CPU](https://vercel.com/docs/functions/configuring-functions/memory)

Only exact service Origin or absent Origin is accepted. Reject `null`, sibling/wildcard origins, arbitrary ports, query strings, cookies, Authorization and MCP session handles. No app session refresh, customer token acceptance or Supabase auth middleware runs on these exact host/path pairs. All other routes retain existing behaviour. Do not guess ChatGPT browser origins or reviewer IPs; if an actual supported client sends an Origin, review and add that exact official origin before its test. POST JSON responses use no-store; GET/DELETE/OPTIONS on `/mcp` return405. This is a server-to-server, stateless JSON transport, with no UI, browser credential flow or long-lived SSE subscription.

Two independent live controls are required: reviewed deployed release configuration and an atomic backend kill state, both default-off. An environment flag alone is insufficient. Disabling either returns a fixed503 without parsing user content or making a source call. The challenge is also closed until owner-approved portal setup.

## Distributed admission and resource contract

These are proposed pilot ceilings, not a quotation, guaranteed SLA, implemented production quota or entitlement:

| Control | Proposed ceiling, across both plugin hosts unless stated |
|---|---:|
| Admitted transport requests |120/minute and2,000/UTC day |
| Active MCP requests |4 globally |
| Active public source loads/parsers |2 globally |
| Public source-load attempts |200/UTC day, failures/retries included |
| Body / serialized MCP output |1MiB /512KiB |
| Admission RPC wait |1second |
| Request body + handler |10seconds total |
| Platform execution termination |15seconds |
| Lease expiry |20seconds, longer than proved platform termination |
| Source download/body |8seconds total |
| Parser worker |3seconds, forcibly terminate on deadline |

Every admitted initialize/list/ping/call counts, including client retries. User-selected JSON-RPC IDs never become idempotency keys. The server generates an invocation UUID; exact duplicate backend claims cannot mint another lease or execute again. No request or response is persisted for replay. Limits are denied with fixed429/Retry-After; closed, timeout, malformed result or uncertain transaction returns503. No fail-open or per-process fallback. Current per-process4/60 guards remain an additional backstop, never the global authority.

Proposed database objects, **not created**: non-exposed `nz_plugin_control`, `nz_plugin_windows`, `nz_plugin_leases` and bounded invocation tombstones, with service-only claim/release RPCs. All claims use one transaction and a fixed lock order: kill state → shared UTC minute/day counters → active leases → invocation identity. Database time decides bucket boundaries and expiry. Caps/policy version are stored server-side; callers cannot choose them. Source claims require a live parent MCP lease and share global source counters. Count before work, never refund counts on finish, and release only the exact lease ID/fence. Expiry cleanup and retention must not revive completed work. Use invoker privileges where possible, fixed schema-qualified relations and an empty search_path; no anon/authenticated access or broad table grants. A narrow credential/RPC access decision is needed before connecting this backend; do not silently route customer data through the existing broad service client. [Supabase function security](https://supabase.com/docs/guides/database/functions), [Postgres locking](https://www.postgresql.org/docs/current/explicit-locking.html)

The closed adapter and local tests specify failure behaviour only. Before rollout, prove concurrent claims across independent replicas, minute/day boundary bursts, duplicate/lost response/timeout cases, release fencing, DB lock/statement deadlines, quota exhaustion and restore/cleanup safety against a disposable authorised test database. No live or local SQL was executed here. The September2026 Supabase changelog contains PostgreSQL minor-release changes; this proposal introduces no affected extensions/operators and does not attest to the production database version. [Supabase changelog](https://supabase.com/changelog)

Proposed edge flood rule: exact two hostnames AND path `/mcp`, per-IP60requests/60seconds, deny/429 with no CAPTCHA/browser challenge; a separate bounded rule for each challenge path. Check plan entitlement, actual rule semantics, trusted platform IP handling and OpenAI connectivity before publishing any rule. Anonymous OpenAI callers may share egress IPs, so IP throttling is flood protection, not per-person fairness. Vercel documents rate-limit counters as per-region; a constant key in its SDK does not establish a strict cross-region global ceiling. The database contract supplies that boundary. No firewall SDK is added. [Vercel rate-limit SDK](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk)

Source worker isolation is not implemented yet. The current bounded synchronous parser cannot be interrupted by a JavaScript timer while it is running. Future workers must preserve the reviewed parser/projection, enforce3second termination and finite heap/output/buffer limits, and prove combined memory limits under real source sizes. A heap limit alone does not cap typed-array/native allocations. If the platform cannot prove termination by15seconds, the20second lease must not be treated as a safe concurrency guarantee.

## Source freshness and cache

Reuse fixed credential-free Customs endpoints, redirect-denied fetches and current allowlisted projections. No shipment/RFI/identity values are sent upstream. Compressed tariff8MiB, expanded archive96MiB, details32MiB, XML8MiB; preserve strict schema/member/checksum/XML/date admission. Index once per admitted process snapshot. Tariff cache1hour, FX24hours, at most2 local flights; only fully admitted snapshots become visible. Failed200/parsing admissions have5second negative backoff, not a positive cache TTL. No fixture, stale last-known or market fallback.

Producer daily04:00Pacific/Auckland plus four-hour grace remains an assembl engineering policy. Tariff usable expiry is min(fetch+24hours, next08:00Auckland producer-grace boundary), DST-aware; separate fetchExpiresAt/usableUntil remain explicit. Full numeric-code quarantine covers reversed day/minute intervals. Global source quota exhaustion returns unavailable even if the private process has no cache; it cannot trigger extra downloads. Cache is public source data only, in-process and lost on instance recycle. A shared public-snapshot store could reduce repeated downloads but needs separate rights, retention, cost and access approval; none is proposed as a silent default.

## Logging, privacy and support drafts

The proposed application event is exactly domain, fixed outcome enum, duration bucket and bounded request/response byte counts. No raw body/output, user question/document/evidence IDs, JSON-RPC ID, IP, email, cookies, token, query URL, exception text or stack is accepted. `operationalEvent` rejects extra fields rather than redacting arbitrary objects. Metrics retention proposal24hours, aggregate counters/UUID lease tombstones48hours; no personal-IP application bucket is required. Durable control/quotas do not store user content.

This does not imply Vercel/WAF/support/ChatGPT retain nothing. Before release, inventory real access/error logs, traces, replay/analytics/APM integrations, request URLs and upstream/SDK error handling. Disable request/response capture for these exact hosts/paths, disclose unavoidable provider IP/network metadata and actual retention/location/subprocessors, and verify with distinctive fictional markers. Avoid custom proxy headers in logs. Access logs and vendor backups may require different documented retention than application metrics; do not promise deletion periods without proof.

Owner-review copy: “These tools process the selected facts or redacted register you send. They do not read your files, verify supplied pages/hashes, certify compliance or submit to Customs, MPI or a council. Do not send personal identifiers, account codes, passwords, private plans or licensed standards content. Results are preparation for your broker or professional reviewer. Public Customs references include observed time and freshness; unavailable or ambiguous evidence stays unresolved.”

Privacy/support/terms must identify the verified publisher, actual endpoints/processors and cross-border hosting, categories processed, limits of redaction, no application content storage, real platform logging/retention/deletion, source rights/attribution and a working owner-approved support path. Existing legal-name/NZBN claims and existing pages are not independently verified publication authority. Support must request redacted technical symptoms and service date, not shipment/customer documents. No personal account email is included in source or public copy. No new contact, support account or public page is created.

## Review and release sequence / decisions for Kate

1. Root reviews this inactive source, exact normalized packages and timezone proof; batch with the next coherent reviewed stage. No push/full app build/public mount until its reviewed slot.
2. Kate approves hostname aliases/TLS, the shared-project blast radius, narrow persistent quota metadata/access, proposed ceilings and a monetary operating budget/alerts. No pricing invented and no paid service added. Project-wide auto-pause could interrupt the founder pilot: use plugin-only kill state, and never enable a whole-project spend pause without explicit approval of that wider effect. Rate limits do not alone guarantee a monetary spend ceiling or protection from pre-admission edge costs.
3. Implement and independently review the narrow RPC and bounded workers; prove database concurrency/restore/cleanup, actual region/resource/logging/entitlement controls and exact-host routing on an authorised preview. Move only reviewed shared MCP modules into deployed source. Existing founder/customer routes and maintenance-paused functions remain unchanged.
4. Explicit release approval enables freight only after privacy/support/rights/attribution and dependency maintenance are accepted. Pinned saxes upstream is archived; retain its strict contract but review maintenance/licences before hosting. Prove anonymous actual HTTPS initialize/list/call, outage/stale/quarantine/limits, no body logs, edge rules without browser challenges and immediate plugin-only rollback.
5. Kate personally completes publisher account handoff and verification. No account identifiers, identity documents, credentials, legal attestations or support contact actions are collected/performed by this proposal.
6. Only after exact live endpoint proof, assemble the remote-MCP initial ZIP with its permanent URL and complete owner-approved metadata. OpenAI’s current URL-update flow requires support, so choose/test hostnames before first submission. Return the exact portal challenge on its own host, run5positive/3negative cases per candidate against actual hosted service and record an accessible video. Portal scan/review, publication and later RFI activation require their own approvals. Development stdio ZIPs remain development-only. [OpenAI submission](https://developers.openai.com/plugins/deploy/submission)

Rollback proposal: atomically disable only these plugin controls/hosts, return503, remove only their aliases/rewrites if needed, and preserve founder `/api/mcp` and the separately deployed no-effect maintenance handlers (mcp-nz-govt116, scanner103, root-confirmed). Do not restore historical unauthenticated source.

## Deterministic development packaging proof

fflate0.8.3 writes ZIP DOS calendar fields using local Date getters. The old fixed UTC instant encoded different local timestamps in NZ and UTC, despite identical member bytes; root independently reproduced the old CI/local differences by changing timestamps alone. `scripts/lib/nz-plugin-zip.mjs` now supplies fixed local calendar2026-01-01 00:00:00 and sorts members. It does not change tool/parser code or payloads.

`node --test scripts/nz-plugin-zip.test.mjs` checks bytes, payloads and both timestamp headers across UTC/Auckland/Los_Angeles/Kathmandu. `node scripts/verify-nz-plugin-packaging.mjs` rebuilds both complete self-contained packages serially in all four zones and asserts identical ZIP bytes, SHA and per-member payload hashes; writes local `.local-plugin-packages/timezone-packaging-proof.json`. This is lightweight bundling, with no Next build, network or release action. All source/runtime contracts remain inactive. No separate timestamp-only push is needed.

Scoped instruction resolution: older plugin instructions require broad DB audit logging and legacy manifests. Current task explicitly forbids live activation/access and uses reviewed portable OpenAI packages, so no DB audit rows or grants are created. The Vercel/Supabase skills inform this proposal but do not authorise production changes.
