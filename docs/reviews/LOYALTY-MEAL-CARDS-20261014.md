# Reviewed pantry → visual meal choices

Base: `a92ffbbf6a17b2545ec3092117265f3bf24076ef`. Review-only follow-up; no independent merge or production publication.

Three original SVG sample-dish still lifes present the existing pasta, rice and eggs-on-toast recipes. Warm paper, green herbs, orange tomatoes, glazed plates and shadows extend the existing Everyday Rewards concept palette. The artwork is decorative and explicitly illustrative, with static geometry for reduced-motion users. Recipe names, pantry deductions, packs, prices and buttons are semantic HTML.

`mealChoiceCards` is a presentation projection of `planShop`, not a second shopping engine. It receives the same confirmed pantry, servings, mission, budget and dietary text as the basket. Every candidate shows confirmed quantities used, missing whole packs and the complete fictional cost. Unknown/unconfirmed inputs are not approved stock. Unsupported diets and budget blockers disable choosing; changing a chosen recipe clears basket review and any prior approval. No retailer stock, account, cart, points or provider authority is added.

## Evidence and release gates

- Unit fixtures verify every card: four-person sample baskets $10.50/$12.00/$20.50; extra-dinner baskets $32.00/$26.50/$34.00, pantry deducted once. Includes exact pack lists, confirmed quantities, unsupported/mixed diets, review and budget blocking.
- Existing mission browser proof now must choose each card and verify actual plan selection, calculated prices and approval invalidation at 1440px/375px. Dedicated card screenshots are included in `output/shop-missions` and the existing Loyalty CI artifact.
- Existing photo/voice-format ingredient confirmation and reduced-motion tests remain required. No real microphone or paid provider calls for this slice.
- Hosted typecheck/build, existing loyalty proof and mission proof must pass on the final exact head before coordinator approval.
- DB/persistence: no changes. Editable plan and demo receipt remain in this tab. No new save or cross-device claim.
- Vercel: ordinary protected previews allowed; production merge/publication remains coordinated. No hosting setting change.

## Next slice: optional activity during actual work

The current final-step leftovers acknowledgement is optional and explicitly says there is no processing delay. It is not a rewarded waiting implementation.

A future bounded slice can reuse `GroceryPhoto`'s actual asynchronous `busy`/abort/generation lifecycle. After fresh explicit photo-provider consent and while that real request is pending, show an optional storage/leftovers activity. Completion records only a clearly labelled simulated acknowledgement in the local concept; it never creates real points, balance, sponsor entitlement, basket changes or additional consent.

Requirements: no artificial delay, no minimum dwell time, no blocking the result for activity completion; skip/cancel immediately; stale completion cannot carry to a replacement request; the result becomes available as soon as the underlying work finishes. No activity starts a provider request. Motion pauses and reduced-motion behavior remain intact. A real reward would require a separate funded partner agreement, account authority, issuance contract and auditable receipt before any earned-points claim.
