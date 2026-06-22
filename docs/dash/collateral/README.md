# Dash — collateral surfaces (archive)

Reference source for the three Dash design surfaces that are **collateral, not
live site pages**: Social Ads, the Short Video storyboard, and the Email Kit.
They are kept here (outside `app/`, so Next never builds/routes them and
`tsconfig` excludes `docs`) purely as a reachable, version-controlled archive.

## What's here

| Folder | Handoff surface | Notes |
|---|---|---|
| `ads/` | Social Ads | `page.tsx` + `ads.module.css` — a board of static ad creatives |
| `video/` | Short Video | `page.tsx` + `video.module.css` — an interactive shot-by-shot storyboard (`useState`) |
| `email-kit/` | Email Kit | `page.tsx` — email templates |
| `_keyframes-reference.css` | — | the `@keyframes` (marquee/floaty/glowPulse/tick/spark/countPop/fillRise/dashFill/hazard/floatSoft) these files reference |

## Provenance

Ported source from the standalone **`dash-site`** build (branch
`dash-site-implementation`, commit `e8e5e42`) delivered as a bundle/zip. That
build is **not** canonical — the live Dash surface is the integrated `/dash` in
this app (`app/dash/*`). These three were judged collateral (ad creatives, a
storyboard, an email template) rather than pages the public navigates to, so
they were archived here instead of shipped as routes.

## How to render one (if ever needed)

These are authored with inline styles + a small CSS module each. To bring one
live as a real page:

1. Copy the folder into `app/dash/<route>/`.
2. Swap the standalone deps: `@/components/Wordmark` → the layout `Wordmark`;
   `@/public/assets/mascot-dog.png` → `/dash/mascot-dog.png`; asset paths
   `assets/…` → `/dash/…`.
3. Replace hardcoded `'Lato'` / `'Space Mono'` font families with the next/font
   vars `var(--font-dash-sans)` / `var(--font-dash-mono)` (see how the live
   `/dash` pages do it), and move the needed `@keyframes` from
   `_keyframes-reference.css` into `app/dash/birdie.css`.
4. Drop heavy display weights to Lato 700 to match the live headers.

Palette is locked: white + canary `#FFD42A` + charcoal `#3a3832`. No black, no
green. See `docs/dash-design-system.md`.
