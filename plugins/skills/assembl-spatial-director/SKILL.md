---
name: assembl-spatial-director
description: Four-stage art-direction, 3D asset, Blender-to-web and spatial-polish workflow for assembl Studio. Use for immersive heroes, 3D product demonstrations, GLB/Three.js scenes, Gaussian splat environments, spatial cards, interactive client demos, Blender assets, Franklin scenes, or deciding whether CSS 2.5D, WebGL/GLB or splats are the right rendering level.
---

# assembl Spatial Director

Use this skill together with `plugins/assembl-core/skills/assembl-design/SKILL.md` and `plugins/skills/assembl-no-slop-copy/SKILL.md`.

The goal is not “add 3D”. The goal is to choose the lightest spatial technique that can deliver the approved art direction, then prove the browser result against that direction.

## 01 · Four-message rule

Keep one task/thread through all four stages. Do not restart the context between stages.

### Prompt 1 — DESIGN

Design the look before modelling.

Produce three materially different visual directions. Each direction must specify:

- composition;
- camera / framing;
- materials;
- lighting;
- palette;
- hero object / subject;
- interaction;
- motion;
- mobile fallback;
- why the direction belongs to the client / assembl.

Generate or compose still mockups before building geometry.

Stop after the three directions. Ask for the selected direction before modelling when a human is available.

For autonomous work, select only when the brief explicitly permits it and record why.

### Prompt 2 — MODEL

Model the selected direction.

Prefer:

- reproducible Blender Python;
- named mesh parts;
- plausible geometry;
- editable materials;
- clean transforms;
- GLB export;
- re-import / fresh-file validation;
- explicit asset provenance.

Do not accept primitive geometry merely because it renders.

For organic or detailed subjects, use the best available asset-generation route from approved reference imagery, then refine in Blender. Examples include specialised image-to-3D / text-to-3D services when available. Treat external generators as replaceable tools, not the architecture.

For Franklin or other recognisable subjects:

- preserve identity from approved references;
- use a proper detailed mesh if available;
- do not ship a capsule/sphere approximation as final art;
- separate subject mesh from environment so it can be animated independently.

### Prompt 3 — BUILD

Bring the approved scene to the web.

Choose the rendering tier deliberately:

#### Tier A — CSS spatial / 2.5D

Use for:

- cards;
- documents;
- screenshots;
- phones;
- packaging;
- product tiles;
- simple pitch artefacts.

Preferred technique:

- parent perspective;
- rotateX + rotateY + rotateZ;
- translateZ;
- pseudo-element / duplicated plane behind the object to create thickness;
- restrained hover / pointer response.

Use this before WebGL when it convincingly produces the intended depth.

#### Tier B — Three.js / GLB

Use for:

- controllable objects;
- real camera movement;
- drag / orbit;
- object animation;
- lighting / material response;
- interactions requiring real geometry.

Requirements:

- responsive camera;
- bounded DPR;
- explicit loading state;
- still fallback;
- pause when offscreen;
- reduced-motion handling;
- no unnecessary render loop;
- mobile performance budget.

#### Tier C — Gaussian splat / spatial capture

Use for:

- photoreal environments;
- architectural space;
- scanned rooms / landscapes;
- cinematic spatial backgrounds.

Prefer a hybrid:

**splat environment + Three.js controllable objects + HTML interface.**

Do not make a character or critical interactive object a splat when it needs precise animation or state.

For splat scenes:

- test browser/WebGL support;
- cap rendering cost;
- create deterministic QA/still mode;
- provide non-WebGL fallback;
- keep interactive UI in HTML where possible.

### Prompt 4 — POLISH

Never approve from source code alone.

Capture the browser result and compare it with the selected design mockup.

Check:

- composition;
- framing;
- camera path;
- subject scale;
- lighting;
- material realism;
- depth;
- typography;
- text legibility;
- hover;
- drag;
- scroll;
- motion timing;
- mobile;
- reduced motion;
- fallback;
- loading;
- WebGL errors;
- horizontal overflow;
- offscreen resource use.

Iterate until the browser evidence matches the approved art direction closely enough to justify release.

## 02 · Spatial art direction for assembl

Current public Assembl direction takes precedence over stale historical palette notes.

