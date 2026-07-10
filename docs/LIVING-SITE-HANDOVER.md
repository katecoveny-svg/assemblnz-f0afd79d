# Living Site — handover & memory doc

_Last updated: 10 July 2026 · session: the "Assembl product concept" build-out.
Read this first when resuming Living Site work in a new session._

## The north star (from Kate's original context doc)

Assembl is **not** an AI agent marketplace. It is a **living business operating
system** for NZ businesses: one **Business Genome** (single source of truth)
that every surface reads — website, CRM, bookings, knowledge, agents, voice,
emails, dashboards. Change a fact once → everything updates. Every morning the
system suggests one improvement; the owner just says **yes**.

- Positioning: **"Less admin. More mahi."** / "assembl grows your business
  while you run it." / "A business that improves itself."
- Stop selling "AI marketplace"; show **a business evolving**.
- First vertical: **Fred the Dog Trainer** (Auckland Dog Trainer · Learn To
  Talk Dog). One complete end-to-end demo before more agents.
- Install flow: choose industry → 10 questions → system generates → approve →
  live. The website is one **surface** of the OS, not a CMS.

## What is LIVE (all merged to main, deployed via Vercel)

| Surface | URL / path | Notes |
|---|---|---|
| Homepage (Living Site concept) | `/` | Hero: "assembl grows your business while you run it." + business-assembling-itself section + industry templates + "your business, alive" closing. Legacy pipeline/workflows/kete/evidence sections removed (their standalone pages remain). |
| Living Site demo (public) | `/living-site` | Business Genome with change-once ripple (live DB facts) + Morning Brief with approve flow. |
| Fred's public website | `/living-site/fred` | Genome-driven landing page: hero/about/services/pricing/FAQs/testimonials/**book form** + embedded Fred desk chat agent. White-labelled (no assembl chrome). |
| The installer (demo) | `/install` | Choose industry → 10 questions → generation animation → lands on Fred's site. |
| Fred OS console (gated) | `/customers/auckland-dog-trainer/ops` | 14 tabs incl. **Business Genome** (`?tab=genome`, live DB) and **Morning brief** (`?tab=brief`). Behind demo basic-auth / `/for/…` magic links. |

PR history this effort: **#833** (Fred genome+brief tabs) → **#834** (Bugbot
fixes) → **#835** (homepage hero + tui upright) → **#836** (strip legacy
sections, `/living-site`) → **#837** (tui-on-apex fix + genome→Supabase) →
this PR (Fred site, installer, interior pivots, this doc).

## Database (Supabase project `wurwcrgxjjwqdaxqceey` · assembl-prod)

- `living_site_genome` — the Business Genome as rows (tenant, fact_id,
  section, label, value, read_by[]). Seeded with Fred's 14 facts. **RLS
  enabled with NO policies (deny-all)** — all access via server routes using
  `lib/supabase/service.ts` (service role). Migration:
  `supabase/migrations/20260718100000_living_site_genome.sql` (already applied).
- `living_site_enquiries` — public booking-form submissions land here
  (+2 seeded samples, source='seed'). Written by `/api/living-site/enquiry`
  (validation + honeypot).
- Read path: `lib/customers/auckland-dog-trainer/genome-store.ts` —
  `getLiveGenomeFacts()` with graceful fallback to in-repo `GENOME_FACTS`
  when keys/DB unavailable (local dev has no service key; Vercel does).
- **To prove the Living Site**: edit a `value` in `living_site_genome` in
  Supabase → `/living-site`, `/living-site/fred`, and the ops genome tab all
  show it on next load (`force-dynamic`).

## Hard-won lessons (do not re-learn these)

1. **The splash gate eats everything.** `middleware.ts` on
   `assembl.co.nz`/`www` rewrites every non-exempt path to `/` (coming-soon
   mode). Any new public route OR static asset type MUST be added to
   `SPLASH_EXEMPT_PREFIXES` / `SPLASH_STATIC_FILE` — and usually also to the
   demo-host lists (`DEMO_AUTH_EXEMPT_PREFIXES` / `DEMO_AUTH_STATIC_FILE`).
   This was why the tui vanished **only on the apex** — `/3d/tui-splat.splat`
   got HTML back with a 200 and parsed to garbage. Both gates now exempt
   `/3d/`, `/living-site`, `/install`, and the `splat|ply|glb|gltf` extensions.
