# Store launch operations — name, payments, shipping, print partner

**Status: research and recommendation. Read-only on the store. Nothing was
renamed, uploaded, published, installed or paid for from this session.**
Research date 2026-10-19 (evening NZ). Web findings are search summaries,
marked *to confirm*. Store facts come from the Shopify Admin API.

Context: Kate's chat session that loaded the 57 draft products is handling
image upload and payments setup. It left shipping rates and the print
partner to this session. This brief covers those two, plus what the store
looks like right now and what the name and domain options are.

---

## 1. Store state, 2026-10-19 ~18:15 UTC (read-only)

| Item | Observed |
|---|---|
| Name | still "My Store" (`sihze0-nj.myshopify.com`); primary domain is the myshopify address |
| Products | 57 drafts, vendor `assembl living`; the first 50 checked now all have a featured image, so the image upload from the other session has landed |
| Published | none |
| Payments | no digital wallets reported, which is consistent with Shopify Payments not yet activated (*to confirm in admin*) |
| Shipping, General profile | Domestic (New Zealand): "Standard" NZD 10.00 plus a second "Standard" at NZD 0.00 (a free-shipping condition). International: NZD 34.00 to 27 countries. |
| Shipping, second profile | "Dropshipper-AI Shipping": Worldwide, "Standard Shipping" USD 0.00. Created by an installed app. |
| Installed apps | Messaging (Shopify), Digital Products (Shopify), Shopify Claude Connector, **Dropshipper-ai** (Dropshipping.ai, US/EU suppliers), **Syncee AI Dropship**, **Podifai** (AU print-on-demand, apparel and merch) |
| Policies | privacy policy only |

Two things to act on before anything is published:

1. **The three dropship apps are installed but not wanted yet.** The
   suppliers-by-space brief recommends Shopify Collective, not Syncee or
   Dropshipper-ai, and Podifai is apparel print-on-demand, not 3D printing.
   Each can hold a trial, a billing plan and its own shipping profile. The
   Dropshipper-AI profile charges USD 0.00 worldwide on any product assigned
   to it. Recommendation: uninstall all three from the admin (Apps and sales
   channels) unless Kate installed one deliberately; at minimum, check that
   no assembl product is assigned to the Dropshipper-AI shipping profile.
2. **International shipping is on at NZD 34 to 27 countries.** No part has
   been printed, let alone exported. Recommendation: remove the International
   zone until NZ fulfilment is proven.

## 2. Name and domain

- **Store name** cannot be changed through the Admin API; the Shop resource
  is read-only to apps. Kate changes it in Shopify admin under Settings,
  General. Store names need not be unique, so "assembl" is fine as the name.
- **Domain** is the thing that must be unique. Registry lookups on
  2026-10-19:

