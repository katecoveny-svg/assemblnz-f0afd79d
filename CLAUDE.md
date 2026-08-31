# assembl — agent memory

Dense, load-bearing notes for AI assistants working in this repo. Everything
here is either locked canon or a fault that has already cost a build. Read the
linked docs before touching the area they cover.

---

## What assembl is

**Concept (locked 2026-07-10):** assembl is a **living business operating
system**, not an AI agent marketplace. One Business Genome per customer;
every surface (website, CRM, bookings, knowledge, agents, emails) reads it.
"Less admin. More mahi." / "assembl grows your business while you run it."

**Strategic direction — agentic customer journeys.** assembl creates agentic
customer journeys that understand what people need, complete the work around
them, and prove the experience is improving. "Find the friction. Assemble the
journey. Prove the result." Full strategy in `docs/assembl-context.md`; the
reusable foundation lives in `lib/journey/` (`docs/agentic-customer-journey.md`)
with the reference journey "everyday, assembled" at `/journeys/everyday-assembled`.
One `CustomerJourney` object powers the runtime, customer interface, approvals,
wait state and proof; industries reuse it by changing configuration only. The
Business Genome is the intelligence foundation; context is selected per stage
(never load the whole genome). Nothing sends/orders without a human yes; label
simulated/proposed/approval-required honestly — never claim `completed` unless
genuinely done.

**The demo cast is FICTIONAL (locked 2026-07-10):** no real prospect has
agreed to appear, so no demo surface may name a real business or person.
Flagship vertical: "Harbourside Dog Training" / owner "Sam" (tenant key
`auckland-dog-trainer` is a legacy identifier only — never surface the old
real-world branding it once carried). All sample verticals live in
`lib/living-site/verticals.ts` + `living_site_genome`; every sample site
carries a "sample business — details fictional" strip. Keep it that way.

---

## Read first, by area

| Working on | Read |
|---|---|
| Anything visual / interface / copy | invoke the `assembl-design` skill, then `docs/assembl-brand-system.md` |
| Public copy | `docs/assembl-copy-standard.md` + `COPY.md` |
| Living Site | `docs/LIVING-SITE-HANDOVER.md` — full state, DB details, PR history, open list |
| Wait states / demonstrators | `docs/agentic-wait-states-roadmap.md` (locked 2026-08-03) |
| Journey foundation | `docs/agentic-customer-journey.md`, `docs/agentic-journey-foundation-plan.md` |
| Catching up generally | `docs/CONTEXT.md` (25 Jul 2026 state of play) |
| Architecture / roadmap | `docs/AGENTIC-OS-ARCHITECTURE.md`, `docs/AGENT-REGISTRY.md` |
| Release | `docs/deployment-and-release-checklist.md`, `docs/deployment-surfaces.md` |
| Env vars | `.env.local.example` (annotated, authoritative), `docs/ENVIRONMENT.md` |
| `plugins/` | `plugins/CLAUDE.md` — hard compliance rules, scoped to that tree |
| `remotion/` | `remotion/CLAUDE.md` — Bun toolchain, independent of the app |
| Repo conventions, done-criteria | `AGENTS.md` |

`README.md` is **stale** — it describes the old Vite SPA now parked in
`legacy-vite/`. Trust `package.json` scripts, not the README.

The wait-states roadmap carries the three products (live / rewarded / sponsored
waits), sponsorship models A–E, and the per-company scope and exact wording for
the demonstrator family (Air NZ, Contact, Nectar, Instant Finance, Sharesies,
My Food Bag, Summerset, Ryman). Build demos to it.

---

## Stack and commands

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind 3 · Supabase ·
Vercel AI SDK v6 · three/R3F · framer-motion · vitest. **pnpm 9.15.9**, Node 20+.
pnpm workspace: the app is the repo root (`assembl-web`); `packages/*` holds
shippable packages.

