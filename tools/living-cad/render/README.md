# Studio renders of the print files

Headless three.js renders of the real v0.3 STLs in brand colours, used for
`docs/living/renders/` (chalk or oat ground) and the alpha set the Remotion
piece uses (`remotion/public/images/living/`). Renders, labelled renders:
not photographs.

```bash
# from the repo root: serve the repo so the page can import three and fetch the STLs
python3 -m http.server 3113 --bind 127.0.0.1 &
node tools/living-cad/render/render-scenes.mjs docs/living/renders
```

Needs `playwright-core` resolvable from the script and Chromium at
`/opt/pw-browsers/chromium` (edit the path in the script otherwise). Scenes
are in `scenes.json`: parts by STL path, colour hex, x/y offsets in mm,
`flip` for parts that print face down, and a camera offset. Lighting lives
in `render.html` (RoomEnvironment, one soft key light, ACES at 0.82).

## Props: the "what's in it" pod renders

`props.py` builds a few everyday things at real sizes as plain solids
(spoon lures, a soft bait, sinkers and a swivel; an earbuds case and a coiled
cable; balm tins and a key ring; pencils, a pen; a bank card) into
`extra/props/`. The `pods-*` scenes seat them in the real insert pockets so
the pictures show what each pod and insert holds. They are stand-ins for
renders only: never print files, never claimed as included with a pod.

```bash
python3 tools/living-cad/render/props.py
node tools/living-cad/render/render-scenes.mjs docs/living/renders pods-
```

### Placement regression check

`python3 tools/living-cad/render/check-props.py` uses trimesh, numpy and
manifold3d to check all six scenes for prop/pod, prop/insert and prop/prop
intersections above 0.01 mm³. This checks the open render only, not a closed
lid, manufacturing tolerance, physical fit or performance.

The renderer now serves repository files through Playwright routing; no local
HTTP server is needed. Set `CHROMIUM_PATH` to an installed headless Chromium
binary when `/opt/pw-browsers/chromium` is unavailable. In a clean checkout,
copy the served STLs from `public/living/cad/v0.3/` into the ignored
`tools/living-cad/parts/stl/` directory before rendering these scenes.

21 October correction: rotate the bait/swivel into their pockets, remove two
overlapping sinkers, centre the cable in its circular pocket with its plug
resting over the coil, lift the beach props onto their actual pocket floors,
and orient the pen clip upwards. Pod and insert manufacturing geometry is
unchanged. Contents remain illustrative objects, never supplied products.

## Flipped inlays

A lid prints face down, so its file is 15 mm tall with the lip up and the top face on the bed; `flip` turns it
over in the scene. Its inlay file is 0.6 mm tall. The renderer recentres every mesh on its own bounding box and,
for a flipped part, lifts it by its own height, so a flipped inlay lands at z 0..0.6 under the lid unless the
scene gives it `z: 14.4` (lid file height − inlay height). An inlay whose pattern is not symmetric about the lid
(the ruler lid: note above, ticks below) also needs the pocket's offset back: the `ruler-*` scenes carry
`y: lid.y + 3.556`. The `pods-*` scenes predate this and show their waves inlays under the lid.

The `fish-31` prop (a 31 cm fish-shaped solid, no species) is the stand-in for the fish ruler render.

