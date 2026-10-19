# Partner suppliers by space — one store, three fulfilment lanes

**Status: proposed research. No supplier has been contacted. No app has been
installed. Nothing is published.** Research date 2026-10-19. Web findings are
from search summaries and are marked *to confirm* unless a Shopify tool
returned them directly.

Companion to `HOSPITALITY-PROPOSAL-20261019.md`. That brief answered the
hospitality question. This one answers Kate's follow-up: group the offer by
space, not by hospitality, and find for each space a partner supplier whose
products could sit in the same Shopify store behind a supporting dropship
integration.

---

## 1. The one fact that changes the plan

**Shopify Collective supports New Zealand stores in NZD, and at least one NZ
supplier is already listed on it.**

- Shopify's help centre lists New Zealand among Collective's supported
  countries and NZD among supported currencies. Conditions: active plan,
  Shopify Payments activated with an NZD payout account, both stores in the
  same country and currency, Collective terms accepted. It is free. *(Help
  centre page; to confirm the live page, the snippet is old.)*
- A Collective candidate search run from the connected store on 2026-10-19
  returned NZD-priced products from supplier **salelink.co.nz** (Auckland
  direct importer: home and living, electronics, tools, outdoor, pet basics).
  Import is possible from the Shopify admin once the Collective app is
  installed (`importAvailability: INSTALL_REQUIRED`). Two other lanes searched
  ("bed linen sheet set", "kitchen pantry storage containers") returned no NZ
  supplier at all.
- Shopify Payments for NZ needs an NZ bank account in NZD and an NZBN.

So the mechanism exists. The gap is supplier **quality and category**, not
plumbing. The NZ Collective pool today is thin and generic.

## 2. The three lanes, and why DO is what makes one store work

| Lane | Who ships | How it reaches Shopify | Where DO sits |
|---|---|---|---|
| **A. assembl-made** (TURN parts, stations, kits) | Kate or one Auckland print partner | Native products, already drafted (57) | Space Studio → saved configuration → part codes |
| **B. partner dropship** | The partner, direct to the customer | Shopify Collective (NZ) first; Syncee or Dropshipzone as fallbacks; supplier-native app where one exists | DO recommends the partner item *for the space*, labels it "shipped separately by {partner}" |
| **C. partner wholesale, assembl-packed** | Kate (or a 3PL) packs partner stock into the kit | Trade account + a native product with assembl inventory | DO treats it as part of the kit; reorder by fill list |
| **S. services** (laundry, delivery, cleaning, grocery) | A local operator | Not in the cart. Booked through the guest or household page | DO drafts or books with approval, records a receipt |

The rule for the customer: **one basket, honest lines.** A basket may contain
a Lane A station, a Lane B item that arrives in its own box, and a Lane S
booking. Each line says who fulfils it and when. Nothing is described as
assembl-shipped unless it is.

## 3. Space by space

Spaces are the six already defined in `lib/living/spaces.ts`, plus **stay**
from the hospitality brief. For each: what assembl prints, which partner
category completes the space, the best integration route found, and the
honest status.

### my room (bedside, teen room, dorm)

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Bed linen, towels | M.M Linen (NZ brand, sells via stockists); Simba (Auckland commercial textile wholesaler, trade account); GLT (hospitality) | **C** trade account, or invite to Collective | No NZ linen dropshipper found. Ask M.M Linen and Simba whether they will join Collective or ship single orders. |
| Lighting, phone and cable accessories | salelink.co.nz (on Collective, NZD); Techexpress NZ (electronics, 3 to 4 day delivery, *to confirm*) | **B** Collective | Available now, generic quality. Suits a "complete the bedside" add-on, not a hero product. |
| Printed cards, posters, name cards | Gelato (print on demand, produces locally in NZ, Shopify and API, *to confirm product range*) | **B** supplier app | Good for room name cards, kids' labels, host cards. |

### my space (entry, hallway, kitchen bench, pantry)

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Pantry fill: tea, coffee, dry goods | Webster's Tea (NZ, wholesale applications); Coffee Supreme (NZ, free shipping over $25); Teavision (AU, private label); Upstock and Open Pantry (NZ hospitality ordering platforms) | **C** wholesale into the kit, or fill list only | No NZ pantry dropshipper found. Recommend fill list plus optional assembl-packed "first fill". |
| Pantry containers, kitchen storage | Collective lane returned nothing in NZ; Dropshipzone (AU, Shopify app, ships from AU warehouses, NZ rates *to confirm*) | **B** Dropshipzone, AU shipping | Possible but slow and off-brand. assembl's own bins and tile trays are the better answer here. |
| Grocery for "stock my fridge" | No public ordering API at Woolworths NZ or Foodstuffs found. Woolworths runs Apigee for partner APIs (loyalty), MILKRUN is in-house. | **S** draft list, hand off to the shopper's own app | Keep Shop DO deterministic and hand off, as it does today. |

