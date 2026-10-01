# Build cost workflow

Stay on Vercel. Work in an isolated current-main checkout and batch changes before pushing. This extends the existing ignored-build primitive; it does not alter release authority or Vercel settings.

## Daily loop

1. Fetch main, verify active owners and keep the original dirty checkout untouched.
2. Commit locally as needed. Run focused unit/security tests and diff checks before pushing. Coordinate the serial heavy-build slot; visual work has priority.
3. Complete one coherent reviewable change, then push once and open one draft PR. Use the Git integration's preview; do not also deploy manually or request a forced/no-cache build. A push and subsequent PR event can still be deduplicated by the provider: verify deployment commit SHAs rather than assume a count.
4. Review that exact preview and required checks. If fixes are needed, batch them locally into one follow-up push. Never bypass required checks, security tests, tenant/guest boundaries, or the production release checklist to save money.
5. Merge only with explicit authority. Main production validation remains. Preserve the known-good deployment for rollback; preview promotion needs environment/security review and is not introduced by this change.

## Audited dependencies

The ignore command requires the previous deployment SHA, compares the complete range with NUL-separated paths, and includes both sides of renames. Missing history, empty diffs (including environment redeploys), unknown paths and mixed runtime changes build. Branch names never grant permission to skip.

| Example | Decision | Dependency evidence |
| --- | --- | --- |
| `docs/context/CURRENT.md`, `docs/factory/LEARNINGS.md` | Skip Next build | Authoring/context checks consume these separately; no root app runtime imports/readers found in current-main audit. |
| `docs/deployment-and-release-checklist.md` | Skip Next build | Human release guidance; required release checks still apply. |
| `research/note.md`, `outputs/proof.png`, `.pr-assets/phone.png` | Skip Next build | Research/evidence files outside `public/`, runtime content and root app imports. HTML/JSON and unknown output formats build. |
| `security-proposals/nz-edge-maintenance/proposed/mcp-nz-govt/index.ts` | Skip Vercel only | Explicitly excluded by `tsconfig.json`; unapplied files consumed by `scripts/test-nz-edge-maintenance.cjs`. Existing proposal security/typecheck/full-build CI remains intact. |
| `apps/do/macos/DOCompanion.swift`, `apps/do/extension/manifest.json` | Build | `next.config.ts` traces both trees into `/api/do/download`; native-only is not independent. |
| `apps/do/shared/do-tasks.ts` | Build | Public-front-door guard and web runtime use shared DO content. |
| `content/spark-winter-series/session.md` | Build | Traced into approvals/ingest runtime bundles. |
| `app/docs/content/guide.mdx` | Build | `lib/docs.ts` reads this directory at runtime. A markdown extension is not evidence of irrelevance. |
| `docs/knowledge/REGISTRY.md`, any new/unclassified path | Build | Dependency relevance has not been proven safe; deliberately conservative. |
| `tsconfig.json`, lockfile, auth, middleware, workflow or ignore-script changes | Build | Build/config/security dependencies or unknown effects. |

When introducing a reader/import of an authoring path, update the policy and tests in the same change. No broad proposal/native/documentation blanket skip is permitted. Run `node --test scripts/vercel-ignore-build.test.mjs scripts/test-nz-edge-maintenance.cjs` before a push.

## Measured and estimated

September billing supplied by the delegated investigation: infrastructure US$266.62, builds US$266.07 on Turbo machines, total US$276.62. Kate reports close to NZ$600 paid. These are historical figures, not a currency conversion or promised future saving. Investigation supplied 122 deployments in the last 24h (31 production, 91 preview); a deployment count is not a count of billable builds or successful releases.

Verified metadata: production deployment `dpl_GuLuEw1fUGJkSqyQTtHaMG7AxGDd` is READY at main `12d596fc6d7543b3884291fe5fa0c345d4ac6566`, source `git`. Its buildingAt-to-ready interval is about 180 seconds; this is wall time, not billed machine duration. The connector's project/deployment responses do not expose machine/concurrency configuration. No settings were changed.

Repository evidence: DO core validation runs on selected PR paths and every main push, each with a full production build. Other domain workflows also build overlapping changes; e.g. the edge proposal workflow builds after tests and typecheck. These are additional GitHub compute runs, not evidence of extra Vercel billing. Removing them requires branch-check/security-owner review, so this change leaves them intact.

Estimated lever: five incremental pushes batched into one can avoid up to four intermediate Git preview builds if each otherwise built. Actual avoided minutes/dollars require deployment state, billable duration, machine and cache data. No dollar reduction is promised. The new proposal skip avoids a Vercel Next build only when the complete diff consists solely of audited paths; unknown or runtime changes still build.

Measure the next comparable week: pushes per change, actual Vercel builds (exclude canceled/skipped deployment records), billed build minutes by machine, cache status, failed/retried builds, and invoice build spend. Compare workload as well as counts.

## Reversal

Revert this PR to restore the prior filter. An emergency manual redeploy remains buildable because empty diffs build. Vercel machine, concurrency, plan, security and purchase decisions require a separate exact-impact proposal and approval.
