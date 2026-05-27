# Public Site PWA + Privacy Audit — 27 May 2026

## Scope

This pass checked the public HAPAI tool library, downloadable workflow runners, legal pages, and installability path for mobile home-screen use.

## Route Health

Local route audit against `http://localhost:3000`:

- HAPAI tools: 13/13 tool URLs returned 200.
- HAPAI share images: 13/13 `opengraph-image` URLs returned 200.
- HAPAI tool manifests: 13/13 returned 200.
- Workflow detail pages: 27/27 returned 200.
- Standalone workflow runners: 27/27 returned 200.
- Standalone workflow manifests: 27/27 returned 200.
- Public legal and index routes checked: `/`, `/hapai`, `/workflows`, `/privacy`, `/legal/privacy`, `/legal/terms`, `/legal/disclaimer`.

Total: 127/127 checked routes returned a healthy response.

## PWA Installability

Implemented:

- Root site manifest updated at `/manifest.webmanifest`.
- Service worker added at `/sw.js`.
- Site-wide service worker registration added through `PwaRegister`.
- HAPAI shell includes a `Save to home screen` action.
- Each HAPAI tool exposes its own manifest at `/hapai/[slug]/manifest.json`, including routed tools such as `/electrify` and `/hapai/projects`.
- Standalone workflow pages at `/w/[slug]` include a `Save this tool` action.
- Each standalone workflow exposes its own manifest at `/w/[slug]/manifest.json`.
- iOS fallback copy tells users to use Share, then Add to Home Screen.

Notes:

- Service worker registration only runs in production so local development does not get stale caches.
- Browser install prompts depend on HTTPS, manifest validity, and the browser’s own install criteria.

## Legal + Privacy Alignment

Reviewed and updated:

- `/legal/privacy`
- `/legal/terms`
- `/legal/disclaimer`
- `/privacy`

Changes:

- Last-reviewed dates updated to 27 May 2026.
- IPP 3A indirect-collection wording added for parent/team/operator upload scenarios.
- Public-tool limitations clarified: assembl supports notification context but does not auto-send privacy notices.
- Sensitive data and tamariki wording tightened so the responsible adult/operator remains accountable.
- Cross-border disclosure wording updated to avoid obsolete Privacy Shield language and focus on comparable safeguards, minimisation, masking, regional hosting, and contractual controls.
- Terms now explicitly prohibit using public tools to bypass Privacy Act 2020 obligations, including IPP 3A.

## Verification

Passed:

- `corepack pnpm exec eslint ...` on changed app/component/legal files.
- `corepack pnpm lint` for the repo’s configured Arataki lint target.
- `corepack pnpm typecheck`.
- Local HTTP route audit: 127/127 healthy.
- `/hapai/study-helper/manifest.json` and `/hapai/electrify/manifest.json` return valid `application/manifest+json`.
- `/w/school-notice-parser/manifest.json` returns valid `application/manifest+json`.
- `/w/school-notice-parser` includes its workflow-specific manifest link.
- `/sw.js` returns 200.

Blocked:

- `corepack pnpm build` was attempted twice but `next build` stayed silent after startup and timed out after 180 seconds with no failure output. Typecheck and route audit are clean; rerun build in CI or a fresh shell before release if required.

## Remaining Product Risk

The shareable shell and install path are now present, but several HAPAI tools still use the legacy HTML/iframe-style implementation behind the native shell. They route and render, but the next quality pass should port these to native React controls:

- Vessel studio
- Caption composer
- Brief generator
- OG card generator
- Tagline workshop

The tools are safe to share as draft-only public tools, but the legacy ones should not be described as fully rebuilt native app experiences yet.
