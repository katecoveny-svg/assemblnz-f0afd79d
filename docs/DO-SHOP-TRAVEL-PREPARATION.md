# DO Shop and Travel preparation fixtures

Review foundation on current main `707f529ca`. Routes: `/do/shop` and `/do/travel`.

## Authority and retention

Both routes use fictional household/traveller identities and React session memory only. Refresh or route departure clears state. This is an explicit fixture mode, never a fallback from durable storage. No owner record, credentials, provider request, live cart, order, booking, real reward issuance or DB migration. The exact fixture routes bypass auth refresh and suppress the generic utility widget; other DO/auth routes are unchanged. No Foodstuffs outreach. Woolworths is the first partnership target, with no connected integration.

Authenticated persistence must use `apps/do/services/owner.ts` (server-verified non-anonymous owner), private/no-store snapshots, owner-keyed storage, revision concurrency and durable idempotency. Never accept the fictional client owner IDs as authenticated ownership. Depend on the separate shared-auth/persistence reliability task before any full rollout. No silent memory fallback if durable storage fails.

## What is reusable

Creates `lib/do/shop/preparation.ts`: explicit recipe yield and occurrence scaling; compatible-unit consolidation; pantry deduction once; pack rounding and leftover quantity; separate merchant-neutral requirements and offers. Offers carry merchant, seller, product, variant, store, observed/expiry times, stock, source and fulfilment. Unknown allergens and cross-contact exclusions block review. Freshness, currencies, stock and budgets are checked again at receipt creation. Fees and variable weight remain explicitly uncertain.

Creates `lib/do/preparation/contracts.ts`: shared fictional identity/revision, NZD budget summary, content-bound review and prepared-only receipt, plus simulated sponsor/eligibility/terms/reward-choice contracts. Reward keys include owner/task/offer and exclude revisions, so retries cannot earn again. Pending events settle to simulated earned/failed evidence; terminal events never settle twice. The task completes independently when the optional activity is skipped.

Extends existing `lib/do/travel/preparation.ts` and `manual-input.ts` through a one-segment manual preparation UI. Explicit UTC offsets and IANA zones preserve the existing DST/time validation. Itinerary input edits and allowance edits invalidate review and receipt. Flight status, price availability and servicing remain unknown. No hotel selection/reservation capability is claimed; room cost is a manual allowance only.

Uses canonical `GlassIdentity` and the existing DO layout. The small functional frame is provisional, pending the separate visual-reference audit; it is not a new Woolworths branded demonstration.

## Existing concepts inspected

`lib/journey/catalogue.ts`, `services/intent.ts`, `context.ts`, `plan.ts`, `resolution.ts`; `lib/concepts/woolworths-assembled.ts`, `everyday-rewards-copy.ts`; Everyday Rewards config, WaitStatesDemo and JourneyPlayer. The legacy catalogue does not supply precise ingredient quantities or complete allergen metadata. Its heuristic basket is preserved and is not promoted to this quantity contract. Existing scene/brand assets remain untouched. Existing WaitStatesDemo replay increments points separately from unique visited moments; this new contract deliberately does not reuse timer/tap issuance or programme rates.

## Scope limits

Two fictional vegetarian dinner recipes; weekly five-night or two-dish occasion mission. Not a full weekly nutritional plan. Fixture allergen declarations require actual package-label and cross-contact review before real shopping. Quantities are explicit sample recipe assumptions, not dietary advice. No OCR, fridge-photo inference, retailer scraping or provider integrations.

The rewarded wait is the genuine **human basket-review wait**, not a simulated provider latency. Optional pantry-use checklist and keep/gift demo acknowledgement. No artificial timers, delayed task completion, money, point rates, redemption or current Everyday Rewards benefit. Provider-processing waits can reuse the contract when a real adapter exists.

## Proof

- 67 tests across seven journey/Shop/Travel files pass; new tests cover unit conversion/mismatch, recipe scaling, pantry deducted once, pack rounding/leftovers, duplicate pantry, unknown/excluded allergens, stale offers, currency/stock/budget, variable weight/unknown fees, material review edits, reward replay/owner isolation/failure and zero fixture fetch calls.
- Typecheck passes. Focused changed-file eslint and standard narrow lint pass. Repository-wide lint fails with 1,412 existing problems (1,170 errors / 242 warnings); changed-file lint is clean.
- Journey eval and brand/macron guards recorded separately in the preserved evidence logs.
- Actual user Chrome extension used, not an assumed browser. Shop and Travel screenshots inspected at 375px and desktop (1280px). Document width equals viewport width; the wide basket table scrolls inside its own container.
- Shop pantry review → prepare → optional activity → review → receipt verified; then budget edit removes basket review/receipt. Pending simulated reward settles once with evidence. Fresh reload → double-click prepare → double-click receipt without engagement yields exactly one prepared receipt.
- Travel prepare → timezone timeline → review → receipt verified at 375px; allowance edit removes review/receipt. Booking remains disabled.
- Fresh Shop navigation captured using Chrome CDP: HTTP requests only to localhost assets/routes; installed extension resources also appear. No external HTTP request, widget API call or provider call. Preparation itself makes zero requests. Exact fixtures bypass server auth refresh too.
- A temporary middleware variable error was discovered in-browser, fixed and the corrected routes reloaded successfully. Historical console entries include that fixed error and extension message-channel noise.

No push, merge, external outreach or deployment. Local preview: `pnpm dev --port 3213`.
