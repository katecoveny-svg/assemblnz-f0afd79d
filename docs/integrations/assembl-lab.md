# assembl Lab integration — review branch

## Verified source and scope

- Main website baseline: `55b33eae589d11264df6c1a3a22775520484f1b2` in `katecoveny-svg/assemblnz-f0afd79d`.
- Lab source: https://github.com/katecoveny-svg/assembl_lab at `25f4e8cc062c8ef5f935f83f550520bb1019e852`.
- Lab production: https://assembl-lab.vercel.app/; Vercel project `assembl-lab`, deployment `dpl_HxurQQJGihBd84cyYBqBFzPboFVY`, READY, same commit.
- Live catalogue: 15 experiments; nine models share `assets/twin/1/` and vendored Three.js 0.170. The homepage uses real nested home/café/store scene previews. Kitchen has a separate 3D implementation. Study advertises 29 machines, 23 in 3D; this work does not independently verify every machine.
- Maturity remains Model/Shadow, not synchronised operational twins.

## Decision: preserve the application boundary

This intentionally small integration uses existing `isLab` chrome isolation and the public `/lab` middleware exemption. It adds homepage navigation/footer/Studio links, a canonical `/lab` page and sitemap entry, and isolates the company assistant on that page.

The full Lab is framed on its existing origin. Its nested preview bridge checks `location.origin`, so a copied main-site hero controlling cross-origin scenes would break the existing handshake. Framing the application preserves that relationship, rendering, source panels, filters and routes. No assets, simulation logic or Lab deployment configuration are changed. No DNS change is needed.

The main-site bar provides a persistent return and direct-open fallback. The existing Lab hero carries the presentation; this is not a new renderer or a flattened screenshot replacement. Lab changes become visible through its own deployment, independently of the main-site release. This ongoing dependency is deliberate and should be reviewed before merging.

Do not replace Lab with a ZIP. `STAGE.md` reserves `assets/twin/**`, `assets/vendor/three/**`, `assets/posters/**` and the nine twin index pages as source-of-truth paths. Breaking stage changes need a versioned folder.

## Kimi handoff

A current supermarket export was identified locally; its credits explicitly attribute reusable shelf, checkout and trolley assets to the Kimi design asset library. It is a different React 19 / Three.js 0.180 game from the deployed shared stage. It has not been copied into this PR or published.

Safest handoff: provide a source ZIP or a separate feature branch, the preview URL, asset/license manifest, exact starting commit and a short list of changed scenes. Include source modules and textures/models rather than only a compiled bundle or screenshots. Retain credits and asset orientation/receipt files. Review and adapt one scene at a time against Lab's current stage; do not replace the whole application. No agent-to-agent connection, account credentials or private chat sharing is needed.

Experimental `/capture/` and `/capture/train/` are excluded from new navigation and this change does not execute or install their training dependency. Their existing public reachability requires a separate owner decision about gating; no access changes are included here.

## Release boundary

Draft only. Review the iframe approach and Kimi scene handoff before merge. Do not promote production from this branch without approval. Rollback is removal of the `/lab` page and its entry links; Lab itself remains untouched.

## Verification

- `pnpm typecheck`: passed.
- Targeted ESLint on changed TypeScript files: passed, zero warnings.
- Direction 4c motion/video and assistant-isolation tests: 59 passed in 3 files.
- `pnpm lint:macrons`: passed (required normal local IPC permission).
- `pnpm build`: passed, including brand/front-door guards and canvas package build; final rerun after sitemap edit recorded separately in the task output.
- Browser: desktop and 375px homepage → Lab navigation passed. At 375px all home/café/supermarket selections changed the displayed title; Roof on became selected. Genuine nested WebGL scenes rendered in screenshots. No main-page horizontal overflow.
- Evidence: [desktop integration](lab-evidence/lab-integrated-desktop.png), [mobile entry](lab-evidence/lab-mobile-entry.png), [mobile controls](lab-evidence/lab-mobile-controls.png), [homepage entry](lab-evidence/home-with-lab-desktop.png).
- Observed upstream limitations: the supermarket selector's text clips at 375px in the existing Lab; the independent app scrolls inside the main-site frame. Main homepage console warns about its existing legacy Three.js loader; one screenshot/re-navigation run produced a TryDo textarea hydration mismatch involving `caret-color: transparent`. No Lab runtime errors were observed in the initial embedded run. These are not claimed fixed.
- Not run: whole-repository test suite/lint-all, all experiment flows, real-device QA, protected Vercel preview verification or production integration. No new Lab source was deployed.
