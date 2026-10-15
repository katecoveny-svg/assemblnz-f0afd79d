# Travel release candidate — 15 October 2026

Based on current main b9bbdc7b849caca14ad2d05f5eea2e724d9f0b5f, which includes Parliament PR #1604. Supersedes the older ad858224 UI-only candidate; do not merge the full bcfb801a Travel branch. This candidate contains no Supabase function, migration, workflow or flag changes.

## What may ship

The holiday brief, destination illustrations, date alternatives, user-recorded flight/stay comparison, budget arithmetic, reviewed text export, Booking.com public browser handoff and existing AT connection link. Duffel remains the intended flight API; Google Flights is explicitly the browsing fallback. Manual flight-code tools are collapsed under advanced review. Data stays in the open tab unless downloaded. No live inventory is claimed.

AT reuses bus-positions and its Edge-owned key rather than requiring a duplicate Next key. The earlier HTTP-200 vehicle test established this existing endpoint worked then, not guaranteed current freshness or arrival predictions. No transport request was made during this release review.

## Validation

124 tests passed, one opt-in live Parliament test skipped, across Travel planner/selection/Booking preparation/AT reuse/API denial and shared Parliament text/voice contracts. Scoped ESLint and git diff checks passed. Local Next route compiled and returned 200.

Chrome CUA review with fictional Auckland–Wellington 2030 dates: 320px entry and review measured scrollWidth=innerWidth=320; native date values set through supported AX controls; comparison, Booking.com disclosure and exact public URL checked without opening the provider; one fictional $700 option recorded and selected; download disabled until reviewed; back/edit preserved origin and invalidated review. Desktop review measured scrollWidth=innerWidth=1440 and was visually inspected. Download event watcher timed out, but UI success plus the actual Downloads/do-travel-plan.txt confirmed the fixture, user-recorded/not-provider-verified label and no-booking disclaimer. No physical mobile keyboard or paid provider/voice session was tested. Previous 37/19 browser suites are historical, not rerun evidence for this head.

Full TypeScript on reused dependencies is blocked by current-main/environment issues: generated .next validator references absent creative-playground page; mediabunny missing in reused dependency installation (lib/generative-art/loop-export.ts). No Travel diagnostic appeared. Production build was attempted: brand and public-front-door guards passed, then Turbopack rejected the external node_modules symlink. It needs a normal coordinator/CI install. Authenticated Parliament voice visual/tool execution remains unproven; source and mocked consent/cancellation tests pass. This review does not establish spoken citation reliability.

## Activation boundaries

The new search POST always denies without forwarding to Edge. GET performs only an authenticated contract-readiness check and cannot grant spend. The legacy live-travel Edge implementation remains outside this PR: do not deploy/re-enable it until strict validation, nonanonymous identity, owner-specific atomic allowance/spend entitlement, safe error handling and permitted provider tests pass. Merely having a token is not permission or proof of live inventory.

Duffel NZ onboarding support reply remains pending per parent at 05:52 UTC. Email-change initiator is confirmed; completion is not. No token followed or account change made. Booking.com Demand partner approval/contract/credentials, Google Places/Routes entitlement and billing, and Viator partner access remain separate dependencies. No agreements, secrets, OAuth, paid searches, bookings or payments authorised/executed by this candidate. Sole release coordinator owns merge/deployment.
