# Remaining build-time Google font loaders

Inventory against main `dd241e532519f00094a221d094a584840544ca06`, before the Montserrat follow-up. 34 declarations across 15 families. No matching licensed local assets existed for these families; existing bundled assets are Inter, Inter Tight, Cormorant Garamond and Fraunces. The separate Plus Jakarta Sans/Fraunces OG assets do not substitute for another family.

The minimal follow-up converts only the two Montserrat declarations. Other entries are explicit follow-up scope, not a claim that build-time Google requests have all been removed. Canonical Instrument Sans and IBM Plex Mono remain unchanged.

| Family | Module / declaration | Requested weights | Styles | Local asset in this follow-up |
| --- | --- | --- | --- | --- |
| JetBrains Mono | `lib/brand/fonts.ts` / `jetbrainsMono` | `variable default` | `normal` | None |
| Manrope | `lib/brand/fonts.ts` / `manrope` | `variable default` | `normal` | None |
| Playfair Display | `lib/brand/fonts.ts` / `playfair` | `variable default` | `normal` | None |
| Orbitron | `lib/brand/fonts.ts` / `orbitron` | `['700']` | `normal` | None |
| Lato | `lib/brand/fonts.ts` / `lato` | `['400', '700']` | `normal` | None |
| Public Sans | `lib/brand/fonts.ts` / `publicSans` | `['400', '500', '700']` | `normal` | None |
| Montserrat | `lib/brand/fonts.ts` / `montserrat` | `['300', '500', '700']` | `normal` | `montserrat-normal.woff2` |
| Poppins | `lib/brand/fonts.ts` / `poppins` | `['500', '600', '700']` | `normal` | None |
| Lato | `components/homepage/HeroGolden.tsx` / `lato` | `['400', '900']` | `normal` | None |
| Space Mono | `components/homepage/HeroGolden.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Zilla Slab | `components/ops/toa/ArcHeroBand.tsx` / `zilla` | `['400']` | `['italic']` | None |
| Lato | `app/pilot/layout.tsx` / `lato` | `['400', '700', '900']` | `normal` | None |
| Space Mono | `app/pilot/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| DM Sans | `app/alphassembl/layout.tsx` / `dmSans` | `['500', '600', '700']` | `normal` | None |
| Lato | `app/demo/toa-architects/page.tsx` / `lato` | `['400', '700']` | `normal` | None |
| Lato | `app/mana-receipts/layout.tsx` / `lato` | `['400', '700', '900']` | `normal` | None |
| Space Mono | `app/mana-receipts/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Space Mono | `app/customers/happy-tails/keeper/layout.tsx` / `mono` | `['400', '700']` | `normal` | None |
| Lato | `app/agents/layout.tsx` / `lato` | `['400', '700', '900']` | `normal` | None |
| Space Mono | `app/agents/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Instrument Sans | `app/layout.tsx` / `instrumentDisplay` | `['400', '500', '600', '700']` | `normal` | None |
| Instrument Sans | `app/layout.tsx` / `instrumentBody` | `['400', '500', '600', '700']` | `normal` | None |
| IBM Plex Mono | `app/layout.tsx` / `plexMono` | `['400', '700']` | `normal` | None |
| Archivo Black | `app/layout.tsx` / `archivoBlack` | `['400']` | `normal` | None |
| Space Mono | `app/customers/lula-inn/hospo/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Lato | `app/assembling/fonts.ts` / `dashFont` | `['400', '700', '900']` | `['normal', 'italic']` | None |
| Space Mono | `app/assembling/fonts.ts` / `dashMono` | `['400', '700']` | `normal` | None |
| Montserrat | `app/customers/contact-energy/layout.tsx` / `montserrat` | `['400', '500', '600', '700', '900']` | `normal` | `montserrat-normal.woff2` |
| Roboto | `app/customers/everyday-rewards/ops/layout.tsx` / `roboto` | `['400', '500', '700', '900']` | `normal` | None |
| Space Mono | `app/customers/everyday-rewards/ops/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Roboto | `app/customers/everyday-rewards/assembled/layout.tsx` / `roboto` | `['400', '500', '700', '900']` | `normal` | None |
| Space Mono | `app/customers/everyday-rewards/assembled/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |
| Roboto | `app/customers/everyday-rewards/dash/layout.tsx` / `roboto` | `['400', '500', '700', '900']` | `normal` | None |
| Space Mono | `app/customers/everyday-rewards/dash/layout.tsx` / `spaceMono` | `['400', '700']` | `normal` | None |

## Migration constraints

- Every remaining family uses the same vulnerable Google loader. A passing preview does not establish a durable parser fix.
- A subsequent migration must retain each declaration’s exact weights/styles/variables and className/style behavior. Static families need their original weight-specific files, not a different family or fabricated variable range.
- Canonical Instrument Sans/Plex Mono need explicit reviewer scrutiny before changing their loader, including served version, glyphs, metrics, normal style reset and visual checks. Family identity must stay the same.
- Preserve Next 16.2.6 fallback metrics and pinned official source provenance/licences. Check reserved font names before conversion.
- Reuse checked-in assets only where family, style, axis defaults and weight coverage match. Cache output alone is not licensed source provenance.
- Extend the existing font contract tests and repeat full builds in isolated output directories. No dependency/bundler switch or skipped build.

## DM Sans follow-up evidence

Maintenance exact-head CI run [36837881883](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/36837881883), reconciled head `d46bc0f9e`, failed after type/core tests passed: six Turbopack errors in `[next]/internal/font/google/dm_sans_b4859cc7.module.css`, imported by `app/alphassembl/layout.tsx`. The log contains both “next/font/google queries have exactly one entry” and unresolved `@vercel/turbopack-next/internal/font/google/font`. The Vercel preview passed that head. This is the same intermittent parser exposure; repeating the build does not remove it.

The separate DM Sans patch converts only `dmSans` in that layout (normal 500/600/700, `--font-alpha-display`). It pins optical size14, matching the currently Google-served outlines, rather than silently using the source TTF optical-size9 default. Source and served versions are4.004. Canonical Instrument Sans/Plex Mono remain unchanged; 13 other Google families remain after Montserrat and DM Sans.
