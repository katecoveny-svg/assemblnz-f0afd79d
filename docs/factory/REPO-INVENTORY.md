# assembl repo inventory

**Started:** 16 September 2026  
**Purpose:** classify before moving/deleting. This is not yet a cleanup checklist.

The repository currently mixes shipping code, reusable primitives, active demonstrations, research, generated evidence and legacy material. Agents should not infer authority or freshness from a file simply because it is at the repository root.

## classification rules

- **shipping** — part of current production/runtime path
- **shared primitive** — reusable package/runtime capability
- **active product/demo** — current work but not necessarily shared infrastructure
- **research/reference** — useful evidence/background, not runtime truth
- **generated evidence/output** — screenshots, reports, generated artefacts
- **legacy/archive candidate** — retained for compatibility/history; move/delete only after references are verified
- **needs audit** — role is unclear from top-level structure alone

## known shipping/shared areas

| Path | Class | Notes |
|---|---|---|
| `app/` | shipping | root Next.js App Router; primary app runtime |
| `components/` | shipping | shared + product UI; contains mixed-era brand code that needs gradual migration |
| `lib/` | shipping/shared primitive | domain logic and reusable runtimes |
| `packages/` | shared primitive | workspace packages including Canvas |
| `supabase/` | shipping | migrations + edge functions; independent Deno runtime for functions |
| `scripts/` | shipping/tooling | build guards, evals, setup and maintenance |
| `styles/` | shipping/needs audit | shared styles; verify current vs legacy ownership |
| `public/` | shipping/mixed | production assets plus client/legacy brand material |
| `middleware.ts` | shipping | critical routing/splash/auth gate |
| `next.config.ts` | shipping | production Next config |
| `package.json` | shipping | root toolchain truth |
| `pnpm-workspace.yaml` | shipping | workspace definition |

## current context / operating system

| Path | Class | Notes |
|---|---|---|
| `START_HERE.md` | canonical context | universal entry point |
| `AGENTS.md` | canonical context | root operating contract |
| `config/context-manifest.json` | canonical context | machine-readable routing source |
| `docs/context/` | canonical/current context | current state + routing + adapters |
| `docs/factory/` | canonical factory memory | decisions, primitives, learnings, inventory |
| `docs/assembl-context.md` | canonical strategy | durable company/product strategy |
| `docs/assembl-brand-system.md` | canonical brand | plum + Instrument Sans company direction |
| `docs/assembl-copy-standard.md` | canonical copy | public copy standard |
| `CLAUDE.md` | supplementary memory | valuable fault/harness notes; should not override canon |

## obvious mixed/legacy candidates to audit

| Path | Provisional class | Why it needs cleanup |
|---|---|---|
| `legacy-vite/` | legacy/archive candidate | explicitly historical old SPA |
| `app/` + `apps/` | needs audit | ambiguous dual application naming; determine what `apps/` contains before moving |
| `test/` + `tests/` | needs audit | duplicate test roots; classify ownership and runner references |
| `.pr-assets/` | generated evidence/output | overlaps other PR evidence folders |
| `.pr-screenshots/` | generated evidence/output | overlaps other PR evidence folders |
| `.pr-shots/` | generated evidence/output | overlaps other PR evidence folders |
| `.prshots/` | generated evidence/output | overlaps other PR evidence folders |
| `pr-evidence/` | generated evidence/output | candidate canonical evidence folder after audit |
| `outputs/` | generated evidence/output | historical/current generated material mixed together |
| `research/` | research/reference | should remain outside automatic context loading |
| `marketing/` | research/active content | classify current vs historical |
| `aironaut-hero-fix/` | legacy/active-demo candidate | root-level feature artefact; verify references |
| `aironaut-map/` | legacy/active-demo candidate | root-level feature artefact; verify references |
| `Construction/` | needs audit | inconsistent root naming / unclear runtime role |
| `italiaitalia-main.zip` | archive candidate | binary source archive committed at root |
| `italia-source-reference.md` | research/reference | very large root reference file; should not be auto-context |
| root `voyage-*` files | research/active-product candidate | numerous product docs at root; likely should live under a scoped docs/product area after reference audit |
| root dated audits/briefings | research/reference | useful history but visually compete with current canon |
| `.Jules/` | harness-specific | inspect for duplicated canonical context before changing |
| `.lovable/` | legacy/tool-specific candidate | inspect before cleanup |

## brand drift hotspots already identified

These are migration candidates, not blanket-delete targets:

- `brand/tokens.ts` — corrected on the current cleanup branch to expose current plum/Instrument Sans defaults while retaining legacy compatibility tokens
- `lib/v2/og.tsx` — old Cormorant/champagne direction
- `components/admin/ui.tsx` — old Cormorant/Lato/Space Mono + champagne direction
- `app/admin/(hub)/layout.tsx` — old locked-canon comments/type assumptions
- `app/home.module.css` — references older canon variables
- `components/site/AuthHeader.tsx` — old Cormorant/gold header assumptions
- `lib/build-an-agent/og-card.tsx` — old Cormorant generation

Client/legacy-specific brand configs must be reviewed separately; do not replace verified client branding with Assembl plum.

## next cleanup sequence

### PR A — context + brand memory
Current branch. Establish current state, manifest, updated strategy, cross-agent adapters and drift checks.

### PR B — harness alignment
- reduce `CLAUDE.md` to fault/harness memory + canonical links
- inspect `.Jules/` for duplicated strategy/brand
- add minimal bootstrap adapters only where a harness cannot read `AGENTS.md`

### PR C — brand migration: current company shell
- identify which old-brand matches are actually current company surfaces
- migrate company homepage/auth/admin/OG/shared tokens in bounded batches
- keep named client and legacy surfaces scoped/exempt
- tighten brand guard only after the current shell is clean

### PR D — evidence/output consolidation
- choose one PR evidence location
- update scripts/workflows to use it
- archive/remove duplicate evidence folders only after references are checked

### PR E — structural duplicates
- audit `app` vs `apps`
- audit `test` vs `tests`
- classify root one-off feature folders
- move documentation/research only after code/deploy references are verified

### PR F — secrets/environment hygiene
- audit tracked `.env` without reproducing values
- rotate anything that has ever been a live secret
- make examples/placeholders canonical
- remove tracked sensitive configuration safely

## rule

A tidier tree is not worth breaking production. Classify → verify references → move in a small PR → run checks → prove behaviour.