For current Assembl public-facing spatial work, prefer:

- deep plum;
- very dark plum;
- muted / dusty rose;
- paper / ivory;
- architectural whites;
- restrained brushed metal;
- natural timber / stone where appropriate;
- generous negative space;
- editorial typography;
- premium natural light.

Avoid:

- canary yellow;
- generic purple AI gradients;
- neon;
- cyberpunk;
- floating hexagons;
- robot mascots;
- arbitrary technical diagrams;
- glossy SaaS-card walls.

The visual idea is assembly:

- parts gather;
- information takes shape;
- objects organise;
- individual elements become a useful whole.

For Assembl master-brand imagery, patterns in nature and New Zealand context are valid source material when they strengthen the concept rather than decorate it.

## 03 · Auckland / Scandi spatial direction

When the brief calls for the Assembl atelier / office world:

- modern Auckland architecture;
- Scandinavian restraint;
- harbour / coastal light rather than literal tourist imagery;
- pale timber;
- limestone / plaster;
- glass;
- brushed metal;
- deep-plum lacquer or upholstery accents;
- dusty rose used sparingly;
- warm, believable furniture;
- negative space;
- photographic material response.

It should feel like a real commissioned interior, not an “AI showroom”.

## 04 · Asset pipeline

Preferred sequence:

1. collect approved references;
2. generate three still directions;
3. select;
4. generate or model detailed hero assets;
5. refine / assemble in Blender;
6. name meshes and materials;
7. export GLB;
8. re-import into a fresh Blender file;
9. integrate in web;
10. capture desktop + phone evidence;
11. polish against mockup.

For client/product work, a useful pipeline is:

**brand/product reference → art direction → detailed 3D asset → Blender assembly → GLB → interactive web experience.**

Do not fabricate brand assets, product details or client claims.

## 05 · Interaction

Every interaction must have a reason.

Good:

- scroll moves the camera through a narrative;
- drag rotates a product;
- click opens / assembles a component;
- hover reveals physical depth;
- objects gather as work becomes complete;
- camera transitions correspond to Pursuit → DO → Studio.

Bad:

- motion for its own sake;
- endless parallax;
- constant rotation;
- hover on everything;
- WebGL where CSS is enough.

## 06 · Performance

Treat performance as part of art direction.

Required:

- mobile still / lightweight fallback;
- responsive image assets;
- compressed GLB/textures;
- capped device pixel ratio;
- offscreen pause;
- reduced-motion mode;
- lazy scene boot;
- no giant asset before useful first paint;
- no root-site service-worker changes to solve a scene problem.

Measure rather than assume.

## 07 · Browser proof

Before merging spatial work, prove at minimum:

- desktop viewport;
- 375px-class phone viewport;
- no horizontal overflow;
- scene/canvas mounted;
- hero copy readable;
- interaction works;
- fallback works;
- no page errors;
- production build passes.

For continuously-rendered WebGL, create a deterministic QA mode that renders known camera states so screenshots do not race the animation loop.

## 08 · Studio integration

Assembl Studio should treat this as a reusable rendering router.

Given a creative brief, decide:

- **CSS spatial** for cheap dimensional UI;
- **Three.js / GLB** for controllable geometry;
- **Gaussian splat** for photoreal spatial environments;
- **hybrid** when environment realism and object control are both required.

The Studio output should retain:

- selected art direction;
- asset provenance;
- rendering tier;
- fallback strategy;
- performance notes;
- browser proof.

## 09 · Copy

Run public copy through `assembl-no-slop-copy`.

Do not use visual sophistication as an excuse for vague copy.

Spatial experience should make the product easier to understand.

For the Assembl homepage, the product architecture remains:

- Pursuit — find the work;
- DO — do the work;
- Studio — show the possibility.

## 10 · Definition of done

A spatial build is done when:

1. the visual direction was approved or explicitly selected under the brief;
2. final assets are not crude stand-ins;
3. geometry / assets are editable and attributable;
4. the web interaction works;
5. mobile has a deliberate experience;
6. performance is bounded;
7. screenshots have been compared against the design direction;
8. the scene supports the product story;
9. the live site has not been destabilised by the experiment.

Real geometry when real geometry matters. Illusion when illusion is enough.
