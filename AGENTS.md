# AGENTS.md — assembl repo guidance for AI agents

## Working folder

`/Users/kateharland/assemblnz-f0afd79d`

Verify with: `git remote -v` → must show `origin → katecoveny-svg/assemblnz-f0afd79d`.

## Canonical brand

Tokens:
- Warm cream: `#FAF7F2`
- Pounamu green: `#2B6B57`
- Pounamu deep: `#1A4D3D`
- Pounamu bright: `#4FA887` for hover only
- Arataki amber: `#D9A85A`
- Brass: `#B8964F`
- Ink: `#3D4250`
- Ink-soft: `#5C6273`
- Taupe: `#9D8C7D`

Typography:
- Cormorant Garamond for headings
- Inter for body
- IBM Plex Mono for labels, eyebrows, plates, audit refs

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
