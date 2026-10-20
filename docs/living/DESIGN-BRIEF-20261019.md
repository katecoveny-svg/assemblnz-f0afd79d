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

---

## 11. Addendum, 19 October (evening): the storefront is not yet the thing

Kate looked at the Shopify drafts and said what is true: the product pages are
part lists with clean renders, and nothing on the storefront looks like the
dayrally board she started from. That board was funky, bright, confident and
full of life; the drafts read like a parts catalogue. This addendum fixes the
brief, not the system.

### 11.1 Two registers, one system

assembl / living keeps the paper-and-plum canon (sections 2 and 7). **dayrally
is allowed to be loud.** The dayrally colours (tomato, tangerine, butter, lime,
mint, sky, cobalt, lilac, grape, blush, cloud, ink) may fill the frame on
dayrally pages: full-bleed colour fields, big type, parts photographed as
objects of desire rather than as print files. The UI chrome, buttons, pills
and mono labels stay in the canon on both. The rule is: **colour is content on
dayrally, never chrome.**

### 11.2 The storefront must say "modular" in the first screen

Every dayrally and living page opens with the system before the product:

1. **A one-line promise in Sans at display size:** "One key. Every piece." or
   "Pick a pod. Clip it anywhere." (dayrally) / "A wall that changes with you"
   (living). Not a product name.
2. **The TURN diagram, animated once:** key drops in upright, quarter-turns to
   horizontal, the piece locks. Three frames, 1.2 s, then holds. Reduced motion
   shows the locked frame.
3. **The lineup:** on dayrally, the four pod sizes in four colours in a row;
   on living, the teen room starter flat-lay. Then the kits.

The product page (section 5) keeps its structure but the first editorial band
under the widget is now **"Part of the system"** with the TURN diagram and the
sentence used in the product copy: "Every assembl / living piece shares one
connection: the assembl TURN, a quarter-turn key on a 42 mm grid." The copy is
live in all 57 drafts as of this addendum.

### 11.3 What "cool and funky" means, specifically

- **Composition:** parts shot at playful angles, stacked, leaning, in use (a
  pod clipped to a bag strap in motion; a cam on a wharf post; the rod packed
  in a pocket). Not front-on product shots on seamless.
- **Colour:** two dayrally colours per frame, never more; the accent colour
  does the lettering and one other part (a lid, a knob, a charm).
- **Type:** Instrument Sans at display sizes with tight tracking, sentence
  case, lowercase line names. One line of Plex Mono under each image with the
  fact: `pod, standard · tomato / butter · 128 × 72 × 45 mm`.
- **Motion:** parts assemble on scroll (the brand sequence), the pod lid lifts
  to show the insert, the shutter disc turns to open. Nothing bounces, nothing
  loops.
- **Avoid:** glossy renders, drop shadows, gradients, mascots, stickers,
  "limited drop" language, AI-art textures.

### 11.4 New pieces to design for

The two dayrally lab items added today need a page each, designed in the
dayrally register, with the honesty line (unprinted, no price):

- **dayrally cam** (`/living/widget/lab-dayrally-cam`): hero is the camera on
  its cradle on a bag strap; a second frame shows the back open with a roll of
  120 going in; a third shows the skin choices (plain, dots, waves, name).
  Renders to work from: `docs/living/renders/cam-exploded-ink-tomato.png`,
  `cam-body-ink.png`, `cam-skin-sky-waves.png`, `cam-cradle-butter.png`.
- **dayrally rod and wharf reel** (`/living/widget/lab-dayrally-rod`,
  `/living/widget/lab-wharf-reel`): hero is the packed rod in a jacket pocket
  next to the reel; a second frame shows the four sections sliding out of the
  grip. Renders: `rod-packed-lime.png`, `rod-wharf-reel-tangerine.png`,
  `rod-saddle-mint.png`.

### 11.5 Shopify specifics (Horizon theme)

The store runs Horizon. Build the dayrally landing as a page template with
these sections, in order: a full-bleed colour hero (one dayrally colour, promise
line, TURN diagram), a "pick a pod" product grid filtered to `productType:
dayrally`, a "kits" grid filtered to the dayrally kits, a "how it clips" band
(three mounts, one sentence each), the lab items band (cam, rod, reel, marked
unprinted), and the honesty footer. A pasteable Custom Liquid block for the
hero is in `docs/living/theme/dayrally-hero.liquid`; the rest are
stock Horizon sections configured in the theme editor.

