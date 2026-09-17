# The living atelier / delivery evidence

## Full visual pass

GitHub Actions run `35279182245` completed successfully for head `88ffe5954de13d993961928c9387788e1843dfbe`. Artifact `10522850034` contains 29 screenshots and the JSON report.

All ten browser cases passed: homepage, Pursuit, DO and Studio at 1440 × 1000 and 375 × 812, plus reduced-motion and JavaScript-disabled mobile content. The eight normal page cases returned 200, had no horizontal page overflow and recorded no unhandled page errors. Homepage, Pursuit and Studio had one primary navigation each.

Scene chapters, living-brief buttons, native keyboard slider, desktop pointer tilt, exact existing workspace links, Studio selections and user-initiated video were exercised. All three selected Studio images decoded successfully. The measured card-to-control gaps were 14.8 / 17.9 pixels on desktop and 25.6 / 28 pixels on mobile for the DO / Studio brief states.

Screenshots confirmed the mobile label no longer overlaps the output and desktop chapter controls now have a readable glass backing. The published Vercel deployment for the polish merge was READY with the www.assembl.co.nz alias.

## Final imagery correction

Decoded images exposed a legacy grape-purple DO render in the identity selection. Replace it with `public/do/canvas/identity-plum.svg`, using the exact symbol path and dot from `components/do/DoMark.tsx`, in the canonical plum / rose / paper palette. This is an owned vector composition, not borrowed reference-site art. The retired PNG remains in the repository for compatibility but is no longer selected by the new gallery.

This asset-only follow-up keeps the same gallery controls, routes, layout and media behaviour. A targeted source/asset test prevents the purple PNG from returning. The new asset has been rendered and inspected locally; its new browser run is separate from the completed run above and must not be described as completed before it finishes.

## Research licensing clarification

The reference report is about transferable design principles. Licences differ by project; do not read its general warning as a claim that every reference has closed-source code. Bruno Simon explicitly publishes portfolio source under MIT. No reference-site source, artwork or branding was copied into this build. Check code and assets individually before future reuse.

## Boundaries

This is a public-site design release, principally the homepage and Studio, with Pursuit navigation repaired. Client hubs and full Creative Studio remain the existing authenticated products. Exact links were tested, not private membership or post-login content. Authentication, billing, client records and provider permissions are untouched.

The captures are Chromium browser tests, not a physical iPhone / Safari performance certification. No frame-rate, conversion or commercial-results claim is made.
