# assembl Studio — static deploy

The generative studio, deployed as its own static site with `index.html` at the
site root. Mirrors what runs at `assembl-studio.pages.dev`.

## Deploying

This folder is the **site root** of a separate Vercel project (root directory
`studio-dist`, no framework, no build step). Pushing to `main` redeploys it. It
is deliberately not under `public/`, so the main assembl.co.nz build does not
serve it at `/studio-dist/`.

## What is here

| File | Why |
|---|---|
| `index.html` | The whole studio — engines, palettes, exports, the iPhone renderer |
| `three.min.js` | Loaded locally by `index.html` for the 3D engines |

## External dependencies

`index.html` loads three scripts from third-party CDNs at runtime:

- `cdnjs.cloudflare.com` — p5.js 1.11.3
- `cdn.jsdelivr.net` — gif.js
- `js.puter.com` — Puter, which backs the model-assisted rendering

The studio is not self-contained: if any of those hosts is unreachable, the
features depending on them stop working.

## Known issue

`p5.disableFriendlyErrors` is set before p5 has loaded, so the console shows one
non-fatal error on load. It does not stop the studio working.
