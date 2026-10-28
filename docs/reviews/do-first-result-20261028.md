# DO first result and reconnect — draft review, 28 October 2026

Base: `76dfab4272e56393962aaab05b891fc9c5284bf1`. Scope is `/do` and its compatible personal entry. Homepage, provider, activation flags, accounts and retailer permissions are unchanged.

## Journey

1. Prepare one brief, or skip into the existing workspace.
2. Type an outcome and optional notes. No app/window reads, provider request or account save.
3. Review and edit a local outline. It is explicitly not AI advice, not saved, and not running work. Copy it or offer a reviewed copy to the existing Ask DO editor. Existing work rejects the offer rather than being overwritten; provider availability and consent still apply there.

Optional voice opens existing call options only. It does not start a call, share the brief or grant microphone consent. Type instead remains available. A consistent NZ accent is explicitly unverified.

The staged flow follows the supplied Meta screenshots' single-capability, optional-permission and try/skip pattern. It does not claim Meta's native window attachment or Mac-wide shortcut capabilities.

## Reconnect

Reviewed only the voice portion of held commit `4b01758`; did not cherry-pick its stale homepage changes. Error-before-close now pauses capture/playback while allowing the existing approved lease resumption path. No new allowance is reserved. Protocol/policy rejection ends without retry or exposing raw provider reasons. An error without close ends within five seconds, bounded by the original expiry. Existing hide, cancellation, expiry and voice-identity guards remain.

## Evidence and limits

- DO suite: 1,338 passed, two skipped. Focused onboarding/reconnect tests cover local preparation, edits/back/skip, failed copy, rejected/accepted handoff, optional voice, error/close resume and error-without-close cleanup.
- Typecheck and changed-component lint passed. Journey evaluation: 36/36, zero critical failures. Macron lint passed.
- Full repository suite: 4,227 passed, eight failed, three skipped. Failures are unchanged public-contact assertions (three) and NZ evidence stdio transport tests (five); no changes to those surfaces are included.
- Production build and protected PR preview status are recorded in the PR; do not infer completion from this source note.
- No browser tool is exposed in the current executor. Actual desktop/mobile visual review, authenticated preview flow and microphone/audio quality are not verified. Hook/transport fixtures are not browser proof.
- The newly approved single fictional voice session (up to two minutes) is **unused**. No provider session, ambient capture or output recording occurred. It requires a supported browser and safe synthetic input before use.
- Draft only. No production merge or deployment authorized by this scope. Preserve authentication and preview protection.

## Remaining acceptance

Review at 375px and desktop: skip/reopen, edited draft survival, copy failure, occupied Ask DO, sign-in interruption, account change, keyboard focus, optional voice, call cancellation/hide and reconnect. Then use the one approved bounded synthetic-input session if current allowance is available; end capture and record cleanup. A real output sample and listening assessment are needed before any accent claim. If unavailable, stop and leave the session unused.
