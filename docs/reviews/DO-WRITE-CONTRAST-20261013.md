# DO selected Write contrast — draft follow-up, 13 October 2026

Production review found white selected Write text on lilac during hover: 1.43:1. The generic LifeAdmin hover selector tied the selected entry selector and replaced its gradient. The entry rule now has higher specificity, retains the plum gradient, adds a 3px plum keyboard focus outline, and supplies readable disabled styling. No interaction, session, voice, persistence or consent logic changed. Write is never disabled by current application logic; disabled coverage sets the native property only in the isolated browser fixture.

## Released baseline

PR #1525 merged as **883b0d5548e7f89a1f1f1ffd19f760f683a0e8b1**, from reviewed head 3be210936a5d087dd0915c903ed3cf5ef715dc6c. Production deployment **dpl_4ZbxWdhJM6K3ZvdUKohhXwui4ttx** was READY at that exact main SHA. This follow-up branches from that merge and is not approved for merge or production release.

Verified production aliases at release:

- www.assembl.co.nz
- assembl.co.nz (307 to https://www.assembl.co.nz/do for /do)
- demo.assembl.co.nz
- assemblnz-f0afd79d.vercel.app
- assemblnz-f0afd79d-katecoveny-svgs-projects.vercel.app
- assemblnz-f0afd79d-git-main-katecoveny-svgs-projects.vercel.app

Deployment URL: https://assemblnz-f0afd79d-wh39pallt-katecoveny-svgs-projects.vercel.app

The separate school preview failure was a serverless packaging/symlink issue on 4ceb830726f8cc7157e7cf268d259e954cc419cd (dpl_421KqNFLrCVZ5dP92SZbFCFZEvkT). Its owner's corrected 911f4bd0991c26b85ac2908e9a19ab98d9d4de66 preview dpl_CCiFrmytCbNYfQ894dCsPt58bLvc reached READY. It did not block the released entry deployment and is not included here.

## Validation

Production Next build and scoped ESLint passed. Isolated Chrome regression passed **37 checks**, including the existing 17 entry checks. API responses were fictional; all external requests and writes were blocked. No microphone starts, submitted requests or browser errors. Drafts survive Write/Talk/Add changes. Overflow checks passed at 320, 375, 768 and 1440px; reduced motion and menu keyboard behavior passed.

| State | 1440px text | 375px text |
| --- | --- | --- |
| Rest | 8.92:1 | 9.06:1 |
| Hover | 8.92:1 | 9.06:1 |
| Keyboard focus | 8.92:1 | 9.06:1 |
| Pressed | 8.92:1 | 9.06:1 |
| Disabled fixture | 5.84:1 | 5.84:1 |

Focus outline contrast against the adjacent rose navigation background: **5.84:1** at both sizes. The harness asserts actual hover, active, disabled and keyboard focus-visible states. Text contrast samples rendered interior background pixels with glyphs temporarily hidden and compares them with computed text colour. This is an entry-control check, not a whole-site accessibility certification. Phone evidence uses a 375px browser viewport, not an installed-device claim. Live sign-in and Gemini voice were not exercised.

Reproduce with a production server and `ASSEMBL_REVIEW_ORIGIN` / `ASSEMBL_REVIEW_OUTPUT` set, then run `node scripts/review-do-entry-chrome.cjs`. The existing builderdoo-validation workflow already runs this script.

Evidence: [measurements and checks](../../output/playwright/do-write-contrast/report.json). Screenshots for all five states at both sizes are in `output/playwright/do-write-contrast/write-*.png`.

Changes: `app/do/personal/entry.module.css`, `scripts/review-do-entry-chrome.cjs`, this review and its evidence. Review and explicit release authorization remain required.
