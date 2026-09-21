# Assembl Flex — household proof

Status: review implementation, 21 September 2026. No production release or energy-provider integration is claimed.

Assembl Flex applies the governed agentic journey platform to household flexibility. A household can express a ready-by time and battery reserve, inspect a prepared EV schedule, explicitly approve a simulation, override it and export the evidence. Pursuit finds the work, DO prepares the bounded action and Studio makes it tangible.

## Working surfaces

- `/do/flex`: household intent and approval journey.
- `/creative-studio/flex`: the same interactive implementation, entered from Studio.
- `/pursuit/flex`: the same proof, entered from Pursuit.

All three use `components/flex/FlexExperience.tsx`. These are entry points into one proof, not separate platforms. Navigation between routes starts a fresh tab-local session.

The four fictional scenarios are morning charging, a solar window, storm reserve and an infeasible charging shortfall. Baseline: EV at 40%, target 80% by 06:45, 60 kWh vehicle battery, 7 kW charger, illustrative 90% charging efficiency, home battery at 60% with a 35% reserve. No home-battery discharge is scheduled. Hot-water flexibility is captured as intent but no hot-water or heating command is produced.

## Reuse and authority

**Uses** the existing Journey `ProposedAction` contract and canonical DO mark. **Creates** a narrow `UtilityOperatingSystemAdapter` contract in `lib/flex/adapter.ts` with read, prepare, execute and override operations. The only implementation is a browser-local simulator. There is no network call or provider credential.

Plans bind the exact fixture, household, boundaries and proposed action. Execution checks that the plan is unchanged, feasible, unrevoked and explicitly approved for the same account and fingerprint before the permit expires. Changed boundaries require a new review. Replay returns the original receipt; override prevents replay. These checks illustrate the contract; client-side state is not production authorisation.

Receipts always mark external actions false, delivered energy null and rewards null. Session evidence counts simulation approvals and overrides only. Refresh clears all state; users may export JSON. Exported files are user-controlled and are not durable server audit records.

## Integration readiness

“Kraken-shaped” describes the proposed adapter boundary, not a verified Kraken API implementation, partnership or connection. Before a live provider can be added, verify documented API capabilities and obtain sandbox access, customer/account scope, device eligibility, contractual permissions and support ownership. A live adapter requires server-side identity, expiring scoped authority, idempotency, durable audit, cancellation acknowledgement, telemetry freshness and reconciliation. Commands, tariff changes, monetary claims and grid settlement remain outside this proof.

The first commercial pilot to qualify is a retailer or network partner testing whether customers understand and accept bounded EV flexibility. Candidate measures are comprehension, approval/decline rate, overrides and support handoffs. Savings, device delivery, grid benefit and paid rewards require measured, independently attributable evidence; the simulator does not establish them.

## Pursuit source pack — proposed, not monitored

Use the existing `kb_sources` / Opportunity Horizon ingestion path when approved. Do not build another ingestion system or represent these candidates as connected feeds. Suggested category: `energy_flexibility`.

| Candidate source owner | Signals to qualify | Readiness |
| --- | --- | --- |
| Electricity Authority | Regulatory change, flexibility trials, customer participation | Official source URLs and ingestion permission still to validate |
| Transpower | System needs, demand response, market participation | Official source URLs and freshness requirements still to validate |
| NZ electricity retailers and distribution networks | Pilot invitations, household propositions, procurement | Named partner and official notice required |
| Kraken and other provider platforms | Partner access, integration capabilities, device coverage | Public claims are not API access; verify with provider |

Proposed signal taxonomy: policy change, pilot invitation, procurement, customer-journey change, integration availability. Every future evidence item should retain the existing source URL, publisher, publication/retrieval times and authority tier; distinguish confirmed facts from hypotheses. No sources, opportunities or simulated metrics are inserted into the live database by this change.

## Review and reversal

Run the Flex unit tests, typecheck, full lint, brand/macron checks and production build. Exercise mobile at 375px, keyboard focus, scenario switching, approval, override, invalid time, infeasible handoff and export in an available preview. Check that every receipt remains simulated and that no provider request occurs.

Rollback removes the three route folders, Flex component/domain folders and entry links. No database migrations, provider settings or production credentials are changed.

## Review evidence — 21 September 2026

- 16 Flex domain tests pass: exact approval scope, expiry, account/plan mismatch, tampering, stale boundaries, replay, override, infeasible charging/reserve, solar/storm, already-met target and input validation.
- Focused ESLint passes for all changed application files.
- TypeScript passes. The production build compiled and generated all three Flex routes successfully.
- Brand guard passes. Macron check passes via `node --import tsx scripts/lint-macrons.ts`; the `tsx` CLI's IPC setup is blocked in this environment.
- Full-repository lint failed with 1,424 findings (1,176 errors / 248 warnings). Three findings were in the initial Flex component and are fixed; the final focused lint passes. The remaining findings are outside the changed application files. This branch does not attempt repository-wide lint cleanup.
- Browser interaction and 375px visual evidence remain unverified: the available browser blocks the local app URL and local-file preview. No screenshot is claimed.
- Automatic approval review initially rejected the GitHub upload; Kate subsequently explicitly authorised publishing this branch and opening a draft PR. Publication does not authorise a merge or production release. Browser/mobile evidence is still required before leaving draft.

Proposed PR: **Add Assembl Flex household flexibility proof**. Acceptance: a household can prepare, inspect, approve and override a fictional EV plan; infeasible requests require a human review; changed boundaries revoke the old plan; no external command, measured delivery or earned reward is asserted. Keep the PR in draft until preview/mobile review and repository checks are resolved.
