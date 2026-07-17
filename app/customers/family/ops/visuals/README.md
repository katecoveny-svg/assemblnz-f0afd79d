# Family OS — visual layer

Everything that decides how Family OS *looks and moves* lives here, isolated so a
future direction change is a one-folder swap. The rest of the app talks to this
folder through a small, stable surface.

**Locked direction: illustrated + ambient motion (Option B).** Hand-drawn line
art, pearl canon (white ground, ink `#313c42`, gold `#b8964f`, muted `#68766f`), Cormorant
lowercase headers, Lato body, Space Mono labels, subtle paper grain, and ambient
motion that's load-bearing but never attention-seeking.

## Files
- `ink.tsx` — the hand-drawn SVG icon set (`InkSchool`, `InkNetball`, `InkCar`,
  `InkGroceries`, `InkCalendar`, `InkHouse`, `InkJug`, `InkLetter`, `InkJar`,
  `InkMic`, `InkUpload`, `InkPlates`) + `iconForEvent(title)` heuristic. Placeholder
  line art — swap the `<path>`s, keep the component names.
- `ambient.tsx` — `AmbientStyles` (keyframes + `prefers-reduced-motion` guard),
  `SkyBar` (time-of-day gradient on real Auckland time), `InkArrive` (new items
  settle in with an ink-flourish), `NameGlow` (a name glows gold when a family
  member's next event is within the hour).
- `FamilyHeroIllustrated.tsx` — the ambient hand-drawn hero. Replaced the old
  WebGL orb hero (no 3D on family/ops).

## Swap points
- Hero: `components/ops/family/FamilyHeroPanel.tsx` imports
  `FamilyHeroIllustrated` — point it at a new hero to change the top of the page.
- Icons: any surface imports from `./ink`.
- Motion/sky: `AmbientStyles` + `SkyBar` from `./ambient`.

## Sourcing the illustrations
1. **Best (future):** commission a NZ illustrator for the flagship family surface.
2. **Now:** generate hand-drawn line art via Vessel Studio — prompt "hand-drawn
   ink line art, warm imperfection, Quentin Blake meets Oliver Jeffers, isolated
   on paper-white background" — and drop the SVGs in behind the same component API.
3. **Fallback:** a hand-drawn SVG icon set (these placeholders).

## Kill list (do not reintroduce)
- No 3D anywhere on family/ops
- No stock photography or realistic renders
- No hover-3D-tilt effects
- No canary yellow

## Still to wire (next increment)
- Live NZ weather behind `SkyBar` (currently a drawn ambient sun; a weather feed
  is the next step).
- Per-surface bespoke illustrated heroes (calendar grid, fridge still-life,
  desk-and-letters) once the illustrator/Vessel pass lands.
