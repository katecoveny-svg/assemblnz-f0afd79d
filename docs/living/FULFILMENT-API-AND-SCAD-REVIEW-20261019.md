# Review — the "single API dropshipper" research and the OpenSCAD sketches

**Status: assessment. Nothing from the reviewed transcript has been added
to the parts library or the store.** 19 October 2026.

Kate forwarded a transcript in which another assistant researched 3D-print
fulfilment APIs, proposed an architecture for dayrally, and wrote OpenSCAD
for a box, a telescoping rod, a pinhole camera and a grid insert. This note
says what checks out, what does not, and what to keep. Kate's own
clarification came with it: **assembl does not copy Gridfinity; it makes
its own, more stylish storage variation.** That is now recorded in the
licence register and ADR-009.

## 1. Fulfilment APIs: claims against what can be verified

| Provider | Transcript's claim | What a check on 19 Oct shows (*to confirm with the vendor*) | Verdict for assembl |
|---|---|---|---|
| **3DAPI** (dapi.digital) | global vetted print-farm network incl. NZ, $10 worldwide shipping, 4.5-day average, Shopify via ShipStation/Shippo | Homepage: 10% commission, $10 flat worldwide shipping, connect Etsy or Shopify. Network page: 110 printers in Oceania (Australia, New Zealand). Network page also says the print network is **closed to new partners** (that wording is about print farms joining; whether sellers can still sign up needs asking). No ShipStation mention found. | **Strongest new candidate for an API route with NZ printing.** Add to the print-partner shortlist beside 3DPrintIt and Treatstock; ask three questions: can a seller join now, which NZ farm prints, what filaments and colours. |
| **Slant 3D / Teleport** | 1,000+ printers, Shopify plugin, dropship | US farm; Shopify app at USD 9/month plus per-print cost; ships worldwide "under five days" by their claim; beta FDM API; the Shopify app has two reviews. No NZ delivery times or duties found. A different "Teleport" shipping app exists; do not confuse them. | Scale option later. For NZ customers every parcel is an international one with duties; not the pilot. |
| **Shop3D** | Shopify-native, white-label, REST API | Shopify app; focus on small items. | Checked earlier; unverified for our sizes. Skip for now. |
| **Craftcloud** | aggregator of 150+ services via one API | Aggregator with instant quotes; no public API documentation found earlier. | Quote comparison, not an order route. |
| **Makr3D** | ~100 Bambu printers in the UK, multi-colour 3MF, public API | UK. | Wrong hemisphere for NZ customers. |
| Printie | (not in this transcript) | US facility only. | Retired earlier. |

The transcript's own point stands and matches our brief: for NZ customers a
**local print farm** beats China or the US. The honest plan is unchanged:
first sample orders by hand with an Auckland bureau, then a small batch
handoff (`LAUNCH-OPERATIONS-20261019.md` §5), with 3DAPI added as the one
API-first option worth a direct enquiry.

## 2. Architecture: already built, mostly

| Transcript proposal | assembl today |
|---|---|
| Shopify 3D configurator app (BeeGraphy, Zakeke) | not needed: `/living/widget/<handle>` is the configurator, embedded by `public/living/widget.js`, with real manifest choices, estimates and a print sheet |
| a middleware "orchestrator" that turns an order into a print job | the two-stage handoff in `LAUNCH-OPERATIONS-20261019.md`: manual now, a webhook-to-batch-order service once v0.4 passes; the print sheet (file ids, revisions, hashes, colours per role) is its payload |
| 3MF not STL, to carry colours and part names | agreed for multi-colour parts; the manifest records STL hashes today; add 3MF export to the pipeline when the first two-colour part is released |
| "AI concierge" parsing "I'm going fishing at the river" into a kit | Shop DO already parses briefs deterministically with no model (`lib/do/shop/journey.ts`); the same pattern can map a sentence to a dayrally kit and a name, labelled *proposed*, never *AI-designed* |
| print-in-place multi-colour lettering | already how the name plate, tags and lid inlays work in v0.3 |

## 3. The OpenSCAD sketches: a code review

These are useful as idea sketches. None should be printed as written.

| Sketch | What is wrong | What it would take |
|---|---|---|
| **Base and lid** | `minkowski` with a sphere makes rounded shells, fine but slow to render; the lid's "hinge nub" is a floating cylinder with nothing to mate to; the base's hinge cut-out is a bare slot; no lip or clearance between lid and base, so they cannot seat. | A proper lip, a pin hinge with a real clearance, and a latch. The v0.3 dayrally pods and the AC-02 case already have these; a new box is not needed. |
| **Telescoping rod** | three 90 mm tapered tubes with 0.4 mm clearance and 1.75 mm walls; the tip tapers to Ø3 with a Ø1.5 bore, which will not print in PETG; no stops, so sections pull apart; no guides; 270 mm long when extended. The transcript's own warning is right: PLA snaps. | A display miniature or a toy. A fishing rod needs a carbon or fibreglass blank; the honest printed product is the **handline winder** already in the library, plus rod cradles. |
| **Pinhole camera** | a Ø0.3 mm hole cannot be printed cleanly (the transcript's foil-and-pin advice is right, so the hole in the model should be larger with a foil recess); the film slot cuts through the back wall leaving no light trap; the shutter disc has a pivot hole but no pivot and nothing holds it to the body; walls of 2.5 mm in black PETG are fine. | Worth doing properly: **a "dayrally cam" with no electronics** is a real product idea that meets Kate's mini-cam brief honestly. Needs a light-trap lip, a foil recess, a captive shutter, and a paper holder sized to a standard photo-paper cut. Design it in the pipeline with checks, then test in a darkroom. |
| **Grid insert** | OpenSCAD variables are immutable; `x_pos = x_pos + x` inside the loop does not accumulate, so every compartment is cut at the origin and the model is wrong. | Cumulative offsets need a `[for ...]` list or a recursive sum. `drawer_tray.scad` now accepts explicit column and row lists done that way. |

## 4. What to keep

1. 3DAPI as the one API-first fulfilment candidate with NZ printing, to
   verify by direct enquiry.
2. The pinhole "dayrally cam" as a product concept, designed properly, with
   the paper, foil and rubber band listed as the "hardware kit" the
   transcript suggests.
3. Explicit column and row widths in the drawer tray (done).
4. The reminder that 3MF should carry colour for two-colour parts.

## 5. What to drop

- Third-party Shopify configurators; the widget exists.
- The rod as a "working fishing rod"; the honest version is a handline.
- Any of the four sketches as print files.
- "AI-designed" or "AI configurator" framing anywhere a customer reads.
