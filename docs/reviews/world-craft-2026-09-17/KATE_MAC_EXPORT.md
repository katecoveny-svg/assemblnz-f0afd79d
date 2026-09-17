# Kate Mac — rebuild DO World atelier

**Blender:** 5.1.1 at `/Applications/Blender.app`  
**Script:** `scripts/build-do-world.py` (headless CLI; procedural; no texture packs)  
**Consumers:** `WorldScene.tsx` → homepage `AssemblWorldHero` + `/preview/do-world`

## One-shot rebuild

```bash
cd /path/to/assemblnz-f0afd79d

OUT="$HOME/Documents/Codex/assembl-do-world-$(date +%Y-%m-%d)"
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

## What the script does

1. Builds the imagined Auckland harbour atelier as separate objects.
2. Saves **editable** `do-world.blend` (architecture + furniture still discrete).
3. Joins meshes by material and exports Draco `do-world.glb` for the browser.
4. Renders an honest AgX Cycles poster matching the arrival camera (~eye level, ~36mm).

## Tip SHA

Recorded on the draft PR after push (git tip of the craft branch). Prefer Kate Mac re-export when polishing geometry beyond what cloud Blender 5.0 produced.

## Honesty

Imagined Assembl studio — not a mapped real property. No live-agent theatre in the scene.
