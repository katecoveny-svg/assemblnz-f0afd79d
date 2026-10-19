# Design brief — assembl / living: the widget, the shop page, the host page

**For: Claude Design (and any designer picking this up). From: the living
build, 19 October 2026. Status: brief. Nothing here changes what is for
sale; nothing is for sale until the TURN test kit passes.**

Three surfaces, one system. Design them together so a customer feels one
hand behind all three:

1. **The widget** — `/living/widget/<handle>`, framed inside a store product
   page. One product or kit, made yours.
2. **The Shopify shop page** — the product template that hosts the widget,
   plus the collection pages (room kits, dayrally kits, parts).
3. **The host page on assembl** — `/living` (the modular system) and
   `/living/widget` (the index), where the story lives.

---

## 1. What assembl / living is, in three sentences

A modular interiors system printed to order in New Zealand, built on one
connection: the assembl TURN, a quarter-turn key on a 42 mm grid. Boards,
hooks, shelves, bins, cups, trays, name plates, and the dayrally pods and
bag pieces all share it. A customer picks a product or a kit, chooses a
colour and an accent, adds a name, sees exactly what will be printed, and
the store page sells it.

The brand promise is honesty: real geometry, real estimates, real limits.
Never a render pretending to be a photo, never "AI-designed" copy.

## 2. The brand canon (do not improvise)

| Token | Value | Use |
|---|---|---|
| deep plum | `#240B21` | headings, primary buttons, the "ok" status dot |
| ink | `#492B3E` | body text on paper |
| muted plum | `#654A4E` | secondary text, mono labels |
| dusty rose | `#916A70` | the "quiet" status dot, focus rings, one accent line at most |
| chalk | `#F5F1F2` | stage backgrounds, cards that need separation |
| paper | `#FFFDFB` | page background, inputs |
| oat | `#E6DCCB` | warm ground for chalk-coloured parts in imagery |

- **Instrument Sans** for everything a customer reads: headings (weight
  500, tracking −0.02em), body, buttons, labels.
- **IBM Plex Mono**, uppercase, 0.72rem, tracking 0.06em, **only** for
  evidence: part codes, estimates' labels, status pills, counters, file
  names, timestamps. If it is a fact the system knows, it is mono. If it is
  a word a person says, it is Sans.
- No gradients, no glow, no glass, no dark mode for these surfaces, no
  canary yellow, no cobalt, no teal, no gold. The dayrally colours (tomato,
  tangerine, butter, lime, mint, sky, cobalt, lilac, grape, blush, cloud,
  ink) appear **only as product colour**, never as UI colour.
- Radii: 999px pills for buttons and status; 14 to 20px for cards and
  stages; 50% swatches with a 2px paper ring and a plum ring when selected.
- Whitespace is the layout. Editorial, left-aligned, generous. One idea
  per band.

Full canon: `docs/assembl-brand-system.md` and root `DESIGN.md`.

## 3. The product colours, as they print

Living (7): chalk, oat, sage, clay, plum, ash, ink.
Dayrally (12 in the store): tomato, tangerine, butter, lime, mint, sky,
cobalt, lilac, grape, blush, cloud, ink.
Material: PLA Matte. Lettering and inlays print in a second colour.

## 4. Surface one — the widget

**Job:** make one item theirs in under a minute, and hand the result to the
store's own add-to-cart button. The widget never sells.

**Layout (desktop):** two columns, 5:6. Left, a sticky stage; right, the
choices in the order a person makes them. Under 720px, one column, stage
first.

**The stage.** Chalk rounded panel, 4:3. Two views, toggled by one small
ghost button: **schematic** (flat shape with the chosen colours and the
name) and **3D** (the real v0.3 print file, tinted, with the customer's
name as a decal). The caption under the stage is mono and tells the truth:
"Schematic · 168 × 40 × 6 mm · colours are filament names" or "Name plate ·
v0.3 print file · drag to turn". Design the 3D view so it is calm: paper
ground, soft key light, no spin on load, drag to turn only.

**The choices, top to bottom:**

1. Title (Sans 500, ~1.7rem) and one-line blurb from the manifest.
2. *In the kit* (kits only): a quiet list, "2 × Grid board 4×4", mono
   quantities.
3. **Colour**: swatches, name of the chosen colour in mono on the right.
4. **Accent** (only when a part prints in a second colour): the same
   swatches minus the body colour; caption "Ink · lettering and inlays".
5. **Lid / Insert / Shape** (dayrally pods and the charm): chips, one row,
   selected chip fills plum.
6. **Name** or **Plate number** (only when a part carries lettering): one
   input, counter "4 / 12" in mono, hint as placeholder.
7. **Quantity**: a pill stepper, 1 to 20.
8. **Estimates**: a 2 × 3 grid of mono label + Sans value + a small tag:
   print mass *est.*, print time *est.*, material *est.*, suggested retail
   *proposed*, part code, ships *packed*. Never style these as prices.
9. Actions. On the store page: a status pill "applied to this page" and one
   line, "Your choices travel with the add-to-cart button on this page."
   On assembl's own page: "download print sheet" (plum), "copy
   configuration" and "plan a whole wall" / "arrange it on a wall" (ghost).
10. Footer, mono: `AL-KTEEROO-CHA · v0.3 · 8 print files`, then one Sans
    line: "Nothing is for sale here yet. Estimates are planning figures,
    not a quote."