```bash
pnpm install
pnpm --filter @assembl/canvas build   # REQUIRED once before typecheck/dev/build
pnpm dev                              # localhost:3000
pnpm typecheck                        # tsc --noEmit
pnpm test                             # vitest run
pnpm lint                             # NARROW: arataki surfaces only
pnpm lint:all                         # eslint . --max-warnings=0
pnpm lint:macrons                     # te reo macron guard
node scripts/brand-guard.mjs          # deprecated-token guard
pnpm build                            # brand-guard + canvas build + next build
pnpm eval:journeys                    # journey release gate (exits non-zero on failure)
pnpm test:agents                      # agent suite via lib/testing/cli.ts
```

`pnpm lint` only covers `app/kete/arataki components/arataki lib/arataki`. It
passing means nothing about the rest of the repo — use `lint:all` when you have
touched anything else.

Sub-projects have their own toolchains and are **not** part of the app setup:
`remotion/` uses Bun, `plugins/mcp-servers/*` use npm, `supabase/functions/*`
are Deno.

---

## Repo map

```
app/                  Next.js App Router — ~390 pages, 165 route handlers under app/api/
  page.tsx            homepage → components/site/ActiveJourneyHome + active-journey-home.css
  customers/<tenant>/ hosted pilot workspaces (public site + /ops operator surface)
  journeys/ experience/  agentic journey surfaces
  admin/ operator/ internal/ dev/   non-public surfaces (see splash gate below)
  lab/ studio/ *-studio/            design labs and generative studios
components/           v2/ (current chrome + home), site/, customers/, ui/, per-product dirs
lib/                  domain logic, one dir per product area
  journey/            the reusable CustomerJourney foundation (types, runtime, proof, eval)
  living-site/        verticals, bookings, documents, desk
  customers/          per-tenant genome, agents, demo data; tenants.ts is the registry
  copy/               homepage.ts + editorial-home.ts — mirror of COPY.md
  ai/                 model router with a fail-open provider ladder
  supabase/           client.ts (browser) · server.ts (RSC) · service.ts (service role)
  agents.ts kete.ts workflows.ts   public fleet / kete / workflow registries
packages/canvas/      @assembl/canvas — design tokens + motion + primitives (tsup → dist/)
packages/dash-sdk/    @assembl/dash-sdk — Dash ad-network client SDK
plugins/              Claude Code plugin marketplace (kete plugins, skills, MCP servers)
supabase/             346 migrations + ~100 Deno edge functions
scripts/              brand-guard, macron lint, catalog builders, Stripe setup, evals
legacy-vite/          the old Vite SPA — read for porting, do not edit casually
research/ marketing/ docs/   non-shipping material
```

`tsconfig.json` excludes `legacy-vite`, `supabase`, `remotion`, `docs`,
`plugins` — typecheck does not cover them.

---

## Architecture notes

- **Supabase** (`wurwcrgxjjwqdaxqceey`, Sydney) is the one live project despite
  the "Lovable" lineage in its name. Three clients: `lib/supabase/client.ts`
  (browser, publishable key), `server.ts` (RSC/route handlers, user session),
  `service.ts` (service role, `import 'server-only'`, never reachable from the
  browser). RLS deny-all tables are only ever touched through `service.ts`.
