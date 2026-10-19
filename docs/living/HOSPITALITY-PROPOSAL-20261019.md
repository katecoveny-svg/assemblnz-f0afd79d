# assembl / stay — hospitality line, laundry and caddy supply, Shop DO connection

**Status: proposed. Nothing here is built, connected, printed or for sale.**
Research date 2026-10-19. Web findings come from search summaries, not from
reading the vendor pages directly (the build sandbox could not fetch them);
every figure marked *to confirm* must be checked against the vendor before it
is relied on.

This brief answers four questions Kate asked on 2026-10-19:

1. What is actually happening in the Shopify store?
2. What should the holiday-home / Airbnb line be called?
3. Can the same store run laundry sets on a dropship API, book laundry
   collection through an API, and supply the products that fill the caddies?
   Should it work that way, or should assembled kits be sent to Kate to on-send?
4. How does it connect to DO?

---

## 1. Shopify store: what is loaded, and what it means

Read-only inspection of the connected store via the Shopify Admin API on
2026-10-19 (no writes were made).

| Fact | Observed |
|---|---|
| Store | "My Store", `sihze0-nj.myshopify.com`, Basic plan, NZD, New Zealand |
| Products | 57, **all `DRAFT`**, vendor `assembl living` |
| Created | 2026-10-19 17:33 to 17:43 UTC, in one batch |
| Source | matches `tools/living-cad/launch/shopify-products.csv` handle for handle |
| Variants | 7 colours (living), 12 colours (dayrally); SKUs such as `AL-B44-CHA-A`, `AL-HK-OAT-8` |
| Product types | dayrally 25 · Grid·wall 11 · dayrally kits 10 · Room kit 7 · Bike 6 · Renter 3 · Stack·furniture 3 · Light 1 |
| Inventory | 0 on every variant |
| Media | none |
| Collections | only the default `Home page` (1 product) |
| Orders / customers | none |

**Reading.** The "loading" is finished. The whole v0.3 launch CSV imported
cleanly in ten minutes and nothing failed. Nothing is published, nothing has
stock, nothing has images, so nothing can be bought. That is the correct state:
the repo's canon (`docs/living/ASSEMBL-LIVING.md`, `SHOP-01-PRINTIE.md`) says
no product may be released until the test-print kit has been printed and the
TURN fit tests pass on real parts, and the site's checkout route still fails
closed with `PRODUCT_RELEASE_REQUIRED`.

Two things to notice before anything is published:

- The 57 drafts are the *parts and kits* catalogue. None of the hospitality
  stations below exist as Shopify products yet, and they should not be created
  until the station designs exist in `tools/living-cad/` and the manifest.
- Every SKU carries the TURN v0.1 part code. If the keyway or detent changes
  after the first print, the codes change too and the drafts must be
  regenerated from the CSV script, not edited by hand.

## 2. Naming

Recommendation: **assembl / stay** for the hospitality line, keeping
"assembl my home" as customer-facing campaign language rather than the
product name.

| Option | For | Against |
|---|---|---|
| **assembl / stay** (recommended) | Matches the existing `assembl / living` and `assembl / dayrally` slash naming. Says "short-stay" to hosts, serviced-apartment operators, motels and holiday parks alike. Reads as a product line, not a slogan. | Needs the slash convention explained once in copy. |
| assembl / host | Speaks directly to the buyer (the host). Good for the reset kit and preparation checklist. | Guests never see themselves in it; "host" in NZ also reads as a web-hosting term. |
| assembl my home | Warm, first-person, works as a tagline for the household makeover offer. | "home" is already the territory of `assembl / living`. Does not signal hospitality. Harder to trademark and search for. |
| assembl / arrive | Beautiful for the arrival station alone. | Too narrow for a bedside or bathroom kit. |

Suggested use together:

- **assembl / stay** — the line (arrival station, bedside, breakfast, bathroom, pet, work-from-stay, host reset).
- **assembl my space** — the household makeover offer (drawers, linen cupboard, pantry), exactly as Kate proposed.
- "assembl my home" — campaign copy on either, never a SKU prefix.

Domain and trademark availability were not checked; the Shopify domain tool
can check `.nz` and `.co.nz` candidates when a name is settled.

## 3. Laundry, collection and caddy supply: feasibility

### 3a. Laundry sets on a dropship API

