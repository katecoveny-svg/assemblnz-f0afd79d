# Pompeii · assembl lab

An original browser-based historical enquiry prototype. Static HTML/CSS/ES modules and vendored Three.js 0.180.0. No build step, accounts, analytics or backend services required. Notes are stored only in browser localStorage and can be exported by the learner.

## Experience

- A continuous WebGL scene with an authored street, food counter, bakery, atrium house, roof cutaway, moving camera, free exploration, map and adjustable light.
- Six evidence hotspots linked to official Pompeii Archaeological Park sources.
- Three key clues, three assessment questions, reflection notebook and Markdown export / print.
- Responsive controls, keyboard movement, reduced-motion setting, graphics quality controls, text fallback and opt-in generated ambience.

## Historical boundaries

The scene is a composite interpretation, not a measured archaeological model or Gaussian-splat capture. No primary-source imagery or scan data is reused. All architecture, textures and objects are newly authored. Coordinates, dimensions, colours and object arrangements are illustrative. The underlying learning content and its limitations are in `dist/evidence.json`.

The roof switch is a cutaway of the same model, not a present-day comparison. The mountain is an illustrative landscape, not a scientific reconstruction of the pre-eruption profile. No exact eruption date, prices or fictional testimony is asserted. Archaeological specialist and classroom teacher review is pending. The curated source guide is not a live AI agent.

## Runtime

The hosting manifest declares `dist` as static root. Start with the supported Sites preview CLI. Source and output are the same static files. Three.js files retain their MIT licence headers; full licence in `dist/vendor/THREE-LICENSE.txt`.

## Verification

Run `node --check dist/app.js` and `node --check dist/scene.js`. Browser QA covers rendering, place navigation, cutaway, evidence collection, notebook persistence, reflection entry and question feedback. Do not call the experience photorealistic scan data.

### Verification on 26 October 2026

JavaScript syntax checks passed. Headless geometry construction produced 746 meshes / 786 instances with no non-finite vertex values. Ray checks identified and corrected a canopy obstruction in the food-counter camera path. Browser checks passed for collecting the three required clues, unlocking and completing all three questions, notebook entry and persistence after reload.

The provided cloud browser has WebGL disabled, so live 3D rendering, animation, mobile performance and roof controls have not been visually verified. The reading fallback was tested. This is a material QA limitation, not a claim that 3D was visually inspected.
