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
