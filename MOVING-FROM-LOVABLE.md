# Moving off Lovable — the runbook

Lovable was doing three things for you:

1. Hosting the Next.js site (preview + production builds).
2. Auto-deploying Supabase **edge functions** on push.
3. Auto-applying Supabase **database migrations** on push.

This branch contains everything needed to do all three off-Lovable
with **Vercel + GitHub Actions + Supabase**, which is the standard
NZ-friendly stack and the one this repo was already structured for.

Total move time once secrets are set: **about 25 minutes**.

---

## 0. The good news

- **No Lovable-specific code anywhere in the repo.** No `@lovable/*`
  packages, no `lovable.config.*`, no Lovable-only build steps. Plain
  Next.js 16 + Supabase + Vercel.
- **The Supabase project is yours.** Project ref
  `wurwcrgxjjwqdaxqceey` (Sydney) was always your account; Lovable
  was just the deploy pipeline.
- **The domains are yours.** `assembl.co.nz` and `www.assembl.co.nz`
  point wherever you point them next.

---

## 1. Local dev — five minutes

```bash
git clone git@github.com:katecoveny-svg/assemblnz-f0afd79d.git
cd assemblnz-f0afd79d
./scripts/setup-local.sh
```

The script installs deps, copies `.env.local.example` → `.env.local`,
type-checks, and tells you what's next. Fill in
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase Studio (see §3
below), then:

```bash
npm run dev      # http://localhost:3000
```

---

## 2. Hosting — Vercel

This repo ships with `vercel.json` pre-configured for Next.js. Hook
the GitHub repo to a Vercel project and pushes to `main` build
automatically.

```bash
# Install once
npm i -g vercel

# Link the local checkout to a Vercel project
vercel link

# Pull the project's env vars into local dev (recommended)
vercel env pull .env.local

# First production deploy
vercel --prod
```

Custom domain wiring in Vercel Project Settings → Domains:

- `assembl.co.nz` → A record `76.76.21.21` (or follow Vercel's
  wizard for the apex / `www` pair)
- `www.assembl.co.nz` → CNAME `cname.vercel-dns.com`

DNS lives wherever you registered the domain (Cloudflare, Freeparking,
DNZ — whichever it is). Vercel's status page tells you the moment
DNS propagates and certificates issue.

---

## 3. Environment variables — what to set

Two are required for the site to load. A handful more are needed for
specific features.

| Env var | Where | Why |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel project env + `.env.local` | Supabase project URL. Pre-filled in `.env.local.example`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel project env + `.env.local` | Supabase anon / publishable key. Find at Supabase Studio → Project Settings → API → "Project API Keys" → `anon public`. |
| `FOUNDER_GATE_SECRET` | Vercel project env (optional) | Cookie passphrase for `/dashboard/vessel-studio`. Make up a random string. |

