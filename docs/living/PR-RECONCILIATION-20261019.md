# Living reconciliation — read-only findings

Inspected heads:
- #1614: 439f0eda1c3437d93e8362bd4e98badcada8e66f
- #1615: 9edf8c9df81c6f9aefc3bb29db5856908136017e
- #1621: 62aa6a4fb9fb650ce73e6870cbd6b5a73aeae09a (draft)
- #1622: 12c12a8bd0265679401c3d818fb668ca25352bfa

## Intent and authority

#1621 explicitly says it supersedes the overlapping shop integration in #1615, selectively importing the photographic storefront while correcting the 160/120 mm concepts to the main AL-02 192/96 mm system. It intentionally leaves the old configurator and experimental AL-03/AL-05 notes on their source branch. Its browser/runtime verification is still disclosed as incomplete.

#1622 and ADR-008 explicitly retire AL-02 in favour of Kate's supplied TURN lineage (42 mm grid, 8 mm board, quarter-turn key). They replace the catalogue, CAD source/assets, Studio, saved-configuration schema and /living storefront. This is a product migration, not an alternate implementation of #1621's AL-02 bridge. The PR's accepted-decision claim should be reviewed by its owner; this inspection grants no new product or merge approval.

## Exact textual conflicts

#1615 versus #1621:
- app/living/LivingModel.tsx
- app/living/shop/EditorialStore.tsx
- app/living/shop/catalogue.ts
- app/living/shop/editorial-data.ts
- apps/do/shared/public-assistant-routes.ts

#1621 versus #1622:
- app/living/page.tsx
- docs/living/ASSEMBL-LIVING.md

#1615 versus #1622: no textual conflicts. That does not establish product consistency: #1615 still adds the older shop concepts and preview library.

## Semantic blockers if #1621 and #1622 are combined unchanged

- #1621 imports PARTS from lib/living/catalogue; #1622 removes that export and supplies PRODUCTS, productByHandle/requireProduct and printFile instead. This is a compile-time incompatibility, not merely stale copy.
- #1621's engineeringFor maps grid-panel-192, grid-ledge-96, grid-cup-48, tile-tray-96x96, tile-tray-96x48, tile-clip and stack-riser-192. TURN has different product handles and print-file contracts.
- Shop Studio links name setup-wall and vanity-drawer; TURN's kit IDs include teen-room-starter, vanity-lab, desk-reset and others. Do not guess equivalence between physical assemblies.
- #1621's tests deliberately require nine AL-02 parts and 18 STL/STEP checksums under public/living/cad/AL-02. #1622 removes that pack. Port integrity checks to the TURN manifest and actual served files; do not delete integrity coverage to get green CI.
- #1621's dimensions, editorial pegboard-kit note and export engineering references must be reconciled to verified TURN products. Existing shop styling selections remain distinct from measured Studio configuration schema /2.

## Recommended order, subject to owner review

1. Review/merge independent #1614 only after its exact-head checks pass. Keep #1623 independent and preserve current main when integrating.
2. If ADR-008 is confirmed as the intended canonical lineage, review #1622 as the foundation first, preserving its authored TURN/CAD/Studio work.
3. Update the existing #1621 successor against that foundation. Retain its photographic shop, navigation, honest concept labels, sanitisation and HTTP 409 gate, but replace the obsolete AL-02 bridge/tests with explicit TURN mappings approved from its catalogue. Review exact code, build and browser proof before merge.
4. Carry #1615's useful repair-only work selectively; do not merge its whole older catalogue after the successor. Preserve the approved separate preview route with its noindex metadata and responsive fix in a clearly isolated patch. No PR should be closed automatically.

## Repairs that can carry without deciding the product model

- Shared coastal homepage browser contract fixes and current-source workflow triggers.
- The union of /preview/the-work and /living/shop assistant exclusions, including lookalike-path tests. #1621's current line would drop /preview/the-work if selected wholesale.
- Configurator shrink-to-fit CSS, internal Link usage, session-photo Image handling, exact concept export restrictions, and 320/375/1440 browser regression proof.
- Shop Link/Image lint fixes. Its cancellable storage scheduling already matches #1621's mechanics; preserve the successor's additional UI/data rather than copying an entire older file.
- Forged manufacturing-approval rejection and unconditional checkout-409 tests.
- #1621 changes the concept model finish spelling from wide wave to soft wave. If retaining the old preview, preserve its wide-wave choice alongside the shop's soft-wave choice instead of dropping either silently.

No branch edits, merges, PR closures, workflow reruns or deployments were performed during this inspection. Merge-tree only computed candidate trees for conflict diagnosis.

## CI evidence at 2026-10-19 16:00 UTC

Both repaired exact heads remain unchanged and GitHub marks both MERGEABLE. Vercel is successful on both. This is not a complete green CI result.

- #1614 context health and Pursuit walkthrough concluded success. Immersive reports a failed verification step, although its overall run still says in_progress. Public pursuit and DO core also remain in_progress.
- #1614 Immersive artifact identifies a 1440px command-palette dismissal timeout on /contact: Search assembl remained open while the script waited for detachment. Mobile command interactions passed; pageErrors is empty. The 14 homepage viewport captures and contact/footer proof completed before this failure. The exact failing dismissal subcase is not established by the artifact report.
- Failure evidence: the immersive-browser-proposed artifact, public-command/results.json and failure-1440.png. Run: https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/39278282138 . GitHub still refuses --log-failed because the run is in progress.
- #1615 all five Actions workflows still report in_progress. Living preview lint, tests, build, responsive controls and safe export proof have successful steps; only cleanup remains reported unfinished. Immersive and Public Studio also show verification steps completed with cleanup pending. Pursuit has no unfinished steps but no overall conclusion. DO core has passed build/typecheck/unit/auth and earlier browser checks; final browser proof remains pending.

No code correction or rerun was performed after the hold instruction. The desktop dismissal failure needs diagnosis before #1614 is ready to merge; GitHub terminal conclusions remain outstanding for both heads.

## Subsequent observation during the independent #1614 repair

The #1614 Immersive run finalized as failure and exposed its full log. The failure was the Close-button click after Meta+K opening, caused by desktop entrance motion moving the target across a pointer press; see `docs/reviews/HOMEPAGE-CI-REPAIR-20261019.md` for reproduction and repair. This does not alter the Living product recommendation above.

#1615 DO core, Living configurator preview and Pursuit walkthrough have since formally concluded success. Immersive has also formally concluded success; Public Studio still reports in_progress. Pending is not green. Its head and product integration remain held; no edits were made to #1621 or #1622.
