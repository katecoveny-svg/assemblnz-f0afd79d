# Personal DO life-admin workflows

Initial implementation merged in PR #1419; the 30 September refinement adds explicit private cloud snapshots. This creates a reusable local workflow/evidence contract and extends existing DO preparation, vision and identity primitives. It does not create a second external-action runtime.

## What is implemented

- A single text intake with user-selected or suggested category; conservative exact source excerpts may prefill fields, but remain unreviewed
- Twelve NZ-first recipes: school/whānau, bills/renewals, vehicle WoF/rego/RUC, home/council, tradie quotes, meals/shopping, transport, consumer returns/complaints, government paperwork, care appointment admin, moving and travel
- Reviewable source, exact date/amount matches, missing fields, local checklists and downloadable evidence packs
- Next-step/overwhelmed view, Today / Needs you / Done, waiting reason and user-chosen follow-up dates
- Bundled **checklist review**, not execution approval; user-recorded external completion requires a completion note. Preparation evidence is labelled separately
- Skip, restore for review, reopen and one-step undo. These change local checklist records only, never an external booking or agreement
- Selected-plan text export and an explicit all-day ICS follow-up with no invitation, alarm or calendar mutation. All-day dates avoid guessed times; on-screen “check date reached” uses Pacific/Auckland (DST-aware)
- Account-scoped optional browser snapshots: UUID key plus validated owner envelope, no automatic restore, no guest persistence, no old device-global fallback, size checks before save, schema checks before restore
- Source-authorised provider drafting through the existing authenticated DO runtime, carrying saved style as a separate bounded hint. Provider failure leaves the local plan intact
- Existing DO vision for user-approved screenshots, with reviewed observations returned to intake. No ongoing screen access
- Public NZTA road-notice snapshot panel on travel/vehicle/transport plans. No private context is transmitted, no end-user login required; source timestamp, freshness, region filtering, supplied statuses, error/retry and official link remain visible

## Capability truth audit

| Capability | State | What remains outside this change |
| --- | --- | --- |
| Local text/checklist, review, wait/completion tracking, exports | Implemented | Explicit account snapshots are available; no automatic sync or background worker for these plans |
| All twelve household categories | Preparation-only | External actions remain user-performed and user-recorded |
| Tailored draft | Provider-dependent, requires DO sign-in and explicit transfer consent | Live provider quality must be exercised in configured deployment |
| Screenshot/photo intake | Existing provider-dependent vision, separately consented | Physical-phone and live provider proof still separate |
| NZTA road notices | Real public source adapter | Does not prove local-road coverage, route planning or personal vehicle records |
| Official terms/holidays, Billy, consumer guidance, council pages | Public reference links | No live school, power, merchant or council account integrations |
| AT/Metlink realtime transport | Not configured | App-level developer keys and adapters required; not a separate consumer login by design |
| Email ingestion / sending | Not connected in life-admin | No inbox permission, scanning, or outbound delivery |
| Calendar | File export only | No calendar account sync, invitations or automatic event creation |
| Household sharing/delegation | Not implemented | No per-person permissions, household membership or shared task ownership. Exports include only the selected plan and are not sent automatically |
| Push / automated follow-up | Not implemented for local plans | Date labels update in the open workspace. No notification is scheduled |
| Bills / bank transactions / payments | Preparation-only | No bank access, payment, cancellation or price/savings guarantee |
| Booking, government/health submissions, agreements | User-performed | No booking, identity verification, eligibility/clinical/legal decision or agreement acceptance |

## Integration

`<LifeAdmin storageScope={workspaceKey} intake={handoff} onIntakeAccepted={acceptHandoff} onTalk={openCall} />`

- `storageScope` must be the verified owner UUID from the authenticated API, or `guest`. Missing/unknown identity disables browser persistence
- The outer component keys its internal workspace by scope; an identity change clears in-memory notes, checkbox consents, plans, pending requests and undo state
- The parent must avoid mounting under an unknown identity and clear/bind incoming handoffs across account changes. A guest handoff is transferred only through the parent’s explicit review flow
- `onIntakeAccepted` fires only after successfully creating a checklist from the incoming source. Displaying it does not consume it
- Optional onTalk scrolls to the existing Call DO surface, rather than starting a microphone or live session

## Private cloud snapshots

`ChecklistCloud` and `/api/do/personal/checklists` save an explicitly approved collection of up to 30 validated plans. Open saved checklists first to get the current revision. No automatic upload, model invocation, chat storage, sharing or scheduled reminders. A session-scope header must match the authenticated owner; the header never chooses the database owner. Cross-account changes and stale revisions return 409. Restore keeps open edits and warns about differences. Removing a collection saves an empty revisioned tombstone so an older device cannot resurrect it. RLS allows owner reads only; all writes use a service-only atomic compare-and-save RPC. Full route, schema, owner-filter, local SQL and fictional browser tests are in the refinement audit.

## Privacy and evidence

No default browser save or provider request. Draft consent names the approved source/title/field set and configured provider classes. Editing fields clears generated output and pending review without erasing historical user-recorded completion. Common secret labels are blocked before provider transfer and browser save; this is not a complete PII/secret detector. User warnings and provider consent remain necessary.

Browser storage is not encrypted and must not be marketed as a security boundary against someone with access to the browser profile. Scoped keys prevent accidental account mixing. Logout/account-switch remount is owned by the PersonalDo integration. Old device-global snapshots are never imported automatically.

Source links and completion links remove query strings, fragments and embedded credentials. React renders source/provider text as plain text. Official references are curated; no user URL is fetched by this workflow engine. Draft receipts are preparation evidence, not proof of delivery. “Done · recorded by you” makes the external-result provenance explicit.

## Checks

- `node_modules/.bin/vitest run apps/do/personal/life-admin/engine.test.ts app/api/do/personal/life-admin/preparation/route.test.ts` — 37 tests passed
- Focused ESLint over the engine, UI, traffic panel and preparation route
- Shared aggregate typecheck/build and mobile/browser evidence are owned by the integration task; do not infer success from these focused checks
- Regression coverage includes review/completion boundaries, actual RUC distance semantics, source injection, common secret labels, owner isolation, malformed/oversized snapshots, typing spaces/newlines, waiting dates, Auckland DST, all-day ICS, Unicode byte-folding and CR/LF injection

See `docs/integrations/nz-public-life-admin.md` for public-source evidence and the current NZTA adapter contract. See the shared integration record for runtime/visual proof and publication status.
