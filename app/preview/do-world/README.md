# Immersive world study

Preview: `/preview/do-world`. **Homepage hero** (`AssemblWorldHero`) reuses this same `WorldScene` + `public/do/world/atelier.glb` — no second 3D stack.

The scene is authored by `scripts/build-do-world.py` in Blender. The editable file retains its separate architecture and furniture; the browser export batches geometry by material. Current GLB (2026-09-17 Kate lock): **~1.81 MB**, **13 meshes / 13 materials**, five embedded textures, Draco compression, **≈122k triangles**. Imagined Assembl studio overlooking a Waitematā-like harbour at dusk (Rangitoto-inspired silhouette, waterfront CBD lights, Sky Tower–inspired landmark). Not a mapped real property. Its poster remains visible during loading, then fades once the GLB is ready.

## This pass (Auckland harbour atelier + plum grade)

Authoring + R3F craft (same pipeline):

- Regenerated `atelier.glb` / poster / `do-world.blend` from `scripts/build-do-world.py`
- Waitematā exterior: closer water, stepped Auckland waterfront massing, harbour city lights, volcanic island silhouette, slender sky landmark
- Interior craft: softer walnut/limestone, desk monitors + lamps, salon pendant, pohutukawa-toned botanicals
- Plum/mulberry grade (not lilac wash): restrained cove emission, deeper world, warmer harbour bounce
- R3F: Waitematā dusk sky, clearer fog falloff, harbour lightformers, material-aware emissive boost, Find gaze toward glazing
- Chapter-hold camera path + Identity D sculpture preserved
- Homepage: `AssemblWorldHero` still imports this `WorldScene` directly

## Rebuild (Blender 5.x)

```bash
blender -b --python scripts/build-do-world.py -- /absolute/output
# copy do-world.glb → public/do/world/atelier.glb
# copy do-world-poster.png → public/do/world/atelier-poster.png
# copy do-world.blend → public/do/world/do-world.blend
```

Optional: `--skip-render` to export GLB only.

## Budget

| Asset | Size | Notes |
| --- | --- | --- |
| `atelier.glb` | ~1.81 MB | Draco level 6; 13 batched meshes |
| `atelier-poster.png` | ~2.0 MB | 1600×1000 AgX Cycles poster |
| `do-world.blend` | ~1.8 MB | Editable source for Kate |

Stay web-viable — do not grow the hero past ~3 MB without an explicit budget decision.

## Checklist before claiming done

Desktop (~1280+):

- [ ] Poster visible until GLB ready, then fades cleanly
- [ ] Waitematā / city-light exterior readable through the glazing (not a plum void)
- [ ] Find / DO / Show each hold a readable room frame (sculpture clear on DO)
- [ ] Dusty-rose / mulberry accents, no grape UI chrome or flat lilac wash
- [ ] Pause motion freezes the camera; reduced-motion snaps chapters (no glide)
- [ ] Homepage `/` uses the same WorldScene fly-through as hero

Mobile (375):

- [ ] Document width equals viewport (no horizontal scroll)
- [ ] Sculpture sits higher/smaller; copy still readable
- [ ] Nav + pause control usable; chapter anchors land on the right rooms

Verified evidence for this PR lives under `docs/reviews/world-auckland-2026-09-17/` and walkthrough artifacts.
