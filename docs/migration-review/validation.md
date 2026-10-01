# Validation checkpoint — Oct1 2026

- Frozen isolated dependency install and canvas package build: passed. No parent dependency tree or original checkout changed.
- Full TypeScript check: passed after final visual/mobile changes (`pnpm typecheck`).
- Relevant Vitest: **16 passed** (9 renderer/review/access tests plus7 owner API/policy tests). Covers original schema/revision/memory behaviour, no native transport fallback, original renderer/private sentinel exclusion, recipient identity/scope/status/expiry and local-review gates, unavailable recipient endpoint, custom-image rejection and illustration/media provenance.
- Scoped ESLint across all copied components, new library, review UI and recipient API: **zero errors/warnings**. No global rules disabled. One narrow documented native-image exception supports private/blob/canvas previews without an optimisation proxy.
- Brand/front-door/macron guards passed on final rerun. Diff whitespace check passed.
- Development route HTTP200; actual ConceptStudio dependency closure. Recipient API404/private,no-store.
- All original58 source hashes and five dirty-file hashes rechecked unchanged at this checkpoint.
- Legacy Summerset/Ryman-family room APIs returned503 on synthetic no-key requests. No paid/provider calls or live vision output claimed.

## Browser proof

Separate headless `hub-migration` session against loopback only. Signed-in Chrome/DO/Vercel tabs untouched. Synthetic Example Studio/Fictional community housing team brief only.

- Editable company/client/brief values shown in original opportunity UI.
- Original idea board: native ArrowRight moved an idea from409px to419px.
- Original renderer: four chapters, selectable priorities, consent-gated Prepare and editable prepared draft. Native Enter produced the draft containing explicit no-send/order/booking/approval statement. Download not invoked.
- Mobile375px: document scrollWidth375; no broken owner-page images. Header actions wrap, Intelligence is visible, workflow rail scrolls internally. Prepared draft readable in inspected screenshot.
- Desktop1440px: neutral visual prompt, rounded split hero and working brief inspected. No unrelated boats or default landscape.
- Browser console after clear had no messages. This is a scoped development check, not production telemetry proof.
- Pointer clicks in the automation session did not always settle the requested state; keyboard navigation was confirmed. Full pointer/touch and reduced-motion acceptance remain open.
- Final evidence: `evidence/desktop-final-opportunity.png`, `evidence/mobile-final-prepared.png`. Earlier screenshots are intermediate evidence, including the old mobile overflow; they are not final acceptance images. Full-page capture of the mobile prepared state places the sticky main navigation at its current scroll position.

## Owner persistence and database proof — V1 historical, V2 current

The owner route/API are off by default. New empty drafts and owner-authored ideas are implemented; no deterministic fixture agent is used on this path. Actual disabled owner and recipient HTTP endpoints returned404 locally. Same-origin writes, verified-session allowlist, strict payload validation and conflict handling have7 unit/API tests. The existing session is mocked for API tests; no real owner account acceptance is claimed.

The V1 proposal's earlier isolated tests were insufficient; independent review rejected it. Its owner/recipient/Storage SQL is archived **DO NOT APPLY**. Those historical passes are not acceptance of the revised design.

V2 owner-only proposal now passes **75 checks** in an isolated Supabase Postgres17.6.1.139 image with network disabled and tmpfs data. Real image default ACLs grant broad named-role access; an additional adversarial PUBLIC-grant case was tested. The new tables/functions revoke those grants. Direct writes and enablement writes are denied; required-argument/full-payload checks, DB enablement, owner isolation, stale and concurrent CAS, concurrent draft/byte quotas, soft-delete visibility, retained quota, purge age/permissions and new-record auth-user cascade pass. The image has auth.uid but lacks Auth-installed auth.jwt, so only that accessor was supplied for synthetic GUC claims. This is not real JWT/cookie/PostgREST proof. Recipient/Storage objects are absent from V2 and remain inactive.