| Route | Evidence (to confirm) | Fit |
|---|---|---|
| **Shopify Collective** | Available to NZ stores in NZD. The previous USD 50k trailing-sales minimum was removed in late 2025. Requires Shopify Payments on both stores. About 176 NZ supplier stores are listed, overwhelmingly fashion and homeware. | Mechanically the easiest "same store" dropship: a supplier's linen product appears in Kate's store, the supplier ships, Shopify splits payment. **No NZ hospitality-linen supplier with a Collective listing was found.** It only works if a linen supplier agrees to join Collective. |
| Syncee / Dropshipzone style marketplaces | Have NZ/AU suppliers but the linen on offer is retail bedding, not hotel-grade sets, and lead times run through AU. | Weak. Quality and sizing will not match a host's expectations. |
| **NZ hospitality wholesalers direct** (Astro Hospitality, GLT, Commercial Supplies, D C Rosser, Vendella) | Sell hotel linen, towels, guest amenities and caddy consumables to accommodation businesses. Trade accounts, carton quantities, no public Shopify integration found. | Right products, wrong plumbing. Would need a manual purchase order per order, or a custom connector. |
| Laundry *rental* (commercial laundries supplying and washing linen on a cycle) | Standard for motels and serviced apartments; priced per item per cycle. | Not a product Kate resells. Better introduced as a partner through the guest page. |

**Conclusion.** Dropshipping *laundry sets* through the same store is possible
in principle only via Shopify Collective, and only if a linen supplier joins.
Today no such supplier exists on it. Everything else is a manual wholesale
purchase dressed up as dropship.

### 3b. Laundry collection through one API

| Partner | What was found (to confirm) |
|---|---|
| **CleanCloud** (laundry/dry-clean POS used by many NZ operators) | Has a JSON API: `addCustomer`, `addOrder` with pickup and delivery date/time fields, `getDates` for available slots, `getOrders`, `updateOrder`, `chargeCard`. Requires the operator to be on the Grow or Grow+ plan and to issue an API token. Limits reported as 50,000 requests a month and 3 requests a second. Has a DoorDash Drive integration for courier legs. |
| NZ operators on or near CleanCloud | Auckland: several pickup-and-delivery services (Mrs Suds, Clean Stay, Ace, WashClub, EasyLife, Prime, and others) advertise app or online booking; which ones expose CleanCloud's API is unknown until asked. Mangawhai: Warkworth Laundry and Kowhai Laundry service the area; no API found. |
| **Uber Direct** (NZ) | Live in Auckland. Same-day, 2-hour, next-day and scheduled deliveries up to 30 days out, via dashboard, POS integrations or API, distance-based fee. Rural coverage (Mangawhai) limited or absent. |

**Conclusion.** One API for laundry collection is realistic **only where the
local laundry runs CleanCloud and agrees to issue a token**. It is a per-operator
agreement, not a national service. Auckland is plausible. Mangawhai is not, yet;
there it would be a phone or email booking that DO drafts and a person confirms.

### 3c. Products to fill the caddies

The caddies (breakfast station, bathroom organiser, bedside) are filled with
consumables: tea, coffee pods, sugar sachets, mini toiletries, hand soap,
dental kits, pet treats. Sources:

- NZ hospitality wholesalers above carry all of them in carton lots.
- No API or Collective listing found for any of them.
- Hosts already buy these from supermarkets and Costco; the value assembl adds
  is the *list and the reorder*, not the sale.

**Conclusion.** Sell the caddy, not the contents. Publish a "fill list" per
station (what fits the 42 mm grid bins and tile trays, in what quantity) and let DO turn it
into a reorder list the host can act on anywhere. Revisit reselling consumables
only if hosts ask to buy them from assembl and a supplier will dropship.

## 4. Recommendation: dropship, or kits sent to Kate to on-send?

**For the pilot, kits come to Kate (or a single Auckland print partner) and go
out assembled.** Dropship nothing yet.

Reasons:

1. **Nothing has been printed.** The TURN keyway, detent and locator nub are
   digitally checked only. The first twenty stations will teach us about fit,
   colour, packaging and instructions. That learning only happens if the kits
   pass through assembl's hands.
2. **A station is an assembled, labelled object.** The arrival station carries a
   property-name panel and a QR to a guest page. That personalisation is done at
   assembly time, which is exactly what a dropshipper cannot do.
