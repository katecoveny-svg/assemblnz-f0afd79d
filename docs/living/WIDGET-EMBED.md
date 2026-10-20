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

## Where it comes from

Kate's 16 and 17 October chats set the brief: a customer (her daughter, say)
opens the store, picks a package such as "assemble my desk", makes it hers
in a widget, and the order goes to a print partner by API, with assembl
owning no printers. That chat prototyped a theme widget with GLB previews
inside its own sandbox; none of it reached this repository, so this widget
is the first one in the codebase. What it keeps from the brief: real
choices, a live preview, estimates before purchase, kits as one package,
and a print sheet a partner can act on. What it declines: AI-generated
geometry and any claim that a print API exists today (see
`LAUNCH-OPERATIONS-20261019.md` §5 for the two-stage print handoff).

## What the customer gets

For any of the 40 manifest products, 17 kits and 18 AC-02 prototypes (`ac02-<view>`) at `/living/widget/<handle>`:

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
- **Kits as one package**: the seven room kits and ten dayrally kits take one
  colour for every line, ask for the name when a line carries lettering
  (the teen room starter's name plate), sum the print files of every line,
  and carry the kit SKU from the launch catalogue (`AL-KTEEROO-CHA`, no
  check letter) plus each line's own SKU in the chosen colour. Only colours
  every line is catalogued in are offered (twelve for dayrally).
- A **schematic preview** (proportions from the manifest, not a render) and,
  for the 23 parts whose v0.3 print file is in the served pack, an opt-in
  **3D view** of the real STL in the chosen colour. Lettered parts show the
  customer's own name on the face, never the STL's modelled sample text.
  Parts whose files are not yet served (most dayrally parts) keep the
  schematic until the pack is extended.
- **Estimates**: print mass, print time at 30 g/h, material at NZD 45/kg,
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
   `Part code`, `Contents` for kits, and a hidden `_assembl_item` JSON
   record with file ids, revisions and hashes), replacing its previous
   inputs;
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

## Lab items

`lab-dayrally-cam`, `lab-dayrally-rod`, `lab-dayrally-cast`, `lab-wharf-reel`, `lab-dayrally-ride`, `lab-ride-grips`,
`lab-ride-watch`, `lab-ride-phone`, `lab-ride-bottle` and `lab-ride-stand` are designed in the v0.3 pipeline (families
`camera`, `rod`, `cast` and `ride` in the manifest, print files served from the public pack) but have never been printed. The
widget treats them like AC-02 prototypes: full choices and estimates, 3D from the served STL, part codes of the
form `LAB-<ID>-<COL>`, `suggestedRetailNzd: null`, `purchasing.status: not_enabled`. The store must not list
them until a test print passes. The list lives in `WIDGET_LAB` in `lib/living/widget.ts`.

## Code

- `lib/living/widget.ts` — spec, choices, text rules, `buildItem`,
  `lineItemProperties`, `printSheet`, iframe message schema. Tested in
  `lib/living/widget.test.ts`.
- `app/living/widget/[handle]/` — the page, the client component and the
  opt-in `PartPreview3D` (three.js STL loader, on-demand rendering).
- `app/living/widget/page.tsx` — index of all widgets with the snippet.
- `public/living/widget.js` — the store loader.
