# assembl yours — the pick-and-mix builder

**Status: built 22 October 2026 at `/living/assembl/pod`, `/space`, `/ride`, `/day`. A configuration tool: nothing
is sold, ordered, sent or stored anywhere except this browser.**

Kate: "it should be like a pick and mix assembl my pod or assembl my space or assembl my ride or assembl my day etc
and then they can interactively drag and drop the parts into the product and then it shows the complete product
with cost and timeline etc. they should effectively be able to create what they want!"

## How it works

- **The tray** lists the parts for the mode. Drag a part onto the product, or tap it (Enter works from the
  keyboard); a tap puts it in its best place.
- **The surface** is where things go: the pod as an exploded stack (lid, insert, pod and keys, mount, charm), the
  wall as boards with a keyway on every cell, a bike with five drop spots (bar, stem, top tube, down tube, seat
  post) that light up when the dragged kit fits, and a day bag.
- **The 3D** is the real print files placed by the same matrices as the hero renders (`lib/living/builder.json`,
  `lib/living/assemblies.json`), tinted in the chosen colours, with the customer's own name on a name lid.
- **The totals** come from `lib/living/costing.ts`, a port of the python cost model (the test holds them to
  within 5 cents): print hours, weight, cost, a suggested price, and a timeline: print days on one printer at 14
  hours a day, a day to pack, NZ Post 1–3 days.

## The rules it keeps

- A wall piece goes where its keys land on cell centres; it cannot cover another piece or run off the side of the
  boards; it may hang a cell over the top or bottom edge, as on a real wall. Removing a board drops what no longer
  fits.
- A ride kit only drops where it fits (the universal saddle for any tube, the bar saddle on bars, the frame saddle
  on a top tube).
- A name lid shows the plain lid with the customer's lettering drawn on it; the sample name in the files never
  shows.
- Save keeps the build in this browser only. Copy puts the parts list and the estimate on the clipboard.

## Next

Dragging parts on the 3D itself, floor pieces (the home set) in a room mode, sharing a build by link, and a
"send to the store" step once the store is ready to take a configured item (Kate's call).
