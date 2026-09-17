# assembl / the living atelier
## Immersive-web research and implementation direction

Research date: 18 September 2026. Scope: the public website, not private client workspaces.

### The decision

Keep the accepted Auckland atelier and the Pursuit / DO / Studio architecture. Build a more expressive experience around them: one cinematic scene, a physical-looking brief that visibly assembles, tactile product entrances, an interactive visual portfolio and unambiguous links to the existing workspaces.

This is not another logo, palette, app or collection of effects. It makes the existing product feel as considered as the work it promises.

## 1. The reference set

These are selected craft benchmarks, not an objective ranking of the world's best websites. Observations come from the makers' descriptions and public experiences. Their artwork, code and identity are not licensed for copying into assembl. Current research does not imply every reference launched in 2026.

### Lusion / Devin

The maker describes using storytelling, animation and interactive design to make complex software approachable, supported by 3D and WebGL. This is the closest commercial reference: the experience explains software rather than hiding it behind spectacle.

Apply: one visible input-to-output sequence. A visitor understands Pursuit, DO and Studio by changing the state of a brief, not reading three long definitions.

Source: https://lusion.co/projects/devin_ai/

### 14islands / Hatom

Syfy uses 3D cubes as a navigable portfolio; USH uses scroll-led storytelling for product features. The published stack includes Next.js, React, Three.js, WebGL, Framer Motion and Vercel, substantially overlapping assembl's installed stack.

Apply: dimensional objects that are intelligible product entrances. Each card has a distinct visual, public overview and separately labelled workspace action. Do not borrow crypto or cosmic styling.

Source: https://www.14islands.com/work/hatom

### 14islands / Blobmixer

Shape, material and lighting are adjustable by the visitor. The transferable quality is participation: the visual responds to a choice, rather than simply playing behind text.

Apply: a three-stage living brief with buttons and a native slider. Scroll introduces stages; a deliberate user selection takes control. Do not copy the blob aesthetic or unrelated NFT mechanics.

Source: https://www.14islands.com/work/blobmixer

### Lusion / Of The Oak

This web companion extends a physical installation by Marshmallow Laser Feast with Kew. Lusion describes compressing tree/branch structures into a custom 3.5 MB format with WebGL instancing. Craft is inseparable from delivery engineering.

Apply: reuse the existing scene instead of stacking WebGL engines. Make the experience readable before the model is ready. Test a real browser; a green build does not prove smooth mobile rendering.

Source: https://lusion.co/projects/of_the_oak/

### Lusion / Oryzo

A self-initiated campaign presents a simple cork coaster with the craft of a premium technology launch, spanning web, 3D, motion and campaign material.

Apply: an ordinary useful object carries the story. For assembl it is the brief: evidence enters, a response takes shape, a demonstrator makes the possibility visible. More ownable than an unrelated chrome object.

Source: https://lusion.co/projects/oryzo_ai/

### Bruno Simon / portfolio

An explorable world can be an interface rather than a conventional document. This interaction model suits play, but should not obstruct a business visitor trying to understand a product or enter a workspace.

Apply: optional spatial exploration with ordinary navigation, keyboard access and an immediate route out of the cinematic section. Do not make game controls a prerequisite.

Source: https://bruno-simon.com/

### AQuest / experiential work

AQuest's public portfolio includes interactive beauty, luxury and cultural work, including Dolce & Gabbana fragrance and Bvlgari projects. The reference is an art-directed world connecting identity, media and interaction.

Apply: Studio should visibly make visual work, not appear as text files. Show distinct spatial, motion and identity examples using owned assets. Separate the public showcase from the authenticated working Studio.

Source: https://www.aquest.it/

### Contemporary discovery, not a forecast

The current Awwwards 3D collection is a discovery source for recent published examples. It is not evidence that every visitor benefits from heavier 3D or that one style is universally fashionable.

Source: https://www.awwwards.com/websites/3d/

## 2. The useful design direction

This synthesis is design judgement, not a statistical claim about the industry.

**Spatial editorial.** Oversized, carefully spaced type with a coherent scene. A few focal points instead of equal-weight modules everywhere.

**Material glass.** Translucency needs a backdrop, readable text surface, bright upper edge, contact shadow and broader lift shadow. Blur without contrast creates fog. Use plum, rose, chalk and paper through opacity and light, not a rainbow palette.

**Cause and effect.** Selection changes both composition and output. Scroll and hover enhance the relationship; they cannot be the only way to understand it.

