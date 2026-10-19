# Living conflict repair — 19 October 2026

Kate approved retaining the current `/living` storefront and preserving the earlier configurator at a separate preview address.

Merge target: main `7ab6a4353c5b90bc885ebb7a7f221fe7958e15dd` into PR #1615 head `97455c150f07e1d594a869ffd8ccacd76faea975`.

## Resolution

- Keep main's `app/living/page.tsx` exactly, including the modular system and Space Studio entry from PR #1616.
- Preserve the prior PR configurator at `/living/configurator-preview`: its component is byte-identical after adjusting two relative imports. A server page supplies noindex/nofollow metadata. No public-navigation link is added.
- Keep the approved `/living/shop` photographic store and its route-specific chrome and assistant isolation unchanged.
- Retain current main's clay DO, homepage and release receipts. No merge to main or production deployment is authorised by this repair.

## Verification

- Canvas package build, TypeScript and full production build passed.
- 53 focused tests passed across six files covering Living, studio state and public assistant route isolation.
- Brand guard, macron check and diff whitespace check against current main passed.
- Scoped lint passes for the new server page and shared chrome/isolation files. Broader Living lint reports nine errors and two warnings: four link errors and one image warning reproduce on the original configurator; the remaining findings are in the unchanged photographic store (effect state updates, links and image). These are existing feature-branch issues, not repaired here.
- Local Playwright: preview loads at 1440px and 375px; noindex/nofollow verified; grid selection and editable label export produce the expected JSON with `concept-only` and `approved_for_manufacture: false`. `/living` and `/living/shop` load at their retained routes, and the shop suppresses shared navigation and DO assistant.
- The preserved configurator has mobile horizontal overflow (802px document width at a 375px viewport). This remains a preview limitation; no layout redesign was folded into the merge.
- Local screenshots and browser output remain in `output/playwright/pr1615/` and `.playwright-cli/` in the isolated repair checkout; they are not deployment proof.

## Approved follow-up repair

Current main #1620 (`0971e0de219f6a2696deaea2a74d8240bab3e91a`) is incorporated. Both homepage-preview and Living-shop assistant exclusions are preserved with route boundary tests. The obsolete homepage CI assertions are repaired without changing the coastal homepage; see `docs/reviews/HOMEPAGE-CI-REPAIR-20261019.md`.

The earlier mobile limitation is fixed by allowing workbench grid children and inputs to shrink, rather than hiding page overflow. Browser checks at 320, 375 and 1440px verify document width, every form control's horizontal bounds, selected product/name/dimensions export and unchanged concept-only manufacturing restrictions. A dedicated CI workflow repeats this proof.

Scoped Living lint is clean: internal navigation uses Next Link, local photo previews use unoptimized Image, and storage synchronization is cancellable after hydration. The storage scheduling matches the mechanics already prepared in #1621; no catalogue, CAD, prices or design changes from that PR are imported. #1621 and #1622 remain overlapping product work requiring reconciliation before sequential merges. The configurator remains at its noindex preview route, absent from public navigation; noindex is not access control.
