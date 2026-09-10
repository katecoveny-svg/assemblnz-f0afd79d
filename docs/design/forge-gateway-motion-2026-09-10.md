# Forge and Gateway transport review — 10 September 2026

## Delivered

Forge now opens with a blue Subaru WRX assembly film and an optional interactive 3D study. Gateway, on `/agents/customs`, has separate boat and aircraft scenes. Each has a 12-second separate, float and reassemble sequence, pause/reset, keyboard scrubbing, drag rotation in 3D, and an optional scroll-controlled timeline.

The new dealership content studio is on `/agents/forge#forge-content`. It supports 11 named marques and a custom marque, four campaign types, supplied vehicle facts, a browser-local vehicle photograph, and four editable outputs: social copy, a listing, an email and a 15-second production script. Exports include a portrait or square PNG and a ZIP with all copy plus a review record.

ARC remains exactly as approved at 8e295d29515a84796bc270f75cce704004781671. Existing Forge and Customs copy modules, flags, chats, gates and links are retained. Homepage, Ensemble and private journey rules are unchanged.

## Media and provenance

| Subject | Film | Editable geometry |
| --- | --- | --- |
| Subaru WRX | Higgsfield, 12 seconds, 1080p | 661 animated objects |
| Coastal cargo vessel | Higgsfield, 12 seconds, 1080p | 1,584 animated objects |
| Cargo aircraft | Blender, 12 seconds, 1080p | 156 animated objects |

The three illustrative models contain 2,401 individually editable objects, portable materials and animation tracks. Blender projects and Draco-compressed GLB files are supplied. All three models also exist in a private Higgsfield 3D Jutsu project at revision 1:
https://higgsfield.ai/3d-jutsu/741e76d3-e3bf-4d92-9070-867d4fa40b78

The Subaru reference was guided by Subaru New Zealand's official WRX imagery:
https://www.subaru.co.nz/showroom/wrx/wrx-24t-ts

Original high-quality references were generated in Higgsfield using gpt_image_2. Subaru and boat films were generated using seedance_2_5. The aircraft video request was rejected before submission because the Higgsfield account had run out of credits; its film was rendered from the editable Blender model instead. No new plan or credits were purchased.

These are concept illustrations, not manufacturer CAD, real stock photographs, engineering instructions, Customs clearances or brand partnerships. The generative Subaru/boat films and editable studies share an assembly direction but are not frame-identical models. Generated motion can include small visual inconsistencies. The aircraft film is rendered from its supplied model.

## Content generation boundary

The endpoint uses the existing Muse/Gemini text integration when available. When the provider is unavailable or its output is invalid, it returns a clearly labelled template using the supplied facts. Local browser testing received the template fallback; this does not prove a live model connection.

Vehicle photos remain in the browser and are never sent to the text endpoint. Briefs are submitted for drafting. Switching marques clears the previous vehicle model, facts and photograph. Drafts remain editable; changes to the brief disable copying and export until a new campaign is created. Nothing sends to customers, creates stock records, spends ad budget or publishes.

## Verification

- Repository lint, targeted component lint, TypeScript check and production build passed.
- 77 targeted tests passed across dealer content, Forge/Gateway flags, craft and private-journey protection.
- All three GLBs contain a single assembly clip and per-object animation. Start/end transform drift is zero in the saved verification records.
- Subaru and boat films were inspected at multiple phases. The aircraft's assembled and exploded render frames were inspected.
- Browser checks at desktop and 375px: film playback, Film/3D switches, pause, scrub, exploded view and no horizontal overflow. Boat and aircraft controls were checked independently.
- The dealership form generated a Subaru campaign and a Toyota campaign. Changing marque cleared old facts. A photo was uploaded through the real file picker, an email draft was edited, and a real ZIP download was opened to verify all three expected files, the edited text, method and photo provenance. The exported 1080 × 1350 PNG was inspected.
- Reduced-motion and offscreen pause are implemented. Reduced motion was verified in source; an OS-level reduced-motion setting was not changed during this review.
- ARC and existing copy files have no diff from the approved review version.
- Anonymous access to the current public One NZ route returned HTTP 401; 54 private-journey tests passed.
- Production publishing remains separate from this draft review.

## Source map

- `components/agent-app/TransportStudy.tsx`: film/3D player and scene selection.
- `components/forge/DealerContentStudio.tsx`: form, editable outputs, local photo and downloads.
- `app/api/forge/content/route.ts`: validated, rate-limited drafting with explicit fallback.
- `lib/forge/dealer-content.ts`: brief schema, template and export record.
- `scripts/blender/transport_assemblies.py`: reproducible Blender geometry and animation.
- `public/brand/transport/`: compressed media for the website.
