# DO shop journey — review candidate, 13 October 2026

Branch `feat/do-shop-journey` on main. `/do/shop` is now a complete plan-to-list journey; the earlier fictional-offer fixture moved to `/do/shop/sample` unchanged.

## The journey

1. **Brief** in the shopper's own words. `parseShopBrief` reads people, nights, NZD budget, vegetarian, common allergens and “we have …” pantry hints with deterministic patterns. Nothing is sent to a model. Anything it did not use is shown as “Not used”, never silently applied.
2. **Dinners.** `planMeals` rotates an eight-dinner everyday New Zealand catalogue (`lib/do/shop/catalogue.ts`, our own sample recipes with explicit quantities and indicative pack prices) through the nights, honouring vegetarian and allergen limits and never repeating before every eligible dinner is used. Any night can be swapped or re-served.
3. **Pantry.** Rows pre-fill from the brief; each needs a quantity, a unit and a “checked in the kitchen” tick. Unknown is not zero: an unconfirmed row deducts nothing. Deduction uses the existing `consolidate`.
4. **List by aisle** in store order (produce → meat & seafood → chilled → dairy & eggs → bakery → pantry → frozen), with shopper-shaped quantities and an estimate against the budget using indicative prices only, with fees declared unknown.
5. **Hand off.** Each line is a plain link to the chosen supermarket's own public search page (Woolworths, New World, PAK'nSAVE), opened in a new tab. The shopper adds items and checks out themselves. Copy list; keep the list as a DO task through the continuity contract when signed in with sync on; prepared receipt (`prepared · nothing ordered`) through the existing preparation contracts, invalidated by any later edit.

## What it deliberately does not do

- No live prices, stock, cart, order or payment. The retailer URL shapes are best-known public search forms and should be checked when a retailer changes its site.
- No browser-extension carting. Retailer terms on automated access could not be read from the build environment; that stays parked until a person has checked them, and would in any case run only in the shopper's own browser session with the shopper watching.
- No model call. The brief parser is deterministic; a model-assisted brief can be added later behind the existing consent flow.

## Evidence

| Check | Result |
|---|---|
| `vitest lib/do/shop` | 19 new journey tests plus the existing preparation tests pass (parsing, defaults and bounds, no invented pantry items, rotation and limits, pantry deducted once, unreviewed rows ignored, display quantities, handoff links, list text) |
| `tsc --noEmit`, scoped ESLint | clean |
| `scripts/review-do-shop-journey.cjs` | 28 browser checks pass at 1440px and 375px: brief → plan with the right people/nights/budget, unrecognised words surfaced, swap, pantry pre-fill and deduction, aisle order, budget comparison, retailer links open in a new tab and switch with the supermarket, keep-as-task through a fixture continuity route (desktop) and disabled with a reason when signed out (phone), prepared receipt, edit invalidates the receipt, no overflow, no page errors. Screenshots in `evidence/do-shop-journey-20261013/`. |
| `scripts/review-do-unified.cjs` | updated: `/do/shop` checked for “nothing is ordered”; the fixture checks now run against `/do/shop/sample`. |

**Not established:** a real signed-in keep-as-task (fixture route only), retailer page behaviour, Safari/iOS, production build.

## Rollback

Revert the PR; `/do/shop/sample` holds the previous surface.
