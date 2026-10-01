# assembl browser identity sources

These outlined assets implement the current [company canon](../../docs/assembl-brand-system.md).
They are not an alternative brand specification. The company mark is lowercase
`a`; the wordmark is lowercase `assembl`, both in Instrument Sans Medium (500).
Deep plum `#240B21` on paper `#FFFDFB` remains legible at favicon sizes.

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

- `mark.svg` produces `public/icons/assembl-icon-{16,32,48,180,192,512}x*.png`
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