Server-side Supabase secrets (`SUPABASE_SERVICE_ROLE_KEY`,
`MAPBOX_ACCESS_TOKEN`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`,
`LOVABLE_API_KEY`, `TNZ_AUTH_TOKEN`, etc.) are set **inside Supabase
Studio**, not in Vercel — they're consumed by edge functions, not by
the Next.js runtime. Supabase Studio → Edge Functions → Secrets.

---

## 4. Edge functions — automatic deploy

Already wired. `.github/workflows/deploy-edge-functions.yml` deploys
every function in `supabase/functions/` on any push to `main` that
touches those files, plus a manual trigger.

What you have to do once:

1. Generate a Supabase personal access token at
   https://supabase.com/dashboard/account/tokens
2. Paste it as the repo secret named **`DEPLOY`** at
   https://github.com/katecoveny-svg/assemblnz-f0afd79d/settings/secrets/actions
3. Open the Actions tab → "Deploy Supabase Edge Functions" → "Run
   workflow" once to catch up everything currently in the branch
   (Pearl Live, escalation policy, reasoning trace ingest, monday
   catch, outcome pack auto-seal, Tōro Route, the rewired evidence
   PDF renderer, etc).

Subsequent pushes deploy only the diff. Each run posts a summary at
the top of the workflow page.

---

## 5. Database migrations — automatic deploy

New in this branch. `.github/workflows/db-migrate.yml` applies any
new SQL files under `supabase/migrations/` on push to `main`. Pull
requests run a dry-run diff against the live project so reviewers can
see exactly what will land.

What you have to do once:

1. Add **`SUPABASE_DB_PASSWORD`** as a repo secret. Find it at
   Supabase Studio → Project Settings → Database → "Connection
   string" — the password component (not the full URL).
2. Same secrets page also needs the `DEPLOY` token from step 4.3
   above (the workflow uses it).
3. Open Actions → "Deploy Supabase Migrations" → "Run workflow" once
   to apply the four new migrations from this branch:
   - `20260511150000_escalation_policies.sql`
   - `20260511150100_client_seats_and_cadence.sql`
   - `20260511150200_reasoning_outcome_ledger.sql`

The workflow is **idempotent** — re-running it is safe; only new
migrations apply. `supabase_migrations.schema_migrations` is the
source of truth and the workflow respects it.

---

## 6. The "do I need to do anything to the production site today?" checklist

In order, fastest to slowest:

1. **Repo secrets** (5 min) — `DEPLOY`, `SUPABASE_DB_PASSWORD`.
2. **Run "Deploy Supabase Edge Functions" once manually** (3 min) —
   catches up everything currently in the repo, including the new
   surfaces added in the recent commits.
3. **Run "Deploy Supabase Migrations" once manually** (1 min) —
   applies the four new migrations.
4. **Connect Vercel to the repo** (5 min) — point the project at
   `main`, paste the two `NEXT_PUBLIC_*` env vars, click Deploy.
5. **Move the domain** (10 min wall-time, less hands-on) — Vercel
   wizards walk you through the DNS records.

Total ~25 minutes hands-on. The DNS propagation runs in the
background.

---

## 7. What changes about how you work

| Before (Lovable) | After (Vercel + Actions + Supabase) |
|---|---|
| Push to `main` → Lovable deploys site, functions, migrations | Push to `main` → Vercel deploys site, GitHub Actions deploys functions + migrations |
| Preview URL: Lovable preview link | Preview URL: Vercel preview URL per branch (auto-generated on every PR) |
| Edit `.env` via Lovable UI | Edit env via Vercel project settings (or `vercel env pull` for local) |
| `npm run dev` ran against Lovable Cloud | `npm run dev` runs against the same Supabase project; everything else is local |
| AI-Gateway `LOVABLE_API_KEY` for some chat routes | Same key still works as a Supabase secret; alternative: switch those routes to direct provider keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`). |

Nothing about how you write code changes. The CLI surface is the
same. Cursor / VS Code / GitHub Copilot work exactly the same.

---

## 8. Alternative hosts (if you don't want Vercel)

The same Next.js build deploys to any of these without code changes:

- **Netlify** — drop a `netlify.toml`; equivalent build settings.
- **Cloudflare Pages** — Next on Pages is mature; faster cold starts
  in Auckland than Vercel's Sydney edge.
- **Railway / Render** — runs `next start` as a long-lived process;
  simpler model, slightly more expensive at scale.
- **Self-hosted** — `next build && next start` behind any reverse
  proxy. Dockerfile is one well-known pattern away if you want it.

Vercel is the path of least resistance. Cloudflare is the path of
best latency for NZ users. Either way, edge functions stay on
Supabase; only the Next.js front-end moves.

---

## 9. Rolling back

- **Site rollback.** Vercel keeps every deploy. "Promote previous
  deployment" in the Vercel UI is a one-click revert.
- **Function rollback.** Re-deploy the previous file via `supabase
  functions deploy <name>` from a checkout of the previous commit,
  or revert the commit and let the workflow re-deploy.
- **Migration rollback.** Don't. **Fix forward** with a new
  migration. Editing applied SQL is the fast way to corrupt the
  schema history. If a migration breaks production, write
  `20260512_revert_<name>.sql` and push.

---

## 10. If something breaks

The three places to look, in order:

1. **GitHub Actions tab** — every deploy posts a run summary. Red
   workflow means something failed; the summary tells you which
   function or migration.
2. **Vercel deployment logs** — per-deploy build + runtime logs.
   Any 5xx coming from the site shows up here.
3. **Supabase Studio → Logs Explorer** — edge function logs, DB
   query logs, auth logs. Every Supabase boom is visible here.

When in doubt: `vercel logs <deployment-url>` for the front-end,
`supabase functions logs <name>` for an edge function.

---

That's the whole runbook. Welcome out of the Lovable garden.
