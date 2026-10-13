# Saved · DO — first visual review slice

## Scope and truth

`/do/saved` is a working session-only visual board, built on main `57b174df2` in a dedicated worktree. It supports a mixed image/word board, literal multi-term search and type filters, manual link/text/note/image addition, exact-content review, local consent, detail/removal and source-linked task drafting/copying. Leaving/reloading clears additions; the board says this before saving and in its page chrome. There is no browser storage, provider call, URL unfurl, OCR, UI account save or native capture connection. The separate account API is disabled by default. Native dialog supplies modal focus containment and Escape dismissal. Task handoff is explicitly copy → open DO → paste into Write → review. Copying does not create a durable task.

Creates an original Saved visual surface and strict Save intent; uses the canonical GlassIdentity and DO navigation. Extends the existing reviewed-capture approach without consuming existing share-intake storage or taking ownership of companion, PersonalDo, ShopJourney, GeminiLive or memory files. No real family fixtures.

## Visual references and asset provenance

Public reference inspected: [mymind homepage](https://mymind.com/) on 14 October 2026. Useful general patterns: mixed visual bookmarks/notes, generous space, minimal filing, search and a calm detail view. Assembl uses its own typography, plum/petal/lilac palette, glass D, card composition, fictional content and explicit next-action review. No mymind source code, copy, screenshots or proprietary assets are included. Search here is literal metadata search; no semantic/image recognition claim.

Existing approved original assets only:

- `/brand/agent-studies/arc-harbour-terraces.webp` and `arc-exploded-model.webp`: fictional original generated illustrations, previously reviewed. Provenance: `docs/design/agent-studies-2026-09-10.md`.
- `/studio/assembly/creative-work-taking-shape.webp`: original Assembl concept art, not a real location; `public/studio/assembly/README.md`.
- `/brand/do-glass-D-transparent.png`: canonical locked DO identity through GlassIdentity.
- All written example content is original fiction; `example.com` is a placeholder, never fetched.

## Save intent v1 / companion seam

`lib/do/saved/save-intent.ts` accepts only `{version:1,kind,title,text,sourceUrl,tags}`. Bounds: title 160 characters, text 6,000, link 2,000, eight tags of 32 characters. Unknown fields are rejected. Owner, credentials, permissions, hidden HTML and remote images are not transport fields. Source links are HTTPS, query/fragment stripped before review, credential/localhost/IP/private-suffix/non-default-port rejected. This is **inert link validation, not SSRF-safe fetching**: public-looking DNS can resolve privately. No fetch exists; any future fetch needs DNS/IP validation across resolution and redirects, fixed egress rules, response/MIME/byte/time bounds and explicit consent. Never pass this sanitizer to an arbitrary URL fetcher.

Image selection is a separate page-local path: explicit file chooser, JPEG/PNG/WebP <=5 MB and <=24 MP, decode locally, max 1,400px, re-encode to strip metadata, <=2 MB data URL. No SVG/HTML, object-storage upload, remote image URL, page screenshot, clipboard read, silent capture or provider processing. Async selection is invalidated on close/kind change. At most 80 cards. The 24 MP check runs after decode: it bounds accepted dimensions, not peak browser-decoder memory. Compressed input is capped at 5 MB; physical-device image resource testing remains a release gate. Native capture must transfer explicitly selected bytes through a bounded authenticated channel and repeat review; no shared secret or private content in navigation URLs. Companion owner has agreed to leave Save disconnected pending contract integration; existing selection handoff stays untouched.

## Durable API foundation — disabled by default

`/api/do/saved` is gated by `DO_SAVED_DURABLE_ENABLED === 'true'` on the server. No environment was changed. The default 503 path performs no auth or database call. With a synthetic enabled environment, GET and POST require same origin, existing non-anonymous `doOwner()` verification and matching `X-DO-Workspace`. Requests are strict and bounded to 40,000 bytes; save requires `consent:true` and `consentVersion:'do-saved-v1'`. Untrusted owner, HTML, hidden image fields and image durability are refused. Responses are private/no-store and never echo backend errors.

`lib/do/saved/storage.ts` implements the existing repository port using the cookie-scoped Supabase client. Every read/update carries owner predicates; updates compare owner, ID, revision and deletion state atomically. Insert never upserts. Returned rows are validated and the API returns the database receipt, not optimistic success. No process memory fallback, service key or new task store exists. List is bounded to 80 records; per-ID reads can return content-free tombstones. Save IDs cannot be reused after deletion. This API stores inspiration metadata only; source-linked tasks still use the existing copy-to-Write flow.

`schema-review.sql` remains an **unapplied production migration proposal outside supabase/migrations**. It includes strict JSON validation (including null/missing/extra fields), owner RLS, anonymous and service-role table denial, consent version, immutable owner/id, revision progression, irreversible content-free tombstones and serialized per-owner insert quotas (80 live items, 1,000 lifetime IDs). Retention is explicit: live metadata remains until owner removal/account deletion; tombstones retain only identifiers/revisions/timestamps, not content. No automatic TTL or cleanup job is claimed. A user who reaches the lifetime-ID limit receives a quota response; ledger compaction is not silently performed.

Synthetic proof: 36 Vitest contract/route/adapter cases and `scripts/test-do-saved-sql.cjs` with 35 isolated embedded PostgreSQL checks. The latter executes the proposal against fictional auth roles, proves RLS/null rejection/CAS/erasure/quota and closes/reopens its local database to verify persistence. It does not establish hosted Supabase auth, independent-session races, API gateway behavior or production activation. No real data, database or flags were used.

Existing continuity is controlled by `DO_CONTINUITY_DURABLE_ENABLED`; it does not activate this API. The board UI remains session-only regardless of either flag. No existing task store, consent, native integration or account navigation is bypassed.

## Release checklist

- [x] Inspect local desktop and 375px board/review/detail/task states; verify Add consent, Escape and no overflow. See PROOF.md.
- [ ] Complete physical Safari/device, account-boundary and work-loss/navigation release QA.
- [ ] Review full repository typecheck/build/guards on exact PR SHA; no heavy concurrent build on the shared Mac.
- [x] Isolated SQL null/shape/RLS/erasure/restart/quota proof; retention and quota behavior documented.
- [ ] Review and approve retention/quota policy, then generate the exact reviewed production migration via Supabase CLI.
- [x] Embedded PostgreSQL anonymous/A-B isolation, immutable owner, stale CAS, tombstone and new-instance reload checks.
- [ ] Verify independent-session concurrent insert/edit/delete/rollback against a disposable full PostgreSQL or Supabase test project.
- [x] Bind cookie-scoped adapter and mount disabled same-origin/no-store/bounded API with workspace and consent checks.
- [ ] Verify cookie refresh, sign-out and authenticated owner switching end-to-end against synthetic staging accounts.
- [ ] Approve/apply the reviewed schema to the named staging target first; inspect table/function grants and RLS, then verify save/restart/read/delete with synthetic owners.
- [ ] Set DO_SAVED_DURABLE_ENABLED only after explicit target-specific approval; verify its absence/false value everywhere else. Production schema and flag activation require separate approval.
- [ ] Add authenticated UI loading/unavailable/conflict/consent/revocation/sign-out/account-switch states. Never silently fall back from cloud to tab storage.
- [ ] Image durability needs separately consented private bucket/owner path, type/size checks, metadata stripping, deletion and signed-URL lifetime proof. No public image proxy.
- [ ] Review companion/browser/Mac/phone Save contract with its owner; verify installed clients and native handoff, exact selected bytes, owner isolation and cancellation.
- [ ] Verify a save → restart → same owner/device → second device → delete lifecycle before advertising cross-device save.
- [ ] Review staging/production publication separately. Normal PR preview verification is authorised; production promotion, migration apply, security/config change and native installation remain separate approvals.

Rollback: omit/revert this isolated route and modules. No production state to migrate or erase. Screenshots remain local under `output/playwright/`; never upload them.
