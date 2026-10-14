# Ingestion audit — 3 October 2026

Read-only production metadata audit at 2026-10-03T01:15:33Z against repository main `0d32ec7de`, project `wurwcrgxjjwqdaxqceey`. No collector execution, provider request, browser, cron/security/credential change or production write was performed. Ownership expanded by root to adapter-rss, adapter-jsonapi and adapter-html plus their scoped fixture tests; shared public/status UI belongs to the public-links owner. Full scoped metadata snapshot: [ingestion-health-20261003.json](./ingestion-health-20261003.json). These are observed metadata states, not a fresh upstream content audit.

## Priority matrix

| Priority | Source / surface | Evidence at audit | Smallest operational or code step |
|---|---|---|---|
| P0 | Beehive Government releases | error/red; last success Sep13 22:50; 709 stored docs, newest publication Sep13 22:41; latest run feed_upstream_blocked HTTP200 text/html | Publisher-approved noninteractive access to documented /rss.xml for production poller. Keep unavailable/stale labels. No bypass or alternate-route probing. |
| P0 | Failure counters | all 13 error sources have consecutive_failures=0; kb_inc_failures absent in pg_proc; Supabase returns RPC errors rather than throwing | Local RSS patch reports failure_counter_status=unavailable, preserves counts/timestamps; atomic RPC installation requires separate SQL authority and is not done. Other adapters need their own owners. |
| P0 | GeoNet News / Privacy Commissioner / WorkSafe | ok/green recent checks but 0 documents each; last_updated_at never | Report checked/no usable stored evidence, not a working news stream. Use fixtures to inspect expected parser/content fields before any separately authorised rollout. |
| P0 | Stuff | running/green since Oct3 00:00 at audit; last successful run Oct2 21:50; 10164 docs | Do not equate green with current successful run. Read run completion/status before any scheduler action; no job started or reset. |
| P1 | GETS government tenders | ok; 205 documents; lastsuccess Oct2 23:20; newest publisher date Oct2 03:00; all 205 have envelope attribution | Reuse existing KB retrieval first; deduplicate and preserve due/publication evidence. Separate live_feed pipeline has enabled config but never polled,0 entries,0 logs. No new collector needed. |
| P1 | Parliament bills | ok;166 docs, lastsuccess Oct3 00:50; newest publication Sep30;165 have provider/api metadata | Reuse dedicated Parliament adapter/documents; validate item provenance using document URL + provider metadata. Config declared provenance still says RSS although actual source is JSON. |
| P1 | Proposed members bills | ok;2 docs,lastsuccess Oct3 00:50; newest publication Aug29; one specialised provider record and one generic source-page record | Keep proposed measures distinct from enacted law; avoid duplicate generic page evidence. |
| P1 | PCO specific Acts | 9 ok rows,17 version documents,lastsuccess Oct2 11:30–11:50; actual PCO provider/API metadata; source declared provenance null | Reuse dedicated version/format metadata; older document dates may reflect unchanged legislation, not broken fetches. Generic envelope count=0 does not mean no attribution. |
| P1 | Opportunity/business HTML registers | Mostly 1 document each: GETS FPO, NZX,Spark,HealthNZ,LINZ,Commerce Commission,DPMC,EA,Regulation,MSD | Treat as source-page observations, not extracted tenders/projects/company changes. HTML adapter overwrites published_at with scrape time; local HTML delta prepared; deployment review needed before event-date claims. |
| P1 | Auckland budgets, FMA, SEEK, Treasury x2 | error/no successful fetch/0 docs; HTTP406 or403 | Respect upstream access restrictions. Publisher-approved feed/API/access required; do not retry via evasion. |
| P1 | CERT/NCSC and ODT | 404; CERT0docs/never success; ODT5docs,newest actual publication2022,lastsuccessJul17 | Confirm official maintained feed documentation with publisher before separately approved config change. No guessed endpoint. |
| P1 | MBIE proactive releases | error/never successful/0docs, empty page content | Diagnose approved source/extraction with fixture; no success label or unapproved scraper substitution. |
| P2 | GeoNet quake/NVD normalization | 708 quake docs/20 CVEs; both ok, no published_at; generic parser only top-level fields despite nested payloads | Separate JSON local delta prepared: fail closed on unexpected item path; nested stable IDs/date/link/title extraction and safe date tests. No current-event claim from generic Untitled/raw JSON. |
| P2 | NZBN | no kb_sources row; on-demand NzbnClient exists for paid tools, deployment/key health not inspected; new nz-evidence inspector default has no transport/key and returns unavailable | Treat as implemented optional on-demand adapter or inactive review contract, not proven continuously ingested business intelligence. Separately authorised credential/runtime verification needed; no credentials created. |
| P2 | Curated Manaaki/Pīkau/Waihanga | active error rows,5/13/5 static seeded docs from May21; internal:// unsupported on last Sep26 attempts | Keep curated/static labels. Current dispatcher excludes internal://, so do not claim ongoing collection or enable a job. |
| P2 | Paused sources | 7: Aviation,Scoop x3,Beehive duplicate,Gisborne,legacy legislation RSS | Preserve pause. Aviation/Scoop publisher access blocked; duplicate/superseded rows should not be activated. |

