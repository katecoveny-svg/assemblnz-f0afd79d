# DO companion coordinated release — 15 October 2026 (Auckland)

Kate explicitly authorized integrating, pushing, reviewing, merging and deploying the local companion work, with bounded runtime verification. Preserves initial candidate 774993452 and integration 46886ea0b. Integrated origin/main 20ee05f4a, Studio befb9f9e1 (local610b05491), and voice provisioning03c9cb2ee (local52981eaae).

## Release checks

- Locked pnpm9.15.9 dependencies installed inside this checkout; external node_modules symlink removed. No lockfile change.
- Full production `pnpm build` passed, including generated Next route types. Fixed page searchParams Promise contracts and moved non-route exports out of route modules. Removed unused Xero scopes export; provider logic unchanged.
- Full TypeScript passed. Scoped ESLint, brand and macron guards passed.
- Full Vitest:3939 passed,3 skipped across430 passed/2 skipped suites. Built existing NZ plugin fixture bundles first. Updated stale assertions for audited docs path, current homepage copy, origin-only shared context and extracted extension inventory. Removed Arial fallback from DO loyalty CSS to comply with existing guard.
- Node selected-tab contract:18 passed. Journey eval:36/36, zero critical failures.
- Production build install page rendered at375px in Chrome; screenshot `do-companion-release/install-375.jpg`. Hosted preview board also rendered at375px; evidence `do-companion-release/board-preview-375.jpg`. Local authenticated workspace unavailable without local service configuration; production owner proof pending.
- Studio owner reviewed Clear route/receipt/handoff and board. Two board state bugs were fixed with actual-component race/new-handoff tests: delayed receipts preserve newer typed/voice turns; preparing another task resets saved state. Activity clears when selecting/editing another task. Master reference is linked, not synced.

## Target and configuration

Vercel project `assemblnz-f0afd79d`, `prj_0pfAzWeZkMqgS6QAqO7c2BNwuZiR`, team `team_4fkROIfytNfYsGSjVX2dC2DI`; production domains www.assembl.co.nz and assembl.co.nz. Existing production Gemini and Supabase credentials are present by metadata; no values retrieved. DO_VOICE_LEASE_ENABLED is absent (off); no allowance increase. Service-only ledger migration20261014202527 already applied by voice owner to wurwcrgxjjwqdaxqceey; see provisioning report. Do not apply twice.

## Scope and remaining live checks

Selected-page image/text package is downloadable separately from `/do/install`; unchanged activeTab/scripting/sidePanel grant footprint and Assembl-only host. It requires Chrome Load unpacked and explicit workspace enrollment and chosen-tab toolbar activation. Hosted conversation does not update installed source by itself.

Board/Clear use existing owner Office storage; live owner save/reload and account-isolation proof remains to be recorded. Longer voice leases stay off pending account cutover/retention/provider resume proof. No claim NZ accent repaired, native system-wide access, automatic Codex/Claude connection, or Library master synchronization. The Studio editable voice brief remains review/export only, not custom provider direction.

Rollback: revert this release PR and let main deploy, or restore prior production Vercel deployment. Additive voice ledger can remain unused with flag off; do not drop stored data to roll back UI. Do not enable leases merely because schema exists.

Office production rollback-only two-owner persistence/RLS proof passed; exact SQL in `voice-lease/office-rollback-proof.sql`. This is transactional save/read/isolation, not committed cross-session durability. Frozen photo-note CI harness updated to navigate the draft tools and explicitly attach reviewed context in the shared conversation; no photo/provider consent checks removed.
