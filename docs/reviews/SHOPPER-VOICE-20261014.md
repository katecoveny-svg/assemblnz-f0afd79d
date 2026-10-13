# Shopper DO visual planning and reviewed voice

Draft implementation on fresh main `57b174df287d5d8adbbc56b38fce9b05cbd6fd69`. No merge, production deployment, flags, SQL, permissions, pairing, real microphone or paid voice calls.

## Working slice

- Shared DO capability cards open actual Shop, Messages and Travel tools in a separate tab, preserving the originating draft. Existing draft starters remain in a disclosure.
- Shopper DO reviews editable people, nights (maximum seven) and optional NZD budget before building catalogue meals. Illustrated meals have real swap/serving controls. Pantry quantities remain unknown and unconfirmed until reviewed; aisle checkboxes track collection without implying a purchase.
- Personal/Household voice review can open the actual planner independently of background-worker configuration and responsibility quota. Hosted widget uses the same planner; its embedded Talk flow retains the existing separate full-window permission boundary. Phone/Mac here mean the same hosted surface, not native installation proof.
- Handoff is mounted React state only. No private brief in URLs or persistent browser storage. It carries no provider, saving, browser or purchase consent. A second handoff cannot overwrite open work. Back/return keeps the planner mounted, explicit discard confirms, re-plan confirms replacement, internal page links and unload warn. Browser-history navigation can still lose session-only work; copy or explicitly keep the list before leaving. Existing verified account boundary clears/unmounts work.
- Repeated meals with differing servings add their exact quantities. Night counts no longer become people counts. Vegan input stops: this catalogue cannot verify packaged ingredients for vegan use. Estimates compare costs with a budget; they do not optimise it.
- Existing saved Gemini voice selection remains the configured voice; a mismatched issued voice is rejected. Prompt v2 asks for consistent natural NZ English through lists/tool results and prohibits quoted-accent imitation. Page-local audio exclusion prevents DO read-aloud overlapping a call. No automatic browser TTS fallback.
- Diagnostics show only allowlisted model/voice, build SHA, prompt version and lifecycle. No diagnostics endpoint, logging, transcripts, audio or tokens.

## Boundaries

Retailer links are searches only. Browser capability is read from the companion owner's `/api/do/browser-actions` projection; missing/failed/unavailable capability never means connected. No cart action is exposed. Demo basket remains explicitly fictional. Photo-to-pantry extraction is not included. No nutrition or real product-label guarantee. Listening review is required before claiming voice/accent quality.

Planning is session-only. Existing “Keep as a DO task” explicitly writes a text list through the current continuity API only when the authenticated account has enabled it; it does not save an editable meal/pantry board or a receipt object. No new persistence table or migration is introduced. Save-to-DO board is separately owned.

## Evidence

Local: 50 targeted tests passed, 32 planner browser assertions and 16 voice/handoff browser assertions passed. Scoped ESLint and brand/macron guards passed. Initial typecheck passed; a duplicate final full typecheck was stopped during shared Mac contention, so final full typecheck/build remain hosted CI gates. One final browser rerun timed out during contention; the bounded retry completed all checks.

[Shared tool cards](shopper-voice-evidence/shared-tool-cards.png) · [Desktop planner](shopper-voice-evidence/voice-plan-1440.png) · [375 px planner](shopper-voice-evidence/voice-plan-375.png) · [Voice results](shopper-voice-evidence/voice-results.json) · [Planner results](shopper-voice-evidence/planner-results.json)

- Focused Vitest shopping, handoff, voice configuration, audio exclusion, existing voice-resource and Personal DO tests.
- `scripts/review-do-shop-journey.cjs`: synthetic continuity/account response; real local UI, desktop + 375 px; retailer URLs inspected, never followed.
- `scripts/review-shopper-voice.cjs`: fake media/audio/WebSocket; real reviewed notes → planner, worker off, repeat/cancel/back/owner checks, hosted widget and no browser TTS fallback.
- Screenshots and reports in `output/playwright/do-shop-journey` and `output/playwright/shopper-voice` (CI artifact also carries exact commit SHA).
- Full production build assigned to hosted `Shopper voice review` CI to avoid a parallel heavy Mac build.

## Release checklist — merge alone is not release

- [ ] Review exact PR SHA, CI typecheck/lint/tests/build, desktop/375 px screenshots and accessibility interactions.
- [ ] Reconcile companion capability endpoint and shared-surface changes against the browser owner's branch. Keep unavailable until authenticated durable pairing, tab scope, permits and retailer validation are independently verified.
- [ ] Verify Vercel preview for this exact SHA, correct project/environment, route gating and public asset availability. No production promote until authorised.
- [ ] DB: no migration here. Verify existing continuity schema/RLS, owner scope, expiry/deletion and opt-in status in the intended environment before claiming cross-device persistence.
- [ ] Persistence: with synthetic accounts first, save a list, reload, reopen on another device, switch owner, revoke/delete, simulate storage failure. Confirm “kept” requires durable acknowledgement. Editable planner state is intentionally session-only.
- [ ] Voice: confirm configured Gemini model, existing saved-voice revision/token constraints and fresh call consent in preview. Authorise a separate real microphone/provider listening session before testing NZ accent across lists, numbers, interruptions and tool replies.
- [ ] Browser/native: separately verify installed extension/Mac versions. A hosted screenshot does not update the installed companion.
- [ ] Photo extraction and real cart/checkout remain excluded; do not enable by copy, flags or installation claims.
- [ ] Rollback: revert this commit/PR, retaining existing saved profiles and continuity records. No schema rollback required.

## Image provenance

`public/do/shop/meal-ideas-v1.png` is a built-in Imagegen-generated illustrative contact sheet, not a photo of cooked/tested recipes or retailer products. Prompt: eight equal overhead daylight photographs in a four-column/two-row grid, ordered mince/veg pasta, chicken stir-fry/rice, hoki/kūmara/peas, chickpea curry/rice, sausages/mash/peas, pumpkin soup/bread, beef nachos, tomato/aubergine pasta; pale ceramic/tabletop, no text/people/branding. Recipe facts and quantities remain separate HTML. Original generated file retained in the task workspace.

### Independent review follow-up

Numeric count fields now retain transient empty/fractional/out-of-range input without passing it to quantity calculations; planning/review stays disabled until corrected. Unsupported allergy/diet clauses (including sesame appended to a recognised dinner request) block suggestions for manual review.

A document capture guard covers hosted widget header/footer links as well as planner links. Cancellation preserves edits. Native browser history is still session-only: visible copy explicitly warns that Back/refresh can discard meals and pantry edits; copy-list remains the manual recovery route. No private persistence was introduced.

The verified widget boundary passes its owner to the planner, suspends interaction while revalidating and clears on identity invalidation. A continuity response for another account cannot enable list saving. Save acknowledgement uncertainty now directs users to check Your tasks; only list text is saved, never editable meals/pantry or the prepared receipt.

Regression evidence: bounded integer unit cases (fractional, empty, nonfinite, negative, zero and over-limit), unsupported dietary clause, synthetic voice/planner cancellation and outer widget Privacy navigation, mismatched continuity owner and delayed/reordered owner verification. No paid calls, real audio or cart actions.

Further review regressions: removing an invalid last night clears its validation state; `no milk` and `wheat-free` in count-bearing sentences apply milk/gluten catalogue exclusions; unknown exclusion clauses retain the full brief and block suggestions. These filters do not establish allergy safety. Ordinary iframe focus no longer hides the widget or interrupts typing; explicit identity invalidation remains immediate. Synthetic voice report now includes 27 checks; companion entry and shared capability iframe flows are verified locally.
