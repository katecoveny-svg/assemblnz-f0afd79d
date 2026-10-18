# Clay DO production release — 18 October 2026

Verified 2026-10-18 04:01:27 UTC / 2026-10-18 17:01:27 NZDT. Owner: Kate-approved release; Codex release verification.

## Release identity

- [PR #1613](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1613) merged at 2026-10-18 03:56:32 UTC / 16:56:32 NZDT.
- Exact independently reviewed and CI-tested head: `b5187702a9486dfd97be822193c995a39d4e02b8`.
- Merged and deployed code SHA: `ac6c3368b7f026a9b926fba915eb98bca09c23da`.
- Vercel project `assemblnz-f0afd79d` (`prj_0pfAzWeZkMqgS6QAqO7c2BNwuZiR`), team `team_4fkROIfytNfYsGSjVX2dC2DI`.
- Production deployment `dpl_GYhewqBg9iBTdDUrjBJKLjqgzWGu`: **READY**, matching the merge SHA, with `www.assembl.co.nz` and `assembl.co.nz` assigned and no alias error. Build duration approximately 118 seconds.
- [Public DO](https://www.assembl.co.nz/do) and [deployment record](https://vercel.com/katecoveny-svgs-projects/assemblnz-f0afd79d/GYhewqBg9iBTdDUrjBJKLjqgzWGu).

PR #1613 was updated in place by fast-forward from its earlier paper/SVG concept. All earlier Today work remained in ancestry; no duplicate redesign PR or unrelated PR was merged. Application code remained unchanged from Kate's approved `daf336cf6b44dd2b199240ffce896d6d91bb73dd`; later commits refreshed test expectations, CI wiring and release evidence.

## Passed gates

[Exact-head DO core CI](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707741) passed in 10m44s: typecheck, production build, lint/brand/macron guards, 1,934 core tests with two skips (181 files passed, one skipped), separate authentication (52), identity (10), photo/privacy (37), synthetic SQL and complete browser batch. These separate test groups can overlap and are not presented as a unique combined count. Photo v1/v2, the 42 clay checks and five companion guards passed. Refreshed local suites also passed 37 entry, 100 menu/shared-starter, 91 mobile, 28 synthetic voice-to-planner and 156 unified checks over 24 route navigations.

Other exact-head gates passed: [continuity](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707702), [voice](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707669), [browser connection](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707696), [synthetic storage](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707734), and [context health](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39094707743). Vercel preview passed. Supabase Preview was skipped and Vercel Agent Review neutral; neither is claimed as completed verification. Independent source and visual review found no blockers.

Earlier CI failures were stale fixtures: visible Add wording versus its unchanged accessible name, editor wording, removed starter-region names, and the old editor-hidden layout. These were corrected without changing product behavior, and rerun successfully. The updated clipping assertion measures text bounds rather than decorative clay overflow.

## Public verification

Real public production pages `/do`, `/do/personal` and `/do/widget?entry=write` returned HTTP 200 at 1440px and 375px (six combinations). Each rendered seven starters, appended an editable trip prompt while preserving existing text, and had no horizontal overflow. Fifty-four distinct loaded script/style/brand assets returned 200; there were no uncaught page errors. Screenshots were inspected after the real signed-out availability message settled. The canonical `/brand/do-glass-D-transparent.png` SHA-256 matches the repository: `1ac1808b169b631eb2a5cb3066a3935cfcea3f6bb4abf111822b9a74e5289091`.

Proof is retained locally under `output/playwright/clay-public-release/` (receipt and 12 captures). Only reviewed anonymous identity/personal/assistant GETs were allowed; other API traffic and all non-GETs were blocked. A first all-API-blocked attempt correctly left identity unverified; it is not counted as a product failure or completed render. No signed-in data, real voice, paid model, provider action or persistence write was exercised. Browser phone sizes are not physical-device proof.

## Configuration, data and remaining limits

- Migrations/schema/RLS changes: **not applicable** to this visual release; none applied.
- Environment, flags, secrets and grants: **no changes required or made**. Existing auth, ownership, consent, voice/provider and entitlement gates remain in place. No secret values were retrieved.
- Production account persistence and two-live-owner proof: **not run** by this release. Synthetic regression success does not widen existing account rollout claims.
- Physical iPhone/Safari and installed Mac packaging: **not run**, still outstanding. No native install, protected-preview bypass or cleanup occurred.
- Reversal: reviewed code revert or authorized rollback to the previous production deployment. No stored-data transformation or schema rollback is needed.

The prior local design review is [DO clay entry](../reviews/DO-CLAY-ENTRY-20261017.md). Its original publication-hold statements are historical and superseded by this verified release receipt. This documentation-only follow-up does not change the deployed runtime.
