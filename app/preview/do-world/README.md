# Immersive world study

Preview: `/preview/do-world`. Not linked from or substituted for the homepage.

The scene is authored by `scripts/build-do-world.py` in Blender. The editable file retains its separate architecture and furniture; the browser export batches geometry by material. Current GLB: 1,704,728 bytes, 11 meshes, 11 materials, four embedded textures, Draco compression. Its poster remains visible during loading.

Implemented: scroll-driven eye-level camera path and gaze, three chapter anchors, direct product links, existing dimensional-d.png identity, pause/reduced-motion handling, demand rendering, error boundary, and responsive typography.

Verified 16 September: local browser render of the exported architecture; earlier chapter navigation and responsive checks; scoped ESLint, TypeScript and full production build pass. This is an architectural study, not the finished homepage. The latest revised camera path still requires a complete desktop/mobile pass. No splat renderer or live agent activity is connected, and performance has not been profiled on a physical phone.

Keep the working homepage intact while refining this route. Do not present the scene as proof of agent execution.