**Rhythm.** Daylight hero, breathing room, interactive object, three product entrances, one dark-plum editorial statement, moving identity, clear next step. Variation comes from composition and material, not mini-brands.

**Touch as a first-class input.** Phones receive chapter buttons, the example slider and portfolio controls. Pointer tilt is an additional desktop affordance. No critical explanation exists only on hover.

**Honest demonstration.** The living brief is a local example, not an agent run. Visual studies are assembl work, not customer endorsements. Paid providers, sending and publishing are not triggered.

## 3. Actual live-browser findings

Anonymous Chromium at 375 × 812 and 1440 × 1000, public origin, no account access, non-read network methods blocked. Evidence: workflow run 35274046109, `immersive-browser-baseline` artifact.

Confirmed:
- Mobile `/pursuit` renders shared navigation above its own navigation, wasting the first viewport and breaking continuity.
- Some below-hero homepage content remains extremely faint after scrolling. Remove the fragile reveal wrapper rather than add another entrance effect.
- Mobile headline/subline measures are unnecessarily restrictive. The subline breaks awkwardly despite enough width.
- The restored atelier renders on mobile. Do not continue claiming every phone sees the old static fallback.
- Computed headline font families begin with Instrument Sans. Legacy fallback names appearing in CSS do not prove those fonts are rendered.
- Studio's repeated imagery separates its public page from its promised visual product.

Desktop homepage and DO screenshots timed out after successful navigation; those captures are not a visual pass. Proposed code requires separate browser proof.

Authentication beyond external sign-in was not exercised. Correct URLs do not prove membership or post-login return on the user's device.

## 4. Implementation

**Hero:** Preserve WorldAtelierStage / WorldScene / atelier.glb. Improve text measure and foreground hierarchy. Add touch-friendly chapter buttons moving the existing scroll path. Keep pause, true reduced-motion and complete static summaries, including a one-column mobile fallback.

**Living brief:** Three local stages. Source cards gather around a prepared brief and settle from Pursuit to DO to Studio. User selection overrides scroll. CSS perspective and existing Motion, not a second canvas.

**Product entrances:** Pursuit signal field, approved DO mark and Studio spatial frame. Small-angle pointer tilt. Every link available on touch. One controlled plum card; others paper/chalk.

**Studio:** Replace duplicate tiles with selectable spatial / motion / identity work. Existing owned assets only. Prominent exact workspace action and sign-in explanation. Public navigation stays public.

**Final action:** One dominant contact action for a new opportunity. Separate returning-user links for the exact existing client hubs and Creative Studio.

## 5. Capability and trade-offs

The repository already includes Next.js, React, Three.js, React Three Fiber, Drei, Framer Motion, GSAP, Lenis and the canvas package. This work requires no new production dependency or proprietary hosted scene.

Use existing native scroll and scene progress. Do not introduce competing GSAP, Lenis and Motion scroll owners. Motion supplies local transforms and pointer springs; WorldScene owns the atelier camera.

CSS backdrop-filter enhances a readable translucent background. It depends on the backdrop; do not require blur for legibility.

Engineering sources:
- https://motion.dev/docs/react-scroll-animations
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter
- https://playwright.dev/docs/ci

Custom shader transitions, bespoke photoreal environments, physics-driven worlds, procedural nature and WebGPU experiments are possible follow-on directions requiring asset, compatibility and performance work. This release does not claim to implement all of them. The immediate improvement is an authored experience using the stack already present.

## 6. Protection and acceptance

Do not change client data, authentication, membership, workspace storage, billing, credentials, provider permissions, accepted DO identity, atelier asset, canonical palette or typography. Do not turn public navigation into unlabelled private redirects.

Before production: typecheck, production build, targeted static/interaction/destination tests, public guards, proposed-build screenshots, buttons/slider/gallery/chapter actions, navigation count, overflow and visible content, reduced-motion and JavaScript-disabled checks, unhandled page errors.

CI screenshots are not a physical iPhone performance certification. Record that boundary.

## 7. Follow-on craft

Invest next in one bespoke branded input-to-output scene or film, not more widgets. Use the same assembly grammar as the living brief with complete HTML explanation. Aerial Aotearoa collective-motion work remains a separate approved mode, not a motif forced into every client experience.

Borrow narrative discipline, material quality and interaction principles. Do not claim to have reproduced the reference studios' entire pipelines or production budgets.
