# DO onboarding runtime recovery — draft, 28 October 2026

Base: `00baa867ed9b71f850c260000a3583a7813b4ddf`. No provider, account permissions, homepage or retailer execution changes.

## Reproduced cause

`DoFirstResult` and `LifeAdmin` were siblings with the same owner key. A real React DOM test, using native input events and the actual parent component, reproduced the reported `F` instead of `Fictional cloud picnic` before the fix. Distinct namespaced keys made the same test pass. Prior hook-mocked tests could not exercise reconciliation and were insufficient evidence.

The recovery adds pinned jsdom test support. Hooks and React DOM are real; account/API responses and unrelated child surfaces are fictional. These tests are not browser or audio proof.

## Changes

- Distinct owner-scoped sibling keys prevent stale/orphan onboarding instances during parent updates.
- The guide opens by choice below the working area, with a shortcut inside More. It adds no height before the default writing entry. Reopen retains local work.
- Accepted brief handoff asks the workspace to reveal Write and focus its textarea after commit. Existing work rejects the handoff without mutation. No provider request or consent is triggered.
- A failed account refresh quarantines local guide state without rendering its text. Same-owner SIGNED_IN/USER_UPDATED revalidation retains that quarantine until the server verifies the owner. A different verified owner remounts a fresh guide; logout or a different hinted owner clears retained state immediately. Nothing is persisted.
- The call browser test expects the revised error text and additionally asserts immediate microphone pause. Its final cleanup and renewed-consent assertions remain intact.

## Acceptance

Real DOM regressions cover continuous typing, optional notes, repeated Back/close/reopen, one guide instance, network/JSON failure recovery, signed-out/signed-in scopes, account changes/logout with no old input values left in DOM, and accepted/rejected handoff from a hidden Write pane.

Four browser checks failed after the previous release: call-error text, default phone-screen input, Add at 320px and reduced motion. They are separate from the eight reproduced baseline unit-suite failures. Preserve and rerun all four checks against this exact draft; do not declare resolution based on unit tests alone. The key repair is expected to stabilise the existing Add/motion components, but that needs browser evidence.

CI on `6846df` confirmed call-error pause/cleanup, Add at 320px and reduced motion passed; the phone-screen input remained below the fold. The subsequent layout change removes the guide from above the writing area. Its bounding box and exact-head CI still require verification. Independent desktop IAB passed typing, notes, Back, close/reopen and handoff. A phone IAB page crashed without diagnostic evidence identifying an app cause; a subsequent connection refusal reached no app UI. Neither counts as phone acceptance.

Parent-coordinated QA must verify the protected preview with supported IAB. No voice session is permitted until parent assigns it after UI acceptance. No production merge/promotion is authorised. See the PR for exact-head validation results and preview status.
