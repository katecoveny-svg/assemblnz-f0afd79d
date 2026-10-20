# The printing API: Treatstock, set up and waiting for a key (20 October 2026)

**Status: adapter built and dry-run tested; no account, key, order or payment exists. Nothing spends without
a flag and an environment variable both saying so.**

## Which API, and why

`LAUNCH-OPERATIONS-20261019.md` section 5 found no NZ bureau with a turnkey API. The two candidates with an
API route are:

| | Treatstock | 3DAPI (dapi.digital) |
|---|---|---|
| What it is | a marketplace; five Auckland PETG vendors are listed; orders route to a chosen vendor | a managed print-farm network with Oceania farms, 10% commission, flat shipping |
| API | public, documented by an official client on GitHub (Treatstock/apiv2, MIT): upload, price, offers, order, pay, status, messages | "custom API" mentioned on their comparison pages; no public documentation found from here; store connection is via ShipStation |
| Key | a company private key, by emailing support@treatstock.com (help article "Become an API partner") | seller sign-up on their site; ask for API docs |
| Chosen | **first**, because it is documented and the vendors are local | enquiry only; revisit when they answer |

## What is built

`tools/living-cad/launch/treatstock_api.py`: a small client for Treatstock API v2 and a CLI around the
first-print order pack (`print-order-20261020/order.csv`):

- `colors`: the vendors' material groups and colour names (to confirm the mapping sun→Yellow, tomato→Red,
  black→Black, cream→White; PETG/ASA/TPU/PLA groups; carbon nylon falls back to "Nylon" and must be checked).
- `quote --set "pegboard"`: uploads the set's STLs as one printable pack with `location[country]=NZ`, waits
  for Treatstock to size and weigh them, sets material, colour and quantity per part, fetches the offers
  and saves them to `print-order-20261020/quotes/`. Repeat for `"bike set"` and `"fish set"`.
- `status --pack ID` / `--order ID`.
- `order --pack ID --provider ID --address address.json --confirm`: places an unpaid order with the chosen
  vendor. The address file holds the contact and shipping address; it is not in the repo.
- `pay --order ID --total X --confirm-spend`: pays from the Treatstock account balance. Refuses unless
  `TREATSTOCK_ALLOW_PAY=1` is also set. This is the one call that spends money, and it stays Kate's call.

Without `TREATSTOCK_PRIVATE_KEY` every command is a dry run that prints the requests it would make.

## Kate's steps

1. Email support@treatstock.com asking to become an API partner for assembl / living (NZ); they issue the
   company private key.
2. Put the key in `.env.local` as `TREATSTOCK_PRIVATE_KEY=…` (never in the repo; for the later server-side
   batch job it goes into Vercel's environment as a secret).
3. Top up the Treatstock balance only when a quote is in hand.
4. Run `quote` for the three sets, pick a vendor (Auckland, reviews, price), run `order --confirm`, then
   `pay --confirm-spend` yourself, or tell me the vendor and the total and I run it with your go.

## What this does not do yet

- The Shopify-order-to-print-job queue (stage 2 in the operations doc). Once a key exists and the first
  orders have gone through by hand, the same client becomes the batch job: an order webhook writes a job
  (part ids, colours, quantities, STL hashes from the manifest), a daily run builds one pack per batch,
  orders from the proven vendor, and the parts come to Kate for checking and dispatch.
- 3MF export. Treatstock takes STL; 3MF is only needed for multi-colour parts in one file, and the pack
  carries the second colour as a separate file today.
- Any claim that a vendor can print PPA-CF. Ask in the order comment; the fallback ladder is in the order
  pack README.

## Treatstock enquiry email

Subject: API partner request, assembl / living (New Zealand)

Hi, we are assembl / living in Auckland. We design modular 3D-printed pieces (STL, our own files) and want
to route small batch orders to Auckland vendors on Treatstock through your API v2 (printable packs,
offers, orders, payment from balance). Could you issue a company private key for api.treatstock.com and
confirm which Auckland vendors print PETG in yellow, black and white, and whether any run carbon-fibre
nylon? Thanks, Kate.

## 3DAPI enquiry email

Subject: Seller API access for NZ fulfilment

Hi, we are assembl / living in Auckland, New Zealand. We sell modular 3D-printed pieces from our own files
and would like to fulfil through your Oceania farms. Can a seller join now, which NZ farm would print,
what PETG colours are available, and is there API documentation for creating orders directly (we do not
use ShipStation)? Thanks, Kate.
