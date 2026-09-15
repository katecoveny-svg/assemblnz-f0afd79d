# assembl repo inventory

**Updated:** 16 September 2026  
**Purpose:** classify before moving/deleting. This is the structural map for cleanup work.

The repository intentionally contains more than one runtime/product, plus historical material. A visually similar folder name is not automatically a duplicate.

## classification rules

- **shipping** — current production/runtime path
- **shared primitive** — reusable package/runtime capability
- **active product/demo** — current work, not necessarily shared infrastructure
- **research/reference** — useful evidence/background, not runtime truth
- **generated evidence/output** — screenshots, reports, generated artefacts
- **legacy/archive candidate** — retained for compatibility/history; move/delete only after references are verified
- **harness-specific** — adapter/learning material for an agent harness, never higher than repo canon
- **needs audit** — role still unclear

## canonical operating/context spine

| Path | Class | Notes |
|---|---|---|
| `START_HERE.md` | canonical context | universal entry point |
| `AGENTS.md` | canonical context | root operating contract |
| `AGENT_CHAT_STARTER.md` | reusable bootstrap | user-facing prompt for new agent chats |
| `config/context-manifest.json` | canonical context | machine-readable routing source |
| `docs/context/CURRENT.md` | canonical current state | fast-moving operating state |
| `docs/context/README.md` | canonical router | precedence + task routing |
| `docs/context/AGENT-ADAPTERS.md` | adapter guidance | Codex/Claude/Hermes/DO routing |
| `docs/factory/` | canonical factory memory | decisions, primitives, learnings, evidence convention, inventory |
| `docs/assembl-context.md` | canonical strategy | durable company/product strategy |
| `docs/assembl-brand-system.md` | canonical brand | plum + Instrument Sans company direction |
| `docs/assembl-copy-standard.md` | canonical copy | public copy standard |
| `CLAUDE.md` | harness adapter | now points Claude at shared canon; not a strategy copy |
| `.Jules/` | harness-specific | interaction/accessibility learnings + canonical bootstrap pointer |

## shipping/shared areas

| Path | Class | Notes |
|---|---|---|
| `app/` | shipping | primary Next.js web App Router |
| `apps/do/` | active product/runtime | separate DO multi-platform product: extension + iOS + Android + macOS + services/shared. **Not a duplicate of `app/`.** |
| `components/` | shipping | shared + product UI; mixed-era brand code still being migrated |
| `lib/` | shipping/shared primitive | domain logic and reusable runtimes |
| `packages/` | shared primitive | workspace packages including Canvas/registry |
| `plugins/` | agent/plugin product + tooling | scoped instructions apply |
| `supabase/` | shipping | migrations + Deno edge functions |
| `scripts/` | shipping/tooling | build guards, evals, setup and maintenance |
| `styles/` | shipping/needs audit | shared styles; verify current vs legacy ownership before migration |
| `public/` | shipping/mixed | production assets + client/legacy material |
| `remotion/` | active product/tooling | independent Bun-based creative/video runtime |
| `middleware.ts` | shipping | critical routing/splash/auth gate |
| `next.config.ts` | shipping | production Next config |
| `package.json` | shipping | root web toolchain truth |
| `pnpm-workspace.yaml` | shipping | workspace definition |

## test roots — clarified

These are not currently true duplicates:

| Path | Role |
|---|---|
| `test/` | shared test infrastructure; currently contains `server-only-stub.ts`, referenced by Vitest aliasing |
| `tests/` | higher-level test suites; currently includes `tests/agents/` |

Do not merge them only for naming neatness. Revisit if runner/config conventions are standardised later.

## generated evidence/output

### Canonical going forward

Use `pr-evidence/<branch-or-pr-slug>/` for new PR proof. See `docs/factory/EVIDENCE.md`.

### Historical cleanup candidates

- `.pr-assets/`
- `.pr-screenshots/`
- `.pr-shots/`
- `.prshots/`

Do not create new content there. Do not delete/move existing evidence until old PR/reference links have been checked.

`outputs/` remains a mixed generated-output area and should not be loaded as context by default.

## research/reference / archive candidates

| Path | Provisional class | Notes |
|---|---|---|
| `legacy-vite/` | legacy/archive candidate | old SPA; read for history/porting only |
| `research/` | research/reference | useful but outside automatic context loading |
| `marketing/` | research/active content | classify current vs historical by sub-area |
| `aironaut-hero-fix/` | archive/active-demo candidate | root-level artefact; verify references |
| `aironaut-map/` | archive/active-demo candidate | root-level artefact; verify references |
| `Construction/` | needs audit | inconsistent root naming / unclear runtime role |
| `italiaitalia-main.zip` | archive candidate | binary source archive committed at root |
| `italia-source-reference.md` | research/reference | very large root reference file |
| root `voyage-*` files | research/active-product candidate | should eventually move under a scoped Voyage docs area after reference checks |
| root dated audits/briefings | research/reference | useful history but not current canon |
| `.lovable/` | legacy/tool-specific candidate | inspect before cleanup |

## brand drift hotspots

Migration candidates, not blanket-delete targets:

- `lib/v2/og.tsx`
- `components/admin/ui.tsx`
- `app/admin/(hub)/layout.tsx`
- `app/home.module.css`
- `components/site/AuthHeader.tsx`
- `lib/build-an-agent/og-card.tsx`
- other old Cormorant/champagne assumptions reported by `pnpm context:check`

`brand/tokens.ts` has already been corrected to expose current plum/Instrument Sans company defaults while retaining explicitly legacy compatibility tokens.

Client/legacy-specific brand configurations must be reviewed separately; never replace verified client branding with Assembl plum simply because a string search finds an old font/colour.

## cleanup sequence — current status

### A. context + persistent memory — done
- universal entry point
- current state
- machine-readable manifest
- strategy refresh
- brand snapshot
- nightly context review
- context-health tooling

### B. harness alignment — in progress
- `CLAUDE.md` reduced to adapter + critical reminders
- `.Jules/README.md` routes Jules through shared canon
- `AGENT_CHAT_STARTER.md` provides one user-facing bootstrap for new chats
- next: verify any other harness-specific root instructions before adding adapters

### C. brand migration: current company shell — next
- classify old-brand matches as current company / client / legacy
- migrate current company shell in bounded batches
- tighten brand guard after current company surfaces are clean

### D. evidence/output consolidation — convention set, physical cleanup later
- `pr-evidence/` is canonical for new evidence
- stop creating alternate evidence folders
- archive/remove historical duplicate folders only after link/reference audit

### E. structural cleanup — partially resolved
- `app/` vs `apps/`: resolved; distinct runtimes, keep both
- `test/` vs `tests/`: resolved for now; distinct purposes, keep both
- root one-off feature/research folders: still need reference audit

### F. secrets/environment hygiene — still urgent
- audit tracked root `.env` without reproducing values
- rotate anything that has ever been a live secret
- examples/placeholders should be canonical
- remove tracked sensitive configuration safely

## rule

A tidier tree is not worth breaking production. **Classify → verify references → move in a small PR → run checks → prove behaviour.**
