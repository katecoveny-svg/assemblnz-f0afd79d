# at home, second set — desk trays, two side tables, a stool, a magazine rack

**Status: designed and checked digitally on 22 October 2026. Nothing printed. Lab items; no price listed.**
Source: `tools/living-cad/cad/home2.py`. Build: `python3 tools/living-cad/cad/build_home2.py` (17 files, `hm-*`,
all one body, watertight, inside a 250 mm cube). Assembled views: `tools/living-cad/cad/assemblies.py` →
`lib/living/assemblies.json`; hero renders `docs/living/renders/asm-lab-*` (desk set, fluted table, grid tables,
Y stool, magazine rack). Widgets: `/living/widget/lab-desk-set`, `lab-fluted-table`, `lab-grid-table`,
`lab-grid-table-round`, `lab-y-stool`, `lab-magazine-rack`.

Kate sent photos on 22 October: a stackable desk set (S 84 × 84, M 171 × 85, L 255 × 85, XL 255 × 170, all 45 tall),
fluted resin side tables, grid-topped block stools, stacking stools of interlocking bent arms and a hoop-handled
magazine rack, with "these products need to be included (obviously designed uniquely and rendered etc)". These are
our own pieces drawn from the ideas, not copies, and each one is cut to fit a 250 mm printer.

## The pieces

| piece | how it works | files | est. mass | print | first price |
|---|---|---|---|---|---|
| desk set | trays on an 81 mm module (79, 160, 241 long, 45 tall) with fluted outsides; an inset foot nests a tray on another the same size; the XL base (248 × 167 × 24) has low ribs so trays sit on the module | base, L, M, S × 2 | 408 g | 21 h | NZ$120 |
| fluted side table | two tapered fluted drums (Ø236 → Ø208) and a top, joined by 12 mm spigot rings, three ribs and a hub inside each drum; the top is hollow under a 4 mm skin | lower, upper, top | 1.14 kg | 57 h | NZ$275 |
| grid side table | a 240 × 160 pill, 236 tall; the top is cut into a 14 mm grid (a third of the TURN pitch) and drops in on a tongue; cross ribs inside | body, top | 688 g | 35 h | NZ$170 |
| grid side table, round | the same on a Ø220 drum | body, top | 743 g | 37 h | NZ$185 |
| Y stool | three identical bent arms (150 reach, 240 tall) whose tongues meet in a tri-lobe hub on three M6 × 30 bolts | arm × 3, hub | 433 g | 27 h | NZ$130 |
| magazine rack | a 220 × 160 sling (prints standing on its end), four tapered legs into bosses, a hoop handle in two halves on two pins | sling, legs × 4, hoop × 2 | 358 g | 19 h | NZ$110 |

Prices are the cost model's suggestions (`COSTING-20261021.md`, own print, 55 % margin), not listed prices.

## What is not claimed

- The side tables are side tables and plant stands. The Y stool is 24 cm: a step, a kids' seat, a plant stand,
  and nobody sits or stands on it until a load test on the printed parts passes (target: 100 kg static on the hub
  for 10 minutes, no crack, less than 2 mm deflection). The bolts and nuts are bought, not printed.
- Fluted walls print without supports; the drums lean in under 2°. The first print checks the spigot fits
  (0.3 mm clearance), the desk trays' nesting feet and the grid top's tongue.
- Masses are estimates from the meshes, not slicer results.

## Lineage

`lib.py` (helpers), `assemblies.py` (poses), `make-assembly-scenes.py` (renders). The hero image on `/living` is
these renders composed at true relative scale on a warm ground; it is a composition of renders, not a photograph.
