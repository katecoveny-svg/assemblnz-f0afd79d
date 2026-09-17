# Public landings → shared Auckland atelier

Kate follow-up 2026-09-17: major public doors should aspire to the homepage
WorldScene / Auckland office fly-through quality — **one stack**, no parallel pipeline.

## Shared primitive

`WorldAtelierStage` — poster + dynamic `WorldScene` + Draco `atelier.glb`.

| Surface | Treatment |
| --- | --- |
| `/` homepage | `AssemblWorldHero` → `WorldAtelierStage` (full scroll rail) |
| `/do` | Keeps #1343 Meeting notes / Household board craft as first viewport. `DoAtelierHero` ships on the shared stage but is **not mounted** until Kate compose-yes (avoids undoing craft). |
| `/preview/do-world` | `World.tsx` → `WorldScene` directly (study) |
| `/creative-studio` | `ProductLanding` — atelier hero grade + workspace doors (no duplicate-poster studies shelf) |
| Pursuit | NZ story at `/pursuit` + ChatGPT hub — no in-app WorldScene rail |

## Reuse rules

1. Import `WorldAtelierStage` (or `WorldScene` for the study twin). Never invent a second GLB/R3F stack.
2. Keep reduced-motion + ≤650px still/poster path.
3. Offscreen unmount via visibility gate.
4. Product voice only on public shelves — never label visuals as experiments, studies-as-lab, or “not live agent activity.”

## Out of scope (for later)

- Full Studio ProductLanding fly-through rail (poster + study link is enough until Kate asks)
- Pursuit in-app WorldScene (Pursuit is external)
- New Blender geometry (use existing craft-pass `atelier.glb` / Kate Mac re-export)
