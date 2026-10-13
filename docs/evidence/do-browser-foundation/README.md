# Controlled browser proof — 14 October 2026

Chrome controlled localhost fixture, no shopping account or retailer interaction.

- `cart-receipt.json` / `cart-receipt.png`: reviewed oats 0 → 2 and milk 0 → 1; both verified from actual DOM after fixed control clicks. Contains fictional scope/IDs only; `retailerExecuted: false`.
- A repeated execution returned `Review changed` and left quantities unchanged. Independent atomic replay/concurrency checks pass in unit tests.
- A new approved review followed by a manual oats change to 3 returned `Review changed`; final quantities stayed 3 oats / 1 milk. No executor write followed the stale review.
- `companion-desktop.png` and `companion-375.png`: candidate extension page assets served locally. At 375px, measured document scrollWidth = innerWidth = 375. These do not establish installation or extension API operation.
- Console contained injected third-party extension FrameManager/Apollo warnings and an asynchronous extension-listener response warning. No clean-console claim is made; those extensions were not modified.

Automated proof: 36 targeted Vitest cases, 25 Node portable/packaging checks; full typecheck, scoped ESLint, brand guard and macron check pass. Archive comparison verifies all 23 packaged extension source files, with cart fixture/executor excluded. Context health passes its canonical check with 29 pre-existing drift warnings outside this slice.

Full-app build and repository-wide lint are recorded separately in the draft PR; do not infer their success from the targeted results.
