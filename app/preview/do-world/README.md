# Immersive world study

Preview: `/preview/do-world`. **Homepage hero** (`AssemblWorldHero`) reuses this same `WorldScene` + `public/do/world/atelier.glb` — no second 3D stack.

## Pipeline (locked)

1. Author in Blender via `scripts/build-do-world.py` (procedural; materials embedded; no downloaded texture packs).
2. Script saves **editable** `do-world.blend` first (separate objects), then batches by material and exports Draco `do-world.glb`.
3. Copy into the app:
   - `do-world.glb` → `public/do/world/atelier.glb`
   - `do-world-poster.png` → `public/do/world/atelier-poster.png`
   - `do-world.blend` → `public/do/world/do-world.blend` (editable source; keep separate from browser batches)
4. R3F consumer: `WorldScene.tsx` + `World.tsx` (scroll Journey, chapter anchors, Identity D). Homepage must reuse this stack.

## Kate Mac re-export (Blender 5.1.1)

From the repo root:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --python scripts/build-do-world.py -- /absolute/output/dir
```

Then:

```bash
cp /absolute/output/dir/do-world.glb public/do/world/atelier.glb
cp /absolute/output/dir/do-world-poster.png public/do/world/atelier-poster.png
cp /absolute/output/dir/do-world.blend public/do/world/do-world.blend
```

Optional: add `--skip-render` after the output path args to export GLB/blend only (faster iterate).

Local Mac study path Kate has used:

`/Users/kateharland/Documents/Codex/2026-09-16/referenced-chatgpt-conversation-this-is-an/outputs/do-world/do-world.blend`

## This craft pass

- Task chairs with arms / lumbar; table apron + pedestals; salon cushions
- Acoustic plum felt panels; research shelf ledge; graphite monitors
- Waitematā exterior: waterfront massing, sky landmark, Harbour Bridge–inspired span, ferry silhouette, Rangitoto massing
- Open glazing (no opaque glass plane) so harbour/city lights stay readable
- Plum / dusty-rose Spatial C grade — not purple D chrome, not grape neon
- R3F: tighter FOV (46°), refined desktop + mobile eye-level paths, harbour gaze on Find
- Budget target: web-viable Draco GLB under ~3 MB

## Current budget (verify after each export)

| Asset | Typical |
| --- | --- |
| `atelier.glb` | ~2.3 MB Draco; ~15 batched meshes |
| `atelier-poster.png` | ~1.9 MB · 1600×1000 AgX |
| `do-world.blend` | ~2.3 MB editable |

Do not grow the hero past ~3 MB without an explicit budget decision.

## Checklist

Desktop (~1280+):

- [ ] Poster → canvas crossfade
- [ ] Harbour / city lights readable through glazing
- [ ] Find / DO / Show holds; Identity D clear on DO
- [ ] Plum / dusty-rose grade; no grape neon
- [ ] Pause freezes; reduced-motion snaps
- [ ] Homepage `/` uses the same WorldScene

Mobile (375):

- [ ] No horizontal scroll
- [ ] Still view / reduced path OK (≤650px by design on homepage)
- [ ] `/preview/do-world` camera framing readable