**25 Vitest tests pass** across review/owner API/session suites, including DB enablement read failure, same-origin checks, streamed body cap, null version/revision and safe DB-error mapping. Full TypeScript and scoped ESLint0/0 pass. All58 original and five dirty hashes match (`evidence/source-preservation-v2.json`). No production schema was changed.

## Production build diagnosis and current release gates

Approved main/font `dd241e532519f00094a221d094a584840544ca06` is merged. Earlier default-sandbox build at9bd stalled and was stopped exit130; cause was not isolated and is not labelled a font regression. A supported-context bounded serial comparison subsequently passed the **full standard pnpm build** for clean main in55.21s and migration `b7284653178596d3206d2f7fb5fb39b71d6e124f` in53.27s. Both use Node22.22.2/pnpm9.15.9, 6GB heap,360s timeout; no webpack build switch or skipped checks. Metadata: `evidence/build-clean-main.json` and `evidence/build-migration-fresh.json`. This comparison did not reproduce a migration-specific bundler failure.

The final V2/API/UI edits still require one coordinated full production build. No heavy build runs while the font owner holds the serial slot. Earlier passing build evidence is not mislabelled as validation of unbuilt edits. Final production chunk inspection remains queued with that build.

Owner-mode proof: local gated `/review/client-hub?layout=owner`, fictional Example Studio/community project only, explicitly labelled device preview. Desktop1440 and mobile375 each have zero promotional `.ep-hero`, one `.cs-inspiration` visual panel, H1Client brief and matching scrollWidth/viewportWidth. No broken images. Mobile My concepts remains visible after overriding an inherited hide rule. Screenshots `evidence/owner-v2-desktop.png` and `evidence/owner-v2-mobile.png` are local synthetic layout proof, **not real-account cloud persistence**. Separate headless browser/dev server stopped; signed-in Chrome untouched. Original interactive renderer/keyboard proof above remains valid; full touch/reduced-motion acceptance is open.

Independent V2 review and targeted production schema/enablement approval remain required. Then prove the actual approved owner session, persistence/conflicts/disablement/other-user denial. Original deployed Site/data reconciliation is still open for any future legacy import/cutover. Recipient/media/provider connections are separate inactive work. Original Site/source/data remain unchanged; no paid calls, secrets copied or original cutover.

## Final reconciled production checkpoint

Code revision `267970604a7b58a60aadda278bcb5a5c37ae2f92` merges main `41a3d075b4394c05f394a00c54ee68f8c24bbe03`, preserving the approved self-hosted font work. Full standard `NODE_OPTIONS=--max-old-space-size=6144 pnpm build` passed, exit 0 in 83.69 seconds (Node22.22.2, pnpm9.15.9), including TypeScript checks. Evidence: `evidence/build-migration-final.json`. Focused migration tests: 31/31 pass; scoped ESLint: zero warnings/errors. Original 58 source hashes and five dirty-file hashes rechecked unchanged.

Schema remains unapplied, with no owner enabled. Exact frozen SQL hash `ce71a6f5cda98eee3a62ea48792d9e3a4e641d114082defaa0128a60e7668320` needs reviewer acknowledgement of the three-path SVG contract delta from the previously reviewed hash. Latest diagrams have unit/renderer coverage but final browser image inspection remains pending; do not represent them as final pixel acceptance. Purge must not be scheduled.

## Final corrected implementation acceptance

Exact implementation revision `059547c3fc1d17df49636617e7dc2bb97ecb68a1` passed the full standard production build (Node22.22.2/pnpm9.15.9), exit0 in53.8s, including TypeScript. Evidence: `evidence/build-migration-corrected-final.json`. Earlier pending-build statements describe historical checkpoints. Latest31 tests and scoped lint pass. Native Chrome CDP pointer/touch selection/opening and reduced-motion CSS proof recorded in `evidence/native-interaction-proof.json`. Review stays draft; no production activation or Site cutover.
