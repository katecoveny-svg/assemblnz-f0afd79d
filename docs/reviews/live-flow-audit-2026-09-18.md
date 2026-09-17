# Live site flow audit — 18 September 2026

## Scope

Audit the actual public experience as a visitor moves through:

`Home → Pursuit → private client hubs → DO → Studio → workspace / contact`

The purpose is not another brand rewrite. It is to make the existing visual system and product architecture flow coherently.

## Current public architecture

- **Pursuit — find it.** Public story at `/pursuit`; private client workspaces on the authenticated Pursuit ChatGPT Site under `/studios`.
- **DO — do it.** Public product and active DO surfaces remain on `assembl.co.nz/do...`.
- **Studio — show it.** Public story at `/creative-studio`; authenticated Creative Studio workspace remains on the existing Pursuit/Studio ChatGPT Site under `/agency`.

Private authentication is intentional. The problem is not that private workspaces require sign-in; the problem is when a public CTA lands on a generic root, soft-fails to the homepage, or does not preserve the intended destination through sign-in.

## Confirmed defects

### 1. Mobile homepage motion was explicitly disabled

`useAtelierMotionGate()` treated every viewport at or below 650px as reduced motion. The same flag prevented WorldScene from loading and put the homepage into the static fallback.

**Effect:** phones lost the authored 3D/parallax journey even when the user had not requested reduced motion.

**Repair:** reduced motion now follows only `prefers-reduced-motion`.

### 2. Mobile hero collapsed its scroll runway

The mobile CSS set `.rail { height: auto }` and `.frame { height: auto }`, removing the sticky scroll travel used by the atelier scene.

**Effect:** no meaningful parallax/fly-through on phone.

**Repair:** mobile keeps a bounded sticky runway while retaining a compact one-column layout.

### 3. Hero stacking was fragile on iOS

The stage relied on negative z-index layers while the content did not consistently establish positive stacking layers.

**Effect:** WebGL/poster composition could visually compete with or appear over type on mobile/Safari.

**Repair:** frame now establishes an isolated stacking context; scene, scrim and content have explicit layers.

### 4. Lower homepage lost dimensional treatment

Pursuit / DO / Studio rows had become mostly border + text, with little hover, glass, depth or scroll assembly.

**Effect:** the site felt static after the hero even though the brand system calls for spatial, assembled motion.

**Repair:** reuse the existing Reveal primitive and add one shared depth layer for glass surfaces, restrained hover lift and soft plum/rose light.

### 5. Pursuit public CTA opened the generic ChatGPT Site root

The public Pursuit landing used `PURSUIT_SITE_ORIGIN` directly for “Open the Pursuit hub”. The actual client-hub index is `/studios`.

**Effect:** users could enter the external site at an ambiguous root and hit a sign-in/gate without a precise return path.

**Repair:** client-hub actions now launch the authenticated `/studios` destination, so sign-in returns to the client-hub index.

## Existing route/gate findings that remain important

A prior live HTTP audit confirmed:

- `/pursuit`, `/do`, `/creative-studio` are real public pages.
- Pursuit `/studios` and Studio `/agency` on the ChatGPT Site are authenticated workspace destinations, not missing pages.
- some internal `/studio/...` paths have historically been shadowed by the live-domain splash gate and can soft-fail to the homepage.
- unknown routes on the live apex can also soft-fail to `/`, which makes broken links look superficially healthy.

These should be repaired carefully rather than by broadly removing authentication.

## Routing contract to keep

### Public navigation

- Home → `/`
- Pursuit → `/pursuit`
- DO → `/do`
- Studio → `/creative-studio`

Public top-level navigation stays on `assembl.co.nz`.

### Authenticated working surfaces

- Pursuit client hubs → `https://assembl-pursuit.katecoveny.chatgpt.site/studios`
- Creative Studio workspace → `https://assembl-pursuit.katecoveny.chatgpt.site/agency`

Buttons that leave the public site must make that transition intentional and preserve the specific return path through sign-in.

### Client-specific Pursuit links

Existing deep links such as client `/studios/<client>/work?...` remain valid and must not be replaced with generic root links. A public page should not guess a client slug; client-specific links should come from the actual client record/hub launcher.

## Next route repairs

1. audit every emitted public CTA against the routing contract;
2. remove generic ChatGPT-Site root launches where a specific `/studios` or `/agency` path exists;
3. repair the narrow `/studio/do-maker` splash-gate exception without opening private customer surfaces;
4. make broken public routes return a real not-found state instead of silently rendering `/` where possible;
5. keep client hubs and Studio workspaces authenticated;
6. keep the visual public shell consistent across Pursuit, DO and Studio.

## Design rule

Do not solve routing by flattening the experience.

Keep:
- the Auckland atelier / WorldScene;
- scroll-led spatial motion;
- parallax;
- glass surfaces;
- hover depth;
- 3D/product proof;
- Instrument Sans + IBM Plex Mono brand system;
- deep plum / dusty rose / chalk / paper;
- Pursuit client hubs;
- Studio as a full visual product.

The objective is **cohesion**, not simplification into a static SaaS page.
