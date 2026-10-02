# assembl + DO · Liquid light identity proposal

Direction A selected by Kate. This is the reviewable identity specification, not a production release or new capability claim. Current-main verified at5ba9818f97470c2feacdfff661e7889ff059ba9e using permittednetworkescalation. Actual-shell desktop, phone and tablet pixels have been verified in an isolated Playwright session; signed-in runtime remains unverified.

## One identity, two names

assembl is the platform. Its wordmark remains lowercase Instrument Sans medium, upright. Its company mark remains lowercase a. DO is the personal agent inside assembl, using the existing uppercase D outline and interior dot. Consumer lockup: D-dot + DO / by assembl. Company lockup: assembl; DO appears as a named product, never as a replacement platform name. No Pursuit/Studio links inside the personal DO experience. Named client brands are excluded.

## Recognisable DO

Reuse DO_MARK_PATH from components/do/DoMark.tsx without changing its silhouette, proportions or dot position (30,32,r6). Render a 7-unit stroke in the64-unit viewbox, rounded joins. Every material treatment must retain the D's left spine, rounded bowl and separate inner dot. The dot is identity, not a status indicator. Status is a labelled adjacent element. The canonical mark remains on identity controls; the approved static glass sculpture is the separate hero artwork.

16–24px: opaque cobalt D + cobalt dot on ice, no reflections or glow. 32–64px: same geometry, one fine highlight permitted; peach dot requires a contrasting cobalt rim. App icons: rounded ice tile, central cobalt D-dot, safe area verified separately for maskable icons. Hero: the exact selected 03A static glass artwork. Do not require a giant D in place of that artwork. The separate identity mark remains legible without reflections. Monochrome: stroke and dot both currentColor. Accessible label comes from the launcher/link, SVG is decorative.

## Tokens proposed for canonical canon

ice #D8EAF8: DO canvas; cobalt #244FCA: identity, primary control; ink #172D55: all small copy on pale fields; peach #F4C1A0: interior dot/supporting object; mint #CBEEE2: review surface; paper #FFFDFB: opaque field and type on cobalt. Existing plum company palette remains until cross-platform review. No colour implies connection, permission, saving or completion.

Instrument Sans headline/body/control; IBM Plex Mono status/evidence only. Spacing4/8/12/16/24/32/48/64. Control radius24 or999; input32; review40/56; sculptural tile40/70/44/60. Minimum target44px. Minimum input text16px on phone. Edge gap22px phone /5vw desktop. Keep controls upright; reserve slight uneven geometry for material/supporting forms.

Buttons: default cobalt/paper; hover #1D42B0; active #17378F; focus2px ink plus2px paper separation; disabled ice/ink with explicit disabled semantics and no colour-only explanation; working keeps label plus progress, never a success check. Error uses labelled opaque ink-on-paper notice, not peach-only text. Review-ready is distinct from completed.

## Material and motion

One top-left soft key light; pale ice environment; cobalt edge remains dense enough to read; peach dot opaque enough to separate; no bloom crossing controls. Never put small text over refracting glass. Use opaque input and review surfaces.

Input becomes a bounded reviewable result. The selected hero artwork is static in every motion setting. No perpetual pulse or background simulation. Reduced motion: identical final composition, no transform transition. SVG/static fallback must carry the complete identity and usable controls. Keep existing demand-rendering/DPR/offscreen safeguards.

## Grounded consumer language

Heading: What needs doing?
Input: Paste a notice or tell DO what needs sorting…
Modes: Ask DO / Make a checklist
Local action: Start
Generated result: Review your next steps
Permission: Review before sharing.
Availability: Your workspace could not load. Try again; nothing has been changed.
Do not claim always-on memory, saved diary, booked calendar or completed action without verified runtime evidence. Preserve current source/provider consent, access-state copy and all external-action boundaries.

## One source of truth and ownership

After root review: amend docs/assembl-brand-system.md to explicitly supersede DO daylight extension with the selected DO Liquid light specification; do not silently overwrite the company palette. Existing lib/brand/brand-config.ts is specifically the customerops schema and must stay untouched. Scoped personalDO tokens now live in lib/brand/do-identity.ts, with its CSSvariable export; this is the single machine-readable DO source. Remove literal duplicated colours only from migrated DO scopes. Do not use historical lib/brand-tokens.ts (kete colours) as the new canon.

Design owns docs/assembl-brand-system.md proposal, components/do/DoMark.tsx treatment preservinggeometry, DoPresence/DoEntryObject/DoObjectCanvas material, DoBrand lockup, do-unified/entry/personal CSS and appearance only. Preserve PersonalDo/LifeAdmin/Assistant handlers, keys, refs, access loading, sourceconsent and API requests. Backend owners retain memory/calendar/auth/provider/schema paths.

Identity generator owners: scripts/generate-do-identity.mjs and scripts/generate-assembl-identity.mjs, lib/brand/assembl-identity.test.ts, lib/brand/__tests__/wordmark.test.ts, scripts/brand-guard.mjs. Coordination with that owner remains pending because thread messaging tools are unavailable here. Guard colour rules must reflect explicit approved surface scope, not a blanket cobalt ban or arbitrary exception.

