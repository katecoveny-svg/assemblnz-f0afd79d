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