| Domain | Available |
|---|---|
| assembl.co.nz | no (this is assembl's own domain, per the company email) |
| assembld.co.nz | yes |
| assembl.nz | yes |
| assembld.nz | yes |
| assembl.store | yes |
| assembld.com | no |

  Recommendation: **shop.assembl.co.nz** as the store's primary domain, a
  subdomain of the domain assembl already owns. No purchase needed; add the
  domain in Shopify admin (Settings, Domains) and a CNAME at the registrar.
  Register assembl.nz as a defensive hold if the budget allows. Do not buy
  "assembld" anything; it is a workaround for a problem that does not exist.

## 3. Payments: Stripe is not the path

Kate's note said Stripe is connected. In Shopify that does not apply the way
it would on a custom site:

- Shopify's help centre states that where Shopify Payments is supported in
  the store's country, **Stripe is not available to activate** as a
  provider. Stripe is Shopify Payments' banking partner, not a standalone
  gateway there. New Zealand is a Shopify Payments country. *(Help centre
  page via search; to confirm on the live page.)*
- So the choice is **Shopify Payments** (recommended) or a listed NZ
  third-party provider such as Windcave, POLi, Afterpay, Zip or Laybuy, each
  of which attracts Shopify's third-party transaction fee on top.
- Shopify NZ pricing page (*to confirm*): Basic plan online card rate
  2.7% + NZD 0.30; third-party provider fee 2% on Basic.
- Shopify Payments for NZ requires an NZ bank account in NZD and an NZBN,
  and the payout currency must match the store currency (NZD). It is also
  the prerequisite for Shopify Collective (see the suppliers brief).
- Stripe stays useful for the assembl platform itself (DO services,
  pilots, invoices) but not for the Shopify checkout.

**Action for Kate:** Settings, Payments, activate Shopify Payments with the
NZBN and NZD bank account. Leave third-party providers off for now; add
Afterpay or Laybuy later if customers ask.

## 4. Shipping rates

### What ships

From the launch CSV (553 variants):

| Weight band | Variants | Examples |
|---|---|---|
| up to 250 g | 506 | every single part; most 43 to 120 g |
| 250 to 500 g | 47 | the room kits and dayrally kits, max 466 g |
| over 500 g | 0 | none |

Everything fits an NZ Post **XS or S bag** with packaging. No product needs
a box rate.

### What it costs (NZ Post, bag-inclusive, pre-1 July 2026 figures, *to confirm*)

| Service | XS | S | M | Notes |
|---|---|---|---|---|
| Courier (next working day, tracked) | 9.10 | 10.40 | 12.40 | up to 3 kg |
| Economy (up to 3 working days) | 7.10 | 8.40 | 10.40 | |
| Rural surcharge | +6.00 | | | Shopify cannot detect rural addresses |

NZ Post raised all domestic Courier and Express prices on 1 July 2026; the
new figures were sent to account holders and are not public in the pages
found. Budget 5 to 10 percent above the table. Aggregators quote Aramex and
NZ Post "Parcel Local" from about NZD 4 to 6 for slow, untracked services;
not recommended for a premium product.

### Recommended rate card for the General profile (NZ only)

| Rate shown at checkout | Price | Condition | Why |
|---|---|---|---|
| Standard, tracked, 1 to 3 days | NZD 9.00 | orders under NZD 120 | covers an S Economy bag; Courier for small orders is a 1 to 3 dollar subsidy, acceptable |
| Free standard | NZD 0.00 | orders NZD 120 and over | matches the existing free condition; kits qualify |
| Rural delivery | NZD 15.00 | customer-selected | the NZ convention, since Shopify cannot apply the +6 automatically |
| Express courier, next day | NZD 14.00 | optional | |
| International | remove for now | | |

The existing NZD 10 flat rate is close enough; the change that matters is
adding the rural option and switching international off. These can be set
in admin (Settings, Shipping and delivery) or with `deliveryProfileUpdate`
from the API once Kate approves the figures.

### Labels

- **Starshipit** (NZ-made Shopify app, from about NZD 30 a month, NZ Post
  and NZ Couriers, *to confirm*) for labels and tracking once orders are
  more than a handful a week. Before that, NZ Post's Send a Parcel is fine.
- Carrier-calculated rates at checkout need a higher Shopify plan or an
  app; flat rates are the right call on Basic.

## 5. Print partner and "printer API"

### What exists

| Option | Where it prints | Integration | Fit for assembl |
|---|---|---|---|
| **3DPrintIt** (Auckland) | Auckland, ships NZ-wide, PETG, instant online quote for suitable models, small-batch production | No public API found; upload and order online, contact for batches | **Best first partner.** Local, PETG, batch-friendly. Quote the test kit this week. |
| Treatstock marketplace | Lists five Auckland PETG vendors (Justin's 3D Printing, CreateBase and others); minimum charges around NZD 8 to 25 (*to confirm currency*) | **Has an API**: upload STL/3MF, price by material and country, place orders; keys issued by Treatstock; widget available. Docs are old (about seven years). | The only NZ-reachable **API** route found. Quality varies by vendor; pick one vendor and stay with them. |
| Zelta3D, Extruder, Integral Print | NZ bureaus, instant quotes | No API found | Backup quotes. |
| JLC3DP (China) | Shenzhen, very low unit cost, many materials | API by application and review; aimed at trading companies | For **batch stock** to Kate (hundreds of a part), not per-order dropship. Shipping and GST on import apply. |
| Printie | US facility only | Shopify app | **Not viable** for NZ customers. Retire from SHOP-01 as a candidate. |
| WAZP+ | Ireland, EU production | Shopify app, catalogue-based | Not viable for NZ; their catalogue, not ours. |
| Shop3D | unclear | Shopify app | Unverified; skip. |
| Podifai | Australia, apparel and merch print-on-demand | Shopify app, **already installed** | Wrong product type. Uninstall. |

### Recommendation

There is no NZ 3D-print partner with a turnkey "order arrives in Shopify,
part prints, parcel leaves" API. Build the handoff in two stages:

1. **Now, manual, local.** Order the eight-file test kit (about 164 g) from
   3DPrintIt, and the same kit from one Treatstock Auckland vendor. Compare
   fit, finish, colour range, price and turnaround. Keep the receipts as
   evidence in `docs/living/evidence/`. Tune `CLAMP`, `BUMP_H` and
   `DIMPLE_D` in `tools/living-cad/cad/lib.py` from the results, cut v0.4.
2. **Then, small code, batch orders.** A Shopify order webhook writes a
   print job (part codes, colours, quantities, the immutable STL hashes from
   the manifest) into a queue. Once a day the queue becomes one batch order:
   through the Treatstock API if the chosen vendor is on it, otherwise an
   emailed order to 3DPrintIt. Parts come to Kate, who checks, packs and
   ships with Starshipit. This keeps the "qualified material and print
   profile, immutable manufacturer revision" steps from the SHOP-01 release
   contract and does not depend on a partner API that does not exist yet.

Per-order dropship direct from the printer to the customer is a later
step, only with a vendor who has proven fit on v0.4 and agreed to
assembl's packaging.

## 6. Who is doing what (to avoid double handling)

| Task | Owner |
|---|---|
| Image upload to the 57 drafts | Kate's chat session (done or in progress; images are present) |
| Store name | Kate, in admin |
| Shopify Payments activation | Kate, in admin (needs NZBN and bank details; not something either session can do) |
| Shipping rate card | this session proposed above; set in admin or via API on Kate's approval |
| Dropship app clean-up | Kate, in admin |
| Test kit print orders | Kate (spend); this session prepares the order sheets on request |
| Publish products | **nobody**, until the test kit passes |

## 7. Sources

Shopify Admin API (read-only, 2026-10-19): shop, products with media,
delivery profiles, app installations. Registry availability lookups for the
six domains. Launch CSV weights.

Shopify docs and help (via search, *to confirm on the live page*): Shop
resource is read-only to apps; payment gateway availability where Shopify
Payments is supported; New Zealand gateway list; Shopify NZ pricing page;
Shopify Payments New Zealand requirements; delivery profile API.

Web: NZ Post "Sending in NZ" prices and 1 July 2026 business pricing notice;
Starshipit Shopify listing; 3DPrintIt pages; Treatstock API help centre and
Auckland PETG listing; JLC3DP API application page; Printie site; WAZP+
Shopify listing and Irish press; AI Dropshipping (Dropshipper-ai) listing.