- **Everything optional fails open.** Model providers, Stripe, Deepgram, Fal,
  Brevo etc. return a friendly "not configured" rather than crashing. Supabase
  is the exception: `/login`, `/account`, `/dashboard`, `/app`, `/internal`,
  admin and live chat `throw` without `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Public marketing renders without them.
- **Model routing** (`lib/ai/router.ts`) is a ladder: Anthropic → Gemini Flash →
  Groq → local Ollama. A rung is included only when its credential exists.
- **Tenants** are registered in `lib/customers/tenants.ts` with a status of
  `concept` (pitch surface, draft-only, never real data) / `pilot` (signed and
  live) / `archived`. Keep it in sync with `tenant_customers` in Supabase.
- **Agent prompts**: files are the source of truth; the `agent_prompts` table is
  a runtime cache, synced from `plugins/managed-agent-cookbooks/` by a GitHub
  Action. Never treat the table as canonical.
- **Journey runtime** persists to `journey_runs` when the service role is
  configured, and silently falls back to an in-process store when it is not —
  that fallback is **not durable**, and capability status must say `sandbox`.

---

## Invariants that bite

- `middleware.ts` splash gate rewrites every non-exempt path to `/` on
  assembl.co.nz — new public routes and asset types MUST be exempted in both
  the splash and demo-auth lists, or they silently serve the homepage/401.
  This has shipped as a bug at least four times (`/ai-ready`, `/lab/type`,
  `/demos`, `/generative-studio`). Prefixes live in `SPLASH_EXEMPT_PREFIXES`,
  exact paths in `SPLASH_EXEMPT_EXACT`, file types in `SPLASH_STATIC_FILE`.
  A prefix without its trailing slash startsWith-matches siblings (`/a` would
  swallow `/app`) — use `'/a/'` plus an exact entry.
- `pnpm typecheck`, `next dev` and `next build` all need
  `pnpm --filter @assembl/canvas build` first. `@assembl/canvas` has no
  `transpilePackages` wiring; consumers import its compiled `dist/`.
  `Cannot find module '@assembl/canvas'` always means this.
- Tui splat: upright = runtime Rx(130°) `orient` on the inner group in
  `components/v2/home/TuiSplat.tsx`; the binary's "upright bake" is wrong.
- `node scripts/brand-guard.mjs` + `pnpm lint:macrons` run on build: never
  write "canary"/old gold hexes on marketing surfaces; macrons required
  (Tā, Tōro, Pīkau, Mātauranga). brand-guard's scope is the new-direction
  surfaces only — legacy microsites and HAPAI tools are audited separately.
- `packages/canvas/src/tokens.ts` exports **two** palettes: `canon` (plum —
  current) and `palette` (champagne/navy — legacy, kept so old consumers keep
  rendering). New work reads `canon`.
- `tailwind.config.ts` still carries the older pearl/teal `assembl.*` tokens
  and a stale Cormorant-led comment. It has not been migrated to the plum
  canon. Do not treat it as the palette source of truth — `docs/assembl-brand-system.md`
  and `canon` win.
- `MicroLabel as=` accepts div|h2|h3|p|span only (`packages/canvas/src/components/`).
- Supabase: `living_site_genome` + `living_site_enquiries` are RLS deny-all;
  access only via `lib/supabase/service.ts` in server code, with static fallback
  (`lib/customers/auckland-dog-trainer/genome-store.ts`).
- Verify UI changes against `pnpm build && pnpm start` (prod bundle), not
  just dev — and screenshot with the preinstalled Chromium.
- Before coding against a schema, table or file the brief asserts, **verify it
  exists**. Briefs in this repo have been wrong about key names before.

---

## Testing

`vitest.config.ts` scopes runs to `lib/**`, `app/**`, `packages/**` and
`components/**` `.test.ts` files, node environment. It deliberately excludes
`supabase/functions/**` (Deno tests, run separately) and
`lib/toro/__tests__/state-machine.test.ts` (a tsx-runner script that calls
`process.exit`). `server-only` is aliased to `test/server-only-stub.ts` so
server modules are unit-testable.

Release gates, in order (`docs/deployment-and-release-checklist.md`):
`pnpm --filter @assembl/canvas build` → `pnpm typecheck` → `pnpm test` →
`pnpm eval:journeys` → brand-guard + macrons → `pnpm build`. `pnpm eval:journeys`
exits non-zero on any critical scenario failure; treat it as blocking.

`AGENTS.md` also requires: mobile responsive at 375px minimum, Vercel preview
green, and a PR body listing acceptance criteria plus a test plan.

---

## Deployment

Vercel, `framework: nextjs`, promoted from `main`. `vercel.json` carries the
crons (`/api/spark/winter-series/ingest` weekly, `/api/business-pulse/scheduled`
hourly, `/api/dash/payouts/run` nightly) and an `ignoreCommand` that skips
builds for asset/screenshot branches and for `plugins/`-only diffs.
`.vercelignore` keeps `plugins/` out of the deployment entirely.

GitHub Actions: `deploy-edge-functions.yml` (Supabase functions on push to
main), `deploy-demos.yml` (Cloudflare Pages for `research/assembling-*`),
`sync-plugins-to-agent-prompts.yml` (cookbooks → `agent_prompts`).

---

## Workflow

- Feature branch per effort (`claude/…`); after a PR merges, restart the same
  branch from `origin/main` — never stack on merged history.
- Demo data is SAMPLE-labelled everywhere; nothing sends without a human yes
  (draft-only is a product principle, not just copy).
- Everything under `plugins/` is staged for human sign-off by design — no
  agent files, lodges or submits to a NZ agency. See `plugins/CLAUDE.md`.

---

## Design canon — invoke the `assembl-design` skill

Invoke `assembl-design`
(`plugins/assembl-core/skills/assembl-design/SKILL.md`) before ANY assembl
visual, interface or copy work.

**Current palette and type (locked 2026-08-10, `docs/assembl-brand-system.md`):**
deep plum `#240B21`, muted plum `#654A4E`, dusty rose `#916A70`, chalk
`#F5F1F2`, paper `#FFFDFB`. Instrument Sans for headlines, body, navigation and
controls; IBM Plex Mono **only** for wait-state labels, evidence, timestamps and
proof. Dusty rose marks state, progress, permission or the active piece — it is
not decorative. Client colour may replace dusty rose inside a named client
demonstrator only; the assembl frame, permission and proof surfaces stay
canonical. No brass, gold, amber, pounamu, cobalt, pearl or neon gradients on
assembl company surfaces, and never canary. This supersedes the earlier teal +
gold-hairline "pearl" canon and the Cormorant-led directions wherever they
conflict; `BRAND-CANON.md` and `docs/DESIGN-SYSTEM-VNEXT.md` are historical.

Naming is lowercase `assembl` everywhere — never `Assembl`, never `ASSEMBL`.
Motion is assembly: the camera stays still, objects move, causality is visible,
the evidence receipt locks last, reduced-motion users get the fully assembled
state. No spinners, nothing pops or bounces. No chatbot or robot imagery — use
editorial or sculptural product photography. No bare "AI" in customer copy: use
an agent name, `assembl`, or a description of the function.

**Design canon (locked 2026-07-10): `docs/DESIGN-SYSTEM-VNEXT.md`.** The
short version: not a SaaS dashboard — the calmest business OS ever designed.
One primary action per screen; progressive disclosure; if a screen can lose
half its elements, remove them. Quiet editorial typography, whitespace, one
restrained accent; motion assembles (nothing pops or bounces). Human words,
no AI jargon, never expose implementation. Don't make it look like an AI
product — make it look like the future of running a business. Success
metric: "How did it already know that?"

---

## Copy rules — non-negotiable

- Every customer-facing string lives in `COPY.md` (mirrored by
  `lib/copy/homepage.ts`). Code renders strings from that manifest; you never
  author copy inline.
- You may NEVER rewrite, paraphrase, "tighten", or "improve" any string in
  `COPY.md`. If a task seems to need new or changed copy, STOP and ask Kate.
  Propose; never substitute.
- Banned everywhere, including placeholder and alt text: "quietly", "quiet
  intelligence", "seamless", "seamlessly", "effortless", "unlock", "empower",
  "elevate", "supercharge", "revolutionise", "game-changing", "cutting-edge",
  "harness the power", "take your business to the next level", "in today's
  fast-paced world", "the work that matters" as a standalone line.
- No rule-of-three cadence added for rhythm ("X, Y, and Z" repeated as
  decoration).
- NZ English spelling. Te reo Māori words keep their macrons (mahi, Tāmaki
  Makaurau, Aotearoa, mātauranga). Never add te reo as decoration; never
  generate karakia, mihimihi, pepeha or any ceremonial text.
- The tagline "Mahi that earns its proof." is fixed. Never touch it.
- Sentences must pass this test: could a reader picture the actual work and the
  time it saves? If a sentence could sit on any SaaS site, it does not belong
  on this one.
