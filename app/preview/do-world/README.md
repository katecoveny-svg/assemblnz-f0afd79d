# Immersive world study

Preview: `/preview/do-world`. Not linked from or substituted for the homepage.

The scene is authored by `scripts/build-do-world.py` in Blender. The editable file retains its separate architecture and furniture; the browser export batches geometry by material. Current GLB: 1,704,728 bytes, 11 meshes, 11 materials, four embedded textures, Draco compression. Its poster remains visible during loading, then fades once the GLB is ready.

## This pass (cinematic fly-through)

R3F-only craft upgrades (no Blender re-export required for this PR):

- Chapter-eased camera path with dwell on Find / DO / Show, then smooth transitions
- Lower cinematic FOV (48°) at true eye level (~1.7–1.9 m), separate desktop/mobile paths
- Heavier scroll lag + soft gaze follow for a glide rather than snap
- Spatial C lighting: deep plum field/fog, rose cove washes, warm harbour dusk shader (no purple leak)
- ACES filmic tone mapping; rose-warmed emissive materials on the atelier GLB
- Stronger dimensional D sculpture (shared DoMark contour) with rose presence lights
- Honest poster → canvas crossfade; demand rendering; pause / reduced-motion still respected

## Still needs Kate’s Mac (Blender 5.x)

Cloud VM has no Blender 5.1.1. When geometry/material authoring is next on the table, run locally:

```bash
blender -b --python scripts/build-do-world.py -- /absolute/output
# copy atelier.glb + atelier-poster.png into public/do/world/
```

Suggested Blender follow-ups (not done here):

- Re-render poster from the revised arrival camera (lens ~35–40mm eye-level) so the load still matches the first frame
- Soften walnut / limestone roughness for closer R3F/ACES parity
- Optional: bake a subtle rose bounce into the cove light materials

## Checklist before claiming done

Desktop (~1280+):

- [ ] Poster visible until GLB ready, then fades cleanly
- [ ] Find / DO / Show each hold a readable room frame (sculpture clear on DO)
- [ ] Rose glow, no purple wash in fog/sky
- [ ] Pause motion freezes the camera; reduced-motion disables scroll fly-through

Mobile (375):

- [ ] Document width equals viewport (no horizontal scroll)
- [ ] Sculpture sits higher/smaller; copy still readable
- [ ] Nav + pause control usable; chapter anchors land on the right rooms

Verified previously (16 September): local browser render of the exported architecture; earlier chapter navigation and responsive checks; scoped ESLint / TypeScript / production build. This remains an architectural study, not the finished homepage. No splat renderer or live agent activity is connected; physical-phone profiling is still open.

![Desktop DO room](../../../docs/reviews/world-2026-09-16/desktop.png)

![375px DO room](../../../docs/reviews/world-2026-09-16/mobile.png)
