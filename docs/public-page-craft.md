# Public page craft upgrade

The public company pages use the cinematic plum and rose material direction: Instrument Sans, restrained mono labels, full-width artwork, clear reading space and purposeful motion.

## Scope

Seventeen landing pages were rebuilt: `/agents`, `/pricing`, `/about`, `/pilots`, `/field-notes`, `/concepts`, `/journeys`, `/how-it-works`, `/contact`, `/trust`, `/faq`, `/concept-studio`, `/evidence-pack`, `/industries`, `/workflows`, `/docs`, and `/hapai`.

Supporting public policy, documentation and reading pages share the navigation, footer, type and paper surface through `public-route-canon.ts`. Only listed paths and the documented reading families opt in. Retired routes retain their redirects.

The homepage, its live phone agent, specialist agent apps, named client journeys, customer workspaces and private tools retain their existing interfaces.

## Components

- `PublicChrome.tsx`: navigation, mobile menu, footer and route-scoped reading surface.
- `PublicPage.tsx`: hero, editorial headings, detail rows and links.
- `PreparationDemo.tsx`: four user-selected preparation stages. It saves and sends nothing.
- `public-craft.css`: responsive styles, optional scroll-linked artwork and reduced-motion rules.
- The agent catalogue uses the existing narrow public roster projection. Search and category filtering never ship prompts or tool configuration.

Contact, checkout, security-pack, library signup, workflow browser and documentation search components remain connected to their existing handlers. No contact, payment, email or security-pack submission was made during testing.

## Artwork

Three images were generated with Higgsfield on 10 September 2026, then resized and encoded for the website. These are decorative material studies, not screenshots or evidence of product capabilities.

| File | Subject | Generation ID |
| --- | --- | --- |
| folio.webp | Prepared paper, vellum and rose metal clip | b6532210-b042-4231-accc-b70c9038ad7f |
| tiles.webp | Satin plum task pieces with rose metal edges | 921bd46b-cdaf-4af8-b021-f1835247261c |
| receipt.webp | Paper receipt, glass and rose metal frame | afca6dc9-c89c-4152-aeb7-f29b96422750 |

The three WebP assets total about 174 KiB. Requested model: nano_banana_pro; provider result metadata: nano_banana_2. No new runtime dependency is required.

## Verification

- Production build, TypeScript, required lint and targeted lint pass.
- 21 route-boundary tests pass, including exclusions for the homepage, working agents and client journeys.
- 30 public routes returned HTTP 200 from the local production server.
- 136 internal links were checked. A missing Hui share image was found and given its own image route.
- Browser checks at 390 px found no horizontal overflow on the 17 rebuilt landing pages and 11 supporting public pages.
- Agent search returned the expected specialists; mobile menu, Escape focus return and the preparation control worked.
- Desktop hero artwork and phone layouts were visually inspected.
- Remaining review: final 375 px and desktop sweep, reduced-motion browser check, filter/FAQ interactions, and preview visual review. Browser automation was interrupted when the Mac locked.

This is a source and preview upgrade. Production publication and human visual approval are separate.

