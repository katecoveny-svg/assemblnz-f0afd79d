# assembl — DESIGN.md

> Operational design guide for agents, designers and builders working on assembl surfaces.
>
> Canonical visual tokens and identity live in `docs/assembl-brand-system.md`. Public language rules live in `docs/assembl-copy-standard.md`. If this file conflicts with either, the canonical documents win.

**Last updated:** 17 September 2026

## 1. design principle

Make the product obvious before making the technology impressive.

Assembl should feel premium, editorial, spatial and composed, but visual craft must always reveal useful work, causality or proof.

The core visual sentence is:

> **things gather, organise and move with purpose until a useful whole is visible.**

This is assembly, not generic AI theatre.

## 2. brand tokens

Use the current company palette:

| Token | Hex | Use |
|---|---|---|
| Deep plum | `#240B21` | Primary type, dark fields, product identity, proof frame |
| Muted plum | `#654A4E` | Supporting fields and large secondary surfaces |
| Dusty rose | `#916A70` | State, progress, permission, focus and active detail |
| Chalk | `#F5F1F2` | Pale secondary surface |
| Paper | `#FFFDFB` | Primary canvas and type on deep plum |

Typography:

- **Instrument Sans** — headlines, body, navigation, controls and normal product UI.
- **IBM Plex Mono** — evidence, timestamps, permissions, proof, receipts and compact system labels only.
- Wordmark is always lowercase `assembl`.

Do not revive old company directions from legacy surfaces: Cormorant, champagne, gold, brass, pounamu master palettes, canary yellow, grape-purple UI or generic neon AI gradients.

## 3. two approved visual modes

Assembl uses two complementary visual modes. Choose the one that best explains the job.

### A. brand / narrative assembly

Use when the purpose is emotional positioning, brand storytelling, campaign work or a cinematic hero.

Direction:

- premium aerial, bird's-eye or top-down fine-art composition;
- natural collective behaviour and purposeful gathering;
- abundant white or paper negative space;
- deep plum, muted rose and near-white treatment;
- an Aotearoa sensibility where relevant and truthful;
- restrained movement that resolves from many parts into one meaningful form.

Useful source behaviours can include:

- birds shifting direction;
- sheep or cattle gathering across land;
- schools of fish;
- currents, tides or river systems;
- native flora or natural forms organising into a recognisable pattern.

The visual should feel commissioned from a high-end creative studio, not generated from a stock prompt.

Do not use wildlife or Māori cultural elements as decorative shorthand. Use them only when the context, treatment and provenance are appropriate.

### B. product / proof assembly

Use when the purpose is to explain what the product actually does.

Show recognisable inputs becoming one reviewable output:

1. a real trigger or status;
2. permitted context or evidence;
3. one bounded useful task;
4. the prepared brief, plan, draft, checklist, journey or action;
5. the reviewer or approval boundary;
6. the evidence receipt or verified result.

Prefer paper, vellum, matte lacquer, brushed nickel, physical cards, documents and restrained interface fragments. A phone or browser can act as the aperture between source material and prepared work.

Do not substitute a chrome sculpture, particle cloud, floating dashboard or cinematic transition for product proof.

## 4. composition

The base feeling is warm paper, not black SaaS.

Default rules:

- generous negative space;
- strong editorial hierarchy;
- one primary idea per viewport;
- asymmetric layouts are welcome when reading order remains obvious;
- large typography may carry the composition;
- use fine rules and quiet borders rather than heavy cards;
- avoid dense grids of equal-weight modules;
- use rounded geometry deliberately, not as a default for every container;
- keep important actions close to the explanation they belong to;
- do not hide the proposition behind an intro film or long animation.

At 375px wide, the interface must still make the proposition, primary action and state understandable without horizontal scrolling or hover.

## 5. DO identity

DO is always written `DO`, never `DOO`.

The canonical DO symbol is implemented in `components/do/DoMark.tsx`: a glowing D with the small luminous o/dot inside.

Rules:

- preserve the deep-plum body and warm rose glow;
- this approved identity is the exception to the general ban on generic orbs;
- do not replace it with an unrelated sphere, chatbot face or mascot;
- keep its behaviour calm and legible;
- DO surfaces should make work, context, permission and receipts visible rather than becoming a chat window with decoration.

Builder product naming is **Builder DO**.

## 6. Pursuit, DO and Studio should feel related but distinct

### Pursuit

Visual priority: evidence, change, opportunity and provenance.

Use:

- strong signal hierarchy;
- source/freshness labels where real;
- clear movement from signal to opportunity to next action;
- compact evidence metadata in IBM Plex Mono;
- maps, timelines, account views and opportunity objects only when they improve comprehension.

Avoid turning Pursuit into a generic CRM table or news feed.

### DO

Visual priority: intent, current context, work state, permission, output and receipt.

A DO should make it easy to answer:

- what am I asking it to do?
- what context is it using?
- what is happening now?
- what needs my approval?
- what was produced or changed?
- what evidence exists?

### Studio / SHOW

Visual priority: make the possibility tangible.

Studio must visibly be capable of producing:

