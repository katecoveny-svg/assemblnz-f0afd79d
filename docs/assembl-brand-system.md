# assembl brand system

> The canonical visual system for the assembl company site, product surfaces and the shared base beneath every demonstrator.

**Status:** Company canon retained; selected DO Liquid light scope under implementation review
**Last updated:** 2 October 2026
**Applies to:** assembl public pages, product surfaces, evidence artefacts and the shared frame of client demonstrators

This document overrides older directions where they conflict. The company palette below remains canonical. Its cobalt exclusion does not apply to the explicitly selected personal DO Liquid light scope documented below.

## Canonical palette

| Token | Hex | Role |
|---|---|---|
| Deep plum | `#240B21` | Primary type, dark fields, product identity and proof frame |
| Muted plum | `#654A4E` | Secondary fields, solid supporting surfaces and large UI elements |
| Dusty rose | `#916A70` | State, progress, permission, focus and active details |
| Chalk | `#F5F1F2` | Secondary surface, pale field and paper contrast |
| Paper | `#FFFDFB` | Primary canvas and fully opaque type on deep plum |

### Prior DO daylight extension · retained on unmigrated surfaces

The prior 30 September DO direction added lilac `#DAD2F4`, petal `#EAC8DF` and blush `#F5E4E7` for rounded physical forms and shallow supporting surfaces. Deep plum remains the primary ink and DO body; dusty rose retains its state/permission role. These pastels are deliberate additions, not permission for saturated neon or arbitrary palettes.

The DO entry is one sculptural, bevelled D with its inner dot, a lilac rounded tile and an offset petal disc. Optional real 3D uses demand rendering, bounded DPR and pointer response that settles. The complete SVG composition remains available for reduced motion, unsupported WebGL and scene failure. One primary input or action comes before product explanations.

`DoEntryObject`, `DoPresence` and `DoBrand` share the identity across company entry and working app. `scripts/generate-do-identity.mjs` derives browser, phone and native-source icons from the canonical `DoMark` path. Installed native applications are not updated merely by changing source assets.

The selected Liquid light section below supersedes this prior treatment in personal DO. This paragraph records the retained appearance of unmigrated surfaces, not a second active instruction for that slice.

### Company usage rules

- Use deep plum for text on chalk or paper.
- Use paper or chalk for text on deep plum.
- Dusty rose marks state, progress, permission or the active piece. It is not decorative confetti and does not carry small text on deep plum.
- Muted plum is a supporting solid. Avoid using it for long body copy.
- Client colour may replace dusty rose inside a named client demonstrator only. Keep the assembl frame, permission and proof surfaces in the canonical palette.
- Do not add brass, gold, amber, pounamu, cobalt, canary, grape-purple or generic neon gradients to assembl company surfaces.

## Typography

- **Instrument Sans** for headlines, body copy, navigation and controls.
- **IBM Plex Mono** only for wait-state labels, evidence, timestamps, permissions, receipts and proof.
- The wordmark is always lowercase `assembl` and uses a regular or medium weight. It must never appear as `Assembl` or `ASSEMBL`.
- The company letter mark and favicon are lowercase `a`, never a capital A. This does not change the intentional uppercase D in DO or verified client identities.
- Do not substitute a serif in company documents or social cards. Inspect the actual rendered font, not only the configured fallback name.
- Product verbs such as `find it.`, `DO it.` and `show it.` use Instrument Sans, upright. Do not revive old serif/italic treatments as company precedent.

## Assembly grammar

The master visual idea is:

> **things gather, organise and move with purpose until a useful whole is visible.**

Assembl should feel premium, editorial, spatial and composed. The visual language must reveal organisation, preparation or proof rather than merely signal “AI”.

Use two complementary visual modes.

### 1. Brand / narrative assembly

Use for company storytelling, campaign work and cinematic brand moments.

Preferred direction:

- premium aerial, bird's-eye or top-down fine-art composition;
- natural collective behaviour and purposeful gathering;
- abundant negative space;
- deep plum, muted rose and paper-white treatment;
- Aotearoa context where relevant and respectful;
- slow movement from scattered parts into a meaningful pattern or form.

Possible source behaviours include flocks, sheep or cattle moving across land, schools of fish, tides, currents and natural systems. These are metaphors for coordinated intelligence, not decorative stock motifs.

Do not use Māori cultural elements or wildlife as generic visual shorthand. Context, treatment and provenance matter.

### 2. Product / proof assembly

Use when the interface or demonstrator must explain what the product actually does.

Show recognisable inputs becoming one reviewable output:

1. a real trigger or status;
2. customer- or user-approved information;
3. one bounded task;
4. a prepared brief, plan, checklist, draft, journey or action;
5. a named reviewer or visible approval boundary;
6. an evidence receipt or verified result.

