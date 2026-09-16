# Browser spatial tools — 16 September 2026

## Recommendation

Use authored Blender geometry for the interactive Office now. It gives us editable furniture, intentional composition, clear navigation and a small, self-hosted asset. Keep the same Office state outside the 3D view. This recovery implements that path with a ~676 KB Draco-compressed model, local decoder, static poster and four camera destinations. GPU rendering starts only when the visitor chooses Explore in 3D; the scene renders on demand.

For a detailed captured or generated environment, evaluate **Spark** alongside the existing Three.js scene after selecting a high-quality, rights-cleared splat asset. Splats supply the appearance of a place; they do not supply agent capabilities, task state or reliable collision geometry. This is an architectural recommendation, not a completed splat integration.

## The likely tools behind “splatter / Gus splatter”

| Tool | Verified role | Fit for DO |
| --- | --- | --- |
| [SuperSplat](https://developer.playcanvas.com/user-manual/supersplat/) | Open-source MIT editor; cleans and authors Gaussian splats. The hosted Studio/Manage service is distinct from the open-source editor/viewer. | Useful authoring workflow once we have a good capture. |
| [SuperSplat Viewer](https://developer.playcanvas.com/user-manual/supersplat/viewer/) | Self-hostable MIT viewer; camera movement, annotations, effects, optional collision/walk controls. | Useful for standalone spatial rooms or embedded experiences; self-host to avoid requiring every visitor to sign in. |
| [Spark](https://github.com/sparkjsdev/spark) | MIT Gaussian splat renderer for Three.js. [Current LoD guidance](https://sparkjs.dev/docs/lod-getting-started/) supports prebuilt RAD files and paged loading. | Closest fit to the existing React Three Fiber Office; render splats alongside interactive mesh objects. |
| [gsplat](https://github.com/nerfstudio-project/gsplat) | Apache-2.0 CUDA Gaussian rasterisation and training library. | Asset production on a suitable GPU, not the browser widget runtime or a Mac-native viewer. |

No new splat package is installed merely to advertise compatibility. A room needs a good scene asset first. The Blender source and its generated poster/model ship together so the current Office can be improved and reviewed rather than being an opaque placeholder.

## Next acceptance gate for splats

Choose a real or generated scene with permission to distribute it; inspect holes and viewpoint limits; clean/crop it; produce a streamed LoD asset; add mesh navigation/collision and semantic task anchors; verify 375 px, reduced motion, keyboard alternatives, memory and load time. Never upload private room captures by default. A spatial background must not reveal a user's documents or become an implicit source for agents.
