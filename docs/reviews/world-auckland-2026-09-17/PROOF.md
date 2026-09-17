# Auckland atelier — proof notes (2026-09-17)

Draft PREVIEW for Kate lock. Same pipeline: `AssemblWorldHero` → `WorldScene` → `public/do/world/atelier.glb`.

## Before / after

| | |
| --- | --- |
| Before (prior homepage frame) | `before-homepage-hero-desktop.png` |
| After (Cycles poster from new authoring) | `after-atelier-poster.png` |
| Runtime homepage harbour | `runtime-homepage-harbour.webp` |
| Runtime DO sculpture | `runtime-do-sculpture.webp` |
| Runtime `/preview/do-world` | `runtime-do-world-preview.webp` |
| Mobile 375 still view | `runtime-mobile-375.webp` |

Budget: see `BUDGET.md` — **1.81 MB** Draco GLB (+~185 KB vs prior), 13 meshes, ≈122k tris.

## Checks run

- `node scripts/public-front-door-guard.mjs` — pass
- `vitest` `hero-resilience.test.ts` — pass
- Manual: `/` and `/preview/do-world` WebGL fly-through; city lights through glazing; Identity D on DO; 375 still view (intentional reduced-motion path)

## Honest limits

- Exterior is imagined Waitematā / Auckland waterfront — not a mapped real property
- Sky landmark and CBD massing are stylised; Mac-side Blender craft can still push realism further
- Homepage mobile ≤650px stays on poster / still view by design
