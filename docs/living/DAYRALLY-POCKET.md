# dayrally pocket — the small things carried close (Kate's girl range)

**Status: designed and checked digitally on 21 October 2026. Nothing printed, nothing measured against the real
things. Lab items; no price, not listed.** Source: `tools/living-cad/cad/dayrally_pocket.py`.
Build: `python3 tools/living-cad/cad/build_dayrally_pocket.py` (52 files, `pk-*`). Fit checks:
`python3 tools/living-cad/cad/fit_test_pocket.py` → `tools/living-cad/parts/fit-tests-pocket.json`.
Renders: `docs/living/renders/pocket-*.png`. Widgets: `/living/widget/lab-emergency-pack`, `lab-mini-emergency`,
`lab-lip-sleeve`, `lab-charms-2`, `lab-friend-set`, `lab-id-tag`, `lab-id-lid`, `lab-eraser-sleeve`, `lab-pen-g2`,
`lab-pencil-topper`, `lab-id-charm`. Costs and first prices: `COSTING-20261021.md` (re-run with these items).

Kate asked for lip peptide cases, charms, friend sets, mini emergency packs (pimple patches, makeup, tampons or
pads, wipes, hand sanitiser, a bank card, a small power bank, an earbuds case) and 3D-printable stationery
(highlighters, rubbers), and later for a QR code a bystander could scan for allergies and parent contacts. The
reference picture of the sets she likes did not come through; this round is from her words and the product sizes
below, so the sets are ours, not copies.

## What the sizes are from

Every pocket is a published size plus clearance, not a guess, and every one gets checked against the real thing on
the first print. Earbuds: AirPods Pro 2 case 60.6 × 45.2 × 21.7 (AirPods 4 is 50.1 × 46.2 × 21.2; Galaxy Buds3 is
58.9 × 48.7 × 24.4 and wants the next pocket up). Power bank: Anker Nano 5,000 mAh 77 × 36.8 × 25 (the Anker 321
at 97 × 46 × 22 does not fit; a keychain bank at 100 × 47 × 24 does not either). Tampons: a regular applicator
tampon wrapped is about 125–135 mm long, which no pod carries flat; the compact (Compak) kind is about 80 × Ø17 and
is what the pockets take. Sanitiser: a 30 mL bottle stands 75–80 mm and will not go under a lid, so the pockets
take a 15 mL mini spray (about 76 × Ø25) lying down. Lip tubes: rhode peptide 114 × 22 × 21, Laneige 96 × 23 × 23,
Summer Fridays about 120 × 23; a ChapStick-type balm 65 × Ø16. Card: ISO ID-1, 85.6 × 54 × 0.76 (1.0 with a
chip). Eraser: Staedtler Mars plastic 526 50, 65 × 23 × 13. Refill: Parker-style G2, 98.1 × Ø5.8 (ISO 12757-2); a
Pilot G2 refill is 110 long and does not fit this body. Pencil: 7.0 mm across flats, 7.4–7.9 across corners.

## The wide pod

