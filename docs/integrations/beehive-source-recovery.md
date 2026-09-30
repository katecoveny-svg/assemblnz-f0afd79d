# Beehive source recovery — draft, 30 September 2026

Objective: extend the existing Knowledge Brain RSS adapter with truthful upstream
format/error diagnostics. This is source recovery for Pursuit/shared knowledge;
homepage and DO retrieval integration are separate. Authority: code, tests and
draft PR only; no production deployment, configuration or database writes.

## Verified cause

Active production source `658d06fd-99b9-45f8-a4d8-3157dd558e90`, “Beehive — Government
releases”, uses `https://www.beehive.govt.nz/rss.xml`. The `/feed` duplicate is
paused and is not the active pipeline. A read-only GET using the deployed adapter's
normal User-Agent and Accept headers returned HTTP 200, `Content-Type: text/html`,
and an Incapsula HTML access challenge. No challenge was executed or bypassed.

Running that response through the deployed pinned `rss-parser@3.13.0` reproduced
**exactly**: `Attribute without value / Line: 0 / Column: 315 / Char: >`.
The HTML script's boolean `async` attribute is invalid XML. Deployed adapter-rss
version 105 matches the pre-change repository implementation and parses every
successful HTTP response as XML without checking the format.

Production read-only metadata: source status error; last successful fetch
2026-09-13T22:50:03.788Z; newest stored document publication
2026-09-13T22:41:59Z; last attempted check 2026-09-30T21:40:02.185Z.
A recent attempted check is not evidence of fresh releases. This observation is
from the local network, not proof of the current Supabase egress response, but
its identical parser failure corroborates the production error.

## Change and proof

`adapter-rss/feed-response.ts` rejects HTML/challenges, empty bodies, unsupported
roots, non-success HTTP and malformed XML before any document loop. It retains
RSS/Atom/RDF support and tolerates XML feeds served under generic MIME types.
Run error JSON includes a stable code, HTTP status and MIME type; no bodies,
cookies, tokens or query strings are recorded. Fetch has a 20-second deadline.
Existing source attribution, item URLs, dates and hashes remain unchanged.

Twelve focused Node tests using the same pinned parser passed. They exercise valid
RSS/Atom, attribution/date retention, a valid empty feed, challenge HTML, mislabeled
HTML, malformed XML, HTTP failure and invalid/empty responses. The real upstream
body reproduces the legacy error and produces `feed_upstream_blocked` with the fix.

Repeat tests with Node 20+, tsx and rss-parser 3.13.0 installed in an isolated test
directory (not a production dependency change):

```sh
npm install --prefix /tmp/beehive-parser-test --ignore-scripts --no-audit --no-fund rss-parser@3.13.0 tsx@4.22.0
NODE_PATH=/tmp/beehive-parser-test/node_modules node --import /tmp/beehive-parser-test/node_modules/tsx/dist/loader.mjs --test supabase/functions/adapter-rss/feed-response.test.ts
```

The existing `kb_update_source_reliability` trigger advances
`last_successful_fetch` only for a finished `ok` run. Rejected responses finish as
`error`, leave documents and `last_updated_at` intact, and preserve the last
successful fetch. No migration or health-view changes are needed for this fix.
Deno edge runtime validation was not performed locally (Deno unavailable).

## Minimum production release steps (not executed)

1. Review/merge the draft after Deno edge typecheck and regression checks. This
   adapter is shared by RSS sources; confirm one known-good RSS and Atom source
   still parse in staging. Keep JWT/auth settings and existing source URL intact.
2. With separate deployment authority, deploy only `adapter-rss`, including its
   new local helper and existing `_shared/opportunity-envelope.ts`. No frontend
   release, migration, secret rotation or source configuration update is required.
3. Let the existing scheduler poll Beehive. If still blocked, expect run status
   `error`, code `feed_upstream_blocked`, HTTP 200, content type `text/html`, and an
   unchanged `last_successful_fetch`. Do not call this ingestion recovery.
4. Arrange a publisher-approved way for the upstream RSS endpoint to serve the
   normal server-side poller (e.g. publisher allowlisting or a documented official
   alternate feed). Do not bypass the challenge, proxy through an unapproved
   scraper, or guess a replacement URL. Validate any alternate before a separately
   authorised source-config change. This upstream step remains the recovery blocker.
5. Once genuine RSS is available, verify a successful run, advanced
   `last_successful_fetch`, dated documents with official Beehive release URLs,
   and normal unchanged-feed deduplication. Only then report source recovery.

Rollback: redeploy the preceding adapter version. Existing documents/configuration
need no reversal. Remaining homepage/shared DO freshness presentation and retrieval,
health view lag semantics, and general RSS database-write error handling are
outside this bounded PR.
