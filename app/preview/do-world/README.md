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

## This craft pass (Kate 2026-09-17 — daylight / white space)

- **Kill purple wash:** no plum `<color background>`, no plum fog, no rose-opal room flood, no dusk-purple default grade
- Daylight / white space first: paper `#FFFDFB`, chalk `#F5F1F2`, soft natural key from the glazing
- Deep plum `#240B21` + muted/dusty rose `#916A70` only on furnishings, art, acoustic panels, Identity D (local glow)
- Waitematā exterior stays readable in daylight (harbour massing, bridge, Rangitoto)
- R3F `WorldScene` carries the live daylight grade + runtime albedo overrides for plaster/limestone/cove until Kate Mac re-exports the GLB
- Blender `scripts/build-do-world.py` albedo rebalance ready for Mac 5.1.1 re-export (paper chalk plaster, chalk limestone, warm daylight cove)
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
- [ ] Harbour / city readable through glazing in daylight (not purple haze)
- [ ] Find / DO / Show holds; Identity D clear on DO (rose glow local only)
- [ ] Paper/chalk white space dominant; plum + dusty rose as accents only
- [ ] No global purple wash / plum fog / rose-opal flood
- [ ] Pause freezes; reduced-motion snaps
- [ ] Homepage `/` uses the same WorldScene

Mobile (375):

- [ ] No horizontal scroll
- [ ] Still view / reduced path OK (≤650px by design on homepage)
- [ ] `/preview/do-world` camera framing readable