A fifth pod size, **176 × 100 × 40** (the long pod's length, a third wider, 6 mm taller), built on the dayrally2
machinery: same 2.2 mm wall, same two-key TURN floor 42 mm apart, same lids and lip, same thumb notch and lanyard
lug. Every dayrally mount and any Grid board takes it (`fit-tests-pocket.json`: 0 mm³ against every mount and the
board; the keys' 37.562 mm³ is the designed cone clamp). Base 78 g, lid 54 g.

Three inserts, 25 mm tall under 13.8 mm of lid headroom:

- **emergency** — earbuds case, small power bank, a lip balm standing, two compact tampons, a mini sanitiser lying
  down, a patch sachet. Items sit in their pockets with 0 mm³ clash; the bank stands 1.2 mm proud, the balm and
  sanitiser more, all under the lid. A wipes sachet (about 110 × 80 × 3) rides on top under the lid.
- **makeup** — a Ø58 compact, a mascara lying along the top, a balm, two pencils, a mini spray, hair ties.
- **open** — two deep bays; a folded pad (about 80 × 95 × 10) fits one.

**The card lid.** A bank card does not fit flat beside the rest, so it rides in the lid: two rails inside hold it
against the lid's inner face, a stop at the far end, slid in from the thumb-notch end. 0 mm³ card-to-rail clash,
0 mm³ lid-to-insert clash. The rails print as part of the top-down lid; their 1.4 mm lips are the only overhang.
The same rails fit the standard lid, so the **mini emergency kit** is the standard pod with its card lid and an
emergency insert (a compact tampon, a balm, a mini sanitiser, patches, hair ties).

## Lip sleeve, charms, friend set

- **Lip sleeve**: 93 × 28 × 27, the tube 70 % covered and 30 % proud, a thumb scoop in the back at the open end, a
  ring loop at the closed end, the name inlaid flush on the front (the bed face). 18 g.
- **Charms, second set**: bow, cherry, moon, butterfly, smile; 4 mm thick, a ring hole each. The bow takes initials
  inlaid, the smile carries its face as the inlay; cherry, moon and butterfly have no flat room for two letters and
  stay plain. About 2.5 g each.
- **Friend set**: one 54 mm heart split on a wave into two halves with 0.35 mm between them, a ring hole at each
  shoulder, one initial each. The halves do not overlap (0 mm³). Print the two in two colours.

## The id tag, the id lid and the id charms

Three ways to carry the same code: the **id tag** (64 × 38, the code beside SCAN), the **id lid** (the mini pod lid
with the code beside the name) and, since Kate asked for it prettier, the **id charms**: the code inside a heart,
star, bow, round or tag shape, about 50 mm across, 4 mm thick, a ring hole, printed code-side down so the code is
the flush inlay on the bed face.

**The styled code.** `qr_cs(text, module, error, style, mark)` draws the same QR three ways: `square` (the plain
one, on the tag and lid), `dots` (every module a round dot, the three finder patterns redrawn as rounded rings)
and `rounded`. A styled code has a 7 mm mark in the middle, the TURN key glyph, and clearing the middle forces the
code to error level H, which forgives 30 % of the modules, so it still reads with the mark there. Phones read
dot-style codes as well as square ones as long as the dots are at least 1.0 mm and the contrast holds, so the rule
in the widget copy stands: **dark code on a light body scans best**; a light code on a dark body also reads;
pale-on-pale does not. The first print tests the dots at 1.0 mm the same way as the square tag (15 cm, sun and
shade) and moves to 1.2 mm if a phone hesitates.

**What the customer picks in the widget, and what they do not.** The widget picks the shape (five), the body
colour and the accent colour (the code is the accent inlay, the shape the body), and the name where a piece has
one. The widget does **not** take the emergency details. It reserves a token for the piece, prints that token's
code, and the details are entered afterwards on the owner's page, from a private link in the order email. The
reasons: the widget is a public page and a basket is not a safe place for a child's allergies and a parent's
phone; the details change (a new contact, a new medication) and must change without a new print; and the code
should be dead until the parent fills the page, not live with half-entered data.

**The owner page, as proposed (sample at `/living/id/SAMPLE`, labelled proposed; no live tokens exist):**

1. Ordering a tag, lid or charm reserves a token (`assembl.co.nz/i/<token>`, six characters, random) and the
   code printed is that token's. Until the parent fills the page, scanning it shows "This tag is not set up yet."
2. The order email carries a private edit link (`/living/id/<token>/edit?key=<edit key>`); the edit key is longer
   than the token and is never printed. The parent fills in: first name, allergies, medical notes, up to two
   contacts, and an optional note ("ask for Mum first"). Every field is optional; what is left blank is not shown.
3. The public page shows only those fields, with a "call" button on each contact, no surname, no address, no
   school, no photo unless the parent adds one, and no indexing.
4. An optional second layer behind a four-digit PIN the parent sets, for a known helper (a coach, a friend's
   parent): a fuller medical note, a third contact, an address.
5. Edit or revoke at any time from the same link; revoking issues a new token, so the old code goes dead and a
   new inlay is printed (a charm is a NZ$ few; the pod lid's code is its own small inlay).
6. Privacy Act 2020: personal information about a child, collected from the parent for one stated purpose, held
   by assembl, a privacy statement on the edit page, deletion on request, no other use, no analytics on the public
   page beyond a scan count the parent can see.

What is built: the sample page under `/living/id/[token]`, which only answers to `SAMPLE` and shows the layout
with placeholder fields. What is not: the token store, the edit page, the PIN layer, the email. None of it lists
until the page exists and a printed code has been scanned.

### The square code (tag and lid)


A QR code inlaid flush, 25 × 25 modules at 1.0 mm (level M), on a 64 × 38 tag beside the word SCAN, and in the
top of the mini pod lid beside the name. The address is upper-case so the code stays in QR alphanumeric mode and
small; it points at `assembl.co.nz/i/<token>`, a page the parent controls. **The code in the files is a SAMPLE**
and is not a live page; the real code is generated per order from the owner's token, the way the name inlays are
generated from the name.

What the page should be, before any of this lists (proposal, not built):

- A short random token per tag (six characters, 2 billion combinations), never a name or a sequence; the page is
  not indexed and not linked from anywhere.
- The parent chooses every field that shows: first name, allergies, medical notes, up to two contacts. Nothing is
  shown that was not entered; no surname, no address, no school by default.
- Editable and revocable at any time from the order (a new token means the old tag goes dead).
- Optional second layer behind a PIN the parent sets, for anything they want a known helper to see but not a
  stranger.
- NZ Privacy Act 2020: personal information of a child, collected for one stated purpose, held by assembl; a
  privacy statement at the point of entry, deletion on request, and no use for anything else.
- The first print checks that a 1.0 mm module two-colour inlay scans on a phone at 15 cm, in sun and in shade; if
  it does not, modules go to 1.2 mm (a 30 mm code) before the page is built.

## Stationery

- **Eraser sleeve**: 44 × 27 × 17, takes the 65 × 23 × 13 block with 20 mm showing, a thumb slot in the back
  pushes the rubber up as it wears; name inlaid on the broad face. The rubber is the consumable, the sleeve is
  yours. 0 mm³ block-to-sleeve clash.
- **Pen for a G2 refill**: 116 long, a rounded hexagon 11 mm across with a flat for the name, a tapered nose with a
  Ø3 tip hole, a Ø6.4 bore from the back, a press-fit plug with three ribs (21.6 mm³ designed interference) and a
  loop for a charm. Refill 0 mm³ clash. Not a click pen. Printed stationery that sells is mostly G2-refill pen
  bodies (Etsy, £11–31), which is why this one comes first.
- **Pencil topper**: a Ø12 collar, 7.8 mm bore, 14 mm deep, with a charm on a neck: star, heart, bow, smile. The
  pencil's corners bite the bore by 0.4 mm³ (press fit); the flats clear. It prints standing, collar down, so
  nothing may start in mid-air: the star sits on a short 45° flare under its two bottom points, and the topper's
  bow turns its loops up (36°) instead of drooping, so they grow from the knot.
- **Highlighters and rubbers themselves** are not printable: the ink body and the rubber are consumables. What
  prints is the thing that holds them and is yours: the eraser sleeve above, and next a snap-on grip sleeve for a
  Stabilo Boss (105 × 27 × 16) and a pencil-pod insert for six highlighters, both measured from a real marker
  before they are drawn.

## What the first print should tell

1. Does the earbuds case, the Nano bank and a compact tampon each drop into its pocket and lift out with a
   finger (the scoops are on the +x side of each pocket)?
2. Does a bank card slide between the rails and stay there when the lid is upside down, and does the lid still
   close over the emergency insert?
3. Does the lip tube sit without rattling and push out with a thumb?
4. Does a 1.0 mm-module QR inlay scan? At what distance, in what light?
5. Does the G2 refill tip sit 2 mm proud of the nose and does the plug stay in?
6. Does the pencil topper hold on a sharpened pencil after a week in a bag?
7. Do the friend halves register and come apart by hand?

## Lineage

Pods, lids and inserts are dayrally2's; the wide size is new. The card-in-lid rails, the split-heart friend set
and the QR-in-the-lid are assembl's own. Everything here is proposed and unprinted.
