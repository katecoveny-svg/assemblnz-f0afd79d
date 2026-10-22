# Every print file prints without supports

**Status: 22 October 2026. All 280 served print files slice clean in Bambu Studio with supports off (no
"floating" warning). Checked digitally; nothing printed.** Slicer, profiles and method: `tools/living-cad/slice/`.

The first full slicing run (`slice-report.json`, PR #1665) flagged 30 parts the slicer would only print with
supports. Each is now redesigned or re-oriented so it does not need them, and the slicer's own check, not a rule of
thumb, is what says so.

## What the slicer counts as needing support

Bambu Studio (`TreeSupport.cpp`, `detect_overhangs`) flags an overhang as a cantilever when one of its contours (a
hole counts) touches nothing in the layer below, or when any vertex of its outline is more than 3 mm from where it
meets the layer below; a small island that starts in mid-air is a "floating region". So:

- a plain straight-edged bridge passes; a hole through a bridged roof fails, and so does a roof with a curved free
  edge;
- a cavity that runs out through a face leaves a sliver above its exit that fails;
- a stub that sticks out sideways while printing fails even when it is teardropped;
- a part drawn for one orientation and printed in another has to be checked again.

## The 30 parts

Grams and minutes are the slicer's (X1 Carbon, 0.20 mm Standard): before is with the supports it needed, after is
without.

| part | what was wrong | what changed | prints | g | min |
|---|---|---|---|---|---|
| `cam-body` | film-plane rails and the back pocket over the gate, face down | prints on its side | on its side | 197 → 191 | 244 → 232 |
| `cast-guide-1` (and 2, 3) | ring and post started halfway up the 14 mm foot | ring and post stand flush with the foot's front face | ring flat on the bed | 0.6 → 0.4 | 4 → 3 |
| `dr2-mount-carabiner-loop` | its tab is on the back face, so face down it started in mid-air | prints socket up | socket up | 18 → 16 | 39 → 27 |
| `dr2-phone-stand` | the cable notch through base and lip, on its side | prints standing on its front edge | on its front edge | 35 → 33 | 51 → 45 |
| `hm-drum-upper` | ribs and hub start above the spigot, in mid-air | prints top end down | top end down | 509 → 504 | 885 → 855 |
| `hm-rack-hoop-lower` | round pins began mid-air when it prints flat | flat tenons the band's full thickness; the upper hoop gets matching through-mortises | flat | 24 → 24 | 33 → 33 |
| `hm-rack-sling` | the leg bosses stick out sideways when it stands on end | a keel along each leg line through both bosses (also stiffens the sling); bosses and leg holes teardropped | standing on its end | 304 → 303 | 429 → 408 |
| `hm-y-hub` | 46 mm pocket roofs with bolt holes; and the arms could not physically go in (closed pockets, arms running into the lobes) | three flat faces where the arms meet the hub, pockets open through them, tongues start 13 mm out so the three clear each other, stepped bridges under the counterbores | standing on a flat face | 68 → 40 | 141 → 88 |
| `mini-collar-mount` | the web slot's roof, socket up | prints socket face down | face down | 8.0 → 6.8 | 22 → 17 |
| `mini-end-cap` | the key's detent bumps start as islands, head down | prints lugs down like a key; the loop stands up from the head with a teardrop hole (it is also the grip) | lugs down | 0.6 → 0.7 | 4 → 6 |
| `mini-lantern-hook` | the hook was narrower than the block, on its side | the hook is flush with the block's bed face | on its side | 7.9 → 6.3 | 29 → 24 |
| `mini-light-mount` | the C ring was narrower than the cube, on its side | the ring is the cube's full width | on its side | 12.4 → 12.2 | 36 → 33 |
| `mini-universal-key` | lug detents, lying one way | lies flat the other way (lugs edge-on to the bed) | flat | 0.5 → 0.5 | 5 → 5 |
| `pk-eraser-sleeve` | the thumb slot was a hole in the bridged roof | prints inlay-face up, the slot on the bed (inlay with it) | inlay up | 9.1 → 7.3 | 20 → 13 |
| `pk-lip-sleeve` | the thumb scoop curved the roof's free edge | prints inlay-face up, the scoop on the bed (inlay with it) | inlay up | 24 → 19 | 53 → 25 |
| `pk-pen-plug` | spigot ribs and loop, lying down | stands on its collar, spigot up | standing | 1.0 → 0.9 | 5 → 7 |
| `pk-topper-bow` | tails and drooping loops started mid-air | the topper's bow turns its loops up 36°; its tails land on the collar | collar down | 3.4 → 2.5 | 17 → 14 |
| `pk-topper-star` | its two bottom points started mid-air | sits on a 45° flare under the two points | collar down | 3.2 → 2.6 | 17 → 15 |
| `rack-mount` | the centre rib crossed the lightening windows | ribs stop short of the windows and the strap slots | face down | 87 → 85 | 116 → 104 |
| `rack-quiver` | the strap bands cut the back plate across; it restarted mid-air | the plate starts on the bed and grows back out of the tube at 45° above the lower band | standing | 107 → 101 | 182 → 167 |
| `ride-hinge-pin` | the head held the pin off the bed | a 0.3 mm flat along pin and head | lying on the flat | 1.0 → 0.5 | 6 → 3 |
| `ride-phone-plate` | the channel overhung the plate's round corners; the hook cavity ran out through its outer face | corners squared under the channel; the cavity stops 1.2 mm inside the face; the rack becomes a toothed groove | flat | 58 → 58 | 96 → 96 |
| `ride-phone-slider` | the pawl was a tongue flexing up and down, with air under it in every orientation | the pawl is an arm standing in the plate's groove that flexes sideways (teeth on the groove wall, a thumb tab pushes it aside to release); the slider's bottom outer edges chamfered | feet down | 17 → 14 | 57 → 42 |
| `ride-watch-42`, `-46`, `-49` | the charger puck pocket from below was a hole in the slab's bridged underside | the puck drops in from the top, its face flush with the pocket floor, so the watch sits on it; the cable runs out in a groove open at the top | as is | 33 → 29 | 71 → 48 |
| `scoot-quiver` | the 96 mm flange began 27 mm up when it stands on end; the bridges touched the round tube on a line | the flange runs the tube's full length; the bridges are saddles filled to the tube's curve | standing | 81 → 80 | 186 → 169 |
| `tk-pack-case-5`, `-7` | a hollow case open on both big faces: one face prints as a perforated roof | stands on its bottom lip, open top up | on its bottom lip | 102/154 → 68/101 | 257/396 → 88/123 |
| `tk-pack-rail` | pegs down, the bar above them | flange down, pegs up | flange down | 25 → 15 | 76 → 28 |

Fit checks rerun for every family touched (`tools/living-cad/parts/fit-tests-*.json`): all pass. The watch puck sits in
its pocket with 0 mm³ clash and rests on the floor; the phone slider's pawl holds when pulled 0.7 mm back and lets go
when pushed 1.2 mm aside; the Y stool's arms and hub now go together with 0 mm³ overlap (it was 11 cm³).

## Trade-offs, plainly

- The **Y hub** prints standing on a flat face: vertical seat loads run along the layers, but tension along one arm
  now crosses them. The stool stays not-a-seat until its load test passes.
- The **pack cases** print standing, so the TURN flange and its keyways are vertical while printing; the scoot quiver
  already prints that way.
- The **sleeves** print with the name inlay on top instead of the bed; the inlay files turn with them.
- The **bow topper** looks different from the bow charm: its loops turn up.
- The **phone mount**'s ratchet works differently (sideways pawl); the first print checks how firmly it holds.

## Tools

`tools/living-cad/slice/try_part.py` builds one part from the CAD and asks the slicer; `orient_check.py` asks it about
the six flat orientations of every flagged part; `islands.py` applies the same rule with shapely to say where a
problem is. `lib.bridge_steps` cuts the slot-then-square steps that let a hole start in a bridged roof.