**States to design:** incomplete (a rose-dot pill "finish the choices" and a
soft rose issue list, never red); complete (plum-dot pill); 3D loading
(mono "loading the print file…"); no 3D available (button absent, not
disabled); reduced motion (no spring on swatches, 3D still allowed because
it is user-initiated).

**Motion:** swatches and chips settle in 160ms. The schematic colour changes
instantly. The estimates do not animate. Nothing moves that the customer
did not touch.

## 5. Surface two — the Shopify product and collection pages

**Job:** make the widget feel native, and make the catalogue legible.

**Product page:** title and price from Shopify above; the widget directly
under the gallery on desktop, above the buy box on mobile; Shopify's own
add-to-cart and price stay Shopify's. The gallery holds the studio
renders (section 8) first and photographs once prints exist. Below the
widget: three editorial bands, each a single idea — *One connection*
(the TURN key, 42 mm grid, one diagram), *Made to order in New Zealand*
(what printed-to-order means, lead time honesty), *The fill list* (what
fits, for trays and bins).

**Collection pages:** three collections, in this order: **Room kits**,
**dayrally kits**, **Parts**. Cards on paper, product render on chalk, title
Sans, one mono line: "7 colours · personalised". No badges, no "sale", no
star ratings until there are real ones.

**Theme:** Dawn or an equivalent clean theme, paper background, Instrument
Sans loaded, Plex Mono for the mono lines, plum buttons with 999px radius,
no drop shadows heavier than `0 14px 40px rgba(36,11,33,0.08)`. Remove
the theme's default announcement bar and trust badges.

**Cart and order:** the line item properties (Colour, Accent, Name, Part
code, Contents) must be visible in cart and in the order confirmation in
mono. Design that row.

## 6. Surface three — the host pages on assembl

**`/living` (exists, refine):** the modular system as a story. Hero: one
sentence, one render of the teen room starter flat-lay, the TURN key as the
only diagram. Then the six spaces as doors (my room, my space, work &
create, store & organise, pets & everyday, plants & objects), each a quiet
card. Then "how it is made": printed to order, v0.3, test kit, proof. Then
the kits. No carousel, no video autoplay.

**`/living/widget` (exists, refine):** an index for Kate and for stores:
the embed snippet in a chalk code block, then every product and kit as a
card. Treat it as a maker's catalogue, not a shop.

**Motion on the host pages:** follow the brand sequence *fragmented →
gathering → organised → prepared → proof*. Parts gather into a kit on
scroll-in once, then hold. Reduced motion shows the assembled state.

## 7. Copy voice

Short, warm, exact. Lowercase product line names ("assembl / living",
"dayrally"), sentence case elsewhere. Say what the thing does: "Bags,
headphones, caps, leads." Say what it is not: "Estimates are planning
figures, not a quote." Never "AI", never "smart", never "premium",
never "revolutionary". The customer should feel: *I know exactly what I
am getting.*

## 8. Imagery to use now

Studio renders of the real v0.3 print files, in `docs/living/renders/`
(1600 × 1200, chalk or oat ground) and alpha versions in
`remotion/public/images/living/`. These are **renders, labelled renders**;
they can be taken towards photorealism (see the prompt notes below) but
must stay recognisable as the actual geometry.

| File | What it is |
|---|---|
| `board-4x4-chalk` | the 4×4 TURN board, face up, on oat |
| `hook-clay`, `shelf-3-sage`, `cup-plum`, `bin-2-oat` | single accessories, as printed |
| `name-plate-plum-mila` | plate with the sample lettering MILA in chalk |
| `tray-2x1-oat`, `vanity-cutout-sage` | tile system |
| `pod-standard-sky-waves`, `pod-mini-butter-name` | dayrally pods with lids |
| `charm-star-tangerine`, `number-plate-lime` | dayrally and bike pieces |
| `stack-nodes-ink` | dowel joints and foot |
| `renter-door-oat` | over-door hanger and rail |
| `teen-room-flatlay` | the teen room starter, sage boards, ink accessories |
| `dayrally-everyday-flatlay` | a dayrally kit in tomato and butter |

**Photorealism prompt notes (for an image model):** "Keep this exact
geometry, proportions and colour. Render as a product photograph: matte
PLA with faint layer lines at 0.2 mm, soft north window light from the
upper left, paper-white seamless, shallow depth of field, no props, no
text, no logos. Colour names: chalk `#F1ECE3`, sage `#B4C5AC`, plum
`#4A2A3C`…" Always feed the render as the reference image and ask for
fidelity to it, not a reinterpretation.

## 9. Motion piece

`remotion/src/videos/LivingAssembles.tsx` (compositions `living-assembles`
1920 × 1080 and `living-assembles-story` 1080 × 1920, 10 s): parts gather
into the teen room starter, the four choices appear as a customer makes
them, the estimate tiles count up, the proof pill locks last. Paper, chalk,
plum; Instrument Sans and Plex Mono; no camera moves, no loops. Use it on
the host page hero (muted, once) and in the shop's "how it is made" band.

## 10. Acceptance

- Every number on screen is labelled est., proposed, or is a real part code.
- Reduced motion shows the complete state; nothing required lives only in
  a canvas.
- Phone: 16px minimum body, 44 × 44 targets, no horizontal scroll, one
  column, stage first.
- The three surfaces share the same tokens, radii, type scale and status
  pill. A customer moving from shop to widget to assembl sees one system.
- No legacy palette (gold, teal, cobalt, canary, cosmic gradients) anywhere.