## Safe local change and proof

The first separate local delta changes adapter-rss and its existing handler fixture/stub. On a finished failed run, an available atomic RPC reports updated; a returned RPC error or thrown transport error reports unavailable. No fallback writes a fabricated count or races a read-modify-write count. Source status stays error; last_successful_fetch and last_updated_at remain unchanged; challenge cannot write kb_documents/kb_changes or leak tokens.

Offline Node/tsx execution of the actual handler fixture passed all three counter scenarios. Only import wiring was substituted in a temporary harness: local database stub and a parser stub that throws if a blocked body reaches parsing. No outbound permissions or provider calls were used. Existing Deno test remains the release regression. Deno binary and prior temporary cache are no longer present; strict Deno validation cannot be rerun without installation, which this task forbids. No new dependencies or full build. `git diff --check` passed. The prior unchanged format suite passed 12 tests in PR1427 CI; that is historical evidence, not a new current run.

No push/merge/deploy is part of this audit. Merging changes to supabase/functions on main triggers the existing production Edge deployment workflow; do not merge without release authority.

## Baseline defects and local review deltas

- Fixed locally only: adapter-jsonapi accepts a nonarray/unexpected envelope as an empty successful list, so last success advances without validating collection shape. It silently falls back to top-level arrays even when a configured path is absent.
- Fixed locally only: generic JSON pickString reads only direct string keys. Configured GeoNet features and NVD vulnerabilities contain nested properties/cve objects, so IDs/titles/dates/URLs are not properly normalized. JSON prefix fallback IDs can collide; an invalid date can throw and abort a whole poll.
- Fixed locally only: adapter-html stores local scrape time in published_at, making an index snapshot look like newly published source material. It does not consistently detect HTTP200 access-challenge bodies, and ignores write errors before marking success.
- RSS/JSON/HTML ignore several document/change/source/run write errors; a transport fetch/parse success is not durable-ingestion proof. Strict write-error checking should precede any fresh success label.
- Missing counter RPC affects adapters beyond RSS; consecutive_failures-based backoff (<5 in dispatcher) is not currently proven operational. Current dispatcher excludes internal URLs. No cron was modified or inspected for secrets.
- Health view lag is time since attempt and can be green for running/empty-source rows. Successful-fetch time and usable document presence must be separate from scheduler liveness. Public UI owner owns this presentation; this audit changes no shared component.

## Separate local review commits and validation

