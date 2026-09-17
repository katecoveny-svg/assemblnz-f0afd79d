# Auckland atelier daylight retune — 2026-09-17

Kate craft note: live homepage WorldScene purple/plum wash is overpowering.
Target: daylight / white space first; deep plum + muted rose as furniture/art accents only.

## Lighting + grade changes (WorldScene)

| Before (failure) | After (this PR) |
| --- | --- |
| `<color background>` deep plum `#240B21` | Paper `#FFFDFB` |
| Fog plum `#24141c` near 36 | Soft paper fog `#F2F0EF` near 72 / far 165 |
| Dusk plum sky shader | Daylight harbour sky (paper → chalk → soft blue) |
| Rose lightformers flooding the room | Daylight / harbour-sky / paper lightformers |
| Plum hemisphere `#e8c8d0` / `#1a0e14` | Chalk sky / warm paper ground |
| Rose spot room wash | Removed; Identity D rose glow stays local |
| Cove / harbour point lights rose-warm flood | Paper warm coves; soft daylight exterior scatter |
| Exposure ~1.05 dusk | Exposure ~1.32 daylight |
| Authored plum plaster / rose limestone kept as-is | Runtime chalk/paper albedo overrides until Mac re-export |

## Hero CSS (composed front door)

| Before | After |
| --- | --- |
| Stage background plum ink | Paper |
| Full-bleed plum scrim gradients | Soft neutral charcoal vignette for type only |
| Preview `/preview/do-world` rose radial stage | Paper field; charcoal chapter panels |

## Blender script (`scripts/build-do-world.py`)

Albedo + Cycles world rebalanced for daylight (see `KATE_MAC_EXPORT.md`).
`public/do/world/atelier.glb` unchanged in this PR — runtime overrides cover live hero.

## Guard

`node scripts/public-front-door-guard.mjs` must stay green.

## Authority

Draft PREVIEW only — no merge until Kate yes.

## PR

https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1346
