# Client workspace migration checkpoint

**Review implementation, not production cutover.** Authority now includes tested publication on assembl.co.nz. Publication is still conditional on source/data reconciliation, authenticated persistence, recipient isolation, visual proof and coordinated release review. Original Site remains the working source of truth.

## Identity and provenance

- Target repo: `katecoveny-svg/assemblnz-f0afd79d`; local branch `review/client-hub-migration`.
- Initial target baseline: `beab36a512422a6c4571e78c5dad797d76d6f04a`. Current approved main `dd241e532519f00094a221d094a584840544ca06` (including font PR1441 and preceding production work) was merged into this isolated branch; no DO/source implementation changes are made here.
- Original Site: `appgprj_6aa356a9700081919f7959cc70c9f6d8`, Sep14 checkout, commit `f9c752ed5d5107ebac9f675aa6d14bce116c01c1`.
- The 58 copied dependency files are inventoried with original SHA256 and byte sizes in `source-inventory.json`. This is an archival checkout plus five local modifications, **not a reconciled export of today's deployed version**.
- `dirty-source-hashes.json` covers all five modified original files. The original checkout, environment and data are untouched. No credentials or production records were copied.

## What is retained

`/review/client-hub` opens the original ConceptStudio directly, without a new landing-page detour. It retains opportunity briefs, client/company brand editors, idea board, concept selection, journey rendering, copy editor, pitch/tender controls, Radar panel, source panel, knowledge library, deal planner, campaign dashboard, security panel and media/video studio controls. Interactive experiences use the original `buyerHtml`/`conceptExperienceHtml` renderer, not a new simplified widget.

Company and client fields can be edited for arbitrary briefs. Intelligence-linked briefs remain locked to their scoped context. Assembl's frame uses Instrument Sans and plum; explicit client brand choices remain supported. No image generation runs on mount; review attempts return an unavailable message and make no provider call.

## Adaptations and limits

- Imported aliases are namespaced. Fetch calls use an explicit fixture transport with no native network fallback. Unknown calls fail closed.
- Original Zod3 contracts use `zod/v3` from the main app's Zod4 dependency; no schema rewrite. The original Radix Slot uses the existing main package.
- PDF/PPTX extraction dependencies and PDF worker are retained. Production uploads are blocked; text-file/local-brand interactions remain original UI behaviour.
- Draft persistence is memory-only and explicitly labelled; reload loses drafts. Revisions are guarded. It is not cloud storage or production auth proof.
- Concept ideas/build return explicitly labelled deterministic fixtures using original starter contracts. They do not invoke an agent or test model quality. Tender drafting has no fixture and stays unavailable.
- Radar/saved intelligence, campaign collection, owned film/media, knowledge records and company agent connections are unconnected. Empty fixtures do **not** establish empty production data.
- Sharing controls are disabled. The old source's bearer/forwardable link behaviour is not accepted for the new system. The recipient API is deliberately 404/no-store with no connected grant repository.
- Review page requires development mode, explicit flag and a loopback host. It cannot be opened through a production host. This is not sufficient permission to ship confidential presets in client bundles; audit/sanitise bundle content before publication.
- Custom briefs use a neutral visual-direction prompt instead of unrelated marina/boats or another client’s imagery. Matching sector illustrations are explicitly labelled illustrative; selected media does not imply approval or access. Rounded clipping and 375px owner-layout corrections are scoped to this review. No stock assets are copied. Full production visual/media parity remains open.
- `scripts/migration-review/import-hub.py` records the initial import. Do not rerun it over subsequent review adaptations. Review deltas live in git; original hashes remain the provenance authority.

## Routes

- Local UI: `http://127.0.0.1:3187/review/client-hub` with `ASSEMBL_HUB_MIGRATION_REVIEW=1`.
- Isolated recipient boundary: `/api/client-hub-migration/recipient/[id]`.
- Proposed production owner route: choose one canonical direct workspace route after reconciliation; do not replace existing `/studios` destinations yet.

## Production gates

1. Match original Site identity to deployed version and confirm the five dirty changes against it. Obtain authorised, bounded inventory/count/hash metadata before any production data transfer. No secrets transfer.
2. Map D1 records and FILES media to existing main Supabase/storage primitives. Prove ownership, revision concurrency, backwards-compatible renderer parsing and backup/rollback before import. No DB migration has been applied.
3. Use the main app's server-authenticated identity. Owner workspace, research and media queries must be scoped server-side. Never use client-selected company as authority.
4. Implement approved immutable recipient projection and active, expiring, revocable user-bound grants. Prove wrong recipient, anonymous request, owner-only records, revoked/expired grant and direct media requests all fail closed. No enumeration or unrelated company data.
5. Connect already authorised image/agent providers through existing secure adapters. User-initiated generation only, with approved budget/rate limits. Test meaningful output and review before save/share. Do not silently use production keys or pay for fixtures.
6. Desktop and 375px visual interaction proof; keyboard/reduced-motion behaviour; original idea-board, brand, tender and interactive experience parity. HTTP success is compile proof only.
7. Full typecheck, relevant tests, lint, brand/macron checks and production build; then a reviewed PR and coordinated preview/release. Review current main again before merge. Preserve original Site during staged cutover and rollback window.

## Reusable boundary

Uses the original Studio renderer/board/brand contracts and existing main UI/auth/provider foundations. Creates a temporary fixture transport and a reusable pure recipient policy. Extends no DO or source-ingestion implementation. A grant policy is necessary but does not replace authoritative server lookup/RLS or prove live access protection.

## New empty owner-workspace stage

`/studio/workspace` and `/api/client-hub-migration/owner` are implemented but off by default. They start with no client records or fixture ideas; owner-authored ideas use the original editor/renderer. The existing verified cookie session, exact user allowlist, original payload validation, same-origin/no-store API and security-invoker optimistic-save RPC define the boundary. The SQL proposal is separately reviewed and unapplied; no production credentials, grants, media or old data are connected. See `owner-activation-plan.md` and `confidential-preset-audit.md`.

Owner API/unit tests:7 additional passes, total16. Actual synthetic Postgres RLS/RPC/storage-membership tests pass; production cookie/storage/account proof is outstanding. Sharing and backup import are disabled on the new owner stage.

Two representative fictional screenshots are saved privately to Library: desktop `libfile_01a8d6a02020819193acd0b03b1b75b1`, mobile `libfile_9e270a16870c8191b3b53965b5aee473`, both version1. These show the fixture review, not an activated live owner account.
