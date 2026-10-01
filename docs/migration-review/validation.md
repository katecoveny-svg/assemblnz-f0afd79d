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

## Owner persistence and database proof

The owner route/API are off by default. New empty drafts and owner-authored ideas are implemented; no deterministic fixture agent is used on this path. Actual disabled owner and recipient HTTP endpoints returned404 locally. Same-origin writes, verified-session allowlist, strict payload validation and conflict handling have7 unit/API tests. The existing session is mocked for API tests; no real owner account acceptance is claimed.

Final unapplied SQL/storage proposals passed in a no-network temporary Postgres17 container with synthetic auth identities and mock storage.objects. Tests cover create/update, optimistic conflict, owner-only draft visibility, separate recipient projection, private sentinel exclusion, selected-object membership, wrong user, immutable grant access, revocation, expiry and anonymous denial. Composite foreign keys bind snapshot/media ownership. This proves local database rules, not actual Supabase Storage delivery or cookie/session behaviour. Container stopped after tests; no production changes.

## Production build and release blockers

Approved main/font commit `dd241e532519f00094a221d094a584840544ca06` reconciled at merge `9bd0d1f139e2721196ca53573bd5bcea55c453d5`. The single authorised `pnpm build` passed preliminary brand/front-door/canvas steps, then stalled at Turbopack compilation for over8 minutes with no new error. Process was sleeping at0% CPU, no visible child/TCP connection; one-second sample showed waiting threads. Stopped that attempt (exit130), releasing slot. Cause unresolved; do not label it a font regression or a production build pass. Log `/tmp/hub-migration-build-approved-font.log`; sample `/tmp/hub-migration-build-sample.log`.

Default-sandbox dev listen separately failed EPERM; the same isolated loopback dev server worked with approved escalation. This identifies an environment constraint, but does not establish the stalled build’s cause. A coordinated build in the supported execution context remains required; no uncoordinated second build started.

Post-merge full TypeScript,16 tests and scoped lint pass. Final desktop1440/mobile375 screenshots show fictional opportunity data and rounded neutral visual prompts. Caption controls do not overlap; mobile scrollWidth375 and no broken images. Current Library versions1 retain the original IDs. Mobile filename `mobile-final-prepared.png` is retained for identity; current version shows the opportunity view. Earlier git version retains prepared-draft proof.

Confidential-source audit and emitted development review-chunk check exclude Adrian/prospect pitch text. Production chunk review remains blocked by the incomplete build. No reconciled deployed Site export, production-record transfer, applied owner schema, activated real-account persistence, live paid image output or recipient grant/media delivery proof. Original Site remains unchanged. No production build active at completion.