3. **Laundry and delivery are local agreements**, one operator at a time. They
   are services offered *through* the guest page, not products in the cart.
   They do not need to be in Shopify to be in the journey.
4. **Shopify Collective is ready when a supplier is.** If a linen or amenities
   supplier later agrees to list, it switches on without changing the store.

What this means in the store:

| Keep in Shopify | Keep out of Shopify (for now) |
|---|---|
| Stations, modules, replacement parts (assembl-fulfilled, Kate ships) | Laundry collection (partner booking, drafted by DO) |
| Optional "host preparation checklist" software add-on | Caddy consumables (fill list and reorder, not a sale) |
| Property starter kit bundles | Linen sets (until a Collective supplier exists) |

Costs to be aware of (not yet quantified): Kate's assembly time per station,
NZ Post or courier rates for a boxed station, packaging, and the Shopify Basic
plan transaction fees if Shopify Payments is not used. The costing sheet in
`tools/living-cad/launch/costing.csv` covers print cost only; assembly,
packaging and freight need to be added before a price is set.

## 5. The product line, mapped onto what exists

Every station below is a layout of parts that already exist in the v0.3
manifest, plus at most one new printed part. New parts need a CAD source in
`tools/living-cad/`, a manifest entry, and a fit test before they get a SKU.

| Station | Existing parts (Shopify handles / manifest ids) | New part needed | Grid |
|---|---|---|---|
| Arrival station | `al-board-4x4` (`grid-board-4x4`), `al-keys-6` (key hooks), tile tray `tile-tray-2x1` (key tray), `al-cup` (pens), `al-name-plate` (property name) | Panel with a QR window that snaps into the board, or a QR variant of the name plate (1 new part) | 4 × 4 |
| Bedside station | `al-board-2x4` (`grid-board-2x4`), `al-shelf-2`, `al-cup`, `al-cable-winder`, `al-phone-stand` | none | 2 × 4 |
| Breakfast station | `al-board-4x4`, `al-bin-2` × 2, `al-shelf-2`, `tile-tray-3x2` | none; publish fill list | 4 × 4 |
| Work-from-stay kit | `al-board-2x4`, `al-shelf-2`, `al-cable-winder`, `al-cup`, `al-phone-stand` | none | 2 × 4 |
| Pet welcome station | `al-board-2x4`, `al-hook` (lead), `al-bin-2` (treats), `tile-tray-2x1` (bowl mat) | none | 2 × 4 |
| Bathroom organiser | `al-board-2x4` or `al-board-renter` / `al-over-door`, `tile-cutout-vanity`, `al-hook` | confirm wet-area material before release | 2 × 4 |
| Host reset kit | spare `al-bin-2`, `al-cup`, `al-hook`, tile trays, laminated reset card | none | n/a |

The 2 × 4 and 4 × 4 boards, the renter over-door hanger and the door-thickness fit check already exist in
`lib/living`, so these layouts can be expressed as kits today, labelled
proposed, without touching the Runtime.

### The arrival station, honestly

- The removable key tray and property panel are physical. They need a print.
- The QR goes to a **public** guest page: Wi-Fi, house notes, nearby. Public
  means anyone with the code can read it, so nothing personal lives there.
- "Stock my fridge", "collect my laundry", "report something missing" are
  **personal** actions. They require a private link issued per booking (or a
  booking code), never the public QR alone. DO must enforce this boundary.
- Every service action is **drafted or recommended** by DO and confirmed by the
  guest; where a partner API exists it may be *acted with approval*; where it
  does not, DO produces a message the host sends. Nothing is autonomous.

## 6. How it connects to DO

The proposal's five steps map onto code that exists on `main` today.