Rollout1: isolated real PersonalDo/LifeAdmin shell, existing controls only, nofixture parser. Desktop375px/reduced-motion/input focus/readability/consent andsigned-out/error checks. Rollout2: generator-derived DO webfavicon/PWA/sharewidget/extension/Mac source packages, then install/update verification; updating sources does not update installed apps. Company lowercasea favicons/PWA remain distinct, refined using their canonicalgenerator. Rollout3: shared assemblframe after company review; namedclientbrands untouched.

One final draftPR after current-main refresh and local rootreview. No intermediatepush, heavybuild, Vercelpreview or publication. Acceptance: actualrenderedfonts, canonical path+dot at16/32/64, exact approved artwork at hero scale, contrast measured,375pxoverflowfree, static fallback complete, noauth/provider/schema/behaviourdiff, brandtestsupdatedwithowner, onebatchbuildslot agreed.

## Current isolated slice — DO06 / exact approved artwork

Main: `5ba9818f97470c2feacdfff661e7889ff059ba9e`. Branch: `design/do-paper-stage`. Loopback actual app: http://127.0.0.1:4319/do/personal.

DO05 was rejected as a regression. DO06 uses the exact approved 03A image, copied without pixel edits to public/brand/do-liquid-light.png. It is static artwork, not real-time 3D. Canonical D-dot remains in the header. The rejected DoObjectCanvas, DoEntryObject and its CSS changes were removed; those source files now match main.

A smaller working composer layers beside the luminous cobalt/peach/mint sculpture. The review surface displays two actual existing task titles, with no new parser or fixture engine. Phone uses a smaller illustration beside the heading; Start is visible at y518 in an 812px viewport. Examples and secondary functions stay progressively disclosed. Existing consent, access, API calls and handlers are unchanged. No auth/provider/schema changes.

Fresh isolated Playwright Chrome inspected actual desktop1440 and phone375 pixels. Widths equal viewport widths. Instrument Sans and IBM Plex Mono were previously verified in the same actual shell; the font configuration remains unchanged. The selected hero is static in both motion settings; reduced-motion canvas count is zero. The local fictional school notice was exercised through existing controls. No real records or external actions were created. Guest auth401s are expected; authenticated runtime remains unverified. Development HUD hidden only for captures. Protected user tabs untouched.

Checks: focused ESLint, full TypeScript, 37 local-engine/example/contrast tests, brand guard and diff check passed. No Next full build, push, deployment, merge or PR. Original dirty checkout untouched. Source archive contains all changed files and the exact artwork. Root visual approval remains required before any rollout; DO05 screenshots are superseded.

The independent plugin owner may use its single Git-preview/required-CI slot after root source review; no heavy-build slot is held here. Existing brand generator/guard/test ownership remains unchanged.

Native Library evidence: desktop libfile_50239ba0835481919aa7e8ed0f937ffd; phone libfile_537daddbce308191abf9704ea0005748; desktop outcome libfile_32481a67a7d881918dde4ec11e206020; phone outcome libfile_8f21ba54159c8191aa8beb2104ac8d66; reduced motion libfile_7ce84ed375d08191a5cbbd5d3e545aca. All five uploads succeeded and actual pixels were inspected.

## Narrow review correction

Local information summary icons/captions/borders now use the same scoped cobalt/ink roles. Disclosed examples use ice, peach and mint plus shared ink/cobalt illustration roles. The existing signed-in empty-draft presence opts into glass explicitly; its authenticated render remains unverified. These are appearance-only corrections; no state or request logic changes. The canonical scope/deferred table is in docs/assembl-brand-system.md. Hold push until root batches final review findings.

Tablet correction: stack review and composer through1023px. Settled actual geometry at768/820/1024 has no intersecting review/input rectangles and no horizontal overflow. At1024 composer420px and review451.6px have a50.2px horizontal gap. Saved profile.avatar is represented by the existing PersonalDoCharacter beside the start controls; Settings explicitly scopes finish versus fixed hero artwork. Rose/Orbit/Pebble/Spark are existing personal preferences, not alternate brand tokens. No stored preference or API change.

Rollout accountability: this design owner supplies the scoped token/canon proposal and personal slice. Root coordinates visual approval and appoints the identity-generator owner for favicon/PWA/extension/Mac exports and installed-update proof before that rollout begins. Generator paths and existing tests/guard remain with that owner; no absent owner acceptance is claimed. Backend owners retain memory/calendar/auth/provider/schema. Company frame and lowercase-a deployment are a separate root-approved design workstream; client brands untouched.

Final correction proof: 768px libfile_60bdedd391fc8191a76866fbb0d32a81; 820px libfile_be12216b87cc8191a2ec369e9da090b2; 1024px libfile_75226d5accd88191ac1a7a5396ca24bc; disclosed examples / local information phone libfile_6098fbf1356c819191efb51968d4fb90. Native uploads succeeded; all actual pixels inspected. Full TypeScript and focused ESLint pass; final local-engine/example/brand/contrast suite passes 54 tests.
