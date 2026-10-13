# Woolworths NZ loyalty DO — independent review concept

Route: `/do/loyalty/everyday-rewards`. Noindex/direct link. Existing canonical hosted Site and demo catalogue unchanged. No merge or deployment authority.

## Direction and scope

Mode: Experience into Operate. Direction 4c's committed desktop/phone hero evidence was inspected before authoring. Preserve its confidence, type scale and dimensional storytelling; use an original daylight kitchen scene, green field and orange loyalty object rather than transplanting its coastal scene. Exact approved DO glass identity remains in the Assembl-owned work area; the green/orange partner frame uses typography rather than recolouring that asset. The orange object is a concept card, not a membership card.

The generated kitchen JPEG is synthetic concept artwork from OpenAI image generation on 13 October 2026. It contains no real retailer products or household data. Pantry quantities are independent fictional fixtures, never claimed as image recognition. The still life doubles as the anonymous sample photo.

## Reuse decision

Uses `lib/do/shop/preparation.ts` for quantity scaling, pantry deduction, pack rounding, budget and source blockers. Uses the existing consented `/api/do/vision` service through a grocery-specific adapter and the existing DoGeminiLive surface, without new credentials, APIs or scopes. Photo output is a bounded candidate list, with unknown quantities retained as unknown. Explicit mapping, editable identities/quantities/units, per-row confirmation and whole-pantry review precede calculation. Voice and written notes only map through the explicit ingredient-line format; arbitrary prose never becomes inventory. Original model/image/output fingerprints and user-edited status remain in the receipt. No raw image is persisted. Shared identity is GlassIdentity.

Inspected shared entry capabilities, Personal DO, grocery journey, ApprovalCard/WaitState and customer assembled views. Did not reuse older timed confidence/reward presentation, decorative approval handlers or shared process-memory journey repository. The new page is an intentionally route-local partner composition around existing calculation/provider primitives, not a new backend.

All mutable state is tab memory; reload resets it. Voice/photo are optional existing provider interactions, clearly disclosed before opening and consented again inside their secure surfaces. The demonstration itself requires no account or model call. No private data is persisted to a seed repository. Source notes are included only in the deliberately downloaded local receipt.

## Behaviour

1. Edit, add or remove ingredient rows; explicitly confirm usable identities, quantities and units. A synthetic photo-observation sample needs no model call or account.
2. Choose one of three supported sample recipes, occasion, 1–8 servings and an editable NZD budget. This is deterministic recipe scaling, not adaptive AI meal creation. Fictional pickup fee is NZ$0; real fees are unknown.
3. Shared calculation produces fictional basket and leftovers, with review required.
4. Optional leftovers check or skip while the human reviews. No artificial wait, timer, numeric points or real reward promise.
5. Approve simulated handoff: local receipt only. Download is explicit. Changed pantry, provenance, notes, recipe, budget, occasion or servings invalidates the prior reviewed revision. Retailer feed, account permissions, cart and handoff agreement remain absent.

Programme education follows the official NZ terms and ProductBoost terms, including EasyBoost qualification and excluded offer types. Programme facts are distinct from synthetic values; no projected points, account balance or eligibility claims. Official sources: https://www.everydayrewards.co.nz/terms-and-conditions and https://www.everydayrewards.co.nz/terms-and-conditions/product-boost . Research supplied by the parent audit; no merchant catalogue scraping or real cart links.

## Verification

`model.test.ts` and `ingredients.test.ts`: shared math, fixture provenance, malformed/ambiguous extraction, unknown quantities, explicit voice lines, duplicate/unit checks, coverage, confirmed recipe inputs, empty-pantry budget gates and stale revision rejection.

`scripts/review-loyalty-do.cjs`: production route at 1440/820/375, complete skip → approval → download, changed-plan review invalidation, no page errors/writes, no overflow, noindex, paused/reduced motion. Captures hero/basket/receipt on all viewports. The correction suite additionally mocks the existing vision endpoint with synthetic evidence, verifies explicit photo-to-pantry mapping and provenance receipt, written/voice-format mapping, add/remove, budget boundary/re-review and the static sign-in return locator. No real provider or retailer calls.

`.github/workflows/loyalty-do-review.yml`: hosted typecheck, focused lint/tests, macrons, build and production browser verification. Screenshots upload as `loyalty-do-review`. No deploy step. Local dependency reads stalled and available disk fell below 600 MB, so no fresh full dependency install/build was attempted locally.

Initial implementation at `6f83287` passed hosted typecheck, focused lint, 14 tests, macrons, production build and all browser checks in run `38363704332`. Desktop/tablet/phone screenshots were inspected. PR 1540 was merged by another actor at 07:43 UTC before the author finished visual review; the author did not merge or deploy it. The screenshot-driven image-resolution/mobile composition and receipt-provenance refinement is a separate draft follow-up based on current main. Its final confirmation run and screenshots are linked in that PR. Provider calls, actual voice quality, physical iPhone, merchant execution and real programme rewards are not verified by synthetic tests.

## Consolidated functional correction

The first drafts were externally merged before the later capability review. This batch closes the photo/voice-to-pantry gap, exposes supported recipes and budget assumptions, improves phone labels, and provides a sign-in link in a separate tab with only a static loyalty return path. The original tab retains its in-memory draft; the UI warns that closing or reloading loses it and offers an availability refresh after sign-in. No private state goes in a URL, localStorage or shared unowned storage. Full actual authentication/provider execution remains unverified.

The correction is held on the existing review branch; no additional PR, merge or deployment is requested. Hosted verification and updated screenshots must be inspected before release.

Rollback: remove this route, its artwork and source files, test/review workflow and route entry in DoUtilityDock. No schema or canonical demo change.