Prefer paper, vellum, matte lacquer, restrained interface fragments and brushed nickel. A phone or browser can act as the aperture between source material and the prepared work.

A sculptural visual may establish mood, but it must not replace product proof.

## Imagery

Use one coherent camera, lighting and material world within a sequence.

For narrative brand imagery, a controlled overhead camera can make collective movement and assembly legible. For product proof, keep the view stable enough that a person can understand what changed between states.

Avoid:

- generic AI orbs;
- robot/chatbot imagery;
- floating dashboard wallpaper;
- unrelated mechanical or luxury-object flatlays;
- decorative particle clouds that never resolve into information;
- stock-photo corporate teams;
- fake operational complexity;
- black-heavy SaaS sections as a default visual language.

Important words, controls and evidence labels belong in real interface text, not baked into generated imagery.

## Motion

Motion must reveal causality.

Useful sequence:

`fragmented → gathering → organised → prepared → proof`

For product journeys:

- the trigger opens the work;
- approved pieces move into the preparation surface;
- a user choice visibly changes what is prepared;
- the reviewer or approval boundary becomes clear;
- the evidence receipt locks last;
- the resolved state holds long enough to read.

Rules:

- do not hijack vertical scrolling;
- do not animate long body copy;
- no autoplay audio;
- use restrained camera movement unless the experience is intentionally spatial;
- video and WebGL are enhancements, not prerequisites for understanding;
- reduced-motion users receive the complete assembled state;
- no required information may exist only inside a canvas.

## DO identity — confirmed 16 September 2026

DO is always `DO`, never `DOO`.

Its canonical symbol is the glowing D with the small luminous o/dot inside, implemented by `components/do/DoMark.tsx`.

Preserve its deep plum body and warm rose glow across web, browser, PWA and Mac surfaces. This explicitly approved product identity is the exception to the generic-orb exclusion above; it does not authorise unrelated orb decoration.

The specialist section reads `Meet your To DO’s.` with the DO identity. Specialist characters may supplement the canonical DO identity but must not replace the product mark.

### Builder DO spelling

The software-building specialist is **Builder DO**, with a space and uppercase DO. Preserve existing storage keys and internal identifiers where required for compatibility.

## Pursuit, DO and Studio family resemblance

All three products share palette, typography, restraint, evidence treatment and the assembly grammar, but their emphasis differs.

- **Pursuit:** evidence, source, change, opportunity, provenance and next action.
- **DO:** intent, context, work state, permission, prepared output, action and receipt.
- **Studio / SHOW:** tangible proof through working experiences, image, film, motion, 3D, websites, advertising, campaigns and customer-experience prototypes.

DO should be visually primary where the user is being asked to start with a job. Studio must feel genuinely visual and experiential, not like a text file browser.

## Client demonstrators

A named client demonstrator uses two layers:

1. **Assembl frame** — provenance, permission, proof labels and the surrounding product logic;
2. **verified client brand** — current client colour, typography, imagery and interface cues where appropriate.

Never infer client branding from an old screenshot when current source material can be verified. Never use a client logo as an endorsement without authorisation.

## Truth is part of the brand

Visual polish must not blur runtime status.

Use explicit labels where appropriate:

- `LIVE / VERIFIED`
- `CONNECTED / UNVERIFIED`
- `PREVIEW`
- `PROPOSED`
- `SIMULATED`
- `DRAFT`
- `READY FOR REVIEW`
- `WAITING FOR APPROVAL`
- `COMPLETED / RECEIPT`

A connected key, green light, successful build, animation or preview is not proof that an external action happened.

## Accessibility and resilience

- preserve semantic reading order;
- keyboard-operable controls and visible focus states;
- colour never carries status alone;
- practical touch targets;
- reduced-motion support;
- mobile layout reviewed at 375px;
- captions/transcripts for meaningful video or audio;
- no hover-only critical interactions;
- proposition and primary action remain available if image, video or WebGL fails.

## Operational guide

Agents and designers should also read root `DESIGN.md` for composition, motion/3D, client-work and quality-gate rules.

## DO Liquid light · selected direction, implementation under review

Kate selected Liquid light on 1 October 2026. This supersedes the DO daylight material/palette for the personal DO slice only; company plum/paper remains canonical while the shared assembl identity rollout is reviewed. Installed icons, other DO routes and named client brands are not changed by this slice. The lowercase assembl wordmark/company a and the uppercase DO D with its interior dot remain fixed. DO is the personal agent inside assembl; the platform is not renamed DO. Consumer DO contains no Pursuit/Studio promotion.

