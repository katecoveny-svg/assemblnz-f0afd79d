# Assembl Living / EDITORIAL-02

## Scope
Implements the user-approved realistic room-led visual direction at the existing `/living/shop` route. This replaces the old SVG-card storefront presentation, not the engineering catalogue or manufacturing gate. It does not create a Shopify store or activate payments. Parent: d2bf206a62926fa6252b7f4cd06b3ead98066634.

## Changes
- Photo-led hero, five room collections, six coordinated starting sets, individual-piece catalogue and responsive shop navigation.
- Reuses the existing SHOP-01 Item and Selection schemas, product IDs, localStorage key, catalogue, 3D component and server checkout gate.
- Starter packs resolve into existing individual product selections; optional additions share colour/text/finish but do not inherit fit confirmation.
- Saved sets, saved-kit editing, quantity/removal, JSON export and validated import.
- Session-local photo reference, choice-based three-set recommendation, separate fit confirmation.
- Removes corporate navigation/footer and the unrelated public DO widget only on `/living/shop` and descendants. No broad /living prefix match; other site routes remain unchanged.
- Revised page title and noindex metadata.

## Image provenance and limitations
The imagery is cropped from the AI-generated board explicitly approved by the user in this conversation. A 196 KB WebP atlas holds photo regions without the image's invented prices, labels or buttons. The atlas is hosted under the user's Higgsfield media account. Crops are styling references, not tested CAD or photographs of printed samples. They are displayed with actual HTML controls and text, not an image of a website with click overlays. The original SVG CAD-like illustrations are removed from product cards.

Attribution source: a_wide_high_end_e_commerce_website_homepage_mocku.png. Atlas media ID: ff13d904-0662-46e0-91c7-0b7cf35d4a6d. The production-ready media task is to replace these low-resolution concept crops with per-product verified CAD renders and physical samples as designs are released. Pictures of room furniture, bowls, cosmetics, tools, devices, fishing gear and lighting do not extend the bill of materials.

## Truth and release constraints
No fake price, discount, sales count, review or 'most loved' claim. No invented AI measurement. No purchasing, supplier integration, load rating or manufacturing approval is created. Existing 409 checkout gate is preserved. The selection manufacturingRevision remains null and approvedForManufacture stays false even after import. Full-height wardrobes, lighting, wall fixings and pet restraint hardware are not released by this visual redesign.

## Verification
Build and visual/interaction results are recorded in the pull request after execution. Do not treat this initial document as a test-passed receipt.
