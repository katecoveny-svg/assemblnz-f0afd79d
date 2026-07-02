# @assembl/canvas

the assembl design-system canvas — tokens, the silvery-gold particulate
landscape, the matariki constellation, floating bundle cards, and the
branded `assembling…` loader.

visual canon: `public/brand/direction/DIRECTION-LOCKED-2026-07-01.md`.
every colour, face and motion value here is verbatim from that doc and
aligned with the pilot-chrome kit in `components/assembl/chrome.tsx`.

## install

workspace package — add `"@assembl/canvas": "workspace:*"` and `pnpm install`.
peers: `react` (18/19) and `framer-motion` (11/12).

## exports

```ts
// '@assembl/canvas' — components + tokens (client entry)
import {
  tokens, palette, typography, motionTokens, motto,
  ParticulateLandscape, // seeded SVG mountain-and-wave landscape, 60s drift
  Constellation,        // matariki dot-cluster mark, soft gold pulse
  BundleCard,           // floating card, dot-cluster ornament, hover levitate
  MicroLabel,           // the ONLY uppercase on-brand: tracked 0.16em labels
  RightRail,            // context rail (bundle detail / member agents)
  KpiTrio,              // three small KPI stats — real numbers only
  AssemblingLoader,     // "assembling…" + pulsing matariki cluster
} from '@assembl/canvas';

// '@assembl/canvas/motion' — framer-motion primitives
import { drift, pulse, levitate, assemblingLoader, AssemblingLoader } from '@assembl/canvas/motion';

// '@assembl/canvas/tokens' — plain data, safe in React Server Components
import { tokens } from '@assembl/canvas/tokens';
```

## rules baked in

- every component holds still under `prefers-reduced-motion`
  (`ParticulateLandscape` also accepts a `staticSrc` PNG for that case)
- the particulate field is seeded (mulberry32), never `Math.random()` at
  render — SSR hydration stays stable
- all copy lowercase except `MicroLabel`
- lowercase `assembl` always; no stock imagery; no emojis
- never fabricate metrics — `KpiTrio` renders what you give it, so give it
  real numbers

## demo

`app/dev/canvas/page.tsx` in the root app renders every export.
