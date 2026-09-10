# Public watch presentation

This presentation uses the original 1,025-part watch and its 12-second rendered assembly film. It is a visual layer over existing public copy. Keep the headings, paragraphs, pricing, navigation wording and `HomeGuidePhone` behaviour unchanged when refining it.

## Scope

`PublicWatchFrame` has an exact route allowlist: `/`, `/about`, `/agents`, `/pricing`, `/concepts`, `/pilots`, `/field-notes`, `/how-it-works`, `/trust`, `/contact`, `/faq`, `/docs`, `/hapai`, `/industries`, `/concept-studio`, `/evidence-pack`, `/workflows` and `/journeys`.

Client journeys and product tools do not load this presentation. One NZ remains private through the middleware access gate, including its legacy aliases. It must not appear in public navigation or journey listings.

## Assets and behaviour

- `public/brand/watch/assembl-watch.glb` contains 1,025 meshes and one authored animation, `Scene`.
- The local model-viewer runtime, decoder, HDR lighting and licences sit beside the model. No runtime CDN is required.
- Scroll position advances the assembly timeline and moves the model down the page. The homepage model stops before the live-phone section.
- Drag or arrow keys change the viewing angle. Recentre resets that angle.
- The film opens in a native dialog with playback controls and a close action. Mobile loads the smaller film.
- Reduced motion keeps a still image; the visitor can enable motion explicitly. Data saver avoids automatic model loading. A failed model load leaves the still image and film available.

## Verification, 10 September 2026

- Lint, targeted ESLint, TypeScript and production build passed.
- Original visible copy matched on all 22 inspected pages after excluding new viewing controls and obsolete asset-only labels.
- All 18 presentation routes were checked at 375px without horizontal overflow. Desktop checks covered the landing, scrolling assembly, About, How it works, Contact, FAQ and the phone.
- Film playback and closing, reduced-motion mode and the original FAQ filter worked in-browser.
- The unchanged homepage phone returned a live answer from the existing public agent service in the local preview.
- The model, both films, viewer and decoder support byte-range requests.
- All 54 private-route tests passed. Production One NZ and both aliases returned 401 with noindex and private/no-store headers. The public journey listing omitted One NZ.

## Visual acceptance

Review the large landing watch, scroll through separation and reassembly, play the film, then try the phone. Check text contrast, touch scrolling, the Contact form and FAQ controls at desktop and 375px widths. Kate's visual approval is still required before this presentation is merged. The One NZ privacy fix is already separate from this visual review.
