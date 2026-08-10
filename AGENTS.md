# AGENTS.md — assembl repo guidance for AI agents

## Working folder

`/Users/kateharland/assemblnz-f0afd79d`

Verify with: `git remote -v` → must show `origin → katecoveny-svg/assemblnz-f0afd79d`.

## Canonical brand

Tokens:
- Deep plum: `#240B21`
- Muted plum: `#654A4E`
- Dusty rose: `#916A70`
- Chalk: `#F5F1F2`
- Paper: `#FFFDFB`

Typography:
- Instrument Sans for headlines, body, navigation and controls
- IBM Plex Mono only for wait-state labels, evidence, timestamps and proof

The complete visual source of truth is `docs/assembl-brand-system.md`. It overrides older brass, amber, pounamu, cobalt, pearl and Cormorant-led directions wherever they conflict. Verified client colours remain scoped to their named demonstrators.

Wordmark: always lowercase `assembl`. Never `Assembl`, never `ASSEMBL`.

Macron correctness:
- Tōro, never Tōroa or Toro in display copy
- Pīkau, Mātauranga, whānau, kaitiaki, tikanga, Aotearoa, Māori

No bare "AI" in customer copy. Use an agent name, `assembl`, or a descriptive function.

No chatbot or robot imagery. Use editorial photography or sculptural product photography. Vessel imagery is reserved for marketing surfaces where appropriate.

## Repo structure

- `app/` — Next.js App Router
- `app/kete/[slug]/` — marketing pages per kete
- `app/kete/arataki/*` — Arataki public sub-routes
- `app/operator/arataki/*` — Arataki operator surfaces
- `app/w/[slug]/` — workflow runner
- `app/api/*` — Next.js Route Handlers
- `components/site/*` — site-wide components
- `components/arataki/*` — Arataki-kete-specific components
- `lib/workflows.ts` — workflow definitions
- `lib/agents.ts` — agent fleet registry
- `lib/kete.ts` — kete metadata
- `plugins/arataki/sub-agents/*` — Plugin Canon agent prompts
- `supabase/functions/*` — edge functions
- `legacy-vite/` — old Vite app; read for porting, do not edit casually

## Verifying scope before coding

Before writing code that depends on schema, files, or table structures:
1. Run `git fetch origin && git pull origin main`.
2. Check file/table existence against the current repo and Supabase schema.
3. If the brief assumes something that does not match reality, ask before proceeding.

Example: if a brief says `loan_cars` is keyed by `tenant_id`, verify first. The historical reality was `user_id` as owner plus `tenant_id` added later for rooftop aggregation.

## Done criteria

Every PR must:
- [ ] `npm run lint` passes with zero warnings
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] Brand canon checks pass:
  - `grep -rn 'Assembl' app/operator/arataki/` returns zero
  - `grep -rn 'Tōroa' app/` returns zero
  - No bare "AI" in customer-facing strings
- [ ] Mobile responsive at 375px minimum
- [ ] Vercel preview deploys green
- [ ] PR body lists acceptance criteria and includes a test plan

## Cursor Cloud specific instructions

The live app is the **Next.js 16 app at the repo root** (`assembl-web`), managed with
**pnpm** (`packageManager: pnpm@9.15.9`, Node 20+). The startup update script already runs
`pnpm install` and builds the `@assembl/canvas` workspace package, so dependencies are ready.

Non-obvious caveats:

- **`@assembl/canvas` must be built before `tsc`, `next dev`, or `next build`.** It has no
  `transpilePackages` wiring; consumers import its compiled `dist/` (see
  `packages/canvas/package.json` `exports`). If typecheck reports
  `Cannot find module '@assembl/canvas'`, run `pnpm --filter @assembl/canvas build`.
- **`.env.local` is required for Supabase-backed routes** (`/login`, `/account`, `/dashboard`,
  `/app`, `/internal`, admin, live chat) — those pages `throw` without
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Public marketing and
  `/agents` browse render fine without it. `.env.local` is git-ignored and is NOT recreated by
  the update script, so create it once per fresh VM:
  `cp .env.local.example .env.local` then set
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the `SUPABASE_PUBLISHABLE_KEY` value already
  committed in the repo's `.env` (both point at the hosted project `wurwcrgxjjwqdaxqceey`).
- **Optional integrations fail open.** AI model providers (Anthropic/OpenAI/…), Stripe,
  Deepgram, Brevo, etc. return a friendly "not configured" instead of crashing. Live agent chat
  needs at least one model-provider key; without it the chat route returns 503 but the rest of
  the marketplace stays live.
- **Standard commands** (do not duplicate elsewhere): dev = `pnpm dev` (port 3000),
  `pnpm lint`, `pnpm typecheck`, `pnpm test` (vitest), `pnpm build`. `README.md`/`docs/` are
  stale (they describe the old Vite SPA now in `legacy-vite/`); trust `package.json` scripts.
- Sub-projects have independent toolchains and are not part of the main app setup: `remotion/`
  uses **Bun**, and `plugins/mcp-servers/*` use **npm**.