### work & create (desk, studio, workshop)

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Stationery, desk accessories | NXP (NZ, same-day dispatch, volume pricing, no dropship stated); Comsys (trade pricing); Office Products Depot | **C** trade account | No NZ dropship program found. Pack a small "desk reset" consumables bag from trade stock, or leave it out. |
| Tech accessories, cable management | salelink.co.nz (Collective) | **B** Collective | Available now, generic. |
| Workshop consumables, tool hooks | salelink.co.nz, Action Outdoors (NZ, accepts dropship arrangements *as a retailer*, not as supplier) | **B** Collective | Available now for basics. |

### store & organise (linen cupboard, laundry, garage, gear wall)

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Laundry and cleaning products | ecostore (Auckland-made, sold through supermarkets; no trade or dropship page found) | **C** or fill list | Ask ecostore for a trade account. Fill list is the fallback. |
| Laundry service (collection, wash, return) | CleanCloud-run operators in Auckland; Warkworth and Kowhai for Mangawhai | **S** CleanCloud API with approval, else drafted booking | Per-operator agreement. See hospitality brief §3b. |
| Fishing tackle, outdoor gear | Fishing and Leisure (NZ wholesaler to resellers); Kilwell (NZ distributor); Outdoor Leisure Products (Auckland importer) | **C** trade account | No API or dropship stated. dayrally already covers the printed half of this space. |
| Bike accessories | PRV, Wide Open Distribution, Everoutdoor, W H Worrall (NZ distributors) | **C** trade account | No dropship program found. Fit for a "bike wall starter" bundle only if a distributor agrees to single-unit supply. |

### pets & everyday

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Collars, leads, bowls, basics | salelink.co.nz (on Collective, NZD; dog collars seen) | **B** Collective | **The one space where a live NZ Collective lane exists today.** Quality to check with a sample order. |
| Engraved pet tags | Purr. Meow. Woof. (Christchurch, local dropship fulfilment, *to confirm integration*) | **B** supplier-native | Personalised, local, on-brand for an entry-and-pets station. |
| Full pet range (food, treats, toys) | Brooklands (1,300 retailers, trade account); Petware (4,000 lines); Masterpet | **C** trade account | No API or dropship found. Treats belong on the fill list. |

### plants & objects

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Plants and pots | The Plant Company (NZ online nursery, ships nationwide, wholesale aimed at landscapers); Garden Central (retailer); Just Add Plants (AU pots) | **C** ask for single-order supply | No dropship or Shopify integration found. Plants are a courier-risk product; test with one supplier, one region. |
| Candles, objects, decor | Nest Direct (NZ distributor for Nest and House Doctor, trade program for retailers and luxury accommodation); UNTIL (wholesale, dispatch from Sydney) | **C** trade account, or Faire | Faire launched in NZ in August 2025 (wholesale marketplace with pay-later terms; its Shopify sync is for inventory, not dropship, *to confirm*). |

### stay (holiday homes, Airbnb, motels)

| Partner category | Candidates found | Route | Status |
|---|---|---|---|
| Hotel linen, towels, amenities | GLT, Simba, Commercial Supplies, Astro, D C Rosser, Vendella | **C** trade account | Carton quantities, no API. Assembl-packed welcome kit only. |
| Guest cards, house manuals, QR panels (paper) | Gelato NZ | **B** supplier app | Pairs with the printed arrival station. |
| Laundry, delivery, cleaning | CleanCloud operators; Uber Direct (Auckland); Premium Clean, TIDY, NexDo, Goodnest (booking apps, no public partner API found) | **S** approval or draft | Services, not SKUs. |

## 4. Integration routes, ranked

