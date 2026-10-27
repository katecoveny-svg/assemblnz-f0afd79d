# Homepage public guide recovery — 27 October 2026

Base: 9b6314e (includes Lab). Homepage-only changes recovered from 4b01758; voice changes excluded and preserved separately at /tmp/held-voice-4b01758.patch. Original checkout remains untouched at 4b01758.

## Changes

Preserve hero/main company sections and Lab top navigation. Remove only Pursuit/Studio/DO top links. Replace simulated assistant with public company guide; update footer disclosure. Homepage never renders PersonalDo or checks private account identity. Existing public endpoint and provider configuration retained.

Fail closed before generation if admission storage creation, either count or admission insertion fails. Preserve 25/session and 60/IP daily limits. Supply a 600-output-token cap and combined request-cancellation/20-second generation-deadline signal. Late cancelled responses cannot become successful answers. No migration, credentials, provider settings, private voice code, merge or deployment.

## Evidence

Focused API/navigation tests: 14 passed. Changed-file lint: passed. Logs are in evidence/home-guide/ in this isolated checkout.

Initial typecheck/build hit missing isolated canvas dependencies. Dependency links added without changing original sources. Default Turbopack rejected the external node_modules symlink; webpack build was started instead. Final typecheck and webpack build results must be checked before release.

Browser opened in dedicated home-guide-recovery session but initial localhost navigation exceeded 60 seconds during compilation. Preview log records ECONNRESET retry. No successful browser interaction or real provider reply is yet established. The previous guide-mobile-error.jpg provenance remains unknown: it proves error-state rendering, not a provider failure or intentional fixture.

## Acceptance limits

Count then insert is not atomic: concurrent admitted requests can exceed nominal quotas. No claim of a hard monetary cap. Achieving atomic admission requires a separately reviewed database primitive/migration. Provider cancellation is best effort; work billed before cancellation is not refunded. Existing specialist selection on the public endpoint remains unchanged; homepage selects only assembl with no tools. No audio tests performed; the two-test allowance remains unreconciled.

Publication held for parent review and release approval.

## Browser checkpoint

Dedicated local browser rendered homepage and confirmed Lab-only top navigation, preserved main sections, consent unchecked and submit disabled initially. Intercepted success response rendered at desktop and 375x812 mobile; intercepted 503 rendered honest error and retained question. Screenshots: output/playwright/guide-desktop-fixture-success.png, guide-mobile-fixture-success.png, guide-mobile-fixture-error.png. An initial browser check used a non-specific alert selector matching Next's announcer; the scoped guide alert check then passed.

One actual local endpoint question (What is assembl?) returned HTTP 503 with `The guide is unavailable. Please email assembl@assembl.co.nz.` before provider generation. See evidence/home-guide/real-endpoint.log and output/playwright/guide-mobile-real-endpoint.png. No new credentials/setup attempted. Successful real provider answer remains blocked on existing admission-storage readiness.

Webpack build records `ENOTFOUND fonts.googleapis.com`; completion is unconfirmed. Typecheck completion remains unconfirmed at this checkpoint. These must not be described as passing.

## Whole-page correction after live inspection

Live www.assembl.co.nz inspected in a fresh normal Chrome tab at production SHA 9b6314e on 27 October: desktop hero, scrolling company sections, simulated card, contact/footer and open helper; mobile hero/card/footer/helper. Existing design preserved. All homepage links into unfinished DO/Pursuit/Studio now replaced with company enquiries, on-page guide or Lab, including helper brand link. Private routes are untouched.

Prepared company guidance is immediately available and explicitly labelled not a live AI answer. Optional live answers retain consent and admission/token/deadline controls; unavailable service leaves useful prepared facts and contact/Lab destinations. No voice offered or tested.

Updated obsolete simulated-voice/product-link assertions in all four homepage browser contracts, preserving motion/media-failure/overflow/touch-target checks. Added prepared-guidance render test. 36 focused tests, changed-file lint and typecheck passed locally. Final exact-head Vercel build, CI and normal-authenticated preview QA remain required before parent approval/publication.
