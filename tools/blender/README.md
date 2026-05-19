# tools/blender — assembl vessel build script

A `bpy` Python script that builds the canonical assembl stacked vessel
in Blender and renders it in 3 brand variants.

## What you need

- **Blender 4.x** installed locally (`brew install --cask blender` on Mac,
  or download from blender.org).
- ~30 seconds of GPU time per still, ~30 minutes per animation.

## Quick run — three variants as 4K PNG stills

From this repo root, in your terminal:

```sh
blender --background --python tools/blender/vessel.py -- --variant pounamu
blender --background --python tools/blender/vessel.py -- --variant arataki
blender --background --python tools/blender/vessel.py -- --variant toro
```

Each command writes one PNG to `./out/`:

```
out/vessel-pounamu.png   # green translucent glass, cream ceramic top
out/vessel-arataki.png   # karaka amber glass, cream ceramic top
out/vessel-toro.png      # smoky charcoal glass, bird-form top
```

## Turntable MP4 (for scroll-scrub hero)

```sh
blender --background --python tools/blender/vessel.py -- --variant pounamu --animate
```

Renders 96 frames at 24 fps → `out/vessel-pounamu.mp4` (4-second loop).

## Lower resolution if your machine is slow

```sh
blender --background --python tools/blender/vessel.py -- --variant pounamu --resolution 2K
# or --resolution 1080p
```

## Custom output path

```sh
blender --background --python tools/blender/vessel.py -- \
  --variant pounamu --output ./public/img/hero/pounamu-4k.png
```

## Run interactively in Blender GUI

1. Open Blender.
2. Switch a workspace to **Scripting**.
3. Open `tools/blender/vessel.py` in the text editor.
4. Edit `VARIANT = "pounamu"` near the top to switch variants.
5. Hit **Run Script** (▶ icon or `Alt+P`).
6. Render via `Render → Render Image` (F12).

## What the script does (high level)

- Cycles renderer, 256 samples, denoised
- Three-point soft studio lighting (warm key + cool fill + rim)
- Warm `#FAF7F2` paper background acting as soft env light
- Geometry: brass cube wireframe frame, cream ceramic bowl, alternating
  translucent glass plates and cores, top wave/bird piece
- PBR materials: brass metallic, ceramic with subsurface, glass with
  transmission + IOR 1.48
- 65mm camera, slight elevation, editorial product framing
- Linear-RGB colour conversion from the Mārama Whenua hex palette

## What it isn't

- Not a final-render asset. The geometry is parametric — vessel proportions,
  proper subdivision surfaces, edge-loops for hand-thrown ceramic look, real
  brass-frame welds, and the Tōro bird sculpting all want a 3D artist with
  proper subdivision and sculpt tools.
- Use the output as a **first pass** — for editorial stills it's likely
  serviceable; for hero video you'll want hand-refinement.

## After rendering

Add the outputs to the site:

```sh
# Example: use the pounamu still as the homepage hero
cp out/vessel-pounamu.png public/img/hero/vessel-pounamu.webp
# (Convert to WebP with sharp or ImageMagick first; matches repo convention)
```

Then update consumers in `lib/kete.ts` or wherever the hero image is
sourced. The current canon already uses `public/img/kete/*-vessel*.jpg` —
swap those in place if the Blender output looks better than the existing
photography.

## Tweaking the geometry

The build functions in the script (`add_bowl`, `add_glass_plate`,
`add_glass_core`, `add_wave_top`, `add_bird_top`) are small and obvious
— scale, position, and shape are all literal numbers. Open the file and
edit. Re-run to see the change.