### 11.6 The dayrally board, now in hand (20 October)

Kate shared the original board. This is the register for every dayrally surface; the storefront is
measured against it.

**Wordmark and voice.** `dayrally` in a heavy, soft, geometric rounded face, all lowercase, tomato red,
huge. Under it, in black: "go make a day of it." Then the small mono line "POWERED BY ASSEMBL". The
sub-lines are two-tone: "dayrally **fish**", "dayrally **everyday**", "dayrally **ride**", "dayrally
**explore**", the second word in the line's colour (red, lilac, black, blue). Taglines are plain and short:
"Tackle kits, measuring tools and on-the-go organisation." "Tools and spares for bikes, scooters and more."
The footer carries the honesty line already: "PROTOTYPE COLLECTION · CONCEPT VISUALISATIONS" and "NOT
MANUFACTURED OR TESTED PRODUCTS". Keep both, verbatim in spirit.

**Scene.** Warm cream rock and sand, hard sunlight with soft shadow, products at a low three-quarter
angle, a few of them open. Props are the kit's own parts: rulers printed with their scale, a line spool,
soft baits, name slates. No studio seamless, no grey.

**Product forms the board shows (and our pods do not yet have).** A bento-proportioned pod with a
*hinged* lid that opens like a lunchbox, a contrasting latch button on the front, a rope lanyard loop on
the end, a debossed `dayrally` on the lid, and a *name slate*: a rounded tab in a second colour with the
name or `dayrally` raised on it (JACK on red, MILA ♡ on lilac, dayrally on butter), which the exploded
diagram calls **03 skin** and labels "interchangeable colours and designs". **02 core** is the
compartment insert ("choose your contents"), **01 mount** the pod base ("clip, strap or carry your way").
Our v0.3 pods are stadium pods with lift-off lids on two TURN keys; the board's pod is a different object.
That gap is the next CAD build: **pod v3**, a printed pin-hinge bento lid, a snap latch button, a lanyard
loop, and a slate slot on the lid that takes the name slate, on the same TURN floor so every mount still
fits. Until it exists, the storefront shows the v0.3 pods honestly and the board as concept.

**The phone flow.** "what's your day?" above a two-up kit chooser (fishing, everyday) and four icon chips
(riding, beach, exploring, custom); "make it yours" with six round swatches (red, butter, chalk, lilac,
blue, ink); a single text field "Add a name or text…"; one full-width red button "create my kit ✨". This is
the widget's home page on dayrally: the chooser is the collection, the chips are the kits, the swatch row and
text field are the widget. Build the storefront in that order.

