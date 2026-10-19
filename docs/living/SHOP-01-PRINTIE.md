# Assembl Living / SHOP-01

Adds /living/shop to the existing project. Existing /living, CAD source, AL-05 documentation and engineering library are unchanged. This is an interactive storefront preview, not an active Shopify shop.

## Implemented
Space-based catalogue; 12 proposed sets and accessories; eight colour choices; decorative finish and text specifications; separate measurement confirmation; existing orbitable 3D studies; local saved kit with quantities, removal and export; fail-closed server checkout route. Photos are session-local and are not analysed. Manufacturing revision stays null until real released artifacts are mapped. Browser selections never authorise production. The generated JSON is a saved design, not a manufacturing order.

## Printie qualification (researched 18 October 2026)
Candidate only. No account, API, contract, quote or order has been created.

Printie advertises customer-supplied STL/3MF, US fulfilment, branded packaging and optional multipart assembly. Its more specific Shopify documentation describes Shopify -> Shippo OR ShipStation -> Printie exact SKU/configuration mapping, rather than a native direct Shopify app. Older marketing/guide wording differs. Confirm the actual onboarding path.

Pricing detail says shipping is calculated separately after destination and parcel contents are known, despite broad all-in wording elsewhere. Do not reuse example site prices as NZ landed prices. Confirm currency, printing, plate/color setup, finishing, optional assembly, packaging, shipping, applicable taxes and exception costs.

Key question: can a vetted parametric template create a unique per-order 3MF, be reviewed/accepted programmatically, receive a immutable production configuration identity, and be assigned to exactly one order before production starts? A fixed SKU mapping does not establish that capability. No public endpoint is invented in this build.

## Required pilot
One fixed organiser set; one same-template personalised set; one multipart case with printed gate/filament hinge pins; a separately quoted large shade or shelving module. Quote one complete tracked parcel per order to Auckland, NZ. No sample has been ordered by this change.

## Release contract
Saved configuration -> approved generated artifact hash -> qualified material and print profile -> immutable manufacturer revision -> server quote -> approved buyer checkout -> idempotent paid-order intake -> manufacturer acceptance -> tracking. Fit-sensitive, electrical/thermal, animal restraint and structural products remain unavailable until validated. Native STEP geometry must be independently opened and checked before a real STEP download is exposed.

## Sources
- https://printie.com/how-it-works
- https://printie.com/pricing
- https://printie.com/blog/2026-02-23-shopify-3d-print-on-demand-workflow
- https://printie.com/blog/2026-03-20-how-sku-mapping-works-for-3d-printed-products
- https://printie.com/3d-design-handling-policy

## Next actual integration needs
An authorised Shopify store identity; approved physical products and pricing; a documented Printie workflow for dynamic artifacts; secure backend credentials; durable configurations and orders; webhook signature verification and duplicate handling; representative end-to-end NZ fulfilment tests. Do not replace these with a connected banner.
