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

## Sun-look images — done (02:30 UTC, after PR #1637 deployed)

PR #1637 merged and production served `/living/renders/*.jpg`, so the sun-look renders were added as the
first image on the twelve dayrally and bike drafts and as the image on the six collections, per this mapping.
All new media show `READY` with no media errors; the earlier images stay behind them. Products remain drafts.

| Product(s) | Image |
|---|---|
| al-pod-mini | sun-pod-mini-butter-name |
| al-pod-standard, al-pod-tall, al-pod-long | sun-pod-standard-sky-waves, sun-dayrally-everyday-flatlay |
| al-bag-charm, al-zip-pull | sun-charm-star-tangerine |
| al-number-plate, al-bar-saddle, al-frame-saddle, al-bar-end, kits ride and scoot | sun-number-plate-lime, bike-set-sun, bike-toptube-sun |
| collection dayrally | bike-set-sun · collection ride | bike-toptube-sun · grid | board-4x4-chalk · stack | stack-nodes-ink · renter | teen-room-flatlay · room-kits | vanity-cutout-sage |

Mechanism used: `productUpdate(media: [{ originalSource, alt, mediaContentType: IMAGE }])` then
`productReorderMedia`; `collectionUpdate(input: { image: { src, altText } })`. Every alt text says it is a render
and carries the honesty line (concept, not yet printed). Sources were the production URLs, so the store holds
its own CDN copies; re-running the step after a render changes replaces nothing automatically.

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

## Agentic Storefronts (recorded 20 October, later)

Kate asked how Shopify's Agentic Storefronts works. From Shopify's developer docs and terms (the marketing page
could not be read from the build sandbox): Shopify indexes published products into Shopify Catalog and sells
them inside AI assistants over the Universal Commerce Protocol, with Shopify running the checkout and the order
landing in the admin as usual; channels named are ChatGPT, Microsoft Copilot, Google AI Mode and Gemini for some
brands, Meta planned. Checkout is in-chat on Copilot and store-handoff or in-chat on ChatGPT depending on the
report. Eligibility is Shopify's call and shows under Apps and sales channels; launch reports say US-selling
merchants first. Separately and already live on every Liquid storefront: WebMCP browser tools, and Shop MCP
(13 October 2026) for any agent to search Catalog and pay with Shop Pay.

Plan:

1. **Kate:** open Apps and sales channels, note which participating channels the store is eligible for, and read
   the Agentic Storefronts terms for fees. Nothing to switch on while every product is a draft.
2. **assembl, before any dayrally product goes active:** decide how a name travels when an agent buys from
   Catalog without seeing the widget: a line-item property the fulfilment reads, a name variant, or personalised
   items stay store-only. Record the decision in `docs/factory/DECISIONS.md`.
3. **assembl:** product data is all an agent sees. Titles, descriptions, images and policies get a pass before
   the first products are set active; the honesty line stays.
4. Drafts never reach Catalog, so the ADR-010 rule (nothing listed until a test print passes) also keeps lab
   items out of every AI channel.

Sources: shopify.dev `docs/agents`, `docs/agents/carts-and-checkout`, `docs/api/web-mcp`, the Shop MCP
changelog of 13 October 2026, and the Agentic Storefronts Supplemental Terms.

## 21 October: the deep plum, applied to the draft theme

Kate asked for the black in the dayrally branding to become the assembl deep plum, then to check the store and
update it to match. On the draft theme `Updated copy of Horizon · dayrally draft` (id 166614073430, **unpublished**):

- `sections/dayrally-hero.liquid`: type, button and the TURN diagram in deep plum `#240B21`; band from the section
  setting, default `#FFD200`.
- `config/settings_data.json`, the theme palette: foreground `#000000` → `#240B21` (text, primary buttons, selected
  variants, drawer text); `color1` `#333333` → visible plum ink `#492B3E` (inputs); `color2` `#DFDFDF` → a plum-tinted
  line `#E3DBE0` (borders); background `#ffffff` → the dayrally white `#FFFDF8`. The `Horizon` preset block is left
  as shipped. Fonts stay `inter_*`; Kate sets Instrument Sans and Fredoka in the theme editor (step 2 above).
- `templates/page.dayrally.json`: the band `#F5C400` → `#FFD200`, matching `templates/index.json`.
- Fish kit (`al-kit-dayrally-fish-kit`): the open tackle pod render (`pods-fish-corrected-20261021.jpg`) added as the
  first image, in front of the plain pod it showed before.

The live Horizon theme is untouched, every product stays a draft, nothing is published. The ink filament and the
"Ink" colour option stay: they are print colours.

## 21 October, later: the keeper draft is "dayrally · Rally adventure (Codex 20 Oct)"

Kate: "if you look at the other draft it is looking pretty good." That draft (theme id 166614794326, **unpublished**)
is a full custom dayrally home: its own navigation and footer sections, a hero with the wharf film and a coastal
poster, an activity bar (ride, fish, everyday, pet, camp, capture), the four pods with the contents renders, a day
planner with tabs, the rally section on the moodboard, a sign-up, all styled by `assets/dayrally-rally.css` with
Fredoka 700 bundled as `assets/dayrally-fredoka-700.ttf`. It is the one to carry forward; the Horizon copy with the
hero section (166614073430) stays as a fallback.

The deep plum applied there the same way:

- `assets/dayrally-rally.css`: `--dr-ink` `#171914` → `#240B21`; `--dr-sun` `#ffdb05` → `#FFD200`; button hover
  `#34372e` → `#3A1A35`; the six warm greys used for quiet copy → muted plum `#654A4E`; the seven hairline greys
  → `#E3DBE0`; the caption and card shadows tinted plum; the focus ring `#1260b7` → deep plum. Sun tints, stage
  neutrals and the paper white are unchanged.
- `config/settings_data.json`: foreground `#171914` → `#240B21`, inputs `#41433D` → `#492B3E`, borders `#DDDCD5` →
  `#E3DBE0`; the `#FAF9F5` background kept.
- `sections/dayrally-hero.liquid` and `templates/page.dayrally.json`: the plum hero with the `#FFD200` band, so
  `/pages/dayrally` matches the home.

Live theme untouched, products still drafts, nothing published. To publish: Online Store → Themes → the Rally
adventure draft → Publish.