**Feature row.** Four icons with mono titles and one-line Sans copy: AI POWERED CONFIGURATION ("Tell us
what you're doing. Our AI helps you build the perfect kit."), CUSTOM COLOURS & PERSONALISATION, 100% 3D
PRINTED DESIGNS, DIRECT TO YOUR DOOR. Keep all four; the first one is honest only when the Space Studio or
the DO assistant actually drives the chooser, so on the Shopify page say "tell us your day" and link the
assembl studio rather than claim AI on a static page.

**Palette as the board uses it.** Tomato red is the brand colour (wordmark, button, the fish pod). Butter
is the lid colour on red. Lilac with a red latch is "everyday". Black with a butter slate is "ride". Blue
and orange is "explore". Cream sand is the ground. Never more than two product colours per object.

**Colour note for the store.** The board's reds and yellows are product and campaign colour; assembl's
UI chrome (buttons on assembl pages, pills, mono labels) stays in the paper-and-plum canon. On the Shopify
dayrally pages the red button is allowed: it is the board's button.

**Also liked:** the "Ultimate Modular Hobby Toolbox" on MakerWorld (orange and grey stackable crate with
lattice walls and clip latches). Reference only, licence unchecked: the idea to take is stackable crates
with clip latches in the dayrally colours, as a larger "01 mount" for the Gear wall and the car boot.

The renders in section 8 and 11.4 remain real geometry, labelled renders. To get to the board's look
before anything is printed: pod v3 first, then photoreal renders fed with the real STLs and the prompt in
section 8, scene-matched to the board (cream rock, hard sun, low angle).

### 11.7 The ride line, the hero pod and the font (20 October, later)

Kate's direction, verbatim in spirit: a really cool, funky pod as the main part, because the lock key is what
carries through every component; something that can go viral with teenagers, real fun, but premium and not a
colour blot; a watch mount and an iPhone mount; a hardy outdoor pod like the Janberry container; handle
grips, because bikers are printing them now.

**What now exists (digitally):** `DAYRALLY-RIDE.md`. The hero pod v3 named in 11.6 is built: hinged bento lid,
accent latch button, TPU gasket, lanyard loop, name slate, `dayrally` in the lid, two-key TURN floor. Around
it: TPU grips (waves, dots), an Apple Watch cradle that is also a charging dock, a phone mount, a bottle cup
that is also a pen cup, and a crank stand that is also a phone stand. Every one locks to every mount. Renders:
`docs/living/renders/ride-pod-tomato.png` (exploded, with the slate and pins), `ride-pod-lilac-closed.png`
(JACK on a tomato slate), `ride-grips-lime.png`, `ride-watch-sky.png`, `ride-phone-ink.png`,
`ride-bottle-tangerine.png`, `ride-stand-mint.png`.

**The font.** Fredoka 700 (OFL) is the dayrally display face, ADR-011. Use it for the wordmark, the slates, the
kit names on the storefront hero and the "go make a day of it." line. Everything else stays Instrument Sans.
On Shopify (Horizon) load it from Google Fonts in the theme's custom CSS for the dayrally template only.

**"Viral with teenagers, premium, not a colour blot."** This is the register for the ride line's pages and
film:

- One hero colour per frame, one accent. The accent is always the thing you touch: the latch, the slate, the
  slider tab, the pawl. Tomato on lilac, butter on cobalt, ink on lime. Never three colours on one object.
- The name is the hook. The slate is swappable, the text field is the first thing on the page, and the
  render shows a real name, not "NAME". Teenagers share things with their name on them.
- Show the trick, not the product: the lid swinging open, the slate popping off with a thumbnail, the pod
  clicking onto the bar saddle and then onto the Grid at home, the watch cradle going from bars to bedside,
  the phone dropping into the channels and the slider clicking in. Ten-second vertical cuts, each one trick,
  shot on the bike and the desk, not on seamless. Real STL renders until the first print; then the real
  parts, scratches and all.
- Premium is in the restraint: paper and cream backgrounds, the Plex Mono fact line under each image
  (`ride pod · tomato / butter · 128 × 84 × 54 mm · splash-proof, untested`), no stickers, no drop-shadow
  3D text, no "limited drop", no AI-art textures. The honesty line stays on every frame that shows an
  unprinted part.
- The grips are the entry point: cheap, a pair, two textures, a colour, closed with the bar-end plug (plain
  today; a plug with a TURN keyway so a charm or a bead locks into the bar end is the next small build). That
  is the thing a 14-year-old prints first and shows their mates; the pod is what they ask for next.

**Pod form, hardy outdoor.** The Janberry container is a screw-lid cylinder with an O-ring, honest about
being dust- and splash-proof. Our pod is a hinged bento with a compressed TPU gasket and will not be called
waterproof until it has been under a tap. If the first print leaks, the next pod is a screw-lid round pod on
the same TURN floor, which the cast rod's thread code already knows how to cut.

### 11.8 "Here is my look": the second dayrally board (20 October, later still)

Kate sent a second board, `docs/living/boards/dayrally-look-20261020.jpg`. It is AI-generated concept art,
not a photograph of anything that exists, and it is now **the register for dayrally**: the first board (11.6)
gave us the pod, the slate and the phone flow; this one gives the colour, the voice, the kit structure and a
component library. Where the two boards differ, this one wins.

**Wordmark and lines, verbatim.** `dayrally` in the heavy rounded face (Fredoka 700 is our licensed
stand-in), yellow, with a small rounded-rectangle "key" glyph after it. "one system. endless days." in
tomato. "Modular 3D printed accessories that click together and go wherever you do." Five activity icons
with lowercase labels: **ride · explore · everyday · pet · camp** (pet and camp are new). Three kits, each
with a line: **ride kit.** "mount it. move it. go further." **everyday kit.** "clip it. organise it. make it
yours." **explore kit.** "take good things further." And a library strap-line: **components library.** "Mix,
match and make it yours. All 3D printed. Designed for real days."

**Palette.** Sun yellow (about `#F5C400`), tomato (`#E8472B`), black, cream (`#EFE6D6`), with white. Four
colours on the whole board, never more than three on one object. This is a deliberate collision with the
company rule (no canary on assembl company surfaces, `assembl-brand-system.md`). The resolution: **sun is a
dayrally colour, scoped like Fredoka.** It appears on dayrally product, pages and film and never on an
assembl company surface. Add `sun` to the dayrally colour set in the manifest beside butter (butter stays
for the softer lids). Kate's call to confirm; until then the renders keep using butter.

**"dayrally do."** The phone shows the app: `dayrally do.` as the wordmark, "Plan. Build. Print. Go.", a
"Customise your kit" row of three builds, one yellow button "Generate & Print", then "Choose your activity ·
Customise & print · Your kits · Saved builds" and a tab bar Home · Create · Kits · Profile. This is the DO
family name on the dayrally flow, which is right: the widget is the "Customise & print" screen, the kits are
"Your kits", the activity chooser is the collection. "Generate & Print" is honest only when a build produces
the real print files (it does: the widget's part sheet) and never claims a printer is running.

**The kits as the board draws them, against what exists.**

| Board | Exists in v0.3 (file) | Does not exist yet |
|---|---|---|
| ride kit: action cam mount, light mount, phone mount, multi-angle joint | phone mount (`ride-phone-*`), bar saddle, watch cradle, grips, bottle cup, crank stand | action cam mount (GoPro three-finger), light mount, multi-angle joint |
| everyday kit: bag clip, ID tag, mini case, cable tidy | strap clip (`dr2-mount-strap-clip`), bag tag (`dr-bag-tag`), pod mini (`dr2-pod-mini`), cable winder (`dr2-cable-winder`), the ride pod (`ride-pod-*`) | a true clip-on bag clip (carabiner-style), the case-with-a-window photo tag |
| explore kit: bottle mount, photo tag, strap loop, device holder | bottle cup (`ride-bottle-cup`), strap clip, phone stand | photo tag, device holder (a generic cradle with a strap) |
| pet, camp | nothing | a collar mount for a tag or light; a tent/pole clamp, a lantern hook |

**The components library is the real news.** Twelve small parts: universal key, base mount, angle joint,
tube clamp (bars and poles), flat mount, swivel joint, swipe joint, clip mount, device holder, mini case,
panel, end cap. They are all roughly 25 to 30 mm cubes with a round socket and a key, in yellow, red, black
and cream, and they chain: base mount → angle joint → device holder. That is the TURN at gadget scale, and
the TURN as it stands is too big for it (42 mm pitch, 13 mm bore, 22 mm chamber). The honest next build is
**TURN mini**: the same push-and-quarter-turn key at half scale (21 mm pitch, about 7 mm bore, 11 mm
chamber), so a 26 mm cube carries one keyway on each face, a "universal key" joins any two cubes, and the
joints (angle, swivel, swipe) are cubes with a second axis. A mini-to-full adapter (one full keyway on a
60 × 42 flange, mini keyways on top) lets the cube chain lock onto a pod floor, the bar saddle and the Grid.
That keeps Kate's rule, the lock key carrying through every component, true from the Grid board down to an
action cam. Everything in the library then becomes a cube in the manifold pipeline with the same fit tests
as the pods. Not started; it is the next CAD build after the keyed bar-end plug.

**Composition and scene.** Hard sun, blue sky, cream rock and sand, a mountain bike, the sea in the explore
panel. Products in use and at a low angle, open kits spilling parts, the character (a long-haired dachshund
in a helmet and sunglasses, with a harness-mounted cam) as the recurring face. Keep the character: it is the
line's mascot and it photographs the "pet" kit for free. It is an illustration; never claim it is a real
dog wearing real parts until a part exists and a dog has worn it. Keep the honesty footer from 11.6 on every
frame.

**What changes in the storefront plan (11.5).** The hero is sun yellow with the wordmark and "one system.
endless days."; the kit grid is ride / everyday / explore with the board's three lines; the activity chips
gain pet and camp (greyed, "coming"); the components library becomes a band of its own once TURN mini
exists, and until then shows the mounts that do exist with the honesty line.