- working demonstrators;
- websites and microsites;
- interactive customer journeys;
- campaign and advertising concepts;
- image and visual systems;
- video and film;
- motion and 3D;
- pitch and sales experiences;
- product/CX prototypes.

Studio should not present as a text-only library of generated files.

For named prospects, retain an **Assembl frame** around verified client branding. Never invent client assets, partnerships or endorsements.

## 7. motion and 3D

Motion must explain change.

Preferred sequence:

`fragmented → gathering → organised → prepared → proof`

Rules:

- use movement to reveal causality, state or assembly;
- keep camera movement restrained unless a cinematic spatial journey is the concept itself;
- avoid endless ambient movement competing with reading;
- no scroll hijacking;
- do not animate long body copy;
- no autoplay audio;
- video enhances the experience but must not be required to understand it;
- preserve a complete static state when JavaScript, WebGL or video is unavailable;
- pause expensive animation offscreen;
- respect `prefers-reduced-motion` and show the resolved state instead;
- never place required information only inside a canvas.

For 3D, use a specific metaphor tied to the product or opportunity. Do not add “3D” by rotating a decorative object beside otherwise unchanged content.

## 8. generated imagery and film

Generated creative should follow the same art direction as commissioned work.

Quality bar:

- intentional camera and lens language;
- coherent material and lighting world;
- no accidental text or fake UI baked into imagery;
- no stock-photo genericism;
- no unrelated sci-fi interfaces;
- consistent subject scale and perspective across a sequence;
- use real HTML for important words, controls and proof labels;
- disclose concept/simulation status where an image could be mistaken for real operational proof.

For Assembl brand films, overhead movement and collective natural forms can create the sense of intelligence emerging from organisation. For client work, the visual metaphor should come from the client's real context rather than forcing the Assembl nature motif into every project.

## 9. copy inside design

Use short, concrete New Zealand English.

Current company architecture can be expressed as:

> **assembl the work.**
>
> **find it. DO it. show it.**

Product labels:

- **Pursuit** — find the work.
- **DO** — do the work.
- **Studio** — show the possibility.

A page should name the useful output rather than hiding behind abstract AI language.

Use labels such as `PREVIEW`, `PROPOSED`, `SIMULATED`, `DRAFT` or `READY FOR REVIEW` whenever the runtime state requires them.

Never style an unverified capability to look live.

## 10. truth and proof are visual requirements

The interface must distinguish:

- live / verified;
- connected but not yet tested;
- preview;
- proposed;
- simulated;
- draft;
- waiting for approval;
- completed with receipt.

A green dot, connected key, successful build or animation is not evidence that an external action occurred.

Whenever a consequential action exists, make the permission boundary visible before the action and the receipt visible after it.

## 11. customer journeys, waits and sponsorship

Wait states are a capability within the wider Assembl system, not the company's entire visual identity.

When designing a productive wait:

- use a genuine existing wait;
- make any participation optional;
- ask only one useful thing at a time;
- explain how the answer changes what is prepared;
- preserve the underlying service if the customer skips;
- name rewards and sponsors clearly;
- never create artificial delay for engagement;
- never disguise an advert as customer help.

Principle:

> **utility first. reward second. interruption never.**

## 12. client work

For a named client or prospect:

1. verify the current client visual system before applying it;
2. retain enough Assembl framing to make the origin and proof status clear;
3. use client colour, imagery and tone where appropriate;
4. keep permission, evidence and simulation labels unambiguous;
5. never use a client logo as an endorsement unless authorised;
6. never invent metrics, testimonials, integrations or campaign results;
7. design the experience around the client's real customer or business problem.

## 13. accessibility

Every visible product change must account for:

- semantic headings and landmarks;
- keyboard operation;
- visible focus states;
- readable contrast;
- colour never carrying state alone;
- practical touch targets;
- reduced motion;
- mobile reading order matching visual order;
- captions/transcripts for meaningful video/audio;
- no hover-only critical actions.

## 14. anti-patterns

Do not ship:

- generic AI orb as the main idea;
- robot/chatbot illustration;
- black-heavy dashboard wallpaper;
- neon blue/purple gradients without product meaning;
- particle clouds that never resolve into information;
- giant glass cards full of tiny text;
- fake live feeds;
- fabricated charts or metrics;
- autoplay sound;
- decorative 3D unrelated to the task;
- motion that delays access to the product;
- old palette/type directions because they remain in legacy code;
- a client brand treatment inferred from memory when current assets can be checked.

## 15. quality gate

Before calling a visual surface done, verify:

- a first-time viewer can state what the product/page does;
- the primary action is obvious;
- the composition follows current palette and typography;
- the visual metaphor explains assembly, work or proof;
- any client treatment is verified and scoped;
- preview/simulation/live states are honest;
- mobile at 375px is usable;
- keyboard and focus behaviour work;
- reduced motion works;
- important information survives without animation/WebGL/video;
- there is no banned legacy colour/type drift;
- visible changes have visual proof.

The standard is not “looks like AI”.

The standard is:

> **clear enough to understand, beautiful enough to remember, truthful enough to trust.**
