# assembl — agent memory

**Concept (locked 2026-07-10):** assembl is a **living business operating
system**, not an AI agent marketplace. One Business Genome per customer;
every surface (website, CRM, bookings, knowledge, agents, emails) reads it.
"Less admin. More mahi." / "assembl grows your business while you run it."

**The demo cast is FICTIONAL (locked 2026-07-10):** no real prospect has
agreed to appear, so no demo surface may name a real business or person.
Flagship vertical: "Harbourside Dog Training" / owner "Sam" (tenant key
`auckland-dog-trainer` is a legacy identifier only — never surface the old
real-world branding it once carried). All sample verticals live in
`lib/living-site/verticals.ts` + `living_site_genome`; every sample site
carries a "sample business — details fictional" strip. Keep it that way.

**Read `docs/LIVING-SITE-HANDOVER.md` before touching Living Site work** —
it carries the full state, database details, PR history, and the open list.

**Design canon (locked 2026-07-10): `docs/DESIGN-SYSTEM-VNEXT.md`.** The
short version: not a SaaS dashboard — the calmest business OS ever designed.
One primary action per screen; progressive disclosure; if a screen can lose
half its elements, remove them. Quiet editorial typography, whitespace, one
restrained accent; motion assembles (nothing pops or bounces). Human words,
no AI jargon, never expose implementation. Don't make it look like an AI
product — make it look like the future of running a business. Success
metric: "How did it already know that?"

## Invariants that bite

- `middleware.ts` splash gate rewrites every non-exempt path to `/` on
  assembl.co.nz — new public routes and asset types MUST be exempted in both
  the splash and demo-auth lists, or they silently serve the homepage/401.
- Tui splat: upright = runtime Rx(130°) `orient` on the inner group in
  `components/v2/home/TuiSplat.tsx`; the binary's "upright bake" is wrong.
- `node scripts/brand-guard.mjs` + `pnpm lint:macrons` run on build: never
  write "canary"/old gold hexes on marketing surfaces; macrons required
  (Tā, Tōro, Pīkau, Mātauranga).
- `pnpm typecheck` needs `pnpm --filter @assembl/canvas build` once first.
- `MicroLabel as=` accepts div|h2|h3|p|span only.
- Supabase (`wurwcrgxjjwqdaxqceey`): `living_site_genome` +
  `living_site_enquiries` are RLS deny-all; access only via
  `lib/supabase/service.ts` in server code, with static fallback
  (`lib/customers/auckland-dog-trainer/genome-store.ts`).
- Verify UI changes against `pnpm build && pnpm start` (prod bundle), not
  just dev — and screenshot with the preinstalled Chromium.

## Workflow

- Feature branch per effort (`claude/…`); after a PR merges, restart the same
  branch from `origin/main` — never stack on merged history.
- Demo data is SAMPLE-labelled everywhere; nothing sends without a human yes
  (draft-only is a product principle, not just copy).
