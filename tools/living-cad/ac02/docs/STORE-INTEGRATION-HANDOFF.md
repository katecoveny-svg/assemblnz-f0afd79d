# Continue the existing store, not another separate app

User direction: "Show us what you love. Make it yours." Keep the approved photographic Assembl Living storefront and create a visible Dayrally area within the same application. Preserve room-first navigation and shared saved configurations, not a fishing-only product taxonomy.

Repository context previously read in this conversation: `katecoveny-svg/assemblnz-f0afd79d`; the editorial store work from PR #1619 was merged into `feat/assembl-living-preview-20261017`. Re-read the current repository state before changing anything; the CAD package does not establish the latest branch head or deployment state.

## Deliverable to integrate

Use the file-backed `manifest.json`, `storefront-catalogue.json`, `bill-of-materials.json`, part STEP/STL and assembly GLB files in this delivery. AC-02 files are native geometry, not metadata-only STEP placeholders. `source/` is the source of truth for dimensions and geometric personalisation. The user does not own a printer and does not want inventory or to pack orders.

## New collection areas

- Living: original desk-edge perch; modular double-dovetail desk rail; cup, note, phone, cable and vanity modules; wall organiser, trays and display ledges; rounded planter; small flat-pack shelf; manual dial/optional movement shell; lampshade study; all-printed valet study.
- Dayrally: prominent branded landing inside the same store; the fixed-size case and removable kit contents; small printable accessories; three Dayrally Mini display-bike models (FLOW / DROP / RIDGE), not licensed replicas or rideable bicycles.
- Pets: practical bag-roll dispenser, small accessory clip, name tag and surround for an existing removable bowl. No chew toys, food-contact printed bowls or restraint hardware.

The attachment references are inspiration, not product photos for these new solids. The CAD-derived images here reveal what the new designs actually look like. Do not show a reference planter, full wooden wardrobe, working quartz clock or earlier AI bike render as though it is the physical output of these files.

## One saved configuration

Persist immutable configuration identity, template id, AC-02 source revision, allowable personalisation, confirmed dimensions where required, material/print-process identity, artifact hashes, separate preview state and approval evidence. Names affect native geometry. Customer artwork must be restricted to designated decorative regions. Production geometry must never inherit the orbit camera, explode slider, photo scale estimate or blanket mesh scaling.

A proposed public product remains `digital_prototype` and `approved_for_manufacture: false`. Part/assembly validity does not imply ready-to-sell. The manifest deliberately has no Shopify variant mapping or supplier order endpoint. Map approved CAD and quote revisions to real store variants only after the physical/manufacturing gate is satisfied.

## Photo flow

Upload or browse -> describe the space/problem -> three relevant starting suggestions -> choose base/core/skin -> preview the saved configuration -> confirm critical dimensions or scan/reference scale -> approve a released manufacturing revision -> checkout. A single ordinary photo is not exact metric measurement. Upload privacy, retention and authenticated generation need explicit implementation; do not replace that with a 'connected' banner.

## Release sequence

1. Import the actual GLBs and metadata. Check that a product, BOM, STEP and STL all share the same configuration/revision/hash.
2. Expose Dayrally Mini and the accessory group; default to CAD-derived previews rather than cropped generic room pictures for a specific part.
3. Preserve existing product IDs and old saved designs; add a migration only with an explicit schema version.
4. Rebuild one named sample through the server's controlled CAD worker. Keep dangerous/structural/thermal/fit-critical dimensions locked.
5. Obtain supplier acceptance, slice/assembly quote and sample evidence. One qualified supplier can fulfil the printed kit; nonprinted hardware must be explicitly contracted, not assumed.
6. Use authenticated Shopify checkout and verified paid-order intake. Pin the exact artefact hashes and signed server-side quote. Add idempotency, rejection states and tracking before enabling real dispatch.
7. Ship a preview link and test evidence; never report a payment, order, STEP geometry or physical validation that did not happen.

## Acceptance tests

Native STEP opens as valid solids; downloaded STL reopens watertight; preview mm-to-m conversion is correct; custom name rebuild changes solid geometry; fit edits invalidate earlier approval; captions distinguish concept/geometry/sample photography; no collision in assembled native poses; no unsafe global scaling; defaults remain unorderable; imported client JSON cannot grant production approval; real supplier requests never originate directly from untrusted client code.

This is a handoff file, not proof of dispatch to GPT Work or completion of the store integration.