| Proposal step | Existing structure | Change required (proposed) |
|---|---|---|
| Owner defines what the property supplies | Shop DO `Pantry` (`lib/do/shop/preparation.ts`): ingredient + quantity + `reviewed` flag, with `pantryHints` parsed from a brief | Add a **property supplies** record: the same Pantry shape, seeded from the station's fill list, owned by the host, reviewed once per reset. |
| Shop DO plans around them | `parseShopBrief` → `planMeals` → `consolidate` → `prepareShop` already subtract pantry from requirements and emit blockers and disclosures | Add a fourth mission to `SHOP_MISSIONS`: **"Stock my stay"** (servings = guests, nights = booking length, pantry = property supplies). No new planner. |
| Guest approves extras | `ShopPlan.basket`, `blockers`, `digest`; voice handoff in `voice-handoff.ts` | Guest page shows the basket as *proposed*; approval creates a Shopify Storefront cart (typed shape already in `lib/living/design.ts`, currently not sendable) only once purchasing is enabled. |
| Host receives a preparation checklist | `Requirement` list, `aisleList` ordering | Render the plan as a **reset checklist** (what to restock, what laundry to book, which station to check), keyed to the saved configuration's part codes. |
| Cleaner resets the station; reorder by revision | `SavedConfiguration` schema `/2` with revision and `partCode()` | Reorder links reference the configuration revision, so a replaced tray is the exact part. Purchasing stays `not_enabled` until release. |

Laundry and delivery sit beside this as **partner actions** with explicit
authority, following the agent principles already in the Runtime:

| Action | Authority | Mechanism |
|---|---|---|
| Book laundry collection (Auckland, operator on CleanCloud with token) | act with approval | `getDates` for slots → guest picks → `addOrder`; receipt stored as proof |
| Book laundry collection (no API, e.g. Mangawhai) | draft | DO drafts the email/SMS to the operator; host sends |
| Courier a forgotten item or top-up (Auckland) | act with approval | Uber Direct quote → guest approves → create delivery |
| Reorder consumables | recommend | Fill list diff → host's own supplier |
| Replacement part | act within limits (once released) | Shopify Storefront cart by part code |

Proof per stay: minutes of host preparation saved, items restocked without a
duplicate purchase, services booked, approvals recorded, missing-item reports
resolved. All of it can be recorded with the existing receipts and evidence
conventions.

### Integration readiness

| API | Status | What is needed before any code |
|---|---|---|
| Shopify Storefront API | Store exists; nothing published | A released product, Shopify Payments decision, a Storefront access token |
| CleanCloud API | Not contacted | One Auckland operator on Grow/Grow+ willing to issue a token; their slot and pricing rules |
| Uber Direct | Not contacted | Business account, Auckland service area check for the pilot address |
| assembl catalogue | Exists (`lib/living/cad-manifest.json`) | Station kits and fill lists added to the manifest |

## 7. What to do first

1. **Print the test kit.** Eight files, about 164 g, in `tools/living-cad/parts/test-kit/`. Until the quarter-turn fits, nothing else is real.
2. **Build one arrival station, one bedside kit, one breakfast organiser** for one property (Auckland serviced apartment or Mangawhai holiday home). Kate assembles and installs. Photograph it for the Space Studio.
3. **Write the fill lists** for the three stations and add them to the manifest as proposed kits.
4. **Add the "Stock my stay" mission and the property-supplies record** to Shop DO, deterministic, with tests, labelled simulated until a real property uses it.
5. **Ask one Auckland laundry** whether they run CleanCloud and would issue a token for a pilot. Ask Warkworth Laundry what a booking by email looks like for Mangawhai.
6. **Run a short paid pilot** (one host, one month): station installed, guest page live, laundry booked by whichever route the location allows, proof recorded.
7. Only then decide on Shopify Collective, consumables resale, and publishing the drafts.

## 8. Sources

Repository (read on `main` at a7c2b389):
`docs/living/ASSEMBL-LIVING.md`, `docs/living/SHOP-01-PRINTIE.md`,
`docs/living/TURN-SHOP-RECONCILIATION-20261019.md`,
`app/api/living/shop-checkout/route.ts`, `lib/do/shop/*.ts`,
`lib/living/design.ts`, `tools/living-cad/launch/shopify-products.csv`.

Shopify Admin API, read-only, 2026-10-19: shop info, product search (57
results), collections (1).

Web (search summaries only, to confirm against the vendor):
CleanCloud API documentation and plan pages; Uber Direct New Zealand pages;
Shopify Collective help pages (NZ availability, Shopify Payments requirement,
minimum removed late 2025); NZ laundry operators' public pages (Auckland
pickup services; Warkworth Laundry and Kowhai Laundry for Mangawhai); NZ
hospitality wholesalers (Astro Hospitality, GLT, Commercial Supplies,
D C Rosser, Vendella); Airbnb host essentials guidance.
