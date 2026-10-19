# Product widget — one product, made yours, inside the store page

**Status: built and tested in this repo; not yet embedded in the live store.
Nothing it does is a sale.** Added 2026-10-19.

The widget is assembl's answer to the "embeddable Shopify customiser" idea
from Greg Isenberg's 15 October 2026 episode (a customiser that shows print
time, material cost and suggested retail before producing a print-ready
file). assembl's version is narrower and more honest: it offers only the
choices the parts manifest actually supports, labels every figure an
estimate, and hands the result to the store's own add-to-cart form rather
than selling anything itself.

## What the customer gets

For any of the 40 manifest products at `/living/widget/<handle>`:

- **Colour** from the product's real colour set (7 living, 13 dayrally).
- **Accent** when a part prints in a second colour (name plate lettering,
  bag tag name, number plate digits, pod lid inlays, charm and zip-pull
  inlays). Defaults to a readable contrast; must differ from the body.
- **Lid** and **insert** for dayrally pods, **shape** for the bag charm.
  Derived from the manifest part ids, so a new lid in CAD appears here
  without UI changes.
- **A name or number** where a part carries lettering, with the limits the
  part can print (12 letters on the plate, 10 on tags and lids, 1 to 3
  digits on the number plate).
- **Quantity** 1 to 20.
- A **schematic preview** (proportions from the manifest, not a render),
  and **estimates**: print mass, print time at 30 g/h, material at NZD 45/kg,
  the proposed retail price, the part code, packed weight. All labelled
  "est." or "proposed".

On its own page it can download a **print sheet** (JSON: files, hashes,
revision, colour per role, orientation, supports) and copy the item
configuration. Inside a store it does neither; the store page owns the
purchase.

## How it attaches to Shopify

One Custom Liquid block on the product template:

```liquid
<div id="assembl-widget"></div>
<script src="https://shop.assembl.co.nz/living/widget.js"
  data-handle="{{ product.handle }}"
  data-mount="#assembl-widget" async></script>
```

`public/living/widget.js` creates an iframe to
`/living/widget/<handle>?embed=1&origin=<store origin>` and listens for
messages from that iframe only. On every valid change it:

1. writes **line item properties** into the page's product form
   (`properties[Colour]`, `Accent`, `Lid`, `Insert`, `Shape`, `Name`,
   `Part code`, and a hidden `_assembl_item` JSON record with file ids,
   revisions and hashes), replacing its previous inputs;
2. selects the matching **Colour variant** by reading `/products/<handle>.js`
   and setting the form's `id` field, so the right SKU and price apply;
3. sets the form **quantity**;
4. re-enables the add-to-cart button. While the item is incomplete (a name
   missing, an accent clashing) the button is disabled with the reason.

It also dispatches `assembl:item` and `assembl:invalid` DOM events for
themes that want to react.

The widget route sends `Content-Security-Policy: frame-ancestors` allowing
`*.myshopify.com`, `admin.shopify.com` and assembl's own hosts, set in
`next.config.ts`. The route carries no site chrome and no concierge panel.

## What the store needs before this goes live

| Item | Why |
|---|---|
| The products published, with the Colour option as `option1` | the loader matches the variant on the Colour value |
| The widget host on `shop.assembl.co.nz` or `assembl.co.nz` | the loader uses its own script origin for the iframe and message checks |
| A theme that honours line item properties in cart and order | Dawn and most current themes do; check the cart template shows `Name` and `Part code` |
| Personalised products priced per variant only | the widget adds no surcharge; a name-lid upcharge would need a separate variant or a product-options app |
| The TURN test kit passed | the canon rule: nothing is for sale until the print fits |

## What it deliberately does not do

- It does not add to cart, read prices from Shopify, or claim stock.
- It does not generate geometry. Names are printed as lettering parts the
  CAD source already defines; the print sheet names the parts, revisions and
  hashes so a partner prints exactly what was designed.
- It does not store anything server-side. The item lives in the cart line.

## Code

- `lib/living/widget.ts` — spec, choices, text rules, `buildItem`,
  `lineItemProperties`, `printSheet`, iframe message schema. Tested in
  `lib/living/widget.test.ts`.
- `app/living/widget/[handle]/` — the page and client component.
- `app/living/widget/page.tsx` — index of all widgets with the snippet.
- `public/living/widget.js` — the store loader.
