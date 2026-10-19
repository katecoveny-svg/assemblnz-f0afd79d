# Living TURN, shop and preview reconciliation

Draft integration only. Nothing printed, physically tested, purchased or deployed by this work. Main merge remains a separate owner decision.

## Authority and preserved sources

ADR-008 in #1622 explicitly accepts TURN as the build candidate and retires ADR-007/AL-02. The current PR discussions contain no contrary owner decision. This establishes source authority for a draft reconciliation, not physical validation or release approval.

- #1622 `12c12a8bd0265679401c3d818fb668ca25352bfa`: foundation, CAD, typed products, Studio and canonical `/living`. The canonical page is byte-for-byte unchanged. Its long release-status label caused 415px document width at a 375px viewport; a scoped `.lv-hero .lv-status` wrapping rule fixes that inherited layout defect without changing content or structure.
- #1621 `62aa6a4fb9fb650ce73e6870cbd6b5a73aeae09a`: photographic shop, filters, styling kit persistence/import/export, navigation and unconditional checkout gate. Its old AL-02 bridge is replaced as described below. Its historical consolidation document is explicitly superseded.
- #1615 `9edf8c9df81c6f9aefc3bb29db5856908136017e`: isolated noindex concept preview, responsive controls, concept export restrictions and browser regression. Experimental AL-03/AL-05 engineering notes are not imported.
- #1614 `390f1b3c4cbd0f14f1fd4e3f27aec2fc8fd51db0`: shared current-homepage CI contracts, assistant route union/tests and independently verified command animation repair. These are shared repairs, not a replacement homepage. Parent coordinates overlap with that PR.

No source PR branch was modified or closed. This integration replaces their overlapping Living changes only if the owner accepts this draft after review; do not blindly merge all three source PRs afterward.

## No invented product equivalence

The older shop's grid/tile/stack cards remain styling concepts. Their old dimensions and prototype claims are removed. The bridge resolves related TURN families through `requireProduct` and `printFile`, and exports `related-family-only` explicitly:

- grid: al-board-4x4, al-shelf-2, al-cup; Studio starts a separate wall design.
- tile: al-tray-custom, al-tray-cutout; Studio starts a separate drawer design.
- stack: al-node-corner, al-node-tee, al-foot; Studio starts a separate desk design. The old riser image is not presented as this dowel-node assembly.

No old kit is equated to a TURN kit. No styling measurements, colours, text or geometry are automatically transferred to the measured schema `/2`. The shop exports remain schema 1 concept selections with null manufacturing revision and approval false. Available files are STL; obsolete STEP promises are removed. Other concepts have no engineering reference. Both soft-wave and wide-wave display choices are retained.

The preserved preview is labelled archived concept, not TURN, and remains noindex/nofollow (not access-controlled). An inherited Change view control with no effect was removed; actual orbit interaction remains.

## Reproducibility and checks

The clean-checkout dayrally v2 generator lacked creation of its ignored output directories. It now creates `parts/stl` and `store/model` before writing; geometry is unchanged. A full digital rebuild and all three fit scripts regenerated 104 print files, 23 served files and the test kit. Reports and geometry match the upstream source; only manifest build timestamps changed. These are digital checks, not load, thermal, fit or manufacturing approval.

Contract tests verify all 23 served file sizes and SHA-256 checksums, catalogue references, all 104 manifest parts, test-kit presence, import sanitisation and unconditional HTTP 409. Browser proof covers 375/1440 shop persistence/export, related references, local HTTP 409 and the TURN door kit's measurement/configuration flow; the isolated preview proof covers 320/375/1440 and safe concept export. Production build, scoped lint and final exact-head CI status are reported on the draft PR; pending checks are not green.

## Deferred decisions

Whether a styling concept should become a specific TURN product or kit requires separate design work and explicit mapping. This draft makes no such claim and does not block safe coexistence. Physical test-kit results, manufacturer acceptance, quotes, load ratings, fulfilment, payment and checkout activation remain outside scope.

## Final local verification

Code candidate `485920276` includes current main `99ef18e5d` (#1623). Production build/TypeScript, 67 focused tests, scoped lint, brand/front-door guards and macron check passed. Context health exited successfully with 29 existing review warnings. Strict reconciliation browser proof passed at 375/1440 with zero overflow/page errors; archived preview passed at 320/375/1440. Screenshots were inspected. Independent read-only review found no remaining blockers to a draft. Compact results are committed in [evidence](./evidence/turn-shop-reconciliation-20261019.json). This evidence-only follow-up changes no verified runtime code. GitHub CI remains a separate exact-head gate.
