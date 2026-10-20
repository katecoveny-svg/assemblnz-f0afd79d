# Shopify setup, 20 October 2026 — what is done, what is waiting, what Kate does

**Store:** `sihze0-nj.myshopify.com` (name still "My Store"; the API cannot rename it, see below). All 57 products
remain **drafts**. Nothing is published, priced for sale or printed. This note is the record of the evening's
setup so the next session, or Kate, can finish it.

## Live site links (production, main deployed)

- Lab index of everything designed this week: https://www.assembl.co.nz/living/widget
- The ride pod: https://www.assembl.co.nz/living/widget/lab-dayrally-ride · grips `lab-ride-grips` · watch
  `lab-ride-watch` · phone `lab-ride-phone` · bottle `lab-ride-bottle` · crank stand `lab-ride-stand`
- TURN mini: https://www.assembl.co.nz/living/widget/lab-turn-mini · `lab-mini-ride` · `lab-mini-explore`
- The bike set: https://www.assembl.co.nz/living/widget/lab-ride-rack
- The print files (every one, hashed): https://www.assembl.co.nz/living/cad/v0.3/manifest.json and the STLs
  beside it. Renders (after PR #1637): https://www.assembl.co.nz/living/renders/bike-set-sun.jpg and the rest.

## Done in Shopify tonight

| What | Where | State |
|---|---|---|
| Six automated collections by product type, with copy in the dayrally / living voice | `dayrally`, `ride`, `grid`, `stack`, `renter`, `room-kits` | created; they fill as products are published |
| A copy of the Horizon theme for the dayrally look | theme `Horizon · dayrally draft (assembl, 20 Oct)`, id 166610305110, **unpublished** | holds `sections/dayrally-hero.liquid` (sun band, Fredoka 700 wordmark, "one system. endless days.", the TURN key turning once, "click · lock · change · go") and `templates/page.dayrally.json` (hero, a "pick a pod." product list from the dayrally collection, the page body) |
| The dayrally landing page | page `dayrally`, template `page.dayrally`, **unpublished** | body carries the promise and the honesty line |
| Product descriptions (earlier today) | all 57 drafts | the TURN sentence, the family sentence, what fits, how it is made |

The live Horizon theme is untouched: the API tool refuses writes to the published theme, which is the right
safety. Kate previews the draft theme and publishes it when it looks right.

## Waiting on PR #1637 (renders served from the site)

Once `/living/renders/*.jpg` is live, the next session (or the check-in) adds the sun-look renders as the
first image on the dayrally products and the six collections:

| Product(s) | Image |
|---|---|
| al-pod-mini | sun-pod-mini-butter-name |
| al-pod-standard, al-pod-tall, al-pod-long | sun-pod-standard-sky-waves, sun-dayrally-everyday-flatlay |
| al-bag-charm, al-zip-pull | sun-charm-star-tangerine |
| al-number-plate, al-bar-saddle, al-frame-saddle, al-bar-end, kits ride and scoot | sun-number-plate-lime, bike-set-sun, bike-toptube-sun |
| collection dayrally | bike-set-sun · collection ride | bike-toptube-sun · grid | board-4x4-chalk · stack | stack-nodes-ink · renter | teen-room-flatlay · room-kits | vanity-cutout-sage |

Mechanism: `productUpdate(media: [{ originalSource, alt, mediaContentType: IMAGE }])` then
`productReorderMedia`; `collectionUpdate(input: { image: { src } })`. Alt text names the render as a render.

## Kate's part (the API cannot or should not)

1. **Store name.** Settings → Store details: "My Store" → "assembl / living".
2. **Theme.** Online Store → Themes → the draft copy → Customize → preview `/pages/dayrally`; set the
   draft theme's fonts to Instrument Sans for body and Fredoka only where the hero uses it; publish when happy.
3. **Page.** Online Store → Pages → dayrally → Visible, and add it to the main menu as "dayrally".
4. **Products.** Stay drafts until a test print passes (ADR-010). Publishing is Kate's call, product by
   product, after the first prints.
5. **Lab items** (cam, rods, ride line, TURN mini, bike set) are deliberately not in Shopify. They live on
   the site's widget with no price until printed.

## Are the CAD files real? Yes, all of them

- 184 print files in the manifest, 184 served from `/living/cad/v0.3/` with SHA-256 hashes (PR #1637 added
  the dayrally pods, lids, inserts, mounts, charms, bike spares and the fold shade to the public pack; they
  were on disk but not published).
- Every one of the 57 Shopify drafts (40 products, 17 kits) resolves to its print files, checked by
  `app/living/shop/catalogue.test.ts` and by the reconciliation run tonight (57 of 57).
- Every lab item (cam 14 files, rod 9, cast 14, ride 20, mini 20, rack 3) is built the same way, with digital
  fit tests in `tools/living-cad/parts/fit-tests-*.json`.
- What is not yet true: none of it has been printed. The honesty line stays on every surface until it has.
