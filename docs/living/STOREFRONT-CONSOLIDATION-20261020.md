# Living storefront consolidation

Review baseline: main `7ab6a4353c5b90bc885ebb7a7f221fe7958e15dd`; #1615 head
`fc68aa16304b87564dcf22d190acdaf5c7e58736`; #1617 head
`68328140fff6428ec245c8b2998502c7afdc84cd`. Checked 20 October NZDT.

## Findings and exact integration

| Area | Current evidence | Integration |
| --- | --- | --- |
| `/living`, `living.css`, Studio composer/reducer | #1616 on main; #1615 repair now preserves them | Keep all behavior; add collection navigation only |
| `lib/living/*`, CAD build source and 18 STL/STEP files | #1616 canonical AL-02, nine digital-validation parts | No changes; verify manifest hashes |
| `/living/shop` | #1617 introduced it on the feature branch; #1619 later replaced its UI with editorial store | Import latest shop files from #1615, not original #1617 page |
| `LivingModel.tsx` | Concept studies used by shop and old preview | Import only this dependency; explicitly not manufacturing geometry |
| Shop catalogue | Older 160/120 identifiers conflict with canonical 192/96 system | Correct core descriptions; resolve engineering evidence from `lib/living/catalogue`; add Studio links |
| `shop-checkout` | #1617 unconditional HTTP 409 | Preserve server gate and test it |
| `GlobalChrome`, public assistant routes | Feature-branch shop isolation | Import narrow `/living/shop` handling; preserve `/living-site` and other surfaces |
| Room photos | Existing external concept atlas, not local CAD renders | Retain approved imagery and concept labels; not sample photographs |
| Older configurator / prototype library / engineering AL-03 and AL-05 notes | Present only on #1615 branch; noncanonical / preview | Leave on source branch, do not import or overwrite AL-02 |
| Printie research | Proposal, no proven live connection | Preserve research as qualification work, not integration evidence |

#1615 is no longer the original simple storefront: its latest repair includes main.
The original overwrite conflict has already been resolved there. The remaining
problem is integration and conflicting catalogue truth. This focused successor
imports useful shopping files and fixes that mismatch without merging experimental
engineering or the old overflowing configurator. Do not subsequently merge #1615
without reviewing duplicate/conflicting shop edits. Its remaining preview material
can be retained separately. No PR is closed automatically.

Uses the existing Living catalogue, Studio, CAD manifest and shop selection
sanitiser; no new commerce infrastructure or provider integration.

## Functionality and limits

Collection/room filters, search, favourites, personalisation intent, local kit
editing/quantity/removal, import/export, optional browser-session photo reference,
and orbitable concept studies are included. The shop does not analyse photos,
change CAD geometry, confirm physical fit or quote a delivered price. Measured
canonical layouts and real STL/STEP downloads remain in Space Studio. Moving to
Studio starts a new canonical design, not automatic conversion of the shop kit.

## Order-release requirements

1. Physically print and test exact revisions: peg/lip/clip fit, retention, loads,
   wall mounting, materials/finish, intended use and relevant product safety.
2. Manufacturer accepts exact files/SKUs and permitted personalisation; explicitly
   confirm whether unique per-order CAD is supported. Printie is unqualified.
3. Confirm NZ landed prices including materials, print, assembly, packing, GST,
   delivery, failed prints/remakes and margin; replace indicative price bands.
4. Agree stock/capacity, lead times, tracking, damaged goods, returns and support.
5. Implement authenticated product/variant mapping, server-validated prices,
   payment, idempotent fulfilment dispatch, webhook verification and receipts.
6. Prove sandbox order, cancellation/refund, failure/retry and reconciliation;
   approve the exact release revision before replacing the 409 gate.

No payment, Shopify product, supplier request or manufacturing order is created.

## Deployment baseline

Vercel reports production READY deployment `dpl_3znX7DTzztatPzDL7f5sRDFV8XZ2`
on main `7ab6a4353`, aliased to www.assembl.co.nz and demo.assembl.co.nz.
This is the modular system from #1616, not this shop consolidation. This PR does
not merge main or promote production. Preview/test results are recorded below.
