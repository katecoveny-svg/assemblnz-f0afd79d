# Customer lockup font

`cormorant-garamond-normal.woff2` contains the complete, unsubsetted normal variable Cormorant Garamond font, version 4.001, weight axis 300–700. The two affected customer lockups continue to declare weights 500–600 and keep their existing CSS variables. It is the same version as the previously successful Google Fonts build. All Māori macrons are present.

Source: https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
Original: `CormorantGaramond[wght].ttf`. Converted losslessly to the WOFF2 container using FontTools; no outlines, names, axes or character coverage changed. The original SIL OFL 1.1 licence is included as `CormorantGaramond-OFL.txt`.

This is a narrowly scoped build repair for the two observed failing loaders (`air-nz/ops` and `contact-energy`). It does not change Assembl's Instrument Sans/IBM Plex Mono brand system or the other customer font choices. Next's local font loader self-hosts the asset; those two faces no longer require a build-time Google stylesheet request.

## Recurring customer-font repair · 1 October 2026

The remaining Inter, Inter Tight, Cormorant Garamond and Fraunces declarations now use `next/font/local`. Each declaration retains its previous weight bounds, styles, CSS variable, swap behavior and preload default. `../customer-font-contracts.json` records the original requests for tests. Three normal Cormorant declarations that directly consume `.className` use string `src` and their existing weight bounds (400–500 or 400–600), because Next 16.2.6 omits exported style metadata for array sources. This preserves their previous `font-style: normal` reset, including under an italic ancestor; the range introduces no new weight outside the previous bounds. The single Fraunces 900 italic declaration also retains its original exported weight/style through string `src`. Variable-only and mixed-style declarations retain their separate weight/style faces. Instrument Sans, IBM Plex Mono and unrelated customer families are unchanged.

The assets come from the official `google/fonts` repository, pinned at `9710da1eacb3be272583c3224dcb70f9da6eadbb`. `customer-fonts.json` records the exact source URL, original and packaged SHA-256, version, style, weight range and licence. SIL OFL 1.1 permits bundling and self-hosting; the original licence/copyright files accompany each family. No Reserved Font Names are declared in these licences.

Versions: Inter 4.001 (`66647c0bb`), Inter Tight 3.004, Cormorant Garamond 4.001 and Fraunces 1.000 (`b76b70a41`). The existing Cormorant normal WOFF2 is reused without changing its bytes. The other complete source fonts are packaged as WOFF2 using FontTools 4.60.2/Brotli 1.2.0; no glyphs are removed. All Māori macrons remain covered.

Only weight varies, matching the previous Google requests. Inter optical size is pinned to 14. Fraunces optical size is pinned to 14, softness to 0 and WONK to its source default 1 (inactive at this optical size), matching the served Google face; exposing the complete upstream optical-size axis would change the rendered typography. Normal and italic remain separate files. `../customer-fallbacks.css` retains the precise Next 16.2.6 Google fallback metrics rather than switching to the local loader's different calculated fallback.

Cause: [Next #99114](https://github.com/vercel/next.js/issues/99114). A valid Google Fonts response can contain an extensionless `/l/font?kit=…&skey=…&v=…` URL. Turbopack treats its ampersands as additional internal query entries and fails with `next/font/google queries have exactly one entry`; the reported module-resolution failures follow that parsing failure. Webpack has a separate extension-parsing failure, so a bundler switch is not the remedy.

Scope: this removes the changing Google response from the four families implicated in the recurring customer builds. Other existing Google loaders still need network access; this is not a claim that every font in the app is offline. There are no dependency upgrades, cache resets, retries, build-check bypasses or production configuration changes.
