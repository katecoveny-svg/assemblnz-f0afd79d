# Unpublished NZ freight and architecture plugins

Status: implemented local candidates; production transport unmounted, no OpenAI submission or approval. Freight is first priority. Two portable development packages operate on arbitrary valid inputs; fixtures are review data only. Existing founder enquiry `/api/mcp`, customer permissions, authentication, billing and all production settings remain untouched.

## Scope, reuse and value

**Extends** the reviewed `lib/nz-evidence` error/schema/provenance boundary, while keeping its authenticated owner-isolated NZBN/private receipt slice closed. **Uses** the repository's pinned stable MCP SDK2.0.0 and Zod4.4.3; a shared factory registers specialist tools independently. **Creates** deterministic public preparation transforms and credential-free public Customs source adapters. No Builder, `demo.echo`, TypeSafe or model execution is claimed. Any later generative mapping must use the shared Astra/TypeSafe owner adapter with independent consent and transactional cost admission.

Freight receives only non-identifying, user-reported NZ sea-container facts: presence/unknown enums, document consistency, same-basis counts, exact decimal mass/invoice checks (signed explicit invoice discounts are supported). The result is a broker evidence packet with gaps and questions, never clearance, admissibility, classification, valuation, origin entitlement, authenticity or sanctions assurance. New manufactured nonfood is the bounded basic scope; used/controlled/high-risk categories require specialist review. Unknown facts remain unknown. Null shipment/lodgement dates and manufacture/export countries each produce an explicit not-assessed check and reviewer question; supplied values remain visible and unverified. Core evidence is preparation practice, not an invented universally applicable statutory rule. Container guidance is a curated MPI reference with unknown runtime freshness; no source-dependent legal check is marked assessed.

Architecture receives a redacted question/subpart inventory, document lineage/revision/state, supplied page/hash references and explicit mappings. It preserves every question, flags gaps, noncurrent/ambiguous revisions, conflicting supplied facts and missing declared attachments, compares supplied registers and exports CSV/JSON. It performs **no PDF reading, hash verification against files, engineering design, code interpretation or certification**. Every evidence row says `user_supplied`, `source_content_verified=false` and `hash_verified_against_file=false`. Manual redaction/mapping may reduce its time savings; professional review and demand testing remain necessary.

## Callable operations

| Plugin | Tool | Boundary |
|---|---|---|
| freight | `freight_check_evidence` | pure stateless preparation; strict enums/booleans/counts/decimal strings |
| freight | `freight_lookup_tariff_code` | `{code, entryDate}`; exact ten digits plus optional letter after display spaces/dots removed; six-digit HS rejected; no classification/rates/concessions |
| freight | `freight_get_customs_exchange_rate` | `{currency, entryDate}` with intended lodgement date; official decimal reference, no conversion/market fallback; pre2020 unsupported |
| freight | `freight_get_official_sources` | curated sea-container/tariff/FX URLs; no claim of live guidance verification |
| architecture | `prepare_rfi_register` | arbitrary valid redacted canonical register, all supplied subparts |
| architecture | `compare_rfi_registers` | both registers supplied each call; exact prior reviewer dependencies and scoped full question/parent/mapping/document/attachment/opposing-evidence context; no persisted baseline |
| architecture | `export_rfi_matrix` | revalidate/recompute then return all question rows and every finding, including unassociated global findings, as formula-safe CSV or JSON content; no hosted storage or submission |

All three annotations are explicit: read-only/non-destructive; public source lookups open-world, bounded pure transformations closed-world. Annotations do not grant permissions. Public/stateless tools use noauth; there is no customer-account token acceptance. There is no generic executor, arbitrary URL/file path, source ingestion, private corpus, model call, paid provider, contact, payment, email, council filing or Customs/MPI submission tool.

RFI caps:100questions,200documents,500evidence records,2,000characters per free-text field,256KiB canonical register,64KiB aggregate UTF-8 strings,500 mapping edges and128KiB predicted mapping projection before allocation. MCP responses are bounded to512KiB; text is concise and structured evidence is deduplicated by ID. HTTP framing permits1MiB but does not widen register limits. Unique IDs, valid references, positive pages, exact dates/hashes, parent cycles and duplicate mappings checked. Obvious secrets/email/signed token URL detection is incomplete and not a privacy guarantee. Users must select/redact rights-cleared material before transfer. Licensed standards content is excluded even when a user purchased a standard; identifier labels are not a licensed corpus. No standards text/diagram/table is bundled.

## Actual Customs contract and proof

Inspected public source files matched the independent research hashes on1October2026UTC:

| Download | Bytes | SHA256 |
|---|---:|---|
| tariff.tar.gz | 4,648,033 | `2baf2e34401d75378578afe45f04f2f17c245de7a7f6a4bc97f457fa43b8e46d` |
| currentexchange.xml | 9,343 | `049a1a15c00e35005178c3361f48f9b47f7780c6da7806f094e4f01f6b9a9a28` |
| historicexchange.xml | 6,254,305 | `11b038164eab4583fbcd399f538988303bafa5bbf0b9b3e2cac3e8dbd45bc046` |