- `81cb757d4` RSS: atomic counter RPC result checked; unavailable recorded without fabricated counter writes.
- `619080a54` JSON: supported collection must be an array at the declared path; missing paths, non-array/error envelopes and invalid items fail before writes. Own-property traversal is limited to eight segments/200 characters and rejects prototype keys. Declared production `features`/`vulnerabilities` fixtures normalize GeoNet/NVD nested fields; explicit configured fields override defaults. True empty arrays return `collection_state=no_results`; no invented items. Full-item hash fallback replaces collision-prone prefix IDs. Date fixtures reject malformed/calendar-invalid dates; unzoned timestamps retain `publisher_date_raw` while publication instant remains unknown. This may change future external IDs and needs deduplication review against existing generic rows before deployment; no historical rows were rewritten here.
- `8b53bc557` HTML: new/changed snapshots have `published_at=null`, `publication_date_state=unknown`, explicit `source_page_snapshot` identity and `observed_at` in metadata. Unchanged historical date fields are left untouched; metadata marks them unknown on future observations. No backfill/migration or historical row mutation was performed.

Nine pure Node fixture tests passed; three actual handler fixture suites passed in offline Node/tsx harnesses (RSS three counter cases; JSON seven invalid/empty cases; HTML new/changed/unchanged). Existing TypeScript compiler strict-check passed both new helper modules. Strict Deno entrypoint checking remains a release gate because the binary is unavailable and this task forbids new installs/dependencies. No CI rerun/push, full build or production activation.

Repeat pure fixture tests using the existing installed tsx loader:

```sh
node --import /absolute/path/to/existing/tsx/dist/loader.mjs --test supabase/functions/adapter-jsonapi/normalization.test.ts supabase/functions/adapter-html/observation.test.ts
```

When an approved Deno environment is available, run `deno check --no-config --node-modules-dir=none` on all three entrypoints and each scoped handler fixture with its own `tests/import-map.json`. The import map replaces only Supabase transport with a local stub; fixtures mock Deno server/environment and upstream fetch. No database or outbound execution permission is needed after dependencies have been cached.

## Attribution and interpretation

Source records carry official URL and declared provenance; newer generic adapters add documentEnvelope, while Parliament/PCO use their own provider/API metadata. Many historical generic documents lack the newer envelope. Report that metadata difference rather than claiming all such records are unattributed. GETS205/205 have an envelope; Beehive154/709,RNZ1497/4092,Newsroom380/1234 do, indicating mixed legacy history.

HTML timestamps in the table below are adapter-written observation/change times, not verified publisher publication dates. Last_updated_at indicates content change, while last_successful_fetch indicates a successful poll; neither proves an unchanged page contains current actionable opportunities. Commercial interpretation is an inference requiring a cited document/event, not a fact derived from a source name.