| Route | Evidence | Fit for assembl | Caveat |
|---|---|---|---|
| **Shopify Collective (NZ)** | Officially supported for NZ/NZD; one NZ supplier observed from the store | Best: native, free, orders route to the supplier, payment splits in Shopify | Requires Shopify Payments (NZBN, NZD bank). Supplier pool thin. A supplier Kate knows can be *invited*, which is how to get M.M Linen, ecostore or Nest Direct in. |
| Supplier-native app or API | Gelato (print), Purr. Meow. Woof. (tags), Dropshipzone (AU goods) | Good for one category each | Each is its own install and its own order flow. |
| Syncee / Spocket | Marketplaces with a Shopify app; NZ suppliers must be found with a location filter | Weak: few NZ suppliers, long shipping from EU/US | Use only to confirm a specific NZ supplier. |
| Faire (NZ since Aug 2025) | Wholesale marketplace, free to join, 60-day terms | Good for **Lane C** sourcing of objects and candles | Not dropship. Stock comes to Kate. |
| Trade accounts | Most NZ wholesalers found (linen, pet, tackle, bike, pantry, office) | Required for **Lane C** | Manual purchase orders. Carton minimums. |
| 3PL with Shopify sync | Online Distribution (East Tāmaki and Christchurch, Shopify integration); Mailshop (Auckland); LTL Logistics (Christchurch, small-business focus) | Later, when Kate stops packing kits herself | Minimum volumes and pricing *to confirm*. |
| Shipping app | Starshipit (NZ-made, Shopify app, from about $30/month, NZ Post and NZ Couriers) | Needed for Lane A and C from day one | Shopify cannot detect NZ rural addresses; offer a rural option at checkout. |

## 5. Recommendation

1. **Switch on Lane A only, as planned.** Print the test kit, release the
   first parts, ship them yourself with Starshipit.
2. **Set up Shopify Payments now** (NZBN, NZD account). It unlocks Collective
   later and is needed regardless.
3. **Invite, do not browse.** The Collective supplier pool in NZ is thin.
   The value is in inviting two or three suppliers Kate would be proud to put
   beside a station: one linen brand (M.M Linen or Simba), one pantry or
   pet-treat maker, Nest Direct for objects. Each needs their own Shopify
   store on Shopify Payments. Ask whether they already have one.
4. **Run one live Lane B test in pets & everyday** with salelink.co.nz on
   Collective: order a sample, judge quality and delivery, decide whether it
   is on-brand enough to list under "shipped separately by the supplier".
5. **Use Lane C for everything that must feel like assembl**: first fills,
   welcome kits, desk resets. Source through trade accounts and Faire. Pack
   with the station. Reorder from the fill list.
6. **Keep services out of the cart.** Laundry, delivery and cleaning stay as
   DO actions with explicit authority, per the hospitality brief.
7. **Do not install Syncee, Spocket or Dropshipzone** unless a specific NZ
   supplier is found there first. They add long-haul generic stock, which is
   the opposite of the brand.

## 6. What DO adds that a plain Shopify Collective store cannot

- **Space-first recommendation.** Shop DO already parses a brief, subtracts
  what the household has (pantry), and proposes a basket with blockers and
  disclosures. Extend the same deterministic planner to a *space brief*
  ("teen room, no drilling, two phones, one bike") that returns a Lane A
  configuration plus labelled Lane B/C add-ons.
- **Honest fulfilment lines.** Every basket line carries its lane, its
  shipper and its expected arrival. The customer never finds out at the door
  that three parcels were coming.
- **Fill lists and reorders.** The configuration revision plus part codes
  already exist. Add a fill list per station so consumables are a recurring
  recommendation, not an inventory burden.
- **Proof.** Items recommended, accepted, shipped by lane, time to complete
  the space, duplicates avoided.

## 7. Before any of this is built

- Confirm the Collective help-centre page is current and that Discovery
  (browsing suppliers) is enabled for NZ stores, not invite-only.
- Confirm Gelato's NZ product range includes cards and small signage, and
  the Shopify app flow.
- Ask each named supplier one question: "Do you ship single orders to our
  customers, and do you have a Shopify store on Shopify Payments?"
- Decide the Starshipit plan and a rural shipping rule before the first
  Lane A product is published.

## 8. Sources

Shopify tools, 2026-10-19, from the connected store: Collective candidate
search (three lanes, one NZ supplier returned, two empty).

Shopify help centre (via search): Collective requirements and considerations;
Collective for retailers; Shopify Payments supported countries and New Zealand
requirements.

Web (search summaries, to confirm): Shopify NZ blog on dropshipping suppliers;
dodropshipping.com and spocket.co NZ supplier roundups; Syncee FAQ and
marketplace; Dropshipzone user guide and Shopify app listing; salelink.co.nz
about page; Faire NZ expansion press release (Aug 2025); Gelato NZ
print-on-demand page; fulfill.com NZ 3PL directory; Starshipit Shopify app
listing and Shopify community threads on NZ shipping; supplier sites for
M.M Linen, Simba, GLT, Commercial Supplies, Webster's Tea, Coffee Supreme,
NXP, Comsys, Brooklands, Petware, The Plant Company, Nest Direct, UNTIL,
Fishing and Leisure, Kilwell, Action Outdoors, PRV, Wide Open Distribution,
Everoutdoor, Premium Clean, TIDY, NexDo, Goodnest; Google Cloud case study on
Woolworths NZ Apigee; Commerce Commission grocery report summary (2025).