Tariff is a gzip/tar containing tilde-delimited `.csv`, Windows-1252 text, actual `Jul 15 2010 12:00AM` timestamps and producer `Fri Oct 2 04:00:01 AM NZDT2026` (actual whitespace preserved by parser). Details19,511,039bytes;32MiB bound covers it. Compressed8MiB/expanded96MiB, exact allowed regular member names, checksum/size/path/termination validation; no disk extraction. Index once per admitted snapshot, preserve all dated rows. Zero/multiple valid matches or partial-day boundaries return explicit states. Full inspected index:29,126numeric codes; approximately380ms local index time is an observation, not a hosting SLA.

The archive contains one reversed validity record for9965210000B (26May2022start,25May2022expiry), with another later-looking record and changed unit. Full day-and-minute bounds are compared, including same-day reversed intervals. Entire numeric code9965210000 is quarantined for all dates/check letters/spellings. It returns unavailable with `source_data_quality`, never not-found or repaired dates. Unrelated validated codes remain usable with snapshot degraded/quarantined counts. Schema/encoding/member admission failures reject the snapshot. No last-row-wins or source fixup.

Producer freshness is separate from retrieval and effective dates: observed daily04:00Pacific/Auckland run with a four-hour **assembl engineering grace policy**, not a Customs SLA. Use NZDT/NZST and real DST-aware zone to decide latest expected run; recently downloading yesterday's archive does not make it current. Tariff single-flight public download cache one hour; FX24hours. Tariff `usableUntil`/`expiresAt` is the earlier of fetch+24hours and the next08:00Pacific/Auckland producer-grace deadline, including DST changes; `fetchExpiresAt` is separately reported. Future/old retrieval fails stale. Only completely parsed and admitted snapshots enter the positive cache; failed200 responses have a bounded5second retry backoff and exact-flight cleanup. Public snapshot replacement follows validation; no fixture fallback.

Current XML uses `exchangeRateList/exchangeRate` and Now/Future end dates. Historic uses `historicExchangeRateList/historicExchangeRate` with date/rate. Only supported modern Sunday-ending fortnights derive start=end−13days; missing periods are not filled, pre2020 semantics unsupported.11OctoberUSD0.56 and12OctoberUSD0.55 were confirmed against both inspected feeds. XML is parsed with pinned saxes6.0.0: one exact allowed root, direct records and exact fields, strict full dates, bounded text/depth, no attributes/DTD/entities/CDATA/processing instructions; truncated/comment-only/HTML/multiple-root feeds fail closed. The saxes repository was archived31December2025; maintenance and dependency/licence assessment remains an explicit production gate. Rates remain foreign currency per NZD decimal strings; NZD1.00 explicitly identity, not downloaded. No arbitrary live market or last-known substitute.

Only fixed official URLs, no credentials/cookies, redirect error, streamed caps and8-second total fetch/body deadline; single-flight≤2loads. Decompression/index work is synchronous and size-bounded; production CPU/memory/concurrency measurements and resource isolation are release gates. Public source caching is the only application-held data; no user request/response-body logging, storage or analytics in this implementation. Hosting/access-log retention still needs measurement/disclosure.

## Packaging and tests

Node24 plus frozen repo dependencies:

```sh
node scripts/build-nz-plugin-candidates.mjs
pnpm exec vitest run lib/nz-evidence/service.test.ts lib/nz-evidence/candidates.test.ts lib/nz-evidence/transport.test.ts
node scripts/review-nz-plugin-candidates.mjs
```

The last command performs two fixed live public Customs reads and local fictional review calls; it requires network access. CI tests use controlled adapters and do not depend on external availability. Large captured source files are local test inputs, excluded from repository/ZIP. Build produces `.local-plugin-packages/*-development.zip` and SHA manifests. Portable root `plugin.json`/`mcp.json` schema validated against captured official Agent Plugins1.0 schemas; exactly one plugin root, contained self-contained Node stdio server, deterministic ZIP metadata, no symlinks/secrets. Generated bundles are ignored under each plugin; no installed marketplace or client registration. The plugin-creator helper script was absent on this host, so supported portable packaging was built/validated directly.

Actual SDK stdio initialize/list/call and unmounted streamable HTTP initialize/list/call tests pass. Focused tests cover wrong audience/scope/owner on the earlier closed private slice, stale/ambiguous sources, archive paths/corruption, total fetch timeout, unknown facts, exact arithmetic, review dependencies, prompt injection, duplicate requests, safe errors, input/origin/body/admission limits, actual stdio/HTTP fanout and response sizes, concise text, primary/mirrored noauth metadata, strict output schemas and CSV formula protection. Executed local review pack has exactly5positive/3negative cases per plugin, observed results and public source provenance. It is not a professional-quality evaluation or public directory approval. See shared `review/` for original fictional inputs, observed case evidence and broker/architect/video prompts.

Existing full required workflows remain intact. Additive focused workflow bundles/tests without a full Next build. Local full app builds require root slot. One coherent final push after review/slot; no intermediate preview pushes or manual redeploy.