2. **The tui splat**: upright pose = runtime `orient` Rx(130°) on an inner
   group in `components/v2/home/TuiSplat.tsx` (the v3 binary bake is 180° off
   about X — never trust the "baked upright" comment). Outer group carries the
   turntable/pointer interactivity; depth-sort uses the inner group's
   matrixWorld. Loader rejects `text/html` responses with a console warning.
3. **Guards that run on build**: `scripts/brand-guard.mjs` (banned words/hexes
   — never write "canary" or the old gold hexes in marketing surfaces) and
   `pnpm lint:macrons` (write Tā/Tōro/Pīkau/Mātauranga with macrons in
   app/ + components/). `pnpm typecheck` needs
   `pnpm --filter @assembl/canvas build` first on a fresh clone.
4. **`MicroLabel as=` accepts only** div|h2|h3|p|span — no h1.
5. **Verify against a production build** (`pnpm build && pnpm start`) with
   Playwright/Chromium (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
   SwiftShader flags) — dev-only checks missed the apex-only tui bug.

## What still needs work (in priority order)

1. **De-marketplace the chrome** — the nav (`V2Nav`: "agents · pricing ·
   trust · about · try an agent"), the collections/bundle cards on the
   homepage, and the live-counts pulse strip still tell the agents-first
   story. Kate flagged this explicitly. The brief wants the marketplace to be
   internal plumbing, not the front door.
6. **Genome editing UI** — facts are live data but editing means Supabase
   table editor today. Add an admin/ops "edit fact" affordance (write path
   gated by `ensureAdmin` or demo auth) so the ripple is user-editable.
2. **Ripple computed, not choreographed** — the "change once" scenarios in
   `lib/customers/auckland-dog-trainer/genome.ts` (`RIPPLE_SCENARIOS`) are
   curated copy. Next: derive surface updates from `read_by` + fact diffs.
3. **Enquiries → CRM loop** — form rows land in `living_site_enquiries` but
   the ops Lead-triage tab still renders static `LEADS`. Read live enquiries
   into the triage tab (and let the morning brief count them).
4. **Real voice** (speech) — the "voice & chat agent" is the real streaming
   text agent (`PilotAgentChat` → `/api/customers/auckland-dog-trainer/chat`).
   ElevenLabs bits exist elsewhere in the org (legacy repo used
   `@elevenlabs/react`; `voice:deploy:manaaki` script here) — actual
   speech in/out is not wired on the public page.
5. **Installer → real generation** — `/install` is a simulated demo that lands
   on Fred's site. The real version writes a new tenant's genome rows and
   scaffolds surfaces from the template.
7. **Legacy repo `assemblnz-7d51a25a`** — the old Lovable/Vite codebase; no
   Fred content; recommend archiving on GitHub (Settings → Archive) with a
   README banner pointing here. Not yet done.
8. **Indexing** — `/living-site/fred` is `noindex` (sample data); flip when
   real. Interior pages beyond the three touched (e.g. `/trust`, `/bundles`)
   still carry old-story copy.

## Environment / workflow memory

- Active repo: `katecoveny-svg/assemblnz-f0afd79d` (Next.js 16, pnpm,
  Vercel → assembl.co.nz + demo.assembl.co.nz). Legacy repo:
  `assemblnz-7d51a25a` (dormant).
- Branch convention this effort: `claude/assembl-product-concept-9gw3oc`;
  after each merge, restart it from `origin/main` (`git checkout -B … origin/main`)
  — never stack on merged history. Kate merges PRs fast.
- Vercel preview URL per PR comment; production follows merge to main within
  minutes. If something looks stale on the apex: hard refresh, then check the
  splash gate before debugging anything else.
- Demo console access: shared basic-auth (`DEMO_BASIC_AUTH_USER/PASSWORD`
  env) or per-prospect `/for/[slug]` magic links minted in `/admin/invites`.
