# Primary glass identity — current user direction

Kate's locked glass artwork is the primary company a and DO D, including app/browser icons. Exact supplied originals and hashes: `public/brand/canonical/glass-v1/manifest.json`. Shared primary controls: `components/brand/GlassIdentity.tsx`. Web exports: `scripts/glass-identity-assets.mjs`; both existing identity generators use that source. Native installation is separate and must use the same reviewed exports.

The outlined Instrument Sans wordmark remains approved. The earlier letter-mark vectors below are archived compatibility sources, not competing primary marks or automatic tiny-icon fallbacks. Tiny icons are faithful derivatives of the locked glass artwork. No exact glass source mesh was supplied; current scene uses artwork planes inside the real 3D room, not a claimed mesh reconstruction.

---

# assembl browser identity sources

The wordmark outlines implement the approved Instrument Sans wordmark; the primary letter mark follows the locked glass art in the [company canon](../../docs/assembl-brand-system.md).
They are not an alternative brand specification. The company mark is lowercase
`a`; the wordmark is lowercase `assembl`, both in Instrument Sans Medium (500).
Visible light-field ink is `#492B3E`; #240B21 remains the dark/action accent. Tiny glass derivatives must be inspected for legibility without swapping the approved silhouette.

## Font provenance

Outlined from the real Instrument Sans Medium font supplied by Google Fonts on
30 September 2026, not a named fallback or hand-drawn imitation:

- [Official static 500 TTF](https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npST3-Qf1.ttf)
- SHA-256: `a7bcb84cb01f6e33eecdd2cbff3f97ff1674c0e8e37c6921b6cd717b8c854d98`
- Font metadata: Instrument Sans Medium; weight 500; version 1.000
- Copyright 2022 The Instrument Sans Project Authors
- [Upstream](https://github.com/Instrument/instrument-sans), [Google Fonts licence](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt)
- The full SIL Open Font License 1.1 is retained in `OFL.txt`

The SVG paths were extracted with fontTools from the font's actual lowercase
Unicode glyphs (`a` and `assembl`), using their horizontal advances. No font file
or third-party font request is needed to render or regenerate these assets.

## Rebuild and verify

Run `node scripts/generate-assembl-identity.mjs`, then
`pnpm exec vitest run lib/brand/assembl-identity.test.ts`.

- The locked `/brand/assembl-assembled-plum.webp` supplies every 16/32/48/180/192/512px primary icon through `scripts/glass-identity-assets.mjs`; source originals/hashes are in `public/brand/canonical/glass-v1/manifest.json`. The older SVG letter-mark files remain compatibility artefacts, not active primary exports.
- 16/32/48 PNG frames form both `public/icons/favicon.ico` and `app/favicon.ico`
- `app/icon.png` is byte-identical to the 32px PNG; `app/apple-icon.png` to 180px
- `wordmark.svg` produces the existing `/press` download at
  `public/img/press/assembl-wordmark.png` (1200 × 600)

`app/layout.tsx` maps 32/192/512 icons, 180px Apple touch, the ICO shortcut and
`/manifest.webmanifest`. The manifest uses 192/512 icons (including maskable);
the mark fits within the central 80% safe circle. Next also serves the three
file-convention assets in `app/`, so both sources must stay in sync.

The existing root `assembl-icon.png` experiment, `public/images/brand-mark.png`,
old social images, `public/assembling/favicons`, DO's intentional D identity and
verified client assets are outside this current company/browser asset family.

The older outlined glyph and transform remain in `lib/brand/assembl-mark.ts` for compatibility. Primary controls use `GlassIdentity`; the current real-room scene uses exact artwork planes, not claimed glass-mesh parity. DO retains its separate uppercase glass D-dot. Do not use the old vector outline as a substitute for the locked primary art.
