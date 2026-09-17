# Site runtime repair: verification record

Status: local repair under verification. Not a claim that the entire DO platform is production complete.

## Authority and scope

The user requested current-canon messaging, improved fly-through/product experience, working links, portable functional DOs and a live release. The current repair reuses WorldScene/atelier, DoMark, hosted preparation, shared policy/evidence and Office persistence. Consequential account actions remain outside this release. No production database migration, OAuth grant, send, booking, purchase or provider activation has been performed.

Initial synthetic provider verification had a NZ$5 cap. The user subsequently explicitly approved a NZ$50 total cap for this build's paid provider tests and assets, excluding subscriptions/recurring service charges. Actual production checks so far used the existing anonymous allowance. It reached zero and the next request returned 402; no reset or bypass was used. Vision/image checks remain unverified without an authorised session. Sign-in was opened in the user's Chrome profile for user-controlled authentication.

## Baseline and current checks

- Baseline full Vitest: 1 failed, 1,018 passed, 2 skipped. Failure: canonical homepage copy contract.
- Focused copy test: red reproduced, green after restoring master/product/commercial hierarchy.
- New companion hydration regression: red reproduced server/client first-visit mismatch, green after deferring browser storage reading.
- Browser hero regression: eight initial failures across desktop, mobile and reduced-motion (contrast, offscreen input, obstructed submit). Now passes all three viewports/modes after layout and compact companion correction.
- Final local full Vitest: 1,189 passed, 0 failed, 2 skipped. Includes concurrent owner assignment, playbook isolation, stale-tab approval/execution/receipt, source-download parity and Task DO Maker hydration regressions.
- TypeScript: passed before final review.
- Brand/front-door guards: passed.
- Context health: canonical context OK; 31 existing drift review items in legacy/shared surfaces remain.
- Macron check: passed.
- Journey eval: 36/36 scenarios, zero critical failures.
- Final local production build passed. Independent re-review returned passed=true with empty security_concerns/logic_errors after 30 synthetic ownership races, 9 stale-review probes and extension-handler checks. Neither build nor review implies production deployment.

## Production preparation proof

Two synthetic requests to `/api/do/prepare` returned HTTP 200 and real model-prepared drafts:

1. `rewrite`: meeting date/time, bring draft agenda and supplier-not-selected preserved. Status draft, source/instruction/output fingerprints attached.
2. `meeting-notes`: stated owner/deadline preserved; unanswered mobile-preview question kept open; proposed specialist and follow-up remained drafts.

Both report no account access, message, purchase, booking or submission. The anonymous next request returned HTTP 402 `trial_exhausted`. These prove preparation and quota enforcement, not full recording, background monitoring or external delivery.

Local raw synthetic responses: `/tmp/assembl-site-qa/evidence/live-preparation.json` (not secrets or private user content).

## Visual and interaction evidence

Local Playwright scripts and evidence currently live under `/tmp/assembl-site-qa/`. The final release will retain only verified screenshots and reusable regression checks in the repository.

- Repaired desktop and 375px arrival screenshots: headline/type/CTA/input readable; mobile DO does not cover submit.
- Repaired `/do` and `/creative-studio` captures: no page errors, no horizontal overflow at tested desktop size.
- Production-mode browser check passed actual scene mount, Find/DO/Show chapters, pause, keyboard move, dialog open/close and homepage draft handoff without any POST execution. Fresh resilience checks passed context loss restoring the poster, complete static product loop on reduced/mobile/no-JS, and offscreen canvas unmount/remount.
- One dev-mode scene check encountered transient navigation/chunk behaviour while files/builds changed; it is not recorded as a passing journey. Dev server stopped before final production-mode check.

## Runtime repairs requiring final review

- Browser Runtime owner isolation: anonymous and other-owner denial for list/get/all mutations; remains non-durable preview, no external actions.
- Office: missing schema/config returns explicit unavailable, not hidden memory fallback.
- Household and browser-seat: memory/detached persistence labelled truthfully.
- Public Task DO Maker: narrow segment exemption, preserving private/operator gates.
- Chrome package: parity of executable files between source, API and static download.

## Original goal not yet complete

A release of these fixes does not make these verified:

- authenticated cross-surface login/session continuity;
- each user's Gmail/calendar/CRM/other OAuth grants and approved actions;
- durable background execution or automatic Builder code execution;
- general browser/desktop computer use;
- full-length meeting capture/transcription/delegation;
- signed/notarised public Mac installer and update channel;
- live image, vision or voice on an authenticated test account;
- entire legacy route/copy catalogue.

These need their own bounded implementation/access and runtime evidence, not new success labels.