Official Beehive references already verified in prior work: [RSS documentation](https://www.beehive.govt.nz/feeds), [technical contact](https://www.beehive.govt.nz/about-this-site), DIA Ministerial.Resourcing@dia.govt.nz. Required outcome is genuine RSS XML for the production server-side GET with its existing AssemblBot identity instead of interactive Incapsula HTML. No documented allowlisting entitlement/process was established; contact/request remains unsent. Copyright permission is not evidence of WAF access approval.

## Full observed source matrix

All timestamps UTC. Counter column and declared provenance/URLs are retained in the JSON snapshot. Health is the existing production view, not an audit endorsement of usefulness. “never” means null metadata.

| Source | Status / existing health | Last successful fetch | Last content update | Stored docs | Latest error / paused reason |
|---|---|---|---|---|---|
| Auckland Council — Annual and long-term plans | error / red | never | never | 0 | HTTP 406 fetching HTML |
| Auckland Council — Committee agendas | ok / green | 2026-10-02 22:00:02.868+00 | 2026-08-25 22:10:04.626+00 | 1 | — |
| Beehive — Government releases | error / red | 2026-09-13 22:50:03.788+00 | 2026-09-13 22:50:03.788+00 | 709 | feed_upstream_blocked |
| CERT NZ — Advisories | error / red | never | never | 0 | feed_http_error |
| Commerce Commission — Case register and consultations | ok / green | 2026-10-02 22:40:05.042+00 | 2026-10-01 22:00:07.557+00 | 1 | — |
| DPMC — Cabinet publications and proactive releases | ok / green | 2026-10-02 22:10:02.804+00 | 2026-09-28 07:20:02.962+00 | 1 | — |
| e-Tangata | error / red | 2026-05-30 11:20:03.078+00 | 2026-05-23 20:50:03.409+00 | 15 | feed_http_error |
| Electricity Authority — Projects and consultations | ok / green | 2026-10-02 21:20:01.974+00 | 2026-09-28 06:30:02.804+00 | 1 | — |
| FMA — Consultations | error / red | never | never | 0 | HTTP 403 fetching HTML |
| GeoNet — News | ok / green | 2026-10-03 00:20:02.742+00 | never | 0 | — |
| GeoNet — Quakes (M3+) | ok / green | 2026-10-03 01:10:04.46+00 | 2026-10-02 21:00:05.756+00 | 708 | — |
| GETS — Future Procurement Opportunities | ok / green | 2026-10-03 01:10:02.5+00 | 2026-10-01 05:50:02.372+00 | 1 | — |
| GETS — Government tenders | ok / green | 2026-10-02 23:20:13.748+00 | 2026-10-02 03:50:12.882+00 | 205 | — |
| Health NZ — News and service announcements | ok / green | 2026-10-02 22:50:02.673+00 | 2026-10-02 10:40:02.352+00 | 1 | — |
| Interest.co.nz | ok / green | 2026-10-02 23:00:05.541+00 | 2026-10-02 23:00:05.541+00 | 1320 | — |
| IRD — Tax Information Bulletin | ok / green | 2026-10-02 21:10:02.213+00 | 2026-05-21 11:00:02.23+00 | 1 | — |
| LINZ — News | ok / green | 2026-10-02 19:50:02.504+00 | 2026-10-02 13:40:02.378+00 | 1 | — |
| Manaaki Curated Hospitality Compliance Pack | error / red | never | never | 5 | Url scheme 'internal' not supported |
| MBIE — Proactive releases | error / red | never | never | 0 | empty page content |
| MetService — Severe weather | ok / green | 2026-10-03 01:10:02.284+00 | 2026-05-20 23:30:03.106+00 | 1 | — |
| Ministry for Regulation — Information releases | ok / green | 2026-10-02 22:40:04.345+00 | 2026-08-25 22:10:04.584+00 | 1 | — |
| Ministry for Regulation — Regulatory Analysis Summaries | ok / green | 2026-10-02 22:50:02.907+00 | 2026-10-02 04:20:02.51+00 | 1 | — |
| MSD — Food Secure Communities funding | ok / green | 2026-10-02 22:20:02.37+00 | 2026-08-25 22:10:04.854+00 | 1 | — |
| Newsroom NZ | ok / green | 2026-10-02 22:50:02.982+00 | 2026-10-02 22:50:02.982+00 | 1234 | — |
| NVD — Recent CVEs | ok / green | 2026-10-02 22:20:03.507+00 | 2026-06-17 19:30:58.156+00 | 20 | — |
| NZ Gazette — Latest notices | ok / green | 2026-10-03 00:50:02.541+00 | 2026-10-03 00:50:02.541+00 | 1 | — |
| NZ Herald — Business | ok / green | 2026-10-02 23:30:02.836+00 | 2026-10-02 23:30:02.836+00 | 1 | — |
| NZ Parliament — Bills API | ok / green | 2026-10-03 00:50:15.86+00 | 2026-10-01 03:20:22.839+00 | 166 | — |
| NZ Parliament — Proposed Members Bills | ok / green | 2026-10-03 00:50:04.375+00 | 2026-08-29 00:00:12.774+00 | 2 | — |
| NZX — Market announcements | ok / green | 2026-10-02 23:30:02.799+00 | 2026-10-02 23:30:02.799+00 | 1 | — |
| Otago Daily Times | error / red | 2026-07-17 04:20:02.769+00 | 2026-05-21 00:00:07.418+00 | 5 | feed_http_error |
| PCO — Building Act 2004 | ok / green | 2026-10-02 11:50:13.236+00 | 2026-09-18 09:30:03.095+00 | 3 | — |
| PCO — Construction Contracts Act 2002 | ok / green | 2026-10-02 11:50:12.992+00 | 2026-05-22 04:20:02.811+00 | 1 | — |
| PCO — Consumer Guarantees Act 1993 | ok / green | 2026-10-02 11:50:12.95+00 | 2026-05-22 04:10:04.104+00 | 1 | — |
| PCO — Credit Contracts and Consumer Finance Act 2003 | ok / green | 2026-10-02 11:30:03.469+00 | 2026-07-25 00:20:04.796+00 | 3 | — |
| PCO — Customs and Excise Act 2018 | ok / green | 2026-10-02 11:40:02.85+00 | 2026-09-11 08:20:06.668+00 | 2 | — |
| PCO — Fair Trading Act 1986 | ok / green | 2026-10-02 11:50:13.148+00 | 2026-07-25 00:20:04.993+00 | 2 | — |
| PCO — Food Act 2014 | ok / green | 2026-10-02 11:30:03.685+00 | 2026-07-31 01:20:03.313+00 | 2 | — |
| PCO — Health and Safety at Work Act 2015 | ok / green | 2026-10-02 11:30:03.703+00 | 2026-07-03 11:00:07.145+00 | 2 | — |
| PCO — Privacy Act 2020 | ok / green | 2026-10-02 11:30:03.617+00 | 2026-05-22 04:10:03.987+00 | 1 | — |
| Pīkau Curated Freight & Customs Pack | error / red | never | never | 13 | Url scheme 'internal' not supported |
| Privacy Commissioner — News | ok / green | 2026-10-02 22:00:04.79+00 | never | 0 | — |
| RNZ — Top stories | ok / green | 2026-10-03 01:00:05.161+00 | 2026-10-03 01:00:05.161+00 | 4092 | — |
| SEEK NZ — Customer experience and transformation hiring | error / red | never | never | 0 | HTTP 403 fetching HTML |
| Spark NZ — Investor centre | ok / green | 2026-10-02 22:50:03.751+00 | 2026-10-02 22:50:03.751+00 | 1 | — |
| Stuff — Top stories | running / green | 2026-10-02 21:50:04.14+00 | 2026-10-02 21:50:04.14+00 | 10164 | — |
| The Daily Blog | ok / green | 2026-10-02 21:40:03.921+00 | 2026-10-02 21:40:03.921+00 | 1540 | — |
| The Spinoff | ok / green | 2026-10-02 21:40:04.028+00 | 2026-10-02 21:40:04.028+00 | 978 | — |
| Treasury — Budget 2026 | error / red | never | never | 0 | HTTP 403 fetching HTML |
| Treasury — Budget 2026 Estimates data | error / red | never | never | 0 | HTTP 403 fetching HTML |
| Waihanga Curated Construction & Building Code Pack | error / red | never | never | 5 | Url scheme 'internal' not supported |
| WorkSafe NZ — News & alerts | ok / green | 2026-10-03 00:40:03.054+00 | never | 0 | — |
| Aviation NZ — News | paused / paused | never | never | 0 | empty page content |
| Beehive — All releases | paused / paused | never | never | 0 | HTTP 404 fetching feed |
| Gisborne Herald | paused / paused | never | never | 0 | Invalid character in entity name
Line: 2
Column: 43
Char: = |
| Legislation NZ — Acts | paused / paused | never | never | 0 | HTTP 404 fetching feed |
| Scoop — Business | paused / paused | never | never | 0 | HTTP 404 fetching feed |
| Scoop — Parliament | paused / paused | never | never | 0 | HTTP 404 fetching feed |
| Scoop — Regional | paused / paused | never | never | 0 | HTTP 404 fetching feed |
