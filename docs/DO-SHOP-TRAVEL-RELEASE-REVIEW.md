# Shop/Travel release review

Main base: `707f529ca`. Shop/Travel and catalogue branch is separate from auth/staging integration.

## Scoped CI fixes and review findings

- Initial DO-core browser proof still expected `/do/travel` to redirect to the generic plan widget. Updated the assertion to verify the distinct Travel preparation surface and added actual Shop/Travel review, cancellation, repeated-click and edit-invalidation checks. This preserves the generic `/do?task=plan` redirect contract.
- Two automated review findings were addressed: manual flight normalization now uses the same existing projection for validation and preparation (including pasted offset/timezone whitespace); recoverable Shop input errors leave recorded optional utility pending so a corrected basket can finish. Explicit cancellation can still fail the simulated reward, and earning remains idempotent. Manual projection regression and browser reward-recovery checks were added. Review threads were automatically resolved as outdated by the reviewing bot.
- A subsequent DO-core run passed the Shop/Travel checks but failed the **unchanged baseline** no-cross-product-links assertion on `/do/bills`. Source review found the existing `DoProductFrame` at main already contains the intentionally named `/creative-studio/voices` setup link inside `More DO tools`. No Bills/voice source, destination or permission was altered. The browser contract now positively checks that this single exact voice-setup link stays inside that menu, while rejecting every other Pursuit/Studio/hub/customer product door. This is a documented review of the intended shared sub-tool, not a skipped workflow or broad cross-product allowance.

## Release boundaries

Main auto-deploys through Vercel. These routes expose only clearly labelled fictional/sample Shop and session-only manual Travel preparation; receipts say prepared, checkout/booking are disabled, retailer prices/rewards are simulated, Foodstuffs outreach remains deferred, no database writes/migrations or credential/config/feature-flag activation occurs. Exact fixture routes skip auth refresh and the generic utility widget. `/demos` gate/noindex remains unchanged.

Authenticated defaults and auth fixes remain in the separate `codex/do-auth-preparation-staging` branch. Vercel Preview currently uses the production Supabase project; it is not isolated auth staging. No sign-in, email or saved-account write against production is authorized by the staging work. Isolated destination/config approval is parked for morning; no production memory proposal is applied.

Merge only after exact-head CI, Vercel and review checks are green. Do not bypass protections or required failures. Verify actual remote merge SHA and deployment state after merge. Recovery bundles preserve original foundation/consolidation commits; revert this feature merge to roll back.