Machine-readable DO roles live in `lib/brand/do-identity.ts`, applied as scoped CSS variables by `PersonalDo`. Do not extend customer `BrandConfigSchema` or reuse historical kete tokens for this system. Keep the existing personal entry/assistant modules; do not introduce an alternate live stylesheet or fixture parser.

| Role | Colour | Use |
|---|---|---|
| Ice | `#D8EAF8` | Personal DO canvas, disabled control surface |
| Cobalt | `#244FCA` | DO body, primary control, focus |
| Ink | `#172D55` | Readable type on pale fields |
| Peach | `#F4C1A0` | Interior dot, supporting object; never a status colour |
| Mint | `#CBEEE2` | Review/supporting plane |
| Paper | `#FFFDFB` | Opaque composer, paper type on cobalt |
| Hover / active | `#1D42B0` / `#17378F` | Primary control states |

Instrument Sans remains headline/body/control; IBM Plex Mono remains evidence/status. Spacing: 4/8/12/16/24/32/48/64; control radius 24 or 999, composer 32, review 40/56. Minimum target 44px, phone input 16px, phone edge 22px. Glass does not sit behind small type; controls and consent remain opaque and upright.

DO recognisability comes from the canonical `DO_MARK_PATH` and dot (30,32,r6). Tiny launchers retain an opaque cobalt D outline and separate cobalt dot so both remain distinct on ice; peach is reserved for the larger material treatment. The representative personal shell uses the exact approved 03A cobalt, peach and mint glass artwork as static art. Its luminous refractive material anchors the composition; it is not a real-time 3D implementation. Do not replace it with a giant extruded D. Canonical D-dot remains in the header, launcher and icons. The dot is identity, never evidence of connectivity or completed work.

The selected hero remains identical with reduced motion and requires no WebGL. Existing optional 3D elsewhere keeps demand-rendering and context-loss safeguards; the rejected DO05 renderer modifications were removed. Preparation labels remain truthful; ready for review and completed are different states.

Approved product language is direct: “What needs doing?”, “Ask DO”, “Make a checklist”, “Paste a notice or tell DO what needs sorting…”, “Start”, “Review before sharing.” Keep existing source/provider consent, ondevice storage truth and access/error states. Never imply an active diary, calendar booking, inbox connection, persistent memory or completed external action without verified capability.

Rollout gates: inspect actual personal DO controls at desktop/375px/reduced motion; check actual font rendering, glass material, focus/readability, existing consent and guest state; root review before one final draft PR. Icon generators andbrand tests have a separate owner review; source changes do not update installed PWA/extension/Mac apps. Company mark stays lowercase a, DO stays D-dot. Named client brands are excluded. This section records the selected direction; the implementation remains a proposal until visual review passes.

Optical material tints (`DO_GLASS`) are controlled derivations of cobalt/ice: tint `#AFC9FF`, highlight `#B8DCFF`, reflection `#A9D5F9`. They are not additional interface colour roles.

### Implementation scope and deferred rollout

This is a scoped DO06 proposal, not a locked or completed company rebrand. `DO_IDENTITY` is the personal DO interface role source; `DO_GLASS` supplies only the small static presence material. Artwork is the exact selected 03A asset, not a new colour system.

| Surface | Current proposal | Deferred work / evidence gap |
|---|---|---|
| Personal DO entry, input and review | 03A static artwork, scoped roles, existing controls | Root visual approval; authenticated runtime review |
| Personal DO example disclosures | Ice / peach / mint, ink copy and cobalt illustration accents | Inspect disclosed examples in final batch |
| Personal DO Local information summary | Cobalt icons, ink caption and copy, ink-derived border | Expanded care/weather content remains its existing component styling until separately reviewed |
| Personal DO signed-in empty draft presence | Explicit glass finish using the same shared roles | Signed-in pixels not verified; no auth fixture introduced |
| Other DO routes, consent and public widgets | Existing behavior and identity retained | Separate surface-by-surface design rollout; no permission semantics changes |
| DO favicon, PWA, extension and Mac packages | Existing installed identity retained | Generator-owner review, canonical D-dot exports, install/update proof |
| assembl company frame and lowercase a assets | Existing company canon retained | Company visual review and generator rollout; never copy the DO hero into company/client identities |
| Named client brands | Untouched | Explicit client scope required |

Sequence: approve the local personal slice and review the batched findings; then one reviewed draft PR. Review other DO surfaces next, followed by generator-derived packages and installed-app verification. Company rollout requires its own approval. No public deployment or whole-brand completion is implied by this proposal.

Saved personal finishes remain distinct from the fixed hero artwork. The existing Rose/Orbit/Pebble/Spark companion appears beside start controls and Settings explains this scope; no stored preference changes. Root must appoint and obtain acceptance from the identity-generator owner before any cross-package rollout; no whole-company lock or completed rollout is claimed.
