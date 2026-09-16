# assembl brand system

> The canonical visual system for the assembl company site, product surfaces and the shared base beneath every demonstrator.

**Status:** Locked  
**Last updated:** 17 September 2026  
**Applies to:** assembl public pages, product surfaces, evidence artefacts and the shared frame of client demonstrators

This document overrides older brass, amber, pounamu, cobalt, pearl, canary, grape-purple and Cormorant-led directions wherever they conflict.

## Canonical palette

| Token | Hex | Role |
|---|---|---|
| Deep plum | `#240B21` | Primary type, dark fields, product identity and proof frame |
| Muted plum | `#654A4E` | Secondary fields, solid supporting surfaces and large UI elements |
| Dusty rose | `#916A70` | State, progress, permission, focus and active details |
| Chalk | `#F5F1F2` | Secondary surface, pale field and paper contrast |
| Paper | `#FFFDFB` | Primary canvas and fully opaque type on deep plum |

### Usage rules

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
