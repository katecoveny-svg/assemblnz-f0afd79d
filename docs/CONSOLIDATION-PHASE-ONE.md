# Phase one: shared preparation contracts and canonical discovery

## Implementation manifest

Base: main `707f529ca` re-fetched 12 October; original Shop/Travel review `2d0e3f0b6` is preserved. This new review branch stacks on that reviewed foundation; it does not imply either branch is merged. Original patch and bundle remain untouched.

| Original | Canonical destination / adaptation | Access | Verified behavior | Rollback |
|---|---|---|---|---|
| `lib/journey/types.ts` EvidenceRecord / JourneyRun / ProposedActionStatus / StatusTreatment | `lib/do/preparation/contracts.ts` additive preparation envelope adapter | Internal module; fixtures only | Existing journey evidence and ID types; proposed/approved/rejected action mapping; prepared/reviewed/declined local states; version 1, revision and provenance on prepared-only receipt | Revert phase-one commit; original domain contracts remain |
| Shop receipt and UI-local review string | `/do/shop` uses shared run/review/decline/receipt functions | Public fictional session-only preparation | Unit-safe domain planner retained; approval binds current input/revision; cancellation terminal for that revision; duplicate preparation does not revive or overwrite it | Original branch `2d0e3f0b6` |
| Travel receipt and UI-local review string | `/do/travel` uses the same envelope, retaining manual flight/time validation | Public fictional session-only preparation | No provider request, booking or hotel reservation; budget and itinerary edits invalidate review | Original branch `2d0e3f0b6` |
| Four legacy Woolworths Pages concepts | `https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards` | Public independently hosted Site | Chrome loads the public concept; visible sample prices/rewards and disconnected retailer/accounts. Audit reported credential-blocked provider calls on 12 Oct. Page now claims connection configured; successful provider behavior not reverified here | Restore original catalogue primary rows; old URL references/assets/routes preserved |
| `lib/demos/catalogue.ts` Pages-only URL helper | Explicit canonical target on catalogue object; string-slug URL behavior unchanged | Internal catalogue data; no sharing change | One Woolworths primary card; historical URLs remain preserved reference destinations | Revert catalogue/page changes; no external redirect to undo |
| `/demos` stale August readiness copy and legacy chrome | Same `/demos` route/gate/noindex; dated discovery copy and canonical GlassIdentity/tokens | Existing passphrase gate unchanged | No new access grant, cookie change, forced redirect or public footer alteration | Revert page/CSS/gate presentation changes; gate action untouched |

## Scope and compatibility

This is phase-one shared contracts and canonical discovery, not all-portfolio consolidation. Other demo classifications/descriptions are historical and explicitly require reverification; the index does not establish readiness or authorise outreach.

The independently hosted canonical Site has its own source/runtime. This repository change only points discovery to it; it does not edit or deploy the Site. No rates, provider success, endorsement or production capability are inferred from its chrome.

Auth fix `e3f1fddd3` inspected in task-4 `assembl-auth`: changes shared login/session/account-link and owner-scoped local drafts. Those files do not overlap this slice. No cherry-pick, migrations, credentials, durable adapter, memory flag or competing auth stack. Shop/Travel remain expressly session-memory-only. Their fictional IDs are not real ownership; eventual persistence must use server-verified DO owner and the separately reviewed reliability work.

Preparation provenance reuses `EvidenceRecord` from `lib/journey/types.ts`, including runId, kind, sourceRef and createdAt. This adapter intentionally does not modify the legacy JourneyRun lifecycle, grocery heuristic planner or travel domain schema. `version` is the envelope version; `revision` is material input version. Receipts remain status prepared and externalAction none even after local review.

Cancellation clears approval and settles pending simulated reward as failed; it is not an external cancellation. Starting another revision does not earn a second simulated reward for the same task/offer. No artificial wait or reward prerequisite.

## Proof and integration boundary

Focused contract tests run against both Shop and Travel: stale approval on content/revision/owner edits; cancellation terminality; duplicate preparation identity; evidence changes require new revision; prepared-only receipts with source provenance. Catalogue tests cover canonical HTTPS validation, one primary card, historical URL retention and dated readiness labels.

Browser checks use the actual Chrome extension. Preview is on a separate local port/worktree. Gate is exercised by submitting the existing passphrase form, never by changing cookies/gate code. Verify index noindex, canonical link, retained references, footer behavior and mobile/desktop layout. No live AI prompt is sent merely to establish readiness; credential-blocked audit remains dated evidence.

No push, merge, deploy, credential, sharing or live change. Revert the phase-one commits to restore original local foundation. Do not merge the separately hosted Site state or auth branch implicitly.

### Completed verification

- 78 focused tests across nine Shop/Travel/journey/catalogue files pass. Schema-projected provenance exposed a property-order issue in duplicate preparation; canonical JSON fingerprints now ignore equivalent object-key ordering while material content/evidence changes still invalidate review.
- Final production build passes, including `/demos`, `/do/shop` and `/do/travel`. Focused eslint passes; typecheck passes; 36/36 journey eval scenarios pass, zero critical failures; macron and build brand/front-door guards pass.
- Actual Chrome: first unauthorised `/demos` visit shows only the passphrase gate and `noindex, nofollow`, with no canonical card exposed. Submission through the unchanged form opens the catalogue. One Woolworths primary card, canonical host, and four original reference anchors verified. Document widths match 375px and desktop; canonical glass and company tokens inspected.
- Shop: double-click preparation, reviewed → declined → repeated prepare remains declined; receipt disabled. New revision → review → double-click receipt yields one prepared receipt. Budget edit removes the old receipt.
- Travel: the same cancellation/retry behavior verified; new revision → prepared/reviewed receipt includes version/run ID/provenance. Budget edit removes receipt. Booking stays disabled. Screenshots inspected at mobile and desktop.
- Public footer source (`components/site/cinematic/CineFooter.tsx`) remains unchanged with `/demos` href. Existing global header/footer behavior remains unchanged. No route, asset, gate-action, auth, migration or memory-flag changes in this phase.
- React checklist applied: no new data-fetch waterfall, effect listener, storage stack or mutable module state; work stays in event handlers, transient duplicate guards use component refs, form labels and disabled review states remain accessible.

### Exact phase-one changed files

- `lib/do/preparation/contracts.ts`
- `lib/do/preparation/contracts.test.ts`
- `components/do/preparation/PreparationState.tsx`
- `app/do/shop/ShopPreparation.tsx`
- `app/do/travel/TravelPreparation.tsx`
- `lib/demos/catalogue.ts`
- `lib/demos/catalogue.test.ts`
- `app/demos/page.tsx`
- `app/demos/DemosGate.tsx`
- `app/demos/demos.css`
- `docs/factory/PRIMITIVES.md`
- `docs/CONSOLIDATION-PHASE-ONE.md`

Remaining integration conflicts: none with inspected auth commit file paths. Future ownership/persistence adapter remains unintegrated and requires its own review. The Site's configured label versus credential-blocked audit is deliberately preserved as a dated discrepancy, not resolved by assumption. Other portfolio readiness/access remains unverified.
