# 30 September refinement — browser proof

Actual local Next.js pages. Signed-in cloud state uses fictional intercepted API responses; no private account or generation provider was used. The real anonymous checklist endpoint returned 401. The raw checks are in `results.json`; the repeatable driver is `scripts/review-do-refinement.cjs`.

- `do-mobile.webp`: 375px signed-out first screen; only the working checklist input is visible.
- `do-cloud-mobile.webp`: 320px signed-in fixture after exercising cloud save, restore, conflict and removal; worker heartbeat intentionally absent.
- `home-mobile.webp`: 375px reduced-motion homepage with compact product doors and optional demos.
- `home-desktop.webp`: 1440px reduced-motion homepage, preserving the approved atelier and Living Brief.

WebP encoding preserves the captured layout while reducing repository size. These are browser viewport tests, not physical iPhone, signed-in production or assistive-technology certification.
