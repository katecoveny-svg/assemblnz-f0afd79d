# Kate Mac — rebuild DO World atelier (daylight / white space)

**Blender:** 5.1.1 at `/Applications/Blender.app`  
**Script:** `scripts/build-do-world.py` (albedo rebalance for paper/chalk + daylight harbour)  
**Consumers:** `WorldScene.tsx` → homepage `AssemblWorldHero` + `/preview/do-world`

## Why re-export

Cloud retuned the live R3F grade + runtime material overrides so the hero is
daylight / white-space first without waiting on Blender. Authored GLB albedos
and the Cycles poster still bake the prior dusk / plum plaster + rose limestone
+ rose-opal cove. Re-export locks authored materials to the same daylight brief.

## One-shot rebuild

```bash
cd /path/to/assemblnz-f0afd79d

OUT="$HOME/Documents/Codex/assembl-do-world-daylight-$(date +%Y-%m-%d)"
mkdir -p "$OUT"

/Applications/Blender.app/Contents/MacOS/Blender -b \
  --python scripts/build-do-world.py -- "$OUT"

cp "$OUT/do-world.glb" public/do/world/atelier.glb
cp "$OUT/do-world-poster.png" public/do/world/atelier-poster.png
cp "$OUT/do-world.blend" public/do/world/do-world.blend

ls -lah public/do/world/atelier.glb public/do/world/atelier-poster.png
```

Fast GLB-only iterate:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b \
  --python scripts/build-do-world.py -- "$OUT" --skip-render
```

## Albedo changes in this pass

| Material (old) | Material (new) | Intent |
| --- | --- | --- |
| Warm plum plaster | Paper chalk plaster | Walls/ceiling = white space |
| Rose limestone | Chalk limestone | Floor = chalk, not rose wash |
| Rose opal light | Warm daylight cove | Cove emit ↓; paper warm, not rose flood |
| Waitemata dusk water | Waitemata daylight water | Harbour readable in day |
| Harbour city light emit 12 | Harbour city light emit 2.4 | Soft daytime bounce |

After Mac re-export, runtime map-stripping for plaster / limestone / cove in
`WorldScene.tsx` can be relaxed once authored albedos match chalk/paper.

## Tip SHA

`a958512e73a30785073e0e921237538b69a71814`  
(also `docs/reviews/world-daylight-2026-09-17/TIP_SHA.txt`)

## Honesty

Imagined Assembl studio — not a mapped real property. No live-agent theatre.
