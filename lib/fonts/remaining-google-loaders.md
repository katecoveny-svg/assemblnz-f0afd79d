# Noncanonical Google loader repair

Baseline: main `71ac61ac0461d13096e5e5fa8faa23a8830e13f8`. This coherent batch converts all 28 remaining noncanonical declarations across 11 families in 14 modules. Instrument Sans and IBM Plex Mono remain the only production Google imports (three declarations, two families); their options are guarded unchanged. This is not a claim that all font builds are offline.

## Verified failure

PR1449 head `1ff930950cfa4189a0b65dd22ff62c3827f49e55`, DO run [36864175643](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/36864175643), original job 110375449539: 36 Turbopack errors from `[next]/internal/font/google/roboto_b0140833.module.css`, imported by Everyday Rewards layouts. The retained log contains both `next/font/google queries have exactly one entry` and unresolved internal Google font modules. Its unchanged retry passed. This confirms the existing intermittent parser exposure; repeating a build does not remove it. Earlier Montserrat and DM Sans repairs are already merged.

## Exact declaration scope

| Module | Declaration | Family | Weights | Styles | Variable |
| --- | --- | --- | --- | --- | --- |
| `components/homepage/HeroGolden.tsx` | `lato` | Lato | `['400', '900']` | `normal` | `none` |
| `components/homepage/HeroGolden.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `none` |
| `components/ops/toa/ArcHeroBand.tsx` | `zilla` | Zilla Slab | `['400']` | `['italic']` | `none` |
| `app/pilot/layout.tsx` | `lato` | Lato | `['400', '700', '900']` | `normal` | `'--mk-display'` |
| `app/pilot/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--mk-mono'` |
| `lib/brand/fonts.ts` | `jetbrainsMono` | JetBrains Mono | `variable 100–800` | `normal` | `'--font-brand-mono'` |
| `lib/brand/fonts.ts` | `manrope` | Manrope | `variable 200–800` | `normal` | `'--font-brand-display'` |
| `lib/brand/fonts.ts` | `playfair` | Playfair Display | `variable 400–900` | `normal` | `'--font-brand-display'` |
| `lib/brand/fonts.ts` | `orbitron` | Orbitron | `['700']` | `normal` | `'--font-brand-display'` |
| `lib/brand/fonts.ts` | `lato` | Lato | `['400', '700']` | `normal` | `'--font-brand-body'` |
| `lib/brand/fonts.ts` | `publicSans` | Public Sans | `['400', '500', '700']` | `normal` | `'--font-brand-body'` |
| `lib/brand/fonts.ts` | `poppins` | Poppins | `['500', '600', '700']` | `normal` | `'--font-brand-display'` |
| `app/mana-receipts/layout.tsx` | `lato` | Lato | `['400', '700', '900']` | `normal` | `'--mana-body'` |
| `app/mana-receipts/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--mana-mono'` |
| `app/demo/toa-architects/page.tsx` | `lato` | Lato | `['400', '700']` | `normal` | `none` |
| `app/agents/layout.tsx` | `lato` | Lato | `['400', '700', '900']` | `normal` | `'--mk-display'` |
| `app/agents/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--mk-mono'` |
| `app/layout.tsx` | `archivoBlack` | Archivo Black | `['400']` | `normal` | `'--font-editorial'` |
| `app/assembling/fonts.ts` | `dashFont` | Lato | `['400', '700', '900']` | `['normal', 'italic']` | `'--font-dash-sans'` |
| `app/assembling/fonts.ts` | `dashMono` | Space Mono | `['400', '700']` | `normal` | `'--font-dash-mono'` |
| `app/customers/everyday-rewards/assembled/layout.tsx` | `roboto` | Roboto | `['400', '500', '700', '900']` | `normal` | `'--edr-body'` |
| `app/customers/everyday-rewards/assembled/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--edr-mono'` |
| `app/customers/everyday-rewards/ops/layout.tsx` | `roboto` | Roboto | `['400', '500', '700', '900']` | `normal` | `'--edr-body'` |
| `app/customers/everyday-rewards/ops/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--edr-mono'` |
| `app/customers/lula-inn/hospo/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--lula-mono'` |
| `app/customers/everyday-rewards/dash/layout.tsx` | `roboto` | Roboto | `['400', '500', '700', '900']` | `normal` | `'--edr-body'` |
| `app/customers/everyday-rewards/dash/layout.tsx` | `spaceMono` | Space Mono | `['400', '700']` | `normal` | `'--edr-mono'` |
| `app/customers/happy-tails/keeper/layout.tsx` | `mono` | Space Mono | `['400', '700']` | `normal` | `'--font-keeper-mono'` |

## Preservation and provenance

- Extend the existing customer-font manifest, fallback CSS, tests and two-clean-build workflow. No bundler, dependency, settings, database or consumer logic changes.
- Static faces retain individual original weights; variable requests retain original ranges. Roboto width is pinned at 100 to match Google’s normal-width response. Normal/italic and mixed-style requests are retained.
- Multi-source single-style local loaders omit Google’s exported style reset. A small pure metadata helper restores that className/style contract without adding a fontWeight or altering the CSS variable. Single-source declarations use native localFont metadata; mixed-style declarations remain unset as before.
- Official source pins are in assets/customer-fonts.json: Lato 90abd17b4f97671435798b6147b698aa9087612f (Version 1.104), Manrope 8f9a401dbb3793e0d1264b15d96aa253f05280f5 (Version 4.504), matching Google’s currently served versions. Other families use 9710da1eacb3be272583c3224dcb70f9da6eadbb.
- Lato, Orbitron and Playfair Display declare reserved font names. Their original TTF binaries are bundled byte-for-byte unchanged (assetSHA equals sourceSHA), preserving licence/name metadata and avoiding a modified-font rename. Other faces use full WOFF2 compression; no glyph subsetting.
- Lato 1.104 and Orbitron already lack Māori macron glyphs in Google-served files. Their original glyph inventory and adjusted Arial fallback are preserved and tested. The repair does not silently upgrade Lato to 2.015; canonical Instrument Sans continues to carry complete macron coverage.
- assets/noncanonical-google-parity.json records 30 face/weight comparisons across 11 families: served and packaged versions match; all shared glyph advance widths match exactly (maximum delta 0). Source/asset checksums and OFL notices are bundled.
- Current Google fallback metrics are unchanged for every family. Production code import guard prevents reintroducing noncanonical Google loaders. Canonical migration requires a separate review.

## Proof gates

Focused font contracts, canonical options, API metadata, identities, axes, glyph/fallback behavior, unchanged RFN binaries and licences are automated. Full builds run twice without the first Next build cache. Representative browser font loading and normal/italic inheritance proof are required. No local full build starts before the coordinated CPU slot is allocated.
