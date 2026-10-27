# Kitchen Machine — Sites version 7

Source: https://kitchen-machine-kate.katecoveny.chatgpt.site/
Sites project: appgprj_6ada9861b1f88191a3e6f30ba3bd0aac
Exact source commit: 15a03881e7e0801b21d97f896bceb995133dcbd5
Retrieved through the supported Sites source helper on 26 October 2026.

This separate snapshot preserves the kitchen planner, retailer companion source/downloads, spatial demonstrations, assets, licences and tests. The separate Lab kitchen remains at https://github.com/katecoveny-svg/assembl_lab/tree/25f4e8cc062c8ef5f935f83f550520bb1019e852/kitchen and its shared Three.js assets are unchanged. Spatial scenes use illustrative assumptions, not synced operational twins; see docs/SPATIAL-TWINS.md. Companion shopping actions are not exercised by preservation.

Excluded: Sites deployment identity (.openai/hosting.json), Git metadata, credentials, browser/runtime data, unrelated Kimi downloads. SOURCE-SHA256.json verifies every retained original file byte for byte. No source code edits.

View locally: from this directory run `python3 -m http.server 3124 --directory dist`, then open http://localhost:3124/. No extension installation is needed to inspect the website. Retailer extensions remain uninstalled.

Tests: `npm ci --ignore-scripts`, `npm test`, and separately `node tests/twins.test.mjs` (the upstream npm test omits that spatial suite). Existing documentation incorrectly implies npm test includes spatial tests.

Preservation is not deployment approval. This snapshot lives outside Next.js app/ and public/ and adds no runtime route. The main repository review branch may run CI and Vercel previews; it is not connected to the Lab repository’s colmap-wasm project. Public Git source preservation was approved on 26 October 2026; no merge or production publication is approved. No live Site was changed.
