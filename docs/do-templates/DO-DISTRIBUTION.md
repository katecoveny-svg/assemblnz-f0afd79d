# DO distribution — PWA now, stores later

How people get DO onto a device. Canonical for assembl agents shipping DO surfaces.

**Status (2026-09):** Progressive Web App is the live install path. Native App Store / Play listings are **not** live. Do not claim otherwise in customer copy.

## What ships today

| Channel | Path | Honesty |
|---------|------|---------|
| **PWA (primary)** | Install DO / Add to Home Screen from `/do` and key DO routes | Live. Chromium `beforeinstallprompt`; iOS Safari Share → Add to Home Screen |
| Chrome extension | `/api/do/download?format=extension` → Load unpacked | Live companion; side panel + floating mark |
| Mac companion | `apps/do/macos` | Local / ad-hoc development build — **not** a notarised public installer |
| iOS / Android stubs | `apps/do/ios/*`, `apps/do/android/*` | Compiling-ready keyboard / widget stubs — **not** App Store / Play releases |

### PWA contract

- Manifest: `/do/manifest.webmanifest`
  - `name`: DO by assembl · `short_name`: DO
  - `start_url`: `/do` · `scope`: `/do` · `display`: standalone
  - Theme `#240B21` (plum) · background `#FFFDFB` (paper)
  - Icons 192 / 512 (`any` + `maskable`)
  - Shortcuts: Meeting, Household, Office, Builder, Connections
- Service worker: `/do/sw.js` registered at scope `/do/` only (never `/`)
  - Network-first navigations; offline shell for DO home
  - Does **not** intercept `/api/*`, `/auth/*`, `/login`, `/account` — auth stays network-only
- Visible **Install DO** CTA clustered with Chrome / Mac under “Get DO on this device” on `/do` portable starters
- Meeting phone path: `/do/meetings?phone=1` (Install → Open → Record)

Installable routes under scope `/do` include: `/do`, `/do/meetings`, `/do/household`, `/do/office`, `/do/builder`, `/do/connections`, and other `/do/*` task surfaces.

## Mac next (companion)

Existing code: `apps/do/macos`.

Before public Mac distribution:

1. Developer ID Application signing
2. Notarisation + stapling
3. Signed / notarised installer (or notarised zip) with a documented update path
4. Keep the honest line until then: local development companion, not a public Mac release

See `apps/do/macos/README.md`.

## App Store / Play later (native wrappers)

iOS App Store and Google Play are a **separate** track from the PWA.

Recommended sequence:

1. **PWA now** — Install DO / Add to Home Screen (this doc’s primary path)
2. **TestFlight / internal Play track** — Capacitor or [PWABuilder](https://www.pwabuilder.com/) wrappers around the same `/do` origin, using the same Spatial C craft and auth boundaries
3. **Store listing** — only after privacy, review, and signing pipelines are ready

Do **not**:

- Claim “Available on the App Store” or “Get it on Google Play” while listings are absent
- Ship a wrapper that bypasses DO’s human-approval boundaries
- Register a site-wide service worker at `/` (see PR #431 / `public/sw.js` kill switch)

Keyboard and home-widget stubs under `apps/do/ios` and `apps/do/android` remain optional native surfaces; they are not substitute store apps.

## Copy rules

- Prefer: “Install DO”, “Add to Home Screen”, “Get DO on this device”
- Avoid bare “download the app” when only the PWA is available
- Mac: say “Mac companion (development build)” until notarised
- Stores: say “planned” / “later” — never “live”

## Related

- `docs/do-templates/DO-PORTABLE-AGENT.md` — portable agent model
- `apps/do/README.md` — DO preview map
- `lib/do/do-service-worker.ts` — DO SW source
- `components/do/DoInstallPwaCta.tsx` — Install CTA
- `components/do/DoDownloadsStrip.tsx` — PWA + Chrome + Mac cluster
