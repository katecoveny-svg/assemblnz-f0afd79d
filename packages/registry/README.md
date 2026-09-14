# @assembl/registry — Studio creative blocks

AI-readable, shadcn-style registry for **assembl Studio Creative Director**.

**Status:** PREVIEW stubs (v0). Intended package names: `@assembl/<block>`.
Today they ship as subpath exports of `@assembl/registry`.

Mount: [`/creative-studio`](https://assembl.co.nz/creative-studio) — Creative Director pipeline.
Craft tool: [`/generative-studio`](https://assembl.co.nz/generative-studio) remains linked.

---

## Pipeline (idea → direction → world → experience)

| Step | Job |
|---|---|
| **Understand** | Casual prompt → structured `CREATIVE INTENT` (brand, audience, emotion, NZ context, references, avoid, hero, motion, quality gate) |
| **Art direct** | Exactly **3** materially different directions (metaphor / composition / motion / type — not colour variants) |
| **Visual targets** | Desktop hero · mobile hero · key interaction · motion storyboard (DEMO plates OK) |
| **Construct** | Pick grammar: editorial CSS/GSAP · cinematic video · spatial R3F |
| **Critic** | Checklist reject conditions; revise reasons on fail. Chromium screenshot loop is a wired stub |

Seed DEMO: *NZ energy company · agent assembling a better household energy plan* (fictional).

Code: `lib/creative-director/*` · UI: `components/creative-director/*`.

---

## Blocks

| Install name | Role |
|---|---|
| `@assembl/cinema-hero` | Full-bleed cinematic hero |
| `@assembl/sideways-story` | Horizontal chapter rail |
| `@assembl/object-assembly` | MANY→COORDINATION→ONE object |
| `@assembl/aerial-world` | Top-down fine-art field |
| `@assembl/agent-live` | Quiet agent coordinator |
| `@assembl/wait-state` | Honest wait / proof mono labels |
| `@assembl/editorial-type` | Instrument Sans + Plex Mono proof |
| `@assembl/camera-scroll` | Scroll chapters + reduced-motion end |
| `@assembl/particle-field` | Organic particulate coordination |
| `@assembl/nz-material` | Plum / paper / heather tokens |

Manifest: [`registry.json`](./registry.json) · schema: [`registry.schema.json`](./registry.schema.json).

### For AI agents (shadcn-style)

1. Read `registry.json` — each item has `name`, `type`, `files`, `registryDependencies`, `categories`.
2. Resolve dependencies depth-first (`registryDependencies` before the item).
3. Copy or import files listed under `files`. Prefer CSS variables from `nz-material` over inventing a palette.
4. Respect each block’s `meta.json` → `reject` list.
5. Do **not** invent a second homepage — compose blocks inside Studio / Ensemble craft surfaces.

```ts
import { CinemaHero, AerialWorld, REGISTRY_BLOCKS } from '@assembl/registry';
import '@assembl/registry/nz-material';
```

---

## Visual DNA (enforce)

- Patterns in nature become intelligence — NEVER corporate network cliché
- Camera: minimalist aerial / top-down fine art, not tourism postcards
- Assembl-owned palette: deep plum `#240B21`, muted rose/heather `#916A70`, paper `#FFFDFB`, chrome accents — **no AI purple gradients**
- NZ without cliché: geography / material / light — no koru tourism decoration, no Māori motifs as garnish
- One unforgettable visual idea per viewport — reject card-grid SaaS heroes
- Motion readable within ~2s; `prefers-reduced-motion` → fully assembled state
- Copy: plain English — no unlock / revolutionise / AI-powered slop

---

## Licensing caution

Absorb **patterns** only unless the dependency is MIT/Apache **and** attributed in the consuming surface.

| Source | Policy |
|---|---|
| Open Lovable, Onlook, Screenshot-to-Code, Magic UI, R3F + Drei | Patterns OK with care; do not copy proprietary assets wholesale |
| AGPL Webstudio core | **Do NOT vendor** |
| bolt.diy WebContainers | **Do NOT depend on** as a commercial runtime |

This package is `UNLICENSED` (assembl internal). Published `@assembl/*` licenses will be declared per package when they leave stub status.

---

## Out of scope (this PREVIEW)

- Full Open Lovable fork
- Replacing live homepage craft (`CinematicJourneyHome` at `/`)
- One NZ private journeys
- DO Agent OS (separate PREVIEW)
- Real client Pursuit builds beyond the energy DEMO fixture