## HTTP and exact launch gates

`plugins/mcp-servers/mcp-nz-evidence/src/http.ts` is an **unmounted transport factory**; no app route/deployment/config references it. Strict origin/path,1MiB body,10-second body/handler deadline,4concurrent/60requests-per-minute per process, no content logs. Separate reviewed HTTPS production hosts, distributed quotas/DDoS/egress controls, resource measurements and platform log disclosures are required. Loopback is for tests only. No production URL is invented in either manifest.

Before public submission:

1. Root reviews exact source/bundle/CI/evaluation head; broker/architect review boundaries and real usefulness. Kate may invite her dad/friend herself; no appointment/contact is assumed.
2. Explicit hosting/security release approval; deploy only the reviewed standalone stateless transport. Prove stable HTTPS, source refresh/period parity, memory/CPU/load limits, safe errors/outages/alerts and zero raw-body logging across actual platform. Separate enquiry/closed NZBN scope remains unchanged.
3. Publish owner-approved support/privacy/terms pages with actual data categories, destination/processors/logging/retention/deletion and rights/attribution. Verify CrownCCBY attribution/adaptation, tariff rights and no logo/third-party/licensed standards ingestion.
4. Confirm owning OpenAI organisation/project, verified assembl publisher and Apps Management permission from the account. No account/grant/credential/identity-document operation is authorised by these files.
5. Convert each manifest to its proven HTTPS MCP endpoint from the initial ZIP, one MCP per plugin; exact domain challenge token/host mapping, truthful complete listing and referenced assets. Development stdio ZIPs are not public-submission-ready. Do not overwrite another plugin's challenge.
6. Execute exactly5positive/3negative portal cases against the deployed service, include accessible video and release notes. Anonymous service needs no reviewer login. If private auth is later added, provide a secure sample-data reviewer account and full MCP OAuth2.1 resource/issuer/audience/scope/owner enforcement; existing appJWT membership is insufficient.
7. Owner approves legal/policy attestations and public submission; submit through current Platform Plugins flow, address review, then separately publish only after approval. No same-day approval/SIWC/client-ID guarantee.

No charging is enabled. Existing paid-tool cap read/upsert is non-atomic with ignored errors; a future paid private service requires transactional admission/reservation/idempotent settlement, entitlement/price review and separate security approval. No prices/products created. New digital subscription sales/upsells/checkout do not occur inside a plugin.

## Official research references

Current [OpenAI package architecture](https://developers.openai.com/plugins/build/plugins), [MCP/auth](https://developers.openai.com/plugins/build/auth), [tool contracts](https://developers.openai.com/plugins/plan/tools), [submission workflow](https://developers.openai.com/plugins/deploy/submission), [validation](https://developers.openai.com/plugins/deploy/submission-errors), [guidelines](https://developers.openai.com/plugins/plugin-guidelines), [security/privacy](https://developers.openai.com/plugins/guides/security-privacy).

[Customs tariff source](https://www.customs.govt.nz/business/tariffs/tariff-classifications-and-rates), [readme](https://www.customs.govt.nz/media/y1dmuyec/tariff-and-concession-readme.pdf), [exchange rates](https://www.customs.govt.nz/business/import/customs-rates-of-exchange), [Crown rights/attribution](https://www.customs.govt.nz/about-us/about-this-website/copyright), [MPI containers](https://www.mpi.govt.nz/import/border-clearance/containers-and-cargo/), [MPI copyright](https://www.mpi.govt.nz/about-this-site/mpi-copyright/). Customs tariff source states no known NZ IP restrictions; supplier-codeCCBYND dataset is excluded. Neither NZBN nor TSW/carrier API access follows from public feed access.

Supabase security is separately tracked in draftPR1453: inspected deployed metadata matched verify_jwt=false for mcp-nz-govt v115 and compliance-scanner v102 with no equivalent incoming handler authentication in captured source. No exploitation, requests to those functions, production writes/settings or deployment performed. Maintenance proposal remains unapplied and requires its separate specific approval; this candidate does not resolve or use those handlers.

Architecture rights/process references: [Standards NZ digital-products licensing](https://www.standards.govt.nz/get-standards/copyright/digital-products-licensing) (verified primary policy; purchase/access alone does not license reproducing standards content in digital tools), [MBIE consent process](https://www.building.govt.nz/projects-and-consents/apply-for-building-consent/building-consent-process), and [OPC overseas information guidance](https://www.privacy.org.nz/responsibilities/disclosing-personal-information-outside-new-zealand/). The public redacted register implements no legal determination under these sources; phase2 private hosting/processor/rights assessment remains a separate gate.

Scoped instruction resolution: current task forbids customer access, production grants and DB writes. Older `plugins/CLAUDE.md` prescribes legacy Claude manifests and database audit retention; this candidate follows the current portable OpenAI package contract and uses no DB. That conflict is recorded rather than silently broadening access or creating audit tables. Public hosting disclosures must describe actual operational logging/retention before launch.
