---
name: Next Aesthetic Sitewide
description: Site-wide cinematic upgrade — locked teal #3A7D6E, Lenis smooth scroll, magnetic cursor, NextHero shell with WebGL caustics shader and light glass orb on every key page
type: design
---

## Locked palette (2026-04-20)
- **Primary teal:** `#3A7D6E` (HSL `167 36% 36%`) — replaces old `#4AA5A8` as `--primary`
- **Primary glow:** HSL `167 36% 50%`
- **Background ice:** `#FAFBFC` (HSL `216 20% 98%`) — `--background`
- **Charcoal text:** `#3D4250` (HSL `226 12% 27%`) — `--foreground`
- **Glass:** `rgba(255,255,255,0.65)` with `backdrop-filter: blur(20px)`
- Status colours unchanged: error `#C85A54`, success `#3A7D6E`, info `#5A7A9C`. NO yellow/ochre.

## Global motion shell
`<GlobalMotionShell />` mounted in `App.tsx` enables:
- **Lenis smooth scroll** (`SmoothScroll.tsx`) — inertial scrolling
- **Magnetic cursor** (`MagneticCursor.tsx`) — elements with `data-magnetic` attract the cursor
Disabled on `/chat`, `/embed`, `/admin`, `/dashboard`, `/command`, `/voyage/command`, `/workspace`.

## NextHero shell
`<NextHero />` is the canonical hero component. Props: `eyebrow`, `title`, `subtitle`, `actions`, `variant` (`shader`|`layered`|`soft`).
- Full-bleed WebGL caustics behind the type
- Light glass orb (off-axis right, 32% opacity, screen blend) only when `variant="layered"`
- Type: Lato 200 italic accents in teal, charcoal body
- Used on `/`, `/how-it-works`, `/pricing` (rolling out to kete landings + remaining marketing pages)

## Files
- `src/components/next/NextHero.tsx` — reusable hero shell
- `src/components/next/HeroShader.tsx` — WebGL caustics
- `src/components/next/SmoothScroll.tsx` — Lenis wrapper
- `src/components/next/MagneticCursor.tsx` — cursor magnet
- `src/components/next/GlobalMotionShell.tsx` — site-wide mount
- `src/index.css` — token lock under `:root`
