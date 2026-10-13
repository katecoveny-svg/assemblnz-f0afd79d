# Saved · DO — first visual review slice

## Scope and truth

`/do/saved` is a working session-only visual board, built on main `57b174df2` in a dedicated worktree. It supports a mixed image/word board, literal multi-term search and type filters, manual link/text/note/image addition, exact-content review, local consent, detail/removal and source-linked task drafting/copying. Leaving/reloading clears additions; the board says this before saving and in its page chrome. There is no browser storage, board API, provider call, URL unfurl, OCR, account save or native capture connection. Native dialog supplies modal focus containment and Escape dismissal. Task handoff is explicitly copy → open DO → paste into Write → review. Copying does not create a durable task.

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

Image selection is a separate page-local path: explicit file chooser, JPEG/PNG/WebP <=5 MB and <=24 MP, decode locally, max 1,400px, re-encode to strip metadata, <=2 MB data URL. No SVG/HTML, object-storage upload, remote image URL, page screenshot, clipboard read, silent capture or provider processing. Async selection is invalidated on close/kind change. At most 80 cards. Native capture must transfer explicitly selected bytes through a bounded authenticated channel and repeat review; no shared secret or private content in navigation URLs. Companion owner has agreed to leave Save disconnected pending contract integration; existing selection handoff stays untouched.

## Durable foundation — inactive

`lib/do/saved/durable.ts` defines an owner-bound repository and atomic compare-and-swap port, validated records, revision conflicts and content-free delete tombstones. Authenticated owner must come from existing `doOwner()`; an expected workspace is only a mismatch guard. Foreign rows fail closed. No fallback to memory on storage errors. Image durability is refused until owner-only private blob storage and consent are proven.

`schema-review.sql` is a migration **proposal outside supabase/migrations**, never applied. It proposes owner RLS, no anonymous rights, content-free tombstones, immutable owner/id and revision progression. It deliberately has no live route, adapter binding, feature flag, env/config change or production permission change. Unit tests use a fake CAS store: they do not prove PostgreSQL isolation or durability. Real isolated PostgreSQL proof remains required. SQL constraints are a second boundary; the exact strict Zod content schema must still be enforced by the adapter. Strict JSON and source-string constraints are included in the SQL proposal; they remain unexecuted and require PostgreSQL parity proof. Per-owner quota/retention still need completion before release.

Existing continuity is runtime flag controlled by `DO_CONTINUITY_DURABLE_ENABLED`, not inherently hard-closed. Its availability does not establish board persistence. This slice neither changes the flag nor claims cross-device saves. The clipboard task draft is independent of continuity activation.

## Release checklist

- [x] Inspect local desktop and 375px board/review/detail/task states; verify Add consent, Escape and no overflow. See PROOF.md.
- [ ] Complete physical Safari/device, account-boundary and work-loss/navigation release QA.
- [ ] Review full repository typecheck/build/guards on exact PR SHA; no heavy concurrent build on the shared Mac.
- [ ] Prove strict DB JSON validation and complete owner quota and retention design; generate migration via Supabase CLI after approval.
- [ ] Run isolated PostgreSQL tests for anonymous denial, A/B read/write/delete isolation, owner reassignment, CAS concurrency, tombstone resurrection, transaction failures and new-process reload.
- [ ] Bind repository to session-scoped DB client (no browser service key), mount same-origin no-store bounded routes with expected-workspace checks and explicit reviewed save consent.
- [ ] Confirm target DB migration, environment, deployment identity and owner persistence with synthetic accounts; never infer activation from configuration alone.
- [ ] Add authenticated UI loading/unavailable/conflict/consent/revocation/sign-out/account-switch states. Never silently fall back from cloud to tab storage.
- [ ] Image durability needs separately consented private bucket/owner path, type/size checks, metadata stripping, deletion and signed-URL lifetime proof. No public image proxy.
- [ ] Review companion/browser/Mac/phone Save contract with its owner; verify installed clients and native handoff, exact selected bytes, owner isolation and cancellation.
- [ ] Verify a save → restart → same owner/device → second device → delete lifecycle before advertising cross-device save.
- [ ] Review staging/production publication separately. No deployment, migration apply, security/config change or native installation is authorised by this PR.

Rollback: omit/revert this isolated route and modules. No production state to migrate or erase. Screenshots remain local under `output/playwright/`; never upload them.
